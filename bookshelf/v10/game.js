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
const ICO={peek:'v7/ui/i_peek.svg',coin:'v7/ui/i_coin.png',heart:'v7/ui/i_heart.png',lens:'v7/ui/i_lens.png',glove:'v7/ui/i_glove.png',key:'v7/ui/i_key.png',brush:'v7/ui/i_brush.png',bookmark:'v7/ui/i_bookmark.png',glue:'v7/ui/i_glue.png',books:'v7/ui/i_books.png'};
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
 hand:'<svg viewBox="0 0 54 66"><path d="M19 5c0-4.6 7.5-4.6 7.5 0v24.5l2.8-.6c2.9-.6 5.4 1 5.8 3.6l1.4-.4c2.9-.6 5.4 1.1 5.8 3.8l1.3-.2c2.9-.3 5.2 1.7 5.2 4.6v11.4C48.8 60 42 64 34 64h-3.6c-6.2 0-10.7-3.2-13.4-8.6L7.5 39.8c-1.9-3.6 2.7-7.6 6.3-4.5L19 40z" fill="#fff" stroke="#3B2414" stroke-width="3" stroke-linejoin="round"/></svg>',
};
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
const SVG_CLASSIC={...SVG};
const BOOST={
 peek:{name:'Art Peek',price:100,desc:'Shows the finished painting for 5 seconds.',unlock:3,gift:3},
 lens:{name:'Hint Lens',price:150,desc:'Shows the best move on the shelf.',unlock:5,gift:2},
 glove:{name:'Magic Glove',price:300,desc:'Your next move is free.',unlock:12,gift:2},
 key:{name:'Golden Key',price:450,desc:'Opens a lock or unties a ribbon.',unlock:16,gift:2},
 brush:{name:'Art Brush',price:650,desc:'Paints a book into its place. No move spent.',unlock:25,gift:1},
 bookmark:{name:'Lucky Bookmark',price:250,desc:'Start with +2 moves.',unlock:8,gift:1,pre:1,img:'bookmark'},
 glue:{name:'Starter Glue',price:400,desc:'Start with one pair already glued.',unlock:18,gift:1,pre:1,img:'glue'},
 shelf:{name:'Golden Shelf',price:700,desc:'Start with +3 moves and a free Hint Lens.',unlock:28,gift:1,pre:1,img:'books'},
};
const IN_LEVEL=['peek','lens','glove','key','brush'],PRE=['bookmark','glue','shelf'];
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
const DEF={level:1,coins:300,lives:5,livesTs:0,inv:{peek:0,lens:0,glove:0,key:0,brush:0,bookmark:0,glue:0,shelf:0},gifted:{},seenFeat:{},arts:{},albums:{},
  daily:{day:0,last:''},league:{week:'',pts:0},streak:0,removeAds:false,starter:false,bundle:false,adGap:0,attempts:{},tut:{},rv:{d:'',n:0},
  settings:{sfx:true,music:false,haptics:true,minimalUi:false},stats:{wins:0,fails:0,boosters:0}};
function merge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object')merge(a[k],b[k]);else a[k]=b[k]}return a}
let S=(()=>{try{const s=JSON.parse(localStorage.getItem('bap_v10')||'null');if(s)return merge(JSON.parse(JSON.stringify(DEF)),s)}catch(e){}return JSON.parse(JSON.stringify(DEF))})();
const ICO_CLASSIC={...ICO};
const ICO_MINIMAL=Object.fromEntries(Object.keys(ICO_CLASSIC).map(k=>[k,`v10/ui/i_${k}.svg`]));
function applyUiStyle(){
  const on=!!S.settings.minimalUi;
  document.getElementById('minimalStyle').disabled=!on;
  for(const k of Object.keys(SVG_CLASSIC))SVG[k]=on?SVG_MINIMAL[k]:SVG_CLASSIC[k];
  $('#hSettings').innerHTML=SVG.gear;$('#gPause').innerHTML=SVG.pause;
  for(const k of Object.keys(ICO_CLASSIC)){
    const from=on?ICO_CLASSIC[k]:ICO_MINIMAL[k],to=on?ICO_MINIMAL[k]:ICO_CLASSIC[k];
    document.querySelectorAll('img').forEach(img=>{if(img.getAttribute('src')===from)img.src=to});
    ICO[k]=to;
  }
  if(G&&!$('#sGame').hidden)renderBoosters();
  if(!$('#sHome').hidden)refreshHome();
}

function save(){try{localStorage.setItem('bap_v10',JSON.stringify(S))}catch(e){}}
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
    this.sfx=x.createGain();this.sfx.gain.value=.9;this.sfx.connect(x.destination);
    const b=x.createBuffer(1,x.sampleRate,x.sampleRate),dt=b.getChannelData(0);for(let i=0;i<dt.length;i++)dt[i]=Math.random()*2-1;this.nb=b}catch(e){this.ctx=null}},
  tone(f,type,peak,a,d,when=0,to){const x=this.ctx;if(!x)return;const t=x.currentTime+when,o=x.createOscillator(),g=x.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+a+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);o.connect(g);g.connect(this.sfx);o.start(t);o.stop(t+a+d+.05)},
  noise(ft,f,q,peak,a,d,when=0){const x=this.ctx;if(!x)return;const t=x.currentTime+when,s=x.createBufferSource(),fl=x.createBiquadFilter(),g=x.createGain();s.buffer=this.nb;fl.type=ft;fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);s.connect(fl);fl.connect(g);g.connect(this.sfx);s.start(t,Math.random()*.5);s.stop(t+a+d+.05)},
  play(n,v=1){if(!S.settings.sfx)return;this.init();if(!this.ctx)return;switch(n){
    case 'pickup':this.noise('highpass',1800,.7,.09,.004,.07);this.tone(260,'sine',.07,.004,.08);break;
    case 'pickup_big':this.noise('highpass',1200,.7,.12,.006,.1);this.tone(190,'sine',.1,.006,.12);break;
    case 'slide':this.noise('bandpass',900,.9,.04,.03,.12);break;
    case 'thud':this.tone(150,'sine',.42,.003,.16,0,70);this.noise('lowpass',700,.8,.22,.002,.07);this.tone(300,'triangle',.04,.002,.05);break;
    case 'glue':this.noise('bandpass',2600,2,.1,.002,.03);[784,988,1175].slice(0,1+Math.min(2,v)).forEach((f,i)=>this.tone(f,'sine',.06,.005,.5,.03+i*.07));break;
    case 'combo':[659,880,1175].forEach((f,i)=>{this.tone(f,'triangle',.07,.01,.35,i*.08);this.tone(f*2,'sine',.02,.01,.3,i*.08)});break;
    case 'win':[523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>{this.tone(f,'triangle',.08,.01,1.4,i*.1);this.tone(f*2,'sine',.025,.01,1,i*.1)});break;
    case 'fail':[392,330,262].forEach((f,i)=>this.tone(f,'triangle',.08,.01,.45,i*.16));break;
    case 'coin':this.tone(1568,'square',.025,.002,.08);this.tone(2093,'square',.022,.002,.18,.06);break;
    case 'click':this.tone(700,'sine',.06,.003,.05);this.noise('highpass',3000,.7,.03,.001,.02);break;
    case 'pop':this.tone(420,'sine',.08,.004,.12,0,900);break;
    case 'magic':for(let i=0;i<6;i++)this.tone(880*Math.pow(1.19,i),'sine',.035,.005,.25,i*.045);break;
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
  /* A shuffled board must start without naturally glued neighbours. The before-level Glue booster is the sole exception. */
  if(pc(a)>0||a.filter((v,i)=>v===i).length>Math.max(0,Math.floor(n*.06)))a=[...Array(n).keys()].reverse();
  return a}

function prepareLevel(L){const def=levelDef(L);const R=rng(def.seed+(S.attempts[L]||0)*977);const {n,cols}=def;
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
  const moves=Math.max(3,Math.ceil(opt*(n>=FRAME_MIN?MOVE_K_FRAME[def.d]:1+def.slack)))+(L<=3?1:0)+(n>=FRAME_MIN?2:0)-stars.length*2+Object.keys(ticks).length*2;
  return{def,order,locks,links,hidden,stars,ticks,keyBook,moves,opt}}

/* =========================================================
   GAME STATE + SHELF
   ========================================================= */
let G=null;const caseEl=$('#case'),stage=$('#stage');
const BOOK_SEED=7;
const CLEAN_BG=['lib_1_alexandria.jpg','lib_2_song.jpg','lib_3_baghdad.jpg','lib_4_monastery.jpg','lib_5_florence.jpg','lib_6_baroque.jpg','lib_7_london.jpg','lib_8_tokyo.jpg'];
const roomBackground=(art,L)=>window.__bookshelfBgPreview?`v7-2/ui/${CLEAN_BG[Math.floor((L-1)/10)%CLEAN_BG.length]}`:themeOf(art,L).bg;


function startLevel(prep,pre){
  const {def}=prep;const art=def.art;const R=rng(def.seed*3+1);
  G={def,L:def.L,art,rows:def.rows,cols:def.cols,n:def.n,order:prep.order.slice(),pos:[],books:[],
     locks:{...prep.locks},links:prep.links.map(x=>x.slice()),hidden:new Set(prep.hidden),stars:new Set(prep.stars||[]),ticks:{...(prep.ticks||{})},tickN:prep.def.mods.tickN||7,keyBook:prep.keyBook??-1,
     moves:prep.moves+(pre.bookmark?2:0)+(pre.shelf?3:0),startMoves:0,used:0,glove:false,freeLens:pre.shelf?1:0,
     replay:pre.replay||null,rvUsed:false,buys:0,locked:true,sel:null,solved:false,Lay:null,combo:[],ghosts:[],bonusDoubled:false};
  G.startMoves=G.moves;G.frame=true;
  /* Every correctly placed book pins in place, on every difficulty. */
  G.freeze=true;G.anch=new Set();
  if(pre.glue)applyStarterGlue(R);
  syncPos();
  caseEl.innerHTML='';const TH=themeOf(art,S.level);caseEl.className=TH.cls;$('#sGame').style.setProperty('--roombg',`url(${roomBackground(art,S.level)})`);caseEl.style.setProperty('--art',`url(${art.file})`);
  G.rowbacks=[];G.planks=[];
  ['crown','base'].forEach(c=>{const d=document.createElement('div');d.className=c;caseEl.appendChild(d)});
  for(let r=0;r<G.rows;r++){const rb=document.createElement('div');rb.className='rowback';caseEl.appendChild(rb);G.rowbacks.push(rb);const pl=document.createElement('div');pl.className='plank';caseEl.appendChild(pl);G.planks.push(pl)}
  for(let id=0;id<G.n;id++){const el=document.createElement('div');el.className='book';el.innerHTML='<i></i>';
    const b={id,el,inset:.8+R()*1.8,hf:.92+R()*.08};el.style.setProperty('--band',R()<.65?(.25+R()*.3).toFixed(2):'0');el.style.setProperty('--dk',(R()*.12).toFixed(2));
    el.addEventListener('pointerdown',e=>Input.down(e,id));G.books.push(b);caseEl.appendChild(el)}
  G.final=document.createElement('div');G.final.className='final';caseEl.appendChild(G.final);
  decorate();
  $('#gLevel').textContent=G.replay?'Replay':'Level '+G.L;$('#gBadge').innerHTML=G.replay?`<span class="chip" style="background:${G.replay.col}">${G.replay.label}</span>`:def.badge?`<span class="chip ${def.d>=9?'super':'hard'}">${def.badge}</span>`:'';
  $('#gGoalImg').style.backgroundImage=`url(${art.file})`;$('#peekImg').style.backgroundImage=`url(${art.file})`;
  $('#winWrap')?.remove();$('#sGame').classList.remove('won','won2');
  renderBoosters();updateHud();show('sGame');
  requestAnimationFrame(()=>{layout(false,true);
    G.books.forEach(b=>{b.el.style.transition='none';b.el.style.opacity='0';b.el.style.transform+=' translateY(-34px)'});
    caseEl.offsetHeight;const ord=[...G.books].sort(()=>Math.random()-.5);const step=Math.min(30,900/G.n);
    ord.forEach((b,i)=>setTimeout(()=>{b.el.style.transition='';b.el.style.opacity='';placeBook(b.id);if(i%5===0)Sound.play('slide')},120+i*step));
    setTimeout(()=>{G.locked=false;Sound.play('thud');levelIntro()},260+G.n*step)});
}
function applyStarterGlue(R){const {cols,n}=G;const busy=id=>G.locks[id]||G.hidden.has(id)||G.links.some(l=>l.includes(id));
  const cand=[];for(let k=0;k<n;k++){if(k%cols===cols-1)continue;if(busy(k)||busy(k+1))continue;cand.push(k)}if(!cand.length)return;
  const k=cand[Math.floor(R()*cand.length)];[k,k+1].forEach(id=>{const p=G.order.indexOf(id);if(p===id)return;const other=G.order[id];if(busy(other))return;G.order[id]=id;G.order[p]=other})}
const isAnch=id=>!!G&&G.pos[id]===id;
function anchorFx(){const now=new Set();for(let id=0;id<G.n;id++)if(isAnch(id))now.add(id);
  const fresh=[...now].filter(id=>!G.anch.has(id));G.anch=now;if(!fresh.length||G.solved)return;
  fresh.forEach(id=>{const el=G.books[id].el;el.classList.remove('pin');void el.offsetWidth;el.classList.add('pin');const r=relRect(el);burst(r.cx,r.y+8,6,{colors:['#FFE08A','#FFC548','#fff'],spread:30})});Sound.play('unlock')}
function syncPos(){G.pos=[];G.order.forEach((id,p)=>G.pos[id]=p)}
const correctOf=o=>o.reduce((s,id,p)=>s+(id===p),0);

function computeLayout(solved,availW,availH){const {rows,cols}=G;
  const side=solved?8:14,pad=solved?8:12,t=solved?0:clamp(availH*.022,9,14),hr=solved?0:(rows===1?.05:.08);
  let imgW=Math.min(availW-2*side,520),imgH=imgW;
  if(2*pad+imgH*(1+hr)+(rows-1)*t>availH){imgH=(availH-2*pad-(rows-1)*t)/(1+hr);imgW=imgH}
  const sw=imgW/cols,sh=imgH/rows;
  /* in play, shelves grow taller to fill the free height so the bookcase reads big and close */
  const rowH=solved?sh:Math.max(sh*(1+hr),Math.min(sh*1.15,(availH-2*pad-(rows-1)*t)/rows));
  return{solved,side,pad,t,imgW,imgH,sw,sh,rowH,caseW:imgW+2*side,caseH:2*pad+rows*rowH+(rows-1)*t}}
function slot(L,p){const r=Math.floor(p/G.cols),c=p%G.cols;return{r,c,x:L.side+c*L.sw,y:L.pad+r*(L.rowH+L.t)+(L.rowH-L.sh)}}
function layout(solved,instant){const W=stage.clientWidth,H=stage.clientHeight;
  const L=computeLayout(solved,W,solved?Math.min(H-20,W):H-14);G.Lay=L;
  caseEl.style.width=L.caseW+'px';caseEl.style.height=L.caseH+'px';caseEl.style.left=(W-L.caseW)/2+'px';caseEl.style.top=(solved?6:(H-L.caseH)/2)+'px';
  for(let r=0;r<G.rows;r++){const y=L.pad+r*(L.rowH+L.t);Object.assign(G.rowbacks[r].style,{left:L.side+'px',top:y+'px',width:L.imgW+'px',height:L.rowH+'px'});
    Object.assign(G.planks[r].style,{left:(L.side-5)+'px',top:(y+L.rowH)+'px',width:(L.imgW+10)+'px',height:(r===G.rows-1?(solved?0:Math.max(7,L.pad-3)):L.t)+'px'})}
  Object.assign(G.final.style,{left:L.side+'px',top:L.pad+'px',width:L.imgW+'px',height:L.imgH+'px'});
  G.books.forEach(b=>{b.el.style.backgroundSize=`${L.imgW}px ${L.imgH}px`});
  refreshBooks(instant);placeGhosts()}
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
  let cv=el.querySelector('.cover');if(G.hidden.has(id)&&!cv){cv=document.createElement('u');cv.className='cover ol';cv.textContent='?';el.appendChild(cv)}
  let ch=el.querySelector('.chains');if(G.locks[id]&&!ch){ch=document.createElement('s');ch.className='chains';ch.innerHTML=SVG.pad+'<em class="ol"></em>';el.appendChild(ch)}
  if(ch&&G.locks[id])ch.querySelector('em').textContent=G.def.mods.lockHp>1?G.locks[id]:'';
  el.classList.toggle('lockd',!!G.locks[id]);
  let tie=el.querySelector('.tie');const lk=G.links.find(l=>l.includes(id));
  if(lk&&!tie){tie=document.createElement('b');tie.className='tie'+(lk[0]===id?' knot':'');el.appendChild(tie)}
  badge(el,'star',G.stars.has(id),SVG.star);
  badge(el,'tick',G.ticks[id]!==undefined,`<span>${G.ticks[id]??''}</span>`);
  badge(el,'kb',G.keyBook===id,`<img src="${ICO.key}" alt="">`)})}
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
    const base=L.solved?0:Math.min(b.inset,L.sw*.07);
    b.insL=lk.l?0:base;b.insR=lk.r?0:base;b.hfNow=(L.solved||glued)?1:b.hf;
    const cr=Math.floor(b.id/G.cols),cc=b.id%G.cols;
    el.style.width=(L.sw-b.insL-b.insR)+'px';el.style.height=(L.sh*b.hfNow)+'px';
    el.style.backgroundPosition=`${-(cc*L.sw+b.insL)}px ${-(cr*L.sh+L.sh*(1-b.hfNow))}px`;
    el.classList.toggle('glued',glued&&!L.solved);el.classList.toggle('framed',isAnch(b.id)&&!L.solved);el.classList.toggle('gl-l',!!lk.l);el.classList.toggle('gl-r',!!lk.r);
    placeBook(b.id);if(instant){el.offsetHeight;el.style.transition=''}})}
function bookXY(id,p){const L=G.Lay,b=G.books[id],s=slot(L,p);return{x:s.x+b.insL,y:s.y+L.sh*(1-b.hfNow)}}
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
  for(const k in lk){const a=+k;if(ls.has(a))continue;if(G.pos[a]!==a&&!inG.has(a))continue;if(lk[a].r&&np[a+1]!==np[a]+1)return inG.has(a)?a+1:a;if(lk[a].d&&np[a+G.cols]!==np[a]+G.cols)return inG.has(a)?a+G.cols:a}
  return -1}

/* ---------- commit a new arrangement ---------- */
function commit(newOrder,opt={}){
  const before=G.order.slice(),old=G.groups;G.order=newOrder;syncPos();clearHint();
  G.links.slice().forEach(l=>{if(l.some(id=>G.pos[id]===id))untie(l)});
  if(G.loose){G.loose.forEach(i=>G.books[i].el.classList.remove('loose'));G.loose=null}
  const changed=before.some((v,i)=>v!==newOrder[i]);
  G.books.forEach(b=>b.el.classList.remove('lift','sel','target','dragging'));G.sel=null;
  refreshBooks(false);
  if(!changed){Sound.play('thud');return}
  const movedIds=[];G.order.forEach((id,p)=>{if(before[p]!==id)movedIds.push(id)});
  setTimeout(()=>{movedIds.forEach((id,i)=>{const el=G.books[id].el;el.classList.remove('land');void el.offsetWidth;el.classList.add('land');
    if(i<6){const r=relRect(el);burst(r.cx,r.y+r.h-2,3,{colors:['#E9D3AE','#C9A57A','#F6E6C4'],size:6,spread:22,g:-8,dur:420})}})},170);
  if(!opt.free){if(G.glove){G.glove=false;const r=relRect($('#gMoves'));flyText('Free move!',r.cx,r.cy+50,'#5634A3');renderBoosters()}else{G.moves--;bumpMoves()}}
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
  Object.keys(G.locks).forEach(k=>{const id=+k;const near=grown.has(id)||neighbours(G.pos[id]).some(p=>grown.has(G.order[p]));
    if(near){G.locks[id]--;changed=true;if(G.locks[id]<=0)unlockBook(id);else{const ch=G.books[id].el.querySelector('.chains');ch.animate([{transform:'rotate(0)'},{transform:'rotate(-8deg)'},{transform:'rotate(6deg)'},{transform:'rotate(0)'}],{duration:350});Sound.play('unlock')}}});
  G.hidden.forEach(id=>{if(grown.has(id)||G.pos[id]===id||neighbours(G.pos[id]).some(p=>grown.has(G.order[p])))revealBook(id)});
  G.links.slice().forEach(l=>{if(l.some(id=>natSize(g,id)>1))untie(l)});
  if(changed)decorate()}
function unlockBook(id){delete G.locks[id];const el=G.books[id].el,ch=el.querySelector('.chains');el.classList.remove('lockd');if(ch){ch.classList.add('gone');setTimeout(()=>ch.remove(),400)}
  const r=relRect(el);burst(r.cx,r.cy,14,{colors:['#DDE3EA','#FFC548','#fff']});Sound.play('unlock');buzz('medium');G.groups=computeGroups()}
function revealBook(id){if(!G.hidden.has(id))return;G.hidden.delete(id);const cv=G.books[id].el.querySelector('.cover');if(cv){cv.classList.add('gone');setTimeout(()=>cv.remove(),450)}const r=relRect(G.books[id].el);burst(r.cx,r.cy,8,{colors:['#C29BFF','#FFC548','#fff']});Sound.play('magic')}
function untie(l){G.links=G.links.filter(x=>x!==l);l.forEach(id=>{const t=G.books[id].el.querySelector('.tie');if(t){t.classList.add('gone');setTimeout(()=>t.remove(),350)}});
  const r=relRect(G.books[l[0]].el);burst(r.x+r.w,r.cy,10,{colors:['#E58BFF','#C35BE0','#fff']});Sound.play('unlock');G.groups=computeGroups()}

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
    Sound.play(ids.length>1?'pickup_big':'pickup');buzz('light');
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
  const iv=setInterval(()=>{t--;if(t>0){n.textContent=t;Sound.play('click')}else{clearInterval(iv);pk.classList.remove('on');G.peeking=false;if(!G.solved)G.locked=false;Sound.play('whoosh')}},1000)}

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
      if(k==='key'&&!Object.keys(G.locks).length&&!G.links.length)b.classList.add('na');if(k==='glove'&&G.glove)b.classList.add('armed');b.onclick=()=>useBooster(k)}
    bar.appendChild(b)})}
function useBooster(k){if(!G||G.locked||G.solved)return;
  if(k==='glove'&&G.glove){toast('Magic Glove is ready. Make any move for free.');return}
  if(k==='key'&&!Object.keys(G.locks).length&&!G.links.length){toast('No locks or ribbons on this shelf.');return}
  if((k==='lens'||k==='brush')&&!bestMove()){toast('Open a lock first. Try the Golden Key.');return}
  const have=S.inv[k]+(k==='lens'?G.freeLens:0);
  if(have>0){if(k==='lens'&&G.freeLens)G.freeLens--;else S.inv[k]--;S.stats.boosters++;save();applyBooster(k);renderBoosters()}
  else buyBooster(k,()=>{S.inv[k]--;S.stats.boosters++;save();applyBooster(k);renderBoosters()})}
function applyBooster(k){const tile=document.querySelector(`.bt[data-k="${k}"]`);if(tile){const r=relRect(tile);burst(r.cx,r.cy,10)}
  document.querySelectorAll('.bt.nudge').forEach(x=>x.classList.remove('nudge'));tipOff();
  if(k==='peek'){peekShow(5)}
  if(k==='lens'){const m=bestMove();clearHint();Sound.play('magic');
    G.sel=m.id;m.ids.forEach(i=>{G.books[i].el.classList.add('hint','sel')});liftGroup(m.ids,true);
    G.ghosts=m.ids.map(i=>G.pos[i]+m.dr*G.cols+m.dc);placeGhosts();m.ids.forEach(i=>revealBook(i));
    const toCells=G.ghosts;handDemo(m.ids.map(i=>G.pos[i]),toCells,2);
    toast('Tap the glowing spot or drag the book there.')}
  if(k==='glove'){G.glove=true;Sound.play('magic');updateHud();toast('Your next move is free!')}
  if(k==='key'){const lk=Object.keys(G.locks)[0];if(lk!==undefined){const r=relRect(G.books[+lk].el);keyFly(tile,r,()=>unlockBook(+lk))}else if(G.links.length){const l=G.links[0];const r=relRect(G.books[l[0]].el);keyFly(tile,r,()=>untie(l))}}
  if(k==='brush'){const m=bestMove();Sound.play('magic');m.ids.forEach(i=>{const r=relRect(G.books[i].el);burst(r.cx,r.cy,14,{colors:['#FF735F','#FFC548','#53D96B','#69CBF5','#A77AF4']})});
    G.locked=true;setTimeout(()=>{G.locked=false;commit(m.o,{free:true})},260)}}
function keyFly(tile,r,done){const k=document.createElement('img');k.src=ICO.key;k.style.cssText='position:absolute;width:56px;height:56px;left:0;top:0;z-index:230';fx.appendChild(k);const s=relRect(tile);
  k.animate([{transform:`translate(${s.cx-28}px,${s.cy-28}px) scale(1)`},{transform:`translate(${(s.cx+r.cx)/2-28}px,${Math.min(s.cy,r.cy)-90}px) scale(1.4) rotate(-30deg)`},{transform:`translate(${r.cx-28}px,${r.cy-28}px) scale(.8) rotate(20deg)`}],{duration:620,easing:'cubic-bezier(.4,0,.3,1)'}).onfinish=()=>{k.remove();done()}}
function clearHint(){G&&G.books.forEach(b=>b.el.classList.remove('hint'));if(G)G.ghosts=[];placeGhosts();stopHand()}
function placeGhosts(){caseEl.querySelectorAll('.ghost').forEach(g=>g.remove());if(!G||!G.ghosts||!G.ghosts.length||!G.Lay)return;
  G.ghosts.forEach(p=>{const s=slot(G.Lay,p),g=document.createElement('div');g.className='ghost';Object.assign(g.style,{left:s.x+2+'px',top:s.y+2+'px',width:G.Lay.sw-4+'px',height:G.Lay.sh-4+'px'});caseEl.appendChild(g)})}

function buyBooster(k,useNow){const B=BOOST[k];const p3=Math.round(B.price*3*.85/50)*50;
  const p=popup({title:B.name,html:`<img class="bigicon" src="${bImg(k)}" alt=""><div class="ptext">${B.desc}</div>
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
  const frame=true;const moves=Math.ceil(opt*MOVE_K_FRAME[d])+2;
  toast(`Test shelf: ${def.n} books · correct books pin in place`,2600);startLevel({def,order,locks:{},links:[],hidden:[],moves,opt},{})}
function openStart(){tickLives();if(S.lives<=0){outOfLives();return}
  const L=S.level,prep=prepareLevel(L),def=prep.def;const sel={bookmark:false,glue:false,shelf:false};
  const mods=[];if(Object.keys(prep.locks).length)mods.push(`<span class="mod">${SVG.pad}Locks</span>`);if(prep.links.length)mods.push(`<span class="mod">${SVG.ribbon}Ribbons</span>`);if(prep.hidden.length)mods.push(`<span class="mod">${SVG.q}Hidden books</span>`);
  if(prep.stars.length)mods.push(`<span class="mod">${SVG.star}Star books +3</span>`);if(Object.keys(prep.ticks).length)mods.push(`<span class="mod tickc"><b>${prep.def.mods.tickN}</b>Ticking books</span>`);if(prep.keyBook>=0)mods.push(`<span class="mod"><img src="${ICO.key}" alt="">Key book</span>`);
  const wind=(S.attempts[L]||0)>=2;if(wind)prep.moves+=3;
  const p=popup({title:'Level '+L,ribbon:def.d>=9?'purple':def.d>=7?'coral':'',html:`
    ${def.badge?`<span class="chip ${def.d>=9?'super':'hard'}">${def.badge} level</span>`:''}
    <div class="thumb">${teaser(prep)}</div>
    <div class="ptext">Restore the painting in <b style="color:var(--blue);font-size:20px">${prep.moves}</b> moves</div>
    ${def.d>=9?'<div class="mstr">Masterpiece level · big reward</div>':''}${wind?'<div class="wind">Second wind: +3 moves on this try</div>':''}
    ${mods.length?`<div class="mods">${mods.join('')}</div>`:''}
    <div class="col" style="gap:8px"><span class="lbl">Boosters</span><div class="preb" id="preb"></div></div>
    <button class="btn wide big" id="sPlay"><span class="t">Play</span></button>`});
  const pb=q(p,'#preb');
  const draw=()=>{pb.innerHTML='';PRE.forEach(k=>{const B=BOOST[k],b=document.createElement('button');b.className='bt'+(sel[k]?' on':'');b.setAttribute('aria-label',B.name);
    if(S.level<B.unlock){b.classList.add('locked');b.innerHTML=`<img src="${bImg(k)}" alt=""><span class="lk">${SVG.pad}<span>Lv ${B.unlock}</span></span>`;b.onclick=()=>toast(`${B.name} unlocks at level ${B.unlock}`)}
    else{const n=S.inv[k];b.innerHTML=`<span class="tick">${SVG.tick}</span><img src="${bImg(k)}" alt="">`+(n>0?`<span class="cnt">${n}</span>`:`<span class="price"><img src="${ICO.coin}" alt="">${B.price}</span>`);
      b.onclick=()=>{sel[k]=!sel[k];if(sel[k])toast(B.name+': '+B.desc,1600);draw()}}
    pb.appendChild(b)})};draw();
  q(p,'#sPlay').onclick=()=>{let cost=0;PRE.forEach(k=>{if(sel[k]&&S.inv[k]<=0)cost+=BOOST[k].price});
    if(cost>S.coins){toast('Not enough coins for these boosters');openShop(true);return}
    spend(cost);PRE.forEach(k=>{if(sel[k]){if(S.inv[k]>0)S.inv[k]--;S.stats.boosters++}});save();
    p.close(()=>{pkPre=sel;ProtoKit.play(L)})}}
function levelIntro(){if(G.replay)return;const L=G.L;
  if(L===21&&!S.tut.star){S.tut.star=1;save();tip('<b>Star books</b> give <b>+3 moves</b> the moment they land in their spot.',null,5500);return}
  if(L===41&&!S.tut.tick){S.tut.tick=1;save();tip('<b>Ticking book!</b> Put it in its spot before the counter hits 0, or lose 3 moves.',null,6000);return}
  if(L===51&&!S.tut.keyb){S.tut.keyb=1;save();tip('Place the <b>Key book</b> in its spot to open <b>every lock</b> at once.',ICO.key,5500);return}
  if(!S.tut.frame){S.tut.frame=1;save();tip('<b>Place a book correctly:</b> it gets a gold pin and stays put.',null,5000);return}
  if(L===1&&!S.tut.l1){tip('Drag a book onto another to <b>swap</b> them. Rebuild the painting!',ICO.books);const m=bestMove();if(m)handDemo(m.ids.map(i=>G.pos[i]),m.ids.map(i=>G.pos[i]+m.dr*G.cols+m.dc),99);G.tut1=true}
  else if(L===2&&!S.tut.glue){G.tut2=true}
  else if(L===BOOST.peek.unlock&&!S.tut.peek){S.tut.peek=1;save();tip('Forgot the picture? <b>Art Peek</b> shows it for 5 seconds.',ICO.peek,5000);document.querySelector('.bt[data-k="peek"]')?.classList.add('nudge')}
  else if(L===BOOST.lens.unlock&&!S.tut.lens){S.tut.lens=1;save();tip('Stuck? Your free <b>Hint Lens</b> shows the best move.',ICO.lens,5000);document.querySelector('.bt[data-k="lens"]')?.classList.add('nudge')}
  else if(L===BOOST.glove.unlock&&!S.tut.glove){S.tut.glove=1;save();tip('<b>Magic Glove</b>: your next move costs nothing.',ICO.glove,4500)}
  else if(L===16&&!S.tut.lock){S.tut.lock=1;save();tip('<b>Locked books</b> open when you glue books next to them. A Golden Key opens one at once.',ICO.key,6000)}
  else if(L===BOOST.brush.unlock&&!S.tut.brush){S.tut.brush=1;save();tip('<b>Art Brush</b> paints a book into place without spending a move.',ICO.brush,4500)}
  else if(L===36&&!S.tut.tie){S.tut.tie=1;save();tip('<b>Tied books</b> move together. Glue either one to its true neighbour to untie them.',null,6000)}
  else if(L===66&&!S.tut.hid){S.tut.hid=1;save();tip('<b>Hidden books</b> show their picture once a neighbour glues next to them.',null,6000)}}
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
function failLevel(){if(G.replay){replayFail();return}loseLife();S.streak=0;S.stats.fails++;S.attempts[G.L]=(S.attempts[G.L]||0)+1;save();
  const p=popup({title:'Level Failed',ribbon:'coral',close:false,html:`<div style="position:relative"><img class="bigicon" src="${ICO.heart}" alt="" style="filter:grayscale(.6);animation:none"><span class="ol" style="position:absolute;right:-14px;top:30px;font:700 34px var(--f-hero);color:#fff;--o:var(--coral-o)">−1</span></div>
    <div class="ptext">You lost a life. The shelf will be shuffled again.</div>
    <button class="btn wide" id="fRetry"><span class="t">Try Again</span></button><button class="link" id="fHome">Home</button>`});
  q(p,'#fRetry').onclick=()=>p.close(()=>{goHome(false);setTimeout(openStart,250)});q(p,'#fHome').onclick=()=>p.close(()=>goHome(false))}
function pauseMenu(){if(!G||G.solved)return;const p=popup({title:'Paused',html:`${settingsRows()}<button class="btn wide" id="pRes"><span class="t">Continue</span></button><button class="link" id="pQuit">${G.replay?'Leave (no life lost)':'Leave level (lose a life)'}</button>`});
  bindSettings(p);q(p,'#pRes').onclick=()=>p.close();q(p,'#pQuit').onclick=()=>p.close(()=>{if(G.used>0&&!G.replay){loseLife();S.attempts[G.L]=(S.attempts[G.L]||0)+1;S.streak=0;save()}goHome(false)})}

function complete(){G.solved=true;G.locked=true;clearHint();tipOff();
  G.books.forEach(b=>{const c=G.pos[b.id]%G.cols,r=Math.floor(G.pos[b.id]/G.cols);b.el.classList.remove('ok','land','wave');b.el.style.animationDelay=(c*45+r*30)+'ms';void b.el.offsetWidth;b.el.classList.add('wave')});
  const L=G.L,def=G.def,art=G.art;
  // rewards
  const RP=G.replay;const base=RP?RP.reward:def.reward,left=Math.min(G.moves,10)*5;if(!RP)S.streak++;const streakBonus=!RP&&S.streak%5===0?150:0;
  const prevCount=S.arts[art.id]||0;S.arts[art.id]=prevCount+1;const tierOf=n=>n>=3?3:n>=2?2:n>=1?1:0;const tierUp=tierOf(prevCount+1)>tierOf(prevCount);const tierBonus=tierUp&&prevCount>0?250:0;
  const total=base+left+streakBonus+tierBonus;
  if(!RP){S.level=L+1;S.stats.wins++;S.adGap++;delete S.attempts[L];
  const wk=weekKey();if(S.league.week!==wk){S.league={week:wk,pts:0}}S.league.pts+=10+def.d*3}else S.stats.replays=(S.stats.replays||0)+1;
  save();
  setTimeout(()=>{$('#sGame').classList.add('won');layout(true);caseEl.classList.add('solved')},300);
  setTimeout(()=>{caseEl.classList.add('framed');G.final.classList.add('on');Sound.play('win');buzz('success')},1250);
  setTimeout(()=>{
    const t=tierOf(prevCount+1);
    const wrap=document.createElement('div');wrap.id='winWrap';
    wrap.innerHTML=`<div class="winTitle">Restored!</div><div class="winArt"><i style="background-image:url(${art.file})"></i></div><div class="sheet pending"></div>`;
    const sh=wrap.querySelector('.sheet');
    sh.innerHTML=`<div class="artname">${art.title}</div><div class="after">${art.after}</div>
      <div class="reward"><img src="${ICO.coin}" alt=""><span class="v ol" id="wCoins">+${total}</span></div>
      <div class="tiers"><span>Frame</span><span class="tier b ${t>=1?'on':''}">1</span><span class="tier s ${t>=2?'on':''}">2</span><span class="tier g ${t>=3?'on':''}">3</span><span style="color:var(--muted)">restored ${prevCount+1}×</span></div>
      ${RP?`<div class="ptext" style="font-size:14px">Replay · ${RP.label} ${RP.rows}×${RP.cols}</div>`:''}${streakBonus?`<div class="ptext" style="font-size:14px">5-win streak bonus +150!</div>`:''}${tierBonus?`<div class="ptext" style="font-size:14px">New frame unlocked +250!</div>`:''}
      <div class="row"><button class="btn purple sm" id="wX2"><span class="t">×2 coins</span></button><button class="btn" id="wNext" style="flex:1"><span class="t">Continue</span></button></div>`;
    $('#sGame').appendChild(wrap);
    /* art takes whatever height is left after title + panel, so the whole group fits and sits centred */
    const fit=()=>{const H=wrap.clientHeight,W=wrap.clientWidth;const used=wrap.querySelector('.winTitle').offsetHeight+sh.offsetHeight+2*14+52;
      wrap.querySelector('.winArt').style.width=Math.max(140,Math.min(W-32,H-used,440))+'px'};fit();
    $('#sGame').classList.add('won2');confetti();
    setTimeout(()=>{sh.classList.remove('pending');Sound.play('pop');const el=$('#wCoins'),t0=performance.now();el.textContent='+0';const step=t=>{const k=Math.min(1,(t-t0)/750),e=1-Math.pow(1-k,3);el.textContent='+'+Math.round(total*e);if(k<1)requestAnimationFrame(step);else{el.parentElement.classList.remove('bump');void el.offsetWidth;el.parentElement.classList.add('bump');Sound.play('coin')}};setTimeout(()=>requestAnimationFrame(step),250)},700);

    const collect=mult=>{const from=relRect(sh.querySelector('.reward'));addCoins(total*mult);coinFly(from,{cx:from.cx,cy:-30},Math.min(12,6+mult*3))};
    sh.querySelector('#wX2').onclick=e=>{e.currentTarget.disabled=true;showAd('rv',()=>{G.bonusDoubled=true;$('#wCoins').textContent='+'+total*2;Sound.play('coin')})};
    sh.querySelector('#wNext').onclick=()=>{collect(G.bonusDoubled?2:1);sh.querySelector('#wNext').disabled=true;
      setTimeout(()=>{const go=()=>goHome(!RP);if(!RP&&L>=6&&!S.removeAds&&S.adGap>=2){S.adGap=0;save();showAd('inter',go)}else go()},700)}},2300)}

function show(id){['sHome','sGame'].forEach(s=>$('#'+s).hidden=s!==id)}
function goHomeRaw(won){closeAll();tipOff();stopHand();$('#winWrap')?.remove();show('sHome');refreshHome(won);setTimeout(featureCheck,won?500:100)}

/* =========================================================
   HOME + META
   ========================================================= */
function weekKey(){const d=new Date(),y=new Date(d.getFullYear(),0,1);return d.getFullYear()+'w'+Math.ceil(((d-y)/864e5+y.getDay()+1)/7)}
const sideDefs=[{k:'daily',side:'tl',lb:'Daily',icon:SVG.gift,L:7,fn:()=>openDaily()},{k:'gallery',side:'bl',lb:'Gallery',icon:SVG.frame,L:3,fn:()=>openGallery()},
  {k:'shop',side:'tr',lb:'Shop',icon:`<img src="${ICO.coin}" alt="">`,L:10,fn:()=>openShop()},{k:'league',side:'br',lb:'League',icon:SVG.trophy,L:30,fn:()=>openLeague()}];
function refreshHome(){tickLives();
  $('#hCoins .v').textContent=S.coins;$('#hLives .v').textContent=S.lives;
  $('#hLives .sv').textContent=S.lives>=MAXL?'Full':fmt((REGEN-(Date.now()-S.livesTs))/1000);
  const def=levelDef(S.level);$('#sHome').style.setProperty('--roombg',`url(${roomBackground(def.art,S.level)})`);$('#sHome').style.setProperty('--minimal-room-bg',`url(${new URL(roomBackground(def.art,S.level),location.href).href})`);
  $('#hPlaySub').textContent='Level '+S.level;
  $('#hEasel').innerHTML=`<div class="frame">${teaser(prepareLevel(S.level))}</div><div class="q ol">?</div><div class="plate">Level ${S.level}${def.badge?` <span class="chip ${def.d>=9?'super':'hard'}">${def.badge}</span>`:''}</div>`;
  // 10-level band strip
  const b0=Math.floor((S.level-1)/10)*10+1;let st='';for(let i=0;i<10;i++){const l=b0+i,d=levelDef(l);st+=`<b class="${l<S.level?'on':''} ${d.d>=9?'peak':''}" title="Level ${l}"></b>`}$('#hStrip').innerHTML=`<span>${b0}</span>${st}<span>${b0+9}</span>`;
  {const box=$('#hNav');box.innerHTML='';['shop','daily','gallery','league'].map(k=>sideDefs.find(d=>d.k===k)).forEach(d=>{const lock=S.level<d.L;const b=document.createElement('button');b.className='sbtn'+(lock?' locked':'');
    const icon=d.k==='shop'?`<img src="${ICO.coin}" alt="">`:SVG[{daily:'gift',gallery:'frame',league:'trophy'}[d.k]];
    b.innerHTML=`<span class="tile">${icon}</span>${lock?`<span class="pad">${SVG.pad}</span><span class="lvl">Lv ${d.L}</span>`:''}<span class="lb ol">${d.lb}</span>`+(!lock&&d.k==='daily'&&S.daily.last!==today()?'<span class="dot">!</span>':'')+(!lock&&d.k==='shop'&&S.level>=15&&!S.starter?'<span class="dot">%</span>':'');
    b.onclick=()=>lock?toast(`${d.lb} opens at level ${d.L}`):d.fn();box.appendChild(b)})}}
setInterval(()=>{if(!$('#sHome').hidden){tickLives();$('#hLives .v').textContent=S.lives;$('#hLives .sv').textContent=S.lives>=MAXL?'Full':fmt((REGEN-(Date.now()-S.livesTs))/1000)}},1000);

function featureCheck(){ // one unlock announcement at a time
  const b=IN_LEVEL.concat(PRE).find(k=>S.level>=BOOST[k].unlock&&!S.gifted[k]);
  if(b){const B=BOOST[b];S.gifted[b]=1;S.inv[b]+=B.gift;save();
    const p=popup({title:'New Booster!',ribbon:'green',html:`<img class="bigicon" src="${bImg(b)}" alt=""><div class="ptitle">${B.name}</div><div class="ptext">${B.desc}${B.pre?' Pick it before a level starts.':''}</div><div class="ptext" style="color:var(--green-o)">Free gift: ${B.gift} × ${B.name}</div><button class="btn wide" id="ok"><span class="t">Great!</span></button>`});
    q(p,'#ok').onclick=()=>p.close(featureCheck);return}
  const f=FEATURES.find(f=>S.level>=f.L&&!S.seenFeat[f.k]);
  if(f){S.seenFeat[f.k]=1;save();const d=sideDefs.find(s=>s.k===f.k);
    const p=popup({title:'Unlocked!',ribbon:'green',html:`<div style="width:110px;height:110px">${d.icon.replace('<svg','<svg style="width:110px;height:110px"').replace('<img','<img style="width:110px;height:110px"')}</div><div class="ptitle">${f.name}</div><div class="ptext">${f.text}</div><button class="btn wide" id="ok"><span class="t">Open</span></button>`});
    q(p,'#ok').onclick=()=>p.close(()=>d.fn());return}
  if(S.level>=15&&!S.starter&&!S.seenFeat.starterOffer){S.seenFeat.starterOffer=1;save();openShop()}}

/* ---------- shop ---------- */
function openShop(fromNeed){const coinPacks=[[700,'$0.99'],[3800,'$4.99',' Popular'],[8500,'$9.99'],[19000,'$19.99',' Best value']];
  tickLives();const rvLeft=5-(S.rv.d===today()?S.rv.n:0);
  const p=popup({title:'Shop',ribbon:'',cls:'tall wide',html:`<div class="row" style="justify-content:space-between"><div class="ctr" style="min-width:120px;padding-right:14px"><img src="${ICO.coin}" alt=""><span class="v coinsV">${S.coins}</span></div>${fromNeed?'<span class="ptext" style="font-size:14px">Get coins to keep going</span>':''}</div>
    <div class="scroll">
     ${S.level>=15&&!S.starter?`<div class="starter"><span class="tag">ONE TIME</span><h4 class="ol">Starter Pack</h4><div class="items"><div><img src="${ICO.coin}" alt="">1500</div><div><img src="${ICO.glove}" alt="">×3</div><div><img src="${ICO.lens}" alt="">×2</div><div><img src="${ICO.heart}" alt="">Full</div></div><button class="btn gold wide sm" data-iap="starter"><span class="t">$1.99</span></button></div>`:''}
     <div class="sect">Coins</div>
     ${coinPacks.map(([c,pr,tag],i)=>`<div class="shopItem"><div class="ic"><img src="${ICO.coin}" alt="">${i>1?`<img src="${ICO.coin}" alt="">`:''}</div><div class="tx"><b>${c.toLocaleString('en-US')} coins</b><small>${tag?tag.trim():'Coin pouch'}</small></div><button class="btn sm" data-iap="c${i}"><span class="t">${pr}</span></button></div>`).join('')}
     <div class="shopItem"><div class="ic"><img src="${ICO.coin}" alt=""></div><div class="tx"><b>100 free coins</b><small>Watch a video · ${rvLeft} left today</small></div><button class="btn purple sm" data-rv ${rvLeft<=0?'disabled':''}><span class="t">Watch</span></button></div>
     <div class="sect">Booster bundles</div>
     ${[['peek',3,250],['lens',3,400],['glove',3,800],['key',2,800],['brush',2,1100]].map(([k,n,c])=>`<div class="shopItem"><div class="ic"><img src="${bImg(k)}" alt=""></div><div class="tx"><b>${BOOST[k].name} ×${n}</b><small>${BOOST[k].desc}</small></div><button class="btn gold sm" data-bb="${k},${n},${c}"><img class="coin" src="${ICO.coin}" alt=""><span class="t">${c}</span></button></div>`).join('')}
     <div class="sect">Specials</div>
     ${S.bundle?'':`<div class="shopItem"><div class="ic"><img src="${ICO.brush}" alt=""><img src="${ICO.books}" alt=""></div><div class="tx"><b>Gallery Bundle</b><small>5000 coins, 3 Art Brushes, 3 Golden Keys</small></div><button class="btn sm" data-iap="bundle"><span class="t">$7.99</span></button></div>`}
     ${S.removeAds?'':`<div class="shopItem"><div class="ic">${SVG.x.replace('stroke="#fff"','stroke="#D9473A"').replace('<svg','<svg style="width:40px;height:40px"')}</div><div class="tx"><b>Remove Ads</b><small>No ad breaks between levels. Videos for rewards stay optional.</small></div><button class="btn sm" data-iap="noads"><span class="t">$4.99</span></button></div>`}
     <div class="shopItem"><div class="ic"><img src="${ICO.heart}" alt=""></div><div class="tx"><b>Refill lives</b><small>${S.lives}/${MAXL} lives</small></div><button class="btn gold sm" data-lives ${S.lives>=MAXL?'disabled':''}><img class="coin" src="${ICO.coin}" alt=""><span class="t">900</span></button></div>
     <p class="ptext" style="font-size:12px;color:var(--muted)">Prototype store. Purchases are simulated and free.</p>
    </div>`});
  const grants={starter:()=>{S.starter=true;S.coins+=1500;S.inv.glove+=3;S.inv.lens+=2;S.lives=MAXL},c0:()=>S.coins+=700,c1:()=>S.coins+=3800,c2:()=>S.coins+=8500,c3:()=>S.coins+=19000,
    bundle:()=>{S.bundle=true;S.coins+=5000;S.inv.brush+=3;S.inv.key+=3},noads:()=>{S.removeAds=true}};
  const prices={starter:'$1.99',c0:'$0.99',c1:'$4.99',c2:'$9.99',c3:'$19.99',bundle:'$7.99',noads:'$4.99'};const names={starter:'Starter Pack',c0:'700 coins',c1:'3,800 coins',c2:'8,500 coins',c3:'19,000 coins',bundle:'Gallery Bundle',noads:'Remove Ads'};
  p.el.querySelectorAll('[data-iap]').forEach(b=>b.onclick=()=>{const k=b.dataset.iap;purchase(names[k],prices[k],()=>{grants[k]();p.close(()=>{openShop();if(G&&!$('#sGame').hidden)renderBoosters()})})});
  p.el.querySelectorAll('[data-bb]').forEach(b=>b.onclick=()=>{const [k,n,c]=b.dataset.bb.split(',');if(!spend(+c)){toast('Not enough coins');return}S.inv[k]+=+n;save();Sound.play('coin');toast(`${BOOST[k].name} ×${n} added`);if(G&&!$('#sGame').hidden)renderBoosters()});
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
    <div class="albumBg" style="background-image:url(${THEMES[set.th].bg})"></div><div class="grid4">${arts.map((a,i)=>{const n=S.arts[a.id]||0,t=tierOf(n);const lv=set.lv[i];return `<button class="gcard t${t}" data-art="${a.id}"><i style="background-image:url(${a.file})"></i>${t?'':`<span class="lq ol">?</span>`}<div class="nm">${t?a.title:'Level '+lv}</div></button>`}).join('')}</div></div>`}).join('')}
    <p class="ptext" style="font-size:12px;color:var(--muted)">Frames upgrade at 1, 2 and 3 restorations. Every painting is an original parody of a public-domain masterpiece.</p></div>`});
  p.el.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{const al=b.dataset.claim;S.albums[al]=1;const r=relRect(b);addCoins(300);coinFly(r,{cx:r.cx,cy:-20},8);b.remove()});
  p.el.querySelectorAll('[data-art]').forEach(b=>b.onclick=()=>{const a=ART.find(x=>x.id===b.dataset.art);if(!S.arts[a.id]){toast('Restore it on the shelf to unlock');return}
    const v=popup({title:a.title.length>18?'Painting':a.title,cls:'wide',html:`<div class="thumb" style="width:min(300px,100%)"><i style="display:block;width:100%;height:100%;border-radius:6px;background:url(${a.file}) center/cover"></i></div><div class="artname">${a.title}</div><div class="after">${a.after}</div><div class="ptext" style="font-size:15px;margin:0"><b>Restored ${S.arts[a.id]}×</b></div><div class="ptext" style="font-size:13px;margin-top:-4px">Restore it again on a bigger shelf. No life needed.</div>
      <div class="replay">${REPLAY.map((r,i)=>`<button class="btn ${r.btn}" data-rp="${i}"><span class="stack"><span class="t">${r.label}</span><span class="sub t">${r.rows}×${r.cols} books · +${r.reward}</span></span></button>`).join('')}</div>`});
    v.el.querySelectorAll('[data-rp]').forEach(btn=>btn.onclick=()=>{const r=REPLAY[+btn.dataset.rp];closeAll();startReplay(a,r)})})}
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
const DAILY=[{c:100},{c:150},{b:'lens',n:1},{c:200},{b:'glove',n:1},{c:250},{c:500,b:'brush',n:1}];
function openDaily(){const can=S.daily.last!==today();const d=S.daily.day%7;
  const cell=(r,i)=>{const cls=i<d?'done':i===d&&can?'today':'';const ic=r.b?bImg(r.b):ICO.coin;const amt=r.b?`×${r.n}`:r.c;
    return i===6?`<div class="day big ${cls}"><span>Day 7</span><img src="${ICO.coin}" alt=""><span class="amt">${r.c}</span><img src="${ICO.brush}" alt=""><span class="amt">×1</span></div>`:`<div class="day ${cls}"><span>Day ${i+1}</span><img src="${ic}" alt=""><span class="amt">${amt}</span></div>`};
  const p=popup({title:'Daily Gifts',ribbon:'green',cls:'wide',html:`<div class="days">${DAILY.map(cell).join('')}</div><div class="ptext" style="font-size:14px">${can?'Your gift is ready!':'Come back tomorrow for the next gift.'}</div><button class="btn wide" id="dClaim" ${can?'':'disabled'}><span class="t">${can?'Claim':'Claimed'}</span></button>`});
  q(p,'#dClaim').onclick=()=>{const r=DAILY[d];S.daily.last=today();S.daily.day++;if(r.b)S.inv[r.b]+=r.n;save();const from=relRect(q(p,'.day.today')||q(p,'#dClaim'));if(r.c){addCoins(r.c);coinFly(from,relRect($('#hCoins')),8)}else Sound.play('magic');
    p.close(()=>{refreshHome();$('#hCoins').classList.add('bump');setTimeout(()=>$('#hCoins').classList.remove('bump'),500)})}}

/* ---------- league (bots) ---------- */
const BOTS=['BookWorm_88','Mila R.','ArtFox','Jonas','Pixel Pam','QuietReader','Leo the Great','Sunny','Kat_Paints','Owlish','Marta','VanGoghGetter','Tomoko','Biblio Bill','Daisy','Hugo','ShelfieQueen','Ravi','Nora','Max P.'];
function openLeague(){const wk=weekKey();if(S.league.week!==wk)S.league={week:wk,pts:0};
  const now=new Date(),day=(now.getDay()+6)%7,hrs=day*24+now.getHours()+now.getMinutes()/60;const R=rng(wk.split('').reduce((a,c)=>a*31+c.charCodeAt(0),7)>>>0);
  const rows=BOTS.slice(0,19).map((n,i)=>{const rate=.2+R()*2.4;return{n,pts:Math.round(rate*hrs+R()*8),c:['#53D96B','#69CBF5','#FF735F','#A77AF4','#FFC548'][i%5]}});
  rows.push({n:'You',pts:S.league.pts,me:1,c:'#357BE8'});rows.sort((a,b)=>b.pts-a.pts||(a.me?-1:1));
  const left=(7-day)*24-now.getHours();
  const p=popup({title:'Silver League',ribbon:'',cls:'tall wide',html:`<div class="row" style="gap:14px">${SVG.trophy.replace('<svg','<svg style="width:54px;height:54px"')}<div class="ptext" style="text-align:left;font-size:14px">Win levels to earn points. Harder levels give more.<br><b>Ends in ${Math.floor(left/24)}d ${left%24}h</b> · Top 5 move up to Gold</div></div>
    <div class="scroll">${rows.map((r,i)=>`${i===5?'<div class="zone up">▲ Promotion zone above</div>':''}${i===17?'<div class="zone dn">▼ Demotion zone below</div>':''}<div class="lrow ${r.me?'me':''}"><span class="rk ${i<3?'r'+(i+1):''}">${i+1}</span><span class="av" style="background:${r.c}">${r.n[0]}</span><span class="nm">${r.n}</span><span class="pts">${r.pts}</span></div>`).join('')}</div>`})}

/* ---------- settings ---------- */
function settingsRows(){return ['sfx:Sound','haptics:Vibration','minimalUi:Minimalistic UI'].map(s=>{const [k,l]=s.split(':');return `<div class="set"><span>${l}</span><button class="tg ${S.settings[k]?'on':''}" data-set="${k}" aria-label="${l}"></button></div>`}).join('')}
function bindSettings(p){p.el.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{const k=b.dataset.set;S.settings[k]=!S.settings[k];b.classList.toggle('on',S.settings[k]);save();if(k==='minimalUi')applyUiStyle()})}
function openSettings(){const p=popup({title:'Settings',html:`${settingsRows()}
  <div class="col" style="gap:8px"><span class="lbl">Prototype tools</span><div class="dbg">
   <button class="btn gold" data-d="t40"><span class="t">Test 40</span></button><button class="btn gold" data-d="t48"><span class="t">Test 48</span></button><button class="btn gold" data-d="t54"><span class="t">Test 54</span></button><button class="btn grey" data-d="lm"><span class="t">Level −10</span></button><button class="btn grey" data-d="lp"><span class="t">Level +10</span></button><button class="btn grey" data-d="l1"><span class="t">Level +1</span></button>
   <button class="btn grey" data-d="coins"><span class="t">+1000 coins</span></button><button class="btn grey" data-d="lives"><span class="t">Lose lives</span></button><button class="btn grey" data-d="day"><span class="t">Next day</span></button><button class="btn coral" data-d="reset"><span class="t">Reset</span></button></div></div>
  <p class="ptext" style="font-size:12px;color:var(--muted)">Paintings are original cartoon parodies of public-domain masterpieces.</p>`});
  bindSettings(p);
  p.el.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const d=b.dataset.d;
    if(d[0]==='t'&&d[1]!=='d'){const g={t40:[5,8],t48:[6,8],t54:[6,9]}[d];if(g){p.close(()=>testLevel(g[0],g[1]));return}}
    if(d==='lm')S.level=Math.max(1,S.level-10);if(d==='lp')S.level+=10;if(d==='l1')S.level++;if(d==='coins')S.coins+=1000;if(d==='lives'){S.lives=0;S.livesTs=Date.now()}
    if(d==='day')S.daily.last='';
    if(d==='reset'){if(b.dataset.armed){S=JSON.parse(JSON.stringify(DEF))}else{b.dataset.armed=1;b.querySelector('.t').textContent='Tap again';return}}
    save();refreshHome();toast(d==='reset'?'Progress reset':'Done · level '+S.level)})}

/* =========================================================
   BOOT
   ========================================================= */
$('#hSettings').innerHTML=SVG.gear;$('#gPause').innerHTML=SVG.pause;$('#gEye').innerHTML=`<img src="${ICO.peek}" alt="">`;
$('#hSettings').onclick=openSettings;$('#gPause').onclick=pauseMenu;
$('#hPlay').onclick=()=>{Sound.init();openStart()};
$('#hCoins .plus').onclick=()=>S.level>=10?openShop():toast('Shop opens at level 10');
$('#hLives .plus').onclick=()=>{tickLives();S.lives>=MAXL?toast('Lives are full'):outOfLives()};
applyUiStyle();
/* preload images so swaps never flash */
[...ART.map(a=>a.file),...Object.values(ICO),'v7/ui/home_bg.jpg'].forEach(s=>{const i=new Image();i.src=s});
window.__dbg={S:()=>S,blockedBy:(a,b,c)=>blockedBy(a,b,c),groupOf:i=>groupOf(i),G:()=>G,bestMove:()=>bestMove(),commit:o=>commit(o),levelDef,prepareLevel};

/* glue: horizontal only (patch_glue_h.py, 2026-10-21) */
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
ProtoKit.init({slug:'bookshelf',name:'Bookshelf: Art Puzzle',icon:'icon.png',iconEmoji:'📚',accent:'#8c6039',levels:300,
  startLevel(n){pkStart(n)},
  showHome(){goHomeRaw(pkWon);pkWon=false}});

/* v8 tall books (patch_v8_tall.py, 2026-10-21) */

/* gallery sets of 10 (patch_gallery_sets.py, 2026-10-23) */
