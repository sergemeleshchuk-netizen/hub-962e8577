/* pieces_v5.js — слой «сборка картинки» для drop-words v5.
   Вместо букв шары несут КУСОЧКИ ИЗОБРАЖЕНИЯ (8×8 px). Цель — собрать картинку.
   Картинка: пиксельный мухомор + радуга над ним (32×32 px), рисуется кодом.
   Структура 1:1 как словесный слой v6: РЯД картинки = «слово»/банд (один цвет фигуры),
   подходящий кусок идёт сразу на своё место, прочие — в трей; переполнение трея = проигрыш;
   ряды собираются по порядку (порядок = solver-порядок очистки цветов => проходимо). */

const Pieces = (function(){
  const COLS=4, ROWS=4, PX=16;                 // 4×4 куска по 16×16 => картинка 64×64 (меньше пикселизации)
  const IW=COLS*PX, IH=ROWS*PX;
  const SRC=document.createElement('canvas'); SRC.width=IW; SRC.height=IH;
  const dataCache={};
  let drawn=false;

  function roundRect(x,a,b,w,h,r){ x.beginPath();
    x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r);
    x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }

  function drawSource(){
    if(drawn) return; drawn=true;
    const x=SRC.getContext('2d'); x.imageSmoothingEnabled=false;
    const W=IW, H=IH, cxm=W/2;                 // 64×64
    // небо (лёгкий градиент)
    const sky=x.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#bfe6ff'); sky.addColorStop(1,'#e6f5ff');
    x.fillStyle=sky; x.fillRect(0,0,W,H);
    // облака (наполняют верхние углы)
    x.fillStyle='rgba(255,255,255,.92)';
    function cloud(cx,cy,s){ [[0,0,3],[3.2,-0.8,2.3],[-3.2,0,2.1],[1.4,1,2.5]].forEach(([dx,dy,r])=>{
      x.beginPath(); x.arc(cx+dx*s, cy+dy*s, r*s, 0, 7); x.fill(); }); }
    cloud(11,12,1.5); cloud(53,16,1.7);
    // РАДУГА — зенит по центру верхнего ряда, широкая дуга поверх мухомора
    const rb=['#ff4d4d','#ff8a3d','#ffd633','#3ecb58','#3aa0ff','#4b62f0','#a64dff'];
    x.lineWidth=2.3; x.lineCap='butt';
    rb.forEach((c,i)=>{ x.strokeStyle=c; x.beginPath();
      x.arc(cxm, 66, 60-i*2.4, Math.PI, 2*Math.PI); x.stroke(); });
    // трава
    x.fillStyle='#8ed66a'; x.fillRect(0,H-8,W,8);
    x.fillStyle='#79c258'; x.fillRect(0,H-8,W,2);
    // МУХОМОР (крупнее): ножка
    x.fillStyle='#fdf6ee'; roundRect(x,25,38,14,20,4); x.fill();
    x.fillStyle='#efe2d2'; x.fillRect(25,54,14,3);      // тень у земли
    // шляпка (большой красный купол)
    x.fillStyle='#e23b3b'; x.beginPath();
    x.ellipse(32,36,18,12,0,Math.PI,2*Math.PI); x.closePath(); x.fill();
    x.fillStyle='#c92f2f'; x.fillRect(14,35,36,2);      // тёмный край
    x.fillStyle='#ef6a6a'; x.beginPath();               // блик
    x.ellipse(26,30,7,3.5,0,Math.PI,2*Math.PI); x.closePath(); x.fill();
    // гименофор (подкладка)
    x.fillStyle='#f3ddc9'; x.fillRect(17,36,30,3);
    // белые точки на шляпке
    x.fillStyle='#ffffff';
    [[22,28],[32,25],[41,29],[27,33],[37,33],[44,33],[19,32],[34,31]].forEach(([cx,cy])=>{
      x.beginPath(); x.arc(cx,cy,2.1,0,7); x.fill(); });
  }

  // dataURL куска (масштаб scale, пиксельно) — для лица шара/трея
  function pieceDataURL(i, scale){
    scale=scale||6; const key=i+'@'+scale;
    if(dataCache[key]) return dataCache[key];
    drawSource();
    const c=document.createElement('canvas'); c.width=PX*scale; c.height=PX*scale;
    const x=c.getContext('2d'); x.imageSmoothingEnabled=false;
    const sx=(i%COLS)*PX, sy=Math.floor(i/COLS)*PX;
    x.drawImage(SRC, sx,sy,PX,PX, 0,0,PX*scale,PX*scale);
    return dataCache[key]=c.toDataURL();
  }
  function fullDataURL(scale){
    scale=scale||5; drawSource();
    const c=document.createElement('canvas'); c.width=IW*scale; c.height=IH*scale;
    const x=c.getContext('2d'); x.imageSmoothingEnabled=false;
    x.drawImage(SRC,0,0,IW,IH,0,0,IW*scale,IH*scale);
    return c.toDataURL();
  }

  // ---------- логика сборки ----------
  let traySize=5, bandColors=[], placed=null, tray=[], bandIdx=0;
  let onOverflow=null, onAllDone=null;
  let canvasEl=null, progEl=null, trayEl=null, CELLP=38;

  function bandOf(piece){ return Math.floor(piece/COLS); }     // ряд = банд = индекс цвета в порядке
  function bandComplete(b){
    for(let c=0;c<COLS;c++) if(!placed.has(b*COLS+c)) return false; return true;
  }
  function flush(){
    let moved=true;
    while(moved){ moved=false;
      for(let i=0;i<tray.length;i++){
        if(bandOf(tray[i])===bandIdx){ placed.add(tray[i]); tray.splice(i,1); moved=true; break; }
      }
      if(bandIdx<ROWS && bandComplete(bandIdx)) bandIdx++;
    }
  }

  function init(opts){
    drawSource();
    traySize=opts.traySize; bandColors=opts.bandColors||[];
    placed=new Set(); tray=[]; bandIdx=0;
    onOverflow=opts.onOverflow; onAllDone=opts.onAllDone;
    canvasEl=document.getElementById('picCanvas');
    progEl=document.getElementById('wordProg');
    trayEl=document.getElementById('tray');
    canvasEl.width=COLS*CELLP; canvasEl.height=ROWS*CELLP;
    render();
  }

  function collect(piece){
    if(bandOf(piece)===bandIdx && !placed.has(piece)){ placed.add(piece); }
    else tray.push(piece);
    if(bandIdx<ROWS && bandComplete(bandIdx)){ bandIdx++; flush(); }
    const allDone = bandIdx>=ROWS;
    const overflow = !allDone && tray.length>traySize;
    render(overflow);
    if(allDone) onAllDone && onAllDone();
    else if(overflow) onOverflow && onOverflow();
    return {allDone, overflow};
  }

  function render(overflow){
    // панель сборки
    const x=canvasEl.getContext('2d'); x.imageSmoothingEnabled=false;
    x.clearRect(0,0,canvasEl.width,canvasEl.height);
    for(let i=0;i<COLS*ROWS;i++){
      const cx=(i%COLS)*CELLP, cy=Math.floor(i/COLS)*CELLP;
      if(placed.has(i)){
        const sx=(i%COLS)*PX, sy=Math.floor(i/COLS)*PX;
        x.drawImage(SRC, sx,sy,PX,PX, cx+1,cy+1,CELLP-2,CELLP-2);
      } else {
        x.fillStyle = (bandOf(i)===bandIdx) ? '#eef1ff' : '#f4f5fb';
        x.fillRect(cx+1,cy+1,CELLP-2,CELLP-2);
        x.strokeStyle='#dfe3f5'; x.lineWidth=1; x.strokeRect(cx+1.5,cy+1.5,CELLP-3,CELLP-3);
      }
    }
    // банды-прогресс (точки рядов)
    if(progEl){
      let p='';
      for(let b=0;b<ROWS;b++){
        const done=b<bandIdx, now=b===bandIdx;
        const col=bandColors[b]||'#999';
        const cls = done?'done':(now?'now':'');
        p+='<span class="wtag '+cls+'" style="'+(done?'':('--c:'+col))+'">'+
           (done?'✓':'•')+'</span>';
      }
      progEl.innerHTML=p;
    }
    // трей (миниатюры кусков)
    let t='';
    for(let i=0;i<traySize;i++){
      const pc=tray[i];
      const warn = pc!=null && tray.length>=traySize;
      t+='<span class="tile'+(pc!=null?' has':'')+(overflow?' over':(warn?' warn':''))+'">'+
         (pc!=null?('<img src="'+pieceDataURL(pc,5)+'">'):'')+'</span>';
    }
    trayEl.innerHTML=t;
  }

  return {init, collect, pieceDataURL, fullDataURL, COLS, ROWS};
})();
