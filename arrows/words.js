/* words.js — словесный слой над механикой стрелок (v2).
   Отвечает за: буквы-цели, трей-буфер (переполняемый), сбор слова.
   Правила (согласованы с заказчиком):
     - буква вытащенной стрелки падает в ТРЕЙ;
     - слово засчитывается АВТОМАТИЧЕСКИ, как только в трее есть все его буквы
       (в любом порядке); эти буквы уходят из трея в кроссворд;
     - слова идут ПО ОДНОМУ за раунд (words[0], words[1], ...);
     - трей ФИКСИРОВАН (traySize). Если после добавления буквы трей переполнен
       (длина > traySize) и текущее слово не сложилось — это GAME OVER.
   index_v2.html вызывает Words.init(...) и Words.collect(letter).
*/

const WORD_LEVELS = [
{"cols":6,"rows":9,"time":45,"lives":3,"traySize":8,"words":["КОТ","ЛЕВ","СОМ","ВОЛК"],"arrows":[{"path":[[6,6],[5,6],[4,6],[3,6],[3,5],[3,4],[3,3]],"letter":"О"},{"path":[[4,3],[4,2],[4,1],[4,0],[3,0]],"letter":"К"},{"path":[[2,6],[2,5],[2,4],[2,3],[2,2],[1,2]],"letter":"О"},{"path":[[6,8],[5,8],[4,8],[3,8]],"letter":"Т"},{"path":[[1,5],[1,6],[1,7],[2,7],[3,7],[4,7],[5,7]],"letter":"Л"},{"path":[[0,4],[0,5],[0,6],[0,7]],"letter":"К"},{"path":[[0,9],[1,9],[2,9]],"letter":"Л"},{"path":[[4,5],[5,5],[6,5]],"letter":"Е"},{"path":[[3,9],[4,9]],"letter":"В"},{"path":[[2,1],[1,1],[0,1]],"letter":"С"},{"path":[[5,3],[5,2],[5,1],[6,1]],"letter":"О"},{"path":[[5,4],[6,4]],"letter":"М"},{"path":[[5,0],[6,0]],"letter":"В"}]}
];

const Words = (function(){
  let cfg=null;        // {words, traySize}
  let tray=[];         // массив букв в буфере
  let wordIdx=0;       // индекс текущего целевого слова
  let onOverflow=null; // колбэк проигрыша
  let onAllDone=null;  // колбэк победы
  let trayEl=null, panelEl=null;

  function init(level, hooks){
    cfg={words:level.words.slice(), traySize:level.traySize};
    tray=[]; wordIdx=0;
    onOverflow=hooks.onOverflow; onAllDone=hooks.onAllDone;
    trayEl=document.getElementById('tray');
    panelEl=document.getElementById('wordPanel');
    render();
  }

  function curWord(){ return cfg.words[wordIdx] || null; }

  // есть ли в трее все буквы слова w (мультимножество)
  function trayHasWord(w){
    const need={};
    for(const ch of w) need[ch]=(need[ch]||0)+1;
    const have={};
    for(const ch of tray) have[ch]=(have[ch]||0)+1;
    for(const ch in need) if((have[ch]||0)<need[ch]) return false;
    return true;
  }

  // изъять буквы слова w из трея (по одной на каждую букву)
  function consume(w){
    for(const ch of w){
      const i=tray.indexOf(ch);
      if(i>=0) tray.splice(i,1);
    }
  }

  // главный вход: пришла буква от вытащенной стрелки
  function collect(letter){
    tray.push(letter);
    // авто-засчёт текущего слова (возможно цепочкой, если буквы уже лежали)
    let completed=[];
    while(curWord() && trayHasWord(curWord())){
      const w=curWord();
      consume(w); completed.push(w); wordIdx++;
    }
    const allDone = wordIdx>=cfg.words.length;
    const overflow = !allDone && tray.length>cfg.traySize;
    render(completed.length?completed[completed.length-1]:null, overflow);
    if(allDone){ onAllDone && onAllDone(); }
    else if(overflow){ onOverflow && onOverflow(); }
    return {completed, allDone, overflow};
  }

  function render(justCompleted, overflow){
    // ----- панель слов (кроссворд: текущее слово боксами + список) -----
    const w=curWord();
    let html='';
    if(w){
      // подсветим, какие буквы текущего слова уже лежат в трее
      const have={}; for(const ch of tray) have[ch]=(have[ch]||0)+1;
      const used={};
      html+='<div class="curword">';
      for(const ch of w){
        used[ch]=(used[ch]||0)+1;
        const ready=(have[ch]||0)>=used[ch];
        html+='<span class="wbox'+(ready?' ready':'')+'">'+(ready?ch:'')+'</span>';
      }
      html+='</div>';
    }
    // мини-список всех слов с прогрессом
    html+='<div class="wlist">';
    cfg.words.forEach((ww,i)=>{
      const cls=i<wordIdx?'done':(i===wordIdx?'now':'');
      html+='<span class="wtag '+cls+'">'+(i<wordIdx?'✓ ':'')+ww+'</span>';
    });
    html+='</div>';
    panelEl.innerHTML=html;

    // ----- трей -----
    let t='';
    for(let i=0;i<cfg.traySize;i++){
      const ch=tray[i];
      const full = i>=cfg.traySize-1 && tray.length>=cfg.traySize; // последний слот = тревога
      t+='<span class="slot'+(ch?' has':'')+(overflow?' over':(full&&ch?' warn':''))+'">'+(ch||'')+'</span>';
    }
    trayEl.innerHTML=t;
  }

  return {init, collect, WORD_LEVELS};
})();
