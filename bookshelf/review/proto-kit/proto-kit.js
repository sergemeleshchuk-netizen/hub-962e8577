/* proto-kit v1 — общий каркас экрана прототипа (стандарт rules.md, раздел 0.1)
   Даёт: запуск уровня по адресу ?level=N, лоадинг-скрин с иконкой перед уровнем,
   переход в home и обратно, favicon из иконки, метки для аудитора (/screen-fix).
   Подключение (внутри страницы с <div id="phone">):
     <script src="../proto-kit/proto-kit.js"></script>
     ProtoKit.init({slug:'arrowsort', name:'Arrow Sort', icon:'icon.png', iconEmoji:'🧪',
                    accent:'#8a5bd4', levels:5,
                    startLevel(n){...}, showHome(){...}});
   Дальше в игре: ProtoKit.play(n) — открыть уровень (с лоадером), ProtoKit.home() — в меню. */
(function(){
'use strict';
const KIT_VERSION='1.0';
const CSS=`
#pk-loader{position:absolute;inset:0;z-index:900;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:radial-gradient(120% 90% at 50% 28%,var(--pk-a2),var(--pk-a1) 72%);color:#fff;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;transition:opacity .28s ease;overflow:hidden;}
#pk-loader.pk-out{opacity:0;pointer-events:none;}
#pk-loader.pk-hidden{display:none;}
.pk-glow{position:absolute;width:300px;height:300px;border-radius:50%;top:calc(50% - 210px);
  background:radial-gradient(circle,rgba(255,255,255,.38),rgba(255,255,255,0) 68%);animation:pk-pulse 1.7s ease-in-out infinite;}
.pk-spark{position:absolute;width:8px;height:8px;border-radius:50%;background:#fff;opacity:0;animation:pk-spark 2.4s ease-in-out infinite;}
.pk-icon{position:relative;width:128px;height:128px;border-radius:30px;overflow:hidden;display:flex;align-items:center;justify-content:center;
  font-size:74px;line-height:1;background:linear-gradient(160deg,var(--pk-a2),var(--pk-a1));
  box-shadow:0 22px 44px rgba(0,0,0,.38),0 0 0 4px rgba(255,255,255,.42);animation:pk-bob 1.7s ease-in-out infinite;}
.pk-icon img{width:100%;height:100%;object-fit:cover;display:block;}
.pk-icon::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 55%);pointer-events:none;}
.pk-title{margin-top:24px;font-weight:900;font-size:28px;line-height:1.1;letter-spacing:1px;text-align:center;padding:0 24px;
  text-shadow:0 3px 0 rgba(0,0,0,.22),0 8px 18px rgba(0,0,0,.25);}
.pk-bar{margin-top:28px;width:62%;max-width:270px;height:16px;border-radius:9px;background:rgba(0,0,0,.28);overflow:hidden;
  box-shadow:inset 0 2px 5px rgba(0,0,0,.35),0 1px 0 rgba(255,255,255,.25);}
.pk-fill{height:100%;width:0%;border-radius:9px;position:relative;background:linear-gradient(180deg,#fff6b8,#ffd23f 55%,#f5a70a);
  box-shadow:0 0 12px rgba(255,210,63,.6);}
.pk-fill::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.75) 50%,transparent 70%);
  background-size:200% 100%;animation:pk-shimmer 1s linear infinite;}
.pk-txt{margin-top:12px;font-weight:800;font-size:13px;letter-spacing:3px;opacity:.85;}
@keyframes pk-pulse{0%,100%{transform:scale(.9);opacity:.7}50%{transform:scale(1.08);opacity:1}}
@keyframes pk-bob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.04)}}
@keyframes pk-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
@keyframes pk-spark{0%{transform:translateY(0) scale(.4);opacity:0}30%{opacity:.9}100%{transform:translateY(-140px) scale(1);opacity:0}}
.pk-apptile{display:inline-flex;align-items:center;justify-content:center;border-radius:24%;overflow:hidden;
  background:linear-gradient(160deg,var(--pk-a2),var(--pk-a1));box-shadow:0 12px 26px rgba(0,0,0,.28),0 0 0 3px rgba(255,255,255,.5);position:relative;}
.pk-apptile img{width:100%;height:100%;object-fit:cover;display:block;}
.pk-apptile::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.3),rgba(255,255,255,0) 55%);}
`;
const cfg={slug:'proto',name:'Prototype',icon:'icon.png',iconEmoji:'🎮',accent:'#5b8cf0',levels:1,
  minLoad:1100,startLevel:null,showHome:null};
let phone,loader,fill,hasIconImg=null,screen='boot',loadCount=0;
const state={get screen(){return screen;}};
const $=(t,c,p)=>{const e=document.createElement(t);if(c)e.className=c;if(p)p.appendChild(e);return e;};
function setScreen(s){screen=s;document.documentElement.dataset.pkScreen=s;}
function mixLight(hex){/* светлее на 35% */
  const m=/^#?([0-9a-f]{6})$/i.exec(hex.trim());if(!m)return hex;
  const n=parseInt(m[1],16),r=n>>16,g=n>>8&255,b=n&255,L=c=>Math.round(c+(255-c)*.38);
  return '#'+[L(r),L(g),L(b)].map(c=>c.toString(16).padStart(2,'0')).join('');
}
function iconInto(el){/* картинка если есть, иначе эмодзи на градиенте */
  el.textContent='';
  if(hasIconImg===false||!cfg.icon){el.textContent=cfg.iconEmoji;return;}
  const img=new Image();img.alt='';img.src=cfg.icon;
  img.onerror=()=>{hasIconImg=false;el.textContent=cfg.iconEmoji;window.__proto.iconImage=false;};
  img.onload=()=>{hasIconImg=true;window.__proto.iconImage=true;};
  el.appendChild(img);
}
function setFavicon(){
  let l=document.querySelector('link[rel~="icon"]');
  if(!l){l=document.createElement('link');l.rel='icon';document.head.appendChild(l);}
  if(hasIconImg!==false&&cfg.icon){l.href=cfg.icon;}
  else{l.href='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${cfg.accent}"/><text x="32" y="44" font-size="36" text-anchor="middle">${cfg.iconEmoji}</text></svg>`);}
}
function buildLoader(){
  loader=$('div','pk-hidden',phone);loader.id='pk-loader';
  $('div','pk-glow',loader);
  for(let i=0;i<7;i++){const s=$('div','pk-spark',loader);s.style.left=(12+i*11+Math.random()*6)+'%';s.style.top=(48+Math.random()*30)+'%';
    s.style.animationDelay=(i*.33)+'s';s.style.width=s.style.height=(5+Math.random()*6)+'px';}
  const ic=$('div','pk-icon',loader);iconInto(ic);
  $('div','pk-title',loader).textContent=cfg.name;
  const bar=$('div','pk-bar',loader);fill=$('div','pk-fill',bar);
  $('div','pk-txt',loader).textContent='LOADING';
}
function urlLevel(){
  const m=/[?&#]level=(\d+)/.exec(location.search+location.hash);
  const n=m?parseInt(m[1],10):NaN;
  return n>=1&&n<=cfg.levels?n:null;
}
function setUrl(n){
  try{const u=new URL(location.href);if(n)u.searchParams.set('level',n);else u.searchParams.delete('level');
    u.hash='';history.replaceState(null,'',u);}catch(e){}
}
/* Лоадер: показать, продержать minLoad, за это время построить уровень, спрятать */
function showLoader(work){
  loader.classList.remove('pk-hidden','pk-out');setScreen('loading');
  const t0=performance.now(),dur=cfg.minLoad;let done=false;
  fill.style.width='0%';
  return new Promise(res=>{
    const tick=()=>{const k=Math.min(1,(performance.now()-t0)/dur);
      const e=1-Math.pow(1-k,2.2);fill.style.width=(e*100).toFixed(1)+'%';
      if(k<1)setTimeout(tick,30);else{fill.style.width='100%';finish();}};
    const finish=()=>{if(done)return;done=true;
      setTimeout(()=>{loader.classList.add('pk-out');setTimeout(()=>{loader.classList.add('pk-hidden');res();},300);},120);};
    tick();
    Promise.resolve().then(()=>work&&work()).catch(err=>console.error('[proto-kit] startLevel failed',err));
  });
}
const ProtoKit={
  version:KIT_VERSION,state,
  init(opts){
    Object.assign(cfg,opts||{});
    phone=document.getElementById('phone')||document.body;
    document.documentElement.style.setProperty('--pk-a1',cfg.accent);
    document.documentElement.style.setProperty('--pk-a2',mixLight(cfg.accent));
    const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
    window.__proto={kit:KIT_VERSION,slug:cfg.slug,name:cfg.name,levels:cfg.levels,iconImage:null,get screen(){return screen;},get loads(){return loadCount;}};
    buildLoader();setFavicon();
    const n=urlLevel();
    if(n){ProtoKit.play(n);}else{ProtoKit.home(false);}
    return ProtoKit;
  },
  /* открыть уровень n: адрес ?level=n, лоадер, startLevel(n) */
  play(n){
    n=Math.max(1,Math.min(cfg.levels,n|0));loadCount++;setUrl(n);
    return showLoader(()=>cfg.startLevel&&cfg.startLevel(n)).then(()=>setScreen('game'));
  },
  /* вернуться в home; адрес без ?level */
  home(clearUrl=true){
    if(clearUrl)setUrl(null);
    loader.classList.add('pk-hidden');setScreen('home');
    return cfg.showHome&&cfg.showHome();
  },
  /* плитка-иконка для home-экрана: <img> или эмодзи на градиенте */
  iconTile(size){
    const d=$('div','pk-apptile');d.style.width=d.style.height=(size||96)+'px';d.style.fontSize=Math.round((size||96)*.56)+'px';
    iconInto(d);return d;
  },
  urlLevel,
};
window.ProtoKit=ProtoKit;
})();
