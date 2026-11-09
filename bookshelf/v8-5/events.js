/* Bookshelf v8-2 events. Regular level results count; Gallery replays do not. */
const EVENT_ART='v8-5/events/';
const SHIELD_NAMES=['Mia','Theo','Zara','Finn','Ivy','Milo','Sana','Ezra','Juno','Nia','Rook','Lola','Kai','Ava','Leo','Pixie','Bruno','Noah','Lyra','Oscar'];
const SHIELD_MULT=[1,2,3,5,10];
const BALLOON_REWARD=[0,50,120,240,400,700];
const shieldIcon='<svg viewBox="0 0 64 70" aria-hidden="true"><path d="M32 3 57 13v18c0 16-9 28-25 36C16 59 7 47 7 31V13Z" fill="#2778dc" stroke="#ffe589" stroke-width="5"/><path d="M32 11 49 18v13c0 10-5 19-17 27V11Z" fill="#58baff"/><path d="M32 11 15 18v13c0 10 5 19 17 27V11Z" fill="#1662b7"/><path d="m22 35 7 7 15-17" fill="none" stroke="#fff9db" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function eventState(){
  let changed=false;
  if(!S.events){S.events={};changed=true}
  for(const [k,v] of Object.entries({lava:{step:0,chests:0},shield:{start:Date.now(),points:0,streak:0,claimed:0},balloon:{height:0,flights:0}}))if(!S.events[k]){S.events[k]=v;changed=true}
  if(changed)save();
  return S.events;
}
function shieldLeft(){return Math.max(0,eventState().shield.start+86400000-Date.now())}
function shieldTime(){const m=Math.ceil(shieldLeft()/60000);return m?`${Math.floor(m/60)}h ${String(m%60).padStart(2,'0')}m`:'Finished'}
function shieldBoard(){
  const s=eventState().shield,elapsed=Math.min(24,Math.max(0,(Date.now()-s.start)/3600000));
  return [{name:'You',points:s.points,me:true},...SHIELD_NAMES.map((name,i)=>({name,points:Math.floor((i%5)+1+elapsed*(.38+(20-i)*.095)),me:false}))]
    .sort((a,b)=>b.points-a.points||(a.me?-1:b.me?1:0));
}
function shieldRank(){return shieldBoard().findIndex(x=>x.me)+1}
function eventLevelResult(win){
  const e=eventState(),s=e.shield,out=[];
  if(win){
    e.lava.step++;
    if(e.lava.step===5){e.lava.step=0;e.lava.chests++;S.coins+=500;out.push('🌋 Lava chest +500 coins');}
    else out.push(`🌋 Lava ${e.lava.step}/5`);
    if(shieldLeft()>0){const gain=SHIELD_MULT[Math.min(s.streak,4)];s.points+=gain;s.streak++;out.push(`🛡 +${gain} shields`);}
    if(e.balloon.height<5)e.balloon.height++;
    out.push(`🎈 Balloon ${e.balloon.height}/5`);
  }else{
    if(e.lava.step)out.push('🌋 Lava run reset');e.lava.step=0;
    if(s.streak)out.push('🛡 Shield streak reset');s.streak=0;
    if(e.balloon.height)out.push('🎈 Unclaimed balloon reward lost');e.balloon.height=0;
  }
  save();return out.join(' · ');
}
function refreshEventHome(){
  const e=eventState(),host=document.getElementById('eventStrip');if(!host)return;
  host.innerHTML=`<button class="eventTab lavaTab" data-event="lava" aria-label="Lava Quest"><span class="eventGlyph">🌋</span><b>Lava Quest</b><small>${e.lava.step}/5</small></button>
    <button class="eventTab shieldTab" data-event="shield" aria-label="Shield Tournament"><span class="eventGlyph">${shieldIcon}</span><b>Shield</b><small>${shieldLeft()?`#${shieldRank()}`:'Claim'}</small></button>
    <button class="eventTab balloonTab" data-event="balloon" aria-label="Sky Lift event"><span class="eventGlyph"><img src="${EVENT_ART}sky_balloon.webp" alt=""></span><b>Sky Lift</b><small>${e.balloon.height}/5 stops</small></button>`;
  host.querySelector('[data-event="lava"]').onclick=openLavaEvent;
  host.querySelector('[data-event="shield"]').onclick=openShieldEvent;
  host.querySelector('[data-event="balloon"]').onclick=openBalloonEvent;
}
function openLavaEvent(){
  const e=eventState().lava,step=e.step;
  const nodes=Array.from({length:6},(_,i)=>`<div class="lavaNode ${i<step?'past':i===step?'current':''}" style="--i:${i}"><img src="${EVENT_ART}${i===0?'shore.webp':i===5?'chest_closed.webp':i%2?'isl_green.webp':'isl_rock.webp'}" alt=""><span>${i===0?'START':i===5?'CHEST':i}</span>${i===step?`<img class="lavaAvatar" src="${EVENT_ART}av_cat.webp" alt="Your position">`:''}</div>`).join('');
  const p=popup({title:'Lava Quest',ribbon:'coral',cls:'tall wide eventPopup',html:`<div class="eventCopy">Win 5 regular levels in a row. Each win moves you one island. A failed level sends you back to START.</div><div class="lavaMap">${nodes}</div><div class="eventStat"><strong>${step}/5 islands</strong><span>Chests opened: ${e.chests}</span></div><div class="eventCopy">Reach the chest for <b>500 coins</b>. Progress and rewards are saved automatically.</div><button class="btn wide" data-event-close><span class="t">Continue</span></button>`});
  p.el.querySelector('[data-event-close]').onclick=()=>p.close();
}
function openShieldEvent(){
  const e=eventState().shield,ended=!shieldLeft(),board=shieldBoard(),rank=shieldRank();
  const rows=board.map((b,i)=>`<div class="shieldRow ${b.me?'me':''}"><span class="shieldRank">${i+1}</span><span class="shieldAvatar">${b.me?'📚':['🦊','🐻','🐰','🐱','🦉'][i%5]}</span><b>${b.name}</b><span>${shieldIcon} ${b.points}</span></div>`).join('');
  const prize=[1200,800,500][rank-1]||0;
  const p=popup({title:'Shield Tournament',ribbon:'purple',cls:'tall wide eventPopup',html:`<div class="shieldHero">${shieldIcon}<div><strong>${ended?'Tournament finished':shieldTime()+' left'}</strong><small>Your rank #${rank} of ${board.length}</small></div></div><div class="eventCopy">Regular level wins earn shields. Consecutive wins earn ×1, ×2, ×3, ×5, then ×10 shields; a failed level resets the multiplier. The tournament lasts 24 hours.</div><div class="shieldPrize">${['gold','silver','bronze'].map((metal,i)=>`<span><img src="${EVENT_ART}chest_${metal}.webp" alt=""><b>${i+1}. ${[1200,800,500][i]}</b></span>`).join('')}</div><div class="shieldList">${rows}</div><div class="eventStat"><strong>Your shields: ${e.points}</strong><span>Next win: +${SHIELD_MULT[Math.min(e.streak,4)]}</span></div>${ended?`<button class="btn gold wide" data-shield-claim><span class="t">${prize?`Claim ${prize} coins`:'Start next tournament'}</span></button>`:'<button class="btn wide" data-event-close><span class="t">Continue</span></button>'}`});
  const close=p.el.querySelector('[data-event-close]');if(close)close.onclick=()=>p.close();
  const claim=p.el.querySelector('[data-shield-claim]');if(claim)claim.onclick=()=>{if(shieldLeft())return;if(prize)S.coins+=prize;S.events.shield={start:Date.now(),points:0,streak:0,claimed:(e.claimed||0)+1};save();p.close(()=>{refreshHome();toast(prize?`Tournament reward: +${prize} coins`:'New tournament started')})};
}
function openBalloonEvent(){
  const e=eventState().balloon,h=e.height,reward=BALLOON_REWARD[h];
  const stops=Array.from({length:5},(_,i)=>`<div class="skyStop ${h>=i+1?'reached':''} ${h===i+1?'current':''}" style="bottom:${7+i*14.1}%" aria-label="Stop ${i+1}: ${BALLOON_REWARD[i+1]} coins"><img src="${EVENT_ART}sky_platform.webp" alt=""><span class="skyStopNumber">${i+1}</span><span class="skyStopReward"><img src="${ICO.coin}" alt="">${BALLOON_REWARD[i+1]}</span></div>`).join('');
  const p=popup({title:'Sky Lift',ribbon:'green',cls:'tall wide eventPopup skyLiftPopup',html:`<div class="skyEyebrow">A JOURNEY ABOVE THE CLOUDS</div><div class="skyScene"><div class="skyRoute"></div><div class="skyGrand"><img src="${EVENT_ART}sky_chest.webp" alt="Grand prize chest"><span>GRAND PRIZE · 700</span></div>${stops}<div class="skyCraft" style="bottom:${5+h*11}%"><img src="${EVENT_ART}sky_balloon.webp" alt="Your balloon"></div></div><div class="skySummary"><div class="skySummaryTop"><span class="skyCompass">✦</span><div><small>${h?`STOP ${h} / 5`:'READY TO FLY'}</small><strong>${h?`${reward} coins are waiting`:'Choose how high to fly'}</strong></div><span class="skyFlights">${e.flights} flights</span></div><p>Win a level to rise. Collect at any stop, or keep flying for a bigger prize.</p><div class="skyWarning">A failed level loses unclaimed coins.</div></div><button class="btn gold wide skyClaim" data-balloon-claim ${h?'':'disabled'}><span class="t">${h?`Collect ${reward} coins`:'Win a level to take off'}</span></button>`});
  p.el.querySelector('[data-balloon-claim]').onclick=()=>{if(!e.height)return;const amount=BALLOON_REWARD[e.height];S.coins+=amount;e.height=0;e.flights++;save();p.close(()=>{refreshHome();toast(`Balloon reward: +${amount} coins`)})};
}
