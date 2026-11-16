/* Bookshelf Art Puzzle — home-screen library backgrounds (calm, low-detail).
   One library per 10 levels, a journey through eras & countries; loops after level 80.
   Load after levels.js and before game.js:  <script src="lib_backgrounds.js"></script> */
(function(root){
const LIB_BG=[
 {bg:'ui/lib_1_alexandria.jpg',name:'Library of Alexandria'},
 {bg:'ui/lib_2_song.jpg',      name:'Song Imperial Library'},
 {bg:'ui/lib_3_baghdad.jpg',   name:'House of Wisdom'},
 {bg:'ui/lib_4_monastery.jpg', name:'Monastery Scriptorium'},
 {bg:'ui/lib_5_florence.jpg',  name:'Florentine Library'},
 {bg:'ui/lib_6_baroque.jpg',   name:'Baroque Abbey Library'},
 {bg:'ui/lib_7_london.jpg',    name:'Victorian Reading Room'},
 {bg:'ui/lib_8_tokyo.jpg',     name:'Modern Tokyo Library'}];
const libOf=L=>LIB_BG[Math.floor((Math.max(1,L)-1)/10)%LIB_BG.length];
/* optional: warm the cache for the current and the next library so the switch is instant */
function preloadLib(L){[L,L+10].forEach(x=>{const i=new Image();i.src=libOf(x).bg})}
root.LIB_BG=LIB_BG;root.libOf=libOf;root.preloadLib=preloadLib;
if(typeof module!=='undefined')module.exports={LIB_BG,libOf};
})(typeof window!=='undefined'?window:globalThis);
