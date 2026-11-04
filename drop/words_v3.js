/* words_v3.js — словесный слой для drop-words v3 (логика 1:1 с v1/v2/v6).
   Логика 1:1 как Arrows+Words v6 (отдельный js — требование заказчика):
     - подходящая буква идёт СРАЗУ в слово, прочие — в трей-буфер;
     - дофлаш трея при закрытии слова; переполнение трея = проигрыш;
     - список слов показан БЕЗ подсветки текущего (игрок угадывает);
     - ячейки сбора ПУСТЫЕ (без серых подсказок).
   Отличие от v6: уровни (поле/блоки/шары) живут в index — здесь только слова. */

const LETTER_COLORS=['#ff4d8d','#ff9f43','#9b5cf6','#2ecc71','#4aa3ff','#ff4d5e','#1abc9c','#f1c40f'];
function colorOf(ch){
  let h=0; for(let i=0;i<ch.length;i++) h=(h*31+ch.charCodeAt(i))>>>0;
  return LETTER_COLORS[h%LETTER_COLORS.length];
}

const Words = (function(){
  let cfg=null;            // {words, traySize}
  let filled=[];           // буквы текущего слова по позициям
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

  function slotFor(ch){
    const w=curWord(); if(!w) return -1;
    for(let i=0;i<w.length;i++) if(w[i]===ch && filled[i]===null) return i;
    return -1;
  }
  function wordComplete(){ return filled.length>0 && filled.every(x=>x!==null); }

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
  function advanceWord(){ wordIdx++; resetFilled(); }

  // приход буквы от поглощённого шара
  function collect(letter){
    let toWord=false;
    const s=slotFor(letter);
    if(s>=0){ filled[s]=letter; toWord=true; }   // подходит -> сразу в слово
    else { tray.push(letter); }                  // не подходит -> в трей

    if(wordComplete()){ advanceWord(); flushTray(); }

    const allDone = wordIdx>=cfg.words.length;
    const overflow = !allDone && tray.length>cfg.traySize;
    render(overflow);
    if(allDone) onAllDone && onAllDone();
    else if(overflow) onOverflow && onOverflow();
    return {toWord, allDone, overflow};
  }

  function render(overflow){
    const w=curWord();
    let bar='';
    if(w){
      for(let i=0;i<w.length;i++){
        const on=filled[i]!==null, ch=filled[i];
        if(on){
          const col=colorOf(ch);
          bar+='<span class="cell on" style="color:'+col+';border-color:'+col+'33">'+ch+'</span>';
        } else {
          bar+='<span class="cell"></span>';
        }
      }
    }
    barEl.innerHTML=bar;

    if(progEl){
      let p='';
      cfg.words.forEach((ww,i)=>{
        const c=i<wordIdx?'done':'';
        p+='<span class="wtag '+c+'">'+(i<wordIdx?'✓ '+ww:ww)+'</span>';
      });
      progEl.innerHTML=p;
    }

    let t='';
    for(let i=0;i<cfg.traySize;i++){
      const ch=tray[i];
      const col=ch?colorOf(ch):null;
      const warn = ch && tray.length>=cfg.traySize;
      t+='<span class="tile'+(ch?' has':'')+(overflow?' over':(warn?' warn':''))+'"'+
         (ch?(' style="color:'+col+';border-bottom-color:'+col+'"'):'')+'>'+(ch||'')+'</span>';
    }
    trayEl.innerHTML=t;
  }

  return {init, collect, colorOf};
})();
