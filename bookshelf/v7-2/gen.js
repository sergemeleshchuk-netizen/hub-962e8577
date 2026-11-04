/* =========================================================
   GEN — Level Generator → Puzzle Solver → Difficulty Evaluator → Level Validator
   Pure JS (browser + node). Deterministic: same (level, attempt, version) → same layout.
   ========================================================= */
(function(root){
'use strict';
const isNode=typeof module!=='undefined';
const Core=isNode?require('./core.js'):root.Core;
const LV=isNode?require('./levels.js'):root;
const Gen={};
const clamp01=x=>Math.max(0,Math.min(1,x));

/* ---------- 1. GENERATOR: constrained shuffle ----------
   m books start out of place (rest home), `blocks` misplaced pre-glued blocks of 2-3 books are planted,
   no other accidental glue, no misplaced book lands home by chance. */
Gen.layout=function(def,R){const {rows,cols,n}=def,T=LV.TYPES[def.t];
  const m=Math.max(4,Math.min(n,Math.round(n*T.mFrac)));
  const nBlocks=Math.round(n/10*T.blk*(def.L<=30?1.3:1));
  for(let tries=0;tries<60;tries++){
    const cells=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(R()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]]}
    const mis=new Set(cells.slice(0,m));const order=new Array(n).fill(-1);
    for(let p=0;p<n;p++)if(!mis.has(p))order[p]=p;           // home books
    const free=new Set(mis),left=new Set(mis);let planted=0;    // free cells / ids still to place
    for(let b=0;b<nBlocks*4&&planted<nBlocks;b++){const len=R()<.6?2:3;const a=[...left][Math.floor(R()*left.size)];if(a===undefined)break;
      const ids=[...Array(len).keys()].map(k=>a+k);if(ids.some(id=>!left.has(id)||Math.floor(id/cols)!==Math.floor(a/cols)))continue;
      const r=Math.floor(R()*rows),c=Math.floor(R()*(cols-len+1)),start=r*cols+c;if(start===a)continue;
      const tc=ids.map((_,k)=>start+k);if(tc.some(p=>!free.has(p)))continue;
      ids.forEach((id,k)=>{order[tc[k]]=id;free.delete(tc[k]);left.delete(id)});planted++}
    const fc=[...free],ids=[...left];let ok=false;
    for(let k=0;k<200&&!ok;k++){for(let i=ids.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
      fc.forEach((p,i)=>order[p]=ids[i]);
      if(fc.some((p,i)=>ids[i]===p))continue;
      const st={rows,cols,n};const pairs=Core.pairs(st,order);const want=Gen._homePairs(order,rows,cols)+Gen._plantedPairs(order,rows,cols);
      ok=pairs===want}
    if(ok)return{order:order.slice(),planted,m}}
  return null};
/* pairs among home books and inside planted blocks are expected; anything else is accidental */
Gen._homePairs=(o,rows,cols)=>{let c=0;const n=o.length;for(let p=0;p<n;p++){if(o[p]!==p)continue;if(p%cols<cols-1&&o[p+1]===p+1)c++}return c};
Gen._plantedPairs=(o,rows,cols)=>{let c=0;const n=o.length;for(let p=0;p<n;p++){const a=o[p];if(a===p)continue;if(p%cols<cols-1&&o[p+1]===a+1&&Math.floor((a+1)/cols)===Math.floor(a/cols))c++}return c};

/* ---------- modifiers placement ---------- */
Gen.mods=function(def,order,R){const {n,cols,mods}=def;const pos=[];order.forEach((id,p)=>pos[id]=p);
  const st={rows:def.rows,cols,n};const g=Core.groups(Object.assign(st,{links:[]}),order,false);const single=id=>g.natMembers[g.nat[id]].length===1;
  const used=new Set(),links=[],locks={},hidden=[];let t=0;
  while(links.length<mods.links&&t++<400){const p=Math.floor(R()*n);if(p%cols===cols-1)continue;const a=order[p],b=order[p+1];
    if(used.has(a)||used.has(b)||pos[a]===a||pos[b]===b||!single(a)||!single(b))continue;links.push([a,b]);used.add(a);used.add(b)}
  t=0;while(Object.keys(locks).length<mods.locks&&t++<400){const id=Math.floor(R()*n);if(used.has(id)||pos[id]===id||!single(id))continue;const p=pos[id];
    if(Object.keys(locks).some(k=>{const q=pos[k];return Math.abs(q%cols-p%cols)+Math.abs(Math.floor(q/cols)-Math.floor(p/cols))<=1}))continue;locks[id]=mods.lockHp;used.add(id)}
  t=0;while(hidden.length<mods.hidden&&t++<400){const id=Math.floor(R()*n);if(used.has(id)||pos[id]===id)continue;hidden.push(id);used.add(id)}
  const pickWrong=()=>{for(let k=0;k<400;k++){const id=Math.floor(R()*n);if(!used.has(id)&&pos[id]!==id&&single(id)){used.add(id);return id}}return -1};
  const stars=[],ticks={};let keyBook=-1;
  for(let i=0;i<(mods.stars||0);i++){const id=pickWrong();if(id>=0)stars.push(id)}
  for(let i=0;i<(mods.ticks||0);i++){const id=pickWrong();if(id>=0)ticks[id]=mods.tickN}
  if(mods.keyBook&&Object.keys(locks).length)keyBook=pickWrong();
  return{locks,links,hidden,stars,ticks,keyBook}};

/* ---------- 2. SOLVER ----------
   Exact BFS for tiny shelves (n <= 9, used by tools/validate.js to prove the hand levels and to measure the beam gap).
   Beam search for everything else: from each state expand the "send a group home" moves (+ the jam rescue),
   keep the W best by (books home, glued pairs). Result = an upper bound on the optimum; on n<=9 the gap was 0 in tests. */
Gen.solve=function(base,{W=6,cap=200}={}){let beam=[{st:Core.clone(base),d:0}];
  for(let depth=0;depth<cap;depth++){const nxt=[];
    for(const b of beam){if(Core.solved(b.st))return depth;
      let ms=Core.moves(b.st,{homeOnly:true,seeHidden:true});
      if(!ms.length){const c=Core.clone(b.st);Core.unjam(c);ms=Core.moves(c,{homeOnly:true,seeHidden:true});if(!ms.length)continue;b.st=c}
      for(const m of ms){const o=Core.moveBlock(b.st,m.ids,m.dr,m.dc);const c=Core.clone(b.st);Core.apply(c,o);
        if(c.keyBook>=0&&c.pos&&c.pos[c.keyBook]===c.keyBook){c.locks={};c.keyBook=-1;c.groups=Core.groups(c)}
        nxt.push({st:c,h:Core.correct(c.order)*3+Core.pairs(c,c.order)})}}
    if(!nxt.length)return Infinity;
    const seen=new Set();nxt.sort((a,b)=>b.h-a.h);beam=[];
    for(const x of nxt){const k=x.st.order.join(',');if(seen.has(k))continue;seen.add(k);beam.push(x);if(beam.length>=W)break}}
  return Infinity};
Gen.bfs=function(base,maxStates=400000){const key=s=>s.order.join(',');const q=[Core.clone(base)];const dist=new Map([[key(base),0]]);
  for(let i=0;i<q.length;i++){const s=q[i],d=dist.get(key(s));if(Core.solved(s))return d;
    for(const m of Core.moves(s)){const c=Core.clone(s);Core.apply(c,Core.moveBlock(s,m.ids,m.dr,m.dc));const k=key(c);if(!dist.has(k)){dist.set(k,d+1);q.push(c);if(q.length>maxStates)return -1}}}
  return -1};

/* ---------- 3. EVALUATOR: Difficulty Score 0..100 ----------
   Structural  Ds: solution length S (log-normalised), movable groups N (log-normalised), share of useful first moves R,
                   chance a random legal move creates glue U.
   Execution   De: move pressure P = S / limit.
   Visual      Dv: art similarity V, harder on narrow books.
   Cognitive   Dm: modifier types + objects per book.
   DS = .45 Ds + .25 De + .15 Dv + .15 Dm. Ordinal, not a probability: telemetry maps DS -> win rate (see docs). */
Gen.evaluate=function(st,S,limit,def,mod){const n=st.n;
  const N=new Set(Object.values(st.groups.gid).filter((g,id)=>!Core.isAnch(st,id))).size;
  const all=Core.moves(st,{limit:4000});const base=Core.pairs(st,st.order),bc=Core.correct(st.order);
  let useful=0;for(const m of all){const o=Core.moveBlock(st,m.ids,m.dr,m.dc);if(Core.pairs(st,o)>base||Core.correct(o)>bc)useful++}
  const R=all.length?useful/all.length:1;
  let glueHits=0;for(const m of all){const o=Core.moveBlock(st,m.ids,m.dr,m.dc);if(Core.pairs(st,o)>base)glueHits++}const U=all.length?glueHits/all.length:1;
  const Veff=def.art.v*(.75+.25*def.cols/7);
  const types=['locks','links','hidden','ticks'].filter(k=>(def.mods[k]||0)>0).length;
  const objs=Object.keys(mod.locks).length*(def.mods.lockHp||1)+mod.links.length*2+mod.hidden.length+Object.keys(mod.ticks).length;
  const Ds=100*(.40*clamp01(Math.log(1+S)/Math.log(31))+.25*clamp01(Math.log(1+N)/Math.log(43))+.20*(1-R)+.15*(1-Math.min(1,U*4)));
  const De=100*clamp01((S/limit-.35)/.6);
  const Dv=100*Veff;
  const Dm=100*clamp01(.18*types+1.2*objs/n);
  const DS=Math.round(.45*Ds+.25*De+.15*Dv+.15*Dm);
  return{DS,Ds:Math.round(Ds),De:Math.round(De),Dv:Math.round(Dv),Dm:Math.round(Dm),N,R:+R.toFixed(3),U:+U.toFixed(3),Veff:+Veff.toFixed(2)}};

/* ---------- moves economy ----------
   limit = max(S + floor, ceil(S * K_type * visualAdj) + A_type + modAdj)
   visualAdj = 1 + 0.25 (Veff - 0.4): a lookalike painting costs more exploratory moves at the same S.
   modAdj: +2 per Ticking Book (its penalty), -2 per Star Book (pays +3), +1 per lock (detour to open it).
   floor: onboarding +4, E/B/I/N/M +3, H/P +2 — never let a player who knows the answer run out by one move on a calm level. */
Gen.limit=function(def,S,mod){const T=LV.TYPES[def.t];const Veff=def.art.v*(.75+.25*def.cols/7);
  const k=T.K*(1+.25*(Veff-.4));const modAdj=Object.keys(mod.ticks).length*2-mod.stars.length*2+Object.keys(mod.locks).length;
  return Math.max(Gen.floor(def,S,mod),Math.ceil(S*k)+T.A+modAdj)+(def.ovr.movesDelta||0)};
/* minimum limit: solver moves + safety, minus 2 per Star Book (each pays +3 on the way) */
Gen.floor=(def,S,mod)=>Math.max(S,S+(def.L<=10?4:{E:3,B:3,I:3,N:3,M:3,H:2,P:2}[def.t])-2*mod.stars.length);

/* ---------- 4. VALIDATOR + pipeline ---------- */
Gen.build=function(L,attempt=0,{W=6,cands=8}={}){const def=LV.levelDef(L);const R=LV.rng(def.seed+attempt*977+def.ver*31337);
  let best=null;
  const tryOne=(order,planted)=>{const mod=def.hand?{locks:{},links:[],hidden:[],stars:[],ticks:{},keyBook:-1}:Gen.mods(def,order,R);
    const st=Core.make({rows:def.rows,cols:def.cols,order,locks:mod.locks,links:mod.links,hidden:mod.hidden,freeze:def.freeze,frame:def.frame});st.keyBook=mod.keyBook;
    const S=Gen.solve(st,{W});if(!isFinite(S)||S<1)return null;
    const limit=Gen.limit(def,S,mod);const ev=Gen.evaluate(st,S,limit,def,mod);
    const issues=[];if(S<Gen.minS(def))issues.push('trivial');
    return{def,order,planted,mod,S,limit,ev,issues}};
  if(def.hand){best=tryOne(def.hand.slice(),0)}
  else for(let c=0;c<cands;c++){const lay=Gen.layout(def,R);if(!lay)continue;const r=tryOne(lay.order,lay.planted);if(!r)continue;
    r.fit=Math.abs(r.S-Gen.targetS(def))+r.issues.length*10;if(!best||r.fit<best.fit)best=r;if(best.fit===0)break}
  if(!best)throw new Error('generation failed L'+L);
  const m=best.mod;
  /* Level Database: sim-calibrated limit for this exact layout (tools/build_db.js); formula is the fallback */
  const DB=(isNode?global.LEVEL_DB:root.LEVEL_DB)||{};const row=DB[L]&&DB[L][attempt%4];const h=Gen.hash(best.order);
  if(row&&row.h===h)best.limit=row.m+(def.ovr.movesDelta||0);
  return{def,order:best.order,locks:m.locks,links:m.links,hidden:m.hidden,stars:m.stars,ticks:m.ticks,keyBook:m.keyBook,
    moves:best.limit,opt:best.S,ev:best.ev,planted:best.planted,issues:best.issues,ver:def.ver,
    hash:Gen.hash(best.order)}};
/* target solution length per type (share of books), used to pick the best of N candidates */
Gen.targetS=def=>Math.max(2,Math.round(def.n*{E:.30,B:.26,I:.32,N:.40,M:.50,H:.56,P:.62}[def.t]));
Gen.minS=def=>def.L<=4?1:Math.max(2,Math.round(def.n*.18));
Gen.hash=o=>{let h=2166136261;for(const v of o){h^=v;h=Math.imul(h,16777619)}return(h>>>0).toString(36)};

/* JSON config of one level (schema in docs) */
Gen.toJSON=function(L,attempt=0){const p=Gen.build(L,attempt);const d=p.def;
  return{id:L,ver:p.ver,type:d.t,typeName:d.type,band:d.band,art:d.art.id,grid:{shelves:d.rows,perShelf:d.cols,books:d.n},
    rules:{freeze:d.freeze,goldenFrame:d.frame},layout:p.order,startingBlocks:p.planted,
    modifiers:{locks:Object.entries(p.locks).map(([id,hp])=>({book:+id,hp})),ribbons:p.links,hidden:p.hidden,stars:p.stars,
      ticking:Object.entries(p.ticks).map(([id,n])=>({book:+id,counter:n})),keyBook:p.keyBook>=0?p.keyBook:null},
    solver:{moves:p.opt,method:d.n<=9?'bfs/beam':'beam(W=6)'},movesLimit:p.moves,difficulty:p.ev,targetFirstWin:+d.wr.toFixed(2),
    reward:d.reward,purpose:d.purpose,hash:p.hash}};

if(isNode)module.exports=Gen;else root.Gen=Gen;
})(typeof window!=='undefined'?window:globalThis);
