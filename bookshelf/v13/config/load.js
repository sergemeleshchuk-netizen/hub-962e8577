/* loads config/*.json before levels.js and game.js. The files use the rows of the Google Sheet tabs
   in the Unity template (Boosters, PowerUps, Mechanics); edit a file and reload, no rebuild needed */
window.BS_CFG=(function(){const get=f=>{try{const x=new XMLHttpRequest();x.open('GET','config/'+f+'?t='+Date.now(),false);x.send();return x.status===200?JSON.parse(x.responseText):null}catch(e){console.warn('config',f,e);return null}};
  const b=get('Boosters.json'),p=get('PowerUps.json'),m=get('Mechanics.json'),mech={},tips={};
  ((m&&m.mechanics)||[]).forEach(r=>{if(r.introLevel>0)mech[r.mechanicId]=r.introLevel;tips[r.mechanicId]=r});
  return{boosters:(b&&b.boosters)||[],powerUps:(p&&p.powerUps)||[],mech,tips}})();
