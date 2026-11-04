// ============================================================
//  PUSH TILES — прототип механики (минимальная версия)
//  4 колонки × 6 закрытых карт. Под полем — одна карта в руке.
//  Клик по колонке: карта из руки идёт сверху → нижняя выпадает
//  → становится новой картой в руке. Цикл повторяется.
//  Победа: все 4 колонки полностью открыты и моно-категории.
// ============================================================

const CATEGORIES = {
  transport: { name: 'Транспорт', emojis: ['🚗', '🚌', '✈️', '🚢', '🚂', '🚲'] },
  plants:    { name: 'Растения',  emojis: ['🌱', '🌵', '🌿', '🍀', '🌳', '🪴'] },
  flowers:   { name: 'Цветы',     emojis: ['🌸', '🌹', '🌻', '🌷', '🌼', '💐'] },
  animals:   { name: 'Животные',  emojis: ['🦁', '🐘', '🦒', '🦓', '🐯', '🦊'] }
};

const COL_COUNT     = 4;
const COL_SIZE      = 6;
const CARDS_PER_CAT = 6; // 4×6 = 24, точно ложатся в 4 колонки

let columns = [];   // columns[i] = [card×6], index 0 = top
let hand    = null; // одна карта в руке
let moves   = 0;
let gameOver = false;

// ---------- Factory ----------
function makeCard(cat, emoji, faceUp = false) {
  return { cat, emoji, faceUp, rainbow: false };
}
function makeRainbow() {
  return { cat: 'rainbow', emoji: '🌈', faceUp: true, rainbow: true };
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
    for (let i = 0; i < CARDS_PER_CAT; i++) {
      all.push(makeCard(key, def.emojis[i % def.emojis.length]));
    }
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
  // стартовая карта в руке = радужная wild (структурно нужна:
  // одна "лишняя" карта всегда в обороте, иначе 24 не сложить идеально)
  hand = makeRainbow();

  moves = 0;
  gameOver = false;
  document.getElementById('modal').classList.add('hidden');
  render();
}

// ---------- Push ----------
function pushToColumn(idx) {
  if (gameOver || !hand) return;
  // карта из руки → top колонки
  hand.faceUp = true;
  columns[idx].unshift(hand);
  // нижняя выпадает → открывается → в руку
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
  const consistent = opened.every(c => c.cat === cat);
  return consistent ? 'good' : 'bad';
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
  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = 'ПОБЕДА!';
  document.getElementById('modal-sub').textContent = `Отличная сортировка · ходов: ${moves}`;
  modal.classList.remove('hidden');
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

  // hand
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
  } else if (card.rainbow) {
    el.classList.add('rainbow');
    el.textContent = '🌈';
  } else {
    el.classList.add('face-up', card.cat);
    el.textContent = card.emoji;
  }
  return el;
}

// ---------- Boot ----------
document.getElementById('restart').onclick = init;
document.getElementById('modal-restart').onclick = init;
init();
