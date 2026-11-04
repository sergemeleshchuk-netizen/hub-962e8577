// Block Sort v4 — Block Jam слайд × Loop Sort. Всё на одном canvas:
// сверху колбы (с %), под ними конвейер, ниже поле. Фигуры — цельный силуэт + studs.
// Выход через верхние ворота → фигура рушится на круглые партиклы → едут по конвейеру в колбу.
// Требует LEVEL_SORT2 (level_sort2.js).

const COLORS = {
  red:   {fill:"#e8453c", dark:"#b8302a", lite:"#ff6f66", stud:"#ff8a82"},
  blue:  {fill:"#3f74e0", dark:"#2b53ad", lite:"#6e9bff", stud:"#8fb2ff"},
  green: {fill:"#28b58a", dark:"#1c8c69", lite:"#54d8ac", stud:"#74e6c2"},
  yellow:{fill:"#f2b417", dark:"#c08c08", lite:"#ffce4d", stud:"#ffdd7a"},
};
const L = LEVEL_SORT2, CAP = L.cap;

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');

// геометрия
let CELL, BX, BY, FRAME, FLASK_TOP, FLASK_H, BELT_Y, BELT_H, canvasW, canvasH;
// состояние
let figs, loose, completed, flying, won, beltPhase, raf;

function clone(o){ return JSON.parse(JSON.stringify(o)); }

function reset(){
  figs = clone(L).figs;
  loose = [];        // частички уже «приземлившиеся» в колбы (упорядоченный список цветов)
  completed = [];    // цвета готовых колб (100%, одноцветные)
  flying = [];        // летящие партиклы
  won = false; beltPhase = 0;
  document.getElementById('toast').style.display='none';
  fit();
}

function fit(){
  const w=L.w, h=L.h;
  const maxW=Math.min(window.innerWidth-12, 480);
  const maxH=window.innerHeight-150;
  FLASK_TOP=10; FLASK_H=96; BELT_H=22;
  const topStuff = FLASK_TOP + FLASK_H + 8 + BELT_H + 8;
  CELL=Math.floor(Math.min(maxW/w, (maxH-topStuff)/(h+1.1)));
  CELL=Math.max(44,CELL);
  FRAME=Math.round(CELL*0.5);
  canvasW = w*CELL + 2*FRAME;
  BELT_Y = FLASK_TOP + FLASK_H + 8;
  BY = BELT_Y + BELT_H + 8 + FRAME;
  BX = FRAME;
  canvasH = BY + h*CELL + FRAME;
  cv.width=canvasW; cv.height=canvasH;
  if(!raf) loop();
}

// ---------- модель поля ----------
function occAt(x,y,exceptId){
  for(const f of figs){ if(f.id===exceptId) continue;
    for(const c of f.cells) if(c[0]===x&&c[1]===y) return f.id; }
  return null;
}
function figAtCell(x,y){ for(const f of figs) for(const c of f.cells) if(c[0]===x&&c[1]===y) return f; return null; }
function edgeOpen(e){ return L.exits.includes(e); }

function step(f,d){
  const w=L.w,h=L.h; let off=null, blocked=false;
  for(const c of f.cells){
    const nx=c[0]+d[0], ny=c[1]+d[1];
    if(nx<0) off="left"; else if(nx>=w) off="right";
    else if(ny<0) off="top"; else if(ny>=h) off="bottom";
    else if(occAt(nx,ny,f.id)!==null) blocked=true;
  }
  if(off){ if(blocked) return "block"; return edgeOpen(off)?"exit":"block"; }
  if(blocked) return "block";
  f.cells=f.cells.map(c=>[c[0]+d[0],c[1]+d[1]]);
  return "move";
}

// ---------- выход → партиклы ----------
function exitFig(f){
  const color=f.color, k=f.cells.length;
  // точка разрушения = центр фигуры в пикселях
  let sx=0, sy=0; for(const c of f.cells){ sx+=BX+(c[0]+0.5)*CELL; sy+=BY+(c[1]+0.5)*CELL; }
  sx/=k; sy/=k;
  figs=figs.filter(x=>x!==f);
  spawnBatch(color, k, sx, sy);
}

// колбы-цель: правее всего активная (последний неполный чанк) — туда летят новые
function activeFlaskX(){
  const lay=flaskLayout();
  // ищем последнюю «активную» (не done) колбу
  for(let i=lay.length-1;i>=0;i--){ if(!lay[i].done) return lay[i].cx; }
  return lay.length? lay[lay.length-1].cx : canvasW/2;
}

function spawnBatch(color, k, sx, sy){
  const batch={color, remaining:k};
  const tx=activeFlaskX();
  const beltMid=BELT_Y+BELT_H/2;
  for(let i=0;i<k;i++){
    // путь: вверх к ленте → вправо по ленте к колбе → вниз в колбу
    const path=[ [sx,sy], [sx,beltMid], [tx,beltMid], [tx, FLASK_TOP+FLASK_H-8] ];
    flying.push({color, batch, path, seg:0, t:0, delay:i*7, speed:0.06+Math.random()*0.01, r:CELL*0.13});
  }
}

function landParticle(p){
  loose.push(p.color);
  p.batch.remaining--;
  if(p.batch.remaining<=0){ consolidate(p.batch.color); checkWin(); }
}

function consolidate(C){
  const cs=loose.filter(x=>x===C), rest=loose.filter(x=>x!==C);
  loose=cs.concat(rest);
  while(loose.length>=CAP && loose.slice(0,CAP).every(x=>x===C)){ loose.splice(0,CAP); completed.push(C); }
}
function checkWin(){ if(figs.length===0 && loose.length===0 && flying.length===0){ won=true; document.getElementById('toast').style.display='flex'; } }

// ---------- drag ----------
let drag=null;
function pos(e){ const r=cv.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left,y:t.clientY-r.top}; }
cv.addEventListener('pointerdown',e=>{ const p=pos(e);
  const x=Math.floor((p.x-BX)/CELL), y=Math.floor((p.y-BY)/CELL);
  const f=figAtCell(x,y); if(!f||won) return;
  drag={f,sx:p.x,sy:p.y,axis:null}; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove',e=>{
  if(!drag) return; const p=pos(e); let dx=p.x-drag.sx, dy=p.y-drag.sy;
  if(!drag.axis){ if(Math.abs(dx)<8&&Math.abs(dy)<8) return; drag.axis=Math.abs(dx)>=Math.abs(dy)?'x':'y'; }
  let d,amt; if(drag.axis==='x'){ d=[Math.sign(dx),0]; amt=Math.abs(dx);} else { d=[0,Math.sign(dy)]; amt=Math.abs(dy);}
  if(d[0]===0&&d[1]===0) return;
  const cells=Math.floor(amt/CELL); let moved=0;
  for(let i=0;i<cells;i++){ const r=step(drag.f,d);
    if(r==="move") moved++;
    else if(r==="exit"){ exitFig(drag.f); drag=null; return; }
    else break; }
  if(moved>0){ if(drag.axis==='x') drag.sx+=d[0]*moved*CELL; else drag.sy+=d[1]*moved*CELL; }
});
function endDrag(e){ if(drag){ try{cv.releasePointerCapture(e.pointerId)}catch{} drag=null; } }
cv.addEventListener('pointerup',endDrag); cv.addEventListener('pointercancel',endDrag);

// ---------- геометрия силуэта фигуры ----------
function outline(cells){
  const S=new Set(cells.map(c=>c[0]+","+c[1]));
  const has=(x,y)=>S.has(x+","+y);
  const edges=[];
  for(const [x,y] of cells){
    if(!has(x,y-1)) edges.push([[x,y],[x+1,y]]);
    if(!has(x+1,y)) edges.push([[x+1,y],[x+1,y+1]]);
    if(!has(x,y+1)) edges.push([[x+1,y+1],[x,y+1]]);
    if(!has(x-1,y)) edges.push([[x,y+1],[x,y]]);
  }
  const key=p=>p[0]+","+p[1];
  const map=new Map(); for(const e of edges) map.set(key(e[0]), e[1]);
  const pts=[]; let cur=edges[0][0], guard=0;
  do{ pts.push(cur); cur=map.get(key(cur)); guard++; }while(cur && key(cur)!==key(edges[0][0]) && guard<999);
  return pts;
}
function roundedPoly(P, r, ox, oy){
  ctx.beginPath();
  const n=P.length;
  for(let i=0;i<n;i++){
    const a=P[(i-1+n)%n], b=P[i], c=P[(i+1)%n];
    const ax=BX+a[0]*CELL+ox, ay=BY+a[1]*CELL+oy;
    const bx=BX+b[0]*CELL+ox, by=BY+b[1]*CELL+oy;
    const cx=BX+c[0]*CELL+ox, cy=BY+c[1]*CELL+oy;
    const v1x=bx-ax, v1y=by-ay, l1=Math.hypot(v1x,v1y)||1;
    const v2x=cx-bx, v2y=cy-by, l2=Math.hypot(v2x,v2y)||1;
    const rr=Math.min(r, l1/2, l2/2);
    const p1x=bx-v1x/l1*rr, p1y=by-v1y/l1*rr;
    const p2x=bx+v2x/l2*rr, p2y=by+v2y/l2*rr;
    if(i===0) ctx.moveTo(p1x,p1y); else ctx.lineTo(p1x,p1y);
    ctx.quadraticCurveTo(bx,by,p2x,p2y);
  }
  ctx.closePath();
}
function drawFig(f){
  const c=COLORS[f.color]; const P=outline(f.cells); const r=CELL*0.26;
  // тень-толщина
  roundedPoly(P, r, 0, CELL*0.10); ctx.fillStyle=c.dark; ctx.fill();
  // тело
  roundedPoly(P, r, 0, 0); ctx.fillStyle=c.fill; ctx.fill();
  ctx.lineWidth=Math.max(2,CELL*0.04); ctx.strokeStyle=c.dark; ctx.stroke();
  // верхний блик
  ctx.save(); roundedPoly(P, r, 0, 0); ctx.clip();
  ctx.fillStyle="rgba(255,255,255,.16)";
  for(const [x,y] of f.cells){ ctx.fillRect(BX+x*CELL, BY+y*CELL, CELL, CELL*0.30); }
  ctx.restore();
  // studs (2×2 на клетку)
  ctx.fillStyle=c.stud;
  for(const [x,y] of f.cells){ const px=BX+x*CELL, py=BY+y*CELL, s=CELL, sr=s*0.10;
    for(const ox of [0.32,0.68]) for(const oy of [0.30,0.66]){ ctx.beginPath(); ctx.ellipse(px+s*ox,py+s*oy,sr,sr*0.85,0,0,7); ctx.fill(); } }
}

// ---------- колбы ----------
function flaskLayout(){
  const list=[];
  for(const col of completed) list.push({slots:Array(CAP).fill(col), done:true});
  for(let i=0;i<loose.length;i+=CAP){ const s=loose.slice(i,i+CAP); list.push({slots:s, done:false}); }
  if(list.length===0) list.push({slots:[], done:false, ghost:true});
  const FW=Math.min(40, CELL*0.78), GAP=Math.max(8,CELL*0.20);
  const total=list.length*FW+(list.length-1)*GAP;
  let x=(canvasW-total)/2;
  for(const o of list){ o.x=x; o.w=FW; o.cx=x+FW/2; o.y=FLASK_TOP; o.h=FLASK_H; x+=FW+GAP; }
  return list;
}
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawFlasks(){
  const lay=flaskLayout();
  for(const o of lay){
    const inner=o.w-8, ix=o.x+4, iy=o.y+4, ih=o.h-22; // место под % снизу
    // стекло
    rr(o.x,o.y,o.w,o.h-16,10); ctx.fillStyle="rgba(255,255,255,.07)"; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle="rgba(255,255,255,.22)"; ctx.stroke();
    // заполнение снизу вверх
    const slotH=ih/CAP;
    for(let i=0;i<o.slots.length;i++){ const col=o.slots[i]; if(!col) continue;
      const c=COLORS[col]; const yy=iy+ih-(i+1)*slotH;
      rr(ix, yy+1, inner, slotH-2, 4); ctx.fillStyle=c.fill; ctx.fill();
    }
    // %
    const pct=Math.round((o.ghost?0:o.slots.filter(Boolean).length)/CAP*100);
    ctx.fillStyle=o.done?"#9af7c6":"#cfd6f5"; ctx.font=`700 ${Math.round(o.w*0.34)}px system-ui`;
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(pct+"%", o.cx, o.y+o.h-8);
    if(o.done){ ctx.fillStyle="#9af7c6"; ctx.font=`${Math.round(o.w*0.5)}px system-ui`; ctx.fillText("✓", o.cx, o.y+o.h*0.45); }
  }
}

// ---------- конвейер ----------
function drawBelt(){
  rr(0, BELT_Y, canvasW, BELT_H, 8); ctx.fillStyle="#2c2750"; ctx.fill();
  ctx.save(); rr(0, BELT_Y, canvasW, BELT_H, 8); ctx.clip();
  ctx.strokeStyle="rgba(255,255,255,.10)"; ctx.lineWidth=6;
  for(let x=-BELT_H + (beltPhase%24); x<canvasW+BELT_H; x+=24){
    ctx.beginPath(); ctx.moveTo(x,BELT_Y+BELT_H+4); ctx.lineTo(x+BELT_H+8,BELT_Y-4); ctx.stroke();
  }
  ctx.restore();
}

// ---------- ворота ----------
function drawGates(){
  // верхние ворота во всю ширину поля — светлый проём со стрелками вверх
  const gx=BX, gw=L.w*CELL, gy=BY-FRAME*0.9, gh=FRAME*0.85;
  rr(gx, gy, gw, gh, 8); ctx.fillStyle="#ffedc2"; ctx.fill();
  ctx.fillStyle="#caa15a";
  const n=Math.max(2,Math.round(gw/(CELL)));
  for(let i=0;i<n;i++){ const cx=gx+gw*(i+0.5)/n, cy=gy+gh*0.5, s=gh*0.28;
    ctx.beginPath(); ctx.moveTo(cx-s,cy+s*0.7); ctx.lineTo(cx,cy-s*0.7); ctx.lineTo(cx+s,cy+s*0.7); ctx.closePath(); ctx.fill(); }
}

// ---------- кадр ----------
function draw(){
  ctx.clearRect(0,0,canvasW,canvasH);
  drawFlasks();
  drawBelt();
  // рамка поля
  ctx.fillStyle="#7a4a2e"; rr(BX-FRAME*0.7, BY-FRAME*0.4, L.w*CELL+FRAME*1.4, L.h*CELL+FRAME*1.1, 22); ctx.fill();
  drawGates();
  ctx.fillStyle="#b9824f"; rr(BX, BY, L.w*CELL, L.h*CELL, 10); ctx.fill();
  ctx.strokeStyle="rgba(255,150,90,.28)"; ctx.lineWidth=2;
  for(let i=1;i<L.w;i++){ ctx.beginPath(); ctx.moveTo(BX+i*CELL,BY); ctx.lineTo(BX+i*CELL,BY+L.h*CELL); ctx.stroke(); }
  for(let j=1;j<L.h;j++){ ctx.beginPath(); ctx.moveTo(BX,BY+j*CELL); ctx.lineTo(BX+L.w*CELL,BY+j*CELL); ctx.stroke(); }
  for(const f of figs) drawFig(f);
  // партиклы
  for(const p of flying){ if(p.delay>0) continue;
    const c=COLORS[p.color]; const pt=p.pos||p.path[0];
    ctx.beginPath(); ctx.arc(pt[0],pt[1],p.r,0,7); ctx.fillStyle=c.fill; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle=c.dark; ctx.stroke();
  }
}

function update(){
  beltPhase+=1.4;
  for(let i=flying.length-1;i>=0;i--){ const p=flying[i];
    if(p.delay>0){ p.delay--; continue; }
    const a=p.path[p.seg], b=p.path[p.seg+1];
    if(!b){ flying.splice(i,1); landParticle(p); continue; }
    p.t+=p.speed;
    if(p.t>=1){ p.t=0; p.seg++; p.pos=b.slice();
      if(!p.path[p.seg+1]){ flying.splice(i,1); landParticle(p); }
      continue; }
    p.pos=[ a[0]+(b[0]-a[0])*p.t, a[1]+(b[1]-a[1])*p.t ];
  }
}

function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }

window.addEventListener('resize',()=>{ fit(); });
document.getElementById('reset').onclick=reset;
reset();
