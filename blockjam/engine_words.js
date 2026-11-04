// Block Jam × Слова — общий движок (категория = ключ матча).
// Режим задаётся глобалью MODE: 'plain' (нейтральные плитки) | 'color' (цвет категории).
// Требует заранее объявленные: LEVEL (level_words.js) и MODE.

const CATS = {
  animals:  {name:"ЖИВОТНЫЕ", icon:"🐾", fill:"#f59e2e", dark:"#c9781a", stud:"#ffc06b"},
  fruits:   {name:"ФРУКТЫ",   icon:"🍎", fill:"#e8453c", dark:"#b8302a", stud:"#ff7a70"},
  countries:{name:"СТРАНЫ",   icon:"🌍", fill:"#3f74e0", dark:"#2b53ad", stud:"#7aa2ff"},
  transport:{name:"ТРАНСПОРТ",icon:"🚗", fill:"#28b58a", dark:"#1c8c69", stud:"#5fe0b4"},
};
const NEUTRAL = {fill:"#e7ddc7", dark:"#c3b596", stud:"#fff6e6", text:"#5a4a30"};

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
let state, CELL, OX, OY, PAD;

function clone(o){ return JSON.parse(JSON.stringify(o)); }

function fit(){
  const w=LEVEL.w, h=LEVEL.h;
  const maxW=Math.min(window.innerWidth-16, 560);
  const maxH=window.innerHeight-210;
  PAD=1.15;
  CELL=Math.floor(Math.min(maxW/(w+2*PAD), maxH/(h+2*PAD)));
  CELL=Math.max(54,CELL);
  cv.width=(w+2*PAD)*CELL; cv.height=(h+2*PAD)*CELL;
  OX=PAD*CELL; OY=PAD*CELL; draw();
}

function occAt(x,y,exceptId){
  for(const b of state.blocks){ if(b.id===exceptId) continue;
    for(const c of b.cells) if(c[0]===x&&c[1]===y) return b.id; }
  return null;
}
function blockAtPixel(px,py){
  const x=Math.floor((px-OX)/CELL), y=Math.floor((py-OY)/CELL);
  for(const b of state.blocks) for(const c of b.cells) if(c[0]===x&&c[1]===y) return b;
  return null;
}

// через какие воротца блок может выйти, шагнув в d (категория слова = категория ворот)
function exitEdgeFor(b,d){
  const w=LEVEL.w,h=LEVEL.h; let edge=null;
  if(d[0]<0) edge="left"; else if(d[0]>0) edge="right";
  else if(d[1]<0) edge="top"; else if(d[1]>0) edge="bottom";
  for(const g of LEVEL.gates){
    if(g.edge!==edge || g.color!==b.color) continue;
    const [a,bb]=g.span;
    if(edge==="left"||edge==="right"){
      const rows=b.cells.map(c=>c[1]); if(Math.min(...rows)>=a&&Math.max(...rows)<=bb) return edge;
    } else {
      const cols=b.cells.map(c=>c[0]); if(Math.min(...cols)>=a&&Math.max(...cols)<=bb) return edge;
    }
  }
  return null;
}

function step(b,d){
  const w=LEVEL.w,h=LEVEL.h; let off=false, blocked=false;
  for(const c of b.cells){
    const nx=c[0]+d[0], ny=c[1]+d[1];
    if(nx<0||nx>=w||ny<0||ny>=h) off=true;
    else if(occAt(nx,ny,b.id)!==null) blocked=true;
  }
  if(off){ if(blocked) return "block"; return exitEdgeFor(b,d)?"exit":"block"; }
  if(blocked) return "block";
  b.cells=b.cells.map(c=>[c[0]+d[0],c[1]+d[1]]);
  return "move";
}

// ---- drag ----
let drag=null;
function pos(e){ const r=cv.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left,y:t.clientY-r.top}; }
cv.addEventListener('pointerdown',e=>{ const p=pos(e); const b=blockAtPixel(p.x,p.y); if(!b||state.won) return;
  drag={b,sx:p.x,sy:p.y,axis:null}; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove',e=>{
  if(!drag) return; const p=pos(e); let dx=p.x-drag.sx, dy=p.y-drag.sy;
  if(!drag.axis){ if(Math.abs(dx)<8&&Math.abs(dy)<8) return; drag.axis=Math.abs(dx)>=Math.abs(dy)?'x':'y'; }
  let d,amt; if(drag.axis==='x'){ d=[Math.sign(dx),0]; amt=Math.abs(dx);} else { d=[0,Math.sign(dy)]; amt=Math.abs(dy);}
  if(d[0]===0&&d[1]===0) return;
  const cells=Math.floor(amt/CELL); let moved=0;
  for(let i=0;i<cells;i++){ const r=step(drag.b,d);
    if(r==="move") moved++;
    else if(r==="exit"){ exitBlock(drag.b); drag=null; draw(); checkWin(); return; }
    else break; }
  if(moved>0){ if(drag.axis==='x') drag.sx+=d[0]*moved*CELL; else drag.sy+=d[1]*moved*CELL; draw(); }
});
function endDrag(e){ if(drag){ try{cv.releasePointerCapture(e.pointerId)}catch{} drag=null; } }
cv.addEventListener('pointerup',endDrag); cv.addEventListener('pointercancel',endDrag);
function exitBlock(b){ state.blocks=state.blocks.filter(x=>x!==b); }
function checkWin(){ if(state.blocks.length===0){ state.won=true; document.getElementById('toast').style.display='flex'; } }

// ---- draw ----
function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

function draw(){
  const w=LEVEL.w,h=LEVEL.h; ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle="#7a4a2e"; rr(OX-CELL*0.6,OY-CELL*0.6,w*CELL+CELL*1.2,h*CELL+CELL*1.2,28); ctx.fill();
  for(const g of LEVEL.gates) drawGate(g);
  ctx.fillStyle="#b9824f"; rr(OX,OY,w*CELL,h*CELL,14); ctx.fill();
  ctx.strokeStyle="rgba(255,150,90,.30)"; ctx.lineWidth=2;
  for(let i=1;i<w;i++){ ctx.beginPath(); ctx.moveTo(OX+i*CELL,OY); ctx.lineTo(OX+i*CELL,OY+h*CELL); ctx.stroke(); }
  for(let j=1;j<h;j++){ ctx.beginPath(); ctx.moveTo(OX,OY+j*CELL); ctx.lineTo(OX+w*CELL,OY+j*CELL); ctx.stroke(); }
  for(const b of state.blocks) drawBlock(b);
}

function drawGate(g){
  const w=LEVEL.w,h=LEVEL.h, c=CATS[g.color], t=CELL*0.92, [a,b]=g.span, ext=(b-a+1)*CELL;
  ctx.fillStyle=c.fill; let x,y,gw,gh,lx,ly,vert=false;
  if(g.edge==="left"){ gw=t;gh=ext-8;x=OX-t-6;y=OY+a*CELL+4; vert=true; }
  if(g.edge==="right"){ gw=t;gh=ext-8;x=OX+w*CELL+6;y=OY+a*CELL+4; vert=true; }
  if(g.edge==="top"){ gw=ext-8;gh=t;x=OX+a*CELL+4;y=OY-t-6; }
  if(g.edge==="bottom"){ gw=ext-8;gh=t;x=OX+a*CELL+4;y=OY+h*CELL+6; }
  rr(x,y,gw,gh,12); ctx.fill();
  lx=x+gw/2; ly=y+gh/2; ctx.save(); ctx.translate(lx,ly); if(vert) ctx.rotate(-Math.PI/2);
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.font=`${Math.round(CELL*0.34)}px system-ui`; ctx.fillText(c.icon,0,-CELL*0.14);
  ctx.fillStyle="#fff"; ctx.font=`700 ${Math.round(CELL*0.17)}px system-ui`; ctx.fillText(c.name,0,CELL*0.18);
  ctx.restore();
}

function drawBlock(b){
  const cat=CATS[b.color];
  const skin = (MODE==='color') ? cat : NEUTRAL;
  const xs=b.cells.map(p=>p[0]), ys=b.cells.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const pad=5, px=OX+x0*CELL+pad, py=OY+y0*CELL+pad;
  const bw=(x1-x0+1)*CELL-2*pad, bh=(y1-y0+1)*CELL-2*pad;
  ctx.fillStyle=skin.dark; rr(px,py+bh*0.10,bw,bh*0.93,14); ctx.fill();
  ctx.fillStyle=skin.fill; rr(px,py,bw,bh*0.9,14); ctx.fill();
  ctx.fillStyle=skin.stud; const sr=Math.min(bw,bh)*0.065;
  for(const ox of [0.15,0.85]){ ctx.beginPath(); ctx.ellipse(px+bw*ox,py+bh*0.17,sr,sr*0.8,0,0,7); ctx.fill(); }
  // слово
  const word=b.word||"";
  ctx.fillStyle=(MODE==='color')?"#fff":NEUTRAL.text;
  ctx.textAlign="center"; ctx.textBaseline="middle";
  let fs=Math.min(bh*0.40, bw/(word.length*0.62)); fs=Math.max(13,Math.min(fs,Math.round(CELL*0.42)));
  ctx.font=`800 ${fs}px system-ui`;
  if(MODE==='color'){ ctx.shadowColor="rgba(0,0,0,.18)"; ctx.shadowOffsetY=2; }
  ctx.fillText(word, px+bw/2, py+bh*0.50);
  ctx.shadowColor="transparent"; ctx.shadowOffsetY=0;
}

function init(){ state={blocks:clone(LEVEL).blocks, won:false}; document.getElementById('toast').style.display='none'; fit(); }
const rb=document.getElementById('reset'); if(rb) rb.onclick=init;
window.addEventListener('resize',fit);
init();
