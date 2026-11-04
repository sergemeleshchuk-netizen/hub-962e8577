// ============================================================
//  PUSH TILES · v8 · 3 уровня сложности (image-категории)
//  Контент-источник: арт-лист от ChatGPT (24 категории).
//  Уровни:
//    Easy   — 4 контрастных категории, поле 4×5
//    Medium — 5 категорий "всё про животных", поле 5×5
//    Hard   — 6 категорий, 5 food-related + 1 контраст, поле 6×5
//  Все карты на старте открыты. Win: моно во всех + ★ в руке.
// ============================================================

// Полный пул категорий из арт-листа.
// items = плейсхолдер-эмодзи под будущие PNG-ассеты.
const ALL = {
  transport:   { name: 'Транспорт',         items: ['🚗','🚌','🚆','✈️','🚢','🛵'] },
  pets:        { name: 'Домашние животные', items: ['🐶','🐱','🐰','🐹','🦜','🐟'] },
  wild:        { name: 'Дикие животные',    items: ['🦁','🐘','🦒','🦓','🐵','🐼'] },
  birds:       { name: 'Птицы',             items: ['🐦','🦉','🦜','🐧','🦩','🦅'] },
  insects:     { name: 'Насекомые',         items: ['🐞','🦋','🐝','🐜','🪰','🦗'] },
  sea:         { name: 'Морские',           items: ['🐬','🦈','🐙','🐢','🐠','🐳'] },
  vegetables:  { name: 'Овощи',             items: ['🥕','🍅','🥦','🥒','🌽','🎃'] },
  fruits:      { name: 'Фрукты',            items: ['🍎','🍌','🍇','🍓','🍊','🍍'] },
  food:        { name: 'Еда',               items: ['🍔','🍕','🌭','🥪','🍟','🥯'] },
  sweets:      { name: 'Сладости',          items: ['🍭','🍫','🧁','🍦','🍩','🍪'] },
  drinks:      { name: 'Напитки',           items: ['🧃','🥛','💧','🥤','☕','🍵'] },
  furniture:   { name: 'Мебель',            items: ['🛋️','🛏️','🪑','🚪','💡','🪞'] },
  clothes:     { name: 'Одежда',            items: ['👕','🩳','👗','🧥','🧦','👟'] },
  school:      { name: 'Школа',             items: ['🎒','📚','✏️','📓','🌍','🎨'] },
  toys:        { name: 'Игрушки',           items: ['🧸','🚙','🎢','🤖','🏐','🧱'] },
  sport:       { name: 'Спорт',             items: ['⚽','🏀','🎾','🛹','🚴','🏋️'] },
  music:       { name: 'Музыкальные',       items: ['🎸','🎹','🥁','🎻','🎺','🪈'] },
  jobs:        { name: 'Профессии',         items: ['👨‍🚒','👨‍⚕️','👮','👨‍🍳','👨‍🏫','👨‍🚀'] },
  nature:      { name: 'Природа',           items: ['🌳','🌷','🌵','🏔️','☀️','☁️'] },
  space:       { name: 'Космос',            items: ['🚀','🌍','🪐','🌕','⭐','☄️'] },
  tools:       { name: 'Инструменты',       items: ['🔨','🪛','🔧','🪚','🧰','⚙️'] }
};

// Уровни: сложность задаётся выбором категорий с разной степенью overlap-а.
const LEVELS = {
  easy: {
    name: 'Easy',
    cols: 4, size: 5,
    cats: ['transport', 'wild', 'music', 'fruits']
  },
  medium: {
    name: 'Medium',
    cols: 5, size: 5,
    cats: ['pets', 'wild', 'birds', 'sea', 'insects']
  },
  hard: {
    name: 'Hard',
    cols: 6, size: 5,
    cats: ['vegetables', 'fruits', 'food', 'sweets', 'drinks', 'jobs']
  }
};

let currentLevel = 'easy';
let COL_COUNT = LEVELS.easy.cols;
let COL_SIZE  = LEVELS.easy.size;

let columns = [];
let hand    = null;
let moves   = 0;
let gameOver = false;

// ---------- Factory ----------
function makeCard(cat, value) {
  return { cat, value, faceUp: true, rainbow: false };
}
function makeRainbow() {
  return { cat: 'rainbow', value: '★', faceUp: true, rainbow: true };
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
  const lvl = LEVELS[currentLevel];
  COL_COUNT = lvl.cols;
  COL_SIZE  = lvl.size;
  document.documentElement.style.setProperty('--col-count', COL_COUNT);
  document.documentElement.style.setProperty('--row-count', COL_SIZE);

  const all = [];
  lvl.cats.forEach(catKey => {
    const cat = ALL[catKey];
    for (let i = 0; i < COL_SIZE; i++) {
      all.push(makeCard(catKey, cat.items[i]));
    }
  });
  shuffle(all);

  columns = [];
  for (let i = 0; i < COL_COUNT; i++) {
    const col = [];
    for (let j = 0; j < COL_SIZE; j++) {
      const c = all.shift();
      c.faceUp = true;
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
  document.getElementById('modal-sub').textContent = `${LEVELS[currentLevel].name} пройден · ходов: ${moves}`;
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

  columns.forEach((col) => {
    checksTop.appendChild(makeCheck(statusOfColumn(col)));
  });

  const collectedPerCol = columns.map(col => isCollected(col) ? collectedCat(col) : null);

  for (let row = 0; row < COL_SIZE; row++) {
    for (let colIdx = 0; colIdx < COL_COUNT; colIdx++) {
      const card = columns[colIdx][row];
      const isNew = anim.pushedTo === colIdx && row === 0;
      const cardEl = makeCardEl(card, isNew ? 'new-card' : '', collectedPerCol[colIdx], colIdx);
      cardEl.onclick = () => pushToColumn(colIdx);
      if (gameOver) cardEl.style.pointerEvents = 'none';
      grid.appendChild(cardEl);
    }
  }

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
  el.classList.add('face-up', 'img-card');
  if (collectedCat) el.classList.add('collected', collectedCat);
  el.textContent = card.value;
  return el;
}

// ---------- Level switcher ----------
document.querySelectorAll('.lvl-tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.lvl-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentLevel = tab.dataset.level;
    init();
  };
});

// ---------- Boot ----------
document.getElementById('restart').onclick = init;
document.getElementById('modal-restart').onclick = init;
init();
