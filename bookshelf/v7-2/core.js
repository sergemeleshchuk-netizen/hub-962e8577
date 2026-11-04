/* =========================================================
   CORE — pure rules engine (no DOM). Shared by the game, the level generator, the solver and the simulator.
   ---------------------------------------------------------
   Board: rows x cols cells, every cell holds exactly one book (no empty slots).
   order[p] = id of the book standing in cell p;  pos[id] = cell of book id.  Book id's home is cell id.
   v9 (hub): glue is HORIZONTAL ONLY (id,id+1 on a shelf); the vertical join below was removed. See patch in hubify_v9.py.
   GROUP  = natural glue block (neighbours that are already in the right relative order: id,id+1 on a shelf
            or id,id+cols across shelves) plus ribbon ties. A group always moves as one.
   MOVE   = translate a group by (dr,dc), shape preserved, crossing shelves allowed, must stay on the board.
            Books standing in the target cells are displaced into the cells the group vacated, in reading order.
            A single book onto a single book = a plain swap; a block of k onto other books = a rotation.
   A move is ILLEGAL if it would displace: a locked book, a frozen/framed book, a tied book,
            or split a pair glued in its home spot. Misplaced glued pairs may be pushed apart.
   Solvability: any misplaced natural block can always translate straight home (its target cells are its own
            home cells, so they never hold a home/frozen book). Only locks and ties can sit there; locks open
            from adjacent glues and the jam rescue pops one, ties untie on glue. So every level is solvable and
            the solution length is bounded by the number of misplaced groups.
   ========================================================= */
(function(root){
'use strict';
const Core={};

Core.make=function(o){ // {rows,cols,order,locks,links,hidden,freeze,frame,frameMin}
  const st={rows:o.rows,cols:o.cols,n:o.rows*o.cols,order:o.order.slice(),pos:[],locks:Object.assign({},o.locks||{}),
    links:(o.links||[]).map(x=>x.slice()),hidden:new Set(o.hidden||[]),freeze:!!o.freeze,frame:!!o.frame,loose:null,groups:null};
  Core.sync(st);st.groups=Core.groups(st);return st};
Core.clone=function(st){const c=Object.assign({},st);c.order=st.order.slice();c.pos=st.pos.slice();c.locks=Object.assign({},st.locks);
  c.links=st.links.map(x=>x.slice());c.hidden=new Set(st.hidden);c.loose=st.loose?new Set(st.loose):null;c.groups=Core.groups(c);return c};
Core.sync=function(st){st.pos=[];st.order.forEach((id,p)=>st.pos[id]=p)};
Core.solved=st=>st.order.every((v,i)=>v===i);
Core.correct=o=>o.reduce((s,id,p)=>s+(id===p),0);

/* union-find over natural glue (+ ribbon ties for movement) */
Core.groups=function(st,order=st.order,withTies=true){const n=st.n,cols=st.cols,par=[...Array(n).keys()];
  const find=x=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x]}return x};const join=(a,b)=>{a=find(a);b=find(b);if(a!==b)par[a]=b};
  const links={};
  for(let p=0;p<n;p++){const a=order[p];
    if(p%cols<cols-1){const b=order[p+1];if(b===a+1&&Math.floor(b/cols)===Math.floor(a/cols)){join(a,b);(links[a]=links[a]||{}).r=1;(links[b]=links[b]||{}).l=1}}}
  const nat={};for(let id=0;id<n;id++)nat[id]=find(id);
  const natMembers={};for(let id=0;id<n;id++)(natMembers[nat[id]]=natMembers[nat[id]]||[]).push(id);
  if(withTies&&st.links)st.links.forEach(([a,b])=>join(a,b));
  const gid=[],members={};for(let id=0;id<n;id++){const r=find(id);gid[id]=r;(members[r]=members[r]||[]).push(id)}
  return{gid,members,links,nat,natMembers}};
Core.groupOf=(st,id)=>st.groups.members[st.groups.gid[id]];
Core.natSize=(st,id)=>st.groups.natMembers[st.groups.nat[id]].length;
Core.pairs=function(st,o){let c=0;const cols=st.cols,n=st.n;for(let p=0;p<n;p++){const a=o[p];
  if(p%cols<cols-1&&o[p+1]===a+1&&Math.floor((a+1)/cols)===Math.floor(a/cols))c++;}return c};

/* frozen (easy levels: every home book) or framed (Golden Frame: home books on the outer edge) */
Core.isAnch=function(st,id){if(st.pos[id]!==id)return false;
  if(st.freeze&&!st.links.some(l=>l.includes(id)))return true;if(!st.frame)return false;
  const r=Math.floor(id/st.cols),c=id%st.cols;return r===0||r===st.rows-1||c===0||c===st.cols-1};
Core.tied=(st,id)=>st.links.some(l=>l.includes(id));
Core.clampDelta=function(st,ids,dr,dc){let r0=1e9,r1=-1,c0=1e9,c1=-1;ids.forEach(id=>{const p=st.pos[id],r=Math.floor(p/st.cols),c=p%st.cols;
  r0=Math.min(r0,r);r1=Math.max(r1,r);c0=Math.min(c0,c);c1=Math.max(c1,c)});
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v));return[cl(dr,-r0,st.rows-1-r1),cl(dc,-c0,st.cols-1-c1)]};
Core.moveBlock=function(st,ids,dr,dc,order=st.order){const o=order.slice(),cols=st.cols;
  const from=ids.map(id=>st.pos[id]),to=from.map(p=>p+dr*cols+dc);const fromS=new Set(from),toS=new Set(to);
  const displaced=to.filter(p=>!fromS.has(p)).sort((a,b)=>a-b).map(p=>order[p]);const vacated=from.filter(p=>!toS.has(p)).sort((a,b)=>a-b);
  ids.forEach((id,i)=>o[to[i]]=id);displaced.forEach((id,i)=>o[vacated[i]]=id);return o};
/* returns the id that blocks the move, or -1 */
Core.blockedBy=function(st,ids,dr,dc){const inG=new Set(ids);
  for(const id of ids){const o=st.order[st.pos[id]+dr*st.cols+dc];if(inG.has(o))continue;
    if(st.locks[o])return o;if(Core.isAnch(st,o))return o;if(Core.tied(st,o))return o}
  const o=Core.moveBlock(st,ids,dr,dc),np=[];o.forEach((id,p)=>np[id]=p);const lk=st.groups.links;const ls=st.loose||new Set();
  for(const k in lk){const a=+k;if(ls.has(a))continue;if(st.pos[a]!==a&&!inG.has(a))continue;
    if(lk[a].r&&np[a+1]!==np[a]+1)return inG.has(a)?a+1:a;if(lk[a].d&&np[a+st.cols]!==np[a]+st.cols)return inG.has(a)?a+st.cols:a}
  return -1};
Core.movable=(st,ids)=>!ids.some(i=>st.locks[i]||Core.isAnch(st,i));
Core.legal=function(st,ids,dr,dc){if(!dr&&!dc)return false;const [a,b]=Core.clampDelta(st,ids,dr,dc);return a===dr&&b===dc&&Core.blockedBy(st,ids,dr,dc)<0};

/* every distinct legal move (group x translation). Used by the solver, the jam check and the evaluator. */
Core.moves=function(st,{homeOnly=false,limit=Infinity,seeHidden=false}={}){const out=[],seen=new Set();
  for(let id=0;id<st.n;id++){const ids=Core.groupOf(st,id);const k=Math.min(...ids);
    if(homeOnly){if(st.pos[id]===id||(!seeHidden&&st.hidden.has(id)))continue}else if(seen.has(k))continue;
    seen.add(k);if(!Core.movable(st,ids))continue;
    if(homeOnly){const dr=Math.floor(id/st.cols)-Math.floor(st.pos[id]/st.cols),dc=id%st.cols-st.pos[id]%st.cols;
      if(Core.legal(st,ids,dr,dc))out.push({id,ids,dr,dc});continue}
    for(let r=-st.rows+1;r<st.rows;r++)for(let c=-st.cols+1;c<st.cols;c++){if(Core.legal(st,ids,r,c)){out.push({id:ids[0],ids,dr:r,dc:c});if(out.length>=limit)return out}}}
  return out};
Core.hasAnyMove=st=>Core.moves(st,{limit:1}).length>0;
/* greedy evaluation of a move: new glued pairs weigh most, then books brought home */
Core.score=function(st,o){return(Core.pairs(st,o)-Core.pairs(st,st.order))*10+(Core.correct(o)-Core.correct(st.order))*3};
Core.bestMove=function(st){let best=null;for(const m of Core.moves(st,{homeOnly:true})){const o=Core.moveBlock(st,m.ids,m.dr,m.dc);
  const sc=Core.score(st,o)+m.ids.length*.1;if(!best||sc>best.sc)best=Object.assign(m,{o,sc})}return best};

/* apply an arrangement and resolve modifiers. Returns what happened (the game turns this into FX). */
Core.apply=function(st,newOrder){const old=st.groups;st.order=newOrder.slice();Core.sync(st);st.loose=null;st.groups=Core.groups(st);
  const g=st.groups,grown=new Set(),ev={grown,unlocked:[],revealed:[],untied:[],hit:[]};
  Object.values(g.natMembers).forEach(m=>{if(m.length<2)return;const prev=Math.max(...m.map(id=>old.natMembers[old.nat[id]].length));if(m.length>prev)m.forEach(id=>grown.add(id))});
  const nb=p=>{const c=st.cols,r=[];if(p%c>0)r.push(p-1);if(p%c<c-1)r.push(p+1);if(p-c>=0)r.push(p-c);if(p+c<st.n)r.push(p+c);return r};
  Object.keys(st.locks).forEach(k=>{const id=+k;if(grown.has(id)||nb(st.pos[id]).some(p=>grown.has(st.order[p]))){st.locks[id]--;ev.hit.push(id);if(st.locks[id]<=0){delete st.locks[id];ev.unlocked.push(id)}}});
  [...st.hidden].forEach(id=>{if(grown.has(id)||st.pos[id]===id||nb(st.pos[id]).some(p=>grown.has(st.order[p]))){st.hidden.delete(id);ev.revealed.push(id)}});
  st.links.slice().forEach(l=>{if(l.some(id=>g.natMembers[g.nat[id]].length>1||st.pos[id]===id)){st.links=st.links.filter(x=>x!==l);ev.untied.push(l)}});
  if(ev.unlocked.length||ev.untied.length)st.groups=Core.groups(st);
  return ev};
/* jam rescue (soft-lock proof): if no group can be sent home, first untie a ribbon, then loosen the smallest misplaced
   block for one move, then pop a lock. Checked after every move, so a level can never stall. */
Core.homeMoves=st=>Core.moves(st,{homeOnly:true,seeHidden:true});
Core.unjam=function(st){if(Core.solved(st)||Core.homeMoves(st).length)return null;
  if(st.links.length){const l=st.links.find(x=>x.some(id=>st.pos[id]!==id))||st.links[0];st.links=st.links.filter(x=>x!==l);st.groups=Core.groups(st);return{untie:l}}
  const g=st.groups;const blocks=Object.values(g.natMembers).filter(m=>m.length>1);
  const wrong=blocks.filter(m=>m.some(id=>st.pos[id]!==id)).sort((a,b)=>a.length-b.length);
  for(const pick of wrong){st.loose=new Set(pick);if(Core.homeMoves(st).length)return{loose:pick};st.loose=null}
  const lk=Object.keys(st.locks)[0];if(lk!==undefined){delete st.locks[lk];st.groups=Core.groups(st);return{unlock:+lk}}
  return null};
if(typeof module!=='undefined')module.exports=Core;else root.Core=Core;
})(typeof window!=='undefined'?window:globalThis);
