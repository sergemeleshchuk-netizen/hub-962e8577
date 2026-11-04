/* words_v5.js — словесный слой v5.
   Логика идентична v3/v4 (подходящая буква сразу в слово, трей-буфер, переполнение=проигрыш).
   ОТЛИЧИЯ v5:
     - УРОВЕНЬ: плотное поле 9x12, 20 ДЛИННЫХ гнутых стрелок, заполнение ~81%;
     - ГЕЙМ-ДИЗАЙН: список всех слов СВЕРХУ НЕ показывается (в index_v5.html нет #wordProg).
       Игрок видит только текущее слово (с серыми подсказками), но не знает, что дальше.
   Слова: OCEAN · TIGER · PLANT · HONEY (4x5=20). Буквы по solve-порядку -> проходимо.
*/

const WORD_LEVELS = [
{"cols":9,"rows":12,"time":80,"lives":3,"traySize":3,"words":["OCEAN","TIGER","PLANT","HONEY"],"arrows":[{"path":[[4,11],[4,10],[4,9],[4,8],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7]],"letter":"O"},{"path":[[2,0],[2,1],[2,2],[2,3],[2,4],[1,4],[0,4]],"letter":"C"},{"path":[[8,4],[9,4],[9,3],[9,2],[9,1]],"letter":"T"},{"path":[[8,6],[7,6],[6,6],[5,6],[4,6],[4,5],[4,4]],"letter":"Y"},{"path":[[9,5],[8,5],[7,5],[6,5],[6,4],[6,3],[6,2]],"letter":"N"},{"path":[[5,5],[5,4],[5,3],[5,2],[5,1],[5,0],[6,0]],"letter":"H"},{"path":[[6,8],[6,9],[6,10],[6,11],[6,12],[7,12],[8,12]],"letter":"E"},{"path":[[4,2],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8]],"letter":"E"},{"path":[[2,8],[2,7],[2,6],[2,5],[1,5],[0,5]],"letter":"A"},{"path":[[7,3],[8,3],[8,2],[8,1],[8,0],[9,0]],"letter":"N"},{"path":[[2,10],[1,10],[0,10],[0,11],[0,12]],"letter":"T"},{"path":[[2,9],[3,9],[3,10]],"letter":"O"},{"path":[[8,9],[8,10],[9,10]],"letter":"I"},{"path":[[1,8],[1,9],[0,9]],"letter":"G"},{"path":[[1,3],[0,3],[0,2],[0,1]],"letter":"E"},{"path":[[7,9],[7,10],[7,11],[8,11]],"letter":"R"},{"path":[[4,1],[3,1],[3,0]],"letter":"P"},{"path":[[1,7],[1,6],[0,6]],"letter":"L"},{"path":[[1,11],[2,11],[3,11],[3,12]],"letter":"A"},{"path":[[6,1],[7,1],[7,0]],"letter":"N"}]}
];

// яркая палитра как в референсе; цвет стабилен по символу буквы
const LETTER_COLORS=['#ff4d8d','#ff9f43','#9b5cf6','#2ecc71','#4aa3ff','#ff4d5e','#1abc9c','#f1c40f'];
function colorOf(ch){
  let h=0; for(let i=0;i<ch.length;i++) h=(h*31+ch.charCodeAt(i))>>>0;
  return LETTER_COLORS[h%LETTER_COLORS.length];
}

const Words = (function(){
  let cfg=null;            // {words, traySize}
  let filled=[];           // буквы, уже стоящие в текущем слове (по позициям)
  let tray=[];             // буфер
  let wordIdx=0;
  let onOverflow=null, onAllDone=null;
  let trayEl=null, barEl=null, progEl=null;

  function init(level, hooks){
    cfg={words:level.words.slice(), traySize:level.traySize};
    wordIdx=0; tray=[]; resetFilled();
    onOverflow=hooks.onOverflow; onAllDone=hooks.onAllDone;
    barEl=document.getElementById('wordBar');
    trayEl=document.getElementById('tray');
    progEl=document.getElementById('wordProg');
    render();
  }

  function curWord(){ return cfg.words[wordIdx]||null; }
  function resetFilled(){ filled = curWord()? Array(curWord().length).fill(null) : []; }

  // индекс свободной позиции под букву ch в текущем слове (буквы внутри слова уникальны)
  function slotFor(ch){
    const w=curWord(); if(!w) return -1;
    for(let i=0;i<w.length;i++) if(w[i]===ch && filled[i]===null) return i;
    return -1;
  }
  function wordComplete(){ return filled.length>0 && filled.every(x=>x!==null); }

  // попробовать перетащить из трея всё, что подходит текущему слову
  function flushTray(){
    let moved=true;
    while(moved){
      moved=false;
      for(let i=0;i<tray.length;i++){
        const s=slotFor(tray[i]);
        if(s>=0){ filled[s]=tray[i]; tray.splice(i,1); moved=true; break; }
      }
      if(wordComplete()) advanceWord();
    }
  }

  function advanceWord(){
    wordIdx++; resetFilled();
  }

  // приход буквы от вытащенной стрелки
  function collect(letter){
    let toWord=false;
    const s=slotFor(letter);
    if(s>=0){ filled[s]=letter; toWord=true; }     // подходит -> сразу в слово
    else { tray.push(letter); }                     // не подходит -> в трей

    if(wordComplete()){ advanceWord(); flushTray(); }

    const allDone = wordIdx>=cfg.words.length;
    const overflow = !allDone && tray.length>cfg.traySize;
    render(overflow);
    if(allDone) onAllDone && onAllDone();
    else if(overflow) onOverflow && onOverflow();
    return {toWord, allDone, overflow};
  }

  function render(overflow){
    // ----- словесная панель (СВЕРХУ): одна полоса со слотами -----
    const w=curWord();
    let bar='';
    if(w){
      for(let i=0;i<w.length;i++){
        const ch=w[i], on=filled[i]!==null;
        const col=on?colorOf(ch):'#c2c6e6';
        bar+='<span class="cell'+(on?' on':'')+'" style="color:'+col+
             (on?(';border-color:'+col+'33'):'')+'">'+ch+'</span>';
      }
    }
    barEl.innerHTML=bar;

    // прогресс по словам
    if(progEl){
      let p='';
      cfg.words.forEach((ww,i)=>{
        const c=i<wordIdx?'done':(i===wordIdx?'now':'');
        p+='<span class="wtag '+c+'">'+(i<wordIdx?'✓':ww)+'</span>';
      });
      progEl.innerHTML=p;
    }

    // ----- трей (под полосой): отдельные плитки -----
    let t='';
    for(let i=0;i<cfg.traySize;i++){
      const ch=tray[i];
      const col=ch?colorOf(ch):null;
      const warn = ch && tray.length>=cfg.traySize;       // трей забит
      t+='<span class="tile'+(ch?' has':'')+(overflow?' over':(warn?' warn':''))+'"'+
         (ch?(' style="color:'+col+';border-bottom-color:'+col+'"'):'')+'>'+(ch||'')+'</span>';
    }
    trayEl.innerHTML=t;
  }

  return {init, collect, colorOf, WORD_LEVELS};
})();
