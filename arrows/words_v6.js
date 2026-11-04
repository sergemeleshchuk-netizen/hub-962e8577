/* words_v6.js — словесный слой v6.
   Базовая логика как v3-v5 (подходящая буква сразу в слово, трей-буфер, переполнение=проигрыш).
   ОТЛИЧИЯ v6:
     - УРОВЕНЬ: поле 10x15, 25 ДЛИННЫХ гнутых стрелок, заполнение ~78%;
     - трей на 5 букв (traySize:5);
     - список из 5 слов ОСТАЁТСЯ, но БЕЗ подсветки текущего — игрок угадывает, что загадано;
     - ячейки сбора НЕ подсказывают букву серым: пустые, пока не заполнятся.
   Слова: BREAD · CLOUD · FROST · GIANT · SPARK (5x5=25). Буквы по solve-порядку -> проходимо.
*/

const WORD_LEVELS = [
{"cols":10,"rows":15,"time":110,"lives":3,"traySize":5,"words":["BREAD","CLOUD","FROST","GIANT","SPARK"],"arrows":[{"path":[[3,15],[3,14],[3,13],[3,12],[3,11],[3,10],[2,10],[1,10],[0,10],[0,9],[1,9],[2,9],[3,9],[4,9]],"letter":"R"},{"path":[[0,7],[1,7],[2,7],[2,6],[2,5],[2,4],[1,4],[0,4]],"letter":"B"},{"path":[[5,14],[5,13],[5,12],[5,11],[5,10],[5,9],[6,9],[7,9],[8,9]],"letter":"S"},{"path":[[9,8],[10,8],[10,9],[10,10]],"letter":"S"},{"path":[[8,3],[8,2],[8,1],[9,1],[10,1]],"letter":"R"},{"path":[[5,2],[5,3],[5,4],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5]],"letter":"E"},{"path":[[8,8],[7,8],[6,8],[5,8],[4,8],[3,8],[3,7],[3,6],[3,5]],"letter":"K"},{"path":[[2,0],[2,1],[2,2],[1,2]],"letter":"P"},{"path":[[7,11],[8,11],[8,12],[8,13],[8,14],[8,15],[9,15]],"letter":"A"},{"path":[[2,11],[1,11],[0,11],[0,12],[0,13]],"letter":"T"},{"path":[[4,1],[3,1],[3,0],[4,0],[5,0]],"letter":"G"},{"path":[[9,4],[8,4],[7,4],[7,3],[7,2]],"letter":"I"},{"path":[[3,4],[3,3],[2,3]],"letter":"A"},{"path":[[1,13],[2,13],[2,14],[2,15]],"letter":"D"},{"path":[[9,14],[9,13],[10,13]],"letter":"C"},{"path":[[9,12],[9,11],[9,10],[8,10],[7,10],[6,10],[6,11],[6,12],[6,13]],"letter":"A"},{"path":[[5,7],[4,7],[4,6],[5,6],[6,6],[7,6]],"letter":"N"},{"path":[[0,14],[1,14],[1,15]],"letter":"L"},{"path":[[7,1],[6,1],[6,0]],"letter":"O"},{"path":[[8,7],[8,6],[9,6],[10,6]],"letter":"U"},{"path":[[10,2],[9,2],[9,3],[10,3]],"letter":"D"},{"path":[[7,12],[7,13],[7,14],[6,14],[6,15]],"letter":"F"},{"path":[[1,3],[0,3],[0,2]],"letter":"T"},{"path":[[1,6],[1,5],[0,5]],"letter":"R"},{"path":[[1,0],[1,1],[0,1]],"letter":"O"}]}
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
        const on=filled[i]!==null, ch=filled[i];
        // v6: НЕ подсказываем букву серым — пустая ячейка остаётся пустой
        if(on){
          const col=colorOf(ch);
          bar+='<span class="cell on" style="color:'+col+';border-color:'+col+'33">'+ch+'</span>';
        } else {
          bar+='<span class="cell"></span>';
        }
      }
    }
    barEl.innerHTML=bar;

    // прогресс по словам: список ОСТАЁТСЯ, но текущее слово НЕ подсвечено —
    // игрок сам угадывает, какое из списка сейчас загадано
    if(progEl){
      let p='';
      cfg.words.forEach((ww,i)=>{
        const c=i<wordIdx?'done':'';
        p+='<span class="wtag '+c+'">'+(i<wordIdx?'✓ '+ww:ww)+'</span>';
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
