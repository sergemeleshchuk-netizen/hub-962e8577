// Block Sort v5 — Block Jam (плавный драг, цветные ворота) × Loop Sort (колбы + замкнутый
// круговой конвейер + анимация пересортировки). Требует LEVEL_SORT3 (level_sort3.js).
// Слот колбы = null | {color, pending} (pending = частичка ещё летит, слот зарезервирован).

const COLORS = {
  red:   {fill:"#e8453c", dark:"#b8302a", stud:"#ff8a82"},
  blue:  {fill:"#3f74e0", dark:"#2b53ad", stud:"#8fb2ff"},
  green: {fill:"#28b58a", dark:"#1c8c69", stud:"#74e6c2"},
  yellow:{fill:"#f2b417", dark:"#c08c08", stud:"#ffdd7a"},
};
const L = LEVEL_SORT3, CAP = 4, NSLOTS = 6;

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');

let CELL, BX, BY, FRAME, canvasW, canvasH;
let CW, CH, GAP, colbRowX, CY0;
let LX, LY, LW, LH, LR, PERIM;
let figs, colbs, flying, won, beltPhase, raf, pendingCons=[];

function clone(o){ return JSON.parse(JSON.stringify(o)); }

function reset(){
  figs = clone(L).blocks;
  colbs = [];
  flying = [];
  won=false; beltPhase=0; pendingCons=[];
  document.getElementById('toast').style.display='none';
  fit();
}

function fit(){
  const w=L.w, h=L.h;
  const maxW=Math.min(window.innerWidth-12, 470);
  const maxH=window.innerHeight-150;
  CELL=Math.floor(Math.min(maxW/w, maxH/(h+3.1)));
  CELL=Math.max(42,CELL);
  FRAME=Math.round(CELL*0.5);
  CW=CELL*0.6; GAP=CELL*0.18; CH=CELL*1.45;
  const rowW=NSLOTS*CW+(NSLOTS-1)*GAP, M=CELL*0.36;
  LW=rowW+2*M; LH=CH+2*M; LR=CELL*0.42;
  canvasW=Math.max(w*CELL+2*FRAME, LW+8);
  LX=(canvasW-LW)/2; LY=8; colbRowX=LX+M; CY0=LY+M;
  BX=(canvasW-w*CELL)/2; BY=LY+LH+12+FRAME;
  canvasH=BY+h*CELL+FRAME+2;
  cv.width=canvasW; cv.height=canvasH;
  PERIM={ topLen:LW-2*LR, rightLen:LH-2*LR, arc:Math.PI/2*LR };
  PERIM.total=2*PERIM.topLen+2*PERIM.rightLen+4*PERIM.arc;
  if(!raf) loop();
}

// ---------- петля ----------
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
function loopWaypoints(dFrom,dTo){ const {total}=PERIM; const span=((dTo-dFrom)%total+total)%total;
  const n=Math.max(2,Math.round(span/14)); const pts=[]; for(let i=0;i<=n;i++) pts.push(loopPt(dFrom+span*i/n)); return pts; }

// ---------- колбы ----------
function colbCenterX(i){ return colbRowX + i*(CW+GAP) + CW/2; }
function slotPix(ci,si){ return [colbCenterX(ci), CY0+CH-(si+0.5)*(CH/CAP)]; }
function filled(c){ return c.slots.filter(Boolean).length; }            // вкл. pending
function landed(c){ return c.slots.filter(s=>s&&!s.pending).length; }
function colorsIn(c){ return new Set(c.slots.filter(Boolean).map(s=>s.color)); }
function hasPending(c){ return c.slots.some(s=>s&&s.pending); }
function isEmpty(c){ return filled(c)===0; }
function isDone(c){ return landed(c)===CAP && colorsIn(c).size===1; }
function compact(c){ const vals=c.slots.filter(Boolean); for(let i=0;i<CAP;i++) c.slots[i]=vals[i]||null; }

// ---------- выход → партиклы → сортинг ----------
function exitFig(f){
  const C=f.color, k=f.cells.length;
  let cx=0; for(const c of f.cells) cx+=BX+(c[0]+0.5)*CELL; cx/=k;
  figs=figs.filter(x=>x!==f);
  addBatch(C, k, cx);
}
// следующий свободный слот ПОСЛЕДОВАТЕЛЬНО (тупое заполнение по приходу → смешивание на стыках)
function nextSeqSlot(){
  for(let i=0;i<colbs.length;i++){ const si=colbs[i].slots.findIndex(s=>!s); if(si>=0) return [i,si]; }
  colbs.push({slots:[null,null,null,null]}); return [colbs.length-1,0];
}
// следующий слот в ЧИСТО-C (или пустой) колбе — для пересортировки
function nextPureSlot(C){
  for(let i=0;i<colbs.length;i++){ const c=colbs[i]; if(isDone(c)) continue;
    const cols=colorsIn(c); if(cols.size===0 || (cols.size===1&&cols.has(C))){ const si=c.slots.findIndex(s=>!s); if(si>=0) return [i,si]; } }
  colbs.push({slots:[null,null,null,null]}); return [colbs.length-1,0];
}
function spawnP(C, src, ci, si, batch){
  colbs[ci].slots[si]={color:C, pending:true};
  const tgt=slotPix(ci,si), dTo=topEntryD(colbCenterX(ci));
  const dFrom = src.fromBottom? bottomEntryD(src.fx) : src.fromTopD;
  const enter=loopPt(dFrom);
  const wp=[[src.sx,src.sy],[enter[0],enter[1]], ...loopWaypoints(dFrom,dTo), tgt];
  flying.push({color:C, wp, i:0, p:0, speed:CELL*0.17, r:CELL*0.13, delay:flying.length*3, ci, si, batch});
}
// фигура вышла → k частичек последовательно в колбы (микс), потом пересортировка цвета C
function addBatch(C, k, gateX){
  const batch={remaining:k, onDone:()=>pendingCons.push({C, t:34})};   // пауза → видно микс, потом разборка
  for(let i=0;i<k;i++){ const [ci,si]=nextSeqSlot(); spawnP(C, {fromBottom:true, sx:gateX+(i-k/2)*4, sy:BY-2, fx:gateX}, ci, si, batch); }
}
// вынуть C из СМЕШАННЫХ колб → провезти кругом → в чистую C-колбу
function consolidate(C){
  const sources=[];
  for(let j=0;j<colbs.length;j++){ const c=colbs[j]; if(hasPending(c)) continue;
    if(colorsIn(c).size>1 && colorsIn(c).has(C)){
      for(let s=0;s<CAP;s++) if(c.slots[s]&&c.slots[s].color===C){ const pp=slotPix(j,s); sources.push({fromTopD:topEntryD(colbCenterX(j)), sx:pp[0], sy:pp[1]}); c.slots[s]=null; }
      compact(c);
    }
  }
  if(sources.length===0){ checkWin(); return; }
  const batch={remaining:sources.length, onDone:checkWin};
  for(const src of sources){ const [ci,si]=nextPureSlot(C); spawnP(C, src, ci, si, batch); }
}
function landParticle(p){ const sl=colbs[p.ci] && colbs[p.ci].slots[p.si]; if(sl) sl.pending=false; p.batch.remaining--; if(p.batch.remaining<=0 && p.batch.onDone) p.batch.onDone(); }
function checkWin(){ if(figs.length===0 && flying.length===0 && pendingCons.length===0 && colbs.every(c=>isEmpty(c)||isDone(c))){ won=true; document.getElementById('toast').style.display='flex'; } }

// ---------- collision ----------
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

// ---------- плавный драг ----------
let drag=null;
function pos(e){ const r=cv.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left,y:t.clientY-r.top}; }
cv.addEventListener('pointerdown',e=>{ if(won) return; const p=pos(e);
  const x=Math.floor((p.x-BX)/CELL), y=Math.floor((p.y-BY)/CELL); const f=figAtCell(x,y); if(!f) return;
  drag={f,sx:p.x,sy:p.y,axis:null}; f.dragOff=0; f.dragAxis=null; cv.style.cursor='grabbing'; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove',e=>{
  if(!drag) return; const p=pos(e); let dx=p.x-drag.sx, dy=p.y-drag.sy; const f=drag.f;
  if(!drag.axis){ if(Math.abs(dx)<6&&Math.abs(dy)<6) return; drag.axis=Math.abs(dx)>=Math.abs(dy)?'x':'y'; f.dragAxis=drag.axis; }
  const raw=drag.axis==='x'?dx:dy;
  const posDir=drag.axis==='x'?[1,0]:[0,1], negDir=drag.axis==='x'?[-1,0]:[0,-1];
  const posFree=freeCells(f,posDir), negFree=freeCells(f,negDir);
  const canExitPos=exitDir(f,posDir), canExitNeg=exitDir(f,negDir);
  const maxOff=(canExitPos?posFree+1.0:posFree)*CELL;
  const minOff=-(canExitNeg?negFree+1.0:negFree)*CELL;
  const off=Math.max(minOff, Math.min(maxOff, raw));
  if(canExitPos && off>(posFree+0.5)*CELL){ f.cells=f.cells.map(c=>[c[0]+posDir[0]*posFree,c[1]+posDir[1]*posFree]); f.dragOff=0; endDrag(e); exitFig(f); return; }
  if(canExitNeg && off<-(negFree+0.5)*CELL){ f.cells=f.cells.map(c=>[c[0]+negDir[0]*negFree,c[1]+negDir[1]*negFree]); f.dragOff=0; endDrag(e); exitFig(f); return; }
  f.dragOff=off;
});
function endDrag(e){ if(!drag) return; const f=drag.f;
  if(f && f.dragAxis!=null){ const sgn=(f.dragOff||0)>=0?1:-1; const d=f.dragAxis==='x'?[sgn,0]:[0,sgn];
    let k=Math.round(Math.abs(f.dragOff||0)/CELL); k=Math.min(k, freeCells(f,d));
    f.cells=f.cells.map(c=>[c[0]+d[0]*k,c[1]+d[1]*k]); }
  if(f){ f.dragOff=0; f.dragAxis=null; }
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
function drawFig(f){
  const c=COLORS[f.color]; const P=outline(f.cells); const r=CELL*0.26;
  const ox=f.dragAxis==='x'?(f.dragOff||0):0, oy=f.dragAxis==='y'?(f.dragOff||0):0;
  roundedPoly(P,r,ox,oy+CELL*0.10); ctx.fillStyle=c.dark; ctx.fill();
  roundedPoly(P,r,ox,oy); ctx.fillStyle=c.fill; ctx.fill();
  ctx.lineWidth=Math.max(2,CELL*0.04); ctx.strokeStyle=c.dark; ctx.stroke();
  ctx.save(); roundedPoly(P,r,ox,oy); ctx.clip(); ctx.fillStyle="rgba(255,255,255,.15)";
  for(const [x,y] of f.cells) ctx.fillRect(BX+x*CELL+ox, BY+y*CELL+oy, CELL, CELL*0.3); ctx.restore();
  ctx.fillStyle=c.stud;
  for(const [x,y] of f.cells){ const px=BX+x*CELL+ox, py=BY+y*CELL+oy, sR=CELL*0.10;
    for(const a of [0.32,0.68]) for(const b of [0.30,0.66]){ ctx.beginPath(); ctx.ellipse(px+CELL*a,py+CELL*b,sR,sR*0.85,0,0,7); ctx.fill(); } }
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
  for(let i=0;i<colbs.length;i++){ const c=colbs[i]; const x=colbRowX+i*(CW+GAP), y=CY0;
    rr(x,y,CW,CH,8); ctx.fillStyle="rgba(255,255,255,.06)"; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle="rgba(255,255,255,.22)"; ctx.stroke();
    const slotH=(CH-8)/CAP;
    for(let s=0;s<CAP;s++){ const sl=c.slots[s]; if(!sl) continue; const cc=COLORS[sl.color];
      const yy=y+4+(CH-8)-(s+1)*slotH; rr(x+3,yy+1,CW-6,slotH-2,4); ctx.globalAlpha=sl.pending?0.28:1; ctx.fillStyle=cc.fill; ctx.fill(); ctx.globalAlpha=1; }
    const pct=Math.round(landed(c)/CAP*100);
    ctx.fillStyle=isDone(c)?"#9af7c6":"#cfd6f5"; ctx.font=`700 ${Math.round(CW*0.42)}px system-ui`;
    ctx.textAlign="center"; ctx.textBaseline="top"; ctx.fillText(pct+"%", x+CW/2, y+CH+3);
    if(isDone(c)){ ctx.fillStyle="#9af7c6"; ctx.font=`${Math.round(CW*0.6)}px system-ui`; ctx.textBaseline="middle"; ctx.fillText("✓", x+CW/2, y+CH*0.45); }
  }
}
function drawGates(){
  for(const g of L.gates){ const c=COLORS[g.color]; const [a,b]=g.span;
    const gx=BX+a*CELL, gw=(b-a+1)*CELL, gy=BY-FRAME*0.95, gh=FRAME*0.85;
    rr(gx+2,gy,gw-4,gh,7); ctx.fillStyle=c.fill; ctx.fill();
    ctx.fillStyle="rgba(255,255,255,.92)"; const cx=gx+gw/2, cy=gy+gh*0.5, s=gh*0.3;
    ctx.beginPath(); ctx.moveTo(cx-s,cy+s*0.6); ctx.lineTo(cx,cy-s*0.7); ctx.lineTo(cx+s,cy+s*0.6); ctx.closePath(); ctx.fill(); }
}
function draw(){
  ctx.clearRect(0,0,canvasW,canvasH);
  drawLoop(); drawColbs();
  ctx.fillStyle="#7a4a2e"; rr(BX-FRAME*0.7, BY-FRAME*0.35, L.w*CELL+FRAME*1.4, L.h*CELL+FRAME*1.05, 20); ctx.fill();
  drawGates();
  ctx.fillStyle="#b9824f"; rr(BX,BY,L.w*CELL,L.h*CELL,10); ctx.fill();
  ctx.strokeStyle="rgba(255,150,90,.28)"; ctx.lineWidth=2;
  for(let i=1;i<L.w;i++){ ctx.beginPath(); ctx.moveTo(BX+i*CELL,BY); ctx.lineTo(BX+i*CELL,BY+L.h*CELL); ctx.stroke(); }
  for(let j=1;j<L.h;j++){ ctx.beginPath(); ctx.moveTo(BX,BY+j*CELL); ctx.lineTo(BX+L.w*CELL,BY+j*CELL); ctx.stroke(); }
  for(const f of figs) drawFig(f);
  for(const p of flying){ if(p.delay>0) continue; const cc=COLORS[p.color]; const pt=p.pos||p.wp[0];
    ctx.beginPath(); ctx.arc(pt[0],pt[1],p.r,0,7); ctx.fillStyle=cc.fill; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle=cc.dark; ctx.stroke(); }
}
function update(){
  beltPhase+=1.2;
  for(let i=pendingCons.length-1;i>=0;i--){ const pc=pendingCons[i]; pc.t--; if(pc.t<=0){ pendingCons.splice(i,1); consolidate(pc.C); } }
  for(let k=flying.length-1;k>=0;k--){ const p=flying[k]; if(p.delay>0){ p.delay--; continue; }
    let move=p.speed;
    while(move>0 && p.i<p.wp.length-1){ const a=p.wp[p.i], b=p.wp[p.i+1]; const dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy)||1, rem=len-p.p;
      if(move<rem){ p.p+=move; const t=p.p/len; p.pos=[a[0]+dx*t,a[1]+dy*t]; move=0; }
      else { move-=rem; p.i++; p.p=0; p.pos=b.slice(); } }
    if(p.i>=p.wp.length-1){ flying.splice(k,1); landParticle(p); } }
}
function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }

cv.style.cursor='grab';
window.addEventListener('resize',()=>{ fit(); });
document.getElementById('reset').onclick=reset;
reset();
