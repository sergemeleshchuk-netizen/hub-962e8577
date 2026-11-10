/* Stark Events Kit · Sky Lift (web module)
   Isolated live-ops event: a balloon rises one floor per won level, chests wait on milestone floors,
   a lost level drops the balloon to the last opened chest (never lower), floor 60 = grand prize + new flight.
   Ported from Bookshelf v12 Sky Lift v4 (2026-11-09) and extended per PLAYBOOK/events/02-sky-lift-requirements.md:
   milestones are persisted, every milestone is presented automatically (post-win hop, or on Home if the player left),
   rewards are typed (coins / booster / unlimited lives) and shown on every chest and in the claim popup.

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
    milestones:[2,5,8,11,15,20,25,30,40,50,60],
    rewards:[                       // one reward (or a bundle = array) per milestone; the last one is the grand prize
      {type:'coins',n:40},{type:'booster',id:'info',n:1},{type:'coins',n:80},{type:'booster',id:'swap',n:1},{type:'lives',min:15},
      {type:'coins',n:160},{type:'booster',id:'jk',n:2},{type:'booster',id:'shield',n:2},{type:'coins',n:300},{type:'lives',min:30},
      [{type:'coins',n:600},{type:'booster',id:'info',n:2},{type:'booster',id:'swap',n:2},{type:'booster',id:'jk',n:2},{type:'booster',id:'shield',n:2},{type:'lives',min:60}]],
    chests:['chest2','chest1','chest4','chest3','chest5','chest6','chest4','chest3','chest5','chest6','grand'],
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
    /* ---------- state ---------- */
    const fresh=()=>({status:'locked',seasonStart:0,seasonEnd:0,floor:0,cp:0,presented:0,pending:[],flights:0,seasons:0,tut:false,enter:false});
    let k=Object.assign(fresh(),a.load&&a.load()||{});
    const save=()=>{try{a.save&&a.save(k)}catch(e){}};
    const rewardsOf=i=>[].concat(cfg.rewards[i]||[]);
    const icon=r=>{try{const h=a.rewardIcon&&a.rewardIcon(r);if(h)return h}catch(e){}return DEF_ICON[r.type]||'🎁'};
    const label=r=>{try{const h=a.rewardLabel&&a.rewardLabel(r);if(h)return h}catch(e){}return r.type==='coins'?'+'+r.n:r.type==='booster'?'×'+r.n:r.type==='lives'?r.min+' min':''};
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
    function onLevelResult(won,level,firstClear){const was=k.status;if(!enabled()||was!=='active')return;   // the level that unlocks the event is not counted
      if(won){if(!cfg.countReplays&&firstClear===false)return;if(k.cp>=N)return;k.floor++;
        if(k.floor>=M[k.cp]){k.pending.push(k.cp);k.cp++;track('sky_lift_milestone',{floor:M[k.cp-1],index:k.cp-1})}}
      else{const to=protectedFloor();if(k.floor!==to)track('sky_lift_drop',{from:k.floor,to});k.floor=to}
      save();refreshTile()}
    /* ---------- popups ---------- */
    const pops=[];
    function popup({title,html,close=true,onClose}){const ov=document.createElement('div');ov.className='skOv';
      ov.innerHTML=`<div class="skPop">${title?`<div class="skRibbon"><span class="skOl">${title}</span></div>`:''}${close?`<button class="skX" aria-label="Close">${SVGX}</button>`:''}${html}</div>`;
      root.appendChild(ov);snd('pop');
      const p={ov,el:ov.firstChild,closed:false,close(cb){if(p.closed)return;p.closed=true;ov.classList.add('out');const i=pops.indexOf(p);if(i>=0)pops.splice(i,1);setTimeout(()=>{ov.remove();onClose&&onClose();cb&&cb()},170)},q:s=>ov.querySelector(s)};
      if(close)ov.querySelector('.skX').onclick=()=>{snd('click');p.close()};pops.push(p);return p}
    const closePops=()=>pops.slice().forEach(p=>p.close());
    function confettiIn(el){const c=document.createElement('div');c.className='skConf';const cols=['#FFC548','#A77AF4','#53D96B','#5FE6F2','#FF735F','#fff'];
      c.innerHTML=Array.from({length:26},(_,i)=>`<i style="left:${4+Math.random()*92}%;background:${cols[i%cols.length]};animation-delay:${Math.random()*.5}s;animation-duration:${1.3+Math.random()*.8}s"></i>`).join('');el.appendChild(c);setTimeout(()=>c.remove(),2600)}
    function infoPopup(cb){const p=popup({title:cfg.title,html:`<img class="skHero" src="${art('sl_balloon')}" alt=""><div class="skText">Every won level lifts the balloon one floor. Reach a chest floor to open it: coins, boosters or unlimited hearts. A lost level drops you to the last chest you opened, never lower. Reach floor ${M[N-1]} for the grand prize! Ends in <b>${left()}</b>.</div><button class="skBtn purple wide" id="skOk"><span class="t">Got it</span></button>`});
      p.q('#skOk').onclick=()=>{snd('click');p.close(cb)};return p}
    /* ---------- screen ---------- */
    let sec=null,anim=0,timer=0;
    function ensure(){if(sec)return sec;sec=document.createElement('div');sec.className='skScreen';sec.hidden=true;sec.id='skScreen';root.appendChild(sec);return sec}
    function render(){const seen=k.presented,H=Y(N)+380;
      const cps=M.map((c,i)=>{const y=Y(i+1),on=k.cp>i,fresh=on&&k.pending.includes(i),done=on&&!fresh;
        return (i===N-1?`<div class="skGrand ${done?'on':''}" data-i="${i}" style="--y:${y}px"><img class="skChest" src="${art('sl_grand')}" alt="">${badge(i)}</div>`
          :`<div class="skStop ${done?'on':''}" data-i="${i}" style="--y:${y}px"><img class="skPlat" src="${art('sl2_bracket')}" alt=""><img class="skChest" src="${art('sl_'+cfg.chests[i])}" alt="">${badge(i)}</div>`)
          +`<div class="skHex ${on?'on':''}" style="--y:${y}px"><span class="skOl">${c}</span></div>`}).join('');
      const clouds=Array.from({length:N+2},(_,i)=>`<img class="skCloud c${i%4}" src="${art('sl2_cloud'+(i%4+1))}" alt="" style="--y:${Y(i+.45)+(i%3)*28}px;left:${i%2?58+(i*7)%26:44+(i*11)%14}%">`).join('');
      const from=Y(units(seen));
      sec.innerHTML=`<div class="skBg"></div>
        <div class="skTop"><button class="skI" id="skInfo" aria-label="How it works"><span class="skOl">i</span></button><div class="skBanner"><img src="${art('sl_banner')}" alt=""><span class="skTitle skOl">${cfg.title}</span><span class="skTime" id="skTime">${left()}</span></div><button class="skX skScrX" id="skClose" aria-label="Close">${SVGX}</button></div>
        <div class="skScroll" id="skScroll"><div class="skTower" style="height:${H}px"><div class="skCity"></div>${clouds}<div class="skMast"></div><div class="skMastTop"></div><div class="skMastBase"></div><div class="skHex zero on" style="--y:${BASE}px"><span class="skOl">0</span></div>${cps}<div class="skBalloon" id="skBalloon" style="bottom:${from}px"><img src="${art('sl_balloon')}" alt=""></div></div></div>
        <div class="skHud"><div class="skFire"><img src="${art('sl_fire')}" alt=""><b class="skOl" id="skFloor">${seen}</b></div><div class="skInfoTxt" id="skInfoTxt"></div><button class="skBtn gold" id="skPlay"><span class="t">Play</span></button></div>`;
      hudText()}
    function hudText(){const next=k.cp<N?M[k.cp]-k.floor:0,el=sec.querySelector('#skInfoTxt');if(!el)return;
      el.innerHTML=`<strong>${k.cp>=N?'Top reached!':`${next} more win${next===1?'':'s'} to floor ${M[k.cp]}`}</strong><span>Win levels to rise. A lost level drops the balloon to floor ${protectedFloor()}.${k.flights?` Flights completed: ${k.flights}.`:''}</span>`;
      const f=sec.querySelector('#skFloor');if(f)f.textContent=k.floor}
    /* open({from:'win'|'home'|'button', play, close}) → cascade in → balloon moves (camera follows) → pause → fresh chests pop → claim popup */
    function open(ctx){ensure();tick();const seen=k.presented,run=++anim;render();sec.hidden=false;sec.classList.remove('out');sec.classList.add('in');
      track('sky_lift_open',{from:ctx.from,floor:k.floor});
      const H=Y(N)+380,sc=sec.querySelector('#skScroll'),b=sec.querySelector('#skBalloon'),center=y=>{sc.scrollTop=Math.max(0,H-y-sc.clientHeight*.56)};
      const from=Y(units(seen)),to=Y(units(k.floor));center(from);
      const alive=()=>run===anim&&!sec.hidden;
      const finish=()=>{if(!alive())return;const fresh=k.pending.slice();
        fresh.forEach((i,n)=>setTimeout(()=>{if(!alive())return;const st=sec.querySelector(`[data-i="${i}"]`);if(!st)return;st.classList.add('pop');snd('coin');setTimeout(()=>{st.classList.remove('pop');st.classList.add('on')},460)},450+n*260));
        if(fresh.length)setTimeout(()=>{if(alive())claim(fresh)},450+fresh.length*260+420)};
      setTimeout(()=>{if(!alive())return;sec.classList.remove('in');
        if(Math.abs(to-from)<1){finish();return}
        const up=to>from,dur=Math.min(1700,Math.max(650,Math.abs(to-from)*2.2));b.style.transition=`bottom ${dur}ms ${up?EASE.inout:EASE.in}`;b.style.bottom=to+'px';b.classList.add(up?'rise':'fall');snd(up?'whoosh':'slide');
        const t0=performance.now(),tickF=()=>{if(!alive())return;const t=Math.min(1,(performance.now()-t0)/dur);center(from+(to-from)*t);if(t<1)requestAnimationFrame(tickF);else{b.classList.remove('rise','fall');finish()}};
        requestAnimationFrame(tickF)},520);
      k.presented=k.floor;save();
      clearInterval(timer);timer=setInterval(()=>{const t=sec.querySelector('#skTime');if(t)t.textContent=left()},30000);
      const exit=cb=>{closePops();anim++;clearInterval(timer);sec.classList.remove('in');sec.classList.add('out');setTimeout(()=>{sec.classList.remove('out');sec.hidden=true;refreshTile();ctx.release&&ctx.release();cb&&cb()},380)};
      sec.querySelector('#skClose').onclick=()=>{snd('click');exit(ctx.close)};
      sec.querySelector('#skPlay').onclick=()=>{snd('click');exit(ctx.play||ctx.close)};
      sec.querySelector('#skInfo').onclick=()=>{snd('click');infoPopup()};
      if(!k.tut){k.tut=true;save();setTimeout(()=>{if(alive())infoPopup()},560)}}
    /* claim: grant the rewards of the freshly reached milestones; the grand prize also completes the flight (balloon back to 0) */
    function claim(ids){const last=ids.includes(N-1),rs=ids.flatMap(rewardsOf);
      k.pending=k.pending.filter(i=>!ids.includes(i));
      const p=popup({title:cfg.title,close:false,html:`<img class="skHero chest" src="${art('sl_'+cfg.chests[ids[ids.length-1]])}" alt=""><div class="skText">${last?'You reached the top of the Sky Lift!':`Floor${ids.length>1?'s':''} <b>${ids.map(i=>M[i]).join(', ')}</b> reached!`} Chest${ids.length>1?'s':''} opened:</div><div class="skRw">${rs.map((r,i)=>`<span class="r" style="animation-delay:${.15+i*.09}s"><span class="i">${icon(r)}</span>${label(r)}</span>`).join('')}</div><button class="skBtn gold wide" id="skCollect"><span class="t">Collect</span></button>`});
      confettiIn(p.el);snd('win');track('sky_lift_claim',{floors:ids.map(i=>M[i]),grand:last});
      p.q('#skCollect').onclick=()=>{snd('coin');rs.forEach(r=>{try{a.grant&&a.grant(r)}catch(e){}});
        if(last){k.flights++;k.floor=0;k.cp=0;k.presented=0;track('sky_lift_flight',{flights:k.flights})}
        save();p.close(()=>{if(last&&sec&&!sec.hidden){const b=sec.querySelector('#skBalloon'),sc=sec.querySelector('#skScroll'),H=Y(N)+380;
            sec.querySelectorAll('.skStop.on,.skGrand.on').forEach(e=>e.classList.remove('on'));sec.querySelectorAll('.skHex.on:not(.zero)').forEach(e=>e.classList.remove('on'));
            b.style.transition=`bottom 1600ms ${EASE.inout}`;b.style.bottom=Y(0)+'px';b.classList.add('fall');setTimeout(()=>b.classList.remove('fall'),1600);
            const y0=parseFloat(getComputedStyle(b).bottom)||0,t0=performance.now(),f=()=>{const t=Math.min(1,(performance.now()-t0)/1600);sc.scrollTop=Math.max(0,H-(y0+(Y(0)-y0)*t)-sc.clientHeight*.56);if(t<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
          hudText();refreshTile()})}}
    /* ---------- home tile ---------- */
    let tile=null;
    function mountTile(el){tile=el;el.classList.add('skTile');el.onclick=()=>{snd('click');if(window.EventsHub&&EventsHub.open)EventsHub.open(id,{play:a.onPlay});else open({from:'button',play:a.onPlay})};refreshTile()}
    function refreshTile(){if(!tile)return;if(!enabled()){tile.hidden=true;return}tile.hidden=false;const next=k.cp<N?M[k.cp]-k.floor:0;
      tile.innerHTML=`<img class="b" src="${art('sl_balloon')}" alt=""><span class="tx"><span class="tt skOl">${cfg.title}</span><span class="st">Floor <b>${k.floor}</b>${k.cp<N?` · ${next} win${next===1?'':'s'} to the chest`:' · top reached'}</span></span><span class="tm">${left()}</span>${k.pending.length?`<span class="dot">${k.pending.length}</span>`:''}`}
    const id='sky_lift';
    const api={id,priority:10,cfg,enabled,onLevelResult,
      pendingWin:()=>k.pending.length>0,
      presentWin:ctx=>open({from:'win',play:ctx.play,close:ctx.close,release:ctx.release}),
      pendingHome:()=>k.pending.length>0||!k.enter,
      presentHome:ctx=>{if(!k.enter){k.enter=true;save()}open({from:'home',play:ctx.play||a.onPlay,close:ctx.close,release:ctx.release})},
      loseWarning:()=>{if(!enabled()||k.floor<=protectedFloor())return null;return {html:`<span class="skWarn"><img src="${art('sl_balloon')}" alt="">Balloon drops to floor <b>${protectedFloor()}</b></span>`,from:k.floor,to:protectedFloor()}},
      refresh:refreshTile,mountTile,open:ctx=>open(Object.assign({from:'button',play:a.onPlay},ctx||{})),
      state:()=>k,reset:()=>{k=fresh();save();refreshTile()},
      cheat:{setFloor(h){k.floor=h;k.cp=M.filter(c=>c<=h).length;save();refreshTile()},endSeason(){k.seasonEnd=0;tick();refreshTile()}}};
    return api}
  return {init,DEFAULTS}
})();
