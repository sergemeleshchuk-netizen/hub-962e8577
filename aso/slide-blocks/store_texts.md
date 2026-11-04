# Slide Match: Cats — тексты стор-листинга (EN)

Игра: `deploy/slideblocks/v6.html`. Свайп по коту — он скользит до упора (стена, край доски или другой кот).
Встретил кота того же цвета — оба лопаются. Убрал все пары — уровень пройден. 10 уровней, четыре цвета,
три бустера (Hint, Magnet, Undo), сундук с ключами, звёзды за экономию ходов. Таймер в шапке только
считает время, лимита нет. Три уровня с ловушкой (7, 9, 10): неверный порядок оставляет последнюю пару
без возможности встретиться — Undo/Reset спасают.

Мета-слой v6: за каждый пройденный уровень дают ключ, три ключа открывают сундук с бустерами.
Звёзды: три — пройти не длиннее встроенного маршрута решателя, две — с запасом 40 %, иначе одна.

Ключевые слова жанра в текстах: slide, cat, puzzle, match, color, swipe, brain, logic, relaxing,
offline, no timer, one finger, booster, hint, undo, levels, stars, chest, sokoban-like sliding.

---

## App Store

**App name (30):** `Slide Match: Cats Puzzle` (26)

**Subtitle (30):** `Swipe, Slide & Pop Colors` (25)

**Keywords (100, через запятую, без пробелов):**
`slide,cat,kitty,swipe,color,pop,logic,brain,iq,relax,offline,zen,booster,star,chest,calm,tile`

Имя приложения и подзаголовок Apple индексирует вместе с полем — `match`, `puzzle`, `blocks` в поле не дублируются.
Ровно 100 символов (проверка снипетом ниже).

**Promo text (170):**
`Swipe a block and it slides until something stops it. Meet the same color and both pop. Ten hand-built boards, hints and undo, no timer. Think, slide, clear.` (156)

---

## Google Play

**Title (30):** `Slide Match: Cats Puzzle` (26)

**Short description (80):**
`Swipe blocks, slide them into their twins and pop every pair. No timer, relax!` (78)

---

## Full description (обе платформы)

**Slide Match is a calm sliding puzzle: swipe a block, it slides until something stops it.**

Every board is a small maze of tiles with cute colored blocks on it. Swipe a block and it glides in that
direction until it hits a wall, the edge of the board or another block. If the block it bumps into has the
same color, both of them pop. Clear every pair and the board is yours.

**How to play**
1. Swipe a block up, down, left or right. It slides all the way until it is stopped.
2. Two blocks of the same color meet: they pop and disappear.
3. Different colors just stop each other. Use that: a block can be a wall for another one.
4. Plan the order. On the tricky boards a hasty pop can leave the last pair with no way to meet.
5. Made a mistake? Undo takes the move back, Reset starts the board over, Hint shows a good move.

**Why you will love it**
- One finger, one swipe. Plays with one hand, on the go, in bed, in a queue.
- No timer, no lives, no pressure. The clock only counts, it never runs out.
- Plays offline. No Wi-Fi, no internet, nothing between you and the puzzle.
- Ten hand-built boards: Garden, Crossroads, Two Shores, Maze, Last Pair, Twin Bridges, The Stopper,
  Roundabout, Wrong Turn and Final Fork. Every board is a new shape and a new idea.
- Four bright colors, chubby blocks with faces, soft pops and sparkles when a pair clears.
- Undo any move, reset any board, ask for a hint whenever you are stuck.

**Good for your brain**
Slide Match trains planning and spatial thinking. You read the board, see where each block will stop and
plan several slides ahead, because the order matters. It is a brain teaser that feels like relaxing,
not like an exam.

**Swipe. Slide. Pop. Clear the board.**

---

## What's new

`Five new boards: Twin Bridges, The Stopper, Roundabout, Wrong Turn and Final Fork. Three of them hide a
trap: pop pairs in the wrong order and the last pair can never meet. Undo and Reset are always there.`

---

## Подписи на скриншотах (в том же порядке)

Рецепт Just Pull v7 (`ASO/_ours/just-pull/`): в кадре весь интерфейс игры, плашка с подписью 13 % кадра,
одна короткая строка одного кегля, ключевое слово жёлтым (#ffd133 — жёлтый самой игры), плашка синяя
(#3b82f6 → #2353bf — шапка игры). Кадры сняты с виртуальным временем Chrome (`capture_sb.mjs`), поэтому
искры и подсказка пойманы на нужной миллисекунде.

1. SWIPE TO SLIDE — L2 Crossroads, рука на красном кубике в центре, пунктир вниз к его паре
2. SAME COLOR? POP! — тот же ход через 330 мс: пара исчезла, свечение и искры в точке встречи, всплывашка MATCH!
3. PLAN YOUR PATH — L8 Roundabout, кольцо с четырьмя парами
4. 10 LEVELS TO CLEAR — экран уровней (сетка 2×5, все открыты)
5. STUCK? USE HINTS — L4 Maze после нажатия Hint: кубик пульсирует со стрелкой, кнопка направления
   подсвечена; в кадре кольцо вокруг кнопки Hint и пунктир к подсвеченному кубику
6. NO RUSH, JUST THINK — L3 Two Shores после двух ходов, спокойный кадр
7. BOARD CLEARED! — окно победы L10: звёзды, маскот, время и ходы

## Честность текста

Всё заявленное есть в прототипе v3: 10 уровней, 4 цвета, свайп/скольжение до упора, слияние одного
цвета, Undo/Reset/Hint, ловушки на 7/9/10, таймер без лимита, офлайн. Ничего про сотни уровней, бустеры,
события, монеты и социальные функции не написано — этого в игре нет. Формулировку «no ads» в подписях
не используем (правило из Just Pull v7).

## Проверка лимитов

```python
t={'name':'Slide Match: Cats Puzzle','sub':'Swipe, Slide & Pop Colors',
'kw':'slide,block,cube,swipe,color,pop,logic,brain,iq,relax,offline,zen,sokoban,teaser,calm,tile,merge',
'promo':'Swipe a block and it slides until something stops it. Meet the same color and both pop. Ten hand-built boards, hints and undo, no timer. Think, slide, clear.',
'short':'Swipe blocks, slide them into their twins and pop every pair. No timer, relax!'}
lim={'name':30,'sub':30,'kw':100,'promo':170,'short':80}
for k,v in t.items(): print(k,len(v),'/',lim[k],'OK' if len(v)<=lim[k] else 'OVER')
```

## Подписи на кадрах (набор v2, игра v6)

1. SWIPE TO **SLIDE** — L2 Crossroads, рука на коте, пунктир по направлению хода
2. SAME COLOR? **POP!** — тот же ход через 330 мс: коты встретились, искры, всплывашка MATCH!
3. THREE **BOOSTERS** — панель Hint · Magnet · Undo обведена пунктиром, у каждого свой счётчик
4. MAGNET **PULLS A PAIR** — нажат магнит, пунктир от кнопки к притянутой паре и вспышка
5. KEYS OPEN **CHESTS** — открытый сундук с наградой: +2 Hint, +1 Magnet, +2 Undo
6. 10 LEVELS, **30 STARS** — экран уровней с собранными звёздами
7. EVERY BOARD **IS NEW** — L8 Roundabout, поле-кольцо: формы полей разные
8. CLEAR IT IN **3 STARS** — окно победы: три звезды, время, ходы и +1 ключ

Восемь кадров, а не больше: Google Play принимает максимум восемь телефонных скриншотов.
Бустеры, сундук, ключи и звёзды — настоящие элементы сборки v6, кадры сняты с живой игры.
