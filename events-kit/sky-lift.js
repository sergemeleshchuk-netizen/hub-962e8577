/* Stark Events Kit · Sky Lift (web module)
   Isolated live-ops event: a balloon rises one floor per won level, chests wait on milestone floors,
   a lost level drops the balloon to the last opened chest (never lower), floor 60 = grand prize + new flight.
   Ported from Bookshelf v12 Sky Lift v4 (2026-11-09) and extended per PLAYBOOK/events/02-sky-lift-requirements.md:
   milestones are persisted, every milestone is presented automatically (post-win hop, or on Home if the player left),
   rewards are typed (coins / booster / unlimited lives) and shown on every chest and in the claim popup.
   2026-11-10 (2): first-time how-to popup comes after the chest popup (never over the rise); the rise is paced per floor
   (430 ms/floor, 0.8-2.6 s) and the HUD floor counter ticks floor by floor, so a player who opens the screen from the
   Home tile sees exactly how many floors were gained since the last visit.
   2026-11-11: popup title = ribbon art sl_popribbon (ChatGPT, same set as the screen banner) on every popup; the intro is a
   paywall-style card: hero art sl_hero, coloured headline, four bullets with art icons, timer, one CTA.
   2026-11-16: no reward plates on the tower (the reward is a surprise); floor numbers grey until the balloon reaches them;
   a chest stays closed until Collect, then shows its open, empty art (sl_open1-6); the claim popup opens the chest per the
   "juicy chest" how-to: wobble+squash, stretch, slam with freeze and shake, inner light, shockwave, stars, magic dust.
   2026-11-20: the tower balloon has three burner states (ChatGPT art): small flame while standing, big flame while rising,
   no fire while falling (sl_balloon_idle / _up / _off).
   2026-11-20 (UI/UX review): every chest faces the tower centre (new art: closed sl_chestN, claim reveal sl_fullN full of loot,
   taken sl_openN empty); the claim ribbon names the floor and the rewards are the hero; HUD = balloon badge + bar to the next
   chest (updates after the rise, not before); intro hero with the game balloon; lose chip shows floor A → B; winChip() for the
   host's win screen (+1 floor); lit floor numbers glow gold; the balloon flies closer to the tower.

   Usage (host game):
     const sky = SkyLift.init({
       root: el,                         // phone frame; the screen and popups are mounted inside
       load: () => obj|null, save: obj => {},   // persist the event state (one JSON object)
       playerLevel: () => n,             // 1-based number of the level the player is on (highest unlocked)
       grant: reward => {},              // apply a reward: {type:'coins',n} | {type:'booster',id,n} | {type:'lives',min}
       rewardIcon: reward => html,       // optional: host art for the reward icon (defaults: emoji)
       rewardLabel: reward => text,      // optional
       onPlay: () => {},                 // PLAY on the event screen when opened from Home / the button: start the current level
       sound: name => {},                // optional: 'pop' 'click' 'coin' 'win' 'whoosh' 'slide'
       cfg: {...}                        // optional overrides of SkyLift.DEFAULTS
     });
     EventsHub.register(sky);            // the hub schedules presentations (see events-hub.js)
     sky.mountTile(buttonEl);            // the Home button
   Analytics hooks: cfg.track(name, params) gets sky_lift_* events.
*/
window.SkyLift=(function(){
  const DEFAULTS={
    unlockLevel:2,                  // the event opens once the player reaches this level (1-based)
    seasonDays:3,                   // personal season: starts at unlock, resets at the end (flights are kept)
    /* reward tables live in config/sky-lift-rewards-*.csv (sheet format, Unity reward ids) -> sky-lift-rewards.js (window.SKY_LIFT_REWARDS.<game>);
       a host passes cfg:{milestones,rewards,chests} from there. The defaults below = the Size Match table (2026-11-20): no coins before the top,
       cycle 1 = every booster x1, cycle 2 = booster x2 + booster x1, cycle 3 = booster x2 + power-up x1, top = coins + 2 boosters x3 + power-up x2 */
    milestones:[2,5,8,11,15,20,25,30,40,50,60],
    rewards:[                       // one reward (or a bundle = array) per milestone; the last one is the grand prize
      {type:'booster',id:'swap',n:1},{type:'booster',id:'info',n:1},{type:'booster',id:'jk',n:1},{type:'booster',id:'shield',n:1},
      [{type:'booster',id:'swap',n:2},{type:'booster',id:'info',n:1}],[{type:'booster',id:'info',n:2},{type:'booster',id:'jk',n:1}],[{type:'booster',id:'jk',n:2},{type:'booster',id:'swap',n:1}],
      [{type:'booster',id:'swap',n:2},{type:'booster',id:'shield',n:1}],[{type:'booster',id:'info',n:2},{type:'booster',id:'shield',n:1}],[{type:'booster',id:'jk',n:2},{type:'booster',id:'shield',n:1}],
      [{type:'coins',n:2000},{type:'booster',id:'info',n:3},{type:'booster',id:'swap',n:3},{type:'booster',id:'shield',n:2}]],
    chests:['chest1','chest2','chest1','chest2','chest3','chest4','chest3','chest5','chest6','chest5','grand'],   // chest art per milestone (chest1-6, grand); missing entries cycle chest1-6
    chestsText:'boosters & power-ups',   // the intro line next to the chest
    countReplays:false,             // a won level counts only on its first clear (loss always counts)
    artBase:null,                   // default: art/skylift/ next to this script
    title:'Sky Lift',
    track:null};
  const SEG=150,BASE=190,EASE={out:'cubic-bezier(.22,1,.36,1)',inout:'cubic-bezier(.65,0,.35,1)',in:'cubic-bezier(.5,0,.75,0)'};
  const SVGX='<svg viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>';
  const scriptBase=(()=>{try{const s=document.currentScript&&document.currentScript.src;return s?s.slice(0,s.lastIndexOf('/')+1):''}catch(e){return ''}})();
  const DEF_ICON={coins:'🪙',booster:'🎁',lives:'♾️'};
  function init(a){
    const cfg=Object.assign({},DEFAULTS,a.cfg||{});if(!cfg.artBase)cfg.artBase=scriptBase+'art/skylift/';
    const M=cfg.milestones,N=M.length,root=a.root,snd=n=>{try{a.sound&&a.sound(n)}catch(e){}},track=(n,p)=>{try{cfg.track&&cfg.track(n,p||{})}catch(e){}};
    const art=n=>cfg.artBase+n+'.webp';
    /* tower balloon burner: idle = small flame, up = big flame (rising), off = no fire (falling) */
    const burner=(b,st)=>{b.querySelector('img').src=art('sl_balloon_'+st)};
    ['off','idle','up'].forEach(st=>{new Image().src=art('sl_balloon_'+st)});
    /* ---------- state ---------- */
    const fresh=()=>({status:'locked',seasonStart:0,seasonEnd:0,floor:0,cp:0,presented:0,pending:[],flights:0,seasons:0,tut:false,enter:false});
    let k=Object.assign(fresh(),a.load&&a.load()||{});
    const save=()=>{try{a.save&&a.save(k)}catch(e){}};
    const rewardsOf=i=>[].concat(cfg.rewards[i]||[]);
    const icon=r=>{try{const h=a.rewardIcon&&a.rewardIcon(r);if(h)return h}catch(e){}return DEF_ICON[r.type]||'🎁'};
    const label=r=>{try{const h=a.rewardLabel&&a.rewardLabel(r);if(h)return h}catch(e){}return r.type==='coins'?'+'+r.n:r.type==='booster'?'×'+r.n:r.type==='lives'?r.min+' min':''};
    /* chest art: closed until its reward is collected, then the open, empty one (lid ajar) */
    const chestName=i=>i===N-1?'grand':(cfg.chests[i]&&cfg.chests[i]!=='grand'?cfg.chests[i]:'chest'+(i%6+1));
    const chestArt=(i,st)=>{const n=chestName(i);return n==='grand'?'sl_grand':'sl_'+(st==='full'?n.replace('chest','full'):st?n.replace('chest','open'):n)};   // st: falsy closed, 'full' = claim reveal, truthy = taken (empty)
    const badge=i=>{const rs=rewardsOf(i);if(rs.length===1)return `<span class="skBadge"><span class="i">${icon(rs[0])}</span>${label(rs[0])}</span>`;
      return `<span class="skBadge">${rs.slice(0,3).map(r=>`<span class="i">${icon(r)}</span>`).join('')}${rs.length>3?'+'+(rs.length-3):''}</span>`};
    function tick(){const now=Date.now();
      if(k.status==='locked'&&a.playerLevel()>=cfg.unlockLevel){k.status='active';k.seasonStart=now;k.seasonEnd=now+cfg.seasonDays*864e5;k.seasons=1;save();track('sky_lift_unlock')}
      if(k.status==='active'&&now>=k.seasonEnd){k.seasonStart=now;k.seasonEnd=now+cfg.seasonDays*864e5;k.floor=0;k.cp=0;k.presented=0;k.pending=[];k.seasons++;save();track('sky_lift_season_reset',{seasons:k.seasons})}}
    const enabled=()=>{tick();return k.status==='active'};
    const protectedFloor=()=>k.cp?M[k.cp-1]:0;
    const left=()=>{const ms=Math.max(0,k.seasonEnd-Date.now()),hh=Math.ceil(ms/36e5);return hh>=24?`${Math.floor(hh/24)}d ${hh%24}h`:`${hh}h`};
    const units=h=>{let prev=0;for(let i=0;i<N;i++){const c=M[i];if(h>=c){prev=c;continue}return i+(h-prev)/(c-prev)}return N};
    const Y=u=>BASE+u*SEG;
    /* ---------- results ---------- */
    let gain=0;   // 1 = the last level result lifted the balloon (read once by winChip)
    function onLevelResult(won,level,firstClear){gain=0;const was=k.status;if(!enabled()||was!=='active')return;   // the level that unlocks the event is not counted
      if(won){if(!cfg.countReplays&&firstClear===false)return;if(k.cp>=N)return;k.floor++;gain=1;
        if(k.floor>=M[k.cp]){k.pending.push(k.cp);k.cp++;track('sky_lift_milestone',{floor:M[k.cp-1],index:k.cp-1})}}
      else{const to=protectedFloor();if(k.floor!==to)track('sky_lift_drop',{from:k.floor,to});k.floor=to}
      save();refreshTile()}
    /* ---------- popups ---------- */
    const pops=[];
    function popup({title,html,close=true,onClose,cls=''}){const ov=document.createElement('div');ov.className='skOv';
      ov.innerHTML=`<div class="skPop ${cls}">${title?`<div class="skRibbon" style="background-image:url(${art('sl_popribbon')})"><span class="skOl">${title}</span></div>`:''}${close?`<button class="skX" aria-label="Close">${SVGX}</button>`:''}${html}</div>`;
      root.appendChild(ov);snd('pop');
      const p={ov,el:ov.firstChild,closed:false,close(cb){if(p.closed)return;p.closed=true;ov.classList.add('out');const i=pops.indexOf(p);if(i>=0)pops.splice(i,1);setTimeout(()=>{ov.remove();onClose&&onClose();cb&&cb()},170)},q:s=>ov.querySelector(s)};
      if(close)ov.querySelector('.skX').onclick=()=>{snd('click');p.close()};pops.push(p);return p}
    const closePops=()=>pops.slice().forEach(p=>p.close());
    function confettiIn(el){const c=document.createElement('div');c.className='skConf';const cols=['#FFC548','#A77AF4','#53D96B','#5FE6F2','#FF735F','#fff'];
      c.innerHTML=Array.from({length:26},(_,i)=>`<i style="left:${4+Math.random()*92}%;background:${cols[i%cols.length]};animation-delay:${Math.random()*.5}s;animation-duration:${1.3+Math.random()*.8}s"></i>`).join('');el.appendChild(c);setTimeout(()=>c.remove(),2600)}
    /* intro: paywall layout (hero art, coloured headline, four short bullets, timer, one CTA) instead of a wall of text */
    /* VFX burst: big stars that pop like bubbles + tiny drifting sparks (art sl_star / sl_spark) */
    function burst(host,{stars=6,dust=12,size=1}={}){const b=document.createElement('div');b.className='skBurst';b.style.setProperty('--s',size);
      b.innerHTML=Array.from({length:stars},(_,i)=>{const a=-150+i*(120/Math.max(1,stars-1))+(Math.random()*16-8),d=(70+Math.random()*40)*size;
          return `<img class="st" src="${art('sl_star')}" alt="" style="--x:${(Math.cos(a*Math.PI/180)*d).toFixed(0)}px;--y:${(Math.sin(a*Math.PI/180)*d).toFixed(0)}px;--r:${(Math.random()*80-40).toFixed(0)}deg;animation-delay:${(i*.035).toFixed(2)}s">`}).join('')
        +Array.from({length:dust},()=>`<img class="du" src="${art('sl_spark')}" alt="" style="--x:${((Math.random()*2-1)*80*size).toFixed(0)}px;--y:${(-(40+Math.random()*90)*size).toFixed(0)}px;animation-delay:${(.1+Math.random()*.6).toFixed(2)}s">`).join('');
      host.appendChild(b);setTimeout(()=>b.remove(),2200)}
    /* the claim popup's chest: 1 wobble + squash (faster and faster), 2 stretch, 3 slam open (freeze, then the popup shakes),
       4 light from inside, 5 shockwave ring, 6 stars, 7 magic dust; rewards and Collect come in after the slam */
    function juicyOpen(p){const jz=p.q('.skJuicy');snd('pop');jz.classList.add('wob');
      setTimeout(()=>{if(p.closed)return;jz.classList.remove('wob');jz.classList.add('slam');snd('win');
        setTimeout(()=>{if(p.closed)return;p.el.animate&&p.el.animate([{translate:'0 0'},{translate:'-6px 3px'},{translate:'5px -4px'},{translate:'-4px 2px'},{translate:'3px -1px'},{translate:'0 0'}],{duration:300});burst(jz,{stars:7,dust:14})},70)},1080)}
    function infoPopup(cb){const pts=[[art('sl_balloon_up'),'Win a level:','+1 floor'],[art('sl_'+chestName(0)),'Chests:',cfg.chestsText],
        [art('sl_balloon_off'),'Lose:','drop to your last chest'],[art('sl_grand'),`Floor ${M[N-1]}:`,'grand prize']];
      const p=popup({title:cfg.title,cls:'skIntro',html:`<img class="skHero big" src="${art('sl_hero')}" alt=""><div class="skHead">Fly to the top!</div>
        <ul class="skPts">${pts.map(([src,a,b],i)=>`<li class="${['up','','dn',''][i]}" style="animation-delay:${.12+i*.07}s"><img src="${src}" alt=""><span><b>${a}</b> ${b}</span></li>`).join('')}</ul>
        <div class="skEnds">Ends in <b>${left()}</b></div><button class="skBtn gold wide" id="skOk"><span class="t">Let's go!</span></button>`});
      p.q('#skOk').onclick=()=>{snd('click');p.close(cb)};return p}
    /* ---------- screen ---------- */
    let sec=null,anim=0,timer=0;
    function ensure(){if(sec)return sec;sec=document.createElement('div');sec.className='skScreen';sec.hidden=true;sec.id='skScreen';root.appendChild(sec);return sec}
    function render(){const seen=k.presented,H=Y(N)+380;
      const cps=M.map((c,i)=>{const y=Y(i+1),on=k.cp>i,fresh=on&&k.pending.includes(i),done=on&&!fresh,lit=on&&c<=seen;
        return (i===N-1?`<div class="skGrand ${done?'on':''}" data-i="${i}" style="--y:${y}px"><img class="skChest" src="${art('sl_grand')}" alt=""></div>`
          :`<div class="skStop ${done?'on':''}" data-i="${i}" style="--y:${y}px"><img class="skPlat" src="${art('sl2_bracket')}" alt=""><img class="skChest c" src="${art(chestArt(i))}" alt=""><img class="skChest o" src="${art(chestArt(i,true))}" alt=""></div>`)
          +`<div class="skHex ${lit?'on':''}" data-f="${c}" style="--y:${y}px"><span class="skOl">${c}</span></div>`}).join('');
      const clouds=Array.from({length:N+2},(_,i)=>`<img class="skCloud c${i%4}" src="${art('sl2_cloud'+(i%4+1))}" alt="" style="--y:${Y(i+.45)+(i%3)*28}px;left:${i%2?58+(i*7)%26:44+(i*11)%14}%">`).join('');
      const from=Y(units(seen));
      sec.innerHTML=`<div class="skBg"></div>
        <div class="skTop"><button class="skI" id="skInfo" aria-label="How it works"><span class="skOl">i</span></button><div class="skBanner"><img src="${art('sl_banner')}" alt=""><span class="skTitle skOl">${cfg.title}</span><span class="skTime" id="skTime">${left()}</span></div><button class="skX skScrX" id="skClose" aria-label="Close">${SVGX}</button></div>
        <div class="skScroll" id="skScroll"><div class="skTower" style="height:${H}px"><div class="skCity"></div>${clouds}<div class="skMast"></div><div class="skMastTop"></div><div class="skMastBase"></div><div class="skHex zero" style="--y:${BASE}px"><span class="skOl">0</span></div>${cps}<div class="skBalloon" id="skBalloon" style="bottom:${from}px"><img src="${art('sl_balloon_idle')}" alt=""></div></div></div>
        <div class="skHud"><div class="skFire"><img src="${art('sl_balloon_idle')}" alt=""><b class="skOl" id="skFloor">${seen}</b></div><div class="skInfoTxt" id="skInfoTxt"></div><button class="skBtn gold" id="skPlay"><span class="t">Play</span></button></div>`;
      hudText(seen)}
    /* HUD: the next chest and a progress bar from the last chest floor; counted from the floor on screen, so it never runs ahead of the rise */
    function hudText(shown){const fl=shown==null?k.floor:shown,el=sec.querySelector('#skInfoTxt');if(!el)return;const i=M.findIndex(c=>c>fl);
      if(i<0)el.innerHTML=`<strong>Top reached!</strong>`;
      else{const from=i?M[i-1]:0,need=M[i]-fl,pct=Math.round((fl-from)/(M[i]-from)*100);
        el.innerHTML=`<strong>${need} win${need===1?'':'s'} to next chest</strong><span class="skBar"><i style="width:${pct}%"></i><b>${fl-from}/${M[i]-from}</b><img src="${art(chestArt(i))}" alt=""></span>`}
      const f=sec.querySelector('#skFloor');if(f)f.textContent=fl}
    /* open({from:'win'|'home'|'button', play, close}) → cascade in → balloon moves (camera follows) → pause → fresh chests pop → claim popup */
    function open(ctx){ensure();tick();const seen=k.presented,run=++anim;render();sec.hidden=false;sec.classList.remove('out');sec.classList.add('in');
      if(!k.enter){k.enter=true;save()}   // any first showing (hop or tile) counts as the entry presentation
      track('sky_lift_open',{from:ctx.from,floor:k.floor});
      const H=Y(N)+380,sc=sec.querySelector('#skScroll'),b=sec.querySelector('#skBalloon'),center=y=>{sc.scrollTop=Math.max(0,H-y-sc.clientHeight*.56)};
      const from=Y(units(seen)),to=Y(units(k.floor));center(from);
      const alive=()=>run===anim&&!sec.hidden;
      const needTut=!k.tut,tut=()=>{if(!alive())return;if(!k.tut){k.tut=true;save()}infoPopup()};
      const finish=()=>{if(!alive())return;const fresh=k.pending.slice();
        fresh.forEach((i,n)=>setTimeout(()=>{if(!alive())return;const st=sec.querySelector(`[data-i="${i}"]`);if(!st)return;st.classList.add('ready');snd('coin')},450+n*260));
        if(fresh.length)setTimeout(()=>{if(alive())claim(fresh,needTut?tut:null)},450+fresh.length*260+700);   // first time: chest first, the how-to popup after Collect
        else if(needTut)setTimeout(tut,320)};
      setTimeout(()=>{if(!alive())return;sec.classList.remove('in');
        if(Math.abs(to-from)<1){finish();return}
        const up=to>from,floors=Math.abs(k.floor-seen),dur=Math.min(2600,Math.max(800,floors*(up?430:260)));b.style.transition=`bottom ${dur}ms ${up?EASE.inout:EASE.in}`;b.style.bottom=to+'px';b.classList.add(up?'rise':'fall');burner(b,up?'up':'off');snd(up?'whoosh':'slide');
        const fEl=sec.querySelector('#skFloor');let shown=seen;
        const t0=performance.now(),tickF=()=>{if(!alive())return;const t=Math.min(1,(performance.now()-t0)/dur),e=up?(t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2):t*t;center(from+(to-from)*e);
          const fl=Math.round(seen+(k.floor-seen)*e);if(fl!==shown&&fEl){shown=fl;fEl.textContent=fl;if(up)sec.querySelectorAll('.skHex:not(.on):not(.zero)').forEach(h=>{if(+h.dataset.f<=fl&&k.cp>M.indexOf(+h.dataset.f)){h.classList.add('on','lit')}});fEl.classList.remove('tick');void fEl.offsetWidth;fEl.classList.add('tick');if(up)snd('tick')}
          if(t<1)requestAnimationFrame(tickF);else{b.classList.remove('rise','fall');burner(b,'idle');hudText();finish()}};
        requestAnimationFrame(tickF)},520);
      k.presented=k.floor;save();
      clearInterval(timer);timer=setInterval(()=>{const t=sec.querySelector('#skTime');if(t)t.textContent=left()},30000);
      const exit=cb=>{closePops();anim++;clearInterval(timer);sec.classList.remove('in');sec.classList.add('out');setTimeout(()=>{sec.classList.remove('out');sec.hidden=true;refreshTile();ctx.release&&ctx.release();cb&&cb()},380)};
      sec.querySelector('#skClose').onclick=()=>{snd('click');exit(ctx.close)};
      sec.querySelector('#skPlay').onclick=()=>{snd('click');exit(ctx.play||ctx.close)};
      sec.querySelector('#skInfo').onclick=()=>{snd('click');infoPopup()}}
    /* claim: grant the rewards of the freshly reached milestones; the grand prize also completes the flight (balloon back to 0) */
    function claim(ids,after){const last=ids.includes(N-1),rs=ids.flatMap(rewardsOf);
      k.pending=k.pending.filter(i=>!ids.includes(i));
      const j=ids[ids.length-1],p=popup({title:last?'Top reached!':`Floor ${ids.map(i=>M[i]).join(' & ')}`,cls:'skClaim',close:false,html:`<div class="skJuicy"><div class="skGlow"></div><div class="skRing"></div><img class="skChest c" src="${art(chestArt(j))}" alt=""><img class="skChest o" src="${art(chestArt(j,'full'))}" alt=""></div><div class="skText">${last?'Grand prize! A new flight starts from the ground.':`You got:`}</div><div class="skRw">${rs.map((r,i)=>`<span class="r" style="animation-delay:${1.25+i*.09}s"><span class="i">${icon(r)}</span>${label(r)}</span>`).join('')}</div><button class="skBtn gold wide" id="skCollect"><span class="t">Collect</span></button>`});
      juicyOpen(p);track('sky_lift_claim',{floors:ids.map(i=>M[i]),grand:last});
      p.q('#skCollect').onclick=()=>{snd('coin');rs.forEach(r=>{try{a.grant&&a.grant(r)}catch(e){}});
        if(last){k.flights++;k.floor=0;k.cp=0;k.presented=0;track('sky_lift_flight',{flights:k.flights})}
        save();p.close(()=>{if(!last&&sec)ids.forEach(i=>{const st=sec.querySelector(`[data-i="${i}"]`);if(!st)return;st.classList.remove('ready');st.classList.add('on','slam');burst(st,{stars:3,dust:6,size:.5});setTimeout(()=>st.classList.remove('slam'),600)});
          if(last&&sec&&!sec.hidden){const b=sec.querySelector('#skBalloon'),sc=sec.querySelector('#skScroll'),H=Y(N)+380;
            sec.querySelectorAll('.skStop.on,.skGrand.on').forEach(e=>e.classList.remove('on'));sec.querySelectorAll('.skHex.on:not(.zero)').forEach(e=>e.classList.remove('on'));
            b.style.transition=`bottom 1600ms ${EASE.inout}`;b.style.bottom=Y(0)+'px';b.classList.add('fall');burner(b,'off');setTimeout(()=>{b.classList.remove('fall');burner(b,'idle')},1600);
            const y0=parseFloat(getComputedStyle(b).bottom)||0,t0=performance.now(),f=()=>{const t=Math.min(1,(performance.now()-t0)/1600);sc.scrollTop=Math.max(0,H-(y0+(Y(0)-y0)*t)-sc.clientHeight*.56);if(t<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
          hudText();refreshTile();after&&setTimeout(after,last?1700:120)})}}
    /* ---------- home tile ---------- */
    let tile=null;
    function mountTile(el){tile=el;el.classList.add('skTile');el.onclick=()=>{snd('click');if(window.EventsHub&&EventsHub.open)EventsHub.open(id,{play:a.onPlay});else open({from:'button',play:a.onPlay})};refreshTile()}
    function refreshTile(){if(!tile)return;if(!enabled()){tile.hidden=true;return}tile.hidden=false;const next=k.cp<N?M[k.cp]-k.floor:0;
      tile.innerHTML=`<img class="b" src="${art('sl_balloon_idle')}" alt=""><span class="tx"><span class="tt skOl">${cfg.title}</span><span class="st">Floor <b>${k.floor}</b>${k.cp<N?` · ${next} win${next===1?'':'s'} to the chest`:' · top reached'}</span></span><span class="tm">${left()}</span>${k.pending.length?`<span class="dot">${k.pending.length}</span>`:''}`}
    const id='sky_lift';
    const api={id,priority:10,cfg,enabled,onLevelResult,
      pendingWin:()=>k.pending.length>0,
      presentWin:ctx=>open({from:'win',play:ctx.play,close:ctx.close,release:ctx.release}),
      pendingHome:()=>k.pending.length>0||!k.enter,
      presentHome:ctx=>{open({from:'home',play:ctx.play||a.onPlay,close:ctx.close,release:ctx.release})},
      loseWarning:()=>{if(!enabled()||k.floor<=protectedFloor())return null;return {html:`<span class="skWarn"><img src="${art('sl_balloon_off')}" alt="">Sky Lift: floor <b>${k.floor}</b> → <b class="dn">${protectedFloor()}</b></span>`,from:k.floor,to:protectedFloor()}},
      /* win screen chip: shown once after a level result that lifted the balloon */
      winChip:()=>{if(!gain||!enabled())return null;gain=0;const i=M.findIndex(c=>c>=k.floor),nx=i<0?M[N-1]:M[i];
        return `<span class="skWarn up"><img src="${art('sl_balloon_up')}" alt="">Sky Lift <b>+1 floor</b> · ${k.floor===nx?'chest reached!':`${k.floor}/${nx}`}</span>`},
      refresh:refreshTile,mountTile,open:ctx=>open(Object.assign({from:'button',play:a.onPlay},ctx||{})),
      state:()=>k,reset:()=>{k=fresh();save();refreshTile()},
      cheat:{setFloor(h){k.floor=h;k.cp=M.filter(c=>c<=h).length;save();refreshTile()},endSeason(){k.seasonEnd=0;tick();refreshTile()}}};
    return api}
  return {init,DEFAULTS}
})();
