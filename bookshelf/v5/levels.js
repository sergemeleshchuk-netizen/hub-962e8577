/* =========================================================
   LEVELS — parametric generator (per RnD checklist + ChatGPT blueprint)
   10-level cadence: 2 3 4 6 3 5 7 4 8 9  → mini-spike @4, breath @5/@8, hard @7/@9, peak @10
   Onboarding (L1-20) peaks softened. Modifiers: Locked @16, Linked @36, Hidden @66.
   ========================================================= */
const ART=[
 {id:'mona',   file:'v7/art/01_mona_capybara.jpg',     title:'Mona Capybara',            after:'after Leonardo da Vinci',      album:'Old Masters'},
 {id:'wave',   file:'v7/art/02_boba_wave.jpg',         title:'The Great Boba Wave',      after:'after Katsushika Hokusai',    album:'Old Masters'},
 {id:'starry', file:'v7/art/03_starry_catstronaut.jpg',title:'Starry Night Cat-stronaut',after:'after Vincent van Gogh',       album:'Old Masters'},
 {id:'pearl',  file:'v7/art/04_axolotl_pearl.jpg',     title:'Axolotl with a Pearl Earring',after:'after Johannes Vermeer',   album:'Old Masters'},
 {id:'scream', file:'v7/art/05_monday_scream.jpg',     title:'The Monday Scream',        after:'after Edvard Munch',          album:'Modern Moods'},
 {id:'kiss',   file:'v7/art/06_raccoon_kiss.jpg',      title:'The Raccoon Kiss',         after:'after Gustav Klimt',          album:'Modern Moods'},
 {id:'sun',    file:'v7/art/07_sunflower_hamsters.jpg',title:'Sunflowers & Hamsters',    after:'after Vincent van Gogh',       album:'Modern Moods'},
 {id:'venus',  file:'v7/art/08_birth_of_otter.jpg',    title:'The Birth of Otter',       after:'after Sandro Botticelli',      album:'Modern Moods'},
 {id:'fog',    file:'v7/art/09_penguin_fog.jpg',       title:'Penguin above the Fog',    after:'after Caspar David Friedrich', album:'Grand Tour'},
 {id:'fuji',   file:'v7/art/10_red_fuji_corgi.jpg',    title:'Red Fuji Corgi',           after:'after Katsushika Hokusai',     album:'Grand Tour'},
 {id:'cafe',   file:'v7/art/11_shiba_cafe.jpg',        title:'Shiba Café at Night',      after:'after Vincent van Gogh',       album:'Grand Tour'},
 {id:'adam',   file:'v7/art/12_creation_of_cat.jpg',   title:'The Creation of Cat',      after:'after Michelangelo',           album:'Grand Tour'},
];
const CADENCE=[2,3,4,6,3,5,7,4,8,9];
const ROLE={2:'easy',3:'easy',4:'normal',5:'normal',6:'spike',7:'hard',8:'hard',9:'peak'};

function difficultyOf(L){let d=CADENCE[(L-1)%10];
  if(L<=10)d=Math.min(d,[2,2,3,3,2,3,4,3,4,5][L-1]);   // tutorial band: gentle
  else if(L<=20)d=Math.min(d,7);                          // soften first real peak
  return d}

/* grid size grows by band and by the cadence inside the band */
function gridOf(L,d){   // [shelves, books per shelf] — the bookcase grows level by level
  if(L<=2)return[2,4];if(L<=5)return[2,5];
  if(L<=10)return d>=4?[3,5]:[2,6];
  if(L<=20)return d>=6?[3,6]:[3,5];
  if(L<=35)return d>=8?[4,6]:d>=6?[3,7]:[3,6];
  if(L<=60)return d>=8?[4,7]:d>=6?[4,6]:[3,7];
  if(L<=80)return d>=9?[5,7]:d>=7?[4,7]:[4,6];
  return d>=9?[5,8]:d>=7?[5,7]:d>=5?[4,7]:[4,6]}

/* move limit = optimal swaps x factor. Factors were calibrated with sim/sim.js: a simulated player that makes
   a wrong move 30% of the time wins first try ~95% (d2) / 90 / 80 / 72 / 60 / 55 / 48 / 40% (d9).
   Over a 10-level cycle that is ~1.5 attempts per win (checklist target 1.4-1.7). */
const MOVE_K={2:2.3,3:1.85,4:1.7,5:1.42,6:1.28,7:1.21,8:1.19,9:1.17};
function slackOf(d){return MOVE_K[d]-1}

function modsOf(L,d,n){const m={locks:0,lockHp:1,links:0,hidden:0};
  if(L>=16){m.locks=d<=3?0:d<=5?1:d<=7?2:3;if(L>=46&&d>=7)m.lockHp=2}
  if(L>=36){m.links=d<=3?0:d<=6?1:2}
  if(L>=66){m.hidden=d<=3?0:d<=6?2:Math.min(5,Math.floor(n/5))}
  if(L===16)m.locks=1;if(L===36){m.links=1;m.locks=0}if(L===66){m.hidden=3;m.locks=0;m.links=0}   // intro levels teach one thing
  return m}

function levelDef(L){const d=difficultyOf(L),[rows,cols]=gridOf(L,d),n=rows*cols;
  return{L,d,role:ROLE[d]||'normal',rows,cols,n,slack:slackOf(d),mods:modsOf(L,d,n),art:ART[(L-1)%ART.length],seed:L*7919+13,
    anchor:n>=18,   /* v5: frame pins only on bigger bookcases */
    badge:d>=9?'Super Hard':d>=7?'Hard':'',
    reward:d>=9?140:d>=7?100:d>=6?80:55}}

/* deterministic RNG */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

if(typeof module!=='undefined')module.exports={ART,CADENCE,difficultyOf,gridOf,slackOf,modsOf,levelDef,rng};
