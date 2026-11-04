// Waffle Sort v8 — ЧИСТЫЙ слайд-пазл на РЕАЛЬНЫХ спрайтах из PSD grid_6x7_polina.
// Фон (рамка+клетки+ворота) = platform_base.png; препятствия и фигуры — отдельные спрайты дизайнера.
// Координаты фигур живут в PSD-пространстве (psd.w×psd.h); всё масштабируется в канвас.
// Механика: тащи фигуру, вывод через ворота СВОЕГО цвета, препятствия неподвижны, победа = поле очищено.

const L = WAFFLE_LEVELS[0];
const PSD = L.psd;                 // {w,h,ox,oy,cellx,celly}
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');

// ---------- загрузка спрайтов ----------
const IMG = {}; let imgReady = 0, imgTotal = 0;
function loadImg(file){ if(IMG[file]) return; imgTotal++; const im=new Image(); im.onload=()=>{imgReady++;}; im.src='psd_ui/'+file; IMG[file]=im; }
loadImg(L.bg);
for(const o of L.obstacles) loadImg(o.sprite);
for(const b of L.blocks) loadImg(b.sprite);

let figs, won, raf, winFx=0;
let S, BX, BY, canvasW, canvasH;      // S = масштаб PSD→канвас; BX/BY — сдвиг доски

function clone(o){ return JSON.parse(JSON.stringify(o)); }
function reset(){
  figs = clone(L).blocks;            // каждая фигура: {id,color,cells,sprite,bbox,org}
  won=false; winFx=0;
  const t=document.getElementById('toast'); if(t) t.style.display='none';
  fit();
}
function fit(){
  const maxW=Math.min(window.innerWidth, 470);
  const maxH=window.innerHeight-96;
  S=Math.min(maxW/PSD.w, maxH/PSD.h);
  canvasW=Math.round(PSD.w*S); canvasH=Math.round(PSD.h*S);
  BX=0; BY=0;
  cv.width=canvasW; cv.height=canvasH;
  cv.style.width=canvasW+'px'; cv.style.height=canvasH+'px';
  if(!raf) loop();
}
// PSD→канвас
function px(x){ return BX + x*S; }
function py(y){ return BY + y*S; }
// клетка (col,row) → PSD-пиксель верх-левый
function cellPsdX(c){ return PSD.ox + c*PSD.cellx; }
function cellPsdY(r){ return PSD.oy + r*PSD.celly; }

// ---------- коллизия / поле (в клетках) ----------
// platform_base_1/2 — деревянные ПРЕПЯТСТВИЯ (стены): блокируют движение, вставать на них нельзя.
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
  // СТРОГО: выход только через ворота СВОЕГО цвета, в их МЕСТЕ и РАЗМЕРЕ — фигура должна целиком попасть в span
  for(const g of L.gates){ if(g.edge!==off||g.color!==f.color) continue; const [a,b]=g.span;
    if(off==="left"||off==="right"){ const rs=cells.map(c=>c[1]); if(Math.min(...rs)>=a&&Math.max(...rs)<=b) return true; }
    else { const cs=cells.map(c=>c[0]); if(Math.min(...cs)>=a&&Math.max(...cs)<=b) return true; } }
  return false;
}
function exitFig(f){ figs=figs.filter(x=>x!==f); checkWin(); }
function checkWin(){ if(!won && figs.length===0){ won=true; winFx=1;
  setTimeout(()=>{ const t=document.getElementById('toast'); if(t) t.style.display='flex'; }, 900); } }

// ---------- свободный драг ----------
let drag=null;
function pos(e){ const r=cv.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left,y:t.clientY-r.top}; }
function shiftCells(f,dx,dy){ f.cells=f.cells.map(c=>[c[0]+dx,c[1]+dy]); }
cv.addEventListener('pointerdown',e=>{ if(won) return; e.preventDefault&&e.preventDefault(); const p=pos(e);
  const x=Math.floor((p.x/S-PSD.ox)/PSD.cellx), y=Math.floor((p.y/S-PSD.oy)/PSD.celly);
  const f=figAtCell(x,y); if(!f) return;
  drag={f,px:p.x,py:p.y}; f.dx=0; f.dy=0; cv.style.cursor='grabbing'; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove',e=>{
  if(!drag) return; e.preventDefault&&e.preventDefault(); const p=pos(e); const f=drag.f; const CELLpx=PSD.cellx*S, CELLpy=PSD.celly*S;
  f.dx=(f.dx||0)+(p.x-drag.px); f.dy=(f.dy||0)+(p.y-drag.py); drag.px=p.x; drag.py=p.y;
  while(f.dx>=CELLpx && freeCells(f,[1,0])>0){ shiftCells(f,1,0); f.dx-=CELLpx; }
  while(f.dx<=-CELLpx && freeCells(f,[-1,0])>0){ shiftCells(f,-1,0); f.dx+=CELLpx; }
  while(f.dy>=CELLpy && freeCells(f,[0,1])>0){ shiftCells(f,0,1); f.dy-=CELLpy; }
  while(f.dy<=-CELLpy && freeCells(f,[0,-1])>0){ shiftCells(f,0,-1); f.dy+=CELLpy; }
  const fr=freeCells(f,[1,0]),fl=freeCells(f,[-1,0]),fd=freeCells(f,[0,1]),fu=freeCells(f,[0,-1]);
  const exR=exitDir(f,[1,0]),exL=exitDir(f,[-1,0]),exD=exitDir(f,[0,1]),exU=exitDir(f,[0,-1]);
  if(exR&&fr===0&&f.dx> 0.5*CELLpx){ endDrag(e); exitFig(f); return; }
  if(exL&&fl===0&&f.dx<-0.5*CELLpx){ endDrag(e); exitFig(f); return; }
  if(exD&&fd===0&&f.dy> 0.5*CELLpy){ endDrag(e); exitFig(f); return; }
  if(exU&&fu===0&&f.dy<-0.5*CELLpy){ endDrag(e); exitFig(f); return; }
  f.dx=Math.min(f.dx, fr>0?CELLpx:(exR?CELLpx:0)); f.dx=Math.max(f.dx, fl>0?-CELLpx:(exL?-CELLpx:0));
  f.dy=Math.min(f.dy, fd>0?CELLpy:(exD?CELLpy:0)); f.dy=Math.max(f.dy, fu>0?-CELLpy:(exU?-CELLpy:0));
});
function endDrag(e){ if(!drag) return; const f=drag.f; const CELLpx=PSD.cellx*S, CELLpy=PSD.celly*S;
  if(f){ if(Math.abs(f.dx||0)>=CELLpx/2){ const d=[(f.dx>0?1:-1),0]; if(freeCells(f,d)>0) shiftCells(f,d[0],d[1]); }
    if(Math.abs(f.dy||0)>=CELLpy/2){ const d=[0,(f.dy>0?1:-1)]; if(freeCells(f,d)>0) shiftCells(f,d[0],d[1]); }
    f.dx=0; f.dy=0; }
  try{cv.releasePointerCapture(e.pointerId)}catch{}
  cv.style.cursor='grab'; drag=null;
}
cv.addEventListener('pointerup',endDrag); cv.addEventListener('pointercancel',endDrag);

// ---------- рендер ----------
function drawSprite(file, bbox, offPxX, offPxY){
  const im=IMG[file]; if(!im||!im.complete||!im.naturalWidth) return;
  const x=px(bbox[0])+(offPxX||0), y=py(bbox[1])+(offPxY||0);
  const w=(bbox[2]-bbox[0])*S, h=(bbox[3]-bbox[1])*S;
  ctx.drawImage(im, x, y, w, h);
}
function draw(){
  ctx.clearRect(0,0,canvasW,canvasH);
  drawSprite(L.bg, L.bgBbox);                       // фон: рамка + клетки + ворота
  for(const o of L.obstacles) drawSprite(o.sprite, o.bbox);   // препятствия
  for(const f of figs){                              // фигуры на их клетках + сдвиг драга
    const curC=Math.min(...f.cells.map(c=>c[0])), curR=Math.min(...f.cells.map(c=>c[1]));
    const offX=(curC-f.org[0])*PSD.cellx*S + (f.dx||0);
    const offY=(curR-f.org[1])*PSD.celly*S + (f.dy||0);
    drawSprite(f.sprite, f.bbox, offX, offY);
  }
  if(won){ ctx.save(); ctx.fillStyle="rgba(0,0,0,"+Math.min(0.35,winFx*0.35)+")"; ctx.fillRect(0,0,canvasW,canvasH); ctx.restore(); if(winFx<1) winFx+=0.04; }
  // метка версии — чтобы было видно, что загружена свежая сборка
  ctx.save(); ctx.font="bold 13px system-ui"; ctx.textAlign="left"; ctx.textBaseline="top";
  ctx.fillStyle="rgba(255,255,255,.85)"; ctx.fillText("v15", 8, 8);
  ctx.strokeStyle="rgba(0,0,0,.4)"; ctx.lineWidth=2; ctx.strokeText("v15", 8, 8); ctx.fillText("v15", 8, 8);
  ctx.restore();
}
function loop(){ draw(); raf=requestAnimationFrame(loop); }

cv.style.cursor='grab';
// на мобиле: не даём странице скроллиться/перехватывать свайп вверх во время драга
document.addEventListener('touchmove', e=>{ if(drag) e.preventDefault(); }, {passive:false});
window.addEventListener('resize',fit);
const rb=document.getElementById('reset'); if(rb) rb.onclick=reset;
const rb2=document.getElementById('reset2'); if(rb2) rb2.onclick=reset;
// тест-хук
window.__lvl={ state:()=>({won, figs:figs.length}),
  exitId:(id)=>{ const f=figs.find(x=>x.id===id); if(f) exitFig(f); },
  ids:()=>figs.map(f=>f.id) };
reset();
