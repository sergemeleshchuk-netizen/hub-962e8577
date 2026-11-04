/* Hidden Books («Mystery Book») — logic, cleaned up from the Bookshelf prototype (final, v136).
 *
 * Rules (final version from the prototype):
 *  - A hidden book shows a mystery cover instead of its picture and a counter "moves until it opens".
 *  - Counters at level start: 4, 8, 12, 16 … (first hidden book 4, every next +4).
 *  - Every move the player makes, every counter goes down by 1.
 *  - At most ONE book opens per move. When one opens, every other counter is set to at least 2,
 *    so the reveals are spread over the level and never happen all at once.
 *  - Gluing the hidden book to a neighbour (it becomes part of a correct pair) takes 1 extra off its counter.
 *  - A hidden book that is placed on its own home slot opens on that move.
 *  - Boosters (Hint Lens, Art Brush, …) can force-open a book: call reveal(id).
 *  - While hidden books remain, the Art Brush booster is blocked (as with locks and tied books): hb.count()>0.
 *  - In the prototype the mechanic unlocks on level 17 (3 hidden books there); later: difficulty ≤3 → 0, ≤6 → 2, harder → min(5, books/5).
 *  - The book can still be moved while hidden.
 *
 * Usage:
 *   const hb = HiddenBooks.create({
 *     ids:[3,7,11],                       // which books are hidden (any ids you use)
 *     el:id=>bookElement(id),             // returns the DOM element of a book
 *     isHome:id=>pos[id]===id,            // is the book on its own slot right now?
 *     fx:document.getElementById('fx'),  // optional absolutely-positioned layer for sparkles (defaults to document.body)
 *     onReveal:id=>{},                    // optional callback (sound, analytics…)
 *   });
 *   hb.mount();                 // draws covers
 *   // after every move:
 *   hb.onMove({glued:[ids of books that just became part of a correct pair]});
 *   hb.reveal(id);              // force-open (boosters)
 *   hb.has(id);  hb.count();    // queries (e.g. block the Art Brush while hb.count()>0)
 */
(function(root){
  const RM = typeof matchMedia==='function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const START=4, STEP=4, MIN_AFTER_REVEAL=2;

  function create(o){
    const hidden=new Set(o.ids), timer={};
    [...hidden].forEach((id,i)=>timer[id]=START+i*STEP);
    const fx=o.fx||document.body;

    function cover(id){return o.el(id)&&o.el(id).querySelector('.cover')}
    function mount(){
      hidden.forEach(id=>{const el=o.el(id);if(!el||cover(id))return;
        const c=document.createElement('u');c.className='cover';c.innerHTML=`<i class="hbB t"></i><i class="hbE"></i><i class="hbB b"></i><b class="hm">${timer[id]}</b>`;el.appendChild(c)})}
    function paintCounters(bump){
      hidden.forEach(id=>{const b=cover(id)&&cover(id).querySelector('.hm');if(!b)return;b.textContent=timer[id];
        if(bump){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}})}

    function onMove(info={}){
      if(!hidden.size)return;
      const glued=new Set(info.glued||[]);
      hidden.forEach(id=>{
        timer[id]-=1;
        if(glued.has(id))timer[id]-=1;                       // gluing speeds it up
        if(o.isHome&&o.isHome(id))timer[id]=Math.min(timer[id],0); // placed home → opens now
      });
      const ready=[...hidden].filter(id=>timer[id]<=0).sort((a,b)=>timer[a]-timer[b]);
      if(ready.length){
        reveal(ready[0]);
        hidden.forEach(id=>timer[id]=Math.max(MIN_AFTER_REVEAL,timer[id]));   // one per move, keep the rest spaced
      }
      paintCounters(true);
    }

    function reveal(id){
      if(!hidden.has(id))return;hidden.delete(id);delete timer[id];
      const el=o.el(id),c=cover(id);if(o.onReveal)o.onReveal(id);
      if(!c||RM){c&&c.remove();return}
      c.classList.add('opening');                                  // shake + brighten
      setTimeout(()=>{
        c.classList.add('gone');                                   // swing open
        const r=rel(el);sparkles(r.cx,r.cy,16);floatText('Revealed!',r.cx,r.y-6);
        el.classList.remove('hb-reveal');void el.offsetWidth;el.classList.add('hb-reveal');
        setTimeout(()=>{c.remove();el.classList.remove('hb-reveal')},700);
      },520);
    }

    function rel(el){const a=fx.getBoundingClientRect(),r=el.getBoundingClientRect();
      return{x:r.left-a.left,y:r.top-a.top,w:r.width,h:r.height,cx:r.left-a.left+r.width/2,cy:r.top-a.top+r.height/2}}
    function sparkles(x,y,n){const cols=['#C29BFF','#FFE08A','#ffffff','#8FE0FF'];
      for(let i=0;i<n;i++){const p=document.createElement('i');p.className='hb-pt';const a=Math.random()*Math.PI*2,sp=70*(.4+Math.random()*.8);
        p.style.cssText=`left:${x}px;top:${y}px;--s:${10*(.6+Math.random()*.8)}px;--c:${cols[i%cols.length]};--x:${Math.cos(a)*sp}px;--y:${Math.sin(a)*sp}px;--d:${700*(.7+Math.random()*.6)}ms`;
        fx.appendChild(p);setTimeout(()=>p.remove(),1000)}}
    function floatText(t,x,y){const d=document.createElement('div');d.className='hb-txt';d.textContent=t;d.style.left=x+'px';d.style.top=y+'px';fx.appendChild(d);setTimeout(()=>d.remove(),1200)}

    return{mount,onMove,reveal,has:id=>hidden.has(id),count:()=>hidden.size,timers:()=>({...timer})};
  }
  /* level generator helper: pick N books to hide that are not used by other mechanics */
  function pick(n,count,R=Math.random,used=new Set()){const out=[];let t=0;while(out.length<count&&t++<400){const id=Math.floor(R()*n);if(used.has(id))continue;out.push(id);used.add(id)}return out}
  root.HiddenBooks={create,pick};
})(typeof window!=='undefined'?window:this);
