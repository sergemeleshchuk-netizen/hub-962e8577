/* Tied Books («Ribbons», руки-рукопожатие) — logic, cleaned up from the Bookshelf prototype (v135).
 *
 * Rules (final version from the prototype):
 *  - Two neighbouring books hold hands: they move only together, like one glued block (they cannot be split).
 *  - A pair is only created from books that are NOT on their home slots and are NOT a correct pair already.
 *  - Counter "moves until they let go": 5, 8, 11 … (first pair 5, every next +3).
 *  - Every move the player makes, every counter goes down by 1.
 *  - At most ONE pair lets go per move; the others stay at ≥1 and let go on the next moves.
 *  - If either tied book glues to its true neighbour (becomes part of a correct pair) the hands let go at once.
 *  - If the player has no legal move left, the first pair lets go at once (never a dead shelf).
 *  - Golden Key booster: unties one pair (call untie(pairIndex) / untieFirst()).
 *  - While pairs remain, the Art Brush booster is blocked (as with locks and mystery books).
 *
 * Usage:
 *   const tb = TiedBooks.create({
 *     pairs:[[3,4],[10,11]],              // ids of the two books in each pair
 *     el:id=>bookElement(id),             // DOM element of a book (position:absolute or relative)
 *     fx:document.getElementById('fx'),  // optional absolutely-positioned layer for the release animation
 *     assets:'',                          // folder with arm_hands / arm_sleeve / arm_l / arm_r (.webp)
 *     onUntie:pair=>{},                   // optional callback (sound, analytics, regroup…)
 *   });
 *   tb.mount();                    // draws the arms
 *   tb.sync();                     // call after books moved / layout changed: arms span exactly the two books
 *   tb.partner(id)                 // → id of the tied partner or -1 (use it in your drag/group logic)
 *   tb.onMove({glued:[ids that just became part of a correct pair], noMoves:false});
 *   tb.untieFirst();               // Golden Key
 *   tb.count();                    // pairs left (e.g. block Art Brush while > 0)
 */
(function(root){
  const RM = typeof matchMedia==='function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const START=5, STEP=3;

  function create(o){
    let pairs=o.pairs.map((p,i)=>({a:p[0],b:p[1],t:START+i*STEP}));
    const fx=o.fx||document.body, A=o.assets||'';

    function knot(p){const e=o.el(p.a),f=o.el(p.b);return (e&&e.querySelector('.tie.knot'))||(f&&f.querySelector('.tie.knot'))}
    function mount(){pairs.forEach(p=>{if(knot(p))return;const k=document.createElement('b');k.className='tie knot';
      k.style.setProperty('--hands',`url(${A}arm_hands.webp)`);k.style.setProperty('--sleeve',`url(${A}arm_sleeve.webp)`);
      k.innerHTML=`<i class="tn">${p.t}</i>`;o.el(p.a).appendChild(k)});sync()}

    /* arms start at the left book's left edge and end at the right book's right edge; clasp sits on the gap */
    function sync(){pairs.forEach(p=>{const k=knot(p);if(!k)return;const ea=o.el(p.a),eb=o.el(p.b),ra=ea.getBoundingClientRect(),rb=eb.getBoundingClientRect();
      const L=ra.left<=rb.left?ea:eb,R=L===ea?eb:ea,rl=L.getBoundingClientRect(),rr=R.getBoundingClientRect();
      if(k.parentNode!==L)L.appendChild(k);
      const scale=rl.width/(L.offsetWidth||rl.width)||1;                       // ignore lift/scale transforms
      k.style.setProperty('--kw',((rr.right-rl.left)/scale)+'px');
      k.style.setProperty('--ah',Math.round(Math.max(26,Math.min(54,(rl.width/scale)*.42)))+'px')})}

    function paint(){pairs.forEach(p=>{const n=knot(p)&&knot(p).querySelector('.tn');if(!n)return;n.textContent=p.t;n.classList.remove('bump');void n.offsetWidth;n.classList.add('bump')})}

    function onMove(info={}){if(!pairs.length)return;const glued=new Set(info.glued||[]);
      const g=pairs.find(p=>glued.has(p.a)||glued.has(p.b));if(g){untie(g);return paint()}      // glued → let go now
      if(info.noMoves){untie(pairs[0]);return paint()}                                           // never leave a dead shelf
      let done=false;
      pairs.slice().forEach(p=>{p.t-=1;if(p.t<=0&&!done){done=true;untie(p)}else if(p.t<=0)p.t=1});   // one pair per move
      paint()}

    function untie(p){if(typeof p==='number')p=pairs[p];if(!p||!pairs.includes(p))return;
      const k=knot(p);pairs=pairs.filter(x=>x!==p);if(o.onUntie)o.onUntie([p.a,p.b]);
      if(!k)return;if(RM){k.remove();return}
      const r=rel(k),W=r.w,H=W*116/420;k.style.opacity='0';
      fly(A+'arm_l.webp',-1,W*240/420*1.04,r,W,H);fly(A+'arm_r.webp',1,W*260/420*1.04,r,W,H);sparkles(r.cx,r.cy,12);
      setTimeout(()=>k.remove(),400)}
    /* the two gloves let go and wave apart */
    function fly(src,dir,w,r,W,H){const h=document.createElement('img');h.src=src;h.className='tb-fly';h.style.width=w+'px';fx.appendChild(h);
      const x0=dir<0?r.x:r.x+W-w,y0=r.cy-H/2;
      h.animate([{transform:`translate(${x0}px,${y0}px)`,opacity:1},{transform:`translate(${x0+dir*6}px,${y0}px) rotate(${dir*-6}deg)`,offset:.25},
        {transform:`translate(${x0+dir*W*.35}px,${y0-18}px) rotate(${dir*14}deg)`,opacity:1,offset:.7},{transform:`translate(${x0+dir*W*.5}px,${y0-30}px) rotate(${dir*20}deg) scale(.85)`,opacity:0}],
        {duration:950,easing:'cubic-bezier(.3,.7,.3,1)'}).onfinish=()=>h.remove()}
    function rel(el){const a=fx.getBoundingClientRect(),r=el.getBoundingClientRect(),w=parseFloat(el.style.getPropertyValue('--kw'))||r.width,h=parseFloat(el.style.getPropertyValue('--ah'))||36;
      return{x:r.left-a.left,y:r.top-a.top-h/2,w,h,cx:r.left-a.left+w/2,cy:r.top-a.top}}
    function sparkles(x,y,n){const cols=['#FFE08A','#ffffff','#7CC8FF'];
      for(let i=0;i<n;i++){const p=document.createElement('i');p.className='tb-pt';const a=Math.random()*Math.PI*2,sp=56*(.4+Math.random()*.8);
        p.style.cssText=`left:${x}px;top:${y}px;--s:${9*(.6+Math.random()*.8)}px;--c:${cols[i%3]};--x:${Math.cos(a)*sp}px;--y:${Math.sin(a)*sp}px;--d:${700*(.7+Math.random()*.6)}ms`;
        fx.appendChild(p);setTimeout(()=>p.remove(),1000)}}

    const partner=id=>{const p=pairs.find(p=>p.a===id||p.b===id);return p?(p.a===id?p.b:p.a):-1};
    return{mount,sync,onMove,untie,untieFirst:()=>untie(pairs[0]),partner,has:id=>partner(id)>=0,count:()=>pairs.length,timers:()=>pairs.map(p=>({pair:[p.a,p.b],moves:p.t}))};
  }

  /* level generator helper: pick N pairs of horizontally neighbouring books that are both misplaced.
     order[p] = id of the book standing on slot p; cols = books per shelf; R = random() function */
  function pick(order,cols,count,R=Math.random,used=new Set()){const n=order.length,pos=[],out=[];order.forEach((id,p)=>pos[id]=p);let t=0;
    while(out.length<count&&t++<400){const p=Math.floor(R()*n);if(p%cols===cols-1)continue;const a=order[p],b=order[p+1];
      if(used.has(a)||used.has(b)||pos[a]===a||pos[b]===b)continue;out.push([a,b]);used.add(a);used.add(b)}return out}

  /* soft untie sound (WebAudio, no files): rising filtered noise + three plucks */
  function untieSound(ctx,dest){if(!ctx)return;dest=dest||ctx.destination;const t=ctx.currentTime,len=ctx.sampleRate*.7,buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=buf;fl.type='bandpass';fl.Q.value=1.2;fl.frequency.setValueAtTime(350,t);fl.frequency.exponentialRampToValueAtTime(1600,t+.45);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.12);g.gain.exponentialRampToValueAtTime(.0001,t+.6);s.connect(fl);fl.connect(g);g.connect(dest);s.start(t);s.stop(t+.7);
    [[392,.05],[587.33,.17],[783.99,.3]].forEach(([f,dl])=>{const o=ctx.createOscillator(),e=ctx.createGain();o.type='triangle';o.frequency.value=f;e.gain.setValueAtTime(.0001,t+dl);e.gain.exponentialRampToValueAtTime(.07,t+dl+.01);e.gain.exponentialRampToValueAtTime(.0001,t+dl+.5);o.connect(e);e.connect(dest);o.start(t+dl);o.stop(t+dl+.55)})}

  root.TiedBooks={create,pick,untieSound};
})(typeof window!=='undefined'?window:this);
