// ============================================================
//  PUSH TILES · v3 · 6 колонок × 5 карт · тематический контент
//  6 категорий по 5 элементов:
//    Forest · Ocean · Mystic · Castle · Garden · Cosmos (image)
//  Карты face-up — белые. Когда колонка полностью собрана,
//  её карты перекрашиваются в пастельный цвет темы.
//  Win: все 6 колонок моно И радужная ★ вернулась в руку.
// ============================================================

const CATEGORIES = {
  forest: { name: 'Forest', kind: 'text',  items: ['Oak',    'Moss',    'Stag',    'Mist',     'Wolf'] },
  ocean:  { name: 'Ocean',  kind: 'text',  items: ['Wave',   'Pearl',   'Coral',   'Tide',     'Whale'] },
  mystic: { name: 'Mystic', kind: 'text',  items: ['Rune',   'Spell',   'Crystal', 'Wand',     'Potion'] },
  castle: { name: 'Castle', kind: 'text',  items: ['Knight', 'Throne',  'Shield',  'Crown',    'Tower'] },
  garden: { name: 'Garden', kind: 'text',  items: ['Rose',   'Vine',    'Lily',    'Bloom',    'Petal'] },
  cosmos: { name: 'Cosmos', kind: 'image', items: ['🌟',     '☄️',      '🌙',      '🪐',       '✨'] }
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
  // колонка полностью собрана: все открыты + одна категория (rainbow как wild)
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
  const board = document.getElementById('board');
  board.innerHTML = '';

  columns.forEach((col, i) => {
    const colEl = document.createElement('div');
    colEl.className = 'column';
    colEl.dataset.col = i;
    if (gameOver) colEl.classList.add('disabled');
    colEl.onclick = () => pushToColumn(i);

    const status = statusOfColumn(col);
    colEl.appendChild(makeCheck(status));

    const collected = isCollected(col);
    const colCat = collected ? collectedCat(col) : null;

    const stack = document.createElement('div');
    stack.className = 'stack';
    col.forEach((card, idx) => {
      const isNew = anim.pushedTo === i && idx === 0;
      stack.appendChild(makeCardEl(card, isNew ? 'new-card' : '', colCat));
    });
    colEl.appendChild(stack);

    colEl.appendChild(makeCheck(status));
    board.appendChild(colEl);
  });

  const handEl = document.getElementById('hand');
  handEl.innerHTML = '';
  if (hand) handEl.appendChild(makeCardEl(hand, '', null));

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

function makeCardEl(card, extraClass, collectedCat) {
  const el = document.createElement('div');
  el.className = 'card';
  if (extraClass) el.classList.add(extraClass);

  if (!card.faceUp) {
    el.classList.add('face-down');
    el.textContent = '?';
    return el;
  }
  if (card.rainbow) {
    el.classList.add('rainbow');
    el.textContent = '★';
    // радужная в собранной колонке тоже окрашивается
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
