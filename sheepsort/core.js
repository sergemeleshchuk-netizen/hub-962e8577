/* Sheep Sort — ядро правил (механика Fish Sort Puzzle: Shycheese, triple.sorting.bubble.fish.match).
   Одна реализация правил для игры, ботов и солвера — солвер == игра.

   Термины: кучка (cluster) — группа 1-4 овец разных цветов на лугу (в референсе — пузырь с рыбками);
   заказ (order) — загон наверху, ждёт 3 овцы одного цвета (аквариум 0/3); ожидание (tray) — загон на
   T мест (лоток в референсе); замок (lock) — кучка за забором, открывается после N любых тапов
   (пузырь с цифрой).

   Правила тапа по овце:
   1) овца уходит из кучки; все замки уменьшаются на 1;
   2) есть открытый заказ этого цвета → овца идёт в него; заказ собрал 3 → выполнен, на его место
      приходит следующий из очереди, и овцы этого цвета из ожидания сами перебегают в новый заказ
      (цепочка, если заполнили и его);
   3) заказа нет → овца идёт в ожидание; ожидание переполнено (T+1) → проигрыш сразу;
   4) победа: луг пуст, ожидание пусто, заказов больше нет. Всего овец = 3 × заказов.

   spec = {colors:K, slots:S, tray:T, clusters:[{s:[colorIdx…], lock:N}], queue:[colorIdx…]} */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SheepCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const NEED = 3;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function newState(spec) {
    let id = 0;
    const clusters = spec.clusters.map((cl, i) => ({ i, sheep: cl.s.map(c => ({ id: id++, c })), lock: cl.lock || 0 }));
    const st = { spec, clusters, tray: [], orders: [], qi: 0, taps: 0, sorted: 0, total: id, lost: false, won: false };
    for (let k = 0; k < spec.slots; k++) st.orders.push(st.qi < spec.queue.length ? { c: spec.queue[st.qi++], got: [] } : null);
    return st;
  }
  function clone(st) {
    return {
      spec: st.spec,
      clusters: st.clusters.map(cl => ({ i: cl.i, sheep: cl.sheep.map(s => ({ id: s.id, c: s.c })), lock: cl.lock })),
      tray: st.tray.map(s => ({ id: s.id, c: s.c })),
      orders: st.orders.map(o => o ? { c: o.c, got: o.got.map(s => ({ id: s.id, c: s.c })) } : null),
      qi: st.qi, taps: st.taps, sorted: st.sorted, total: st.total, lost: st.lost, won: st.won,
    };
  }

  /* открытый заказ цвета c (если два — тот, где овец больше) */
  function findOrder(st, c) {
    let best = -1;
    st.orders.forEach((o, i) => {
      if (o && o.c === c && o.got.length < NEED && (best < 0 || o.got.length > st.orders[best].got.length)) best = i;
    });
    return best;
  }
  /* все овцы, по которым сейчас можно тапнуть */
  function sheepList(st) {
    const L = [];
    for (const cl of st.clusters) if (cl.lock === 0) for (const s of cl.sheep) L.push({ ci: cl.i, c: s.c, id: s.id });
    return L;
  }
  /* сколько овец каждого цвета осталось на лугу (включая закрытые) */
  function fieldCounts(st) {
    const n = new Array(st.spec.colors).fill(0);
    for (const cl of st.clusters) for (const s of cl.sheep) n[s.c]++;
    return n;
  }

  function place(st, oi, sh, ev, type, ci) {
    const o = st.orders[oi];
    o.got.push(sh); st.sorted++;
    ev.push({ t: type, id: sh.id, c: sh.c, oi, ci, k: o.got.length - 1 });
    if (o.got.length === NEED) {
      ev.push({ t: 'orderDone', oi, c: o.c });
      if (st.qi < st.spec.queue.length) {
        const nc = st.spec.queue[st.qi++];
        st.orders[oi] = { c: nc, got: [] };
        ev.push({ t: 'newOrder', oi, c: nc });
        pull(st, oi, ev);
      } else {
        st.orders[oi] = null;
        ev.push({ t: 'slotClosed', oi });
      }
    }
  }
  /* овцы нужного цвета из ожидания сами бегут в новый заказ */
  function pull(st, oi, ev) {
    const o = st.orders[oi];
    if (!o) return;
    let idx;
    while (st.orders[oi] === o && o.got.length < NEED && (idx = st.tray.findIndex(s => s.c === o.c)) >= 0) {
      const s2 = st.tray.splice(idx, 1)[0];
      place(st, oi, s2, ev, 'trayToOrder', -1);
    }
  }
  function checkWin(st) {
    if (!st.lost && st.clusters.every(x => !x.sheep.length) && !st.tray.length && st.orders.every(o => !o)) st.won = true;
    return st.won;
  }

  /* тап по овце цвета c в кучке ci → список событий для анимации (null = ход невозможен) */
  function tap(st, ci, c) {
    if (st.lost || st.won) return null;
    const cl = st.clusters[ci];
    if (!cl || cl.lock > 0) return null;
    const k = cl.sheep.findIndex(s => s.c === c);
    if (k < 0) return null;
    const sh = cl.sheep.splice(k, 1)[0];
    const ev = [];
    st.taps++;
    for (const o of st.clusters) if (o.lock > 0) { o.lock--; if (o.lock === 0) ev.push({ t: 'unlock', ci: o.i }); }
    const oi = findOrder(st, c);
    if (oi >= 0) place(st, oi, sh, ev, 'toOrder', ci);
    else {
      st.tray.push(sh);
      ev.push({ t: 'toTray', id: sh.id, c, ci, ti: st.tray.length - 1 });
      if (st.tray.length > st.spec.tray) { st.lost = true; ev.push({ t: 'lose' }); }
    }
    if (checkWin(st)) ev.push({ t: 'win' });
    return ev;
  }

  /* ---------- боты ---------- */
  /* случайный: любая доступная овца */
  function playRandom(spec, rng) {
    const st = newState(spec);
    while (!st.won && !st.lost) {
      const L = sheepList(st);
      if (!L.length) { st.lost = true; break; }
      const p = L[(rng() * L.length) | 0];
      tap(st, p.ci, p.c);
    }
    return st;
  }
  /* честный игрок: сначала овца под заказ; вынужден копить — берёт цвет, которого на лугу больше всех
     (без знания очереди; если задан peek — знает следующие peek заказов, как превью NEXT на экране) */
  function playFair(spec, rng, peek) {
    const st = newState(spec);
    peek = peek || 0;
    while (!st.won && !st.lost) {
      const L = sheepList(st);
      if (!L.length) { st.lost = true; break; }
      const match = L.filter(p => findOrder(st, p.c) >= 0);
      if (match.length) { const p = match[(rng() * match.length) | 0]; tap(st, p.ci, p.c); continue; }
      const next = spec.queue.slice(st.qi, st.qi + peek);
      const cnt = fieldCounts(st);
      let best = null, bs = -1;
      for (const p of L) {
        const inTray = st.tray.filter(s => s.c === p.c).length;
        const soon = next.indexOf(p.c);
        let s = (soon >= 0 ? 1000 - soon * 100 : 0) + cnt[p.c] * 3 + inTray * 5 + rng();
        if (s > bs) { bs = s; best = p; }
      }
      tap(st, best.ci, best.c);
    }
    return st;
  }
  function winRate(spec, bot, n, seed, peek) {
    let w = 0;
    for (let i = 0; i < n; i++) if (bot(spec, mulberry32(seed + i), peek).won) w++;
    return w / n;
  }

  /* ---------- солвер (есть ли решение вообще) ----------
     Овца под заказ — ход доминирующий (прогресс + тот же сдвиг замков, ожидание не тратится),
     поэтому ветвимся только там, где вынуждены копить: по цвету откладываемой овцы. */
  function key(st) {
    const cnt = fieldCounts(st);
    const locked = st.clusters.filter(cl => cl.lock > 0).map(cl => cl.i + ':' + cl.sheep.map(s => s.c).sort().join('')).join('|');
    return cnt.join(',') + '#' + st.tray.map(s => s.c).sort().join('') + '#' +
      st.orders.map(o => o ? o.c + '.' + o.got.length : '-').join(',') + '#' + st.qi + '#' + st.taps + '#' + locked;
  }
  function solve(spec, nodeCap) {
    nodeCap = nodeCap || 200000;
    const memo = new Map();
    let nodes = 0;
    const path = [];
    function rec(st) {
      if (st.won) return true;
      if (st.lost) return false;
      if (++nodes > nodeCap) return false;
      const k = key(st);
      if (memo.has(k)) return memo.get(k);
      const L = sheepList(st);
      if (!L.length) { memo.set(k, false); return false; }
      const match = L.find(p => findOrder(st, p.c) >= 0);
      let res = false;
      if (match) {
        const s2 = clone(st); tap(s2, match.ci, match.c); path.push({ ci: match.ci, c: match.c });
        res = rec(s2); if (!res) path.pop();
      } else {
        const seen = new Set();
        const opts = L.filter(p => !seen.has(p.c) && seen.add(p.c));
        const next = spec.queue.slice(st.qi);
        opts.sort((a, b) => { const ia = next.indexOf(a.c), ib = next.indexOf(b.c); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
        for (const p of opts) {
          const s2 = clone(st); tap(s2, p.ci, p.c); path.push({ ci: p.ci, c: p.c });
          if (rec(s2)) { res = true; break; }
          path.pop();
        }
      }
      memo.set(k, res);
      return res;
    }
    const ok = rec(newState(spec));
    return { ok, nodes, solution: ok ? path.slice() : null };
  }

  return { NEED, mulberry32, newState, clone, tap, findOrder, sheepList, fieldCounts, playRandom, playFair, winRate, solve };
});
