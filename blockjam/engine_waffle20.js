// Waffle Sort v18 — поле-слайдпазл (v16 PSD-арт) + НАШ модуль сортировки v6 (3 ОБЩИЕ колбы + микс).
// Пазл: колб мало и они общие → кусочки разных цветов ложатся вместе → миксы. Выбирай порядок вывода
// фигур, чтобы место не кончилось. Полная одноцветная колба ОБОРАЧИВАЕТСЯ в товар и освобождает слот
// (переработка). Следующая фигура своего цвета ВЫТЯГИВАЕТ свой цвет из миксов. Нет места → проигрыш.
// Победа = поле очищено (недобранные хвосты в колбах допустимы). Каждая клетка вафли = 2×2 = 4 квадратика.

const L = WAFFLE_LEVELS[0];
const PSD = L.psd;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');

const PIECES_PER_CELL = 4;          // клетка = 2×2 = 4 квадратика (крупная фигура 4 кл. = 16)
const CAP = 8;                      // ёмкость колбы (16-кусочковая фигура = ~2 колбы → создаёт миксы)
const MAXC = 3;                     // 3 ОБЩИЕ колбы — намеренное ограничение = пазл

const COLORS = {
  red:    {fill:"#d15a4e", dark:"#9a3a30", light:"#f0a89f"},
  magenta:{fill:"#d060a0", dark:"#973f6f", light:"#f0aed4"},
  purple: {fill:"#8a63c8", dark:"#5c3d97", light:"#c9aef0"},
  blue:   {fill:"#4d73c1", dark:"#2f4a85", light:"#a2b9eb"},
  cyan:   {fill:"#45b0b8", dark:"#2f7d84", light:"#a6e8ee"},
  yellow: {fill:"#e0a63f", dark:"#a17626", light:"#f3d394"},
};

// ---------- спрайты поля ----------
const IMG = {};
function loadImg(file){ if(IMG[file]) return; const im=new Image(); im.src='psd_ui/'+file; IMG[file]=im; }
loadImg(L.bg);
for(const o of L.obstacles) loadImg(o.sprite);
for(const b of L.blocks) loadImg(b.sprite);

let figs, colbs, parts, packs, sparks, emitQueue, won, lost, raf, winTimer=0, beltPhase=0;
let gateFlash={}, flaskGlow={}, loseShake=0, sortBanner=null;
let S, BX, BY, W, H, DPR;
let CW, CH, GAP, colbRowX, CY0, LX, LY, LW, LH, LR, PERIM;

function clone(o){ return JSON.parse(JSON.stringify(o)); }

function reset(){
  figs = clone(L).blocks;
  colbs = Array.from({length:MAXC}, ()=>({slots:Array(CAP).fill(null), resv:[]}));
  parts=[]; packs=[]; sparks=[]; emitQueue=[];
  won=false; lost=false; winTimer=0; beltPhase=0;
  gateFlash={}; flaskGlow={}; loseShake=0; sortBanner=null;
  const t=document.getElementById('toast'); if(t) t.style.display='none';
  const lt=document.getElementById('losetoast'); if(lt) lt.style.display='none';
  fit();
}

function fit(){
  const ph=document.getElementById('phone');
  W=ph.clientWidth; H=ph.clientHeight;
  DPR=Math.min(2.5, window.devicePixelRatio||1);
  cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
  ctx.setTransform(DPR,0,0,DPR,0,0);

  // ---- верхний модуль: лента-петля + 3 колбы ----
  CW=Math.round(W*0.155); GAP=Math.round(W*0.05); CH=Math.round(H*0.185);
  const M=Math.round(W*0.05);
  const rowW=MAXC*CW+(MAXC-1)*GAP;
  LW=rowW+2*M; LH=CH+2*M; LR=Math.round(W*0.05);
  LX=Math.round((W-LW)/2); LY=8;
  colbRowX=LX+(LW-rowW)/2; CY0=LY+M;
  PERIM={ topLen:LW-2*LR, rightLen:LH-2*LR, arc:Math.PI/2*LR };
  PERIM.total=2*PERIM.topLen+2*PERIM.rightLen+4*PERIM.arc;

  // ---- поле снизу ----
  const top=LY+LH+8, bot=H-26, pad=8;
  const availW=W-2*pad, availH=bot-top;
  S=Math.min(availW/PSD.w, availH/PSD.h);
  BX=(W-PSD.w*S)/2; BY=top+(availH-PSD.h*S)/2;
  if(!raf) loop();
}

function px(x){ return BX + x*S; }
function py(y){ return BY + y*S; }

// ---------- петля-конвейер ----------
function loopPt(d){
  const {topLen,rightLen,arc,total}=PERIM; d=((d%total)+total)%total;
  const cTR=[LX+LW-LR,LY+LR], cBR=[LX+LW-LR,LY+LH-LR], cBL=[LX+LR,LY+LH-LR], cTL=[LX+LR,LY+LR];
  let acc=0;
  if(d<acc+topLen) return [LX+LR+(d-acc), LY]; acc+=topLen;
  if(d<acc+arc){ const a=-Math.PI/2+(d-acc)/arc*(Math.PI/2); return [cTR[0]+LR*Math.cos(a),cTR[1]+LR*Math.sin(a)]; } acc+=arc;
  if(d<acc+rightLen) return [LX+LW, LY+LR+(d-acc)]; acc+=rightLen;
  if(d<acc+arc){ const a=(d-acc)/arc*(Math.PI/2); return [cBR[0]+LR*Math.cos(a),cBR[1]+LR*Math.sin(a)]; } acc+=arc;
  if(d<acc+topLen) return [LX+LW-LR-(d-acc), LY+LH]; acc+=topLen;
  if(d<acc+arc){ const a=Math.PI/2+(d-acc)/arc*(Math.PI/2); return [cBL[0]+LR*Math.cos(a),cBL[1]+LR*Math.sin(a)]; } acc+=arc;
  if(d<acc+rightLen) return [LX, LY+LH-LR-(d-acc)]; acc+=rightLen;
  const a=Math.PI+(d-acc)/arc*(Math.PI/2); return [cTL[0]+LR*Math.cos(a),cTL[1]+LR*Math.sin(a)];
}
function topEntryD(x){ return Math.max(0,Math.min(LW-2*LR, x-(LX+LR))); }
function bottomEntryD(x){ const {topLen,rightLen,arc}=PERIM; const start=topLen+arc+rightLen+arc;
  return start+Math.max(0,Math.min(topLen,(LX+LW-LR)-x)); }

// ---------- колбы ----------
function colbCenterX(i){ return colbRowX + i*(CW+GAP) + CW/2; }
function slotPix(ci,si){ return [colbCenterX(ci), CY0+CH-(si+0.5)*(CH/CAP)]; }
function filled(c){ return c.slots.filter(Boolean).length; }
function totalIn(c){ return filled(c) + c.resv.length; }
function colorsIn(c){ return new Set([...c.slots.filter(Boolean).map(s=>s.color), ...c.resv]); }
function landedColors(c){ return new Set(c.slots.filter(Boolean).map(s=>s.color)); }
function isMixedLanded(c, C){ const lc=landedColors(c); return lc.size>1 && lc.has(C); }
function isEmpty(c){ return totalIn(c)===0; }
function isDone(c){ return filled(c)===CAP && colorsIn(c).size===1; }
function compact(c){ const v=c.slots.filter(Boolean); for(let i=0;i<CAP;i++) c.slots[i]=v[i]||null; }
function usedSlots(){ return colbs.filter(c=>!isEmpty(c)).length; }

function reserveRoute(p, ci){
  colbs[ci].resv.push(p.color);
  const dTo=topEntryD(colbCenterX(ci));
  const wp=[]; const {total}=PERIM; const span=((dTo-p.d)%total+total)%total;
  const n=Math.max(2,Math.round(span/14)); for(let k=0;k<=n;k++) wp.push(loopPt(p.d+span*k/n));
  wp.push(slotPix(ci, CAP-1));
  p.mode='route'; p.wp=wp; p.i=0; p.seg=0; p.ci=ci;
}
function spawnPart(C, kind, d, ci, delay){ const p={color:C, kind, d, delay:Math.round(delay)||0}; parts.push(p); reserveRoute(p, ci); }

// ---------- фигура вышла ----------
function exitFig(f){
  const C=f.color, k=f.cells.length*PIECES_PER_CELL;
  let cx=0; for(const c of f.cells) cx+=px(PSD.ox+(c[0]+0.5)*PSD.cellx); cx/=f.cells.length;
  figs=figs.filter(x=>x!==f);
  emitQueue.push({color:C, k, entryD:bottomEntryD(cx)});
}
function pumpEmit(){
  if(lost || parts.length>0 || emitQueue.length===0) return;
  const e=emitQueue.shift();
  const inMix = colbs.some(c=>isMixedLanded(c,e.color));
  if(inMix) emitSort(e.color, e.k, e.entryD); else emitFill(e.color, e.k, e.entryD);
}
const PACK_FR = 60;   // длительность анимации упаковки (кадров) — колба «занята» на это время
function emitFill(C, k, entryD){
  // Раскладываем кусочки ПОСЛЕДОВАТЕЛЬНО: копим одну колбу до верха → она пакуется и уходит →
  // ОСТАТОК идёт в СЛЕДУЮЩУЮ колбу. Если свободна только эта же колба — остаток ЖДЁТ конца упаковки
  // (delay), чтобы не лететь под анимацией подарка и не паковать её повторно.
  const sim = colbs.map(c=>({n:totalIn(c), colors:new Set(colorsIn(c)), free:0}));
  for(const p of packs) sim[p.ci].free = Math.max(sim[p.ci].free, PACK_FR - p.t);  // колба ещё пакуется
  const target=[], del=[]; let t=0;
  for(let n=0;n<k;n++){
    let ci=-1;
    // 1) продолжаем незавершённую одноцветную-C колбу (свободна сейчас)
    for(let i=0;i<MAXC;i++){ const s=sim[i]; if(s.n>0&&s.n<CAP&&s.colors.size===1&&s.colors.has(C)&&s.free<=t){ ci=i; break; } }
    // 2) иначе — первая колба со свободным местом, не занятая упаковкой (слева-направо)
    if(ci<0) for(let i=0;i<MAXC;i++){ const s=sim[i]; if(s.n<CAP&&s.free<=t){ ci=i; break; } }
    // 3) все подходящие сейчас пакуются — ждём ближайшую освободившуюся
    if(ci<0){ let bi=-1,bf=Infinity; for(let i=0;i<MAXC;i++){ const s=sim[i]; if(s.n<CAP&&s.free<bf){ bf=s.free; bi=i; } }
      if(bi<0){ lose(); return; }                     // реально мест нет (все колбы забиты миксами)
      ci=bi; t=Math.max(t, sim[ci].free); }
    const s=sim[ci]; s.colors.add(C); s.n++; target.push(ci); del.push(t);
    if(s.n===CAP && s.colors.size===1){ s.n=0; s.colors=new Set(); s.free=t+PACK_FR; }   // упаковалась → занята PACK_FR
    t+=6;
  }
  for(let n=0;n<k;n++) spawnPart(C, 'fill', entryD, target[n], del[n]);
}
function emitSort(C, k, entryD){
  sortBanner={t:80, color:C};
  const sources=[];
  for(let i=0;i<MAXC;i++){ const c=colbs[i];
    if(isMixedLanded(c,C)){ flaskGlow[i]=60;
      for(let s=0;s<CAP;s++) if(c.slots[s]&&c.slots[s].color===C){ c.slots[s]=null; sources.push(topEntryD(colbCenterX(i))); }
      compact(c);
    }
  }
  const clean=[]; for(let i=0;i<MAXC;i++){ const cols=colorsIn(colbs[i]); if(cols.size===0||(cols.size===1&&cols.has(C))) clean.push(i); }
  if(clean.length===0){ lose(); return; }
  const h={}; for(const i of clean) h[i]=totalIn(colbs[i]);
  const pick=()=>{ for(const i of clean){ if(h[i]<CAP){ h[i]++; if(h[i]===CAP) h[i]=0; flaskGlow[i]=60; return i; } } return clean[0]; };
  let n=0;
  for(const sd of sources){ spawnPart(C,'sort',sd,pick(),n*4); n++; }
  for(let j=0;j<k;j++){ spawnPart(C,'sort',entryD,pick(),n*4); n++; }
}
function tryConsolidate(){
  if(parts.length>0 || packs.length>0 || emitQueue.length>0) return;
  let best=null;
  for(let i=0;i<MAXC && !best;i++){ const ci=colbs[i]; const li=landedColors(ci);
    if(li.size!==1) continue; const C=[...li][0]; const fi=filled(ci);
    if(fi===0||fi===CAP) continue;
    for(let j=0;j<MAXC;j++){ if(j===i) continue; const cj=colbs[j]; const lj=landedColors(cj);
      if(lj.size!==1 || [...lj][0]!==C) continue; const fj=filled(cj); if(fj===0) continue;
      let src,dst; if(fj<fi || (fj===fi && j>i)){ src=j; dst=i; } else { src=i; dst=j; }
      best={src,dst,C}; break;
    }
  }
  if(!best) return;
  const src=colbs[best.src], dst=colbs[best.dst], C=best.C;
  const m=Math.min(filled(src), CAP-filled(dst));
  let moved=0; const srcD=topEntryD(colbCenterX(best.src));
  for(let s=CAP-1;s>=0 && moved<m;s--){ if(src.slots[s] && src.slots[s].color===C){ src.slots[s]=null; moved++; } }
  compact(src);
  flaskGlow[best.src]=60; flaskGlow[best.dst]=60;
  for(let n=0;n<m;n++) spawnPart(C,'sort',srcD,best.dst,n*4);
}
function land(p){
  const c=colbs[p.ci];
  const k=c.resv.indexOf(p.color); if(k>=0) c.resv.splice(k,1);
  const si=c.slots.findIndex(s=>!s); if(si>=0) c.slots[si]={color:p.color};
  checkDone();
}
// полная одноцветная колба → упаковка товара + слот освобождается
function checkDone(){
  for(let i=0;i<MAXC;i++){ const c=colbs[i];
    if(isDone(c)){
      packs.push({ci:i, x:colbRowX+i*(CW+GAP), y:CY0, w:CW, h:CH, color:c.slots[0].color, t:0});
      colbs[i]={slots:Array(CAP).fill(null), resv:[]};
    }
  }
}
function spawnSparks(cx,cy,color){ for(let i=0;i<14;i++){ const a=(i/14)*Math.PI*2, sp=1.6+(i%3)*0.6;
  sparks.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.6,t:0,color}); } }

function checkWin(){
  if(won||lost) return;
  if(figs.length===0 && emitQueue.length===0 && parts.length===0 && packs.length===0 && !winTimer){
    winTimer=1;
    setTimeout(()=>{ won=true; const t=document.getElementById('toast'); if(t) t.style.display='flex'; }, 900);
  }
}
function lose(){ if(lost||won) return; lost=true; loseShake=22; const lt=document.getElementById('losetoast'); if(lt) lt.style.display='flex'; }

// ---------- поле: коллизия / выход ----------
function isObstacle(x,y){ for(const o of L.obstacles) for(const c of o.cells) if(c[0]===x&&c[1]===y) return true; return false; }
function occAt(x,y,exId){ if(isObstacle(x,y)) return 'OBST';
  for(const f of figs){ if(f.id===exId) continue; for(const c of f.cells) if(c[0]===x&&c[1]===y) return f.id; } return null; }
function figAtCell(x,y){ for(const f of figs) for(const c of f.cells) if(c[0]===x&&c[1]===y) return f; return null; }
function freeCells(f,d){ let n=0; while(true){ let ok=true;
  for(const c of f.cells){ const nx=c[0]+d[0]*(n+1), ny=c[1]+d[1]*(n+1);
    if(nx<0||nx>=L.w||ny<0||ny>=L.h||occAt(nx,ny,f.id)!==null){ ok=false; break; } }
  if(!ok) break; n++; } return n; }
function exitDir(f,d){
  const n=freeCells(f,d); const cells=f.cells.map(c=>[c[0]+d[0]*n,c[1]+d[1]*n]);
  let off=null, blocked=false;
  for(const c of cells){ const nx=c[0]+d[0], ny=c[1]+d[1];
    if(nx<0)off="left"; else if(nx>=L.w)off="right"; else if(ny<0)off="top"; else if(ny>=L.h)off="bottom";
    else if(occAt(nx,ny,f.id)!==null) blocked=true; }
  if(!off||blocked) return false;
  for(const g of L.gates){ if(g.edge!==off||g.color!==f.color) continue; const [a,b]=g.span;
    if(off==="left"||off==="right"){ const rs=cells.map(c=>c[1]); if(Math.min(...rs)>=a&&Math.max(...rs)<=b) return true; }
    else { const cs=cells.map(c=>c[0]); if(Math.min(...cs)>=a&&Math.max(...cs)<=b) return true; } }
  return false;
}

// ---------- драг ----------
let drag=null;
function pos(e){ const r=cv.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left,y:t.clientY-r.top}; }
function cellAt(p){ return [Math.floor(((p.x-BX)/S-PSD.ox)/PSD.cellx), Math.floor(((p.y-BY)/S-PSD.oy)/PSD.celly)]; }
function shiftCells(f,dx,dy){ f.cells=f.cells.map(c=>[c[0]+dx,c[1]+dy]); }
cv.addEventListener('pointerdown',e=>{ if(won||lost) return; e.preventDefault&&e.preventDefault(); const p=pos(e);
  const [x,y]=cellAt(p); const f=figAtCell(x,y); if(!f) return;
  drag={f,px:p.x,py:p.y}; f.dx=0; f.dy=0; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove',e=>{
  if(!drag) return; e.preventDefault&&e.preventDefault(); const p=pos(e); const f=drag.f;
  const CX=PSD.cellx*S, CY=PSD.celly*S;
  f.dx=(f.dx||0)+(p.x-drag.px); f.dy=(f.dy||0)+(p.y-drag.py); drag.px=p.x; drag.py=p.y;
  while(f.dx>=CX && freeCells(f,[1,0])>0){ shiftCells(f,1,0); f.dx-=CX; }
  while(f.dx<=-CX && freeCells(f,[-1,0])>0){ shiftCells(f,-1,0); f.dx+=CX; }
  while(f.dy>=CY && freeCells(f,[0,1])>0){ shiftCells(f,0,1); f.dy-=CY; }
  while(f.dy<=-CY && freeCells(f,[0,-1])>0){ shiftCells(f,0,-1); f.dy+=CY; }
  const fr=freeCells(f,[1,0]),fl=freeCells(f,[-1,0]),fd=freeCells(f,[0,1]),fu=freeCells(f,[0,-1]);
  const exR=exitDir(f,[1,0]),exL=exitDir(f,[-1,0]),exD=exitDir(f,[0,1]),exU=exitDir(f,[0,-1]);
  if(exR&&fr===0&&f.dx> 0.5*CX){ endDrag(e); exitFig(f); return; }
  if(exL&&fl===0&&f.dx<-0.5*CX){ endDrag(e); exitFig(f); return; }
  if(exD&&fd===0&&f.dy> 0.5*CY){ endDrag(e); exitFig(f); return; }
  if(exU&&fu===0&&f.dy<-0.5*CY){ endDrag(e); exitFig(f); return; }
  f.dx=Math.min(f.dx, fr>0?CX:(exR?CX:0)); f.dx=Math.max(f.dx, fl>0?-CX:(exL?-CX:0));
  f.dy=Math.min(f.dy, fd>0?CY:(exD?CY:0)); f.dy=Math.max(f.dy, fu>0?-CY:(exU?-CY:0));
});
function endDrag(e){ if(!drag) return; const f=drag.f; const CX=PSD.cellx*S, CY=PSD.celly*S;
  if(f){ if(Math.abs(f.dx||0)>=CX/2){ const d=[(f.dx>0?1:-1),0]; if(freeCells(f,d)>0) shiftCells(f,d[0],d[1]); }
    if(Math.abs(f.dy||0)>=CY/2){ const d=[0,(f.dy>0?1:-1)]; if(freeCells(f,d)>0) shiftCells(f,d[0],d[1]); }
    f.dx=0; f.dy=0; }
  try{cv.releasePointerCapture(e.pointerId)}catch{}
  drag=null;
}
cv.addEventListener('pointerup',endDrag); cv.addEventListener('pointercancel',endDrag);

// ---------- рендер ----------
function rr(x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawSprite(file, bbox, offX, offY){
  const im=IMG[file]; if(!im||!im.complete||!im.naturalWidth) return;
  ctx.drawImage(im, px(bbox[0])+(offX||0), py(bbox[1])+(offY||0), (bbox[2]-bbox[0])*S, (bbox[3]-bbox[1])*S);
}
function drawLoop(){
  ctx.lineWidth=Math.max(6,CW*0.34); ctx.strokeStyle="#2c2750"; ctx.lineJoin="round";
  rr(LX,LY,LW,LH,LR); ctx.stroke();
  ctx.save(); rr(LX-6,LY-6,LW+12,LH+12,LR+6); ctx.clip();
  ctx.lineWidth=Math.max(5,CW*0.30); ctx.strokeStyle="rgba(255,255,255,.08)"; const step=18, total=PERIM.total;
  for(let d=(beltPhase%step); d<total; d+=step){ const a=loopPt(d), b=loopPt(d+8); ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke(); }
  ctx.restore();
}
function drawColbs(){
  for(let i=0;i<MAXC;i++){
    const x=colbRowX+i*(CW+GAP), y=CY0, c=colbs[i], glow=flaskGlow[i]>0;
    if(packs.find(p=>p.ci===i)) continue;               // во время упаковки колбу не рисуем
    const empty=isEmpty(c);
    // корпус колбы
    if(empty && !glow){ ctx.setLineDash([6,5]); rr(x,y,CW,CH,10); ctx.lineWidth=2; ctx.strokeStyle="rgba(255,255,255,.24)"; ctx.stroke(); ctx.setLineDash([]); }
    else { if(glow){ ctx.save(); ctx.shadowColor="#ffe27a"; ctx.shadowBlur=18; rr(x,y,CW,CH,10); ctx.strokeStyle="#ffe27a"; ctx.lineWidth=3; ctx.stroke(); ctx.restore(); }
      rr(x,y,CW,CH,10); ctx.fillStyle="rgba(255,255,255,.06)"; ctx.fill();
      ctx.lineWidth=glow?3:2; ctx.strokeStyle=glow?"#ffe27a":"rgba(255,255,255,.30)"; ctx.stroke(); }
    const slotH=(CH-8)/CAP;
    // ДЕЛЕНИЯ — видно ёмкость (CAP мест) и сколько занято: риски на каждом слоте у КАЖДОЙ колбы
    for(let s=1;s<CAP;s++){ const yy=y+4+(CH-8)-s*slotH; ctx.beginPath(); ctx.moveTo(x+4,yy); ctx.lineTo(x+CW-4,yy);
      ctx.lineWidth=1; ctx.strokeStyle="rgba(255,255,255,.11)"; ctx.stroke(); }
    // заполненные бруски
    for(let s=0;s<CAP;s++){ const sl=c.slots[s]; if(!sl) continue; const cc=COLORS[sl.color];
      const yy=y+4+(CH-8)-(s+1)*slotH; rr(x+3,yy+1,CW-6,slotH-2,4); ctx.fillStyle=cc.fill; ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.16)"; ctx.fillRect(x+5,yy+2,CW-10,Math.max(1,slotH*0.24)); }
    // счётчик занято/всего
    ctx.fillStyle="rgba(255,255,255,.6)"; ctx.font=`700 ${Math.max(9,Math.round(CW*0.2))}px system-ui`;
    ctx.textAlign="center"; ctx.textBaseline="top"; ctx.fillText(filled(c)+"/"+CAP, x+CW/2, y+CH+3);
  }
  for(const p of packs) drawPack(p);
}
// упаковка товара: 0..0.45 собирается в коробку, 0.45..0.7 обёртка+блик, 0.7..1 улёт+исчез
function drawPack(p){
  const c=COLORS[p.color]; const t=Math.min(1,p.t/46);
  const cx=p.x+p.w/2, cy=p.y+p.h/2;
  let scale, alpha, lift;
  if(t<0.45){ scale=0.4+0.95*(t/0.45); alpha=1; lift=0; }
  else if(t<0.7){ scale=1.32-0.05*Math.sin((t-0.45)/0.25*Math.PI); alpha=1; lift=0; }
  else { const u=(t-0.7)/0.3; scale=1.28+u*0.16; alpha=1-u; lift=u*p.h*1.15; }
  const bw=p.w*1.02*Math.min(1.3,scale), bh=Math.min(p.h*0.66, p.w*1.15)*Math.min(1.3,scale);
  const bx=cx-bw/2, byy=cy-bh/2-lift;
  ctx.save(); ctx.globalAlpha=alpha;
  rr(bx,byy,bw,bh,8); const g=ctx.createLinearGradient(bx,byy,bx,byy+bh);
  g.addColorStop(0,c.light); g.addColorStop(.5,c.fill); g.addColorStop(1,c.dark);
  ctx.fillStyle=g; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle=c.dark; ctx.stroke();
  ctx.fillStyle="rgba(255,255,255,.85)";
  ctx.fillRect(cx-bw*0.06, byy, bw*0.12, bh);
  ctx.fillRect(bx, byy+bh*0.44, bw, bh*0.12);
  ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(cx, byy+bh*0.5, Math.max(3,bw*0.09),0,7); ctx.fill();
  ctx.fillStyle=c.dark; ctx.beginPath(); ctx.arc(cx, byy+bh*0.5, Math.max(1.5,bw*0.04),0,7); ctx.fill();
  if(t>=0.45 && t<0.75){ const u=(t-0.45)/0.3; ctx.save(); rr(bx,byy,bw,bh,8); ctx.clip();
    const sx=bx-bw + u*bw*2.4; const sg=ctx.createLinearGradient(sx,0,sx+bw*0.5,0);
    sg.addColorStop(0,"rgba(255,255,255,0)"); sg.addColorStop(.5,"rgba(255,255,255,.75)"); sg.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle=sg; ctx.fillRect(sx,byy,bw*0.5,bh); ctx.restore(); }
  ctx.restore();
}
// ВОРОТА уже нарисованы В АРТЕ поля (platform_base.png) — цветные плашки со стрелками нужного размера.
// Свой оверлей (drawGates) убран в v20: он дублировал ворота меньшей плашкой. Логика выхода — по L.gates (спаны).
function drawSquare(pt,C,kind){ const cc=COLORS[C], s=Math.max(7,CW*0.28);
  if(kind==='sort'){ ctx.save(); ctx.shadowColor="#ffe27a"; ctx.shadowBlur=8; }
  rr(pt[0]-s/2,pt[1]-s/2,s,s,s*0.28); ctx.fillStyle=cc.fill; ctx.fill();
  ctx.lineWidth=kind==='sort'?2:1.4; ctx.strokeStyle=kind==='sort'?"#ffe27a":cc.dark; ctx.stroke();
  if(kind==='sort') ctx.restore(); }

function draw(){
  ctx.save();
  if(loseShake>0){ const a=loseShake/22*5; ctx.translate(Math.sin(loseShake*2.1)*a, Math.cos(loseShake*1.7)*a); }
  ctx.clearRect(-8,-8,W+16,H+16);
  // поле (ворота уже запечены в L.bg)
  drawSprite(L.bg, L.bgBbox);
  for(const o of L.obstacles) drawSprite(o.sprite, o.bbox);
  for(const f of figs){
    const curC=Math.min(...f.cells.map(c=>c[0])), curR=Math.min(...f.cells.map(c=>c[1]));
    const offX=(curC-f.org[0])*PSD.cellx*S+(f.dx||0), offY=(curR-f.org[1])*PSD.celly*S+(f.dy||0);
    drawSprite(f.sprite, f.bbox, offX, offY);
  }
  // модуль
  drawLoop(); drawColbs();
  for(const p of parts){ if(p.delay>0) continue; drawSquare(p.pos||loopPt(p.d), p.color, p.kind); }
  for(const s of sparks){ ctx.globalAlpha=Math.max(0,1-s.t/26); ctx.fillStyle=COLORS[s.color].light;
    ctx.beginPath(); ctx.arc(s.x,s.y,2.5,0,7); ctx.fill(); } ctx.globalAlpha=1;
  if(sortBanner){ const a=Math.min(1,sortBanner.t/16)*Math.min(1,(80-sortBanner.t)/8+1);
    const cc=COLORS[sortBanner.color]; const bw=LW*0.7, bh=Math.max(20,CW*0.42), bx=LX+(LW-bw)/2, by=LY+LH+6;
    ctx.save(); ctx.globalAlpha=Math.max(0,Math.min(1,a));
    rr(bx,by,bw,bh,bh/2); ctx.fillStyle="rgba(20,16,45,.92)"; ctx.fill(); ctx.strokeStyle="#ffe27a"; ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx+bh*0.55,by+bh/2,bh*0.22,0,7); ctx.fillStyle=cc.fill; ctx.fill();
    ctx.fillStyle="#ffe27a"; ctx.font=`800 ${Math.round(bh*0.42)}px system-ui`; ctx.textAlign="left"; ctx.textBaseline="middle";
    ctx.fillText("↻ Разбор колб", bx+bh*0.95, by+bh/2+1); ctx.restore(); }
  ctx.restore();
  ctx.save(); ctx.font="bold 12px system-ui"; ctx.textBaseline="top"; ctx.fillStyle="rgba(255,255,255,.8)";
  ctx.strokeStyle="rgba(0,0,0,.4)"; ctx.lineWidth=2; ctx.strokeText("v20",8,LY+LH+2); ctx.fillText("v20",8,LY+LH+2); ctx.restore();
}

function update(){
  beltPhase+=1.1;
  if(loseShake>0) loseShake--;
  for(const fi in flaskGlow) if(flaskGlow[fi]>0) flaskGlow[fi]--;
  if(sortBanner){ sortBanner.t--; if(sortBanner.t<=0) sortBanner=null; }
  for(let i=packs.length-1;i>=0;i--){ const p=packs[i]; p.t++;
    if(p.t===31) spawnSparks(p.x+p.w/2, p.y+p.h/2, p.color);
    if(p.t>54) packs.splice(i,1); }
  for(let i=sparks.length-1;i>=0;i--){ const s=sparks[i]; s.x+=s.vx; s.y+=s.vy; s.vy+=0.12; s.t++; if(s.t>26) sparks.splice(i,1); }
  pumpEmit();
  tryConsolidate();
  const alive=[];
  for(const p of parts){
    if(p.delay>0){ p.delay--; alive.push(p); continue; }
    let move=p.kind==='sort'?Math.max(5,W*0.016):Math.max(6,W*0.02);
    while(move>0 && p.seg<p.wp.length-1){ const a=p.wp[p.seg], b=p.wp[p.seg+1];
      const dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy)||1, rem=len-(p.i||0);
      if(move<rem){ p.i=(p.i||0)+move; const t=p.i/len; p.pos=[a[0]+dx*t,a[1]+dy*t]; move=0; }
      else { move-=rem; p.seg++; p.i=0; p.pos=b.slice(); } }
    if(p.seg>=p.wp.length-1) land(p); else alive.push(p);
  }
  parts=alive;
  checkWin();
}
function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }

document.addEventListener('touchmove', e=>{ if(drag) e.preventDefault(); }, {passive:false});
window.addEventListener('resize',fit);
document.getElementById('reset').onclick=reset;
document.getElementById('reset2').onclick=reset;
const lr2=document.getElementById('reset3'); if(lr2) lr2.onclick=reset;
window.__lvl={ state:()=>({won,lost, figs:figs.length, q:emitQueue.length, parts:parts.length, packs:packs.length,
    colbs:colbs.map(c=>c.slots.filter(Boolean).map(s=>s.color[0]).join('')||'·')}),
  exitId:(id)=>{ const f=figs.find(x=>x.id===id); if(f) exitFig(f); },
  ids:()=>figs.map(f=>({id:f.id,color:f.color})) };
reset();
