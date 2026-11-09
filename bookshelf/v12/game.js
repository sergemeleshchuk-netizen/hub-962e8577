/* =========================================================
   Bookshelf Art Puzzle — v4
   Core (v2): books swap places; matching neighbours glue into blocks that move as one.
   v4: soft-3D UI, move limit + near-fail, 100-level curve, Locked/Tied/Hidden modifiers,
       boosters as the main sink, coins, lives, gallery, shop (mock IAP), daily, league.
   ========================================================= */
'use strict';
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const app=$('#app');
const ICO={peek:'ui/i_peek.png?v=binoculars-20261027',coin:'ui/i_coin.png',heart:'ui/i_heart.png',lens:'ui/i_lens.png',glove:'ui/i_hand.png',freeze:'ui/i_freeze.png',key:'ui/i_key.png',brush:'ui/i_brush.png',bookmark:'ui/i_bookmark.png?v=pu-20261030',corners:'ui/i_fixed_corners.png?v=pu-20261030',center:'ui/i_center_five.png?v=pu-20261030',glue:'ui/i_glue.png',books:'ui/i_books.png'};
const SVG={
 gear:'<svg viewBox="0 0 32 32"><path d="M13.3 2h5.4l.8 3.6 2.6 1.1 3.1-2 3.8 3.8-2 3.1 1.1 2.6 3.6.8v5.4l-3.6.8-1.1 2.6 2 3.1-3.8 3.8-3.1-2-2.6 1.1-.8 3.6h-5.4l-.8-3.6-2.6-1.1-3.1 2-3.8-3.8 2-3.1-1.1-2.6L2 18.7v-5.4l3.6-.8 1.1-2.6-2-3.1 3.8-3.8 3.1 2 2.6-1.1z" fill="#8A583B"/><circle cx="16" cy="16" r="5" fill="#FFF4DB"/></svg>',
 pause:'<svg viewBox="0 0 32 32"><rect x="7" y="6" width="7" height="20" rx="2.5" fill="#8A583B"/><rect x="18" y="6" width="7" height="20" rx="2.5" fill="#8A583B"/></svg>',
 x:'<svg viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
 eye:'<svg viewBox="0 0 20 20"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" fill="#fff"/><circle cx="10" cy="10" r="3.2" fill="#2156B8"/></svg>',
 tick:'<svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 star:'<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.9l-6.4 3.5 1.4-7.1-5.3-5 7.2-.9z" fill="#FFC548" stroke="#A86A12" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 5l1.8 3.9 3.6.5" fill="none" stroke="#FFF4C0" stroke-width="1.4" stroke-linecap="round"/></svg>',
 pad:'<svg viewBox="0 0 32 36"><path d="M9 15v-4a7 7 0 0114 0v4" fill="none" stroke="#8B95A1" stroke-width="4.5"/><path d="M9 15v-4a7 7 0 0114 0v4" fill="none" stroke="#DDE3EA" stroke-width="2"/><rect x="4" y="14" width="24" height="20" rx="6" fill="#F2B53A" stroke="#8A560E" stroke-width="2"/><rect x="6.5" y="16" width="19" height="5" rx="2.5" fill="#FFE59A"/><circle cx="16" cy="25" r="3" fill="#6B3D1C"/><rect x="14.8" y="25" width="2.4" height="5" rx="1" fill="#6B3D1C"/></svg>',
 trophy:'<svg viewBox="0 0 48 48"><path d="M14 8h20v10a10 10 0 01-20 0z" fill="#FFC548" stroke="#A86A12" stroke-width="2.5"/><path d="M14 11H7a7 7 0 007 9M34 11h7a7 7 0 01-7 9" fill="none" stroke="#A86A12" stroke-width="3"/><path d="M18 10h4v12c-3-1-4-4-4-6z" fill="#FFF0B0" opacity=".8"/><rect x="21" y="27" width="6" height="7" fill="#D99120"/><rect x="14" y="34" width="20" height="8" rx="3" fill="#8A583B" stroke="#5A3418" stroke-width="2"/><rect x="18" y="36.5" width="12" height="3" rx="1.5" fill="#FFC548"/></svg>',
 gift:'<svg viewBox="0 0 48 48"><rect x="7" y="18" width="34" height="24" rx="5" fill="#FF735F" stroke="#A8301F" stroke-width="2.5"/><rect x="5" y="12" width="38" height="10" rx="4" fill="#FF8E7D" stroke="#A8301F" stroke-width="2.5"/><rect x="20" y="12" width="8" height="30" fill="#FFC548" stroke="#A86A12" stroke-width="2"/><path d="M24 12c-4-8-13-8-11-2 1 3 7 2 11 2zm0 0c4-8 13-8 11-2-1 3-7 2-11 2z" fill="#FFC548" stroke="#A86A12" stroke-width="2"/><rect x="9" y="14" width="9" height="3" rx="1.5" fill="#fff" opacity=".5"/></svg>',
 frame:'<svg viewBox="0 0 48 48"><rect x="4" y="6" width="40" height="36" rx="5" fill="#FFC548" stroke="#A86A12" stroke-width="2.5"/><rect x="10" y="12" width="28" height="24" rx="2" fill="#69CBF5"/><path d="M10 31l8-9 6 6 5-4 9 8v4H10z" fill="#53D96B"/><circle cx="30" cy="18" r="3.5" fill="#FFF4DB"/><rect x="7" y="8" width="16" height="2.5" rx="1.2" fill="#fff" opacity=".6"/></svg>',
 ribbon:'<svg viewBox="0 0 24 24"><rect x="2" y="9" width="20" height="6" rx="2" fill="#C35BE0"/><circle cx="12" cy="12" r="4.5" fill="#E58BFF" stroke="#7E2299" stroke-width="1.5"/></svg>',
 q:'<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="3" fill="#7A4FD3"/><text x="12" y="17" font-size="13" font-weight="800" text-anchor="middle" fill="#FFC548" font-family="Fredoka,sans-serif">?</text></svg>',
 hand:'<img class="handImg" src="ui/hand_A.webp" alt="">',
};
const BOOST={
 peek:{name:'Art Peek',price:100,desc:'Shows the finished painting for 5 seconds.',unlock:3,gift:3},
 lens:{name:'Hint Lens',price:150,desc:'Shows the best move on the shelf.',unlock:4,gift:2},
 glove:{name:'Magic Hand',price:300,desc:'Tap the shelf: the free books in that area go into place (2x2, or 3x2 on Super Hard levels). No move spent.',unlock:7,gift:2},
 key:{name:'Time Freeze',price:450,desc:'For 5 seconds your moves are free. Move as fast as you can!',unlock:6,gift:2,img:'freeze'},
 brush:{name:'Art Brush',price:650,desc:'Pick a shelf — the whole shelf gets painted into place. No moves spent.',unlock:9,gift:1},
 bookmark:{name:'Additional Moves',price:250,desc:'Start the level with +3 moves.',unlock:10,gift:1,pre:1,img:'bookmark'},
 corners:{name:'Fixed Corners',price:400,desc:'Start with all four corner books in place and pinned.',unlock:11,gift:1,pre:1,img:'corners'},
 center:{name:'Center Five',price:700,desc:'Start with five center books in place and pinned.',unlock:14,gift:1,pre:1,img:'center'},
 glue:{name:'Starter Glue',price:400,desc:'Start with one pair already glued.',unlock:11,gift:1,pre:1,img:'glue'},
 shelf:{name:'Golden Shelf',price:700,desc:'Start with +3 moves and a free Hint Lens.',unlock:14,gift:1,pre:1,img:'books'},
};
const IN_LEVEL=['peek','lens','key','glove','brush'],PRE=['bookmark','corners','center'];
/* v12 unlock config (patch_v12_unlock_config) */
(()=>{const C=window.BS_CFG;if(!C)return;
  const ap=r=>{const B=BOOST[r.playableKey];if(!B)return;if(r.name)B.name=r.name;if(r.description)B.desc=r.description;
    if(r.priceCoins!=null)B.price=r.priceCoins;if(r.initialCount!=null)B.gift=r.initialCount;if(r.unlockLevel!=null)B.unlock=r.unlockLevel};
  C.boosters.forEach(ap);C.powerUps.forEach(ap);
  const pre=C.powerUps.map(r=>r.playableKey).filter(k=>BOOST[k]);if(pre.length){PRE.length=0;PRE.push(...pre);PRE.forEach(k=>BOOST[k].pre=1)}})();
/* the level start popup (power-ups) appears from the first power-up level on */
const powerFrom=()=>Math.min(...PRE.map(k=>BOOST[k].unlock));
/* what the booster gives, shown as a sticker on its picture */
const EFX={peek:['5s','preview'],lens:['1','best move'],glove:['2-5','books placed'],key:['5s','free moves'],brush:['1','whole shelf'],bookmark:['+3','moves'],corners:['4','pinned corners'],center:['5','pinned books'],glue:['+1','glued pair'],shelf:['+3','moves + Lens']};
const efxTag=(k,big)=>false&&EFX[k]?`<span class="efx${big?' big':''} ol"><b>${EFX[k][0]}</b>${big?`<small>${EFX[k][1]}</small>`:''}</span>`:'';
const bImg=k=>ICO[BOOST[k].img||k];
const FEATURES=[ // home unlock cadence (blueprint)
 {L:3,k:'gallery',name:'Gallery',text:'Every painting you restore is framed in your Gallery.'},
 {L:7,k:'daily',name:'Daily Gifts',text:'Come back every day for a bigger gift.'},
 {L:10,k:'shop',name:'Shop',text:'Coins, booster bundles and offers live here.'},
 {L:30,k:'league',name:'Weekly League',text:'Win levels to earn points and climb the league.'},
];
const fmt=s=>{s=Math.max(0,Math.ceil(s));const m=Math.floor(s/60),x=s%60;return m+':'+String(x).padStart(2,'0')};

/* =========================================================
   SAVE
   ========================================================= */
const DEF={level:1,coins:300,lives:5,livesTs:0,inv:{peek:0,lens:0,glove:0,key:0,brush:0,bookmark:0,corners:0,center:0,glue:0,shelf:0},gifted:{},seenFeat:{},arts:{},albums:{},
  cases:{own:[],on:''},daily:{day:0,last:''},league:{week:'',pts:0},streak:0,removeAds:false,starter:false,bundle:false,adGap:0,attempts:{},tut:{},rv:{d:'',n:0},
  settings:{sfx:true,music:true,haptics:true,glueLock:true,minimalUi:false,frame:true,bookCaps:true},stats:{wins:0,fails:0,boosters:0}};
function merge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object')merge(a[k],b[k]);else a[k]=b[k]}return a}
let S=(()=>{try{const s=JSON.parse(localStorage.getItem('bap_v12')||'null');if(s)return merge(JSON.parse(JSON.stringify(DEF)),s)}catch(e){}return JSON.parse(JSON.stringify(DEF))})();
function save(){try{localStorage.setItem('bap_v12',JSON.stringify(S))}catch(e){}}
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const MAXL=5,REGEN=30*60e3;
function tickLives(){if(S.lives>=MAXL){S.livesTs=0;return}const now=Date.now();if(!S.livesTs)S.livesTs=now;while(S.lives<MAXL&&now-S.livesTs>=REGEN){S.lives++;S.livesTs+=REGEN}if(S.lives>=MAXL)S.livesTs=0}
function loseLife(){tickLives();if(S.lives>=MAXL)S.livesTs=Date.now();S.lives=Math.max(0,S.lives-1);save()}
function addCoins(n){S.coins+=n;save();document.querySelectorAll('.coinsV').forEach(e=>e.textContent=S.coins);$('#hCoins .v').textContent=S.coins}
function spend(n){if(S.coins<n)return false;S.coins-=n;save();$('#hCoins .v').textContent=S.coins;document.querySelectorAll('.coinsV').forEach(e=>e.textContent=S.coins);return true}

/* =========================================================
   SOUND (WebAudio synth) + HAPTICS
   ========================================================= */
const Sound={ctx:null,
  init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return}try{const C=window.AudioContext||window.webkitAudioContext;this.ctx=new C();const x=this.ctx;
    this.sfx=x.createGain();this.sfx.gain.value=.9;this.sfx.connect(x.destination);this.load('place','ui/sfx_place.m4a');this.load('correct','ui/sfx_correct.m4a');setTimeout(()=>this.musicSync(),0);
    const b=x.createBuffer(1,x.sampleRate,x.sampleRate),dt=b.getChannelData(0);for(let i=0;i<dt.length;i++)dt[i]=Math.random()*2-1;this.nb=b}catch(e){this.ctx=null}},
  tone(f,type,peak,a,d,when=0,to){const x=this.ctx;if(!x)return;const t=x.currentTime+when,o=x.createOscillator(),g=x.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+a+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);o.connect(g);g.connect(this.sfx);o.start(t);o.stop(t+a+d+.05)},
  noise(ft,f,q,peak,a,d,when=0){const x=this.ctx;if(!x)return;const t=x.currentTime+when,s=x.createBufferSource(),fl=x.createBiquadFilter(),g=x.createGain();s.buffer=this.nb;fl.type=ft;fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);s.connect(fl);fl.connect(g);g.connect(this.sfx);s.start(t,Math.random()*.5);s.stop(t+a+d+.05)},
  /* v12: звуки рекламного ролика — сэмпл установки книги и петля мелодии (WebAudio, без щелчка на стыке) */
  buf:{},load(k,url){if(this.buf[k]!==undefined)return;this.buf[k]=null;fetch(url).then(r=>r.arrayBuffer()).then(a=>this.ctx.decodeAudioData(a)).then(b=>{this.buf[k]=b;if(k==='music')this.musicSync()}).catch(()=>{})},
  sample(k,vol,dl=0){const b=this.buf[k];if(!b)return false;const x=this.ctx,s=x.createBufferSource(),g=x.createGain();g.gain.value=vol;s.buffer=b;s.connect(g);g.connect(this.sfx);s.start(x.currentTime+dl);return true},
  edges(b){const d=b.getChannelData(0);let i=0,j=d.length-1;while(i<j&&Math.abs(d[i])<1e-4)i++;while(j>i&&Math.abs(d[j])<1e-4)j--;return[i/b.sampleRate,(j+1)/b.sampleRate]},
  musicSync(){if(!this.ctx)return;const on=S.settings.music;if(on&&!this.mus){const b=this.buf.music;if(!b){this.load('music','ui/music.m4a');return}
    const x=this.ctx,s=x.createBufferSource(),g=x.createGain(),[a,e]=this.edges(b);s.buffer=b;s.loop=true;s.loopStart=a;s.loopEnd=e;g.gain.setValueAtTime(.0001,x.currentTime);g.gain.exponentialRampToValueAtTime(.32,x.currentTime+1.2);s.connect(g);g.connect(x.destination);s.start(0,a);this.mus={s,g}}
    else if(!on&&this.mus){const m=this.mus,x=this.ctx;this.mus=null;m.g.gain.setTargetAtTime(.0001,x.currentTime,.15);setTimeout(()=>{try{m.s.stop()}catch(e){}},700)}},
  play(n,v=1){if(!S.settings.sfx)return;this.init();if(!this.ctx)return;switch(n){
    case 'pickup':this.noise('highpass',1800,.7,.09,.004,.07);this.tone(260,'sine',.07,.004,.08);break;
    case 'pickup_big':this.noise('highpass',1200,.7,.12,.006,.1);this.tone(190,'sine',.1,.006,.12);break;
    case 'slide':this.noise('bandpass',900,.9,.04,.03,.12);break;
    case 'thud':if(this.sample('place',1))break;this.tone(150,'sine',.42,.003,.16,0,70);this.noise('lowpass',700,.8,.22,.002,.07);this.tone(300,'triangle',.04,.002,.05);break;
    case 'glue':if(this.sample('correct',.85,.2)){this.glT=this.ctx.currentTime;break}this.noise('bandpass',2600,2,.1,.002,.03);[784,988,1175].slice(0,1+Math.min(2,v)).forEach((f,i)=>this.tone(f,'sine',.06,.005,.5,.03+i*.07));break;
    case 'combo':[659,880,1175].forEach((f,i)=>{this.tone(f,'triangle',.07,.01,.35,i*.08);this.tone(f*2,'sine',.02,.01,.3,i*.08)});break;
    case 'win':[523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>{this.tone(f,'triangle',.08,.01,1.4,i*.1);this.tone(f*2,'sine',.025,.01,1,i*.1)});break;
    case 'fail':[392,330,262].forEach((f,i)=>this.tone(f,'triangle',.08,.01,.45,i*.16));break;
    case 'coin':this.tone(1568,'square',.025,.002,.08);this.tone(2093,'square',.022,.002,.18,.06);break;
    case 'click':this.tone(700,'sine',.06,.003,.05);this.noise('highpass',3000,.7,.03,.001,.02);break;
    case 'pop':this.tone(420,'sine',.08,.004,.12,0,900);break;
    case 'magic':for(let i=0;i<6;i++)this.tone(880*Math.pow(1.19,i),'sine',.035,.005,.25,i*.045);break;
    case 'correct':if(this.ctx.currentTime-(this.glT||-9)<.2||this.sample('correct',1,.2))break;
    case 'unlock':this.noise('bandpass',3200,3,.12,.002,.06);this.tone(1320,'triangle',.05,.004,.3,.05);this.tone(1760,'sine',.04,.004,.4,.12);break;
    case 'deny':this.tone(180,'square',.04,.004,.12);this.tone(150,'square',.04,.004,.14,.09);break;
    case 'whoosh':this.noise('bandpass',1400,.6,.08,.08,.25);break;
  }}};
const buzz=t=>{if(!S.settings.haptics)return;try{navigator.vibrate&&navigator.vibrate({light:8,medium:18,heavy:30,success:[14,60,22,60,40]}[t])}catch(e){}};

/* =========================================================
   FX — particles, floating text, coin fly, confetti, toast
   ========================================================= */
const fx=$('#fx');
function relRect(el){const a=app.getBoundingClientRect(),r=el.getBoundingClientRect();return{x:r.left-a.left,y:r.top-a.top,w:r.width,h:r.height,cx:r.left-a.left+r.width/2,cy:r.top-a.top+r.height/2}}
function burst(x,y,n=10,opt={}){const cols=opt.colors||['#FFE08A','#FFC548','#FFF4DB','#FFFFFF'];for(let i=0;i<n;i++){const p=document.createElement('i');p.className='pt'+(Math.random()<.6?' star':'');const a=Math.random()*Math.PI*2,sp=(opt.spread||60)*(.4+Math.random()*.8);
  p.style.cssText=`left:${x}px;top:${y}px;--s:${(opt.size||10)*(.6+Math.random()*.8)}px;--c:${cols[i%cols.length]};--x:${Math.cos(a)*sp}px;--y:${Math.sin(a)*sp}px;--g:${opt.g??30}px;--d:${(opt.dur||700)*(.7+Math.random()*.6)}ms`;fx.appendChild(p);setTimeout(()=>p.remove(),(opt.dur||700)*1.4)}}
function flyText(txt,x,y,o){const t=document.createElement('div');t.className='flytext ol';t.textContent=txt;t.style.left=x+'px';t.style.top=y+'px';if(o)t.style.setProperty('--o',o);fx.appendChild(t);setTimeout(()=>t.remove(),1200)}
function coinFly(from,to,n,onEach){for(let i=0;i<n;i++){const c=document.createElement('img');c.src=ICO.coin;c.style.cssText=`position:absolute;width:34px;height:34px;left:0;top:0;z-index:230`;fx.appendChild(c);
  const sx=from.cx+(Math.random()-.5)*60,sy=from.cy+(Math.random()-.5)*30,mx=(sx+to.cx)/2+(Math.random()-.5)*120,my=Math.min(sy,to.cy)-60-Math.random()*60;
  const kf=[];for(let k=0;k<=12;k++){const t=k/12,x=(1-t)*(1-t)*sx+2*(1-t)*t*mx+t*t*to.cx,y=(1-t)*(1-t)*sy+2*(1-t)*t*my+t*t*to.cy;kf.push({transform:`translate(${x-17}px,${y-17}px) scale(${1.1-t*.4})`})}
  const an=c.animate(kf,{duration:520+Math.random()*130,delay:i*55,easing:'cubic-bezier(.4,0,.6,1)',fill:'both'});an.onfinish=()=>{c.remove();Sound.play('coin');onEach&&onEach(i)}}}
function confetti(){const cv=document.createElement('canvas');const W=app.clientWidth,H=app.clientHeight;cv.width=W*2;cv.height=H*2;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:95;pointer-events:none';app.appendChild(cv);
  const c=cv.getContext('2d');c.scale(2,2);const cols=['#53D96B','#FFC548','#69CBF5','#FF735F','#A77AF4','#FFF4DB'];const P=[];for(let i=0;i<110;i++)P.push({x:W/2+(Math.random()-.5)*80,y:H*.38,vx:(Math.random()-.5)*12,vy:-6-Math.random()*10,r:Math.random()*6,w:6+Math.random()*6,h:8+Math.random()*8,c:cols[i%6],s:(Math.random()-.5)*.4});
  let t0=performance.now();const step=t=>{const dt=Math.min(32,t-t0)/16;t0=t;c.clearRect(0,0,W,H);let alive=0;P.forEach(p=>{p.vy+=.32*dt;p.vx*=.99;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.s*dt;if(p.y<H+20)alive++;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.scale(1,Math.cos(p.r*2));c.fillStyle=p.c;c.fillRect(-p.w/2,-p.h/2,p.w,p.h);c.restore()});if(alive)requestAnimationFrame(step);else cv.remove()};requestAnimationFrame(step)}
let toastT;function toast(msg,ms=2200){let t=$('#toast');if(t)t.remove();t=document.createElement('div');t.id='toast';t.textContent=msg;app.appendChild(t);clearTimeout(toastT);toastT=setTimeout(()=>t.remove(),ms)}

/* press feedback for every 3D button */
app.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn,.ibtn,.sbtn,.bt,.xbtn,.plus');if(b){Sound.play('click');buzz('light')}},true);

/* =========================================================
   POPUPS
   ========================================================= */
const popStack=[];
function popup({title,ribbon='',cls='',html='',close=true,onClose,clear=false}){
  const ov=document.createElement('div');ov.className='ov'+(clear?' clear':'');
  ov.innerHTML=`<div class="pop ${cls}">${title?`<div class="ribbon ${ribbon}"><span class="ol">${title}</span></div>`:''}${close?`<button class="xbtn" aria-label="Close">${SVG.x}</button>`:''}${html}</div>`;
  app.appendChild(ov);Sound.play('pop');
  const p={ov,el:ov.firstChild,close(cb){if(p.closed)return;p.closed=true;ov.classList.add('out');const i=popStack.indexOf(p);if(i>=0)popStack.splice(i,1);setTimeout(()=>{ov.remove();onClose&&onClose();cb&&cb()},170)}};
  if(close)ov.querySelector('.xbtn').onclick=()=>p.close();
  popStack.push(p);return p}
const q=(p,s)=>p.el.querySelector(s);
function closeAll(){popStack.slice().forEach(p=>p.close())}

/* mock ads */
function showAd(kind,done){const d=document.createElement('div');d.className='adFake';const rv=kind==='rv',T=rv?3:2.5;
  d.innerHTML=`<span class="skip" hidden>Close ✕</span><h3>${rv?'Rewarded video':'Ad break'}</h3><p>Demo placeholder. In the store build an ad network plays here.</p><div class="ab"><i></i></div>`;
  app.appendChild(d);const bar=d.querySelector('.ab i');let t=0;const iv=setInterval(()=>{t+=.1;bar.style.width=Math.min(100,t/T*100)+'%';if(t>=T){clearInterval(iv);const s=d.querySelector('.skip');s.hidden=false;s.onclick=()=>{d.remove();done&&done()}}},100)}

/* mock IAP */
function purchase(name,price,grant){const p=popup({title:'Purchase',ribbon:'purple',html:`<div class="ptitle">${name}</div><div class="ptext">Demo purchase. No payment is taken.</div><button class="btn purple wide" id="pBuy"><span class="t">Pay ${price}</span></button>`});
  q(p,'#pBuy').onclick=()=>{p.close();grant();save();refreshHome();Sound.play('win');toast('Purchased: '+name)}}

/* =========================================================
   BOARD HELPERS
   ========================================================= */
function cycles(order){const seen=new Array(order.length).fill(false);let c=0;for(let i=0;i<order.length;i++){if(seen[i])continue;c++;let j=i;while(!seen[j]){seen[j]=true;j=order[j]}}return c}
function shuffleOrder(n,cols,R){let a,tries=0;const pc=o=>{let c=0;for(let p=0;p<n;p++){const v=o[p];if(p%cols<cols-1&&o[p+1]===v+1&&(v+1)%cols!==0)c++;}return c};
  do{a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}tries++}while((a.filter((v,i)=>v===i).length>Math.max(0,Math.floor(n*.06))||pc(a)>0)&&tries<600);
  /* v10: a shuffled board starts without naturally glued neighbours (the Glue booster is the only exception) */
  if(pc(a)>0||a.filter((v,i)=>v===i).length>Math.max(0,Math.floor(n*.06)))a=[...Array(n).keys()].reverse();return a}

/* v12 25% mistake budget */
const MISTAKE_RATE=.25;
const SOLVED_MOVE_COST=Object.freeze([4,5,6,6,7,10,6,8,13,7,7,9,12,8,9,12,9,13,14,18,8,9,12,15,8,11,11,14,17,9,7,11,14,17,6,11,14,14,21,10,10,11,14,10,11,14,12,16,21,11,14,13,13,18,12,14,18,14,21,19,16,15,18,16,16,16,19,16,19,25,17,17,16,17,17,18,21,19,19,25,17,19,18,16,17,21,23,19,26,30,15,14,16,20,16,18,25,14,26,25,21,26,25,29,25,31,36,24,38,38,23,27,24,30,25,28,37,26,37,41,25,25,26,32,26,27,35,26,33,41,25,25,25,27,25,31,33,25,37,38,25,22,25,28,25,29,35,25,35,40,27,24,25,30,28,29,33,25,39,40,26,27,25,29,27,27,44,26,32,43,23,26,21,32,26,29,31,25,37,39,24,31,25,26,25,32,32,27,38,42,27,21,25,31,26,31,35,26,37,39,26,26,25,30,23,28,35,28,36,45,25,23,26,31,28,32,39,25,34,41,25,25,25,40,24,29,32,26,35,41,28,23,23,25,25,29,33,25,36,34,26,20,25,29,27,30,34,24,40,42,24,24,26,30,25,28,39,24,38,42,23,26,24,31,22,29,41,28,40,38,26,25,27,32,28,32,32,25,36,39,25,28,26,27,26,32,35,24,38,43,27,21,24,29,28,28,39,25,39,36,23,24,23,30,25,29,34,25,40,41,26,24,25,28,27,28,36,26,39,39,23,25,26,30,27,27,35,25,32,44,26,32,27,28,26,32,33,26,36,37,24,23,26,29,26,30,36,25,36,41]);
/* 2026-11-03: move buffer +50%, min +3 (patch_v12_moves_buffer) */
const MOVE_BUFFER=.5,MOVE_BUFFER_MIN=3;function movesWithBuffer(c){return Math.max(3,Math.ceil(c*(1+MOVE_BUFFER)),c+MOVE_BUFFER_MIN)}
/* 2026-11-04: the first five levels give +2 moves on top of the formula: the player is still learning */
/* levels 1-50: buffer % and hand extra moves come from the level table (CURVE50 columns 5-6) */
const earlyBonus=L=>L<=CURVE50.length?CURVE50[L-1][5]:0;
/* 2026-11-06: moves for levels 1-300 from a playtest bot (block-first player, 15% mistaken moves, 200 plays per level):
   the smallest budget where easy (d<=3) loses ~10% of plays, medium (d 4-6) ~25%, hard (d 7-8) ~45%, super hard (d 9) ~50%;
   never fewer moves than books. Stars and ticking books are already counted in. Levels 1-5 keep their +2 learning moves. */
const LEVEL_MOVES=Object.freeze([8,8,11,10,13,16,12,16,18,14,13,18,20,16,17,20,19,21,23,24,16,18,20,21,16,21,20,22,25,18,16,20,22,26,17,21,21,27,30,19,17,23,22,20,19,21,22,26,31,21,25,24,21,29,24,21,25,22,31,30,29,31,28,26,31,26,30,26,29,38,39,29,27,26,39,27,31,30,30,43,29,37,29,31,29,32,35,27,39,46,29,30,26,34,32,32,40,28,41,40,43,46,40,49,47,48,54,43,58,63,43,47,42,49,48,46,73,42,58,62,46,46,41,62,46,46,56,43,57,65,48,58,42,48,47,49,57,41,59,59,46,42,44,48,49,50,58,44,56,64,47,48,41,52,50,49,55,40,56,62,45,45,43,49,48,48,73,41,54,63,48,46,39,59,47,49,54,41,55,62,46,62,43,44,48,49,54,41,56,67,49,44,39,49,50,48,56,43,60,64,49,52,43,51,46,50,54,43,54,63,47,42,41,49,49,51,74,45,56,63,48,45,41,61,42,51,55,43,56,63,47,59,43,46,43,49,54,47,55,58,47,43,44,49,48,50,55,42,56,64,45,43,43,51,47,51,57,43,56,61,46,45,39,49,46,49,71,43,58,61,44,42,42,62,43,51,53,43,57,63,46,63,44,48,48,49,56,41,55,65,45,43,40,52,47,48,57,41,58,59]);
const levelBudget=(L,c)=>Number.isFinite(LEVEL_MOVES[L-1])?LEVEL_MOVES[L-1]+earlyBonus(L):L<=CURVE50.length?Math.max(3,Math.ceil(c*(1+CURVE50[L-1][4]/100)),c+MOVE_BUFFER_MIN)+earlyBonus(L):movesWithBuffer(c);
function plannedMoves(L,opt,def,stars,ticks){
  const clean=SOLVED_MOVE_COST[L-1];
  if(Number.isFinite(clean)||Number.isFinite(LEVEL_MOVES[L-1]))return levelBudget(L,clean);
  /* A reshuffle has a new order. Keep its original conservative budget as a safety floor. */
  const old=Math.max(3,Math.ceil(opt*(def.n>=FRAME_MIN?MOVE_K_FRAME[def.d]:1+def.slack)))+(L<=3?1:0)+(def.n>=FRAME_MIN?2:0)-stars.length*2+Object.keys(ticks).length*2;
  return Math.max(old,movesWithBuffer(opt)-stars.length*2+Object.keys(ticks).length*2)+earlyBonus(L);
}

function prepareLevel(L){const def=levelDef(L);/* 2026-11-04: a retry replays the same shuffle (as in Unity), so the solver-checked move budget always applies */const R=rng(def.seed);const {n,cols}=def;
  const order=shuffleOrder(n,cols,R);const pos=[];order.forEach((id,p)=>pos[id]=p);
  const used=new Set(),links=[],locks={},hidden=[];let t=0;
  while(links.length<def.mods.links&&t++<400){const p=Math.floor(R()*n);if(p%cols===cols-1)continue;const a=order[p],b=order[p+1];if(used.has(a)||used.has(b)||pos[a]===a||pos[b]===b)continue;links.push([a,b]);used.add(a);used.add(b)}
  t=0;while(Object.keys(locks).length<def.mods.locks&&t++<400){const id=Math.floor(R()*n);if(used.has(id)||pos[id]===id)continue;const p=pos[id];
    if(Object.keys(locks).some(k=>{const q=pos[k];return Math.abs(q%cols-p%cols)+Math.abs(Math.floor(q/cols)-Math.floor(p/cols))<=1}))continue;locks[id]=def.mods.lockHp;used.add(id)}
  t=0;while(hidden.length<def.mods.hidden&&t++<400){const id=Math.floor(R()*n);if(used.has(id))continue;hidden.push(id);used.add(id)}
  const pickWrong=()=>{for(let k=0;k<400;k++){const id=Math.floor(R()*n);if(!used.has(id)&&pos[id]!==id){used.add(id);return id}}return -1};
  const stars=[],ticks={};let keyBook=-1;
  for(let i=0;i<(def.mods.stars||0);i++){const id=pickWrong();if(id>=0)stars.push(id)}
  for(let i=0;i<(def.mods.ticks||0);i++){const id=pickWrong();if(id>=0)ticks[id]=def.mods.tickN}
  if(def.mods.keyBook&&Object.keys(locks).length)keyBook=pickWrong();
  const opt=n-cycles(order);
  /* star books pay +3 on landing, ticking books may cost 3: budget nets those out so the curve stays calibrated */
  const moves=plannedMoves(L,opt,def,stars,ticks);
  return{def,order,locks,links,hidden,stars,ticks,keyBook,moves,opt}}

/* Before-level placement: the same ids are used by the preview and the playable board. */
function prePinnedIds(def,pre){const ids=[];const {rows,cols}=def;
  if(pre.corners&&rows>=2&&cols>=2)ids.push(0,cols-1,(rows-1)*cols,rows*cols-1);
  if(pre.center&&rows>=3&&cols>=3){const r=Math.floor(rows/2),c=Math.floor(cols/2);ids.push((r-1)*cols+c,r*cols+c-1,r*cols+c,r*cols+c+1,(r+1)*cols+c)}
  /* 2026-11-06: two shelves have no plus of five, so pin the five middle books (three on top, two below) */
  else if(pre.center&&rows===2&&cols>=3){const c=Math.floor(cols/2);ids.push(c-1,c,c+1,cols+c-1,cols+c)}
  return [...new Set(ids)]}
function prePinnedOrder(order,ids){const out=order.slice();for(const id of ids){const p=out.indexOf(id);[out[id],out[p]]=[out[p],out[id]]}return out}

/* =========================================================
   GAME STATE + SHELF
   ========================================================= */
let G=null;const caseEl=$('#case'),stage=$('#stage');
const BOOK_SEED=7;

function startLevel(prep,pre){
  document.getElementById('brPad')?.remove();document.querySelectorAll('.brSp,.brLay,.brCloth,.brFog,.brEdge,.brArt,.kLock,.kKey').forEach(x=>x.remove());
  const {def}=prep;const art=def.art;const R=rng(def.seed*3+1);
  G={def,L:def.L,art,rows:def.rows,cols:def.cols,n:def.n,order:prep.order.slice(),pos:[],books:[],
     locks:{...prep.locks},links:prep.links.map(x=>x.slice()),hidden:new Set(prep.hidden),stars:new Set(prep.stars||[]),ticks:{...(prep.ticks||{})},tickN:prep.def.mods.tickN||7,keyBook:prep.keyBook??-1,
     moves:prep.moves+(pre.bookmark?3:0)+(pre.shelf?3:0),startMoves:0,used:0,glove:false,freeLens:pre.shelf?1:0,
     replay:pre.replay||null,rvUsed:false,buys:0,locked:true,sel:null,solved:false,Lay:null,combo:[],ghosts:[],bonusDoubled:false};
  G.startMoves=G.moves;G.frame=true;
  /* v10: every correctly placed book pins in place, on every difficulty */
  G.freeze=true;G.anch=new Set();
  const pinned=prePinnedIds(def,pre);if(pinned.length){G.order=prePinnedOrder(G.order,pinned);const fixed=new Set(pinned);
    pinned.forEach(id=>{delete G.locks[id];G.hidden.delete(id);G.stars.delete(id);delete G.ticks[id];if(G.keyBook===id)G.keyBook=-1});
    G.links=G.links.filter(pair=>!pair.some(id=>fixed.has(id)))}
  syncPos();
  if(pre.glue){applyStarterGlue(R);syncPos()}
  caseEl.innerHTML='';const TH=themeOf(art,S.level);caseEl.className=TH.cls;if(shelfPreview(S.level)>=0)setTimeout(()=>toast(`Shelf style ${shelfPreview(S.level)+1}/7: ${SHELF_NAMES[shelfPreview(S.level)]}`,4000),1600);$('#sGame').style.setProperty('--roombg',`url(${TH.bg})`);caseEl.style.setProperty('--art',`url(${art.file})`);
  G.rowbacks=[];G.planks=[];
  ['crown','base'].forEach(c=>{const d=document.createElement('div');d.className=c;caseEl.appendChild(d)});
  for(let r=0;r<G.rows;r++){const rb=document.createElement('div');rb.className='rowback';caseEl.appendChild(rb);G.rowbacks.push(rb);const pl=document.createElement('div');pl.className='plank';caseEl.appendChild(pl);G.planks.push(pl)}
  for(let id=0;id<G.n;id++){const el=document.createElement('div');el.className='book';el.innerHTML='<i></i><span class="skf"></span>';
    const b={id,el,inset:.8+R()*1.8,hf:.92+R()*.08};el.style.setProperty('--band',R()<.65?(.25+R()*.3).toFixed(2):'0');el.style.setProperty('--dk',(R()*.12).toFixed(2));
    el.addEventListener('pointerdown',e=>Input.down(e,id));G.books.push(b);caseEl.appendChild(el)}
  G.final=document.createElement('div');G.final.className='final';caseEl.appendChild(G.final);
  decorate();
  $('#gLevel').textContent=G.replay?(G.replay.excl?'Exclusive':'Replay'):'Level '+G.L;$('#gBadge').innerHTML=G.replay?`<span class="chip" style="background:${G.replay.col}">${G.replay.label}</span>`:def.badge?`<span class="chip ${def.d>=9?'super':'hard'}">${def.badge}</span>`:'';
  $('#gGoalImg').style.backgroundImage=`url(${art.file})`;$('#peekImg').style.backgroundImage=`url(${art.file})`;
  $('#winWrap')?.remove();$('#sGame').classList.remove('won','won2');
  renderBoosters();updateHud();$('#gCoins .v').textContent=S.coins;show('sGame');
  requestAnimationFrame(()=>{layout(false,true);
    G.books.forEach(b=>{b.el.style.transition='none';b.el.style.opacity='0';b.el.style.transform+=' translateY(-34px)'});
    caseEl.offsetHeight;const ord=[...G.books].sort(()=>Math.random()-.5);const step=Math.min(30,900/G.n);
    ord.forEach((b,i)=>setTimeout(()=>{b.el.style.transition='';b.el.style.opacity='';placeBook(b.id);if(i%5===0)Sound.play('slide')},120+i*step));
    setTimeout(()=>{G.locked=false;Sound.play('thud');levelIntro()},260+G.n*step)});
}
function applyStarterGlue(R){const {cols,n}=G;const busy=id=>G.pos[id]===id||G.locks[id]||G.hidden.has(id)||G.links.some(l=>l.includes(id));
  const cand=[];for(let k=0;k<n;k++){if(k%cols===cols-1)continue;if(busy(k)||busy(k+1))continue;cand.push(k)}if(!cand.length)return;
  const k=cand[Math.floor(R()*cand.length)];[k,k+1].forEach(id=>{const p=G.order.indexOf(id);if(p===id)return;const other=G.order[id];if(busy(other))return;G.order[id]=id;G.order[p]=other})}
const isAnch=id=>!!G&&G.pos[id]===id;
function anchorFx(){const now=new Set();for(let id=0;id<G.n;id++)if(isAnch(id))now.add(id);
  const fresh=[...now].filter(id=>!G.anch.has(id));G.anch=now;if(!fresh.length||G.solved)return;
  fresh.forEach(id=>{const el=G.books[id].el;el.classList.remove('pin');void el.offsetWidth;el.classList.add('pin');const r=relRect(el);burst(r.cx,r.y+8,6,{colors:['#FFE08A','#FFC548','#fff'],spread:30})});Sound.play('correct')}
function syncPos(){G.pos=[];G.order.forEach((id,p)=>G.pos[id]=p)}
const correctOf=o=>o.reduce((s,id,p)=>s+(id===p),0);

/* v12 full-art (patch_v12_full_art) */
function computeLayout(solved,availW,availH){const {rows,cols}=G;
  const CS=!solved&&!!app.dataset.case;const side=solved?8:(CS?17:14),pad=solved?8:(CS?17:12),t=solved?0:(CS?clamp(availH*.036,16,22):clamp(availH*.022,9,14));
  const capK=(!solved&&S.settings.bookCaps!==false)?.08:0;           /* leather top: up to 8 % of the picture height */
  const gap=solved?0:clamp(Math.round(Math.min(availW-2*side,520)/cols*.09),3,6);               /* real empty space between books (frames live here) */
  let pw=Math.min(availW-2*side,520)/cols-gap,ph=pw*cols/rows;         /* the painting is square: cols*pw == rows*ph */
  const H2=availH-2*pad-(rows-1)*t;
  if(rows*ph*(1+capK)>H2){ph=H2/(rows*(1+capK));pw=ph*rows/cols}
  const sw=pw+gap,capMax=ph*capK,rowH=ph+capMax,sh=rowH,imgW=sw*cols,imgH=rows*rowH;
  return{solved,side,pad,t,imgW,imgH,sw,sh,rowH,pw,ph,gap,capMax,artW:pw*cols,artH:ph*rows,caseW:imgW+2*side,caseH:2*pad+rows*rowH+(rows-1)*t}}
function slot(L,p){const r=Math.floor(p/G.cols),c=p%G.cols;return{r,c,x:L.side+c*L.sw,y:L.pad+r*(L.rowH+L.t)+(L.rowH-L.sh)}}
function layout(solved,instant){const W=stage.clientWidth,H=stage.clientHeight;
  const CR=(!solved&&app.dataset.case)?Math.round(Math.min(78,(W+32)/3.2)-14):0,BS=CR?Math.round((W+30)/5.8-22):0;const L=computeLayout(solved,W-(CR?8:0),solved?Math.min(H-20,W):H-14-CR-BS);G.Lay=L;
  caseEl.style.width=L.caseW+'px';caseEl.style.height=L.caseH+'px';caseEl.style.left=(W-L.caseW)/2+'px';caseEl.style.top=(solved?6:(H-L.caseH+CR-BS)/2)+'px';if(CR)caseEl.style.setProperty('--crH',(CR+14)+'px');
  for(let r=0;r<G.rows;r++){const y=L.pad+r*(L.rowH+L.t);Object.assign(G.rowbacks[r].style,{left:L.side+'px',top:y+'px',width:L.imgW+'px',height:L.rowH+'px'});
    Object.assign(G.planks[r].style,{left:(L.side-5)+'px',top:(y+L.rowH)+'px',width:(L.imgW+10)+'px',height:(r===G.rows-1?0:L.t)+'px'})}
  Object.assign(G.final.style,{left:L.side+'px',top:L.pad+'px',width:L.imgW+'px',height:L.imgH+'px'});
  G.books.forEach(b=>{b.el.style.backgroundSize=`${L.artW}px ${L.artH}px`});caseEl.style.setProperty('--ring',Math.min(3,(L.gap||0)/2)+'px');
  refreshBooks(instant);placeGhosts();
  {const R=G.rows,C=G.cols,rad='10px';G.books.forEach(b=>{const p=G.pos[b.id],r=Math.floor(p/C),c=p%C;
    b.el.style.borderRadius=solved?`${r===0&&c===0?rad:0} ${r===0&&c===C-1?rad:0} ${r===R-1&&c===C-1?rad:0} ${r===R-1&&c===0?rad:0}`:''})}}
addEventListener('resize',()=>{if(G&&!$('#sGame').hidden)layout(G.solved,true)});

/* ---------- groups: natural glue (+ tie ribbons for movement) ---------- */
function computeGroups(order=G.order,withTies=true){const n=G.n,cols=G.cols,par=[...Array(n).keys()];
  const find=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};const join=(a,b)=>{a=find(a);b=find(b);if(a!==b)par[a]=b};
  const links={};
  for(let p=0;p<n;p++){const a=order[p];
    if(p%cols<cols-1){const b=order[p+1];if(b===a+1&&Math.floor(b/cols)===Math.floor(a/cols)){join(a,b);(links[a]=links[a]||{}).r=1;(links[b]=links[b]||{}).l=1}}
    }
  const nat={};for(let id=0;id<n;id++)nat[id]=find(id);
  const natMembers={};for(let id=0;id<n;id++)(natMembers[nat[id]]=natMembers[nat[id]]||[]).push(id);
  if(withTies&&G.links)G.links.forEach(([a,b])=>join(a,b));
  const gid=[],members={};for(let id=0;id<n;id++){const r=find(id);gid[id]=r;(members[r]=members[r]||[]).push(id)}
  return{gid,members,links,nat,natMembers}}
const groupOf=id=>G.groups.members[G.groups.gid[id]];
const natSize=(g,id)=>g.natMembers[g.nat[id]].length;
function pairCount(order){let c=0;const cols=G.cols;for(let p=0;p<order.length;p++){const a=order[p];if(p%cols<cols-1&&order[p+1]===a+1&&Math.floor((a+1)/cols)===Math.floor(a/cols))c++;}return c}

function decorate(){G.books.forEach(b=>{const el=b.el,id=b.id;
  let cv=el.querySelector('.cover');if(G.hidden.has(id)&&!cv){cv=document.createElement('u');cv.className='cover';cv.innerHTML='<i class="hbB t"></i><i class="hbE"></i><i class="hbB b"></i>';el.appendChild(cv)}
  let ch=el.querySelector('.chains');if(G.locks[id]&&!ch){ch=document.createElement('s');ch.className='chains';ch.innerHTML=SVG.pad+'<em class="ol"></em>';el.appendChild(ch)}
  if(ch&&G.locks[id])ch.querySelector('em').textContent=G.locks[id];
  el.classList.toggle('lockd',!!G.locks[id]);
  let tie=el.querySelector('.tie');const lk=G.links.find(l=>l.includes(id));
  if(lk&&lk[0]===id&&!tie){tie=document.createElement('b');tie.className='tie knot';el.appendChild(tie)}
  badge(el,'star',G.stars.has(id),SVG.star);
  badge(el,'tick',G.ticks[id]!==undefined,`<span>${G.ticks[id]??''}</span>`);
  badge(el,'kb',G.keyBook===id,`<img src="${ICO.key}" alt="">`)});syncTies()}
/* hands span from the left book's left edge to the right book's right edge, clasp on the seam (TiedBooks pack) */
function syncTies(){if(!G||!G.Lay||!G.links)return;const L=G.Lay;G.links.forEach(l=>{const [a,b]=G.pos[l[0]]<=G.pos[l[1]]?l:[l[1],l[0]];const ea=G.books[a].el,k=G.books[l[0]].el.querySelector('.tie.knot');if(!k)return;
  if(k.parentNode!==ea)ea.appendChild(k);const A=G.books[a],B=G.books[b],xa=slot(L,G.pos[a]).x+(A.insL||0),xb=slot(L,G.pos[b]).x+L.sw-(B.insR||0),wa=L.sw-(A.insL||0)-(A.insR||0);
  k.style.setProperty('--kw',(xb-xa)+'px');k.style.setProperty('--ah',Math.round(Math.max(26,Math.min(54,wa*.42)))+'px')})}
function badge(el,k,on,html){let b=el.querySelector('.bdg.'+k);if(on&&!b){b=document.createElement('em');b.className='bdg '+k;el.appendChild(b)}
  if(on){if(b.dataset.h!==html){b.innerHTML=html;b.dataset.h=html}}else if(b&&!b.classList.contains('gone')){b.classList.add('gone');setTimeout(()=>b.remove(),420)}}
/* specials after each move: Star Book (+3 moves), Key Book (opens every lock), Ticking Book (-3 moves at zero) */
function specials(){let dirty=false;const mv=$('#gMoves');
  [...G.stars].forEach(id=>{if(G.pos[id]!==id)return;G.stars.delete(id);dirty=true;G.moves+=3;const r=relRect(G.books[id].el),m=relRect(mv);
    burst(r.cx,r.cy,16,{colors:['#FFE08A','#FFC548','#fff','#FF9DE6'],spread:70});flyTo('+3',r.cx,r.cy,m.cx,m.cy,'#A86A12');Sound.play('magic');buzz('success');bumpMoves()});
  if(G.keyBook>=0&&G.pos[G.keyBook]===G.keyBook){const kb=G.keyBook;G.keyBook=-1;dirty=true;const r=relRect(G.books[kb].el);burst(r.cx,r.cy,18,{colors:['#FFE08A','#FFC548','#fff'],spread:80});
    Object.keys(G.locks).forEach((k,i)=>setTimeout(()=>{if(G.locks[k]!==undefined)unlockBook(+k)},180+i*140));flyText('Unlocked!',r.cx,r.cy-30,'#A86A12')}
  Object.keys(G.ticks).forEach(k=>{const id=+k;if(G.pos[id]===id){delete G.ticks[id];dirty=true;const r=relRect(G.books[id].el);burst(r.cx,r.cy,10,{colors:['#9AF0A8','#fff'],spread:40});flyText('Defused!',r.cx,r.cy-24,'#1F7E3B');Sound.play('unlock');return}
    G.ticks[id]--;dirty=true;const el=G.books[id].el;
    if(G.ticks[id]<=0){G.ticks[id]=G.tickN;G.moves=Math.max(0,G.moves-3);const r=relRect(el),m=relRect(mv);burst(r.cx,r.cy,18,{colors:['#FF735F','#FFC548','#3B2414'],spread:70,g:60});
      flyTo('−3',r.cx,r.cy,m.cx,m.cy,'#A8301F');Sound.play('fail');buzz('heavy');caseEl.classList.remove('jolt');void caseEl.offsetWidth;caseEl.classList.add('jolt');bumpMoves(true)}
    else if(G.ticks[id]<=2){const b=el.querySelector('.bdg.tick');b&&(b.classList.remove('warn'),void b.offsetWidth,b.classList.add('warn'))}});
  if(dirty)decorate()}
function bumpMoves(bad){const m=$('#gMoves');m.classList.remove('bump','hurt');void m.offsetWidth;m.classList.add(bad?'hurt':'bump')}
function flyTo(txt,x0,y0,x1,y1,o){const t=document.createElement('div');t.className='flytext ol';t.textContent=txt;t.style.cssText=`left:0;top:0;--o:${o};animation:none;transform:none`;fx.appendChild(t);
  t.animate([{transform:`translate(${x0}px,${y0}px) translate(-50%,-50%) scale(.4)`,opacity:0},{transform:`translate(${x0}px,${y0-40}px) translate(-50%,-50%) scale(1.15)`,opacity:1,offset:.3},{transform:`translate(${x1}px,${y1}px) translate(-50%,-50%) scale(.6)`,opacity:.9}],{duration:720,easing:'cubic-bezier(.5,0,.3,1)'}).onfinish=()=>t.remove()}

function refreshBooks(instant){const L=G.Lay;G.groups=computeGroups();
  G.books.forEach(b=>{const el=b.el,lk=G.groups.links[b.id]||{},glued=!!(lk.l||lk.r||lk.u||lk.d);
    if(instant)el.style.transition='none';
    /* v12 spine kit (patch_v12_spine_kit) */el.dataset.sk=(b.id*5+(G.L||0)*3)%4;b.insL=b.insR=(L.gap||0)/2;b.hfNow=1;b.cap=L.capMax?L.capMax*((L.solved||glued)?1:clamp((b.hf-.92)/.08,0,1)):0;
    const cr=Math.floor(b.id/G.cols),cc=b.id%G.cols;
    el.style.width=L.pw+'px';el.style.height=(L.ph+b.cap)+'px';el.style.borderTopWidth=b.cap+'px';el.style.setProperty('--cap',b.cap+'px');
    el.style.backgroundPosition=`${-(cc*L.pw)}px ${-(cr*L.ph)}px`;
    el.classList.toggle('glued',glued&&!L.solved);el.classList.toggle('framed',isAnch(b.id)&&!L.solved);el.classList.toggle('gl-l',!!lk.l);el.classList.toggle('gl-r',!!lk.r);
    placeBook(b.id);if(instant){el.offsetHeight;el.style.transition=''}});syncTies()}
function bookXY(id,p){const L=G.Lay,b=G.books[id],s=slot(L,p);return{x:s.x+b.insL,y:s.y+L.rowH-L.ph-(b.cap||0)}}
function placeBook(id,p=G.pos[id],lift=0,solo=true){const {x,y}=bookXY(id,p);G.books[id].el.style.transform=`translate3d(${x}px,${y-lift*9}px,0) scale(${solo?1+lift*.06:1})`}
function liftGroup(ids,on){const solo=ids.length===1;ids.forEach(i=>{G.books[i].el.classList.toggle('lift',on);placeBook(i,G.pos[i],on?1:0,solo)})}

function updateHud(){const c=correctOf(G.order);if(G.lastC!==undefined&&c>G.lastC){const pb=document.querySelector('.pbar');pb.classList.remove('shine');void pb.offsetWidth;pb.classList.add('shine')}G.lastC=c;$('#gPieces').textContent=`${c}/${G.n}`;$('#gBar').style.width=(c/G.n*100)+'%';
  $('#gMovesN').textContent=G.moves;const m=$('#gMoves');m.classList.toggle('low',G.moves<=3&&!G.solved);
  let f=m.querySelector('.free');if(G.glove&&!f){f=document.createElement('img');f.className='free';f.src=ICO.glove;m.appendChild(f)}else if(!G.glove&&f)f.remove()}

/* ---------- block moves ---------- */
function clampDelta(ids,dr,dc){let r0=1e9,r1=-1,c0=1e9,c1=-1;ids.forEach(id=>{const p=G.pos[id],r=Math.floor(p/G.cols),c=p%G.cols;r0=Math.min(r0,r);r1=Math.max(r1,r);c0=Math.min(c0,c);c1=Math.max(c1,c)});
  return[clamp(dr,-r0,G.rows-1-r1),clamp(dc,-c0,G.cols-1-c1)]}
function moveBlock(ids,dr,dc,order=G.order){const o=order.slice(),cols=G.cols;
  const from=ids.map(id=>G.pos[id]),to=from.map(p=>p+dr*cols+dc);const fromS=new Set(from),toS=new Set(to);
  const displaced=to.filter(p=>!fromS.has(p)).sort((a,b)=>a-b).map(p=>order[p]);const vacated=from.filter(p=>!toS.has(p)).sort((a,b)=>a-b);
  ids.forEach((id,i)=>o[to[i]]=id);displaced.forEach((id,i)=>o[vacated[i]]=id);return o}
/* a move is blocked if it would push a locked book or split a tied pair */
function blockedBy(ids,dr,dc){const inG=new Set(ids);for(const id of ids){const p=G.pos[id]+dr*G.cols+dc;const o=G.order[p];if(inG.has(o))continue;
  if(G.locks[o])return o;if(isAnch(o))return o;if(G.links.some(l=>l.includes(o)))return o}
  /* glued pairs never come apart: reject any move that would split one */
  const o=moveBlock(ids,dr,dc),np=[];o.forEach((id,p)=>np[id]=p);const lk=G.groups.links;
  const ls=G.loose||new Set();
  for(const k in lk){const a=+k;if(ls.has(a))continue;if(!S.settings.glueLock&&G.pos[a]!==a&&!inG.has(a))continue;if(lk[a].r&&np[a+1]!==np[a]+1)return inG.has(a)?a+1:a;if(lk[a].d&&np[a+G.cols]!==np[a]+G.cols)return inG.has(a)?a+G.cols:a}
  return -1}

/* A booster clears modifiers on its selected cells and on every book it rearranges. */
function clearMechanicsForBooster(cells,newOrder){const ids=new Set(cells.map(p=>G.order[p]));
  G.order.forEach((id,p)=>{if(id!==newOrder[p]){ids.add(id);ids.add(newOrder[p])}});
  ids.forEach(id=>{if(G.locks[id]!==undefined)unlockBook(id);if(G.hidden.has(id))revealBook(id);
    G.stars.delete(id);delete G.ticks[id];if(G.keyBook===id)G.keyBook=-1});
  G.links.slice().forEach(l=>{if(l.some(id=>ids.has(id)))untie(l)});decorate()}
/* ---------- commit a new arrangement ---------- */
function commit(newOrder,opt={}){
  if(opt.boosterCells)clearMechanicsForBooster(opt.boosterCells,newOrder);
  const before=G.order.slice(),old=G.groups;G.order=newOrder;syncPos();clearHint();
  if(G.loose){G.loose.forEach(i=>G.books[i].el.classList.remove('loose'));G.loose=null}
  const changed=before.some((v,i)=>v!==newOrder[i]);
  G.books.forEach(b=>b.el.classList.remove('lift','sel','target','dragging'));G.sel=null;
  refreshBooks(false);
  if(!changed){Sound.play('thud');return}
  const movedIds=[];G.order.forEach((id,p)=>{if(before[p]!==id)movedIds.push(id)});
  setTimeout(()=>{movedIds.forEach((id,i)=>{const el=G.books[id].el;el.classList.remove('land');void el.offsetWidth;el.classList.add('land');
    if(i<6){const r=relRect(el);burst(r.cx,r.y+r.h-2,3,{colors:['#E9D3AE','#C9A57A','#F6E6C4'],size:6,spread:22,g:-8,dur:420})}})},170);
  if(!opt.free){if(G.frz){const r=relRect($('#gMoves'));flyText('Frozen!',r.cx,r.cy+50,'#1E6FCB')}else if(G.glove){G.glove=false;const r=relRect($('#gMoves'));flyText('Free move!',r.cx,r.cy+50,'#5634A3');renderBoosters()}else{G.moves--;bumpMoves()}}
  G.used++;
  setTimeout(()=>{Sound.play('thud');buzz('light')},170);
  // natural blocks that grew this move
  const grown=new Set();const g=G.groups;
  Object.values(g.natMembers).forEach(m=>{if(m.length<2)return;const prev=Math.max(...m.map(id=>old.natMembers[old.nat[id]].length));if(m.length>prev)m.forEach(id=>grown.add(id))});
  if(G.tut2&&grown.size)tipOff();
  setTimeout(()=>{
    if(grown.size){let sx=0,sy=0;[...grown].sort((a,b)=>G.pos[a]%G.cols-G.pos[b]%G.cols||G.pos[a]-G.pos[b]).forEach((id,i)=>{const el=G.books[id].el;el.classList.remove('ok','gnew');void el.offsetWidth;el.style.animationDelay=(i*38)+'ms';el.classList.add('ok','gnew');setTimeout(()=>{el.classList.remove('gnew');el.style.animationDelay=''},700+i*38);const r=relRect(el);sx+=r.cx;sy+=r.cy});
      sx/=grown.size;sy/=grown.size;burst(sx,sy,8+Math.min(10,grown.size),{spread:50+grown.size*4});Sound.play('glue',Math.min(3,grown.size/2));buzz('medium');
      const now=performance.now();G.combo=G.combo.filter(t=>now-t<4000);G.combo.push(now);
      if(G.combo.length>=3){const words=['Great!','Awesome!','Brilliant!','Masterpiece!'];flyText(words[Math.min(3,G.combo.length-3)],sx,sy-30);Sound.play('combo')}
      if(G.L===2&&!S.tut.glue){S.tut.glue=1;save();tip('Matching books <b>glue together</b>. Drag the whole block in one move!',ICO.glue,4500)}}
    afterMerge(grown);anchorFx();specials();
    if(!G.order.every((v,i)=>v===i)&&G.moves>0)jamCheck();
    updateHud();
    if(G.order.every((v,i)=>v===i))complete();
    else if(G.moves<=0)setTimeout(()=>{if(!G.solved&&G.moves<=0)outOfMoves()},500);
  },230);
  updateHud();
}
function hasAnyMove(){const seen=new Set();for(let id=0;id<G.n;id++){const ids=groupOf(id);const k=Math.min(...ids);if(seen.has(k))continue;seen.add(k);if(ids.some(i=>G.locks[i]||isAnch(i)))continue;
  for(let r=-G.rows;r<=G.rows;r++)for(let c=-G.cols;c<=G.cols;c++){if(!r&&!c)continue;const [a,b]=clampDelta(ids,r,c);if(a===r&&b===c&&blockedBy(ids,r,c)===-1)return true}}return false}
/* rare jam: glued blocks wedge each other and no move is possible -> loosen the smallest misplaced block for one move */
function jamCheck(){if(hasAnyMove())return;const g=G.groups;const blocks=Object.values(g.natMembers).filter(m=>m.length>1);
  const wrong=blocks.filter(m=>m.some(id=>G.pos[id]!==id)).sort((a,b)=>a.length-b.length);const pick=wrong[0]||blocks.sort((a,b)=>a.length-b.length)[0];
  if(pick){G.loose=new Set(pick);if(hasAnyMove()){pick.forEach(i=>G.books[i].el.classList.add('loose'));toast('Shelf jammed! This block is loose for one move.',3000);return}G.loose=null}
  const lk=Object.keys(G.locks)[0];if(lk!==undefined){unlockBook(+lk);toast('Shelf jammed! A lock popped open.',3000)}}
function neighbours(p){const c=G.cols,r=[];if(p%c>0)r.push(p-1);if(p%c<c-1)r.push(p+1);if(p-c>=0)r.push(p-c);if(p+c<G.n)r.push(p+c);return r}
function afterMerge(grown){const g=G.groups;let changed=false;
  Object.keys(G.locks).forEach(k=>{const id=+k;const near=neighbours(G.pos[id]).some(p=>grown.has(G.order[p]));
    if(near){G.locks[id]--;changed=true;if(G.locks[id]<=0)unlockBook(id);else{const ch=G.books[id].el.querySelector('.chains');ch.animate([{transform:'rotate(0)'},{transform:'rotate(-8deg)'},{transform:'rotate(6deg)'},{transform:'rotate(0)'}],{duration:350});Sound.play('unlock')}}});
  G.hidden.forEach(id=>{if(neighbours(G.pos[id]).some(p=>grown.has(G.order[p])))revealBook(id)});
  G.links.slice().forEach(l=>{if(l.some(id=>neighbours(G.pos[id]).some(p=>grown.has(G.order[p])&&!l.includes(G.order[p]))))untie(l)});
  if(changed)decorate()}
function unlockBook(id){delete G.locks[id];const el=G.books[id].el,ch=el.querySelector('.chains');
  const key=document.createElement('img');key.src=ICO.key;key.className='mergeKey';el.appendChild(key);setTimeout(()=>key.remove(),700);el.classList.remove('lockd');if(ch){ch.classList.add('gone');setTimeout(()=>ch.remove(),400)}
  const r=relRect(el);burst(r.cx,r.cy,14,{colors:['#DDE3EA','#FFC548','#fff']});Sound.play('unlock');buzz('medium');G.groups=computeGroups()}
/* reveal (HiddenBooks pack look): shake + brighten, the cover swings open like a book cover, sparkles + «Revealed!» */
function revealBook(id){if(!G.hidden.has(id))return;G.hidden.delete(id);const el=G.books[id].el,cv=el.querySelector('.cover');Sound.play('magic');
  if(!cv||RM){cv&&cv.remove();return}cv.classList.add('opening');
  setTimeout(()=>{cv.classList.add('gone');const r=relRect(el);burst(r.cx,r.cy,16,{colors:['#C29BFF','#FFE08A','#fff','#8FE0FF']});
    const t=document.createElement('div');t.className='hb-txt';t.textContent='Revealed!';t.style.left=r.cx+'px';t.style.top=(r.cy-r.h/2-6)+'px';fx.appendChild(t);setTimeout(()=>t.remove(),1200);
    el.classList.remove('hb-reveal');void el.offsetWidth;el.classList.add('hb-reveal');setTimeout(()=>{cv.remove();el.classList.remove('hb-reveal')},700)},520)}
function untie(l){snapTie(l);G.links=G.links.filter(x=>x!==l);l.forEach(id=>{const t=G.books[id].el.querySelector('.tie');if(t){t.classList.add('gone');setTimeout(()=>t.remove(),350)}});
  Sound.play('unlock');G.groups=computeGroups()}


/* The hands let go: the pair fades and two gloves wave apart (TiedBooks pack look) */
function snapTie(l){const kn=G.books[l[0]].el.querySelector('.tie.knot');if(!kn||RM)return;const k=relRect(kn),W=parseFloat(kn.style.getPropertyValue('--kw'))||k.w,Hh=W*116/420,y0=k.y-Hh/2;kn.style.opacity='0';
  for(const [src,dir,f] of [['ui/arm_l.webp',-1,240],['ui/arm_r.webp',1,260]]){const w=W*f/420*1.04,x0=dir<0?k.x:k.x+W-w,h=document.createElement('img');h.src=src;h.className='tb-fly';h.style.width=w+'px';fx.appendChild(h);
    h.animate([{transform:`translate(${x0}px,${y0}px)`,opacity:1},{transform:`translate(${x0+dir*6}px,${y0}px) rotate(${dir*-6}deg)`,offset:.25},
      {transform:`translate(${x0+dir*W*.35}px,${y0-18}px) rotate(${dir*14}deg)`,opacity:1,offset:.7},{transform:`translate(${x0+dir*W*.5}px,${y0-30}px) rotate(${dir*20}deg) scale(.85)`,opacity:0}],
      {duration:950,easing:'cubic-bezier(.3,.7,.3,1)'}).onfinish=()=>h.remove()}
  burst(k.x+W/2,k.y,12,{colors:['#FFE08A','#fff','#7CC8FF'],spread:50});toast('The hands let go!')}
/* =========================================================
   INPUT — drag a book or a glued block; tap-tap to swap
   ========================================================= */
const Input={D:null,
  local(e){const r=caseEl.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}},
  cellAt(x,y){const L=G.Lay;return[clamp(Math.floor((y-L.pad+L.t/2)/(L.rowH+L.t)),0,G.rows-1),clamp(Math.floor((x-L.side)/L.sw),0,G.cols-1)]},
  deny(id,ids){ids.forEach(i=>{const el=G.books[i].el;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')});Sound.play('deny');buzz('heavy');
    if(isAnch(id)||ids.some(i=>isAnch(i))){toast('This book is home and stays put.');return}
    if(G.locks[id]!==undefined||ids.some(i=>G.locks[i]))toast(G.def.mods.lockHp>1&&G.locks[id]>1?`Locked. Glue books next to it ${G.locks[id]} times to open.`:'Locked. Glue books next to it to open.');
    else if(G.links.some(l=>l.includes(id)))toast('Tied books move only together.');
    else{toast('Glued books stay together. Drag the whole block.');(groupOf(id)||[]).forEach(i=>{const el=G.books[i].el;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')})}},
  down(e,id){if(!G||G.locked||this.D)return;e.preventDefault();Sound.init();
    const ids=groupOf(id).slice();if(ids.some(i=>G.locks[i]||isAnch(i))){this.deny(id,ids);return}
    const el=G.books[id].el;try{el.setPointerCapture(e.pointerId)}catch(_){}
    const p=this.local(e),xy=bookXY(id,G.pos[id]);
    this.D={id,ids,el,sx:e.clientX,sy:e.clientY,ox:p.x-xy.x,oy:p.y-xy.y,moved:false,delta:null,lastX:p.x,rot:0,preview:null,offs:ids.map(i=>{const a=bookXY(i,G.pos[i]);return[a.x-xy.x,a.y-xy.y]})};
    ids.forEach(i=>{const e=G.books[i].el;e.classList.remove('grab');void e.offsetWidth;e.classList.add('grab')});
    if(!(G.sel!==null&&!ids.includes(G.sel)))liftGroup(ids,true);
    buzz('light');
    const mv=ev=>this.move(ev),up=ev=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);this.up(ev)};
    el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)},
  move(e){const D=this.D;if(!D)return;
    if(!D.moved){if(Math.hypot(e.clientX-D.sx,e.clientY-D.sy)<7)return;D.moved=true;
      if(G.sel!==null){liftGroup(groupOf(G.sel),false);G.books[G.sel].el.classList.remove('sel');groupOf(G.sel).forEach(i=>G.books[i].el.classList.remove('sel'));G.sel=null}
      liftGroup(D.ids,true);D.ids.forEach(i=>G.books[i].el.classList.add('dragging'))}
    const p=this.local(e),vx=p.x-D.lastX;D.lastX=p.x;const solo=D.ids.length===1;
    D.rot=solo?clamp(D.rot*.7+vx*.6,-7,7):clamp(D.rot*.7+vx*.15,-1.5,1.5);
    D.ids.forEach((i,k)=>{G.books[i].el.style.transform=`translate3d(${p.x-D.ox+D.offs[k][0]}px,${p.y-D.oy+D.offs[k][1]-9}px,0) rotate(${D.rot}deg) scale(${solo?1.08:1.02})`});
    const [tr,tc]=this.cellAt(p.x-D.ox+G.Lay.sw/2,p.y-D.oy+G.Lay.sh*.5);const gp=G.pos[D.id];
    const [dr,dc]=clampDelta(D.ids,tr-Math.floor(gp/G.cols),tc-gp%G.cols);const key=dr+','+dc;
    if(key!==D.delta){D.delta=key;this.preview(dr,dc);Sound.play('slide')}},
  preview(dr,dc){const D=this.D,inG=new Set(D.ids);G.books.forEach(b=>{if(!inG.has(b.id))b.el.classList.remove('target')});
    if((!dr&&!dc)||blockedBy(D.ids,dr,dc)>=0){D.preview=null;D.blocked=(dr||dc)?blockedBy(D.ids,dr,dc):-1;G.books.forEach(b=>{if(!inG.has(b.id))placeBook(b.id)});return}
    D.blocked=-1;const o=moveBlock(D.ids,dr,dc);D.preview=o;
    o.forEach((id,p)=>{if(inG.has(id))return;const moved=p!==G.pos[id];placeBook(id,p,0);G.books[id].el.classList.toggle('target',moved)})},
  up(){const D=this.D;this.D=null;if(!D)return;
    if(!D.moved){this.tap(D.id,D.ids);return}
    if(D.blocked>=0){commit(G.order.slice());this.deny(D.blocked,[D.blocked]);return}
    commit(D.preview||G.order.slice())},
  tap(id,ids){
    if(G.sel===null){G.sel=id;ids.forEach(i=>G.books[i].el.classList.add('sel'));return}
    const sel=G.sel,selIds=groupOf(sel);
    if(selIds.includes(id)){G.sel=null;selIds.forEach(i=>G.books[i].el.classList.remove('sel'));liftGroup(selIds,false);Sound.play('thud');return}
    G.sel=null;const a=G.pos[sel],b=G.pos[id];
    const [dr,dc]=clampDelta(selIds,Math.floor(b/G.cols)-Math.floor(a/G.cols),b%G.cols-a%G.cols);
    if((dr||dc)&&blockedBy(selIds,dr,dc)>=0){commit(G.order.slice());this.deny(blockedBy(selIds,dr,dc),[id]);return}
    commit(dr||dc?moveBlock(selIds,dr,dc):G.order.slice())}};

/* peek: hold the goal thumbnail */
/* Art Peek booster: the finished painting for 5 seconds; tapping the goal thumbnail is a shortcut */
$('#gGoal').addEventListener('click',()=>useBooster('peek'));
function peekShow(sec){const pk=$('#peek'),n=pk.querySelector('.pk-n'),bar=pk.querySelector('.pk-bar i');G.locked=true;G.peeking=true;clearHint();
  pk.classList.add('on');Sound.play('whoosh');let t=sec;n.textContent=t;bar.style.transition='none';bar.style.width='100%';bar.offsetWidth;bar.style.transition=`width ${sec}s linear`;bar.style.width='0%';
  const end=()=>{if(!G.peeking)return;clearInterval(iv);pk.classList.remove('on');pk.onclick=null;G.peeking=false;if(!G.solved)G.locked=false;Sound.play('whoosh')};
  const iv=setInterval(()=>{t--;if(t>0){n.textContent=t;Sound.play('click')}else end()},1000);
  setTimeout(()=>{if(G.peeking)pk.onclick=()=>{Sound.play('click');end()}},250)}

/* =========================================================
   BOOSTERS
   ========================================================= */
function bestMove(){let best=null;const base=pairCount(G.order),baseC=correctOf(G.order);
  for(let id=0;id<G.n;id++){if(G.pos[id]===id)continue;const ids=groupOf(id);if(ids.some(i=>G.locks[i]||isAnch(i)))continue;
    const dr=Math.floor(id/G.cols)-Math.floor(G.pos[id]/G.cols),dc=id%G.cols-G.pos[id]%G.cols;const [cr,cc]=clampDelta(ids,dr,dc);if(cr!==dr||cc!==dc)continue;if(blockedBy(ids,dr,dc)>=0)continue;
    const o=moveBlock(ids,dr,dc);const sc=(pairCount(o)-base)*10+(correctOf(o)-baseC)*3+ids.length*.1;if(!best||sc>best.sc)best={id,ids,dr,dc,o,sc}}
  return best}
function renderBoosters(){const bar=$('#gBoosters');bar.innerHTML='';
  IN_LEVEL.forEach(k=>{const B=BOOST[k],b=document.createElement('button');b.className='bt';b.dataset.k=k;b.setAttribute('aria-label',B.name);
    if(S.level<B.unlock&&G.L<B.unlock){b.classList.add('locked');b.innerHTML=`<img src="${bImg(k)}" alt=""><span class="lk">${SVG.pad}<span>Lv ${B.unlock}</span></span>`;b.onclick=()=>toast(`${B.name} unlocks at level ${B.unlock}`)}
    else{const n=S.inv[k]+(k==='lens'?G.freeLens:0);b.innerHTML=`<img src="${bImg(k)}" alt="">`+(n>0?`<span class="cnt">${n}</span>`:`<span class="price"><img src="${ICO.coin}" alt="">${B.price}</span>`);
      if(k==='glove'&&!handPlan())b.classList.add('na');if(k==='glove'&&G.hand)b.classList.add('armed');if(k==='key'&&G.frz)b.classList.add('armed');b.onclick=()=>useBooster(k)}
    bar.appendChild(b)})}
function useBooster(k){if(!G||G.locked||G.solved)return;
  if(k==='glove'){if(G.hand){handOff();return}if(!handPlan()){toast('No books can be placed right now.');return}if(S.inv.glove>0)handArm();else buyBooster('glove',()=>handArm());return}
  if(k==='key'&&G.frz){toast('Time is already frozen. Keep moving!');return}
  if(k==='lens'&&!bestMove()){toast('Open a lock first: glue books next to it.');return}
  if(k==='brush'){if(G.brush){brushOff();return}if(!brushCan().length){toast('No shelf can be painted right now.');return}
    if(S.inv.brush>0)brushArm();else buyBooster('brush',()=>brushArm());return}
  const have=S.inv[k]+(k==='lens'?G.freeLens:0);
  if(have>0){if(k==='lens'&&G.freeLens)G.freeLens--;else S.inv[k]--;S.stats.boosters++;save();applyBooster(k);renderBoosters()}
  else buyBooster(k,()=>{S.inv[k]--;S.stats.boosters++;save();applyBooster(k);renderBoosters()})}
function applyBooster(k){const tile=document.querySelector(`.bt[data-k="${k}"]`);if(tile){const r=relRect(tile);burst(r.cx,r.cy,10)}
  document.querySelectorAll('.bt.nudge').forEach(x=>x.classList.remove('nudge'));tipOff();
  if(k==='peek'){peekShow(3)}
  if(k==='lens'){const m=bestMove();clearHint();Sound.play('magic');
    G.sel=m.id;m.ids.forEach(i=>{G.books[i].el.classList.add('hint','sel')});liftGroup(m.ids,true);
    G.ghosts=m.ids.map(i=>G.pos[i]+m.dr*G.cols+m.dc);placeGhosts();m.ids.forEach(i=>revealBook(i));
    const toCells=G.ghosts;handDemo(m.ids.map(i=>G.pos[i]),toCells,2);
    toast('Tap the glowing spot or drag the book there.')}
  if(k==='glove')handUse(tile);
  if(k==='key')freezeStart();
  if(k==='brush'){const m=bestMove();Sound.play('magic');m.ids.forEach(i=>{const r=relRect(G.books[i].el);burst(r.cx,r.cy,14,{colors:['#FF735F','#FFC548','#53D96B','#69CBF5','#A77AF4']})});
    G.locked=true;setTimeout(()=>{G.locked=false;commit(m.o,{free:true})},260)}}
function keyFly(tile,r,done){const k=document.createElement('img');k.src=ICO.key;k.style.cssText='position:absolute;width:56px;height:56px;left:0;top:0;z-index:230';fx.appendChild(k);const s=relRect(tile);
  k.animate([{transform:`translate(${s.cx-28}px,${s.cy-28}px) scale(1)`},{transform:`translate(${(s.cx+r.cx)/2-28}px,${Math.min(s.cy,r.cy)-90}px) scale(1.4) rotate(-30deg)`},{transform:`translate(${r.cx-28}px,${r.cy-28}px) scale(.8) rotate(20deg)`}],{duration:620,easing:'cubic-bezier(.4,0,.3,1)'}).onfinish=()=>{k.remove();done()}}
function clearHint(){G&&G.books.forEach(b=>b.el.classList.remove('hint'));if(G)G.ghosts=[];placeGhosts();stopHand()}
function placeGhosts(){caseEl.querySelectorAll('.ghost').forEach(g=>g.remove());if(!G||!G.ghosts||!G.ghosts.length||!G.Lay)return;
  G.ghosts.forEach(p=>{const s=slot(G.Lay,p),g=document.createElement('div');g.className='ghost';Object.assign(g.style,{left:s.x+2+'px',top:s.y+2+'px',width:G.Lay.sw-4+'px',height:G.Lay.sh-4+'px'});caseEl.appendChild(g)})}

function buyBooster(k,useNow){const B=BOOST[k];const p3=Math.round(B.price*3*.85/50)*50;
  const p=popup({title:B.name,html:`<div class="bigWrap"><img class="bigicon" src="${bImg(k)}" alt="">${efxTag(k,true)}</div><div class="ptext">${B.desc}</div>
    <div class="row"><button class="btn gold sm" id="b1"><span class="t">×1</span><img class="coin" src="${ICO.coin}" alt=""><span class="t">${B.price}</span></button>
    <button class="btn gold sm" id="b3"><span class="t">×3</span><img class="coin" src="${ICO.coin}" alt=""><span class="t">${p3}</span></button></div>
    <div class="ptext" style="font-size:14px;color:var(--muted)">You have <b class="coinsV">${S.coins}</b> coins</div>`});
  const buy=(n,c)=>{if(!spend(c)){p.close(()=>openShop(true));toast('Not enough coins');return}S.inv[k]+=n;save();Sound.play('coin');p.close(()=>{useNow?useNow():(refreshHome())})};
  q(p,'#b1').onclick=()=>buy(1,B.price);q(p,'#b3').onclick=()=>buy(3,p3)}

/* =========================================================
   LEVEL FLOW
   ========================================================= */
function teaser(prep){const {rows,cols,art}=prep.def;   // the level's real starting shuffle, shelf by shelf
  return `<div class="strips grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr)">${prep.order.map(id=>{const r=Math.floor(id/cols),c=id%cols;
    return `<i style="background-image:url(${art.file});background-size:${cols*100}% ${rows*100}%;background-position:${c/(cols-1)*100}% ${r/(rows-1)*100}%"></i>`}).join('')}</div>`}
function testLevel(rows,cols){const base=levelDef(Math.max(S.level,101));const d=6;
  const def=Object.assign({},base,{rows,cols,n:rows*cols,d,role:'spike',badge:'Test',mods:{locks:0,lockHp:1,links:0,hidden:0},art:ART[(rows*cols)%ART.length],seed:rows*1000+cols*7+(S.attempts['t'+rows*cols]=(S.attempts['t'+rows*cols]||0)+1)});
  const R=rng(def.seed),order=shuffleOrder(def.n,cols,R),opt=def.n-cycles(order);
  const moves=Math.ceil(opt*MOVE_K_FRAME[d])+2;
  toast(`Test shelf: ${def.n} books · correct books pin in place`,2600);startLevel({def,order,locks:{},links:[],hidden:[],moves,opt},{})}
function openStart(){tickLives();if(S.lives<=0){outOfLives();return}
  const L=S.level;if(L<powerFrom()){pkPre=null;ProtoKit.play(L);return}const prep=prepareLevel(L),def=prep.def;const sel={bookmark:false,corners:false,center:false,glue:false,shelf:false};
  const mods=[];if(Object.keys(prep.locks).length)mods.push(`<span class="mod">${SVG.pad}Locks</span>`);if(prep.links.length)mods.push(`<span class="mod"><img src="ui/hs_both.webp" alt="" style="width:1.6em;height:auto">Tied books</span>`);if(prep.hidden.length)mods.push(`<span class="mod">${SVG.q}Hidden books</span>`);
  if(prep.stars.length)mods.push(`<span class="mod">${SVG.star}Star books +3</span>`);if(Object.keys(prep.ticks).length)mods.push(`<span class="mod tickc"><b>${prep.def.mods.tickN}</b>Ticking books</span>`);if(prep.keyBook>=0)mods.push(`<span class="mod"><img src="${ICO.key}" alt="">Key book</span>`);
  const wind=(S.attempts[L]||0)>=2;if(wind)prep.moves+=3;
  const p=popup({title:'Level '+L,ribbon:def.d>=9?'purple':def.d>=7?'coral':'',html:`
    ${def.badge?`<span class="chip ${def.d>=9?'super':'hard'}">${def.badge} level</span>`:''}
    <div class="thumb">${teaser(prep)}</div>
    <div class="ptext">Restore the painting in <b id="preMoves" style="color:var(--blue);font-size:20px">${prep.moves}</b> moves</div>
    ${def.d>=9?'<div class="mstr">Masterpiece level · big reward</div>':''}${wind?'<div class="wind">Second wind: +3 moves on this try</div>':''}
    ${mods.length?`<div class="mods">${mods.join('')}</div>`:''}
    <div class="col" style="gap:8px"><span class="lbl">Power-ups</span><div class="preb" id="preb"></div></div>
    <button class="btn wide big" id="sPlay"><span class="t">Play</span></button>`});
  const pb=q(p,'#preb');
  const draw=()=>{pb.innerHTML='';q(p,'.thumb').innerHTML=teaser({...prep,order:prePinnedOrder(prep.order,prePinnedIds(def,sel))});
    q(p,'#preMoves').textContent=prep.moves+(sel.bookmark?3:0)+(sel.shelf?3:0);
    PRE.forEach(k=>{const B=BOOST[k],b=document.createElement('button');b.className='bt'+(sel[k]?' on':'');b.setAttribute('aria-label',B.name);
    if(S.level<B.unlock){b.classList.add('locked');b.innerHTML=`<img src="${bImg(k)}" alt=""><span class="lk">${SVG.pad}<span>Lv ${B.unlock}</span></span>`;b.onclick=()=>toast(`${B.name} unlocks at level ${B.unlock}`)}
    else{const n=S.inv[k];b.innerHTML=`<span class="tick">${SVG.tick}</span><img src="${bImg(k)}" alt="">${efxTag(k)}`+(n>0?`<span class="cnt">${n}</span>`:`<span class="price"><img src="${ICO.coin}" alt="">${B.price}</span>`);
      b.onclick=()=>{sel[k]=!sel[k];if(sel[k])toast(B.name+': '+B.desc,1600);draw()}}
    pb.appendChild(b)})};draw();
  {const nk=PRE.find(k=>S.level>=BOOST[k].unlock&&!(S.tut['pre_'+k]));if(nk){S.tut['pre_'+nk]=1;save();setTimeout(()=>{if(p.closed)return;const bt=pb.children[PRE.indexOf(nk)];
    spotlight(bt,`<b>${BOOST[nk].name}</b><span>Tap to take it into this level: ${BOOST[nk].desc}</span>`,()=>{sel[nk]=true;Sound.play('click');draw();toast(BOOST[nk].name+' is ready!',1600)})},450)}}
  q(p,'#sPlay').onclick=()=>{let cost=0;PRE.forEach(k=>{if(sel[k]&&S.inv[k]<=0)cost+=BOOST[k].price});
    if(cost>S.coins){toast('Not enough coins for these boosters');openShop(true);return}
    spend(cost);PRE.forEach(k=>{if(sel[k]){if(S.inv[k]>0)S.inv[k]--;S.stats.boosters++}});save();
    p.close(()=>{pkPre=sel;ProtoKit.play(L)})}}
/* v12 mech intro (patch_v12_mech_intro) */
const MECH_TIPS=[
 {k:'locks',flag:'lock',has:()=>Object.keys(G.locks).length?[+Object.keys(G.locks)[0]]:null,t:'Locked Book',x:'Make <b>2 merges beside it</b>. The counter goes down, then a key opens the lock.'},
 {k:'stars',flag:'star',has:()=>G.stars.size?[[...G.stars][0]]:null,t:'Star Book',x:'Put it in its spot to get <b>+3 moves</b>.'},
 {k:'links',flag:'tie',has:()=>G.links.length?G.links[0].slice():null,t:'Tied Books',x:'They move <b>together</b>. Make a merge <b>beside either book</b> to untie them.'},
 {k:'hidden',flag:'hid',has:()=>G.hidden.size?[[...G.hidden][0]]:null,t:'Hidden Book',x:'Its picture is hidden. Make a merge <b>beside it</b> to reveal it.'},
 {k:'ticks',flag:'tick',has:()=>{const k=Object.keys(G.ticks)[0];return k!==undefined?[+k]:null},t:'Ticking Book',x:'Each move counts down. Put it in its spot <b>before 0</b> or lose 3 moves.'},
 {k:'keyBook',flag:'keyb',has:()=>G.keyBook>=0?[G.keyBook]:null,t:'Key Book',x:'Put it in its spot to open <b>every lock</b> at once.'}];
MECH_TIPS.forEach(m=>{const r=window.BS_CFG&&BS_CFG.tips[m.key==='dlock'?'doubleLock':m.k];if(r){m.t=r.name||m.t;m.x=r.tutorialText||m.x}});
function mechQueue(){const out=[];MECH_TIPS.forEach(m=>{const id='m_'+(m.key||m.k);if(S.tut[id])return;const ids=m.has();if(ids&&ids.length)out.push({...m,id,ids})});return out}
function mechIntro(list,done){if(!list.length||!G||G.solved){done();return}const m=list[0];S.tut[m.id]=1;if(m.flag)S.tut[m.flag]=1;save();
  const rs=m.ids.map(i=>{const el=G.books[i].el;return relRect(m.k==='hidden'?(el.querySelector('.cover')||el):el)}),x0=Math.min(...rs.map(r=>r.x)),y0=Math.min(...rs.map(r=>r.y)),x1=Math.max(...rs.map(r=>r.x+r.w)),y1=Math.max(...rs.map(r=>r.y+r.h)),pad=m.k==='hidden'?0:6;
  const up=(y0+y1)/2>app.clientHeight*.5,ax=Math.max(30,Math.min(app.clientWidth-30,(x0+x1)/2));
  const w=document.createElement('div');w.id='mechW';G.locked=true;
  w.innerHTML=`<div class="spotH${m.k==='hidden'?' hiddenFocus':''}" style="left:${x0-pad}px;top:${y0-pad}px;width:${x1-x0+pad*2}px;height:${y1-y0+pad*2}px"></div>
   <div class="mcCard ${up?'up':'dn'}" style="${up?`bottom:${app.clientHeight-y0+pad+16}px`:`top:${y1+pad+16}px`};--ax:${ax}px">
    <div class="mcHd">${m.k==='hidden'?'':'<span class="mcIc">'+MECH_UI[m.k].ic+'</span>'}<b>${m.t}</b><small>New</small></div><span class="mcX">${m.x}</span>
    <button class="btn wide" id="mcOk"><span class="t">Got it</span></button></div>`;
  app.appendChild(w);Sound.play('magic');if(m.k!=='hidden')m.ids.forEach(i=>{const el=G.books[i].el;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')});
  const t0=performance.now();w.onclick=()=>{if(performance.now()-t0<500)return;Sound.play('click');w.classList.add('out');setTimeout(()=>{w.remove();G.locked=false;mechIntro(list.slice(1),done)},180)}}
function levelIntro(){if(G.replay)return;const q=mechQueue();if(q.length){mechIntro(q,levelIntroBase);return}levelIntroBase()}
function levelIntroBase(){if(!G||G.solved)return;const L=G.L;
  if(L===MECH.stars&&!S.tut.star){S.tut.star=1;save();tip('<b>Star books</b> give <b>+3 moves</b> the moment they land in their spot.',null,5500);return}
  if(L===MECH.ticks&&!S.tut.tick){S.tut.tick=1;save();tip('<b>Ticking book!</b> Put it in its spot before the counter hits 0, or lose 3 moves.',null,6000);return}
  if(L===MECH.keyBook&&!S.tut.keyb){S.tut.keyb=1;save();tip('Place the <b>Key book</b> in its spot to open <b>every lock</b> at once.',ICO.key,5500);return}
  if(!S.tut.frame){S.tut.frame=1;save();tip('<b>Place a book correctly:</b> it gets a gold pin and stays put.',null,5000);return}
  if(L===1&&!S.tut.l1){tip('Drag a book onto another to <b>swap</b> them. Rebuild the painting!',ICO.books);const m=bestMove();if(m)handDemo(m.ids.map(i=>G.pos[i]),m.ids.map(i=>G.pos[i]+m.dr*G.cols+m.dc),99);G.tut1=true}
  else if(L===2&&!S.tut.glue){G.tut2=true}
  else if(L===BOOST.peek.unlock&&!S.tut.peek){S.tut.peek=1;save();boosterHowTo('peek')}
  else if(false){S.tut.peek=1;save();tip('Forgot the picture? <b>Art Peek</b> shows it for 5 seconds.',ICO.peek,5000);document.querySelector('.bt[data-k="peek"]')?.classList.add('nudge')}
  else if(L===BOOST.lens.unlock&&!S.tut.lens){S.tut.lens=1;save();boosterHowTo('lens')}
  else if(false){S.tut.lens=1;save();tip('Stuck? Your free <b>Hint Lens</b> shows the best move.',ICO.lens,5000);document.querySelector('.bt[data-k="lens"]')?.classList.add('nudge')}
  else if(L===BOOST.glove.unlock&&!S.tut.glove){S.tut.glove=1;save();boosterHowTo('glove')}
  else if(false){S.tut.glove=1;save();tip('<b>Magic Glove</b>: your next move costs nothing.',ICO.glove,4500)}
  else if(L===BOOST.key.unlock&&!S.tut.key){S.tut.key=1;save();boosterHowTo('key')}
  else if(false){S.tut.lock=1;save();tip('<b>Locked books</b> open when you glue books next to them. A Golden Key opens one at once.',ICO.key,6000)}
  else if(L===BOOST.brush.unlock&&!S.tut.brush){S.tut.brush=1;save();boosterHowTo('brush')}
  else if(false){S.tut.brush=1;save();tip('<b>Art Brush</b> paints a book into place without spending a move.',ICO.brush,4500)}
  else if(L===MECH.links&&!S.tut.tie){S.tut.tie=1;save();tip('<b>Tied books</b> move together. Glue either one to its true neighbour to untie them.',null,6000)}
  else if(L===MECH.hidden&&!S.tut.hid){S.tut.hid=1;save();tip('<b>Hidden books</b> show their picture once a neighbour glues next to them.',null,6000)}}
let tipT;function tip(html,img,ms){tipOff();const t=document.createElement('div');t.id='tip';t.innerHTML=(img?`<img src="${img}" alt="">`:'')+`<span>${html}</span>`;app.appendChild(t);t.onclick=tipOff;if(ms)tipT=setTimeout(tipOff,ms)}
function tipOff(){clearTimeout(tipT);$('#tip')?.remove()}
let handAn=null;
function handDemo(fromCells,toCells,loops){stopHand();if(!G.Lay)return;const h=document.createElement('div');h.id='hand';h.innerHTML=SVG.hand;app.appendChild(h);
  const c=cells=>{let x=0,y=0;cells.forEach(p=>{const s=slot(G.Lay,p);x+=s.x+G.Lay.sw/2;y+=s.y+G.Lay.sh/2});const r=relRect(caseEl);return{x:r.x+x/cells.length-14,y:r.y+y/cells.length-6}};
  const a=c(fromCells),b=c(toCells);
  handAn=h.animate([{transform:`translate(${a.x}px,${a.y+30}px)`,opacity:0},{transform:`translate(${a.x}px,${a.y}px) scale(1)`,opacity:1,offset:.15},{transform:`translate(${a.x}px,${a.y}px) scale(.88)`,offset:.25},{transform:`translate(${b.x}px,${b.y}px) scale(.88)`,offset:.7},{transform:`translate(${b.x}px,${b.y}px) scale(1)`,opacity:1,offset:.82},{transform:`translate(${b.x}px,${b.y+20}px)`,opacity:0}],{duration:1900,iterations:loops,easing:'ease-in-out'});
  handAn.onfinish=stopHand}
function stopHand(){if(handAn){handAn.cancel();handAn=null}$('#hand')?.remove();if(G&&G.tut1){G.tut1=false;S.tut.l1=1;save();tipOff()}}

function outOfMoves(){if(!G||G.solved)return;G.locked=true;Sound.play('fail');
  const left=G.n-correctOf(G.order);const tiers=[{price:600,extra:null,lab:'+5 Moves'},{price:900,extra:'lens',lab:'+5 Moves & Lens'},{price:1300,extra:'glove',lab:'+5 Moves & Glove'}];const o=tiers[Math.min(G.buys,2)];
  const p=popup({title:'Out of Moves',ribbon:'coral',close:false,html:`
    <div class="thumb" style="width:120px"><i style="display:block;width:100%;height:100%;border-radius:6px;background:url(${G.art.file}) center/cover;filter:saturate(.6)"></i></div>
    <div class="ptitle">Only ${left} book${left===1?'':'s'} left!</div>
    <div class="ptext" style="font-size:14px;color:var(--muted)">Keep going and keep your progress.</div>
    <button class="btn gold wide" id="oBuy"><span class="t">${o.lab}</span><img class="coin" src="${ICO.coin}" alt=""><span class="t">${o.price}</span></button>
    ${G.rvUsed?'':`<button class="btn purple wide" id="oRv"><span class="stack"><span class="t">+3 Moves</span><span class="sub t">Watch a video</span></span></button>`}
    <button class="link" id="oQuit">Give up</button>`});
  q(p,'#oBuy').onclick=()=>{if(!spend(o.price)){toast('Not enough coins');openShop(true);return}G.buys++;p.close(()=>{G.moves+=5;if(o.extra)S.inv[o.extra]++;save();resume('+5 moves')})};
  const rv=q(p,'#oRv');if(rv)rv.onclick=()=>p.close(()=>showAd('rv',()=>{G.rvUsed=true;G.moves+=3;resume('+3 moves')}));
  q(p,'#oQuit').onclick=()=>p.close(failLevel)}
function resume(txt){G.locked=false;renderBoosters();updateHud();const r=relRect($('#gMoves'));flyText(txt,r.cx,r.cy+60,'#1F7E3B');burst(r.cx,r.cy,14);Sound.play('magic')}
function failLevel(){if(G.replay){replayFail();return}loseLife();ev12Result(false);S.streak=0;S.stats.fails++;S.attempts[G.L]=(S.attempts[G.L]||0)+1;save();
  const p=popup({title:'Level Failed',ribbon:'coral',close:false,html:`<div style="position:relative"><img class="bigicon" src="${ICO.heart}" alt="" style="filter:grayscale(.6);animation:none"><span class="ol" style="position:absolute;right:-14px;top:30px;font:700 34px var(--f-hero);color:#fff;--o:var(--coral-o)">−1</span></div>
    <div class="ptext">You lost a life. The shelf will be shuffled again.</div>
    <button class="btn wide" id="fRetry"><span class="t">Try Again</span></button><button class="link" id="fHome">Home</button>`});
  q(p,'#fRetry').onclick=()=>p.close(()=>{goHome(false);setTimeout(openStart,250)});q(p,'#fHome').onclick=()=>p.close(()=>goHome(false))}
// 2026-10-27: the pause button is gone; in a level the gear opens this menu as the settings popup
function pauseMenu(){if(!G||G.solved)return openSettings();const p=popup({title:'Settings',html:`${settingsRows()}<button class="btn wide" id="pRes"><span class="t">Continue</span></button><button class="link" id="pQuit">${G.replay?'Leave (no life lost)':'Leave level (lose a life)'}</button>${toolsHTML()}`});
  bindSettings(p);bindTools(p);q(p,'#pRes').onclick=()=>p.close();q(p,'#pQuit').onclick=()=>p.close(()=>{if(G.used>0&&!G.replay){loseLife();ev12Result(false);S.attempts[G.L]=(S.attempts[G.L]||0)+1;S.streak=0;save()}goHome(false)})}

function complete(){G.solved=true;G.locked=true;clearHint();tipOff();
  G.books.forEach(b=>{const c=G.pos[b.id]%G.cols,r=Math.floor(G.pos[b.id]/G.cols);b.el.classList.remove('ok','land','wave');b.el.style.animationDelay=(c*45+r*30)+'ms';void b.el.offsetWidth;b.el.classList.add('wave')});
  const L=G.L,def=G.def,art=G.art;
  // rewards
  const RP=G.replay;const base=RP?RP.reward:def.reward,left=Math.min(G.moves,10)*5;if(!RP)S.streak++;const streakBonus=!RP&&S.streak%5===0?150:0;
  const prevCount=S.arts[art.id]||0;S.arts[art.id]=prevCount+1;const tierOf=n=>n>=3?3:n>=2?2:n>=1?1:0;const tierUp=tierOf(prevCount+1)>tierOf(prevCount);const tierBonus=tierUp&&prevCount>0?250:0;
  const total=base+left+streakBonus+tierBonus;const EXH=RP&&RP.excl?exclGrant(RP.excl):'';
  if(!RP){ev12Result(true);S.level=L+1;S.stats.wins++;S.adGap++;delete S.attempts[L];
  const wk=weekKey();if(S.league.week!==wk){S.league={week:wk,pts:0}}S.league.pts+=10+def.d*3}else S.stats.replays=(S.stats.replays||0)+1;
  save();
  setTimeout(()=>{$('#sGame').classList.add('won');layout(true);caseEl.classList.add('solved')},300);
  const WOW=L===1&&!RP;
  setTimeout(()=>{caseEl.classList.add('framed','pop');G.final.classList.add('on');Sound.play('win');buzz('success');winSparkle(G.final);if(WOW)wowWin()},1150);
  setTimeout(()=>{
    const t=tierOf(prevCount+1);
    const wrap=document.createElement('div');wrap.id='winWrap';
    wrap.innerHTML=`<div class="winTitle">Restored!</div><div class="winArt"><i style="background-image:url(${art.file})"></i></div><div class="sheet pending"></div>`;
    const sh=wrap.querySelector('.sheet');
    sh.innerHTML=`<div class="artname">${art.title}</div><div class="after">${art.after}</div>
      <div class="reward"><img src="${ICO.coin}" alt=""><span class="v ol" id="wCoins">+${total}</span></div>
      ${RP?`<div class="ptext" style="font-size:14px">${RP.excl?'Exclusive level':'Replay · '+RP.label} ${RP.rows}×${RP.cols}</div>`:''}${EXH?`<div class="exPrize">${EXH}</div>`:''}${streakBonus?`<div class="ptext" style="font-size:14px">5-win streak bonus +150!</div>`:''}${tierBonus?`<div class="ptext" style="font-size:14px">New frame unlocked +250!</div>`:''}
      <div class="row"><button class="btn purple sm" id="wX2"><span class="t">×2 coins</span></button><button class="btn" id="wNext" style="flex:1"><span class="t">Continue</span></button></div>`;
    $('#sGame').appendChild(wrap);
    /* art takes whatever height is left after title + panel, so the whole group fits and sits centred */
    const fit=()=>{const H=wrap.clientHeight,W=wrap.clientWidth;const used=wrap.querySelector('.winTitle').offsetHeight+sh.offsetHeight+2*14+52;
      wrap.querySelector('.winArt').style.width=Math.max(140,Math.min(W-32,H-used,440))+'px'};fit();
    $('#sGame').classList.add('won2');confetti();if(WOW){wrap.classList.add('wowW');wrap.querySelector('.winTitle').textContent='First Masterpiece!'}
    setTimeout(()=>{sh.classList.remove('pending');Sound.play('pop');unlockAnim(sh);const el=$('#wCoins'),t0=performance.now();el.textContent='+0';const step=t=>{const k=Math.min(1,(t-t0)/750),e=1-Math.pow(1-k,3);el.textContent='+'+Math.round(total*e);if(k<1)requestAnimationFrame(step);else{el.parentElement.classList.remove('bump');void el.offsetWidth;el.parentElement.classList.add('bump');Sound.play('coin')}};setTimeout(()=>requestAnimationFrame(step),250)},700);

    const collect=mult=>{const from=relRect(sh.querySelector('.reward'));addCoins(total*mult);coinFly(from,{cx:from.cx,cy:-30},Math.min(12,6+mult*3))};
    sh.querySelector('#wX2').onclick=e=>{e.currentTarget.disabled=true;showAd('rv',()=>{G.bonusDoubled=true;$('#wCoins').textContent='+'+total*2;Sound.play('coin')})};
    sh.querySelector('#wNext').onclick=()=>{collect(G.bonusDoubled?2:1);sh.querySelector('#wNext').disabled=true;
      setTimeout(()=>{const go=()=>goHome(!RP);if(!RP&&L>=6&&!S.removeAds&&S.adGap>=2){S.adGap=0;save();showAd('inter',go)}else go()},700)}},WOW?3400:2300)}


/* ---------- unlock roadmap: what opens next (boosters, obstacles, features) ---------- */
const MECH_UI={locks:{n:'Locked Books',ic:'<img src="ui/lk_pad.webp" alt="">'},stars:{n:'Star Books',ic:SVG.star},links:{n:'Tied Books',ic:'<img src="ui/hs_both.webp" alt="">'},
  hidden:{n:'Hidden Books',ic:'<img src="ui/hid_icon.webp" alt="">'},ticks:{n:'Ticking Books',ic:'<img src="ui/tk_clock.webp" alt="">'},keyBook:{n:'Key Book',ic:`<img src="${ICO.key}" alt="">`},doubleLock:{n:'Double Lock',ic:'<img src="ui/lk_pad.webp" alt="">'}};
function unlockList(){const out=[];
  IN_LEVEL.concat(PRE).forEach(k=>out.push({L:BOOST[k].unlock,n:BOOST[k].name,ic:`<img src="${bImg(k)}" alt="">`,t:PRE.includes(k)?'New power-up':'New booster'}));
  Object.keys(MECH).forEach(k=>out.push({L:MECH[k],n:MECH_UI[k].n,ic:MECH_UI[k].ic,t:'New challenge'}));
  sideDefs.forEach(d=>out.push({L:d.L,n:d.lb,ic:d.icon,t:'New feature'}));
  return out.sort((a,b)=>a.L-b.L)}
/* done = level just won; next unlock is the first one at a level above it */
function unlockNext(done){const ls=unlockList(),i=ls.findIndex(u=>u.L>done);if(i<0)return null;const nx=ls[i],prev=i>0?ls[i-1].L:1,span=Math.max(1,nx.L-prev);
  const f=d=>Math.max(0,Math.min(1,(d-prev+1)/span));return{u:nx,from:f(done-1),to:f(done),left:nx.L-1-done}}
function unlockBar(done){const x=unlockNext(done);if(!x)return'';const ready=x.left<=0;
  return `<div class="urBox ${ready?'ready':''}" data-from="${x.from}" data-to="${x.to}"><div class="urIc">${x.u.ic}${ready?'':'<span class="urLk">'+SVG.pad+'</span>'}</div>
    <div class="urMid"><div class="urT1">${x.u.t}: <b>${x.u.n}</b></div><div class="urBar"><i style="width:${x.from*100}%"></i><span class="ol">${ready?'Next level!':Math.round(x.from*100)+'%'}</span></div></div></div>`}
function unlockAnim(root){const b=root.querySelector('.urBox');if(!b)return;const i=b.querySelector('.urBar i'),s=b.querySelector('.urBar span'),to=+b.dataset.to,fr=+b.dataset.from,ready=b.classList.contains('ready');
  setTimeout(()=>{i.style.width=to*100+'%';const t0=performance.now();const st=t=>{const k=Math.min(1,(t-t0)/900),v=fr+(to-fr)*(1-Math.pow(1-k,3));if(!ready)s.textContent=Math.round(v*100)+'%';if(k<1)requestAnimationFrame(st);else if(to>=1){b.classList.add('urGo');Sound.play('magic')}};requestAnimationFrame(st)},500)}
function show(id){['sHome','sGame','sSlide','sOdd','sSky'].forEach(s=>$('#'+s).hidden=s!==id);if(id==='sSlide'||id==='sOdd')evRes()}
function evRes(){tickLives();document.querySelectorAll('.coinsV').forEach(e=>e.textContent=S.coins);document.querySelectorAll('.livesV').forEach(e=>e.textContent=S.lives);document.querySelectorAll('.livesSv').forEach(e=>e.textContent=S.lives>=MAXL?'Full':fmt((REGEN-(Date.now()-S.livesTs))/1000))}
setInterval(()=>{if(!$('#sSlide').hidden||!$('#sOdd').hidden)evRes()},1000);
document.querySelectorAll('.evCoins .plus').forEach(b=>b.onclick=()=>{Sound.play('click');S.level>=10?openShop():toast('Shop opens at level 10')});
document.querySelectorAll('.evLives .plus').forEach(b=>b.onclick=()=>{Sound.play('click');tickLives();S.lives>=MAXL?toast('Lives are full'):outOfLives()});
function goHomeRaw(won){closeAll();tipOff();stopHand();$('#winWrap')?.remove();show('sHome');refreshHome(won);setTimeout(featureCheck,won?500:100)}

/* =========================================================
   HOME + META
   ========================================================= */
function weekKey(){const d=new Date(),y=new Date(d.getFullYear(),0,1);return d.getFullYear()+'w'+Math.ceil(((d-y)/864e5+y.getDay()+1)/7)}
const sideDefs=[{k:'daily',side:'tl',lb:'Daily',icon:'<img class="nvI" src="ui/nv_daily.webp" alt="">',L:7,fn:()=>openDaily()},{k:'gallery',side:'bl',lb:'Gallery',icon:'<img class="nvI" src="ui/nv_gallery.webp" alt="">',L:3,fn:()=>openGallery()},
  {k:'shop',side:'tr',lb:'Shop',icon:'<img class="nvI" src="ui/nv_shop.webp" alt="">',L:10,fn:()=>openShop()},{k:'league',side:'br',lb:'Leagues',icon:'<img class="nvI" src="ui/nv_league.webp" alt="">',L:30,fn:()=>openLeague()}];
function refreshHome(){tickLives();
  $('#hCoins .v').textContent=S.coins;$('#hLives .v').textContent=S.lives;
  $('#hLives .sv').textContent=S.lives>=MAXL?'Full':fmt((REGEN-(Date.now()-S.livesTs))/1000);
  const def=levelDef(S.level);$('#sHome').style.setProperty('--roombg',`url(${libOf(S.level).bg})`);preloadLib(S.level);
  $('#hPlaySub').textContent='Level '+S.level;
  $('#hEasel').innerHTML=`<div class="frame">${teaser(prepareLevel(S.level))}</div><div class="q ol">?</div><div class="plate">Level ${S.level}${def.badge?` <span class="chip ${def.d>=9?'super':'hard'}">${def.badge}</span>`:''}</div>`;
  // 10-level band strip
  const b0=Math.floor((S.level-1)/10)*10+1;let st='';for(let i=0;i<10;i++){const l=b0+i,d=levelDef(l);st+=`<b class="${l<S.level?'on':''} ${d.d>=9?'peak':''}" title="Level ${l}"></b>`}$('#hStrip').innerHTML=`<span>${b0}</span>${st}<span>${b0+9}</span>`;
  {const box=$('#hNav');box.innerHTML='';[...['shop','daily'].map(k=>sideDefs.find(d=>d.k===k)),{k:'home',lb:'Home',icon:'<img class="nvI" src="ui/nv_home.webp?v=shelf1" alt="">',L:1,fn:()=>refreshHome()},...['gallery','league'].map(k=>sideDefs.find(d=>d.k===k))].forEach(d=>{const lock=S.level<d.L;const b=document.createElement('button');b.type='button';b.className='sbtn'+(lock?' locked':'')+(d.k==='home'?' active':'');if(d.k==='home')b.setAttribute('aria-current','page');
    b.innerHTML=`<span class="tile">${navIcon(d)}</span>${lock?`<span class="pad">${SVG.pad}</span><span class="lvl">Lv ${d.L}</span>`:''}<span class="lb ol">${d.lb}</span>`+(!lock&&d.k==='daily'&&S.daily.last!==today()?'<span class="dot">!</span>':'')+(!lock&&d.k==='shop'&&S.level>=15&&!S.starter?'<span class="dot">%</span>':'');
    b.onclick=()=>lock?toast(`${d.lb} opens at level ${d.L}`):d.fn();box.appendChild(b)})}slHomeBtns()}
setInterval(()=>{if(!$('#sHome').hidden){tickLives();$('#hLives .v').textContent=S.lives;$('#hLives .sv').textContent=S.lives>=MAXL?'Full':fmt((REGEN-(Date.now()-S.livesTs))/1000)}},1000);

function featureCheck(){ // one unlock announcement at a time
  const b=IN_LEVEL.concat(PRE).find(k=>S.level>=BOOST[k].unlock&&!S.gifted[k]);
  if(b){const B=BOOST[b];S.gifted[b]=1;S.inv[b]+=B.gift;save();
    boosterUnlockCard(b,featureCheck);return}
  const f=FEATURES.find(f=>S.level>=f.L&&!S.seenFeat[f.k]);
  if(f){S.seenFeat[f.k]=1;save();const d=sideDefs.find(s=>s.k===f.k);
    const p=popup({title:'Unlocked!',ribbon:'green',html:`<div style="width:110px;height:110px">${d.icon.replace('<svg','<svg style="width:110px;height:110px"').replace('<img','<img style="width:110px;height:110px"')}</div><div class="ptitle">${f.name}</div><div class="ptext">${f.text}</div><button class="btn wide" id="ok"><span class="t">Open</span></button>`});
    q(p,'#ok').onclick=()=>p.close(()=>d.fn());return}
  if(S.level>=15&&!S.starter&&!S.seenFeat.starterOffer){S.seenFeat.starterOffer=1;save();openShop()}}

/* ---------- shop ---------- */
function openShop(fromNeed){
  tickLives();const rvLeft=5-(S.rv.d===today()?S.rv.n:0);
  const COINS=[[700,'$0.99','dl_c1'],[3800,'$4.99','sh_c1'],[8500,'$9.99','sh_c2','POPULAR'],[19000,'$19.99','dl_bag'],[42000,'$39.99','sh_chest'],[100000,'$79.99','sh_case','BEST']];
  const it=(k,n)=>`<span class="shI"><img src="${k==='heart'?ICO.heart:bImg(k)}" alt=""><b class="ol">${n}</b></span>`;
  const banner=(id,cls,title,img,coins,items,price,extra='')=>`<div class="shB ${cls}" style="--i:${shN++}">${extra}<div class="shIn"><div class="shArt"><img src="${img}" alt="">${coins?`<b class="shCn ol">${coins.toLocaleString('en-US')}</b>`:''}</div>
      <div class="shItems">${items}</div><div class="shFoot"><span class="shT ol">${title}</span><button class="btn juicy shP" data-iap="${id}"><span class="t">${price}</span></button></div></div></div>`;
  let shN=0;
  const p=popup({title:'Shop',ribbon:'purple',cls:'tall wide shPop',html:`<div class="shTop"><div class="ctr"><img src="${ICO.coin}" alt=""><span class="v coinsV">${S.coins}</span></div>${fromNeed?'<span class="shNeed">Get coins to keep going</span>':''}</div>
    <div class="scroll shScroll">
     ${S.removeAds?'':`<div class="shB noads" style="--i:${shN++}"><div class="shIn"><div class="naL"><span class="naT ol">NO ADS</span><small>Removes ads between levels. Reward videos stay optional.</small></div>
        <img class="naI" src="ui/of_noads.webp" alt=""><button class="btn juicy shP" data-iap="noads"><span class="t">$4.99</span></button></div></div>`}
     ${S.offerPack?'':`<div class="shB orange sp" style="--i:${shN++}"><span class="shSeal ol">-${OFFER_PACK.off}%</span><div class="shIn"><div class="shArt"><img src="ui/sp_book.webp" alt=""><b class="shCn ol">${OFFER_PACK.coins.toLocaleString('en-US')}</b></div>
        <div class="shItems">${Object.entries(OFFER_PACK.inv).slice(0,3).map(([k,n])=>it(k,'×'+n)).join('')}</div><div class="shFoot"><span class="shT ol">SPECIAL OFFER</span><button class="btn juicy shP" data-sp><span class="t">${OFFER_PACK.price}</span></button></div></div></div>`}
     ${!S.starter?banner('starter','blue','STARTER PACK','ui/dl_c2.webp',1500,it('glove','×3')+it('lens','×2')+it('heart','Full'),'$1.99','<span class="shSeal ol">ONE<br>TIME</span>'):''}
     ${S.bundle?'':banner('bundle','orange','GALLERY BUNDLE','ui/sp_book.webp',5000,it('brush','×3')+it('key','×3')+it('glove','×2'),'$7.99','<span class="shSeal ol">-50%</span>')}
     ${banner('mega','purple','LIBRARY BUNDLE','ui/sh_case.webp',20000,it('brush','×5')+it('key','×5')+it('lens','×5'),'$19.99','<span class="shTag ol">★ POPULAR</span>')}
     <div class="shSect ol">Coins</div>
     <div class="shGrid">${COINS.map(([c,pr,im,tag],i)=>`<div class="shC" style="--i:${shN++}">${tag==='POPULAR'?'<span class="shCorner"><b class="ol">POPULAR</b></span>':tag==='BEST'?'<span class="shSeal sm ol">BEST<br>OFFER</span>':''}
        <div class="shCt"><img src="ui/${im}.webp" alt=""><b class="ol">${c.toLocaleString('en-US')}</b></div><div class="shCb"><button class="btn juicy sm" data-iap="c${i}"><span class="t">${pr}</span></button></div></div>`).join('')}</div>
     <div class="shFree" style="--i:${shN++}"><img src="ui/dl_c1.webp" alt=""><span class="shFt"><b class="ol">100 Coins</b><small>${rvLeft} free videos left today</small></span><button class="btn juicy" data-rv ${rvLeft<=0?'disabled':''}><span class="t">FREE</span><i class="shPlay">▶</i></button></div>
     <div class="shSect ol">Boosters</div>
     <div class="shGrid">${[['peek',3,250],['lens',3,400],['key',2,800],['glove',3,800],['brush',2,1100]].map(([k,n,c])=>`<div class="shC bst" style="--i:${shN++}"><div class="shCt"><img src="${bImg(k)}" alt=""><b class="ol">×${n}</b><small>${BOOST[k].name}</small></div>
        <div class="shCb"><button class="btn gold sm" data-bb="${k},${n},${c}"><img class="coin" src="${ICO.coin}" alt=""><span class="t">${c}</span></button></div></div>`).join('')}
       <div class="shC bst" style="--i:${shN++}"><div class="shCt"><img src="${ICO.heart}" alt=""><b class="ol">${S.lives>=MAXL?'Full':'Refill'}</b><small>${S.lives}/${MAXL} lives</small></div><div class="shCb"><button class="btn gold sm" data-lives ${S.lives>=MAXL?'disabled':''}><img class="coin" src="${ICO.coin}" alt=""><span class="t">900</span></button></div></div></div>
     <p class="ptext" style="font-size:12px;color:#D9C8FF;margin:4px 0 0">Prototype store. Purchases are simulated and free.</p>
    </div>`});
  const cg=n=>()=>S.coins+=n;
  const grants={starter:()=>{S.starter=true;S.coins+=1500;S.inv.glove+=3;S.inv.lens+=2;S.lives=MAXL},bundle:()=>{S.bundle=true;S.coins+=5000;S.inv.brush+=3;S.inv.key+=3;S.inv.glove+=2},
    mega:()=>{S.coins+=20000;S.inv.brush+=5;S.inv.key+=5;S.inv.lens+=5},noads:()=>{S.removeAds=true}};
  const prices={starter:'$1.99',bundle:'$7.99',mega:'$19.99',noads:'$4.99'},names={starter:'Starter Pack',bundle:'Gallery Bundle',mega:'Library Bundle',noads:'Remove Ads'};
  COINS.forEach(([c,pr],i)=>{grants['c'+i]=cg(c);prices['c'+i]=pr;names['c'+i]=c.toLocaleString('en-US')+' coins'});
  p.el.querySelectorAll('[data-iap]').forEach(b=>b.onclick=()=>{const k=b.dataset.iap;Sound.play('click');purchase(names[k],prices[k],()=>{grants[k]();save();p.close(()=>{openShop();refreshHome();if(G&&!$('#sGame').hidden)renderBoosters()})})});
  p.el.querySelectorAll('[data-bb]').forEach(b=>b.onclick=()=>{const [k,n,c]=b.dataset.bb.split(',');if(!spend(+c)){toast('Not enough coins');return}S.inv[k]+=+n;save();Sound.play('coin');const r=relRect(b.closest('.shC').querySelector('img'));burst(r.cx,r.cy,10);toast(`${BOOST[k].name} ×${n} added`);if(G&&!$('#sGame').hidden)renderBoosters()});
  {const sp=p.el.querySelector('[data-sp]');if(sp)sp.onclick=()=>{Sound.play('click');p.close(()=>openPackOffer())}}
  const rv=p.el.querySelector('[data-rv]');if(rv)rv.onclick=()=>showAd('rv',()=>{if(S.rv.d!==today())S.rv={d:today(),n:0};S.rv.n++;const r=relRect(rv);addCoins(100);coinFly(r,relRect(p.el.querySelector('.ctr')),6);p.close(openShop)});
  const lv=p.el.querySelector('[data-lives]');if(lv)lv.onclick=()=>{if(!spend(900)){toast('Not enough coins');return}S.lives=MAXL;S.livesTs=0;save();Sound.play('magic');p.close(()=>{refreshHome()})};}
function outOfLives(){tickLives();const p=popup({title:'No Lives',ribbon:'coral',html:`<img class="bigicon" src="${ICO.heart}" alt=""><div class="ptitle">Next life in ${fmt((REGEN-(Date.now()-S.livesTs))/1000)}</div>
  <button class="btn gold wide" id="lRef"><span class="t">Refill</span><img class="coin" src="${ICO.coin}" alt=""><span class="t">900</span></button><button class="btn purple wide" id="lRv"><span class="stack"><span class="t">+1 Life</span><span class="sub t">Watch a video</span></span></button>`});
  q(p,'#lRef').onclick=()=>{if(!spend(900)){p.close(()=>openShop(true));return}S.lives=MAXL;S.livesTs=0;save();p.close(()=>{refreshHome();openStart()})};
  q(p,'#lRv').onclick=()=>p.close(()=>showAd('rv',()=>{S.lives++;save();refreshHome();openStart()}))}

/* ---------- gallery ---------- */
function openGallery(){const artAt=typeof artOf==='function'?artOf:L=>ART[(L-1)%ART.length];const TK=Object.keys(THEMES);const albums=[];for(let s=0;s*10<ART.length;s++){const lv=[];for(let L=s*10+1;L<=Math.min(ART.length,s*10+10);L++)lv.push(L);albums.push({k:'set'+(s+1),name:'Levels '+lv[0]+'\u2013'+lv[lv.length-1],th:TK[s%TK.length],lv})}const tierOf=n=>n>=3?3:n>=2?2:n>=1?1:0;
  const p=popup({title:'Gallery',cls:'tall wide',html:`<div class="scroll">${albums.map(set=>{const al=set.k;const arts=set.lv.map(L=>artAt(L));const done=arts.filter(a=>S.arts[a.id]).length;const full=done===arts.length;
    return `<div class="album"><div class="albumHead"><span><i class="sw" style="background:${THEMES[set.th].sw}"></i>${set.name}</span><small>${done}/${arts.length}${full?(S.albums[al]?' · claimed':''):' · album prize 300'}</small></div>
    ${full&&!S.albums[al]?`<button class="btn gold sm" data-claim="${al}"><span class="t">Claim 300</span><img class="coin" src="${ICO.coin}" alt=""></button>`:''}
    <div class="albumBg" style="background-image:url(${THEMES[set.th].bg})"></div><div class="grid4">${arts.map((a,i)=>{const n=S.arts[a.id]||0,t=tierOf(n);const lv=set.lv[i];return `<button class="gcard t${t}" data-art="${a.id}" data-lv="${lv}"><i style="background-image:url(${a.file})"></i>${t?'':`<span class="lq ol">?</span>`}<div class="nm">${t?a.title:'Level '+lv}</div></button>`}).join('')}</div></div>`}).join('')}
    <p class="ptext" style="font-size:12px;color:var(--muted)">Frames upgrade at 1, 2 and 3 restorations. Every painting is an original parody of a public-domain masterpiece.</p></div>`});
  p.el.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{const al=b.dataset.claim;S.albums[al]=1;const r=relRect(b);addCoins(300);coinFly(r,{cx:r.cx,cy:-20},8);b.remove()});
  p.el.querySelectorAll('[data-art]').forEach(b=>b.onclick=()=>{const a=ART.find(x=>x.id===b.dataset.art);if(!S.arts[a.id]){toast('Restore it on the shelf to unlock');return}const RA=replayAuto(+b.dataset.lv);
    const v=popup({title:a.title.length>18?'Painting':a.title,cls:'wide',html:`<div class="thumb" style="width:min(300px,100%)"><i style="display:block;width:100%;height:100%;border-radius:6px;background:url(${a.file}) center/cover"></i></div><div class="artname">${a.title}</div><div class="after">${a.after}</div><div class="ptext" style="font-size:15px;margin:0"><b>Restored ${S.arts[a.id]}×</b></div><div class="ptext" style="font-size:13px;margin-top:-4px">${RA.easier?'A bit easier':'A bit harder'} this time: ${RA.rows}×${RA.cols} books. No life needed.</div>
      <button class="btn adBtn wide" id="rpAd"><img class="adI" src="ui/ad_icon.webp" alt=""><span class="stack"><span class="t">Replay</span><span class="sub t">Watch a video · +${RA.reward}</span></span></button>`});
    q(v,'#rpAd').onclick=()=>showAd('rv',()=>{closeAll();startReplay(a,RA)})})}
/* the replay's difficulty is picked for the player (Unity BookshelfGallery.ReplayLevel, 2026-11-04):
   a Hard / Super Hard level comes back two steps easier on a shelf one row smaller, any other two
   steps harder on a shelf one row larger (up to five rows); paid with a rewarded video */
function replayAuto(L){const b=levelDef(L),easier=b.d>=7,d=Math.max(2,Math.min(9,easier?b.d-2:b.d+2));
  const rows=easier?Math.max(2,b.rows-1):b.rows<5?b.rows+1:b.rows;
  return{label:easier?'Easier':'Harder',easier,rows,cols:b.cols,d,reward:d>=9?140:d>=7?100:d>=6?80:55,btn:'purple',col:easier?'#38B24A':'#F0584A'}}
const REPLAY=[{label:'Relaxed',rows:2,cols:5,d:2,reward:30,btn:'',col:'#38B24A'},{label:'Normal',rows:3,cols:6,d:4,reward:60,btn:'gold',col:'#E9A21C'},
  {label:'Hard',rows:4,cols:7,d:6,reward:100,btn:'coral',col:'#F0584A'},{label:'Expert',rows:5,cols:8,d:8,reward:160,btn:'purple',col:'#8A4FE0'}];
function startReplayRaw(art,r){const n=r.rows*r.cols,cnt=(S.replayN=(S.replayN||0)+1);save();
  const base=levelDef(Math.max(1,S.level-1));
  const def=Object.assign({},base,{rows:r.rows,cols:r.cols,n,d:r.d,role:'replay',badge:'',reward:r.reward,mods:{locks:0,lockHp:1,links:0,hidden:0},art,seed:9001+cnt*131+n});
  const R=rng(def.seed),order=shuffleOrder(n,r.cols,R),opt=n-cycles(order);const big=n>=FRAME_MIN;
  const moves=Math.max(3,Math.ceil(opt*(big?MOVE_K_FRAME[r.d]:MOVE_K[r.d]))+(big?2:0));
  startLevel({def,order,locks:{},links:[],hidden:[],moves,opt},{replay:{...r,art}})}
function replayFail(){const RP=G.replay,art=G.art;
  const p=popup({title:'Out of Moves',ribbon:'coral',close:false,html:`<div class="ptext">No life lost — it's a replay. Shuffle the shelf and try again?</div>
    <button class="btn wide" id="fRetry"><span class="t">Try Again</span></button><button class="link" id="fHome">Home</button>`});
  q(p,'#fRetry').onclick=()=>p.close(()=>startReplay(art,RP));q(p,'#fHome').onclick=()=>p.close(()=>goHome(false))}

/* ---------- daily ---------- */
const DAILY=[{c:100,im:'dl_c1'},{c:150,im:'dl_c2'},{b:'lens',n:1},{c:200,im:'dl_c2'},{b:'glove',n:1},{c:250,im:'dl_bag'},{c:500,b:'brush',n:1,im:'dl_gift'}];
function openDaily(){const can=S.daily.last!==today();const d=S.daily.day%7;
  const st=i=>i<d?'done':i===d?(can?'today':'next'):'';
  const ic=r=>r.im?`ui/${r.im}.webp`:bImg(r.b);
  const cell=(r,i)=>{const s=st(i);
    if(i===6)return `<div class="dc big ${s}" style="--i:${i}"><span class="dcD">Day 7</span><span class="dcR"></span><img class="dcI" src="${ic(r)}" alt="">
      <div class="dcBig"><div class="dcBigT ol">Grand Gift</div><div class="dcBigR"><span><img src="${ICO.coin}" alt=""><b class="ol">${r.c}</b></span><span><img src="${ICO.brush}" alt=""><b class="ol">×${r.n}</b></span></div></div>
      ${s==='done'?'<span class="dcOk">✓</span>':''}${s==='today'?'<span class="dcTag ol">TODAY</span>':''}</div>`;
    return `<div class="dc ${s}" style="--i:${i}"><span class="dcD">${s==='today'?'Today':'Day '+(i+1)}</span>${s==='today'?'<span class="dcR"></span>':''}<img class="dcI" src="${ic(r)}" alt=""><b class="dcA ol">${r.b?'×'+r.n:r.c}</b>
      ${s==='done'?'<span class="dcOk">✓</span>':''}</div>`};
  const left=()=>{const n=new Date(),t=new Date(n);t.setHours(24,0,0,0);const s=Math.floor((t-n)/1000);return `${Math.floor(s/3600)}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};
  const p=popup({title:'Daily Gifts',ribbon:'green',cls:'wide dlPop',html:`<div class="dlSub">Come back every day — gifts get bigger!</div><div class="dcs">${DAILY.map(cell).join('')}</div>
    <button class="btn wide big ${can?'juicy':'grey'}" id="dClaim" ${can?'':'disabled'}><span class="t">${can?'Claim':'Next gift '+left()}</span></button>`});
  if(!can){const iv=setInterval(()=>{const b=q(p,'#dClaim');if(!b||p.closed){clearInterval(iv);return}b.querySelector('.t').textContent='Next gift '+left()},1000)}
  q(p,'#dClaim').onclick=e=>{if(!can)return;const r=DAILY[d];S.daily.last=today();S.daily.day++;if(r.b)S.inv[r.b]+=r.n;save();e.currentTarget.disabled=true;
    const card=q(p,'.dc.today'),from=relRect(card.querySelector('.dcI'));card.classList.add('claim');burst(from.cx,from.cy,18,{spread:90});Sound.play('win');buzz('success');
    if(r.c){addCoins(r.c);setTimeout(()=>coinFly(from,relRect($('#hCoins')),10),250)}
    if(r.b){const fl=document.createElement('img');fl.src=bImg(r.b);fl.className='dlFly';fx.appendChild(fl);fl.animate([{transform:`translate(${from.cx-30}px,${from.cy-30}px) scale(1)`},{transform:`translate(${from.cx-30}px,${from.cy-110}px) scale(1.5)`,offset:.4},{transform:`translate(${from.cx-30}px,${from.cy-160}px) scale(.6)`,opacity:0}],{duration:900,easing:'cubic-bezier(.3,.7,.3,1)'}).onfinish=()=>fl.remove()}
    setTimeout(()=>{card.classList.remove('today');card.classList.add('done');card.querySelector('.dcTag')?.remove();card.querySelector('.dcR')?.remove();card.insertAdjacentHTML('beforeend','<span class="dcOk stamp">✓</span>')},450);
    setTimeout(()=>p.close(()=>{refreshHome();$('#hCoins').classList.add('bump');setTimeout(()=>$('#hCoins').classList.remove('bump'),500)}),1400)}}

/* ---------- league (bots) ---------- */
const BOTS=['BookWorm_88','Mila R.','ArtFox','Jonas','Pixel Pam','QuietReader','Leo the Great','Sunny','Kat_Paints','Owlish','Marta','VanGoghGetter','Tomoko','Biblio Bill','Daisy','Hugo','ShelfieQueen','Ravi','Nora','Max P.'];
function openLeague(){const wk=weekKey();if(S.league.week!==wk)S.league={week:wk,pts:0};
  const now=new Date(),day=(now.getDay()+6)%7,hrs=day*24+now.getHours()+now.getMinutes()/60;const R=rng(wk.split('').reduce((a,c)=>a*31+c.charCodeAt(0),7)>>>0);
  const rows=BOTS.slice(0,19).map((n,i)=>{const rate=.2+R()*2.4;return{n,pts:Math.round(rate*hrs+R()*8),c:['#53D96B','#69CBF5','#FF735F','#A77AF4','#FFC548'][i%5]}});
  rows.push({n:'You',pts:S.league.pts,me:1,c:'#357BE8'});rows.sort((a,b)=>b.pts-a.pts||(a.me?-1:1));
  const left=(7-day)*24-now.getHours();
  const p=popup({title:'Silver League',ribbon:'',cls:'tall wide',html:`<div class="row" style="gap:14px">${SVG.trophy.replace('<svg','<svg style="width:54px;height:54px"')}<div class="ptext" style="text-align:left;font-size:14px">Win levels to earn points. Harder levels give more.<br><b>Ends in ${Math.floor(left/24)}d ${left%24}h</b> · Top 5 move up to Gold</div></div>
    <div class="scroll">${rows.map((r,i)=>`${i===5?'<div class="zone up">▲ Promotion zone above</div>':''}${i===17?'<div class="zone dn">▼ Demotion zone below</div>':''}<div class="lrow ${r.me?'me':''}"><span class="rk ${i<3?'r'+(i+1):''}">${i+1}</span><span class="av" style="background:${r.c}">${r.n[0]}</span><span class="nm">${r.n}</span><span class="pts">${r.pts}</span></div>`).join('')}</div>`})}

/* v12 difficulty curve: real level definitions and the 25% move budget */
const CURVE_MECHANICS=[
  {L:1,name:'Swap books',how:'Drag a book onto another to exchange them.'},
  {L:1,name:'Gold pins',how:'A book placed correctly stays fixed.'},
  {L:2,name:'Glued blocks',how:'Matching neighbours join and move together.'},
  {L:MECH.locks,name:'Locks',how:'Two nearby merges make a key open the lock.'},
  {L:MECH.stars,name:'Star books',how:'Place the star book correctly for +3 moves.'},
  {L:MECH.links,name:'Tied books',how:'They hold hands and move together. A merge beside the pair makes them let go.'},
  {L:MECH.hidden,name:'Hidden books',how:'Join neighbours to reveal the hidden picture.'},
  {L:MECH.ticks,name:'Ticking books',how:'Place the ticking book before zero or lose 3 moves.'},
  {L:MECH.keyBook,name:'Key book',how:'Place the key book to open every lock.'}
];
const curveBase=L=>SOLVED_MOVE_COST[L-1];
const curveBudget=L=>levelBudget(L,curveBase(L));
function curveSvg(from,to,metric){
  const w=330,h=metric==='difficulty'?136:112,left=32,right=9,top=20,bottom=23;
  const max=metric==='difficulty'?9:metric==='books'?54:80,min=metric==='difficulty'?2:0;
  const x=L=>left+(L-from)/(to-from)*(w-left-right);
  const y=v=>top+(max-v)/(max-min)*(h-top-bottom);
  const levels=Array.from({length:to-from+1},(_,i)=>from+i);
  const values=metric==='difficulty'?[['difficulty',L=>levelDef(L).d]]:
    metric==='books'?[['books',L=>levelDef(L).n]]:
    [['budget',curveBudget],['clean',curveBase]];
  const guides=(metric==='difficulty'?[2,4,6,8,9]:metric==='books'?[0,18,36,54]:[0,20,40,60,80])
    .map(v=>`<path d="M${left} ${y(v)}H${w-right}" class="curve-grid"/><text x="${left-5}" y="${y(v)+4}" text-anchor="end">${v}</text>`).join('');
  const tens=levels.filter(L=>L>from&&L<to&&(L-1)%10===0).map(L=>`<path d="M${x(L-.5).toFixed(1)} ${top}V${h-bottom}" class="curve-ten"/>`).join('');
  const paths=values.map(([cls,fn])=>`<path class="curve-line ${cls}" d="${levels.map((L,i)=>`${i?'L':'M'}${x(L).toFixed(1)} ${y(fn(L)).toFixed(1)}`).join(' ')}"/>`).join('');
  const intro=metric==='difficulty'?CURVE_MECHANICS.filter(m=>m.L>=from&&m.L<=to).map(m=>
    `<circle cx="${x(m.L)}" cy="${y(levelDef(m.L).d)}" r="4.5" class="curve-mechanic"><title>Level ${m.L}: ${m.name}</title></circle>`).join(''):'';
  const label=metric==='difficulty'?'Design difficulty d':metric==='books'?'Books N = shelves × books per shelf':'Moves: +50% buffer / clean path';
  return `<svg class="curve-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}, levels ${from} to ${to}"><rect x="${left}" y="${top}" width="${w-left-right}" height="${h-top-bottom}" class="curve-frame"/>${guides}${tens}${paths}${intro}<text x="${left}" y="12" class="curve-axis">${label}</text><text x="${left}" y="${h-4}" class="curve-axis">${from}</text><text x="${w-right}" y="${h-4}" text-anchor="end" class="curve-axis">${to}</text></svg>`
}
/* v12 curve: one page = 50 levels; on top a table per ten (books, shelves, moves, category) */
const curveCat=d=>d>=9?'super':d>=7?'hard':d>=4?'med':'norm';
function curveTens(from,to){let out='';
  for(let a=from;a<=to;a+=10){const ls=Array.from({length:Math.min(10,to-a+1)},(_,i)=>a+i),ten=Math.floor((a-1)/10)+1;
    const row=(name,fn,cls='')=>`<tr${cls?` class="${cls}"`:''}><th>${name}</th>${ls.map(L=>`<td data-lv="${L}">${fn(L)}</td>`).join('')}</tr>`;
    out+=`<table class="curve-tens"><caption>Ten ${ten} · levels ${a}–${ls[ls.length-1]}</caption>
      ${row('Level',L=>L,'lv')}${row('Books',L=>levelDef(L).n)}${row('Shelves',L=>levelDef(L).rows)}
      ${row('Min moves',curveBase)}${row('Given',curveBudget,'given')}
      <tr class="cat"><th>Category</th>${ls.map(L=>{const d=levelDef(L).d;return `<td data-lv="${L}"><i class="${curveCat(d)}">d${d}</i></td>`}).join('')}</tr></table>`}
  return out}
function openDifficultyCurve(){
  const p=popup({title:'Difficulty Curve',cls:'tall wide',html:`<div class="scroll curve-scroll">
    <div class="curve-nav"><button class="btn grey sm" data-step="-1" aria-label="Previous 50 levels"><span class="t">‹</span></button><strong class="curve-range"></strong><button class="btn grey sm" data-step="1" aria-label="Next 50 levels"><span class="t">›</span></button></div>
    <div class="curve-catkey"><i class="norm">d</i>Easy <i class="med">d</i>Medium <i class="hard">d</i>Hard <i class="super">d</i>Super Hard · Given = min moves +50% (at least +3), levels 1–50 follow the level table (buffer % and extra moves per level)</div>
    <div class="curve-tables"></div>
    <div class="curve-detail"></div>
    <div class="curve-legend"><i class="budget"></i>Moves with +50% buffer <i class="clean"></i>Found clean path</div>
    <div class="curve-explain">Min moves = the clean path found by a solver, not proven globally shortest. Given = min moves × 1.5 rounded up, and at least min + 3; levels 1–5 get +2 moves on top while the player learns. Star bonuses and ticking penalties are included. Difficulty d is a design index, not a measured win rate. Vertical lines on the charts split the tens.</div>
    <div class="curve-heading">New mechanics · first appearance</div><div class="curve-events"></div>
    <div class="curve-heading">Boosters</div><div class="curve-boosters"></div></div>`});
  let band=Math.floor((Math.min(350,Math.max(1,S.level))-1)/50),mark=0;
  q(p,'.curve-events').innerHTML=CURVE_MECHANICS.map(m=>`<button class="curve-event" data-jump="${m.L}"><b>${m.L}</b><span><strong>${m.name}</strong><small>${m.how}</small></span></button>`).join('');
  q(p,'.curve-boosters').innerHTML=Object.values(BOOST).filter(b=>b.unlock).map(b=>`<div class="curve-booster"><b>${b.unlock}</b><span>${b.name} · ${b.desc}</span></div>`).join('');
  const draw=()=>{const from=band*50+1,to=Math.min(350,from+49);
    q(p,'.curve-range').textContent=`Levels ${from}–${to}`;
    q(p,'.curve-tables').innerHTML=curveTens(from,to);
    q(p,'.curve-detail').innerHTML=curveSvg(from,to,'difficulty')+curveSvg(from,to,'books')+curveSvg(from,to,'moves');
    p.el.querySelectorAll(`.curve-tens td[data-lv="${mark}"]`).forEach(td=>td.classList.add('mark'));
    q(p,'[data-step="-1"]').disabled=band===0;q(p,'[data-step="1"]').disabled=band===6};
  p.el.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{band=Math.max(0,Math.min(6,band+Number(b.dataset.step)));draw();q(p,'.curve-scroll').scrollTop=0});
  p.el.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{mark=Number(b.dataset.jump);band=Math.floor((mark-1)/50);draw();
    const td=q(p,`.curve-tens td[data-lv="${mark}"]`);td&&td.closest('table').scrollIntoView({block:'nearest',behavior:'smooth'})});
  draw();
}

/* ---------- settings ---------- */
/* v12 settings: grouped (patch_v12_settings) */
const SET_GROUPS=[['Sound',[['sfx','Sound'],['music','Music'],['haptics','Vibration']]],
  ['Gameplay',[['glueLock','Glued books never split','A glued pair stays together even when it is not on its spot yet']]],
  ['Look',[['minimalUi','Minimalistic UI','Dark library theme with line icons (from v10)'],['bookCaps','Book tops','Varied heights come from a leather top above the picture. Off: all books the same height. The picture is never cut']]]];
function settingsRows(){return SET_GROUPS.map(([g,rows])=>`<div class="setGrp"><span class="lbl">${g}</span>${rows.map(([k,l,h])=>`<div class="set"><span class="setL">${l}${h?`<small>${h}</small>`:''}</span><button class="tg ${S.settings[k]?'on':''}" data-set="${k}" aria-label="${l}"></button></div>`).join('')}</div>`).join('')}
function bindSettings(p){p.el.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{const k=b.dataset.set;S.settings[k]=!S.settings[k];b.classList.toggle('on',S.settings[k]);Sound.musicSync();save();if(k==='minimalUi')applyUiStyle();if(k==='bookCaps'&&typeof G!=='undefined'&&G&&!$('#sGame').hidden)layout(G.solved,true)})}
function toolsHTML(){return `<details class="setTools"><summary class="lbl">Prototype tools</summary><button class="btn blue wide" id="showCurve"><span class="t">Difficulty Curve · 350 levels</span></button><div class="dbg">
   <button class="btn gold" data-d="t40"><span class="t">Test 40</span></button><button class="btn gold" data-d="t48"><span class="t">Test 48</span></button><button class="btn gold" data-d="t54"><span class="t">Test 54</span></button><button class="btn grey" data-d="lm"><span class="t">Level −10</span></button><button class="btn grey" data-d="lp"><span class="t">Level +10</span></button><button class="btn grey" data-d="l1"><span class="t">Level +1</span></button>
   <button class="btn grey" data-d="coins"><span class="t">+1000 coins</span></button><button class="btn grey" data-d="lives"><span class="t">Lose lives</span></button><button class="btn grey" data-d="day"><span class="t">Next day</span></button><button class="btn coral" data-d="reset"><span class="t">Reset</span></button></div></details>`}
function bindTools(p){q(p,'#showCurve').onclick=()=>p.close(openDifficultyCurve);
  const tl=q(p,'.setTools');tl.ontoggle=()=>p.el.classList.toggle('toolsOpen',tl.open); // tools replace the setting rows, the popup has no room for both
  p.el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const d=b.dataset.d;
    if(d[0]==='t'&&d[1]!=='d'){const g={t40:[5,8],t48:[6,8],t54:[6,9]}[d];if(g){p.close(()=>testLevel(g[0],g[1]));return}}
    if(d==='lm')S.level=Math.max(1,S.level-10);if(d==='lp')S.level+=10;if(d==='l1')S.level++;if(d==='coins')S.coins+=1000;if(d==='lives'){S.lives=0;S.livesTs=Date.now()}
    if(d==='day')S.daily.last='';
    if(d==='reset'){if(b.dataset.armed){S=JSON.parse(JSON.stringify(DEF));applyUiStyle()}else{b.dataset.armed=1;b.querySelector('.t').textContent='Tap again';return}}
    save();refreshHome();toast(d==='reset'?'Progress reset':'Done · level '+S.level)})}
function openSettings(){const p=popup({title:'Settings',html:`${settingsRows()}${toolsHTML()}<p class="ptext" style="font-size:12px;color:var(--muted)">Paintings are original cartoon parodies of public-domain masterpieces.</p>`});
  bindSettings(p);bindTools(p)}

/* =========================================================
   BOOT
   ========================================================= */
$('#hSettings').innerHTML='<img src="ui/i_settings.png?v=settings-both-20261027" alt="">';$('#gSettings').innerHTML='<img src="ui/i_settings.png?v=settings-both-20261027" alt="">';$('#gEye').innerHTML=`<img src="${ICO.peek}" alt="">`;

/* Minimalistic UI (v10 theme, patch_v12_settings) */
const SVG_MINIMAL={
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
 pause:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 5v14M15.5 5v14"/></svg>',
 x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 tick:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5 10-10"/></svg>',
 star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17.1 6.6 20l1.1-6.1L3.2 9.6l6.1-.8z"/></svg>',
 pad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
 trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5.5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13.5v4M8.5 20h7"/></svg>',
 gift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5h16V21H4zM3 7h18v3.5H3zM12 7v14M12 7c-2.2-4-6.2-3-5.2-1s5.2 1 5.2 1zm0 0c2.2-4 6.2-3 5.2-1S12 7 12 7z"/></svg>',
 frame:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17"/><rect x="7" y="7" width="10" height="10"/></svg>',
 ribbon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18v4H3z"/><circle cx="12" cy="12" r="3.2"/></svg>',
 q:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="1"/><text x="12" y="16.5" font-size="11" text-anchor="middle" fill="#d2ab63" stroke="none" font-family="Georgia,serif">?</text></svg>',
 hand:'<svg viewBox="0 0 54 66"><path d="M19 5c0-4.6 7.5-4.6 7.5 0v24.5l2.8-.6c2.9-.6 5.4 1 5.8 3.6l1.4-.4c2.9-.6 5.4 1.1 5.8 3.8l1.3-.2c2.9-.3 5.2 1.7 5.2 4.6v11.4C48.8 60 42 64 34 64h-3.6c-6.2 0-10.7-3.2-13.4-8.6L7.5 39.8c-1.9-3.6 2.7-7.6 6.3-4.5L19 40z" fill="#fff" stroke="#3B2414" stroke-width="3" stroke-linejoin="round"/></svg>',
};
const ICO_CLASSIC={...ICO},MIN_ICONS=['bookmark', 'books', 'brush', 'coin', 'glove', 'glue', 'heart', 'key', 'lens', 'peek'];
const SET_IMG='ui/i_settings.png?v=settings-both-20261027';
window.__minSvg=SVG_MINIMAL;
function navIcon(d){const m=window.__minSvg;if(!S.settings.minimalUi||!m)return d.icon;
  if(d.k==='shop')return `<img src="${ICO.coin}" alt="">`;if(d.k==='home')return '<img class="nvI" src="ui/min/i_books.svg" alt="">';
  return m[{daily:'gift',gallery:'frame',league:'trophy'}[d.k]]||d.icon}
function applyUiStyle(){const on=!!S.settings.minimalUi;let ms=document.getElementById('minimalStyle');
  if(!ms){ms=document.createElement('link');ms.id='minimalStyle';ms.rel='stylesheet';ms.href='theme-minimal.css';document.body.appendChild(ms)} // appended last: beats v12's own <style> blocks
  ms.media=on?'all':'not all'; // .disabled on a script-added <link> is reset by Chrome when it loads
  document.body.classList.toggle('minimal',on);
  const gear=on?SVG_MINIMAL.gear:`<img src="${SET_IMG}" alt="">`;['#hSettings','#gSettings'].forEach(s=>{const e=$(s);if(e)e.innerHTML=gear});
  for(const k of Object.keys(ICO_CLASSIC)){const to=on&&MIN_ICONS.includes(k)?`ui/min/i_${k}.svg`:ICO_CLASSIC[k];
    if(ICO[k]!==to){const from=ICO[k];document.querySelectorAll('img').forEach(img=>{if(img.getAttribute('src')===from)img.src=to});ICO[k]=to}}
  if(G&&!$('#sGame').hidden)renderBoosters();if(!$('#sHome').hidden)refreshHome()}
$('#hSettings').onclick=openSettings;$('#gSettings').onclick=pauseMenu;$('#gCoins .plus').onclick=()=>S.level>=10?openShop():toast('Shop opens at level 10');
$('#hPlay').onclick=()=>{Sound.init();openStart()};
$('#hCoins .plus').onclick=()=>S.level>=10?openShop():toast('Shop opens at level 10');
$('#hLives .plus').onclick=()=>{tickLives();S.lives>=MAXL?toast('Lives are full'):outOfLives()};
applyUiStyle();
/* preload images so swaps never flash */
[...ART.map(a=>a.file),...Object.values(ICO),'ui/home_bg.jpg'].forEach(s=>{const i=new Image();i.src=s});
window.__dbg={S:()=>S,blockedBy:(a,b,c)=>blockedBy(a,b,c),groupOf:i=>groupOf(i),G:()=>G,bestMove:()=>bestMove(),commit:o=>commit(o),levelDef,prepareLevel};

/* glue: horizontal only (patch_glue_h.py, 2026-10-21) */
/* =========================================================
   EVENTS v8.3 — Art Slide (пятнашки) + Odd Book (найди лишнюю книгу)
   Бустеры ивентов: сначала из инвентаря, потом за монеты. Туториалы. Гранд-приз: 3 эксклюзивных уровня основной механики.
   ========================================================= */
var SLIDE_LV=[[2,2,3],[2,3,6],[3,3,10],[3,3,18],[2,4,12],[3,4,22],[3,3,40],[4,4,28],[3,4,48],[4,4,50],[3,5,60],[4,4,220]];
var SLIDE_ART=ART.slice(-12); // плейсхолдер: заменить на сгенерированные эксклюзивы
var SLIDE_PRIZE=1000;
var ODD_LV=[[3,3,['foreign']],[3,3,['foreign','upside']],[3,3,['faded','foreign']],[4,4,['upside','foreign','faded']],[4,4,['foreign','upside','foreign']],
  [4,4,['faded','upside','foreign']],[5,5,['foreign','faded','upside','foreign']],[5,5,['upside','foreign','faded','foreign']],[5,5,['foreign','upside','faded','upside','foreign']],[6,6,['faded','foreign','upside','foreign','faded']]];
var ODD_ART=[4,11,19,25,33,40,46,53,60,67];
var ODD_FOREIGN=[49,48,70,69,32,34,22,36,23,52]; // по цвету: ур.1-4 максимально непохожие → 8-10 похожие
var EVP={reset:30,nums:40,peek:40,lens:60,brush:120,glove:100}; // цена бустера в ивенте, если в инвентаре пусто
var EVNAME={nums:'Number Tags',reset:'Reshuffle'};const EVCOIN=new Set(['nums','reset']);const evName=k=>EVNAME[k]||BOOST[k].name;
var EVICO={reset:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="#A9D8FF" stroke="#2156B8" stroke-width="3"/><path d="M33 24a9 9 0 11-2.8-6.5" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/><path d="M31.5 11v7.5H24" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'),nums:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="3" y="8" width="42" height="32" rx="9" fill="#FFE08A" stroke="#A86A12" stroke-width="3"/><text x="24" y="31.5" font-family="Arial Black,Arial" font-weight="900" font-size="17" text-anchor="middle" fill="#69452D">123</text></svg>')};
const evIco=k=>EVICO[k]||ICO[k];
var EVPEEK_S=3,EVNUMS_S=5;
var EXCL={
  slide:[{a:SLIDE_ART[2],rows:3,cols:5,d:4,reward:200,inv:{lens:2}},{a:SLIDE_ART[6],rows:4,cols:6,d:6,reward:300,inv:{brush:1,glove:1}},{a:SLIDE_ART[11],rows:5,cols:7,d:8,reward:500,inv:{brush:2,key:1}}],
  odd:[{a:ART[ODD_ART[1]],rows:3,cols:5,d:4,reward:200,inv:{lens:2}},{a:ART[ODD_ART[5]],rows:4,cols:6,d:6,reward:300,inv:{glove:2}},{a:ART[ODD_ART[9]],rows:5,cols:7,d:8,reward:500,inv:{glove:1,brush:1}}]};
if(!S.slide||typeof S.slide!=='object')S.slide={next:0,stars:{},prize:0,nums:false};
if(!S.odd||S.odd.v!==4)S.odd={v:4,next:0,stars:{},prize:0};
if(!S.excl)S.excl={slide:{},odd:{}};
if(!S.evTut)S.evTut={};
var SL=null,OD=null;
const SLSVG={
  icon:'<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="9" fill="#5634A3"/><g stroke="#A86A12" stroke-width="1.2">'+
    [[8,8],[20,8],[32,8],[8,20],[20,20],[32,20],[8,32],[20,32]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width="10" height="10" rx="2.5" fill="${i%2?'#FFC548':'#FFE08A'}"/>`).join('')+
    '</g><rect x="32" y="32" width="10" height="10" rx="2.5" fill="none" stroke="#C29BFF" stroke-width="1.5" stroke-dasharray="2 2"/><path d="M30 37h-3.5m0 0l2-2m-2 2l2 2" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  back:'<svg viewBox="0 0 32 32"><path d="M19 7l-9 9 9 9" fill="none" stroke="#8A583B" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  reset:'<svg viewBox="0 0 32 32"><path d="M25 16a9 9 0 11-3-6.7" fill="none" stroke="#8A583B" stroke-width="4" stroke-linecap="round"/><path d="M23.5 3.5v7h-7" fill="none" stroke="#8A583B" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  eye:'<svg viewBox="0 0 32 32"><path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16z" fill="#fff" stroke="#8A583B" stroke-width="2.5"/><circle cx="16" cy="16" r="5" fill="#357BE8"/><circle cx="17.5" cy="14.5" r="1.6" fill="#fff"/></svg>',
  odd:'<svg viewBox="0 0 48 48"><rect x="6" y="7" width="11" height="33" rx="2.5" fill="#FF735F" stroke="#A8301F" stroke-width="2"/><rect x="17" y="10" width="10" height="30" rx="2.5" fill="#FFE08A" stroke="#A86A12" stroke-width="2"/><rect x="28" y="6" width="10" height="34" rx="2.5" fill="#53D96B" stroke="#1F7E3B" stroke-width="2" transform="rotate(9 33 23)"/><circle cx="29" cy="29" r="8.5" fill="rgba(255,255,255,.5)" stroke="#fff" stroke-width="3.5"/><path d="M35 35l6.5 6.5" stroke="#fff" stroke-width="5" stroke-linecap="round"/><text x="29" y="33.5" font-size="12" font-weight="900" text-anchor="middle" fill="#2156B8" font-family="Arial">?</text></svg>'
};
const slStars=(n,cls='')=>`<span class="slSt ${cls}">${[1,2,3].map(i=>SVG.star.replace('<svg',`<svg class="${i<=n?'':'off'}"`)).join('')}</span>`;
function slLeft(){const d=new Date(),e=new Date(d);e.setHours(24,0,0,0);while(e.getDay()!==1)e.setDate(e.getDate()+1);const s=(e-d)/1000;
  const dd=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return dd?`${dd}d ${h}h`:`${h}h ${m}m`}
const evDone=ev=>ev==='slide'?Object.keys(S.slide.stars).length>=SLIDE_LV.length:Object.keys(S.odd.stars).length>=ODD_LV.length;

/* ---------- home buttons ---------- */
/* v12: Quest + Shield Arena вместо Art Slide / Odd Book (логика из v8.2) */
const SHIELD_NAMES=['Mia','Theo','Zara','Finn','Ivy','Milo','Sana','Ezra','Juno','Nia','Rook','Lola','Kai','Ava','Leo','Pixie','Bruno','Noah','Lyra','Oscar'];
const SHIELD_MULT=[1,2,3,5,10],LAVA_N=5,LAVA_PRIZE=500;
function ev12(){if(!S.ev12)S.ev12={lava:{step:0,chests:0},shield:{start:Date.now(),points:0,streak:0}};const s=S.ev12.shield;
  if(Date.now()-s.start>=864e5){s.start=Date.now();s.points=0;s.streak=0}return S.ev12}
function shieldLeft(){return Math.max(0,ev12().shield.start+864e5-Date.now())}
function shieldTime(){const m=Math.ceil(shieldLeft()/6e4);return `${Math.floor(m/60)}h ${String(m%60).padStart(2,'0')}m`}
function shieldBoard(){const s=ev12().shield,el=Math.min(24,Math.max(0,(Date.now()-s.start)/36e5));
  return [{name:'You',points:s.points,me:true},...SHIELD_NAMES.map((name,i)=>({name,points:Math.floor((i%5)+1+el*(.38+(20-i)*.095))}))].sort((a,b)=>b.points-a.points||(a.me?-1:b.me?1:0))}
function ev12Result(win){const e=ev12(),s=e.shield;skyResult(win);
  if(win){e.lava.step++;if(e.lava.step>=LAVA_N){e.lava.step=0;e.lava.chests++;S.coins+=LAVA_PRIZE;e.lava.prize=1}
    s.points+=SHIELD_MULT[Math.min(s.streak,4)];s.streak++}
  else{e.lava.step=0;s.streak=0}save()}
function openLavaHub(){const e=ev12().lava;
  const steps=Array.from({length:LAVA_N},(_,i)=>`<span class="lqS ${i<e.step?'on':''}">${i+1}</span>`).join('')+`<img class="lqC" src="${ICO.coin}" alt="">`;
  const p=popup({title:'Quest',ribbon:'coral',html:`<img class="ev12Hero" src="ui/ev_quest.webp?v=water-shark-20261103" alt=""><div class="lqRow">${steps}</div>
    <div class="ptext">Win <b>${LAVA_N} levels in a row</b> to reach the treasure island and open the chest: <b>+${LAVA_PRIZE} coins</b>. A loss sends you back to the start.</div>
    <div class="ptext" style="font-size:13px;opacity:.75">Chests opened: ${e.chests}</div><button class="btn wide juicy" id="ok"><span class="t">Play</span></button>`});
  q(p,'#ok').onclick=()=>p.close(()=>openStart())}
function openShieldHub(){const s=ev12().shield,bd=shieldBoard(),me=bd.findIndex(x=>x.me)+1;
  const rows=bd.slice(0,10).map((x,i)=>`<div class="saR ${x.me?'me':''}"><b>${i+1}</b><span>${x.name}</span><em>${x.points}</em></div>`).join('')+(me>10?`<div class="saR me"><b>${me}</b><span>You</span><em>${s.points}</em></div>`:'');
  const p=popup({title:'Shield Arena',ribbon:'',cls:'tall',html:`<img class="ev12Hero" src="ui/ev_shield.webp" alt="">
    <div class="ptext">Each win earns shields: <b>×${SHIELD_MULT[Math.min(s.streak,4)]}</b> for your next win (streak ${s.streak}). Ends in <b>${shieldTime()}</b>.</div>
    <div class="saB">${rows}</div><button class="btn blue wide" id="ok"><span class="t">Play</span></button>`});
  q(p,'#ok').onclick=()=>p.close(()=>openStart())}
/* v12 Sky Lift v2 (2026-11-09): шар поднимается за каждую победу, чекпоинты-платформы с сундуками, проигрыш роняет до последнего чекпоинта */
const SKY_CP=[2,5,8,11,15,20,25,30,40,50,60],SKY_REWARD=[40,60,80,100,130,160,200,250,300,400,600],
  SKY_CHEST=['chest2','chest1','chest4','chest3','chest5','chest6','chest4','chest3','chest5','chest6','grand'],SKY_DAYS=3,SKY_SEG=150,SKY_BASE=190;
function sky(){const e=ev12();if(!e.sky)e.sky={h:0,cp:0,start:Date.now(),seen:0,flights:0,prizes:[]};const k=e.sky;
  if(Date.now()-k.start>=SKY_DAYS*864e5){k.start=Date.now();k.h=0;k.cp=0;k.seen=0;k.prizes=[]}return k}
function skyLeft(){const ms=Math.max(0,sky().start+SKY_DAYS*864e5-Date.now()),hh=Math.ceil(ms/36e5);return `${Math.floor(hh/24)}d ${hh%24}h`}
function skyTop(){return SKY_CP[SKY_CP.length-1]}
function skyResult(win){const k=sky();if(win){if(k.cp>=SKY_CP.length)return;k.h++;if(k.h>=SKY_CP[k.cp]){(k.prizes=k.prizes||[]).push(k.cp);k.cp++}}
  else k.h=k.cp?SKY_CP[k.cp-1]:0;save()}
function skyUnits(h){let prev=0;for(let i=0;i<SKY_CP.length;i++){const c=SKY_CP[i];if(h>=c){prev=c;continue}return i+(h-prev)/(c-prev)}return SKY_CP.length}
function skyY(u){return SKY_BASE+u*SKY_SEG}
function skyPrizeCheck(){const k=sky();if(!k.prizes||!k.prizes.length)return;
  const go=()=>{if($('#sHome').hidden||!k.prizes.length)return;if(popStack.length){setTimeout(go,900);return}const ids=k.prizes.splice(0),last=ids.includes(SKY_CP.length-1),coins=ids.reduce((s,i)=>s+SKY_REWARD[i],0);
    addCoins(coins);if(last){k.flights++;k.h=0;k.cp=0;k.seen=0}save();offerHome();
    const p=popup({title:'Sky Lift',ribbon:'purple',html:`<img class="ev12Hero skyHero" src="ui/sl_${SKY_CHEST[ids[ids.length-1]]}.webp" alt=""><div class="ptext">${last?'You reached the top of the Sky Lift!':`Floor${ids.length>1?'s':''} <b>${ids.map(i=>SKY_CP[i]).join(', ')}</b> reached!`} Chest${ids.length>1?'s':''} opened: <b>+${coins} coins</b></div><button class="btn wide juicy" id="ok"><span class="t">Collect</span></button>`});
    confetti();Sound.play('win');q(p,'#ok').onclick=()=>{Sound.play('coin');p.close()}};
  setTimeout(go,700)}
const SKY_EASE={out:'cubic-bezier(.22,1,.36,1)',inout:'cubic-bezier(.65,0,.35,1)',in:'cubic-bezier(.5,0,.75,0)'};
let skyAnim=0;
function openSkyLift(){const k=sky(),N=SKY_CP.length,H=skyY(N)+230,sec=$('#sSky'),seen=k.seen;
  const cps=SKY_CP.map((c,i)=>{const y=skyY(i+1),on=k.cp>i,fresh=on&&c>seen,done=on&&!fresh,pill=`<span class="skPill ${done?'on':''}"><img src="${ICO.coin}" alt=""><em>${done?'Collected':'+'+SKY_REWARD[i]}</em></span>`;
    return (i===N-1?`<div class="skGrand ${done?'on':''}" data-i="${i}" style="--y:${y}px"><img class="skChest" src="ui/sl_grand.webp" alt="">${pill}</div>`
      :`<div class="skStop ${done?'on':''}" data-i="${i}" style="--y:${y}px"><img class="skPlat" src="ui/sl2_bracket.webp" alt=""><img class="skChest" src="ui/sl_${SKY_CHEST[i]}.webp" alt="">${pill}</div>`)
      +`<div class="skHex ${on?'on':''}" style="--y:${y}px"><span class="ol">${c}</span></div>`}).join('');
  const clouds=Array.from({length:N+2},(_,i)=>`<img class="skCloud c${i%2}" src="ui/sl2_cloud${i%2+1}.webp" alt="" style="--y:${skyY(i+.45)+(i%3)*28}px;left:${i%2?60+(i*7)%26:46+(i*11)%14}%">`).join('');
  const from=skyY(skyUnits(seen)),to=skyY(skyUnits(k.h)),next=k.cp<N?SKY_CP[k.cp]-k.h:0;
  sec.innerHTML=`<div class="skBg"></div>
    <div class="skTop"><button class="skI" id="skInfo" aria-label="How it works"><span class="ol">i</span></button><div class="skBanner"><img src="ui/sl_banner.webp" alt=""><span class="skTitle ol">Sky Lift</span><span class="skTime">${skyLeft()}</span></div><button class="xbtn skX" id="skClose" aria-label="Close">${SVG.x}</button></div>
    <div class="skScroll" id="skScroll"><div class="skTower" style="height:${H}px"><div class="skCity"></div>${clouds}<div class="skMast"></div><div class="skMastTop"></div><div class="skMastBase"></div><div class="skHex zero on" style="--y:${SKY_BASE}px"><span class="ol">0</span></div>${cps}<div class="skBalloon" id="skBalloon" style="bottom:${from}px"><img src="ui/sl_balloon.webp" alt=""></div></div></div>
    <div class="skHud"><div class="skFire"><img src="ui/sl_fire.webp" alt=""><b class="ol">${k.h}</b></div><div class="skInfoTxt"><strong>${k.cp>=N?'Top reached!':`${next} more win${next===1?'':'s'} to floor ${SKY_CP[k.cp]}`}</strong><span>Win levels to rise. A lost level drops the balloon to the last chest.${k.flights?` Flights completed: ${k.flights}.`:''}</span></div><button class="btn gold" id="skPlay"><span class="t">Play</span></button></div>`;
  show('sSky');sec.classList.remove('out');sec.classList.add('in');
  const sc=$('#skScroll'),b=$('#skBalloon'),center=y=>{sc.scrollTop=Math.max(0,H-y-sc.clientHeight*.56)};center(from);
  const run=++skyAnim,alive=()=>run===skyAnim&&!sec.hidden;
  /* вход экрана (каскад ≤500 мс) → подъём/падение шара: камера едет за ним → пауза 450 мс → сундуки пройденных этажей раскрываются по очереди */
  setTimeout(()=>{if(!alive())return;sec.classList.remove('in');if(Math.abs(to-from)<1)return;
    const up=to>from,dur=Math.min(1700,Math.max(650,Math.abs(to-from)*2.2));b.style.transition=`bottom ${dur}ms ${up?SKY_EASE.inout:SKY_EASE.in}`;b.style.bottom=to+'px';b.classList.add(up?'rise':'fall');Sound.play(up?'whoosh':'slide');
    const fresh=SKY_CP.map((c,i)=>c>seen&&c<=k.h?i:-1).filter(i=>i>=0),t0=performance.now();
    const tick=()=>{if(!alive())return;const t=Math.min(1,(performance.now()-t0)/dur);center(from+(to-from)*t);if(t<1)requestAnimationFrame(tick);else{b.classList.remove('rise','fall');
      fresh.forEach((i,n)=>setTimeout(()=>{if(!alive())return;const st=sec.querySelector(`[data-i="${i}"]`);if(!st)return;st.classList.add('on','pop');Sound.play('coin');const pill=st.querySelector('.skPill');pill.classList.add('on');pill.querySelector('em').textContent='Collected';setTimeout(()=>st.classList.remove('pop'),460)},450+n*260))}};
    requestAnimationFrame(tick)},520);
  k.seen=k.h;save();
  $('#skClose').onclick=()=>{Sound.play('click');skyExit()};
  $('#skPlay').onclick=()=>{Sound.play('click');skyExit(()=>openStart())};
  $('#skInfo').onclick=()=>{Sound.play('click');const p=popup({title:'Sky Lift',ribbon:'purple',html:`<img class="ev12Hero" src="ui/sl_balloon.webp" alt=""><div class="ptext">Every won level lifts the balloon one floor. Reach a chest floor to open it. A lost level drops you to the last chest you opened, never lower. Reach floor 60 for the grand prize! Ends in <b>${skyLeft()}</b>.</div><button class="btn wide juicy" id="ok"><span class="t">Got it</span></button>`});q(p,'#ok').onclick=()=>p.close()}}
function skyExit(cb){closeAll();skyAnim++;const sec=$('#sSky');sec.classList.remove('in');sec.classList.add('out');setTimeout(()=>{sec.classList.remove('out');show('sHome');refreshHome();cb&&cb()},380)}
function slHomeBtns(){const l=$('#hEvL'),r=$('#hEvR');if(!l)return;const e=ev12();l.hidden=true;r.hidden=true;
  offerHome();skyPrizeCheck();if(e.lava.prize){e.lava.prize=0;save();setTimeout(()=>{if(!popStack.length){const p=popup({title:'Quest',ribbon:'green',html:`<img class="ev12Hero" src="ui/ev_quest.webp?v=water-shark-20261103" alt=""><div class="ptext">5 wins in a row! Chest opened: <b>+${LAVA_PRIZE} coins</b></div><button class="btn wide juicy" id="ok"><span class="t">Collect</span></button>`});confetti();Sound.play('win');q(p,'#ok').onclick=()=>p.close()}},650)}}
const OFFER_START={price:'$1.99',coins:1500,inv:{glove:3,lens:2}};
function openStarterOffer(){const P=OFFER_START,inv=Object.entries(P.inv);
  const p=popup({title:'Starter Pack',ribbon:'gold',cls:'spPop',html:`
  <div class="spHero"><span class="spRays"></span><img class="spChest" src="ui/dl_c2.webp" alt=""><span class="spOff ol">ONE TIME</span></div>
  <div class="spPanel"><div class="spCoins"><img src="${ICO.coin}" alt=""><b class="ol">${P.coins.toLocaleString('en-US')}</b></div>
    <div class="spGrid">${inv.map(([k,n],i)=>`<div class="spIt" style="--d:${.35+i*.08}s"><img src="${ICO[k]}" alt=""><em class="ol">×${n}</em></div>`).join('')}<div class="spIt" style="--d:.51s"><img src="${ICO.heart}" alt=""><em class="ol">Full</em></div></div></div>
  <button class="btn wide big juicy" id="ofBuy"><span class="t">${P.price}</span></button>`});
  q(p,'#ofBuy').onclick=()=>p.close(()=>purchase('Starter Pack',P.price,()=>{S.starter=true;inv.forEach(([k,n])=>S.inv[k]=(S.inv[k]||0)+n);S.lives=MAXL;addCoins(P.coins);save();refreshHome();confetti();Sound.play('win')}))}

/* ---------- boosters (shared) ---------- */
function evBoostHtml(k){const n=EVCOIN.has(k)?0:(S.inv[k]||0);return `<img src="${evIco(k)}" alt="">`+(n>0?`<span class="cnt">${n}</span>`:`<span class="price"><img src="${ICO.coin}" alt="">${EVP[k]}</span>`)}
function evUse(k,fn){if(!EVCOIN.has(k)&&(S.inv[k]||0)>0){S.inv[k]--;save()}
  else if(!spend(EVP[k])){Sound.play('deny');const p=popup({title:'Need Coins',ribbon:'coral',html:`<img class="bigicon" src="${evIco(k)}" alt=""><div class="ptitle">${evName(k)}</div><div class="ptext">You need ${EVP[k]} coins. Win event levels to earn more!</div><button class="btn gold wide" id="sh"><span class="t">Get Coins</span></button>`});
    q(p,'#sh').onclick=()=>p.close(()=>openShop(true));return false}
  Sound.play('magic');buzz('medium');fn();return true}
function evHand(el,dx=0,dy=0){evHandOff();if(!el)return;const h=document.createElement('div');h.className='evHand';h.innerHTML=SVG.hand;app.appendChild(h);const r=relRect(el);h.style.left=(r.cx-22+dx)+'px';h.style.top=(r.cy-4+dy)+'px'}
function evHandOff(){document.querySelectorAll('.evHand').forEach(h=>h.remove())}
function evPeekPaid(file,host){if(host.querySelector('.slPeekOv'))return;evUse('peek',()=>{evPeek(file,host,EVPEEK_S*1000);slBarR&&SL&&slBarR();OD&&odBarR()})}
function evPeek(file,host,ms=2000){const ov=document.createElement('div');ov.className='slPeekOv';ov.innerHTML=`<div class="thumb" style="width:min(320px,82%)"><i style="display:block;width:100%;height:100%;border-radius:6px;background:url(${file}) center/cover"></i></div>`;
  host.appendChild(ov);Sound.play('magic');const off=()=>{ov.classList.add('out');setTimeout(()=>ov.remove(),200)};ov.onclick=off;setTimeout(off,ms)}

/* ---------- tutorial ---------- */
function evTutorial(cfg,done){let i=0;const L=cfg.list;
  const p=popup({title:cfg.title,ribbon:cfg.ribbon,cls:'wide evTut',close:false,html:`<div class="tutDemo"></div><div class="ptitle tutT"></div><div class="ptext tutX"></div><div class="tutDots">${L.map(()=>'<b></b>').join('')}</div><button class="btn ${cfg.btn} wide" id="tutN"><span class="t">Next</span></button>`});
  const draw=()=>{const s=L[i];q(p,'.tutDemo').innerHTML=s.demo;q(p,'.tutT').textContent=s.t;q(p,'.tutX').innerHTML=s.x;
    p.el.querySelectorAll('.tutDots b').forEach((b,j)=>b.classList.toggle('on',j===i));q(p,'#tutN .t').textContent=i===L.length-1?"Let's go!":'Next'};draw();
  q(p,'#tutN').onclick=()=>{Sound.play('click');if(i<L.length-1){i++;draw()}else p.close(done)}}
function evGift(k,key){if(S.evTut[key])return;S.evTut[key]=1;S.inv[k]=(S.inv[k]||0)+1;save();
  const p=popup({title:'Free Gift!',ribbon:'green',html:`<img class="bigicon" src="${ICO[k]}" alt=""><div class="ptitle">1 × ${BOOST[k].name}</div><div class="ptext">Use it when you get stuck in the event.</div><button class="btn wide" id="ok"><span class="t">Thanks!</span></button>`});q(p,'#ok').onclick=()=>p.close()}
const tile2=(a,r,c,R,C,extra='')=>`<i class="${extra}" style="background-image:url(${a.file});background-size:${C*100}% ${R*100}%;background-position:${C>1?c/(C-1)*100:0}% ${R>1?r/(R-1)*100:0}%"></i>`;
const evGrandDemo=(ev,open)=>`<div class="tdGP gx${open?' open':''}">${EXCL[ev].map((x,j)=>`<span style="--d:${j*.12}s"><i style="background-image:url(${x.a.file})"></i>${open?'<em class="gxSh"></em>':`<b class="gxLk">${SVG.pad}</b>`}<u class="ol">${j+1}</u></span>`).join('')}</div>`;
const evBoostDemo=ks=>`<div class="tdBoost">${ks.map(([k,t],j)=>`<span style="animation-delay:${j*.25}s"><i><img src="${evIco(k)}" alt=""></i><b class="ol">${evName(k)}</b></span>`).join('')}</div>`;
function slTutorial(done){const a=SLIDE_ART[0];
  evTutorial({title:'Art Slide',ribbon:'purple',btn:'purple',list:[
    {demo:`<div class="tdB">${tile2(a,0,0,2,2)}${tile2(a,0,1,2,2)}<em></em>${tile2(a,1,0,2,2,'mv')}<span class="tdHand">${SVG.hand}</span></div>`,t:'Slide the tiles',x:'Tap a tile next to the empty spot — it slides in. Tiles in the same row or column slide together.'},
    {demo:`<div class="tdB done">${tile2(a,0,0,2,2,'ok')}${tile2(a,0,1,2,2,'ok')}${tile2(a,1,0,2,2,'ok')}${tile2(a,1,1,2,2,'last')}</div>`,t:'Rebuild the painting',x:'A <b>gold glow</b> means a tile is in the right place. Fewer moves — more stars and coins!'},
    {demo:evBoostDemo([['nums','numbers for 5 sec'],['lens','shows the next move'],['brush','makes 5 moves']]),t:'Stuck? Use boosters',x:'Number Tags, Art Peek, Hint Lens, Art Brush and Reshuffle cost coins — boosters from your bag are used first.'},
    {demo:slRaceDemo(),t:'Star Race',x:'Every level gives up to ★★★ — fewer moves, more stars. Reach <b>18, 28 and 36 ★</b> to win the bronze, silver and gold trophies. Tap a trophy any time to see its prizes.'},
    {demo:evGrandDemo('slide'),t:'Grand Prize',x:`Collect all ${SLIDE_LV.length} exclusive paintings to unlock <b>3 exclusive shelf levels</b> with big prizes.`}]},done)}
function odTutorial(done){const a=ART[ODD_ART[0]],f=ART[ODD_FOREIGN[0]];
  evTutorial({title:'Odd Book',ribbon:'',btn:'blue',list:[
    {demo:`<div class="tdRow">${tile2(a,0,0,1,4)}${tile2(a,0,1,1,4)}${tile2(f,0,2,1,4,'odd')}${tile2(a,0,3,1,4)}<span class="tdHand" style="left:58%">${SVG.hand}</span></div>`,t:'One book is odd',x:'The painting on the shelf has books that don’t belong: <b>a piece of another painting, upside down, or faded</b>.'},
    {demo:`<div class="tdOpts">${tile2(f,0,2,1,4)}${tile2(a,0,2,1,4,'right')}${tile2(a,0,2,1,4,'flip')}</div>`,t:'Tap it, pick the right one',x:'Choose the book that matches the original. Not sure? <b>Art Peek</b> shows the original for 3 seconds.'},
    {demo:evBoostDemo([['peek','shows the original'],['lens','points at an odd book'],['glove','fixes one for you']]),t:'Careful taps = more stars',x:'Tapping a normal book or the wrong option costs a star. Boosters cost coins — or come from your bag.'},
    {demo:evGrandDemo('odd'),t:'Grand Prize',x:`Finish all ${ODD_LV.length} levels to unlock <b>3 exclusive shelf levels</b> with big prizes.`}]},done)}

/* ---------- grand prize: exclusive main-mechanic levels ---------- */
const evPrize=x=>`<span><img src="${ICO.coin}" alt="">${x.reward}</span>`+Object.entries(x.inv).map(([k,n])=>`<span><img src="${ICO[k]}" alt="">×${n}</span>`).join('');
function evGrand(ev){const done=evDone(ev);
  return `<div class="gpHead"><span class="gi gxMini${done?' open':''}"><i style="background-image:url(${EXCL[ev][2].a.file})"></i>${done?'':`<b>${SVG.pad}</b>`}</span><div><b>Grand Prize</b><small>${done?'Exclusive levels unlocked — play them in order!':'Finish all levels to unlock 3 exclusive levels'}</small></div></div>
  <div class="gpRow">${EXCL[ev].map((x,j)=>{const got=S.excl[ev][j],lock=!done||(j>0&&!S.excl[ev][j-1]);
    return `<button class="gpCard ${got?'got':lock?'lock':'open'}" data-gp="${j}"><i style="background-image:url(${x.a.file})"></i>${lock?`<span class="pd">${SVG.pad}</span>`:''}<span class="gpL ol">${x.rows}×${x.cols}</span><span class="gpP">${evPrize(x)}</span>${got?`<span class="gpOk">${SVG.tick}</span>`:''}</button>`}).join('')}</div>`}
function evBindGrand(p,ev){p.el.querySelectorAll('[data-gp]').forEach(b=>b.onclick=()=>{const j=+b.dataset.gp;
  if(b.classList.contains('lock')){Sound.play('deny');toast(evDone(ev)?'Beat the previous exclusive level first':'Finish all event levels to unlock');return}
  const x=EXCL[ev][j];closeAll();startReplay(x.a,{label:'Exclusive',rows:x.rows,cols:x.cols,d:x.d,reward:S.excl[ev][j]?Math.round(x.reward/4):x.reward,btn:'purple',col:'#8C5BE6',excl:{ev,j}})})}
function exclGrant(ex){const x=EXCL[ex.ev][ex.j],first=!S.excl[ex.ev][ex.j];S.excl[ex.ev][ex.j]=1;
  if(first)Object.entries(x.inv).forEach(([k,n])=>S.inv[k]=(S.inv[k]||0)+n);save();window._reHub=ex.ev;
  return first?`<b>Exclusive prize</b>${Object.entries(x.inv).map(([k,n])=>`<span><img src="${ICO[k]}" alt="">×${n}</span>`).join('')}`:'Exclusive level · replay'}
function evGrandPopup(ev){const p=popup({title:'Grand Prize!',ribbon:'green',close:false,html:`${evGrandDemo(ev,true)}<div class="ptitle">3 exclusive levels unlocked</div><div class="ptext">Classic shelf puzzles with exclusive paintings, extra coins and boosters.</div><button class="btn wide" id="gp"><span class="t">Show me</span></button>`});
  Sound.play('unlock');confetti();q(p,'#gp').onclick=()=>p.close(()=>ev==='slide'?slExit(true):odExit(true))}

/* =================== ART SLIDE =================== */
function slideShuffle(r,c,k,seed){const R=rng(seed),n=r*c,need=Math.min(Math.ceil((n-1)*.6),Math.max(2,Math.ceil(k/3)));let o;
  for(let t=0;t<300;t++){o=[...Array(n).keys()];let b=n-1,prev=-1;
    for(let i=0;i<k;i++){const br=Math.floor(b/c),bc=b%c,nb=[];if(br>0)nb.push(b-c);if(br<r-1)nb.push(b+c);if(bc>0)nb.push(b-1);if(bc<c-1)nb.push(b+1);
      const ch=nb.filter(x=>x!==prev),p=ch[Math.floor(R()*ch.length)];o[b]=o[p];o[p]=n-1;prev=b;b=p}
    const wrong=o.reduce((s,v,i)=>s+(v!==i&&v!==n-1),0);if(wrong>=need)break}
  return o}
/* weighted A*: путь из тайлов, которые надо тапнуть по одному */
function slSolve(o,r,c){const n=r*c,B=n-1,W=n<=9?1:2.5,md=new Int16Array(n*n);
  for(let v=0;v<n;v++)for(let p=0;p<n;p++)md[v*n+p]=Math.abs(Math.floor(v/c)-Math.floor(p/c))+Math.abs(v%c-p%c);
  const H=s=>{let d=0;for(let p=0;p<n;p++){const v=s[p];if(v!==B)d+=md[v*n+p]}return d};
  const heap=[],push=x=>{heap.push(x);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}};
  const pop=()=>{const t=heap[0],l=heap.pop();if(heap.length){heap[0]=l;let i=0;for(;;){const a=2*i+1,b=a+1;let m=i;if(a<heap.length&&heap[a][0]<heap[m][0])m=a;if(b<heap.length&&heap[b][0]<heap[m][0])m=b;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return t};
  const st=o.slice(),sk=st.join(','),came=new Map([[sk,null]]),g=new Map([[sk,0]]),h0=H(st);push([W*h0,0,st,st.indexOf(B),h0]);let it=0;
  while(heap.length&&it++<300000){const [,gc,s,b,h]=pop(),k=s.join(',');if(gc>g.get(k))continue;
    if(h===0){const path=[];let kk=k;while(came.get(kk)){const [pk,t]=came.get(kk);path.unshift(t);kk=pk}return path}
    const br=Math.floor(b/c),bc=b%c;for(const d of [-c,c,-1,1]){if((d===-1&&bc===0)||(d===1&&bc===c-1)||(d===-c&&br===0)||(d===c&&br===r-1))continue;
      const p=b+d,t=s[p],s2=s.slice();s2[b]=t;s2[p]=B;const k2=s2.join(','),g2=gc+1;if(g.has(k2)&&g.get(k2)<=g2)continue;g.set(k2,g2);came.set(k2,[k,t]);
      const h2=h-md[t*n+p]+md[t*n+b];push([g2+W*h2,g2,s2,p,h2])}}
  return null}
function slPath(){const key=SL.order.join(',');if(SL.path&&SL.pathKey===key&&SL.path.length)return SL.path;SL.path=slSolve(SL.order,SL.r,SL.c)||[];SL.pathKey=key;return SL.path}

function openSlideHub(){if(!S.evTut.slide){S.evTut.slide=1;save();slTutorial(openSlideHub);return}
  const N=SLIDE_LV.length,nx=S.slide.next,done=Object.keys(S.slide.stars).length;
  const p=popup({title:'Art Slide',ribbon:'purple',cls:'tall wide evHub evSl',html:`<button class="tutQ" aria-label="How to play">?</button><div class="scroll hubScroll"><div class="slHubHead">
      <div class="ptext" style="font-size:15px">Slide the tiles back in order and collect <b>exclusive paintings</b>. No lives needed!</div>
      <div class="slProg"><div class="slPb"><i style="width:${done/N*100}%"></i></div><span>${done}/${N}</span><span class="slPrize ${S.slide.prize?'got':''}"><img src="${ICO.coin}" alt="">${SLIDE_PRIZE}</span></div>
      <div class="slEnds">Event ends in ${slLeft()}</div></div>${slRaceHtml()}
    <div class="slGrid">${SLIDE_ART.map((a,i)=>{const st=S.slide.stars[i]||0,[r,c]=SLIDE_LV[i];const cls=st?'done':i===nx?'cur':'lock';
      return `<button class="slCard ${cls}" data-i="${i}"><i style="background-image:url(${a.file})"></i>${st?slStars(st):i===nx?`<span class="sz ol">${r}×${c}</span>`:`<span class="pd">${SVG.pad}</span>`}<em>${i+1}</em></button>`}).join('')}</div>${evGrand('slide')}</div>
    ${nx<N?`<button class="btn purple wide" id="slGo"><span class="stack"><span class="t">Play</span><span class="sub t">Level ${nx+1} · ${SLIDE_LV[nx][0]}×${SLIDE_LV[nx][1]} tiles</span></span></button>`:`<div class="ptitle">Collection complete!</div>`}`});
  const go=q(p,'#slGo');if(go)go.onclick=()=>slideStart(nx);
  q(p,'.tutQ').onclick=()=>p.close(()=>slTutorial(openSlideHub));evBindGrand(p,'slide');
  {const pr=q(p,'#passRow');if(pr)pr.onclick=()=>p.close(()=>openArtPass(openSlideHub))}
  p.el.querySelectorAll('.srC').forEach(b=>b.onclick=()=>{const k=+b.dataset.t;Sound.play('click');p.close(()=>slTierPreview(k,openSlideHub))});slRaceAnim(p);
  p.el.querySelectorAll('.slCard').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;
    if(b.classList.contains('lock')){Sound.play('deny');toast(`Finish level ${nx+1} first`);return}
    if(b.classList.contains('cur')){slideStart(i);return}
    const a=SLIDE_ART[i];const v=popup({title:'Exclusive',ribbon:'purple',cls:'wide',html:`<div class="thumb slx" style="width:min(280px,100%)"><i style="display:block;width:100%;height:100%;border-radius:6px;background:url(${a.file}) center/cover"></i></div>
      <div class="artname">${a.title}</div><div class="after">${a.after}</div>${slStars(S.slide.stars[i],'xl')}
      <button class="btn purple wide" id="rp"><span class="stack"><span class="t">Play again</span><span class="sub t">${SLIDE_LV[i][0]}×${SLIDE_LV[i][1]} · beat your stars</span></span></button>`});
    q(v,'#rp').onclick=()=>slideStart(i)})}
function slideStart(i){const [r,c,k]=SLIDE_LV[i],n=r*c,att=(SL&&SL.i===i)?SL.att+1:0;const base=Math.min(k,60)*1.6+n;
  SL={i,r,c,k,n,art:SLIDE_ART[i],att,order:slideShuffle(r,c,k,9001+i*131+att*7919),moves:0,won:false,busy:false,extra:0};{const par=Math.max(2,slPath().length);SL.par=par;SL.s3=Math.round(par*1.6)+4;SL.s2=Math.round(par*2.4)+6;SL.lim=Math.round(par*3.4)+10}
  closeAll();tipOff();evHandOff();show('sSlide');renderSlide();Sound.play('whoosh');
  if(i===0&&att===0)setTimeout(()=>{const t=document.querySelector('#slBoard .stile.can');if(t&&SL&&!SL.moves)evHand(t)},500)}
function slBarR(){const b=$('#slBar');
  const on=SL&&SL.numsT>Date.now();b.innerHTML=`<button class="bt" id="slReset" aria-label="Reshuffle">${evBoostHtml('reset')}</button><button class="bt ${on?'armed':''}" id="slNums" aria-label="Number Tags">${on?`<img src="${evIco('nums')}" alt=""><span class="cnt tmr">${Math.ceil((SL.numsT-Date.now())/1000)}</span>`:evBoostHtml('nums')}</button><button class="bt" id="slPeek" aria-label="Art Peek">${evBoostHtml('peek')}</button><button class="bt" id="slLens" aria-label="Hint Lens">${evBoostHtml('lens')}</button><button class="bt" id="slBrush" aria-label="Art Brush">${evBoostHtml('brush')}</button>`;
  $('#slNums').onclick=()=>{if(!SL||SL.won||SL.numsT>Date.now())return;evUse('nums',slNumsOn)};
  $('#slPeek').onclick=()=>{if(SL&&!SL.won)evPeekPaid(SL.art.file,$('#sSlide'))};
  $('#slReset').onclick=()=>{if(!SL||SL.won||SL.busy)return;evUse('reset',()=>slideStart(SL.i))};
  $('#slLens').onclick=()=>{if(!SL||SL.won||SL.busy)return;const path=slPath();if(!path.length)return;evUse('lens',()=>{slHint(path[0]);slBarR()})};
  $('#slBrush').onclick=()=>{if(!SL||SL.won||SL.busy)return;if(!slPath().length)return;evUse('brush',()=>{slBarR();slAuto(5)})}}
function slNumsOn(){SL.numsT=Date.now()+EVNUMS_S*1000;$('#slBoard').classList.add('nums');slBarR();clearInterval(SL.numsI);const me=SL;
  me.numsI=setInterval(()=>{if(SL!==me){clearInterval(me.numsI);return}if(Date.now()>=me.numsT){clearInterval(me.numsI);$('#slBoard').classList.remove('nums')}slBarR()},250)}
function renderSlide(){const {r,c,n,art}=SL;
  $('#slLvl').textContent=`Level ${SL.i+1}`;$('#slSize').textContent=`${r}×${c} tiles`;$('#slThumbImg').style.backgroundImage=`url(${art.file})`;
  const bd=$('#slBoard');bd.className='slBoard';bd.innerHTML='';SL.el=[];
  for(let id=0;id<n;id++){const t=document.createElement('div'),rr=Math.floor(id/c),cc=id%c;t.className='stile'+(id===n-1?' blank':'');
    t.style.width=100/c+'%';t.style.height=100/r+'%';
    t.innerHTML=`<i style="background-image:url(${art.file});background-size:${c*100}% ${r*100}%;background-position:${c>1?cc/(c-1)*100:0}% ${r>1?rr/(r-1)*100:0}%"></i><b>${id+1}</b>`;
    t.onpointerdown=e=>slDown(e,id);bd.appendChild(t);SL.el[id]=t}
  slPlace(true);slHud();slBarR();
  $('#slHint').textContent=SL.i===0?'Tap a tile next to the gap to slide it':SL.i===1?'Tap any tile in the gap’s row or column — the whole line slides':'Stuck? Use a booster below';evFitSlide()}
function slPlace(inst){const b=SL.order.indexOf(SL.n-1);
  SL.order.forEach((id,p)=>{const t=SL.el[id];if(inst)t.style.transition='none';t.style.transform=`translate(${(p%SL.c)*100}%,${Math.floor(p/SL.c)*100}%)`;
    t.classList.toggle('ok',id===p&&id!==SL.n-1);
    t.classList.toggle('can',SL.i===0&&SL.moves===0&&!SL.won&&(Math.abs(p-b)===SL.c||(Math.abs(p-b)===1&&Math.floor(p/SL.c)===Math.floor(b/SL.c))));
    if(inst){void t.offsetWidth;t.style.transition=''}})}
function slTier(){return SL.moves<=SL.s3?3:SL.moves<=SL.s2?2:1}
function slHud(){const left=Math.max(0,SL.lim-SL.moves),tier=slTier();$('#slMoves').textContent=left;$('#slMv').classList.toggle('low',left<=5&&!SL.won);const f3=SLM[3],f2=SLM[2],fill=slMeter(SL.moves);$('#slStarsHud').innerHTML=`<div class="sBar"><div class="sTrack"><i style="width:${fill}%"></i></div>${[[1,SLM[1]],[2,f2],[3,f3]].map(([s,x])=>`<b class="sM s${s} ${tier>=s&&left>0?'on':''}" style="left:${x}%">${SVG.star}</b>`).join('')}</div>`;const tot=SL.n-1,ok=SL.order.reduce((a,id,p)=>a+(id===p&&id!==SL.n-1?1:0),0);$('#slPieces').textContent=ok+'/'+tot;$('#slBarP').style.width=(tot?ok/tot*100:0)+'%';const m=$('#slMv');m.classList.remove('bump');void m.offsetWidth;if(SL.moves)m.classList.add('bump')}
function slHint(id){SL.el.forEach(t=>t.classList.remove('hintT'));const t=SL.el[id];t.classList.add('hintT');evHand(t)}
function slAuto(n){const path=slPath().slice(0,n);if(!path.length)return;SL.busy=true;let k=0;
  const step=()=>{if(!SL||SL.won){if(SL)SL.busy=false;return}if(k>=path.length){SL.busy=false;return}const t=path[k++];const r=relRect(SL.el[t]);burst(r.cx,r.cy,4,{colors:['#C29BFF','#fff'],spread:24});slTry(t,undefined,true);setTimeout(step,230)};step()}
function slDown(e,id){if(!SL||SL.won||SL.busy)return;e.preventDefault();const x0=e.clientX,y0=e.clientY;
  const up=ev=>{window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);const dx=ev.clientX-x0,dy=ev.clientY-y0;let dir;
    if(Math.hypot(dx,dy)>18)dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:-1):(dy>0?SL.c:-SL.c);slTry(id,dir)};
  window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up)}
function slTry(id,dir,free){if(!SL||SL.won)return;const c=SL.c,o=SL.order,p=o.indexOf(id),b=o.indexOf(SL.n-1);
  const pr=Math.floor(p/c),pc=p%c,br=Math.floor(b/c),bc=b%c;let step=0;
  if(pr===br&&pc!==bc)step=bc>pc?1:-1;else if(pc===bc&&pr!==br)step=br>pr?c:-c;
  if(!step||(dir!==undefined&&dir!==step)){const t=SL.el[id];t.classList.remove('nudge');void t.offsetWidth;t.classList.add('nudge');Sound.play('deny');return}
  evHandOff();SL.el.forEach(t=>t.classList.remove('hintT'));
  const okBefore=new Set(o.map((v,i)=>v===i?v:-1));
  let cur=b,cnt=0;while(cur!==p){const nx=cur-step;o[cur]=o[nx];cur=nx;cnt++}o[p]=SL.n-1;
  if(SL.path&&SL.path[0]===id&&cnt===1){SL.path=SL.path.slice(1);SL.pathKey=o.join(',')}
  const prevTier=slTier();if(!free)SL.moves+=cnt;slPlace();slHud();Sound.play(cnt>1?'pickup_big':'slide');buzz('light');
  if(slTier()<prevTier){const m=document.querySelector('#slStarsHud .s'+prevTier);if(m){m.classList.add('drop');const rr=relRect(m);flyText('-1 ★',rr.cx,rr.cy-10,'#7A1E12');burst(rr.cx,rr.cy,6,{colors:['#C9C2B6','#fff'],spread:26})}Sound.play('deny');buzz('medium')}
  const fresh=o.filter((v,i)=>v===i&&v!==SL.n-1&&!okBefore.has(v));
  if(fresh.length)setTimeout(()=>{fresh.forEach(v=>{const r=relRect(SL.el[v]);burst(r.cx,r.cy,5,{spread:30})});Sound.play('click')},150);
  if(o.every((v,i)=>v===i))slWin();else if(SL.moves>=SL.lim)setTimeout(slOut,350)}
function slWin(){SL.won=true;SL.busy=false;evHandOff();const bd=$('#slBoard'),last=SL.el[SL.n-1];$('#slHint').textContent='';
  setTimeout(()=>{last.classList.remove('blank');last.classList.add('reveal');Sound.play('magic');const r=relRect(last);burst(r.cx,r.cy,14,{colors:['#C29BFF','#FFC548','#fff']})},220);
  setTimeout(()=>{bd.classList.add('won');Sound.play('win');buzz('success');confetti()},700);
  const st=slTier(),prev=S.slide.stars[SL.i]||0,first=!prev;S.slide.stars[SL.i]=Math.max(prev,st);
  if(SL.i>=S.slide.next)S.slide.next=SL.i+1;const coins=first?[0,30,50,80][st]+SL.i*10:(st>prev?20:10);
  if(!S.slide.perf)S.slide.perf={};const perf=st===3&&!S.slide.perf[SL.i];if(perf)S.slide.perf[SL.i]=1;save();
  setTimeout(()=>slWinPop(st,first,coins,perf),1900)}
function slWinPop(st,first,coins,perf){const a=SL.art,N=SLIDE_LV.length,nx=S.slide.next,all=evDone('slide');
  const p=popup({title:first?'New Exclusive!':'Restored!',ribbon:'purple',close:false,html:`<div class="thumb slx" style="width:min(220px,100%)"><i style="display:block;width:100%;height:100%;border-radius:6px;background:url(${a.file}) center/cover"></i></div>
    <div class="artname">${a.title}</div><div class="after">${a.after}</div><div class="wStars">${[1,2,3].map(i=>`<span class="ws ${i<=st?'on':''}" style="animation-delay:${.15*i}s">${i<=st?SVG.star:SVG.star.replace('#FFC548','#D9D2C6').replace('#A86A12','#A99E8E').replace('#FFF4C0','#EEE9E0')}</span>`).join('')}</div><div class="ptext" style="font-size:14px;margin-top:-6px">${SL.moves} move${SL.moves===1?'':'s'} · <b>${['','Completed','Great','Perfect!'][st]}</b></div>
    ${perf?(S.slide.pass?`<div class="perfB"><span class="pfT ol">PERFECT BONUS</span>${slPerfItems(SL.i)}</div>`:`<button class="perfB lockd" id="slPass"><span class="pfT ol">PERFECT BONUS</span>${slPerfItems(SL.i)}<span class="pfL">${SVG.pad}<b>Art Pass</b></span></button>`):st<3?`<div class="ptext" style="font-size:12px;color:var(--muted)">Finish in ≤${SL.s3} moves for ★★★ and a Perfect bonus</div>`:''}
    <button class="btn gold wide" id="slC"><span class="t">Collect ${coins}</span><img class="coin" src="${ICO.coin}" alt=""></button>`});
  const after=()=>{const n=popup({title:'Art Slide',ribbon:'purple',html:`${nx<N?`<div class="ptext">Next: <b>Level ${nx+1}</b> · ${SLIDE_LV[nx][0]}×${SLIDE_LV[nx][1]} tiles</div><button class="btn wide" id="nx"><span class="t">Next Level</span></button>`:`<div class="ptitle">Collection complete!</div>`}
      <button class="btn purple wide" id="col"><span class="t">Collection</span></button><button class="link" id="hm">Home</button>`});
    const b=q(n,'#nx');if(b)b.onclick=()=>slideStart(nx);q(n,'#col').onclick=()=>{n.close();slExit(true)};q(n,'#hm').onclick=()=>{n.close();slExit(false)};
    n.el.querySelector('.xbtn').onclick=()=>{n.close();slExit(false)}};
  setTimeout(()=>{p.el.querySelectorAll('.wStars .ws.on').forEach((s,k)=>setTimeout(()=>{if(p.closed)return;const rr=relRect(s);burst(rr.cx,rr.cy,10,{colors:['#FFE08A','#FFC548','#fff'],spread:46});Sound.play('click')},k*170+120))},60);
  {const pb=q(p,'#slPass');if(pb)pb.onclick=()=>openArtPass(()=>{const b2=q(p,'#slPass');if(b2&&S.slide.pass){b2.classList.remove('lockd');b2.querySelector('.pfL').remove()}})}
  q(p,'#slC').onclick=e=>{const r=relRect(e.currentTarget);addCoins(coins);if(perf&&S.slide.pass)slPerfGrant(SL.i);coinFly(r,{cx:r.cx,cy:-20},Math.min(10,4+Math.round(coins/20)));Sound.play('coin');
    p.close(()=>{if(all&&!S.slide.prize){S.slide.prize=1;save();const g=popup({title:'Collection!',ribbon:'green',close:false,html:`<div class="ptitle">All ${N} exclusives collected</div><img class="bigicon" src="${ICO.coin}" alt=""><button class="btn gold wide" id="gp"><span class="t">Collect ${SLIDE_PRIZE}</span></button>`});
        q(g,'#gp').onclick=ev=>{const r2=relRect(ev.currentTarget);addCoins(SLIDE_PRIZE);coinFly(r2,{cx:r2.cx,cy:-20},12);g.close(()=>evGrandPopup('slide'))};return}
      slTierChain(after)})}}
function slExit(hub){closeAll();evHandOff();SL=null;show('sHome');refreshHome();if(hub)setTimeout(openSlideHub,120)}

/* =================== ODD BOOK =================== */
function odGen(i){const [R,C,types]=ODD_LV[i],rnd=rng(4242+i*977+((OD&&OD.i===i)?OD.att+1:0)*331),main=ODD_ART[i]%ART.length,fr=ODD_FOREIGN[i]%ART.length;
  const cells=[...Array(R*C)].map((_,k)=>({k,r:Math.floor(k/C),c:k%C,v:'ok',found:false})),used=[];
  types.forEach(t=>{for(let tries=0;tries<400;tries++){const k=Math.floor(rnd()*R*C);if(used.includes(k))continue;const r=Math.floor(k/C),c=k%C;
    if(tries<300&&used.some(u=>Math.abs(Math.floor(u/C)-r)+Math.abs(u%C-c)<=1))continue;used.push(k);cells[k].v=t;break}});
  return{i,R,C,main,fr,cells,need:used.length,found:0,miss:0,done:false,sel:null,att:(OD&&OD.i===i)?OD.att+1:0}}
function odStyle(v,r,c,W,bw,rh){const a=v==='foreign'?OD.fr:OD.main;
  return `background-image:url(${ART[a].file});background-size:${W}px ${W}px;background-position:${-c*bw}px ${-r*rh}px;`+
    (v==='upside'?'transform:rotate(180deg);':'')+(v==='faded'?`filter:grayscale(${OD.i<6?1:.8}) sepia(.35) contrast(.85) brightness(1.08);`:'')}
function openOddHub(){if(!S.evTut.odd){S.evTut.odd=1;save();odTutorial(openOddHub);return}
  const N=ODD_LV.length,nx=S.odd.next,done=Object.keys(S.odd.stars).length;
  const p=popup({title:'Odd Book',ribbon:'',cls:'tall wide evHub evOd',html:`<button class="tutQ" aria-label="How to play">?</button><div class="scroll hubScroll"><div class="slHubHead">
      <div class="ptext" style="font-size:15px">Spot the books that <b>don’t match</b> the original painting and swap in the right ones!</div>
      <div class="slProg"><div class="slPb od"><i style="width:${done/N*100}%"></i></div><span>${done}/${N}</span></div>
      <div class="slEnds od">Event ends in ${slLeft()}</div></div>
    <div class="slGrid">${ODD_LV.map((L,i)=>{const st=S.odd.stars[i]||0,a=ART[ODD_ART[i]%ART.length];const cls=st?'done':i===nx?'cur':'lock';
      return `<button class="slCard od ${cls}" data-i="${i}"><i style="background-image:url(${a.file})"></i>${st?slStars(st):i===nx?`<span class="sz ol">Find ${L[2].length}</span>`:`<span class="pd">${SVG.pad}</span>`}<em>${i+1}</em></button>`}).join('')}</div>${evGrand('odd')}</div>
    ${nx<N?`<button class="btn blue wide" id="odGo"><span class="stack"><span class="t">Play</span><span class="sub t">Level ${nx+1} · find ${ODD_LV[nx][2].length} odd book${ODD_LV[nx][2].length>1?'s':''}</span></span></button>`:`<div class="ptitle">All levels done!</div>`}`});
  const go=q(p,'#odGo');if(go)go.onclick=()=>oddStart(nx);
  q(p,'.tutQ').onclick=()=>p.close(()=>odTutorial(openOddHub));evBindGrand(p,'odd');
  p.el.querySelectorAll('.slCard').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;
    if(b.classList.contains('lock')){Sound.play('deny');toast(`Finish level ${nx+1} first`);return}oddStart(i)})}
function oddStart(i){OD=odGen(i);closeAll();tipOff();evHandOff();show('sOdd');odSheet(false);
  $('#odLvl').textContent=`Level ${i+1}`;$('#odFind').textContent=`Find ${OD.need} odd book${OD.need>1?'s':''}`;$('#odThumb').style.setProperty('--th',`url(${ART[OD.main].file})`);
  $('#odHint').textContent=i===0?'One book doesn’t belong. Tap it!':i===1?'Something upside down? Fix it too!':'Not sure? Art Peek shows the original';
  requestAnimationFrame(()=>{odRender();odBarR();odHud();if(i===0&&OD.att===0&&!S.evTut.odL1)setTimeout(()=>{const k=OD&&OD.cells.find(x=>x.v!=='ok'&&!x.found);if(k&&OD.found===0)evHand(odEl(k.k))},900)});Sound.play('whoosh')}
const odEl=k=>document.querySelector(`#odBoard .ob[data-k="${k}"]`);
function evFree(scr,stage){let used=0;[...scr.children].forEach(e=>{if(e===stage||e.hidden)return;const cs=getComputedStyle(e);if(cs.position==='absolute')return;used+=e.offsetHeight+parseFloat(cs.marginTop)+parseFloat(cs.marginBottom)});
  const cs=getComputedStyle(scr),gap=parseFloat(cs.rowGap)||0,n=[...scr.children].filter(e=>!e.hidden&&getComputedStyle(e).position!=='absolute').length;
  return{w:scr.clientWidth,h:scr.clientHeight-used-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-gap*(n-1)}}
function evFitSlide(){const f=evFree($('#sSlide'),$('.slStage'));const s=Math.floor(Math.max(160,Math.min(f.w-32,f.h-56,440)));$('.slFrame').style.width=s+'px'}
function odRender(){if(!OD)return;const PL=9,R=OD.R,C=OD.C;const f=evFree($('#sOdd'),$('#odStage'));const aw=f.w-44,ah=f.h-56-R*PL-14;
  const W=Math.floor(Math.min(aw,ah,400));OD.W=W;OD.bw=W/C;OD.rh=W/R;const sh=$('#odBoard');sh.style.width=W+'px';sh.innerHTML='';
  for(let r=0;r<R;r++){const rw=document.createElement('div');rw.className='odRow';rw.style.height=OD.rh+'px';
    for(let c=0;c<C;c++){const cell=OD.cells[r*C+c],b=document.createElement('button');b.className='ob'+(cell.found?' fixed':'');b.dataset.k=cell.k;
      b.style.width=OD.bw+'px';b.style.height=OD.rh+'px';b.innerHTML=`<i style="${odStyle(cell.found?'ok':cell.v,r,c,W,OD.bw,OD.rh)}"></i>`;
      b.onclick=()=>odTap(cell.k);rw.appendChild(b)}sh.appendChild(rw)}}
function odHud(){$('#odFound').textContent=`${OD.found}/${OD.need}`;$('#odStarsHud').innerHTML=slStars(odTier())}
const odTier=()=>OD.miss===0?3:OD.miss<=2?2:1;
function odBarR(){const b=$('#odBar');
  b.innerHTML=`<button class="bt" id="odEye" aria-label="Art Peek">${evBoostHtml('peek')}</button><button class="bt" id="odLens" aria-label="Hint Lens">${evBoostHtml('lens')}</button><button class="bt" id="odGlove" aria-label="Magic Glove">${evBoostHtml('glove')}</button>`;
  $('#odEye').onclick=()=>{if(OD&&!OD.done)evPeekPaid(ART[OD.main].file,$('#sOdd'))};
  $('#odLens').onclick=()=>{const k=odNext();if(k===null)return;evUse('lens',()=>{odBarR();const el=odEl(k);el.classList.add('reveal');evHand(el)})};
  $('#odGlove').onclick=()=>{const k=odNext();if(k===null)return;evUse('glove',()=>{odBarR();odFix(k,true)})}}
function odNext(){if(!OD||OD.done||OD.busy)return null;const c=OD.cells.find(x=>x.v!=='ok'&&!x.found);return c?c.k:null}
function odTap(k){if(!OD||OD.done||OD.busy)return;const cell=OD.cells[k],el=odEl(k);if(cell.found)return;evHandOff();
  if(cell.v!=='ok'){document.querySelectorAll('#odBoard .ob.sel').forEach(x=>x.classList.remove('sel'));OD.sel=k;el.classList.add('sel');Sound.play('pickup');buzz('light');odSheet(true);return}
  OD.miss++;odHud();el.classList.remove('nudge');void el.offsetWidth;el.classList.add('nudge');Sound.play('deny');buzz('medium');const r=relRect(el);flyText('Looks fine!',r.cx,r.cy,'#A8301F');odStarDrop()}
function odStarDrop(){const h=$('#odStarsHud');h.classList.remove('lose');void h.offsetWidth;h.classList.add('lose')}
function odSheet(on){const s=$('#odSheet');if(!on){s.classList.remove('on');if(OD)OD.sel=null;document.querySelectorAll('#odBoard .ob.sel').forEach(x=>x.classList.remove('sel'));return}
  const cell=OD.cells[OD.sel],R=rng(OD.sel*31+OD.i*7+OD.miss),pool=['foreign','upside','faded'].filter(v=>v!==cell.v);
  const dec=pool[Math.floor(R()*pool.length)];const nb=cell.c<OD.C-1?cell.c+1:cell.c-1;
  let opts=[{v:'ok',c:cell.c,right:1},{v:dec,c:cell.c},{v:'ok',c:nb}];for(let i=opts.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]]}
  const sc=Math.min(118/OD.rh,78/OD.bw);const ow=OD.bw*sc,oh=OD.rh*sc;
  $('#odOpts').innerHTML=opts.map((o,i)=>`<button class="odC" data-i="${i}" style="width:${ow}px;height:${oh}px"><i style="${odStyle(o.v,cell.r,o.c,OD.W*sc,OD.bw*sc,OD.rh*sc)}"></i></button>`).join('');
  $('#odOpts').querySelectorAll('.odC').forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];evHandOff();
    if(o.right){odFix(OD.sel);return}
    OD.miss++;odHud();odStarDrop();b.classList.add('wrong');b.disabled=true;Sound.play('deny');buzz('medium');const r=relRect(b);flyText('Not this one',r.cx,r.cy-30,'#A8301F')});
  s.classList.add('on');
  if(OD.i===0&&OD.att===0&&!S.evTut.odL1){const i=opts.findIndex(o=>o.right);setTimeout(()=>evHand($('#odOpts').children[i]),320)}}
function odFix(k,magic){const cell=OD.cells[k];if(!cell||cell.found)return;cell.found=true;OD.found++;odSheet(false);evHandOff();OD.busy=true;
  const el=odEl(k);el.classList.remove('reveal','sel');el.classList.add('flip');Sound.play(magic?'magic':'pickup_big');
  setTimeout(()=>{el.querySelector('i').setAttribute('style',odStyle('ok',cell.r,cell.c,OD.W,OD.bw,OD.rh));el.classList.add('fixed','found');Sound.play('combo');buzz('success');
    const r=relRect(el);burst(r.cx,r.cy,12,{colors:['#9AF0A8','#FFC548','#fff']});flyText(OD.found===OD.need?'All found!':'Found!',r.cx,r.cy,'#1F7E3B')},190);
  setTimeout(()=>{if(!OD)return;OD.busy=false;odHud();if(OD.i===0)S.evTut.odL1=1;if(OD.found===OD.need)odWin()},460)}
function odWin(){OD.done=true;evHandOff();const bd=$('#odBoard');$('#odHint').textContent='';
  setTimeout(()=>{bd.classList.add('won');Sound.play('win');confetti()},350);
  const st=odTier(),prev=S.odd.stars[OD.i]||0,first=!prev;S.odd.stars[OD.i]=Math.max(prev,st);if(OD.i>=S.odd.next)S.odd.next=OD.i+1;
  const base=50+OD.i*12;let coins=Math.round(base*[0,.6,.8,1][st]);if(!first)coins=Math.round(coins*(st>prev?.4:.2));save();
  setTimeout(()=>odResult(st,coins),1700)}
function odResult(st,coins){const N=ODD_LV.length,nx=S.odd.next,all=evDone('odd');
  const p=popup({title:st===3?'Sharp Eye!':'Well Spotted!',ribbon:'',close:false,html:`<div class="thumb" style="width:min(210px,100%)"><i style="display:block;width:100%;height:100%;border-radius:6px;background:url(${ART[OD.main].file}) center/cover"></i></div>
    <div class="artname">${ART[OD.main].title}</div>${slStars(st,'xl anim')}<div class="ptext" style="font-size:14px;margin-top:-6px">${OD.miss?`${OD.miss} wrong tap${OD.miss>1?'s':''}`:'No mistakes!'}</div>
    <button class="btn gold wide" id="odC"><span class="t">Collect ${coins}</span><img class="coin" src="${ICO.coin}" alt=""></button>`});
  const after=()=>{const n=popup({title:'Odd Book',html:`${nx<N?`<div class="ptext">Next: <b>Level ${nx+1}</b> · find ${ODD_LV[nx][2].length} odd books</div><button class="btn blue wide" id="nx"><span class="t">Next Level</span></button>`:`<div class="ptitle">All levels done!</div>`}
      <button class="btn purple wide" id="col"><span class="t">All levels</span></button><button class="link" id="hm">Home</button>`});
    const b=q(n,'#nx');if(b)b.onclick=()=>oddStart(nx);q(n,'#col').onclick=()=>{n.close();odExit(true)};q(n,'#hm').onclick=()=>{n.close();odExit(false)};
    n.el.querySelector('.xbtn').onclick=()=>{n.close();odExit(false)}};
  q(p,'#odC').onclick=e=>{const r=relRect(e.currentTarget);addCoins(coins);coinFly(r,{cx:r.cx,cy:-20},Math.min(10,3+Math.round(coins/20)));Sound.play('coin');
    p.close(()=>{if(all&&!S.odd.prize){S.odd.prize=1;save();evGrandPopup('odd');return}after()})}}
function odExit(hub){closeAll();evHandOff();OD=null;odSheet(false);show('sHome');refreshHome();if(hub)setTimeout(openOddHub,120)}

function evBind(){$('#slBack').innerHTML=SVG.pause;$('#slEye').innerHTML=`<img src="${ICO.peek}" alt="">`;$('#slBack').onclick=()=>{Sound.play('click');slExit(true)};
  $('#slThumb').onclick=()=>{if(SL&&!SL.won)evPeekPaid(SL.art.file,$('#sSlide'))};
  $('#odBack').innerHTML=SLSVG.back;$('#odBack').onclick=()=>{Sound.play('click');odExit(true)};
  $('#odThumb').onclick=()=>{if(OD&&!OD.done)evPeekPaid(ART[OD.main].file,$('#sOdd'))};
  $('#odCancel').onclick=()=>{odSheet(false)};
  window.addEventListener('resize',()=>{if(OD&&!$('#sOdd').hidden)odRender();if(SL&&!$('#sSlide').hidden)evFitSlide()})}
evBind();
[...SLIDE_ART.map(a=>a.file),...ODD_ART.map(i=>ART[i].file),...ODD_FOREIGN.map(i=>ART[i].file)].forEach(s=>{const i=new Image();i.src=s});
window.__ev={finish(ev){if(ev==='slide'){SLIDE_LV.forEach((_,i)=>S.slide.stars[i]=3);S.slide.next=SLIDE_LV.length}else{ODD_LV.forEach((_,i)=>S.odd.stars[i]=3);S.odd.next=ODD_LV.length}save();refreshHome()},
  reset(){S.slide={next:0,stars:{},prize:0,nums:false};S.odd={v:4,next:0,stars:{},prize:0};S.excl={slide:{},odd:{}};S.evTut={};save();refreshHome()}};


/* ---------- special offers on home (v8.4) ---------- */
var OFFER_PACK={price:'$2.99',old:'$7.49',off:60,coins:1000,inv:{lens:3,glove:2,brush:2,peek:3}};
var OFFER_NOADS={price:'$4.99',coins:500};
const OFSVG={noads:'<svg viewBox="0 0 48 48"><rect x="5" y="9" width="38" height="28" rx="6" fill="#fff" stroke="#A8301F" stroke-width="3"/><text x="24" y="28" font-family="Arial Black,Arial" font-weight="900" font-size="13" text-anchor="middle" fill="#A8301F">AD</text><circle cx="24" cy="23" r="17" fill="none" stroke="#F0412E" stroke-width="4.5"/><path d="M12 35L36 11" stroke="#F0412E" stroke-width="4.5" stroke-linecap="round"/></svg>',
  pack:'<svg viewBox="0 0 48 48"><rect x="6" y="19" width="36" height="24" rx="5" fill="#A77AF4" stroke="#5634A3" stroke-width="2.5"/><rect x="3" y="12" width="42" height="10" rx="4" fill="#C29BFF" stroke="#5634A3" stroke-width="2.5"/><rect x="21" y="12" width="6" height="31" fill="#FFC548" stroke="#A86A12" stroke-width="1.5"/><path d="M24 12c-3-7-11-7-10-2s7 3 10 2zm0 0c3-7 11-7 10-2s-7 3-10 2z" fill="#FFC548" stroke="#A86A12" stroke-width="2"/></svg>'};
function offerLeft(){if(!S.offerTs){S.offerTs=Date.now();save()}let ms=S.offerTs+24*3600e3-Date.now();if(ms<=0){S.offerTs=Date.now();save();ms=24*3600e3}
  const s=ms/1000,h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=Math.floor(s%60);return `${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`}
function offerHome(){let box=$('#hOffers');if(!box){box=document.createElement('div');box.id='hOffers';$('#sHome').appendChild(box)}const e=ev12();
  const btn=(id,side,top,img,lb,extra='')=>`<button class="ofbtn ${side}${extra.includes('class="tm"')?' hasTm':''}" id="${id}" style="top:${top}px"><img class="ic" src="${img}" alt="">${extra}<span class="lb ol">${lb}</span></button>`;
  const R=[];if(!S.removeAds)R.push(['ofNoAds','ui/of_noads.webp','No Ads','']);
  if(!S.starter)R.push(['ofStart','ui/dl_c2.webp','Starter Pack','']);else if(!S.offerPack)R.push(['ofPack','ui/of_pack.webp','Sale',`<span class="bdg">-${OFFER_PACK.off}%</span><span class="tm" id="ofTm">${offerLeft()}</span>`]);
  box.innerHTML=btn('ofLava','l',0,'ui/ev_quest.webp?v=water-shark-20261103','Quest',`<span class="tm">${e.lava.step}/${LAVA_N}</span>`)+btn('ofShield','l',112,'ui/ev_shield.webp','Shield Arena',`<span class="tm">${shieldTime()}</span>`)+btn('ofSky','l',224,'ui/sl_balloon.webp','Sky Lift',`<span class="tm">${sky().h}/${skyTop()}</span>`)+R.map((x,i)=>btn(x[0],'r',i*112,x[1],x[2],x[3])).join('');
  const on=(id,f)=>{const el=$('#'+id);if(el)el.onclick=()=>{Sound.play('click');f()}};
  on('ofLava',openLavaHub);on('ofShield',openShieldHub);on('ofSky',openSkyLift);on('ofNoAds',openNoAds);on('ofStart',openStarterOffer);on('ofPack',openPackOffer);caseNav()}
setInterval(()=>{const t=$('#ofTm');if(t&&!$('#sHome').hidden)t.textContent=offerLeft()},1000);
/* ---------- v102: juicy offers + booster unlock tutorial ---------- */
const AD_SIGN=`<div class="adSign"><div class="adH l"><b>AD</b></div><div class="adH r"><b>AD</b></div><i class="crk"></i></div>`;
const NA_IC={noad:'<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#fff" stroke="#E23A5A" stroke-width="4"/><text x="20" y="25" text-anchor="middle" font-family="Fredoka,Arial" font-weight="800" font-size="13" fill="#E23A5A">ADS</text><path d="M8 32L32 8" stroke="#E23A5A" stroke-width="4" stroke-linecap="round"/></svg>',
 wifi:'<svg viewBox="0 0 40 40"><path d="M6 16a20 20 0 0128 0M11 21a13 13 0 0118 0M16 26a6 6 0 018 0" fill="none" stroke="#FFB020" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="31" r="3" fill="#FFB020"/><path d="M28 30l8 8M36 30l-8 8" stroke="#E23A5A" stroke-width="3.5" stroke-linecap="round"/></svg>',
 video:'<svg viewBox="0 0 40 40"><rect x="5" y="10" width="26" height="22" rx="5" fill="#A77AF4" stroke="#5B3FA0" stroke-width="2.5"/><path d="M15 15l9 6-9 6z" fill="#fff"/><circle cx="31" cy="30" r="7" fill="#FFC548" stroke="#A86A12" stroke-width="2"/><text x="31" y="33.5" text-anchor="middle" font-family="Arial" font-weight="900" font-size="9" fill="#A86A12">+</text></svg>'};
function openNoAds(){const p=popup({title:'No Ads',ribbon:'gold',cls:'naPop',html:`
  <div class="naHero na2"><span class="naRays"></span><span class="spk s1"></span><span class="spk s2"></span><span class="spk s3"></span><span class="naSplit"><img class="nsH l" src="ui/na_l.webp" alt=""><img class="nsH r" src="ui/na_r.webp" alt=""><img class="nsW" src="ui/na_w.webp" alt=""><i class="nsCrk"></i><b class="nsS s1"></b><b class="nsS s2"></b><b class="nsS s3"></b><b class="nsS s4"></b><b class="nsS s5"></b></span><span class="naFor ol">FOREVER</span></div>
  <div class="naPanel"><div class="naMain"><img src="ui/dl_c2.webp" alt=""><b class="ol">+${OFFER_NOADS.coins}</b><small>Bonus coins</small></div>
    <div class="naSide"><div class="naIt" style="--d:.35s"><img src="ui/of_noads.webp" alt=""><small>No ad breaks <b>forever</b></small></div>
      <div class="naIt" style="--d:.43s"><i>${NA_IC.wifi}</i><small>Play offline</small></div>
      <div class="naIt" style="--d:.51s"><i>${NA_IC.video}</i><small>Reward videos optional</small></div></div></div>
  <button class="btn wide big juicy" id="ofBuy"><span class="t">${OFFER_NOADS.price}</span></button>
  <p class="naFine">Prototype store · purchases are simulated</p>`});
  q(p,'#ofBuy').onclick=()=>p.close(()=>purchase('Remove Ads',OFFER_NOADS.price,()=>{S.removeAds=true;addCoins(OFFER_NOADS.coins);save();refreshHome();
    const t=popup({title:'Thank you!',ribbon:'green',html:`<div class="naHero sm na2 broke"><span class="naRays"></span><span class="naSplit"><img class="nsH l" src="ui/na_l.webp" alt=""><img class="nsH r" src="ui/na_r.webp" alt=""><img class="nsW" src="ui/na_w.webp" alt=""><i class="nsCrk"></i><b class="nsS s1"></b><b class="nsS s2"></b><b class="nsS s3"></b><b class="nsS s4"></b><b class="nsS s5"></b></span></div><div class="ptitle">Ads removed forever</div><div class="ptext">+${OFFER_NOADS.coins} coins added</div><button class="btn wide juicy" id="ok"><span class="t">Great!</span></button>`});confetti();q(t,'#ok').onclick=()=>t.close()}))}
function openPackOffer(){const P=OFFER_PACK;const inv=Object.entries(P.inv);
  const p=popup({title:'Special Offer',ribbon:'coral',cls:'spPop',html:`
  <div class="spHero"><span class="spRays"></span><img class="spChest spBook" src="ui/sp_book.webp" alt="">
    <span class="spOff ol">-${P.off}%</span></div>
  <div class="spPanel"><div class="spCoins"><img src="ui/of_pack.webp" alt=""><b class="ol">${P.coins.toLocaleString('en-US')}</b></div>
    <div class="spGrid">${inv.map(([k,n],i)=>`<div class="spIt" style="--d:${.35+i*.08}s"><img src="${ICO[k]}" alt=""><em class="ol">×${n}</em></div>`).join('')}</div></div>
  <div class="spTimer"><span>⏱</span> Ends in <b id="ofTm2">${offerLeft()}</b></div>
  <button class="btn wide big juicy" id="ofBuy"><span class="stack"><span class="t">${P.price}</span><span class="sub t"><s>${P.old}</s> · one time only</span></span></button>`});
  const iv=setInterval(()=>{const e=q(p,'#ofTm2');if(!e||p.closed){clearInterval(iv);return}e.textContent=offerLeft()},1000);
  q(p,'#ofBuy').onclick=()=>p.close(()=>purchase('Booster Treasure Pack',P.price,()=>{S.offerPack=true;inv.forEach(([k,n])=>S.inv[k]=(S.inv[k]||0)+n);addCoins(P.coins);save();refreshHome();
    const t=popup({title:'Pack Opened!',ribbon:'green',html:`<div class="ofItems">${inv.map(([k,n])=>`<div><img src="${ICO[k]}" alt=""><b>×${n}</b></div>`).join('')}<div><img src="${ICO.coin}" alt=""><b>${P.coins}</b></div></div><div class="ptext">Boosters work in levels and events.</div><button class="btn wide juicy" id="ok"><span class="t">Awesome!</span></button>`});confetti();Sound.play('win');q(t,'#ok').onclick=()=>t.close()}))}

/* booster unlock card (full screen) */
function boosterUnlockCard(k,cb){const B=BOOST[k];const ov=document.createElement('div');ov.className='unlk';
  ov.innerHTML=`<div class="uIn"><div class="uT"><b class="ol">${B.name}</b><span class="ol">${B.pre?'Power-up unlocked!':'Unlocked!'}</span></div>
   <div class="uIc"><span class="uRays"></span><span class="uGlow"></span>${[0,1,2,3,4,5,6,7].map(i=>i%2?`<i class="uFly s" style="--i:${i}">${SVG.star}</i>`:`<img class="uFly" style="--i:${i}" src="${bImg(k)}" alt="">`).join('')}<img src="${bImg(k)}" alt="">${efxTag(k,true)}</div>
   <div class="uD">${B.desc}${B.pre?'<br><small>Pick it on the level start screen</small>':''}</div>
   <div class="uGift"><span>Free gift</span><span class="uGt"><img src="${bImg(k)}" alt=""><b class="ol">×${B.gift}</b></span></div>
   <button class="btn wide big juicy" id="uOk"><span class="t">Continue</span></button></div>`;
  app.appendChild(ov);Sound.play('magic');buzz('success');
  setTimeout(()=>{const r=relRect(ov.querySelector('.uIc img'));burst(r.cx,r.cy,16,{spread:90})},380);
  ov.querySelector('#uOk').onclick=()=>{Sound.play('click');ov.classList.add('out');setTimeout(()=>{ov.remove();cb&&cb()},220)}}

/* spotlight how-to: dims everything except target, hand taps it, only the target is clickable */
function spotlight(el,html,onTap){if(!el)return;spotOff();const r=relRect(el),pad=8;
  const w=document.createElement('div');w.id='spotW';
  w.innerHTML=`<div class="spotH" style="left:${r.x-pad}px;top:${r.y-pad}px;width:${r.w+pad*2}px;height:${r.h+pad*2}px"></div>
   <div class="spotB ${r.cy>app.clientHeight*.5?'up':'dn'}" style="${r.cy>app.clientHeight*.5?`bottom:${app.clientHeight-r.y+pad+18}px`:`top:${r.y+r.h+pad+18}px`};--ax:${Math.max(30,Math.min(app.clientWidth-30,r.cx))}px">${html}</div>
   <div class="spotHand" style="left:${r.cx-6}px;top:${r.cy-4}px">${SVG.hand}</div>`;
  app.appendChild(w);
  w.onclick=e=>{const a=app.getBoundingClientRect(),x=e.clientX-a.left,y=e.clientY-a.top;if(x>=r.x-pad&&x<=r.x+r.w+pad&&y>=r.y-pad&&y<=r.y+r.h+pad){spotOff();onTap&&onTap()}else{const h=w.querySelector('.spotH');h.classList.remove('nudge');void h.offsetWidth;h.classList.add('nudge')}}}
function spotOff(){$('#spotW')?.remove()}
const HOWTO={peek:'Forgot the picture? Tap <b>Art Peek</b> to see it for 3 seconds.',lens:'Stuck? Tap <b>Hint Lens</b> — it shows the best move.',glove:'Tap <b>Magic Hand</b>, then tap the shelf: the books in that area go into place!',
  key:'Tap <b>Time Freeze</b> — for 5 seconds your moves are free. Be quick!',brush:'Tap <b>Art Brush</b>, then pick a <b>shelf</b> — it gets painted into place!'};
const AFTER={peek:null,lens:'Now drag the glowing book to its spot!',glove:null,key:null,brush:null};
function boosterHowTo(k){const el=document.querySelector(`#gBoosters .bt[data-k="${k}"]`);if(!el)return false;
  if((S.inv[k]||0)<1){S.inv[k]=1;save();renderBoosters()}
  setTimeout(()=>{const b=document.querySelector(`#gBoosters .bt[data-k="${k}"]`);
    spotlight(b,`<b>${BOOST[k].name}</b><span>${HOWTO[k]}</span>`,()=>{useBooster(k);if(AFTER[k])setTimeout(()=>tip(AFTER[k],bImg(k),3800),k==='brush'?700:250)})},350);return true}




/* paint flicked off the brush lands on the curtain and stays there */
const SPLATS=['sp1','sp2','sp3','sp4','sp5','sp6'];
function splatOn(c,x,y,k){const cr=c.getBoundingClientRect(),ar=app.getBoundingClientRect(),cx0=cr.left-ar.left,cy0=cr.top-ar.top;
  const tx=cx0+cr.width*(.08+.84*Math.random()),ty=cy0+cr.height*(.12+.62*Math.random()),i=k%SPLATS.length,col=BR_COL[i];
  const d=document.createElement('i');d.className='brDrop';d.style.background=col;d.style.width=d.style.height='12px';fx.appendChild(d);
  const mx=(x+tx)/2,my=Math.min(y,ty)-60;
  d.animate([{transform:`translate(${x}px,${y}px) scale(.6)`},{transform:`translate(${mx}px,${my}px) scale(1.2)`,offset:.5},{transform:`translate(${tx}px,${ty}px) scale(1)`}],{duration:380,easing:'cubic-bezier(.3,0,.7,1)'}).onfinish=()=>{d.remove();
    const s=document.createElement('img');s.src=`ui/${SPLATS[i]}.webp`;s.className='brSplat';const sz=34+Math.random()*26;Object.assign(s.style,{left:(tx-cx0-sz/2)+'px',top:(ty-cy0-sz/2)+'px',width:sz+'px',height:sz+'px'});
    s.style.setProperty('--r',(Math.random()*360)+'deg');(c.querySelector('.cf')||c).appendChild(s);Sound.play('pop')}}
/* Golden Key: flies in, slides into the keyhole, turns, the shackle springs open */
const LOCK_SVG='<svg viewBox="0 0 32 40" class="klk"><g class="ksh"><path d="M9 19v-6a7 7 0 0114 0v6" fill="none" stroke="#8B95A1" stroke-width="4.5"/><path d="M9 19v-6a7 7 0 0114 0v6" fill="none" stroke="#EEF2F6" stroke-width="2"/></g><g class="kbd"><rect x="4" y="18" width="24" height="20" rx="6" fill="#F2B53A" stroke="#8A560E" stroke-width="2"/><rect x="6.5" y="20" width="19" height="5" rx="2.5" fill="#FFE59A"/><circle cx="16" cy="29" r="3.2" fill="#5A3210"/><rect x="14.7" y="29" width="2.6" height="5" rx="1" fill="#5A3210"/></g></svg>';
function keyTurn(tile,id){const el=G.books[id].el,br=relRect(el),s=tile?relRect(tile):{cx:br.cx,cy:br.cy+200};G.locked=true;
  if(RM){unlockBook(id);G.locked=false;return}
  const LW=Math.min(84,br.w*1.6),LH=LW*40/32,lx=br.cx-LW/2,ly=br.cy-LH/2;const hx=lx+LW*16/32,hy=ly+LH*29/40;   // keyhole
  const lk=document.createElement('div');lk.className='kLock';Object.assign(lk.style,{left:lx+'px',top:ly+'px',width:LW+'px',height:LH+'px'});lk.innerHTML=LOCK_SVG+'<i class="kGlow"></i>';fx.appendChild(lk);
  const ch=el.querySelector('.chains');if(ch)ch.style.opacity='0';
  lk.animate([{transform:'scale(.35)',opacity:0},{transform:'scale(1.08)',opacity:1,offset:.7},{transform:'scale(1)'}],{duration:380,easing:'cubic-bezier(.3,1.4,.5,1)'});
  const KS=LW*1.05,kw=document.createElement('div');kw.className='kKey';kw.style.width=kw.style.height=KS+'px';kw.innerHTML=`<div class="kSp"><img src="${ICO.key}" alt=""></div>`;fx.appendChild(kw);
  const at=(tx,ty)=>`translate(${tx-KS*.03}px,${ty-KS/2}px)`;   // tip sits on (tx,ty)
  kw.animate([{transform:`translate(${s.cx-KS/2}px,${s.cy-KS/2}px) rotate(-40deg) scale(.7)`,opacity:.4},{transform:`translate(${(s.cx+hx)/2}px,${Math.min(s.cy,hy)-120}px) rotate(-20deg) scale(1.2)`,opacity:1,offset:.55},{transform:at(hx+KS*.32,hy),offset:.85},{transform:at(hx+KS*.32,hy)}],{duration:560,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
  setTimeout(()=>{Sound.play('slide');kw.animate([{transform:at(hx+KS*.32,hy)},{transform:at(hx+KS*.04,hy)}],{duration:200,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'});
    setTimeout(()=>lk.animate([{transform:'translateX(0)'},{transform:'translateX(-3px)'},{transform:'translateX(0)'}],{duration:140}),180)},560);
  setTimeout(()=>{Sound.play('click');kw.querySelector('.kSp').animate([{transform:'scaleY(1)'},{transform:'scaleY(.12)',offset:.45},{transform:'scaleY(-.12)',offset:.55},{transform:'scaleY(-1)'}],{duration:420,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'});
    lk.querySelector('.kbd').animate([{transform:'rotate(0)'},{transform:'rotate(-7deg)',offset:.5},{transform:'rotate(3deg)',offset:.8},{transform:'rotate(0)'}],{duration:420,easing:'cubic-bezier(.4,0,.2,1)'})},800);
  setTimeout(()=>{Sound.play('unlock');buzz('medium');lk.querySelector('.ksh').animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-7px) rotate(0)',offset:.45},{transform:'translateY(-6px) rotate(-28deg)'}],{duration:320,easing:'cubic-bezier(.3,1.5,.5,1)',fill:'forwards'});
    lk.querySelector('.kGlow').classList.add('on');burst(hx,hy-LH*.2,16,{colors:['#FFE08A','#FFC548','#fff'],spread:80,size:10});unlockBook(id)},1240);
  setTimeout(()=>{[lk,kw].forEach((e,i)=>e.animate([{opacity:1,translate:'0 0',rotate:'0deg'},{opacity:0,translate:`${i?20:-6}px 46px`,rotate:`${i?25:-14}deg`}],{duration:420,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'}).onfinish=()=>e.remove());if(G&&!G.solved)G.locked=false},1620)}
/* ---------- Art Brush: pick a whole shelf; a drop cloth hides the rest while magic paints it ---------- */
const BR_COL=['#FF5E7E','#FFB13B','#FFE14D','#4FD67A','#4DB8FF','#9B6BF2'];
function brushRowFix(r,order=G.order){const o=order.slice();let need=0;
  for(let c=0;c<G.cols;c++){const p=r*G.cols+c;if(o[p]===p)continue;need++;const a=o[p],q=o.indexOf(p);
    o[q]=a;o[p]=p}
  return{o:need?o:null,need,blocked:false}}
function brushCan(){if(!G)return[];const out=[];for(let r=0;r<G.rows;r++){const f=brushRowFix(r);if(f.o)out.push(r)}return out}
function rowRect(r){const cr=relRect(caseEl),L=G.Lay,y=cr.y+L.pad+r*(L.rowH+L.t);return{x:cr.x+L.side,y,w:L.imgW,h:L.rowH,by:y+L.rowH-L.ph,bh:L.ph}}
function brushArm(){if(!G||G.locked||G.solved)return;tipOff();clearHint();const ok=brushCan();G.brush={ok};
  const sr=relRect(stage),pad=document.createElement('div');pad.id='brPad';
  pad.innerHTML=`<div class="brBub"><img src="${ICO.brush}" alt=""><span>Choose a shelf to paint</span></div>`+
    Array.from({length:G.rows},(_,r)=>{const R=rowRect(r),f=brushRowFix(r),on=!!f.o;
      return `<button class="brRow ${on?'on':f.blocked?'blk':'done'}" data-r="${r}" style="left:${R.x-sr.x-4}px;top:${R.y-sr.y-3}px;width:${R.w+8}px;height:${R.h+6}px;--d:${r*70}ms">
        <span class="brPill ol">${on?`Paint shelf <b>${r+1}</b>`:f.blocked?'Locked':'Done ✓'}</span></button>`}).join('');
  stage.appendChild(pad);G.brush.pad=pad;padBub(pad,'brush');document.querySelector('.bt[data-k="brush"]')?.classList.add('armed');Sound.play('magic');
  pad.onclick=e=>{const b=e.target.closest('.brRow');if(!b){brushOff();return}
    if(!b.classList.contains('on')){Sound.play('deny');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');toast(b.classList.contains('blk')?'A lock or ribbon is on this shelf.':'This shelf is already done!');return}
    paintShelf(+b.dataset.r)}}
function brushOff(){const B=G&&G.brush;if(!B)return;B.pad&&B.pad.remove();G.brush=null;document.querySelector('.bt[data-k="brush"]')?.classList.remove('armed')}
function paintDrop(x,y,col,n=4){for(let i=0;i<n;i++){const d=document.createElement('i');d.className='brDrop';d.style.background=col;const s=5+Math.random()*9;d.style.width=d.style.height=s+'px';fx.appendChild(d);
  const a=-Math.PI/2+(Math.random()-.5)*2.6,v=40+Math.random()*80,dx=Math.cos(a)*v,dy=Math.sin(a)*v;
  d.animate([{transform:`translate(${x}px,${y}px) scale(1)`,opacity:1},{transform:`translate(${x+dx*.6}px,${y+dy*.6}px) scale(1)`,opacity:1,offset:.45},{transform:`translate(${x+dx}px,${y+dy+90}px) scale(.4)`,opacity:0}],{duration:650+Math.random()*250,easing:'cubic-bezier(.2,.6,.4,1)'}).onfinish=()=>d.remove()}}
function smoke(x,y,col){const s=document.createElement('i');s.className='brSmoke';s.style.setProperty('--c',col);fx.appendChild(s);const dx=(Math.random()-.5)*30;
  s.animate([{transform:`translate(${x-20}px,${y-20}px) scale(.4)`,opacity:.85},{transform:`translate(${x-20+dx}px,${y-50}px) scale(2)`,opacity:0}],{duration:750+Math.random()*300,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>s.remove()}
function paintShelf(r){const f=brushRowFix(r);if(!f.o)return;G.brush.pad.remove();G.brush.pad=null;G.locked=true;
  S.inv.brush--;S.stats.boosters++;save();renderBoosters();
  const cr=relRect(caseEl),R=rowRect(r),SPD=RM?.25:1,T=ms=>ms*SPD,els=[];const add=(cls,css)=>{const e=document.createElement('div');e.className=cls;Object.assign(e.style,css);fx.appendChild(e);els.push(e);return e};
  /* 1 — drop cloths fall over every other shelf (and hide the reshuffle) */
  const pad=6,top=cr.y-4,bot=cr.y+cr.h+4,cl=[];let c0;
  const FR=20;   // gold fringe hangs a little over the shelf edge
  if(r>0)cl.push(add('brCloth',{left:cr.x-pad+'px',top:top+'px',width:cr.w+pad*2+'px',height:(R.y-top+FR)+'px'}));
  if(r<G.rows-1)cl.push(add('brCloth lo',{left:cr.x-pad+'px',top:(R.y+R.h-4)+'px',width:cr.w+pad*2+'px',height:(bot-R.y-R.h+4+FR)+'px'}));
  cl.forEach((c,i)=>{c.innerHTML='<i class="cf"></i>';const cf=c.firstChild;
    if(!RM){c.animate([{transform:'translateY(-105%)',opacity:1},{transform:'translateY(4%)',offset:.62},{transform:'translateY(-1.5%)',offset:.82},{transform:'translateY(0)'}],{duration:620,delay:i*90,easing:'cubic-bezier(.33,0,.2,1)',fill:'backwards'});
      cf.animate([{transform:'scale(1,1) skewX(0)'},{transform:'scale(1.02,.94) skewX(2deg)',offset:.2},{transform:'scale(.99,1.04) skewX(-1.6deg)',offset:.42},{transform:'scale(1.01,.98) skewX(1deg)',offset:.62},{transform:'scale(1,1.01) skewX(-.5deg)',offset:.8},{transform:'none'}],{duration:900,delay:i*90+560,easing:'ease-out'});
      setTimeout(()=>c.classList.add('alive'),i*90+1460)}});
  c0=cl;
  Sound.play('whoosh');
  /* 2 — a primed canvas glows over the chosen shelf */
  const cv=add('brFog',{left:R.x-3+'px',top:R.by-3+'px',width:R.w+6+'px',height:R.bh+6+'px'});cv.innerHTML='<i></i><i></i><i></i>';
  const art=add('brArt',{left:R.x+'px',top:R.by+'px',width:R.w+'px',height:R.bh+'px',backgroundImage:`url(${G.art.file})`,backgroundSize:`${G.Lay.imgW}px ${G.Lay.artH*G.Lay.imgW/G.Lay.artW}px`,backgroundPosition:`0 ${-r*G.Lay.ph*G.Lay.imgW/G.Lay.artW}px`});
  if(!RM){cv.animate([{opacity:0},{opacity:1}],{duration:380,delay:260,easing:'cubic-bezier(.2,.8,.3,1)',fill:'backwards'})}
  const edge=add('brEdge',{left:R.x+'px',top:R.by-6+'px',height:R.bh+12+'px'});edge.style.opacity='0';
  /* 3 — under cover: books jump to their new homes instantly */
  const hideSwap=()=>{G.books.forEach(b=>{b.el.style.transition='none'});const pos=[];f.o.forEach((id,p)=>pos[id]=p);G.books.forEach(b=>placeBook(b.id,pos[b.id]));
    for(let c=0;c<G.cols;c++){const p=r*G.cols+c;if(G.hidden.has(p))revealBook(p)}};
  /* 4 — the brush paints left → right with smoke and flying paint */
  const sp=document.createElement('img');sp.src=ICO.brush;sp.className='brSp';fx.appendChild(sp);els.push(sp);
  const tr=relRect(document.querySelector('.bt[data-k="brush"]')||caseEl),tip=(x,y,rot)=>`translate(${x-14}px,${y-74}px) rotate(${rot}deg)`;
  const D=1150,steps=7,kf=[];for(let k=0;k<=steps;k++){const x=R.x+R.w*(k/steps),y=R.by+R.bh*(k%2?0.85:0.15);kf.push({transform:tip(x,y,k%2?-12:-42),offset:.18+.82*k/steps})}
  if(!RM){sp.animate([{transform:tip(tr.cx,tr.cy,30)+' scale(.5)',opacity:0,offset:0},{transform:tip(R.x-10,R.by+R.bh*.15,-50)+' scale(1.1)',opacity:1,offset:.14},...kf],{duration:D+300,delay:520,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'both'});
    art.animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],{duration:D*.82,delay:520+(D+300)*.18,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'both'});
    edge.animate([{transform:'translateX(0)',opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.92},{transform:`translateX(${R.w}px)`,opacity:0}],{duration:D*.82,delay:520+(D+300)*.18,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'both'});
    for(let k=0;k<16;k++)setTimeout(()=>{const t=k/15,x=R.x+R.w*t,y=R.by+R.bh*(.2+.6*Math.random()),col=BR_COL[k%6];smoke(x,y,col);if(k%4===0)Sound.play('slide')},520+(D+300)*.18+k*(D*.82/16))}
  /* 5 — magic glaze, cloths roll up, shelf revealed */
  const tEnd=RM?500:520+D+300;
  setTimeout(()=>{hideSwap();cv.style.opacity='0';art.classList.add('glaze');for(let k=0;k<5;k++){const x=R.x+R.w*(k+.5)/5;burst(x,R.by+R.bh/2,10,{colors:['#FFE14D','#fff','#FFB13B','#9B6BF2'],spread:70,size:10})}Sound.play('win');buzz('success');
    if(!RM)sp.animate([{transform:sp.style.transform||tip(R.x+R.w,R.by,-20),opacity:1},{transform:tip(R.x+R.w+40,R.by-80,30)+' scale(.6)',opacity:0}],{duration:420,fill:'forwards'})},tEnd);
  setTimeout(()=>{commit(f.o,{free:true,boosterCells:Array.from({length:G.cols},(_,c)=>r*G.cols+c)});G.locked=true;
    setTimeout(()=>G.books.forEach(b=>b.el.style.transition=''),60);
    cl.forEach((c,i)=>{c.classList.remove('alive');RM?c.remove():c.animate([{transform:'translateY(0)'},{transform:'translateY(3%)',offset:.25},{transform:'translateY(-108%)'}],{duration:480,delay:i*60,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'})});
    [cv,art].forEach(e=>e.animate([{opacity:1},{opacity:0,transform:'scale(1.03)'}],{duration:420,delay:120,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'}));
    for(let c=0;c<G.cols;c++){const el=G.books[r*G.cols+c].el;setTimeout(()=>{el.classList.remove('ok');void el.offsetWidth;el.classList.add('ok')},200+c*45)}
    setTimeout(()=>{els.forEach(e=>e.remove());brushOff();if(G&&!G.solved){G.locked=false;flyText('Masterstroke!',R.x+R.w/2,R.y-6)}},560)},tEnd+380)}
/* ---------- Level 1 wow: dramatic intro + finale ---------- */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function wowIntro(){const ord=[0,1,2,3].filter(i=>G.books[i]);const fin=G.books.map(b=>b.el.style.transform);
  const cr=relRect(caseEl);const glow=document.createElement('div');glow.className='wowGlow';Object.assign(glow.style,{left:cr.cx+'px',top:cr.cy+'px'});fx.appendChild(glow);setTimeout(()=>glow.remove(),2600);
  G.books.forEach((b,i)=>{b.el.style.transition='none';b.el.style.opacity='';placeBook(b.id)});
  ord.forEach((id,i)=>{const el=G.books[id].el,f=el.style.transform,rot=(i%2?1:-1)*(18+i*6);
    if(RM){return}
    el.animate([{transform:`${f} translateY(-${360+i*40}px) rotate(${rot}deg) scale(.55)`,opacity:0},{opacity:1,offset:.35},
      {transform:`${f} translateY(10px) rotate(${-rot*.1}deg) scale(1.06,.92)`,offset:.72},{transform:`${f} translateY(-6px) scale(.98,1.03)`,offset:.86},{transform:f,opacity:1}],
      {duration:780,delay:200+i*170,easing:'cubic-bezier(.33,0,.2,1)',fill:'backwards'});
    setTimeout(()=>{const r=relRect(el);burst(r.cx,r.y+r.h,9,{colors:['#FFE08A','#FFC548','#fff','#FF9EC4'],spread:46,size:10});Sound.play(i===3?'thud':'slide');
      caseEl.animate([{transform:'translateY(0)'},{transform:'translateY(4px)'},{transform:'translateY(0)'}],{duration:180,easing:'ease-out'})},200+i*170+560)});
  setTimeout(()=>{G.books.forEach(b=>b.el.style.transition='');G.locked=false;levelIntro()},RM?200:200+4*170+700)}
function wowWin(){if(RM)return;const r=relRect(G.final),sr=relRect(stage);const wrap=document.createElement('div');wrap.className='wowFx';Object.assign(wrap.style,{left:(r.cx-sr.x)+'px',top:(r.cy-sr.y)+'px'});wrap.style.setProperty('--s',Math.max(r.w,r.h)+'px');
  wrap.innerHTML='<i class="wRays"></i><i class="wRing"></i><i class="wRing r2"></i><i class="wRing r3"></i>';stage.insertBefore(wrap,stage.firstChild);
  const sh=document.createElement('i');sh.className='wShine';G.final.appendChild(sh);
  const fl=document.createElement('div');fl.className='wFlash';app.appendChild(fl);
  for(let k=0;k<3;k++)setTimeout(()=>burst(r.cx+(Math.random()-.5)*r.w*.6,r.cy+(Math.random()-.5)*r.h*.6,18,{colors:['#FFE08A','#FFC548','#fff','#FF7FB0','#8FD3FF'],spread:150,size:12}),k*160);
  const t=document.createElement('div');t.className='wTitle ol';t.innerHTML='<span>Wow!</span>';Object.assign(t.style,{left:r.cx+'px',top:(r.y+r.h*.5)+'px'});fx.appendChild(t);
  Sound.play('coin');setTimeout(()=>Sound.play('win'),500);
  setTimeout(()=>{wrap.remove();sh.remove();fl.remove();t.remove()},2400)}
/* ---------- Bookcases (cosmetic) ---------- */
var CASES={
  royal:{name:'Royal Ivory',tag:'Legendary',desc:'Ivory lacquer, gold carvings, royal velvet shelves',iap:'$2.99'},
  forest:{name:'Enchanted Forest',tag:'Epic',desc:'Living wood, moss and glowing fireflies',coins:3000},
  arcane:{name:'Arcane Library',tag:'Epic',desc:'Mahogany, brass runes and twinkling stardust',coins:6000}};
function caseApply(){app.removeAttribute('data-case');   /* Decor feature removed: always the classic bookcase */try{if(G&&G.Lay&&!$('#sGame').hidden)layout(false)}catch(e){}}
function caseOwn(k){return S.cases.own.includes(k)}
function caseGive(k,eq){if(!caseOwn(k))S.cases.own.push(k);if(eq)S.cases.on=k;save();caseApply()}
function csPrev(k,big){const a=ART[(k==='royal'?5:k==='forest'?12:k==='arcane'?20:3)%ART.length].file;
  const row=o=>`<div class="rw">${[0,1,2,3].map(i=>`<b style="background-image:url(${a});background-position:${i*33.3}% ${o}%"></b>`).join('')}</div><div class="pl"></div>`;
  return `<div class="csPrev${big?' big':''}" data-cs="${k}"><div class="cr"></div><div class="bd">${row(0)}${row(100)}</div><div class="bs"></div></div>`}
function caseBtn(k){const c=CASES[k];if(S.cases.on===k)return `<button class="btn grey sm" disabled><span class="t">Placed</span></button>`;
  if(caseOwn(k))return `<button class="btn sm" data-eq="${k}"><span class="t">Place</span></button>`;
  if(c.coins)return `<button class="btn gold sm" data-cc="${k}"><img class="coin" src="${ICO.coin}" alt=""><span class="t">${c.coins.toLocaleString('en-US')}</span></button>`;
  return `<button class="btn purple sm" data-ci="${k}"><span class="t">${c.iap}</span></button>`}
function openCases(){const p=popup({title:'Bookcases',ribbon:'purple',cls:'tall wide casePop',html:`<div class="scroll">
  ${Object.keys(CASES).map(k=>{const c=CASES[k];return `<div class="shopItem csItem ${S.cases.on===k?'on':''}">${csPrev(k)}<div class="tx"><b>${c.name}</b><em class="csTag ${c.tag.toLowerCase()}">${c.tag}</em><small>${c.desc}</small></div>${caseBtn(k)}</div>`}).join('')}
  <div class="shopItem csItem ${S.cases.on?'':'on'}">${csPrev('')}<div class="tx"><b>Classic Oak</b><small>The cozy original bookcase</small></div>${S.cases.on?'<button class="btn sm" data-eq=""><span class="t">Place</span></button>':'<button class="btn grey sm" disabled><span class="t">Placed</span></button>'}</div>
  <p class="ptext" style="font-size:12px;color:var(--muted)">Bookcases are cosmetic and show in every level.</p></div>`});
  p.el.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>{S.cases.on=b.dataset.eq;save();caseApply();Sound.play('click');toast((b.dataset.eq?CASES[b.dataset.eq].name:'Classic Oak')+' placed');p.close(()=>openCases())});
  p.el.querySelectorAll('[data-cc]').forEach(b=>b.onclick=()=>{const k=b.dataset.cc;if(!spend(CASES[k].coins)){p.close(()=>openShop(true));return}caseGive(k,true);Sound.play('win');p.close(()=>caseUnlocked(k,()=>openCases()))});
  p.el.querySelectorAll('[data-ci]').forEach(b=>b.onclick=()=>{const k=b.dataset.ci;p.close(()=>purchase(CASES[k].name+' bookcase',CASES[k].iap,()=>{caseGive(k,true);setTimeout(()=>caseUnlocked(k),250)}))})}
function caseUnlocked(k,after){const c=CASES[k];const t=popup({title:'New Bookcase!',ribbon:'green',cls:'casePop',html:`${csPrev(k,true)}<div class="ptitle">${c.name}</div><div class="ptext">${c.desc}. It's now in every level.</div><button class="btn wide" id="ok"><span class="t">Beautiful!</span></button>`});
  confetti();q(t,'#ok').onclick=()=>t.close(after)}
function caseNav(){$('#csNav')?.remove();return;const nav=$('#hNav');if(!nav)return;let b=$('#csNav');if(!b){b=document.createElement('button');b.id='csNav';b.className='sbtn csbtn';nav.appendChild(b)}
  b.innerHTML=`<span class="tile">${csPrev(S.cases.on||'royal')}</span>${S.cases.own.length?'':'<span class="dot">!</span>'}<span class="lb ol">Decor</span>`;b.onclick=()=>{Sound.play('click');openCases()}}
caseApply();

var SLPERF={coins:40,lens:1};
var SLTIERS=[{need:18,place:3,name:'Bronze',coins:300,inv:{lens:2}},{need:28,place:2,name:'Silver',coins:700,inv:{brush:1,glove:1}},{need:36,place:1,name:'Gold',coins:1500,inv:{peek:2,glove:1}}];
function slStarTotal(){return Object.values(S.slide.stars).reduce((a,b)=>a+b,0)}
function medalSvg(pl){const C={1:['#FFF3B0','#F2C14E','#B9831C'],2:['#FFFFFF','#C9D3DE','#7D8B9A'],3:['#FFD9B8','#D9894A','#8E4E1E']}[pl];
  return `<svg viewBox="0 0 64 72" class="medal"><path d="M18 2h12l6 22H22z" fill="#5B8DEF"/><path d="M34 2h12L42 24H28z" fill="#E8584A"/><circle cx="32" cy="44" r="24" fill="${C[2]}"/><circle cx="32" cy="44" r="20" fill="${C[1]}"/><circle cx="32" cy="44" r="15" fill="${C[0]}" opacity=".55"/><path d="M22 34a14 14 0 0 1 12-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/><text x="32" y="52" text-anchor="middle" font-family="Fredoka,Arial" font-weight="800" font-size="22" fill="#fff" stroke="${C[2]}" stroke-width="3" paint-order="stroke">${pl}</text></svg>`}
function slTierState(k){if(!S.slide.tiers)S.slide.tiers={};return S.slide.tiers[k]?'got':slStarTotal()>=SLTIERS[k].need?'ready':'lock'}
function chestSvg(pl,open){return `<img class="chest c${pl}" src="ui/ch${pl}${open?'o':'c'}.webp" alt="">`}
function trophyImg(pl){return `<img class="chest troph c${pl}" src="ui/tr${pl}.webp" alt="">`}
function slRaceHtml(){const T=slStarTotal(),M=SLIDE_LV.length*3,seen=Math.min(T,S.slide.raceSeen??T);
  const nextK=SLTIERS.findIndex((t,k)=>slTierState(k)==='lock');
  return `<div class="srace"><div class="srArt"></div><div class="srHead"><span class="srRib ol">STAR RACE</span><span class="srCnt">${SVG.star}<b id="srN">${seen}</b><small>/${M}</small></span></div>
   <div class="srStage">${SLTIERS.map((t,k)=>{const st=slTierState(k);return `<button class="srC ${st} ${k===nextK?'next':''}" data-t="${k}" style="left:${t.need/M*100}%"><span class="srRays"></span>${trophyImg(t.place)}<span class="srPl ol">${['','1st','2nd','3rd'][t.place]}</span>${st==='ready'?'<span class="srClaim ol">CLAIM</span>':st==='got'?'<span class="srOk">✓</span>':''}</button>`}).join('')}</div>
   <div class="srBar"><div class="srTrack"><i id="srFill" style="width:${seen/M*100}%"></i></div>${SLTIERS.map(t=>`<span class="srTick ${T>=t.need?'on':''}" style="left:${t.need/M*100}%">${t.need}</span>`).join('')}</div>
   <div class="srHint">${nextK>=0?`<b>${SLTIERS[nextK].need-T}</b> more ★ to <b>${['','1st','2nd','3rd'][SLTIERS[nextK].place]} place</b> · tap a trophy for prizes`:'All places earned — you are a master!'}</div><span class="srCap">“The Great Star Chase”</span></div>${slPassRow()}`}
function slRaceAnim(p){const T=slStarTotal(),M=SLIDE_LV.length*3,from=Math.min(T,S.slide.raceSeen??T);S.slide.raceSeen=T;save();if(from>=T)return;
  const f=q(p,'#srFill'),n=q(p,'#srN');setTimeout(()=>{if(p.closed)return;{const fr=relRect(n),to=relRect(f.parentNode);for(let s2=0;s2<Math.min(8,T-from);s2++){const el=document.createElement('div');el.className='srFly';el.innerHTML=SVG.star;fx.appendChild(el);const tx=to.x+to.w*Math.min(1,T/M)-8,ty=to.cy;el.animate([{transform:`translate(${fr.cx}px,${fr.cy}px) scale(.6)`,opacity:0},{transform:`translate(${fr.cx}px,${fr.cy-30}px) scale(1.1)`,opacity:1,offset:.25},{transform:`translate(${tx}px,${ty}px) scale(.5)`,opacity:1}],{duration:700,delay:s2*90,easing:'cubic-bezier(.5,0,.6,1)',fill:'forwards'}).onfinish=()=>el.remove()}}f.style.transition='width 1.1s cubic-bezier(.3,.8,.3,1)';f.style.width=T/M*100+'%';let v=from;const iv=setInterval(()=>{if(p.closed||v>=T){clearInterval(iv);return}v++;n.textContent=v;Sound.play('click');const r=relRect(n);burst(r.cx,r.cy,4,{spread:20})},Math.max(60,900/(T-from)))},450)}
function slTierRewards(t){const owned=t.cas&&S.cases&&S.cases.own.includes(t.cas);
  return [`<div><img src="${ICO.coin}" alt=""><b>${t.coins+(owned?2500:0)}</b></div>`].concat(Object.entries(t.inv).map(([b,n])=>`<div><img src="${ICO[b]}" alt=""><b>×${n}</b></div>`)).concat(t.cas&&!owned?[`<div class="csItemR"><span class="cbx">${csPrev(t.cas)}</span><b>Bookcase</b></div>`]:[]).join('')}
function slTierPreview(k,back){const t=SLTIERS[k],st=slTierState(k),T=slStarTotal();
  const p=popup({title:`${['','1st','2nd','3rd'][t.place]} Place Prize`,ribbon:'purple',cls:'tierPop',html:`<div class="tierChest">${trophyImg(t.place)}</div>
    <div class="ptitle">${t.name} trophy · ${t.need} ★</div><div class="ofItems">${slTierRewards(t)}</div>
    ${st==='lock'?`<div class="srMini"><div class="srTrack"><i style="width:${Math.min(100,T/t.need*100)}%"></i></div><span>${T}/${t.need} ★</span></div><div class="ptext" style="font-size:13px">Earn <b>${t.need-T}</b> more stars — replay levels for ★★★!</div><button class="btn purple wide" id="ok"><span class="t">Got it</span></button>`
    :st==='ready'?`<button class="btn gold wide" id="ok"><span class="t">Claim</span></button>`:`<div class="ptext">Already claimed ✓</div><button class="btn wide" id="ok"><span class="t">OK</span></button>`}`,onClose:back});
  q(p,'#ok').onclick=()=>{if(st==='ready'){p.close();setTimeout(()=>slTierPop(k,back),180)}else p.close()}}
function slRaceDemo(){return `<div class="srDemo"><div class="srTrack"><i></i></div>${[3,2,1].map((pl,i)=>`<span style="left:${[50,78,100][i]}%">${trophyImg(pl)}<em class="ol">${['','1st','2nd','3rd'][pl]}</em></span>`).join('')}</div>`}
function slTierPop(k,cb){const t=SLTIERS[k];const owned=t.cas&&S.cases&&S.cases.own.includes(t.cas);
  const items=slTierRewards(t);
  const p=popup({title:`${['','1st','2nd','3rd'][t.place]} Place!`,ribbon:'green',close:false,cls:'tierPop',html:`<div class="tierChest open"><span class="srRays big"></span>${trophyImg(t.place)}</div><div class="ptitle">${t.name} trophy · ${t.need} stars</div><div class="ofItems">${items}</div><button class="btn gold wide" id="tc"><span class="t">Claim</span></button>`});
  confetti();Sound.play('win');
  q(p,'#tc').onclick=e=>{if(!S.slide.tiers)S.slide.tiers={};S.slide.tiers[k]=1;const r=relRect(e.currentTarget);addCoins(t.coins+(owned?2500:0));Object.entries(t.inv).forEach(([b,n])=>S.inv[b]=(S.inv[b]||0)+n);
    if(t.cas&&!owned&&typeof caseGive==='function')caseGive(t.cas,false);save();coinFly(r,{cx:r.cx,cy:-20},10);p.close(cb)}}
function slTierChain(cb){const k=SLTIERS.findIndex((t,i)=>slTierState(i)==='ready');if(k<0){cb&&cb();return}slTierPop(k,()=>slTierChain(cb))}
function slOut(){if(!SL||SL.won)return;SL.busy=true;evHandOff();const tot=SL.n-1,ok=SL.order.reduce((a,id,p)=>a+(id===p&&id!==SL.n-1?1:0),0),cost=60*(1+SL.extra);Sound.play('deny');
  const p=popup({title:'Out of Moves',ribbon:'coral',close:false,html:`<div class="thumb slx" style="width:min(150px,60%)"><i style="display:block;width:100%;height:100%;border-radius:6px;background:url(${SL.art.file}) center/cover;filter:grayscale(.6) blur(1px)"></i></div>
    <div class="ptitle">So close!</div><div class="ptext">${ok}/${tot} pieces are already in place</div>
    <button class="btn gold wide" id="om"><span class="stack"><span class="t">+10 moves</span><span class="sub t">${cost} coins · keep going</span></span></button>
    <button class="btn wide" id="rt"><span class="t">Try again</span></button><button class="link" id="qt">Back to collection</button>`});
  q(p,'#om').onclick=()=>{if(!spend(cost)){toast('Not enough coins');p.close(()=>openShop(true));return}SL.lim+=10;SL.extra++;SL.busy=false;Sound.play('coin');p.close(()=>{slHud();const r=relRect($('#slMv'));flyText('+10 moves',r.cx,r.cy+54)})};
  q(p,'#rt').onclick=()=>p.close(()=>slideStart(SL.i));q(p,'#qt').onclick=()=>p.close(()=>slExit(true))}

var SLM={3:74,2:44,1:10};
if(S.slide&&S.slide.perf&&!S.slide.perfMig){S.slide.perfPaid=Object.assign({},S.slide.perf,S.slide.perfPaid||{});S.slide.perfMig=1;save()}
function slMeter(m){const p=[[0,100],[SL.s3,SLM[3]],[SL.s2,SLM[2]],[SL.lim,0]];if(m<=0)return 100;for(let k=1;k<p.length;k++){if(m<=p[k][0]){const [a,va]=p[k-1],[b,vb]=p[k];return va+(vb-va)*(m-a)/Math.max(1,b-a)}}return 0}
var SLPASS={price:'$2.99',old:'$6.99',coins:500};
const SLPB=['lens','peek','glove','brush'];
function slPerfOf(i){return {coins:50+i*10,b:SLPB[i%4]}}
function slPerfItems(i){const r=slPerfOf(i);return `<span class="pi"><img src="${ICO.coin}" alt="">+${r.coins}</span><span class="pi"><img src="${ICO[r.b]}" alt="">×1</span>`}
function slPerfGrant(i){if(!S.slide.perfPaid)S.slide.perfPaid={};if(S.slide.perfPaid[i])return 0;const r=slPerfOf(i);S.slide.perfPaid[i]=1;addCoins(r.coins);S.inv[r.b]=(S.inv[r.b]||0)+1;save();return r.coins}
function slPerfPending(){const P=S.slide.perf||{},Q=S.slide.perfPaid||{};return Object.keys(P).filter(i=>!Q[i]).map(Number)}
function slPassRow(){const n=slPerfPending().length;return S.slide.pass?`<div class="passRow on"><img src="ui/ch1o.webp" alt=""><div><b>Art Pass active</b><small>Perfect bonuses are paid on every ★★★</small></div><span class="pOk">✓</span></div>`
  :`<button class="passRow" id="passRow"><img src="ui/ch1c.webp" alt=""><div><b>Art Pass</b><small>${n?`<em>${n}</em> Perfect bonus${n>1?'es':''} waiting`:'Claim a Perfect bonus on every ★★★ level'}</small></div><span class="pBtn ol">${SLPASS.price}</span></button>`}
function openArtPass(cb){const pend=slPerfPending(),pc=pend.reduce((a,i)=>a+slPerfOf(i).coins,0);
  const N=SLIDE_LV.length,tot=Array.from({length:N},(_,i)=>slPerfOf(i).coins).reduce((a,b)=>a+b,0),bc={};for(let i=0;i<N;i++){const k=slPerfOf(i).b;bc[k]=(bc[k]||0)+1}
  const r0=slPerfOf(0),st='<i class="apSt">★★★</i>';
  const p=popup({title:'Art Pass',ribbon:'purple',cls:'passPop apPop',html:`<div class="tierChest open apCh"><span class="srRays big"></span>${chestSvg(1,true)}</div>
    <div class="ptitle">Unlock every Perfect Bonus</div>
    <div class="apCmp">
      <div class="apRow free"><span class="apTag">Free</span>${st}<span class="apAr">→</span><span class="apGet none">${SVG.pad}<small>No bonus</small></span></div>
      <div class="apRow pass"><span class="apTag">Art Pass</span>${st}<span class="apAr">→</span><span class="apGet"><span class="pi"><img src="${ICO.coin}" alt="">+${r0.coins}</span><span class="pi"><img src="${ICO[r0.b]}" alt="">×1</span></span></div>
    </div>
    <div class="apSum"><div class="apSumH">You get with Art Pass</div>
      <div class="apTiles">
        <div class="apT now"><img class="apBig" src="ui/of_pack.webp" alt=""><b class="ol">+${SLPASS.coins}</b><small>coins instantly</small></div>
        <div class="apT"><img class="apBig" src="${ICO.coin}" alt=""><b class="ol">+${tot.toLocaleString('en-US')}</b><small>coins · ${N} levels</small></div>
        <div class="apT"><span class="apBs">${Object.entries(bc).map(([k,n])=>`<span><img src="${ICO[k]}" alt=""></span>`).join('')}</span><b class="ol">+${Object.values(bc).reduce((a,b)=>a+b,0)}</b><small>boosters</small></div>
      </div>
      ${pend.length?`<div class="apPend"><span>Already earned ${pend.length} Perfect bonus${pend.length>1?'es':''}: <b>+${pc}</b><img src="${ICO.coin}" alt=""> paid instantly</span></div>`:''}
    </div>
    <button class="btn gold wide" id="pb"><span class="stack"><span class="t">${SLPASS.price}</span><span class="sub t"><s>${SLPASS.old}</s> · this event</span></span></button>
    <p class="ptext" style="font-size:11px;color:var(--muted);margin:0">Prototype store. Purchases are simulated and free.</p>`});
  q(p,'#pb').onclick=()=>p.close(()=>purchase('Art Pass',SLPASS.price,()=>{S.slide.pass=1;addCoins(SLPASS.coins);pend.forEach(i=>slPerfGrant(i));save();confetti();toast('Art Pass unlocked!');cb&&cb()}))}
function winSparkle(el){const r=relRect(el);const pts=[];for(let k=0;k<16;k++){const t=k/16,side=k%4;pts.push(side===0?[r.x+r.w*t*4%r.w,r.y]:side===1?[r.x+r.w,r.y+r.h*((t*4)%1)]:side===2?[r.x+r.w*((t*4)%1),r.y+r.h]:[r.x,r.y+r.h*((t*4)%1)])}
  pts.forEach(([x,y],k)=>setTimeout(()=>burst(x,y,3,{colors:['#FFE08A','#fff','#FFC548'],spread:26,size:8}),k*35))}
/* ---------- proto-kit (стандарт хаба): ?level=n, лоадер, home, __game ---------- */
let pkPre=null,pkWon=false,pkReplay=null;
function goHome(won){pkWon=!!won;ProtoKit.home()}
function startReplay(art,r){pkReplay={art,r};closeAll();ProtoKit.play(S.level)}
function pkStart(n){if(pkReplay){const rp=pkReplay;pkReplay=null;closeAll();tipOff();stopHand();startReplayRaw(rp.art,rp.r);return}
  S.level=n;save();const prep=prepareLevel(n),pre=pkPre||{bookmark:false,glue:false,shelf:false};pkPre=null;
  closeAll();tipOff();stopHand();startLevel(prep,pre)}
window.__game={
  get state(){return G?{L:G.L,rows:G.rows,cols:G.cols,n:G.n,moves:G.moves,correct:correctOf(G.order),solved:G.solved,order:[...G.order]}:null},
  load(n){pkStart(n)},
  bounds(){const p=document.getElementById('phone').getBoundingClientRect(),r=caseEl.getBoundingClientRect();
    return{left:r.left-p.left,top:r.top-p.top,right:r.right-p.left,bottom:r.bottom-p.top}}
};
ProtoKit.init({slug:'bookshelf',name:'Bookshelf: Art Puzzle',icon:'../icon.png',iconEmoji:'📚',accent:'#8c6039',levels:350,
  startLevel(n){pkStart(n)},
  showHome(){goHomeRaw(pkWon);pkWon=false}});

/* v8 tall books (patch_v8_tall.py, 2026-10-21) */


/* =========================================================
   v12 BOOSTERS: Magic Hand (a piece of 2-5 books into place) and Time Freeze (5 s of free moves)
   ========================================================= */
/* puts the books of `slots` home one by one on a copy of the order; skips locked / tied books (like Art Brush) */
/* the piece for a tapped slot: the N-wide window of its row (containing it) where most books can be placed; then the nearest other places */
const handSlotAt=(x,y)=>{for(const b of G.books){const r=b.el.getBoundingClientRect();if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)return G.pos[b.id]}return -1};
/* 2026-10-29: Magic Hand tap zone (patch_v12_hand_zone) */
const HAND_ZONE={normal:[2,2],super:[3,2]};   // [books wide, shelves high]
const handDims=()=>{const z=G&&G.def&&G.def.d>=9?HAND_ZONE.super:HAND_ZONE.normal;return[Math.min(z[0],G.cols),Math.min(z[1],G.rows)]};
const handN=()=>{const[w,h]=handDims();return w*h};
/* free = can be moved by the hand: not locked, not tied, not hidden (the book now in the slot and the book that belongs there) */
const handFree=id=>true;
function handFix(slots,o){const done=[],stuck=[];
  slots.forEach(p=>{if(o[p]===p)return;const a=o[p],q=o.indexOf(p);if(!handFree(a)||!handFree(p)){stuck.push(p);return}o[q]=a;o[p]=p;done.push(p)});return{done,stuck}}
/* zone for a slot: anchored top-left (used for availability) or, from a tap, around the finger */
function handSlots(p0,x,y){const C=G.cols,R=G.rows,[w,h]=handDims();let c=p0%C,r=Math.floor(p0/C);
  if(x!=null){const b=G.books[G.order[p0]].el.getBoundingClientRect(),lx=x<b.left+b.width/2,ty=y<b.top+b.height/2;
    c-=w===3?1:w===2&&lx?1:0;r-=h===2&&ty?1:0}
  c=Math.max(0,Math.min(c,C-w));r=Math.max(0,Math.min(r,R-h));const out=[];
  for(let dr=0;dr<h;dr++)for(let dc=0;dc<w;dc++)out.push((r+dr)*C+c+dc);return out}
function handPlanAt(p0,x,y){const slots=handSlots(p0,x,y),o=G.order.slice(),f=handFix(slots,o);return{o,ids:f.done,stuck:f.stuck,slots}}
function handPlan(){if(!G||G.solved)return null;let best=null;for(let p=0;p<G.n;p++){const P=handPlanAt(p);if(P.ids.length&&(!best||P.ids.length>best.ids.length))best=P}return best}
function handZoneBox(pad,zone,slots){const pr=pad.getBoundingClientRect(),k=pr.width/pad.offsetWidth,cr=caseEl.getBoundingClientRect();
  const xs=slots.map(id=>slot(G.Lay,id).x),ys=slots.map(id=>slot(G.Lay,id).y),ox=(cr.left-pr.left)/k,oy=(cr.top-pr.top)/k;
  Object.assign(zone.style,{left:ox+Math.min(...xs)-4+'px',top:oy+Math.min(...ys)-4+'px',width:Math.max(...xs)-Math.min(...xs)+G.Lay.sw+8+'px',height:Math.max(...ys)-Math.min(...ys)+G.Lay.sh+8+'px'})}
/* first use: the tutorial finger taps a spot and the zone lights up, until the player taps */
function handTapDemo(pad,P){const h=document.createElement('div');h.id='hand';h.className='hdTap';h.innerHTML=SVG.hand;app.appendChild(h);
  const z=document.createElement('div');z.className='hdZone demo';z.hidden=true;pad.appendChild(z);handZoneBox(pad,z,P.slots);
  const cr=relRect(caseEl);let x=0,y=0;P.slots.forEach(p=>{const s=slot(G.Lay,p);x+=s.x+G.Lay.sw/2;y+=s.y+G.Lay.sh/2});x=cr.x+x/P.slots.length-14;y=cr.y+y/P.slots.length-6;
  let alive=true,tm=[];const loop=()=>{if(!alive)return;z.hidden=true;
    h.animate([{transform:`translate(${x+40}px,${y+70}px)`,opacity:0},{transform:`translate(${x}px,${y}px) scale(1)`,opacity:1,offset:.3},{transform:`translate(${x}px,${y}px) scale(.85)`,offset:.4},{transform:`translate(${x}px,${y}px) scale(1)`,offset:.5},{transform:`translate(${x}px,${y}px) scale(1)`,opacity:1,offset:.85},{transform:`translate(${x+40}px,${y+70}px)`,opacity:0}],{duration:2200,fill:'forwards',easing:'ease-in-out'});
    tm.push(setTimeout(()=>{if(alive){z.hidden=false;z.classList.remove('hdIn');void z.offsetWidth;z.classList.add('hdIn')}},880),setTimeout(()=>{z.hidden=true},1900),setTimeout(loop,2500))};
  loop();return()=>{alive=false;tm.forEach(clearTimeout);h.remove();z.remove()}}
/* 2026-10-30: picker bubble above the booster bar (patch_v12_pad_bubble) */
function padBub(pad,k){const b=pad.querySelector('.brBub'),bar=document.querySelector('#gBoosters'),bt=document.querySelector(`#gBoosters .bt[data-k="${k}"]`);if(!b||!bar)return;
  b.classList.add('lo');const pr=relRect(pad),br=relRect(bar),r=bt?relRect(bt):br,w=b.offsetWidth,x=Math.max(12,Math.min(app.clientWidth-12-w,r.cx-w/2));
  b.style.left=(x-pr.x)+'px';b.style.top=(br.y-pr.y-b.offsetHeight-10)+'px';b.style.setProperty('--ax',(r.cx-x)+'px')}
function handArm(){if(!G||G.locked||G.solved)return;tipOff();clearHint();const N=handN();
  const pad=document.createElement('div');pad.id='brPad';pad.className='hdPad';
  pad.innerHTML=`<div class="brBub"><img src="${ICO.glove}" alt=""><span>Tap the shelf: ${N} books go into place</span></div><div class="hdZone" hidden></div>`;
  stage.appendChild(pad);G.hand={pad};padBub(pad,'glove');document.querySelector('.bt[data-k="glove"]')?.classList.add('armed');Sound.play('magic');
  const zone=pad.querySelector('.hdZone');
  if(!S.tut.handZone){const P=handPlan();if(P)G.hand.demo=handTapDemo(pad,P)}
  pad.onclick=e=>{const p=handSlotAt(e.clientX,e.clientY);if(p<0){handOff();return}
    const P=handPlanAt(p,e.clientX,e.clientY);handZoneBox(pad,zone,P.slots);zone.hidden=false;zone.classList.remove('hdIn','no');void zone.offsetWidth;zone.classList.add('hdIn');
    P.stuck.forEach(s=>{const el=G.books[G.order[s]].el;el.classList.remove('hdNo');void el.offsetWidth;el.classList.add('hdNo')});
    if(!P.ids.length){Sound.play('deny');zone.classList.add('no');toast(P.stuck.length?'These books are locked, tied or hidden. Pick another spot.':'Every book here is already in place. Pick another spot.');setTimeout(()=>{if(G.hand&&G.hand.pad===pad)zone.hidden=true},900);return}
    G.hand.demo&&G.hand.demo();G.hand.demo=null;S.tut.handZone=1;pad.onclick=null;pad.querySelector('.brBub').classList.add('go');Sound.play('click');
    S.inv.glove--;S.stats.boosters++;save();
    setTimeout(()=>{if(!G||G.solved)return;renderBoosters();handUse(document.querySelector('.bt[data-k="glove"]'),P);setTimeout(()=>{if(G.hand&&G.hand.pad===pad)handOff()},700)},450)}}
function handOff(){const H=G&&G.hand;if(!H)return;H.demo&&H.demo();H.pad&&H.pad.remove();G.hand=null;document.querySelector('.bt[data-k="glove"]')?.classList.remove('armed')}
function handUse(tile,P=handPlan()){if(!P)return;G.locked=true;clearHint();Sound.play('magic');
  const at=p=>relRect(G.books[G.order[p]].el),zs=(P.slots||P.ids).map(at),rs=P.ids.map(at),cx=zs.reduce((s,r)=>s+r.cx,0)/zs.length,cy=zs.reduce((s,r)=>s+r.cy,0)/zs.length;
  P.ids.forEach(id=>G.books[id].el.classList.add('hint'));
  const h=document.createElement('img');h.src=ICO.glove;h.className='handFly';fx.appendChild(h);const s=tile?relRect(tile):{cx,cy:cy+200},W=74;
  const go=(a,b,ms,ease)=>h.animate([{transform:`translate(${a[0]-W/2}px,${a[1]-W/2}px) ${a[2]||''}`},{transform:`translate(${b[0]-W/2}px,${b[1]-W/2}px) ${b[2]||''}`}],{duration:RM?1:ms,easing:ease,fill:'forwards'});
  go([s.cx,s.cy,'scale(.6) rotate(-20deg)'],[cx,cy,'scale(1.15) rotate(0deg)'],420,'cubic-bezier(.3,.7,.3,1.2)').onfinish=()=>{
    rs.forEach(r=>burst(r.cx,r.cy,10,{colors:['#FFE08A','#fff','#FFC548']}));Sound.play('whoosh');
    go([cx,cy,'scale(1.15)'],[cx,cy-10,'scale(.9)'],160,'ease-in').onfinish=()=>{
      G.locked=false;P.ids.forEach(id=>G.books[id].el.classList.remove('hint'));commit(P.o,{free:true,boosterCells:P.slots||P.ids});
      setTimeout(()=>h.animate([{opacity:1},{opacity:0,transform:getComputedStyle(h).transform+' translateY(-30px)'}],{duration:300,fill:'forwards'}).onfinish=()=>h.remove(),200);
      const r=relRect($('#gMoves'));flyText(`+${P.ids.length} placed!`,r.cx,r.cy+50,'#A86A12')}}}
function freezeStart(){const g=G,mv=$('#gMoves'),END=performance.now()+5000;g.frz=true;Sound.play('magic');buzz('medium');renderBoosters();
  mv.querySelector('.frzOv')?.remove();const ov=document.createElement('div');ov.className='frzOv';ov.innerHTML=`<img src="${ICO.freeze}" alt=""><b class="ol">5</b>`;mv.appendChild(ov);mv.classList.add('frozen');
  const r=relRect(mv);burst(r.cx,r.cy,16,{colors:['#BFE8FF','#fff','#69CBF5']});toast('Time Freeze! Moves are free for 5 seconds.',2200);
  const end=()=>{clearInterval(t);ov.remove();mv.classList.remove('frozen');if(G===g){g.frz=false;renderBoosters();if(!g.solved){const r=relRect(mv);burst(r.cx,r.cy,10,{colors:['#BFE8FF','#fff']});Sound.play('click')}}};
  const t=setInterval(()=>{if(G!==g||g.solved)return end();const left=END-performance.now();if(left<=0)return end();ov.querySelector('b').textContent=Math.ceil(left/1000);ov.style.setProperty('--p',(left/5000).toFixed(3))},100)}
/* v12: первый жест пользователя включает звук и музыку */
document.addEventListener('pointerdown',()=>Sound.init(),{capture:true,once:true});

/* gallery sets of 10 (patch_gallery_sets.py, 2026-10-23) */

/* v12 full-art self-check: every book shows a full cell; the cells tile the painting exactly */
window.__artCheck=()=>{const L=G.Lay,seen=new Map();let area=0,bad=[];
  G.books.forEach(b=>{const cs=getComputedStyle(b.el),w=parseFloat(b.el.style.width),hh=parseFloat(b.el.style.height)-(b.cap||0);
    const [bx,by]=b.el.style.backgroundPosition.split(' ').map(v=>-parseFloat(v));const [aw,ah]=b.el.style.backgroundSize.split(' ').map(parseFloat);
    const c=Math.round(bx/w),r=Math.round(by/hh),k=r+','+c;if(Math.abs(w-L.pw)>.01||Math.abs(hh-L.ph)>.01||Math.abs(bx-c*w)>.01||Math.abs(by-r*hh)>.01)bad.push(b.id);
    seen.set(k,(seen.get(k)||0)+1);area+=w*hh;if(Math.abs(aw-L.artW)>.01||Math.abs(ah-L.artH)>.01)bad.push('size'+b.id)});
  return{ok:!bad.length&&seen.size===G.n&&[...seen.values()].every(v=>v===1),coverage:+(area/(L.artW*L.artH)*100).toFixed(2),cells:seen.size,books:G.n,bad}};
