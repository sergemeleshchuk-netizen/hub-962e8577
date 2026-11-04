// ============================================================
//  PUSH TILES · Mobile demo
//  Контент = Level 3 из Solitaire Balance.xlsx
//  Декки: Animals, Travel, Shopping, Construction (по 6 слов)
// ============================================================

const CATEGORIES = {
  animals:      { name: 'Animals',      words: ['Lion', 'Tiger', 'Bear', 'Fox', 'Wolf', 'Zebra'] },
  travel:       { name: 'Travel',       words: ['Ticket', 'Suitcase', 'Hotel', 'Map', 'Passport', 'Guide'] },
  shopping:     { name: 'Shopping',     words: ['Price', 'Sale', 'Basket', 'Cash', 'Receipt', 'Queue'] },
  construction: { name: 'Construction', words: ['Hammer', 'Cement', 'Ladder', 'Drill', 'Screw', 'Brick'] }
};

const COL_COUNT     = 4;
const COL_SIZE      = 6;

let columns = [];
let hand    = null;
let moves   = 0;
let gameOver = false;

// ---------- Factory ----------
function makeCard(cat, word) {
  return { cat, word, faceUp: false, rainbow: false };
}
function makeRainbow() {
  return { cat: 'rainbow', word: '★', faceUp: true, rainbow: true };
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
    def.words.forEach(w => all.push(makeCard(key, w)));
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
  if (isWin()) {
    gameOver = true;
    setTimeout(showWin, 380);
  }
}

// ---------- Status / Win ----------
function statusOfColumn(col) {
  const opened = col.filter(c => c.faceUp && !c.rainbow);
  if (opened.length === 0) return 'neutral';
  const cat = opened[0].cat;
  return opened.every(c => c.cat === cat) ? 'good' : 'bad';
}
function isPure(col) {
  if (col.some(c => !c.faceUp)) return false;
  const real = col.filter(c => !c.rainbow);
  if (real.length === 0) return true;
  return real.every(c => c.cat === real[0].cat);
}
function isWin() {
  return columns.every(isPure);
}
function showWin() {
  document.getElementById('modal-title').textContent = 'ПОБЕДА!';
  document.getElementById('modal-sub').textContent = `Level 3 пройден · ходов: ${moves}`;
  document.getElementById('modal').classList.remove('hidden');
}

// ---------- Render ----------
function render(anim = {}) {
  const board = document.getElementById('board');
  board.innerHTML = '';

  columns.forEach((col, i) => {
    const colEl = document.createElement('div');
    colEl.className = 'column';
    if (gameOver) colEl.classList.add('disabled');
    colEl.onclick = () => pushToColumn(i);

    const status = statusOfColumn(col);
    colEl.appendChild(makeCheck(status));

    const stack = document.createElement('div');
    stack.className = 'stack';
    col.forEach((card, idx) => {
      const isNew = anim.pushedTo === i && idx === 0;
      stack.appendChild(makeCardEl(card, isNew ? 'new-card' : ''));
    });
    colEl.appendChild(stack);

    colEl.appendChild(makeCheck(status));
    board.appendChild(colEl);
  });

  const handEl = document.getElementById('hand');
  handEl.innerHTML = '';
  if (hand) handEl.appendChild(makeCardEl(hand, ''));

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

function makeCardEl(card, extraClass) {
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
    return el;
  }
  el.classList.add('face-up', card.cat);
  el.innerHTML = `<span class="word">${card.word}</span>`;
  return el;
}

// ---------- Boot ----------
document.getElementById('restart').onclick = init;
document.getElementById('modal-restart').onclick = init;
init();
