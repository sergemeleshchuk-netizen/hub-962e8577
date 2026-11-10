/* Stark Events Kit · events-hub.js
   Small presentation scheduler shared by every live-ops event in a web prototype.
   Policy: one event presentation at a time. The game talks to the hub at three moments:
     EventsHub.levelResult(won, level, firstClear)  — right after a level ends (silent, no UI)
     EventsHub.wonHop(next)                          — the player taps NEXT on the win screen:
                                                        the first event with a pending presentation shows itself, then calls next()
     EventsHub.homeShow()                            — the player arrives on Home: one pending presentation per arrival
   An event object implements:
     id, priority (lower = first), enabled():bool,
     onLevelResult(won, level, firstClear),
     pendingWin():bool,  presentWin({release, play, close}),   // release(): the screen is gone (always call it), play(): next level, close(): back to Home
     pendingHome():bool, presentHome({release, play?, close?}),
     loseWarning():{html}|null                        // short warning for the lose popup (what the player is about to lose)
*/
window.EventsHub=(function(){
  const events=[];let busy=null;
  function register(ev){events.push(ev);events.sort((a,b)=>(a.priority||0)-(b.priority||0));return ev}
  function levelResult(won,level,firstClear){events.forEach(e=>{if(e.onLevelResult)e.onLevelResult(won,level,firstClear)})}   // each event decides itself (an unlocking win is not counted)
  // ctx passed to an event presentation: release() must be called when the screen goes away (the event does it on every exit), play()/close() are the host continuations
  const ctx=(e,extra)=>Object.assign({release(){if(busy===e.id)busy=null}},extra||{});
  function wonHop(next,closed){
    const e=!busy&&events.find(e=>e.enabled()&&e.pendingWin&&e.pendingWin());
    if(!e){next();return false}
    busy=e.id;e.presentWin(ctx(e,{play:next,close:closed}));return true}
  function homeShow(){
    if(busy)return false;const e=events.find(e=>e.enabled()&&e.pendingHome&&e.pendingHome());
    if(!e)return false;busy=e.id;e.presentHome(ctx(e));return true}
  function open(id,c){const e=events.find(e=>e.id===id);if(!e||busy)return false;busy=id;e.presentHome(ctx(e,c));return true}
  function loseWarnings(){return events.filter(e=>e.enabled()&&e.loseWarning).map(e=>e.loseWarning()).filter(Boolean)}
  function refresh(){events.forEach(e=>e.refresh&&e.refresh())}
  return {register,levelResult,wonHop,homeShow,open,loseWarnings,refresh,isBusy:()=>!!busy,events};
})();
