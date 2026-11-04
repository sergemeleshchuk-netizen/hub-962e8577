// Block Sort v17 — как v16, но ФИКС переполнения при РАЗБОРЕ: приёмная чистая колба РЕЦИКЛИТСЯ
// (набрала 4 одинаковых → улетела → снова принимает), поэтому сбор цвета не переполняется, пока
// есть хоть одна пустая/чисто-C колба. Колба сбрасывается сразу (анимация улёта — отдельный визуал).
// Block Sort v16 — как v15, но ФИКС ложного переполнения: вывод фигур СЕРИАЛИЗОВАН.
// Решение фигуры (заполнять/разбирать) принимается только когда лента ПУСТА (предыдущая группа села),
// иначе новая фигура видела «фантомные» резервы летящих частиц и ложно ловила переполнение.
// Block Sort v15 — ТЕКСТУРНЫЕ БЛОКИ (вид sort6) + ПРОСТОЙ сортинг по 2 правилам (по ТЗ юзера):
//  1) Колбы заполняются СЛЕВА НАПРАВО до полной (тупо, без учёта цвета → миксы возникают сами).
//  2) Микс разруливает СЛЕДУЮЩАЯ фигура:
//     (а) СВОЕГО цвета (цвет уже лежит в намешанной колбе) — забирает свой цвет из таких колб и
//         собирает в чистую/пустую колбу;
//     (б) ЧУЖОГО цвета — ничего не забирает, просто заполняет дальше слева направо.
//  3) Частицы ОДНОЙ фигуры летят ГРУППОЙ вместе (а не по одной на колбу).
//  Колба из 4 одинаковых улетает. Нет места под частицу → переполнение = проигрыш.
//  Каждый цвет = своя ФАКТУРА: red=полоски, blue=горошек, green=зигзаг, yellow=колечки.
// Требует LEVEL_SORT6 (level_sort13.js, большое поле 6×9).

const COLORS = {
  red:   {fill:"#e8453c", dark:"#b8302a", light:"#ff8a82"},
  blue:  {fill:"#3f74e0", dark:"#2b53ad", light:"#8fb2ff"},
  green: {fill:"#28b58a", dark:"#1c8c69", light:"#74e6c2"},
  yellow:{fill:"#f2b417", dark:"#c08c08", light:"#ffdd7a"},
};
const TEXTURE = { red:"stripes", blue:"dots", green:"zig", yellow:"rings" };
const L = LEVEL_SORT6, CAP = 4, MAXC = L.maxFlasks || 3;

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const cntEl = document.getElementById('cnt');

let CELL, BX, BY, FRAME, canvasW, canvasH;
let CW, CH, GAP, colbRowX, CY0;
let LX, LY, LW, LH, LR, PERIM;
let figs, colbs, parts, flyingColbs, won, lost, beltPhase, raf, emitQueue;
let gateFlash, loseShake, flaskGlow, sortBanner;

function clone(o){ return JSON.parse(JSON.stringify(o)); }

function reset(){
  figs = clone(L).blocks;
  colbs = Array.from({length:MAXC}, ()=>({slots:[null,null,null,null], resv:[]}));  // всегда 3 колбы
  parts = []; flyingColbs = []; emitQueue = [];
  won=false; lost=false; beltPhase=0; gateFlash={}; loseShake=0;
  flaskGlow={}; sortBanner=null;
  document.getElementById('toast').style.display='none';
  document.getElementById('losetoast').style.display='none';
  fit();
}

function fit(){
  const w=L.w, h=L.h;
  const maxW=Math.min(window.innerWidth-12, 470);
  const maxH=window.innerHeight-150;
  CELL=Math.floor(Math.min(maxW/(w+1.15), maxH/(h+3.1)));   // +1.15: рамка+боковые ворота должны влезть
  CELL=Math.max(36,CELL);
  FRAME=Math.round(CELL*0.5);
  CW=CELL*0.78; GAP=CELL*0.30; CH=CELL*1.5;
  const rowW=MAXC*CW+(MAXC-1)*GAP, M=CELL*0.42;
  LW=Math.max(rowW+2*M, CELL*4.6); LH=CH+2*M; LR=CELL*0.42;
  canvasW=Math.max(w*CELL+2*FRAME, LW+8);
  LX=(canvasW-LW)/2; LY=8; colbRowX=LX+(LW-rowW)/2; CY0=LY+M;
  BX=(canvasW-w*CELL)/2; BY=LY+LH+12+FRAME;
  canvasH=BY+h*CELL+FRAME+2;
  cv.width=canvasW; cv.height=canvasH;
  PERIM={ topLen:LW-2*LR, rightLen:LH-2*LR, arc:Math.PI/2*LR };
  PERIM.total=2*PERIM.topLen+2*PERIM.rightLen+4*PERIM.arc;
  if(!raf) loop();
}

// ---------- петля (конвейер) ----------
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
function filled(c){ return c.slots.filter(Boolean).length; }                 // приземлилось
function totalIn(c){ return filled(c) + c.resv.length; }                     // + летит сюда
function colorsIn(c){ return new Set([...c.slots.filter(Boolean).map(s=>s.color), ...c.resv]); }  // вкл. летящие (для ёмкости/цвета)
function landedColors(c){ return new Set(c.slots.filter(Boolean).map(s=>s.color)); }                // только приземлившиеся
function isMixedLanded(c, C){ const lc=landedColors(c); return lc.size>1 && lc.has(C); }              // C лежит в смешанной колбе
function isEmpty(c){ return totalIn(c)===0; }
function isDone(c){ return filled(c)===CAP && colorsIn(c).size===1; }
function compact(c){ const v=c.slots.filter(Boolean); for(let i=0;i<CAP;i++) c.slots[i]=v[i]||null; }
function usedSlots(){ return colbs.filter(c=>!isEmpty(c)).length; }

// зарезервировать МЕСТО (не слот) в колбе ci + путь по ленте до её горла
function reserveRoute(p, ci){
  colbs[ci].resv.push(p.color);
  const dTo=topEntryD(colbCenterX(ci));
  const wp=[]; const {total}=PERIM; const span=((dTo-p.d)%total+total)%total;
  const n=Math.max(2,Math.round(span/14)); for(let k=0;k<=n;k++) wp.push(loopPt(p.d+span*k/n));
  wp.push(slotPix(ci, CAP-1));                  // общая точка = горло (равное время лёта)
  p.mode='route'; p.wp=wp; p.i=0; p.seg=0; p.ci=ci;   // реальный слот выберется при посадке (снизу)
}

// спавн одной частицы группы: летит к колбе ci, n = индекс в группе (стаггер → летят поездом)
function spawnPart(C, kind, d, ci, n){
  const p={color:C, kind, d, delay:n*4};
  parts.push(p);
  reserveRoute(p, ci);
}
// ---------- вход фигуры (вышла через ворота) ----------
// Фигура встаёт в ОЧЕРЕДЬ. Решение (заполнять/разбирать) принимается в pumpEmit() только когда лента
// ПУСТА — иначе новая фигура видит «фантомные» резервы летящих частиц и ложно ловит переполнение.
function exitFig(f){
  const C=f.color, k=f.cells.length;
  let cx=0; for(const c of f.cells) cx+=BX+(c[0]+0.5)*CELL; cx/=k;
  figs=figs.filter(x=>x!==f);
  for(let gi=0; gi<L.gates.length; gi++) if(L.gates[gi].color===C) gateFlash[gi]=16;
  emitQueue.push({color:C, k, entryD:bottomEntryD(cx)});
}
// подать следующую фигуру из очереди — ТОЛЬКО когда предыдущая группа полностью села (лента пуста)
function pumpEmit(){
  if(lost || parts.length>0 || emitQueue.length===0) return;
  const e=emitQueue.shift();
  const inMix = colbs.some(c=>isMixedLanded(c,e.color));   // Правило 2: C в намешанной колбе?
  if(inMix) emitSort(e.color, e.k, e.entryD); else emitFill(e.color, e.k, e.entryD);
}
// (б) тупое заполнение СЛЕВА НАПРАВО до полной — группа из k частиц, миксы возникают сами
function emitFill(C, k, entryD){
  const cap = colbs.map(c=>CAP-totalIn(c));          // локальный учёт места (резерв растёт по мере спавна)
  for(let n=0;n<k;n++){
    let ci=-1; for(let i=0;i<MAXC;i++) if(cap[i]>0){ ci=i; cap[i]--; break; }
    if(ci<0){ lose(); return; }                      // мест нет → переполнение
    spawnPart(C, 'fill', entryD, ci, n);
  }
}
// (а) СВОЙ цвет: забрать все C из намешанных колб + частицы фигуры → собрать в пустые/чисто-C колбы (слева направо)
function emitSort(C, k, entryD){
  sortBanner={t:90, color:C};
  const sources=[];                                  // точки вылета вынутых частиц (над их колбой)
  for(let i=0;i<MAXC;i++){ const c=colbs[i];
    if(isMixedLanded(c,C)){ flaskGlow[i]=60;
      for(let s=0;s<CAP;s++) if(c.slots[s]&&c.slots[s].color===C){ c.slots[s]=null; sources.push(topEntryD(colbCenterX(i))); }
      compact(c);
    }
  }
  // цель — ТОЛЬКО пустые/чисто-C колбы. Они РЕЦИКЛЯТСЯ: набрала 4 одинаковых → улетает → снова свободна,
  // поэтому одной чистой колбы хватит на любое число C. Переполнение ТОЛЬКО если чистых колб нет вообще.
  const clean = []; for(let i=0;i<MAXC;i++){ const cols=colorsIn(colbs[i]); if(cols.size===0||(cols.size===1&&cols.has(C))) clean.push(i); }
  if(clean.length===0){ lose(); return; }            // некуда собирать C → реальное переполнение
  const h={}; for(const i of clean) h[i]=totalIn(colbs[i]);   // виртуальная высота (лента пуста → resv=0)
  const pick = ()=>{ for(const i of clean){ if(h[i]<CAP){ h[i]++; if(h[i]===CAP) h[i]=0; flaskGlow[i]=60; return i; } } return clean[0]; };
  let n=0;
  for(const sd of sources){ spawnPart(C, 'sort', sd, pick(), n++); }
  for(let j=0;j<k;j++){ spawnPart(C, 'sort', entryD, pick(), n++); }
}
function land(p){
  const c=colbs[p.ci];
  const k=c.resv.indexOf(p.color); if(k>=0) c.resv.splice(k,1);
  const si=c.slots.findIndex(s=>!s); if(si>=0) c.slots[si]={color:p.color};
  checkDone();
}
function checkDone(){
  for(let i=0;i<MAXC;i++){ const c=colbs[i];
    if(isDone(c)){                       // колбу СРАЗУ сбрасываем (анимация улёта — отдельный визуал),
      flyingColbs.push({ci:i, x:colbRowX+i*(CW+GAP), y:CY0, color:c.slots[0].color, t:0});
      colbs[i]={slots:[null,null,null,null], resv:[]};   // → может рециклиться в той же группе разбора
    }
  }
}
function checkWin(){ if(!won && !lost && figs.length===0 && emitQueue.length===0 && parts.length===0 && flyingColbs.length===0 && colbs.every(isEmpty)){
  won=true; document.getElementById('toast').style.display='flex'; } }
function lose(){ if(lost) return; lost=true; loseShake=22; document.getElementById('losetoast').style.display='flex'; }

// ---------- collision / поле ----------
function occAt(x,y,exId){ for(const f of figs){ if(f.id===exId) continue; for(const c of f.cells) if(c[0]===x&&c[1]===y) return f.id; } return null; }
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
    if(off==="left"||off==="right"){ const r=cells.map(c=>c[1]); if(Math.min(...r)>=a&&Math.max(...r)<=b) return true; }
    else { const cc=cells.map(c=>c[0]); if(Math.min(...cc)>=a&&Math.max(...cc)<=b) return true; } }
  return false;
}

// ---------- свободный драг (любое направление) ----------
let drag=null;
function pos(e){ const r=cv.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left,y:t.clientY-r.top}; }
function shiftCells(f,dx,dy){ f.cells=f.cells.map(c=>[c[0]+dx,c[1]+dy]); }
cv.addEventListener('pointerdown',e=>{ if(won||lost) return; const p=pos(e);
  const x=Math.floor((p.x-BX)/CELL), y=Math.floor((p.y-BY)/CELL); const f=figAtCell(x,y); if(!f) return;
  drag={f,px:p.x,py:p.y}; f.dx=0; f.dy=0; cv.style.cursor='grabbing'; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove',e=>{
  if(!drag) return; const p=pos(e); const f=drag.f;
  f.dx=(f.dx||0)+(p.x-drag.px); f.dy=(f.dy||0)+(p.y-drag.py); drag.px=p.x; drag.py=p.y;
  while(f.dx>=CELL && freeCells(f,[1,0])>0){ shiftCells(f,1,0); f.dx-=CELL; }
  while(f.dx<=-CELL && freeCells(f,[-1,0])>0){ shiftCells(f,-1,0); f.dx+=CELL; }
  while(f.dy>=CELL && freeCells(f,[0,1])>0){ shiftCells(f,0,1); f.dy-=CELL; }
  while(f.dy<=-CELL && freeCells(f,[0,-1])>0){ shiftCells(f,0,-1); f.dy+=CELL; }
  const fr=freeCells(f,[1,0]), fl=freeCells(f,[-1,0]), fd=freeCells(f,[0,1]), fu=freeCells(f,[0,-1]);
  const exR=exitDir(f,[1,0]), exL=exitDir(f,[-1,0]), exD=exitDir(f,[0,1]), exU=exitDir(f,[0,-1]);
  if(exR && fr===0 && f.dx> 0.5*CELL){ f.dx=0; endDrag(e); exitFig(f); return; }
  if(exL && fl===0 && f.dx<-0.5*CELL){ f.dx=0; endDrag(e); exitFig(f); return; }
  if(exD && fd===0 && f.dy> 0.5*CELL){ f.dy=0; endDrag(e); exitFig(f); return; }
  if(exU && fu===0 && f.dy<-0.5*CELL){ f.dy=0; endDrag(e); exitFig(f); return; }
  f.dx = Math.min(f.dx, fr>0?CELL:(exR?CELL:0));
  f.dx = Math.max(f.dx, fl>0?-CELL:(exL?-CELL:0));
  f.dy = Math.min(f.dy, fd>0?CELL:(exD?CELL:0));
  f.dy = Math.max(f.dy, fu>0?-CELL:(exU?-CELL:0));
});
function endDrag(e){ if(!drag) return; const f=drag.f;
  if(f){ if(Math.abs(f.dx||0)>=CELL/2){ const d=[(f.dx>0?1:-1),0]; if(freeCells(f,d)>0) shiftCells(f,d[0],d[1]); }
    if(Math.abs(f.dy||0)>=CELL/2){ const d=[0,(f.dy>0?1:-1)]; if(freeCells(f,d)>0) shiftCells(f,d[0],d[1]); }
    f.dx=0; f.dy=0; }
  try{cv.releasePointerCapture(e.pointerId)}catch{}
  cv.style.cursor='grab'; drag=null;
}
cv.addEventListener('pointerup',endDrag); cv.addEventListener('pointercancel',endDrag);

// ---------- силуэт ----------
function outline(cells){
  const S=new Set(cells.map(c=>c[0]+","+c[1])); const has=(x,y)=>S.has(x+","+y); const edges=[];
  for(const [x,y] of cells){
    if(!has(x,y-1)) edges.push([[x,y],[x+1,y]]);
    if(!has(x+1,y)) edges.push([[x+1,y],[x+1,y+1]]);
    if(!has(x,y+1)) edges.push([[x+1,y+1],[x,y+1]]);
    if(!has(x-1,y)) edges.push([[x,y+1],[x,y]]); }
  const key=p=>p[0]+","+p[1], map=new Map(); for(const e of edges) map.set(key(e[0]),e[1]);
  const pts=[]; let cur=edges[0][0], g=0;
  do{ pts.push(cur); cur=map.get(key(cur)); g++; }while(cur&&key(cur)!==key(edges[0][0])&&g<999); return pts;
}
function roundedPoly(P,r,ox,oy){ ctx.beginPath(); const n=P.length;
  for(let i=0;i<n;i++){ const a=P[(i-1+n)%n],b=P[i],c=P[(i+1)%n];
    const ax=BX+a[0]*CELL+ox,ay=BY+a[1]*CELL+oy,bx=BX+b[0]*CELL+ox,by=BY+b[1]*CELL+oy,cx2=BX+c[0]*CELL+ox,cy2=BY+c[1]*CELL+oy;
    const v1x=bx-ax,v1y=by-ay,l1=Math.hypot(v1x,v1y)||1,v2x=cx2-bx,v2y=cy2-by,l2=Math.hypot(v2x,v2y)||1, rr=Math.min(r,l1/2,l2/2);
    if(i===0) ctx.moveTo(bx-v1x/l1*rr,by-v1y/l1*rr); else ctx.lineTo(bx-v1x/l1*rr,by-v1y/l1*rr);
    ctx.quadraticCurveTo(bx,by,bx+v2x/l2*rr,by+v2y/l2*rr); } ctx.closePath(); }

// ---------- ФАКТУРА поверхности (клипуется по силуэту; якорится к фигуре → едет с драгом) ----------
function drawTexture(f, c, ox, oy){
  const xs=f.cells.map(q=>q[0]), ys=f.cells.map(q=>q[1]);
  const x0=BX+Math.min(...xs)*CELL+ox, y0=BY+Math.min(...ys)*CELL+oy;
  const x1=BX+(Math.max(...xs)+1)*CELL+ox, y1=BY+(Math.max(...ys)+1)*CELL+oy;
  const t=TEXTURE[f.color];
  ctx.strokeStyle=c.light; ctx.fillStyle=c.light; ctx.globalAlpha=0.40;
  if(t==="stripes"){                                   // диагональные полоски
    ctx.lineWidth=CELL*0.13; ctx.lineCap="round";
    for(let d=-(y1-y0)-CELL*0.2; d<x1-x0; d+=CELL*0.40){
      ctx.beginPath(); ctx.moveTo(x0+d, y1+CELL*0.1); ctx.lineTo(x0+d+(y1-y0)+CELL*0.2, y0-CELL*0.1); ctx.stroke(); }
  } else if(t==="dots"){                               // горошек в шахматном порядке
    const st=CELL*0.42, r=CELL*0.085;
    let row=0;
    for(let y=y0+st*0.55; y<y1; y+=st, row++)
      for(let x=x0+st*(row%2 ? 0.95 : 0.55); x<x1; x+=st){ ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); }
  } else if(t==="zig"){                                // зигзаг-шеврон
    ctx.lineWidth=CELL*0.09; ctx.lineJoin="round"; ctx.lineCap="round";
    const st=CELL*0.46, a=CELL*0.13, hw=CELL*0.24;
    for(let y=y0+st*0.55; y<y1+a; y+=st){
      ctx.beginPath(); let i=0;
      for(let x=x0-hw; x<=x1+hw; x+=hw, i++){ const yy=y+(i%2?a:-a); i===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy); }
      ctx.stroke(); }
  } else {                                             // rings: колечки в шахматном порядке
    ctx.lineWidth=CELL*0.075;
    const st=CELL*0.52, r=CELL*0.15;
    let row=0;
    for(let y=y0+st*0.55; y<y1; y+=st, row++)
      for(let x=x0+st*(row%2 ? 1.0 : 0.55); x<x1; x+=st){ ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.stroke(); }
  }
  ctx.globalAlpha=1;
}
function drawFig(f){
  const c=COLORS[f.color]; const P=outline(f.cells); const r=CELL*0.26;
  const ox=f.dx||0, oy=f.dy||0;   // свободный драг: оффсет по обеим осям
  // объём: экструзия вниз (тёмная нижняя кромка)
  roundedPoly(P,r,ox,oy+CELL*0.12); ctx.fillStyle=c.dark; ctx.fill();
  // тело
  roundedPoly(P,r,ox,oy); ctx.fillStyle=c.fill; ctx.fill();
  ctx.lineWidth=Math.max(2,CELL*0.045); ctx.strokeStyle=c.dark; ctx.stroke();
  // фактура + мягкая светотень (всё под клипом силуэта)
  ctx.save(); roundedPoly(P,r,ox,oy); ctx.clip();
  drawTexture(f, c, ox, oy);
  const ys=f.cells.map(q=>q[1]);
  const ty0=BY+Math.min(...ys)*CELL+oy, ty1=BY+(Math.max(...ys)+1)*CELL+oy;
  const grad=ctx.createLinearGradient(0,ty0,0,ty1);
  grad.addColorStop(0,"rgba(255,255,255,.22)"); grad.addColorStop(0.30,"rgba(255,255,255,.04)");
  grad.addColorStop(0.85,"rgba(0,0,0,0)");      grad.addColorStop(1,"rgba(0,0,0,.12)");
  ctx.fillStyle=grad;
  const xs=f.cells.map(q=>q[0]);
  ctx.fillRect(BX+Math.min(...xs)*CELL+ox-2, ty0-2, (Math.max(...xs)-Math.min(...xs)+1)*CELL+4, ty1-ty0+4);
  ctx.restore();
}

// ---------- рендер ----------
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawLoop(){
  ctx.lineWidth=CELL*0.34; ctx.strokeStyle="#2c2750"; ctx.lineJoin="round";
  rr(LX,LY,LW,LH,LR); ctx.stroke();
  ctx.save(); rr(LX-CELL*0.3,LY-CELL*0.3,LW+CELL*0.6,LH+CELL*0.6,LR+6); ctx.clip();
  ctx.lineWidth=CELL*0.30; ctx.strokeStyle="rgba(255,255,255,.08)"; const step=18, total=PERIM.total;
  for(let d=(beltPhase%step); d<total; d+=step){ const a=loopPt(d), b=loopPt(d+8); ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke(); }
  ctx.restore();
}
function drawColbs(){
  for(let i=0;i<MAXC;i++){
    const x=colbRowX+i*(CW+GAP), y=CY0; const c=colbs[i];
    const glow=flaskGlow[i]>0;
    if(isEmpty(c) && !glow){                          // пустая колба — тонкий пунктир
      ctx.setLineDash([6,5]); rr(x,y,CW,CH,8);
      ctx.lineWidth=2; ctx.strokeStyle="rgba(255,255,255,.22)"; ctx.stroke(); ctx.setLineDash([]);
      continue;
    }
    if(glow){ ctx.save(); ctx.shadowColor="#ffe27a"; ctx.shadowBlur=18; rr(x,y,CW,CH,8); ctx.strokeStyle="#ffe27a"; ctx.lineWidth=3; ctx.stroke(); ctx.restore(); }
    rr(x,y,CW,CH,8); ctx.fillStyle="rgba(255,255,255,.06)"; ctx.fill();
    ctx.lineWidth=glow?3:2; ctx.strokeStyle=glow?"#ffe27a":"rgba(255,255,255,.30)"; ctx.stroke();
    const slotH=(CH-8)/CAP;
    for(let s=0;s<CAP;s++){ const sl=c.slots[s]; if(!sl) continue; const cc=COLORS[sl.color];
      const yy=y+4+(CH-8)-(s+1)*slotH; rr(x+3,yy+1,CW-6,slotH-2,4); ctx.fillStyle=cc.fill; ctx.fill(); }
    if(isDone(c)){ ctx.fillStyle="#9af7c6"; ctx.font=`${Math.round(CW*0.5)}px system-ui`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("✓", x+CW/2, y+CH*0.45); }
  }
  for(const fc of flyingColbs){
    const t=fc.t/28, cc=COLORS[fc.color];
    const yy=fc.y - t*t*CELL*3.2, sc=1+t*0.25;
    ctx.save(); ctx.globalAlpha=Math.max(0,1-t);
    ctx.translate(fc.x+CW/2, yy+CH/2); ctx.scale(sc,sc); ctx.translate(-(fc.x+CW/2), -(yy+CH/2));
    rr(fc.x,yy,CW,CH,8); ctx.fillStyle=cc.fill; ctx.fill();
    ctx.lineWidth=3; ctx.strokeStyle=cc.dark; ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,.9)"; ctx.font=`${Math.round(CW*0.5)}px system-ui`;
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("✓", fc.x+CW/2, yy+CH/2);
    ctx.restore();
  }
}
function drawGates(){
  for(let gi=0; gi<L.gates.length; gi++){ const g=L.gates[gi]; const c=COLORS[g.color]; const [a,b]=g.span;
    const fl=gateFlash[gi]>0;
    let gx,gy,gw,gh,vert=false;
    if(g.edge==="top"){ gx=BX+a*CELL; gw=(b-a+1)*CELL; gy=BY-FRAME*0.95; gh=FRAME*0.85; }
    else if(g.edge==="bottom"){ gx=BX+a*CELL; gw=(b-a+1)*CELL; gy=BY+L.h*CELL+FRAME*0.10; gh=FRAME*0.85; }
    else { vert=true; gy=BY+a*CELL; gh=(b-a+1)*CELL; gw=FRAME*0.85;
           gx = g.edge==="left" ? BX-FRAME*0.95 : BX+L.w*CELL+FRAME*0.10; }
    rr(gx+2,gy+ (vert?2:0),gw-(vert?0:4),gh-(vert?4:0),7);
    ctx.fillStyle=c.fill; if(fl){ ctx.save(); ctx.shadowColor=c.light; ctx.shadowBlur=14; }
    ctx.fill(); if(fl) ctx.restore();
    ctx.fillStyle="rgba(255,255,255,.92)";
    const cx=gx+gw/2, cy=gy+gh/2, s=Math.min(gw,gh)*0.3;
    ctx.beginPath();
    if(g.edge==="top"){ ctx.moveTo(cx-s,cy+s*0.6); ctx.lineTo(cx,cy-s*0.7); ctx.lineTo(cx+s,cy+s*0.6); }
    else if(g.edge==="bottom"){ ctx.moveTo(cx-s,cy-s*0.6); ctx.lineTo(cx,cy+s*0.7); ctx.lineTo(cx+s,cy-s*0.6); }
    else if(g.edge==="left"){ ctx.moveTo(cx+s*0.6,cy-s); ctx.lineTo(cx-s*0.7,cy); ctx.lineTo(cx+s*0.6,cy+s); }
    else { ctx.moveTo(cx-s*0.6,cy-s); ctx.lineTo(cx+s*0.7,cy); ctx.lineTo(cx-s*0.6,cy+s); }
    ctx.closePath(); ctx.fill();
  }
}
function draw(){
  ctx.save();
  if(loseShake>0){ const a=loseShake/22*5; ctx.translate((Math.sin(loseShake*2.1))*a, (Math.cos(loseShake*1.7))*a); }
  ctx.clearRect(-8,-8,canvasW+16,canvasH+16);
  drawLoop(); drawColbs();
  ctx.fillStyle="#7a4a2e"; rr(BX-FRAME*0.7, BY-FRAME*0.35, L.w*CELL+FRAME*1.4, L.h*CELL+FRAME*1.05, 20); ctx.fill();
  drawGates();
  ctx.fillStyle="#b9824f"; rr(BX,BY,L.w*CELL,L.h*CELL,10); ctx.fill();
  ctx.strokeStyle="rgba(255,150,90,.28)"; ctx.lineWidth=2;
  for(let i=1;i<L.w;i++){ ctx.beginPath(); ctx.moveTo(BX+i*CELL,BY); ctx.lineTo(BX+i*CELL,BY+L.h*CELL); ctx.stroke(); }
  for(let j=1;j<L.h;j++){ ctx.beginPath(); ctx.moveTo(BX,BY+j*CELL); ctx.lineTo(BX+L.w*CELL,BY+j*CELL); ctx.stroke(); }
  for(const f of figs) drawFig(f);
  for(const p of parts){ const cc=COLORS[p.color]; const pt=p.pos||loopPt(p.d); const rad=CELL*(p.kind==='sort'?0.16:0.13);
    if(p.kind==='sort'){ ctx.save(); ctx.shadowColor="#ffe27a"; ctx.shadowBlur=10; }
    ctx.beginPath(); ctx.arc(pt[0],pt[1],rad,0,7); ctx.fillStyle=cc.fill; ctx.fill();
    ctx.lineWidth=p.kind==='sort'?3:2; ctx.strokeStyle=p.kind==='sort'?"#ffe27a":cc.dark; ctx.stroke();
    if(p.kind==='sort') ctx.restore(); }
  if(sortBanner){ const a=Math.min(1, sortBanner.t/20)*Math.min(1,(90-sortBanner.t)/10+1);
    const cc=COLORS[sortBanner.color]; const bw=LW*0.62, bh=CELL*0.5, bx=LX+(LW-bw)/2, by=LY+LH+CELL*0.55;
    ctx.save(); ctx.globalAlpha=Math.max(0,Math.min(1,a));
    rr(bx,by,bw,bh,bh/2); ctx.fillStyle="rgba(20,16,45,.92)"; ctx.fill();
    ctx.strokeStyle="#ffe27a"; ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath(); ctx.arc(bx+bh*0.55,by+bh/2,bh*0.22,0,7); ctx.fillStyle=cc.fill; ctx.fill();
    ctx.fillStyle="#ffe27a"; ctx.font=`800 ${Math.round(bh*0.42)}px system-ui`; ctx.textAlign="left"; ctx.textBaseline="middle";
    ctx.fillText("↻ Сортировка колб", bx+bh*0.95, by+bh/2+1); ctx.restore(); }
  ctx.restore();
}
function update(){
  beltPhase+=1.2;
  if(loseShake>0) loseShake--;
  for(let i=flyingColbs.length-1;i>=0;i--){ flyingColbs[i].t++; if(flyingColbs[i].t>28) flyingColbs.splice(i,1); }
  for(const gi in gateFlash) if(gateFlash[gi]>0) gateFlash[gi]--;
  for(const fi in flaskGlow) if(flaskGlow[fi]>0) flaskGlow[fi]--;
  if(sortBanner){ sortBanner.t--; if(sortBanner.t<=0) sortBanner=null; }
  pumpEmit();   // подать следующую фигуру из очереди, когда лента пуста (на ОСевшем состоянии)
  // частицы летят ГРУППОЙ к своим колбам (delay = лёгкий стаггер «поездом»), садятся по прилёту
  const survivors=[];
  for(const p of parts){
    if(p.delay>0){ p.delay--; survivors.push(p); continue; }
    let move=p.kind==='sort'?CELL*0.16:CELL*0.20;
    while(move>0 && p.seg<p.wp.length-1){ const a=p.wp[p.seg], b=p.wp[p.seg+1];
      const dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy)||1, rem=len-(p.i||0);
      if(move<rem){ p.i=(p.i||0)+move; const t=p.i/len; p.pos=[a[0]+dx*t,a[1]+dy*t]; move=0; }
      else { move-=rem; p.seg++; p.i=0; p.pos=b.slice(); } }
    if(p.seg>=p.wp.length-1) land(p); else survivors.push(p);
  }
  parts=survivors;
  checkWin();
  if(cntEl) cntEl.textContent=`Колбы ${usedSlots()}/${MAXC}`;
}
function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }

cv.style.cursor='grab';
window.addEventListener('resize',()=>{ fit(); });
document.getElementById('reset').onclick=reset;
document.getElementById('reset2').onclick=reset;
reset();
