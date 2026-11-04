// ============================================================
//  PUSH TILES · v6 · 6 колонок × 5 карт · плотная плитка · cocoa fix
//  Контент: 4 текст (Dogs, Flowers, Drinks, Travel) +
//           2 image (Desserts, Zodiac).
//  Карты лежат вплотную, без зазоров между колонками.
//  Закрытые рубашки 6 цветов по столбцам.
//  Win: все 6 колонок моно + радужная ★ в руке.
// ============================================================

const CATEGORIES = {
  dogs:     { name: 'Dogs',     kind: 'text',  items: ['Husky',    'Corgi',    'Pug',         'Shiba',     'Frenchie'] },
  desserts: { name: 'Desserts', kind: 'image', items: ['🍩',       '🍰',       '🧁',          '🍮',        '🥐'] },
  flowers:  { name: 'Flowers',  kind: 'text',  items: ['Rose',     'Tulip',    'Peony',       'Lily',      'Orchid'] },
  zodiac:   { name: 'Zodiac',   kind: 'image', items: ['♈',       '♉',       '♊',          '♋',        '♌'] },
  drinks:   { name: 'Drinks',   kind: 'text',  items: ['Latte',    'Matcha',   'Cocoa',       'Mocha',     'Espresso'] },
  travel:   { name: 'Travel',   kind: 'text',  items: ['Paris',    'Venice',   'Bali',        'Rome',      'Dubai'] }
};

const COL_COUNT = 6;
const COL_SIZE  = 5;

let columns = [];
let hand    = null;
let moves   = 0;
let gameOver = false;

// ---------- Factory ----------
function makeCard(cat, kind, value) {
  return { cat, kind, value, faceUp: false, rainbow: false };
}
function makeRainbow() {
  return { cat: 'rainbow', kind: 'rainbow', value: '★', faceUp: true, rainbow: true };
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- Init ----------
function init() {
  const all = [];
  for (const [key, def] of Object.entries(CATEGORIES)) {
    def.items.forEach(v => all.push(makeCard(key, def.kind, v)));
  }
  shuffle(all);

  columns = [];
  for (let i = 0; i < COL_COUNT; i++) {
    const col = [];
    for (let j = 0; j < COL_SIZE; j++) {
      const c = all.shift();
      c.faceUp = false;
      col.push(c);
    }
    columns.push(col);
  }
  hand = makeRainbow();
  moves = 0;
  gameOver = false;
  document.getElementById('modal').classList.add('hidden');
  render();
}

// ---------- Push ----------
function pushToColumn(idx) {
  if (gameOver || !hand) return;
  hand.faceUp = true;
  columns[idx].unshift(hand);
  const ejected = columns[idx].pop();
  ejected.faceUp = true;
  hand = ejected;
  moves++;
  render({ pushedTo: idx });
  if (hand.rainbow && isWin()) {
    gameOver = true;
    setTimeout(showWin, 500);
  }
}

// ---------- Status / Win ----------
function statusOfColumn(col) {
  const opened = col.filter(c => c.faceUp && !c.rainbow);
  if (opened.length === 0) return 'neutral';
  const cat = opened[0].cat;
  return opened.every(c => c.cat === cat) ? 'good' : 'bad';
}
function isCollected(col) {
  if (col.some(c => !c.faceUp)) return false;
  const real = col.filter(c => !c.rainbow);
  if (real.length === 0) return false;
  return real.every(c => c.cat === real[0].cat);
}
function collectedCat(col) {
  const real = col.filter(c => !c.rainbow);
  return real.length ? real[0].cat : null;
}
function isPure(col) {
  if (col.some(c => !c.faceUp)) return false;
  const cat = col[0].cat;
  return col.every(c => c.cat === cat);
}
function isWin() {
  return columns.every(isPure);
}
function showWin() {
  document.getElementById('modal-title').textContent = 'ПОБЕДА!';
  document.getElementById('modal-sub').textContent = `Уровень пройден · ходов: ${moves}`;
  document.getElementById('modal').classList.remove('hidden');
}

// ---------- Render ----------
function render(anim = {}) {
  const checksTop = document.getElementById('checks-top');
  const grid = document.getElementById('grid');
  const checksBot = document.getElementById('checks-bottom');
  checksTop.innerHTML = '';
  grid.innerHTML = '';
  checksBot.innerHTML = '';

  // top checks (one per column)
  columns.forEach((col) => {
    checksTop.appendChild(makeCheck(statusOfColumn(col)));
  });

  // grid 6×5, row by row
  const collectedCatPerCol = columns.map(col => isCollected(col) ? collectedCat(col) : null);

  for (let row = 0; row < COL_SIZE; row++) {
    for (let colIdx = 0; colIdx < COL_COUNT; colIdx++) {
      const card = columns[colIdx][row];
      const isNew = anim.pushedTo === colIdx && row === 0;
      const cardEl = makeCardEl(card, isNew ? 'new-card' : '', collectedCatPerCol[colIdx], colIdx);
      cardEl.onclick = () => pushToColumn(colIdx);
      if (gameOver) cardEl.style.pointerEvents = 'none';
      grid.appendChild(cardEl);
    }
  }

  // bottom checks
  columns.forEach((col) => {
    checksBot.appendChild(makeCheck(statusOfColumn(col)));
  });

  const handEl = document.getElementById('hand');
  handEl.innerHTML = '';
  if (hand) handEl.appendChild(makeCardEl(hand, '', null, null));

  document.getElementById('moves').textContent = moves;
}

function makeCheck(status) {
  const el = document.createElement('div');
  el.className = 'check';
  if (status === 'good')     { el.classList.add('good'); el.textContent = '✓'; }
  else if (status === 'bad') { el.classList.add('bad');  el.textContent = '✗'; }
  else                       { el.textContent = '?'; }
  return el;
}

function makeCardEl(card, extraClass, collectedCat, colIdx) {
  const el = document.createElement('div');
  el.className = 'card';
  if (extraClass) el.classList.add(extraClass);
  if (colIdx !== null && colIdx !== undefined) el.dataset.col = colIdx;

  if (!card.faceUp) {
    el.classList.add('face-down');
    return el;
  }
  if (card.rainbow) {
    el.classList.add('rainbow');
    el.textContent = '★';
    if (collectedCat) el.classList.add('collected', collectedCat);
    return el;
  }
  el.classList.add('face-up');
  if (collectedCat) el.classList.add('collected', collectedCat);
  if (card.kind === 'image') {
    el.classList.add('img-card');
    el.textContent = card.value;
  } else {
    el.innerHTML = `<span class="word">${card.value}</span>`;
  }
  return el;
}

// ---------- Boot ----------
document.getElementById('restart').onclick = init;
document.getElementById('modal-restart').onclick = init;
init();
