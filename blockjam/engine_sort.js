// Block Sort — движок v3 (Block Jam слайд × Loop Sort контейнеры).
// Поле на canvas (#cv), контейнеры на DOM (#containers). Требует LEVEL_SORT (level_sort.js).

const COLORS = {
  red:   {fill:"#e8453c", dark:"#b8302a", stud:"#ff7a70"},
  blue:  {fill:"#3f74e0", dark:"#2b53ad", stud:"#7aa2ff"},
  green: {fill:"#28b58a", dark:"#1c8c69", stud:"#5fe0b4"},
  yellow:{fill:"#f2b417", dark:"#c08c08", stud:"#ffd45a"},
};
const L = LEVEL_SORT, CAP = L.cap;

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
let CELL, OX, OY, PAD;
let figs, loose, completed, won;

function clone(o){ return JSON.parse(JSON.stringify(o)); }

function reset(){
  figs = clone(L).figs;
  loose = [];        // упорядоченные частички (цвета) на «конвейере», ещё не в готовом контейнере
  completed = [];    // цвета готовых (одноцветных) контейнеров
  won = false;
  document.getElementById('toast').style.display='none';
  fit(); renderContainers();
}

function fit(){
  const w=L.w, h=L.h;
  const maxW=Math.min(window.innerWidth-16, 520);
  const maxH=window.innerHeight-330;
  PAD=1.0;
  CELL=Math.floor(Math.min(maxW/(w+2*PAD), maxH/(h+2*PAD)));
  CELL=Math.max(48,CELL);
  cv.width=(w+2*PAD)*CELL; cv.height=(h+2*PAD)*CELL;
  OX=PAD*CELL; OY=PAD*CELL; draw();
}

// ---- сетка/коллизии ----
function occAt(x,y,exceptId){
  for(const f of figs){ if(f.id===exceptId) continue;
    for(const c of f.cells) if(c[0]===x&&c[1]===y) return f.id; }
  return null;
}
function figAtPixel(px,py){
  const x=Math.floor((px-OX)/CELL), y=Math.floor((py-OY)/CELL);
  for(const f of figs) for(const c of f.cells) if(c[0]===x&&c[1]===y) return f;
  return null;
}
function edgeOpen(edge){ return L.exits.includes(edge); }

// шаг фигуры на 1 в d: "move" | "exit" | "block"
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

// ---- выход фигуры → частички → сортинг ----
function exitFig(f){
  const k=f.cells.length, color=f.color;
  figs=figs.filter(x=>x!==f);
  for(let i=0;i<k;i++) loose.push(color);   // заливаем частички
  consolidate(color);                        // Loop Sort: сводим этот цвет, лопаем четвёрки
  draw();                                     // обновить поле (убрать выехавшую фигуру)
  renderContainers();
  checkWin();
}

// при выводе цвета C: gather всех C в начало, лопаем полные четвёрки C как готовые контейнеры
function consolidate(C){
  const cs = loose.filter(x=>x===C);
  const rest = loose.filter(x=>x!==C);
  loose = cs.concat(rest);
  while(loose.length>=CAP && loose.slice(0,CAP).every(x=>x===C)){
    loose.splice(0,CAP);
    completed.push(C);
  }
}

function checkWin(){
  if(figs.length===0 && loose.length===0){
    won=true; document.getElementById('toast').style.display='flex';
  }
}

// ---- drag ----
let drag=null;
function pos(e){ const r=cv.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left,y:t.clientY-r.top}; }
cv.addEventListener('pointerdown',e=>{ const p=pos(e); const f=figAtPixel(p.x,p.y); if(!f||won) return;
  drag={f,sx:p.x,sy:p.y,axis:null}; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove',e=>{
  if(!drag) return; const p=pos(e); let dx=p.x-drag.sx, dy=p.y-drag.sy;
  if(!drag.axis){ if(Math.abs(dx)<8&&Math.abs(dy)<8) return; drag.axis=Math.abs(dx)>=Math.abs(dy)?'x':'y'; }
  let d,amt; if(drag.axis==='x'){ d=[Math.sign(dx),0]; amt=Math.abs(dx);} else { d=[0,Math.sign(dy)]; amt=Math.abs(dy);}
  if(d[0]===0&&d[1]===0) return;
  const cells=Math.floor(amt/CELL); let moved=0;
  for(let i=0;i<cells;i++){ const r=step(drag.f,d);
    if(r==="move") moved++;
    else if(r==="exit"){ exitFig(drag.f); drag=null; draw(); return; }
    else break; }
  if(moved>0){ if(drag.axis==='x') drag.sx+=d[0]*moved*CELL; else drag.sy+=d[1]*moved*CELL; draw(); }
});
function endDrag(e){ if(drag){ try{cv.releasePointerCapture(e.pointerId)}catch{} drag=null; } }
cv.addEventListener('pointerup',endDrag); cv.addEventListener('pointercancel',endDrag);

// ---- рендер поля ----
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function draw(){
  const w=L.w,h=L.h; ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle="#7a4a2e"; rr(OX-CELL*0.55,OY-CELL*0.55,w*CELL+CELL*1.1,h*CELL+CELL*1.1,26); ctx.fill();
  // открытые края — светлые «проёмы»
  ctx.fillStyle="rgba(255,240,200,.9)";
  if(edgeOpen("bottom")) rr(OX, OY+h*CELL+4, w*CELL, CELL*0.4, 8), ctx.fill();
  if(edgeOpen("right"))  rr(OX+w*CELL+4, OY, CELL*0.4, h*CELL, 8), ctx.fill();
  if(edgeOpen("top"))    rr(OX, OY-CELL*0.4-4, w*CELL, CELL*0.4, 8), ctx.fill();
  if(edgeOpen("left"))   rr(OX-CELL*0.4-4, OY, CELL*0.4, h*CELL, 8), ctx.fill();
  // дно
  ctx.fillStyle="#b9824f"; rr(OX,OY,w*CELL,h*CELL,12); ctx.fill();
  ctx.strokeStyle="rgba(255,150,90,.30)"; ctx.lineWidth=2;
  for(let i=1;i<w;i++){ ctx.beginPath(); ctx.moveTo(OX+i*CELL,OY); ctx.lineTo(OX+i*CELL,OY+h*CELL); ctx.stroke(); }
  for(let j=1;j<h;j++){ ctx.beginPath(); ctx.moveTo(OX,OY+j*CELL); ctx.lineTo(OX+w*CELL,OY+j*CELL); ctx.stroke(); }
  for(const f of figs) drawFig(f);
}
function drawFig(f){
  const c=COLORS[f.color]; const pad=4;
  for(const [x,y] of f.cells){
    const px=OX+x*CELL+pad, py=OY+y*CELL+pad, s=CELL-2*pad;
    ctx.fillStyle=c.dark; rr(px,py+s*0.12,s,s*0.92,11); ctx.fill();
    ctx.fillStyle=c.fill; rr(px,py,s,s*0.9,11); ctx.fill();
    ctx.fillStyle=c.stud; const sr=s*0.15;
    for(const ox of [0.3,0.7]) for(const oy of [0.28,0.62]){ ctx.beginPath(); ctx.ellipse(px+s*ox,py+s*oy,sr,sr*0.8,0,0,7); ctx.fill(); }
  }
}

// ---- рендер контейнеров (DOM) ----
function renderContainers(){
  const host=document.getElementById('containers'); host.innerHTML="";
  // счётчик готовых
  const sorted=document.getElementById('sorted');
  if(sorted) sorted.textContent="Отсортировано: "+completed.length;
  // готовые контейнеры (одноцветные, с галочкой)
  for(const col of completed){ host.appendChild(bin(Array(CAP).fill(col), true)); }
  // активные: режем loose на четвёрки
  for(let i=0;i<loose.length;i+=CAP){
    const slots=loose.slice(i,i+CAP);
    while(slots.length<CAP) slots.push(null);
    host.appendChild(bin(slots, false));
  }
  if(completed.length===0 && loose.length===0){
    const e=document.createElement('div'); e.className="empty"; e.textContent="контейнеры появятся, когда фигура выедет →";
    host.appendChild(e);
  }
}
function bin(slots, done){
  const d=document.createElement('div'); d.className="bin"+(done?" done":"");
  for(const s of slots){
    const p=document.createElement('div'); p.className="slot";
    if(s){ p.style.background=COLORS[s].fill; p.style.boxShadow="inset 0 -3px 0 "+COLORS[s].dark; }
    d.appendChild(p);
  }
  if(done){ const ch=document.createElement('div'); ch.className="check"; ch.textContent="✓"; d.appendChild(ch); }
  return d;
}

window.addEventListener('resize',()=>{ fit(); });
document.getElementById('reset').onclick=reset;
reset();
