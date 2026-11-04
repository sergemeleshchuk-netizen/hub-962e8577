(function(root){
'use strict';
const VERSION=1, LIMIT=10;
const signature=p=>[p.a,p.b].sort().join('__');
const selectableObjects=data=>[...data.objects,...(data.art_ready_objects||[])];
function moveItem(items,from,to,after=false){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=items.length||to>=items.length)throw Error('Неверная позиция пары.');
 const result=[...items],item=result.splice(from,1)[0];
 let index=to+(after?1:0);if(from<index)index--;
 result.splice(index,0,item);
 return {items:result,index};
}
function validateSlots(input,objects){
 if(!Array.isArray(input)||input.length!==LIMIT)throw Error('В подборке должно быть 10 мест для уровней.');
 const keys=new Set(objects.map(o=>o.key)),seen=new Set();
 return input.map(p=>{
  if(p===null)return null;
  if(!p||typeof p!=='object'||!keys.has(p.a)||!keys.has(p.b)||p.a===p.b||![p.a,p.b].includes(p.reference))throw Error('В подборке есть неизвестный объект или неверный эталон.');
  const out={a:p.a,b:p.b,reference:p.reference},key=signature(out);
  if(seen.has(key))throw Error('Одна пара не может занимать два уровня.');seen.add(key);return out;
 });
}
function put(slots,level,pair,objects){
 if(!Number.isInteger(level)||level<0||level>=LIMIT)throw Error('Выберите уровень от 1 до 10.');
 const next=slots.map(p=>p&&({...p}));next[level]={...pair};return validateSlots(next,objects);
}
function catalog(data){
 const active=new Set(data.objects.map(o=>o.key)),seen=new Set();
 return data.curated_pairs.filter(p=>{
  const key=signature(p);
  if(!active.has(p.a)||!active.has(p.b)||p.a===p.b||p.concept_approval==='rejected_by_user'||seen.has(key))return false;
  seen.add(key);return true;
 });
}
function encode(slots){return encodeURIComponent(JSON.stringify({v:VERSION,slots:slots.map(p=>p?[p.a,p.b,p.reference]:null)}));}
function decode(encoded,objects){const d=JSON.parse(decodeURIComponent(encoded));if(d.v!==VERSION||!Array.isArray(d.slots))throw Error('Неизвестный формат ссылки.');return validateSlots(d.slots.map(p=>p===null?null:Array.isArray(p)&&p.length===3?{a:p[0],b:p[1],reference:p[2]}:false),objects);}
function exportSelection(slots,data){
 const available=selectableObjects(data),clean=validateSlots(slots,available),byKey=Object.fromEntries(available.map(o=>[o.key,o]));
 const object=k=>{const o=byKey[k];return {key:k,name:o.name,size_m:o.size_m,dimension:o.dimension,axis:o.axis,image:o.image,measurement_status:o.measurement_status};};
 return {schema:'sizematch-first-ten',version:VERSION,build:data.build,catalog_sha256:data.game_sha256,created_at:new Date().toISOString(),status:'user_selection_not_applied_to_game',levels:clean.map((p,i)=>p?{level:i+1,a:p.a,b:p.b,reference_object:p.reference,compared_object:p.reference===p.a?p.b:p.a,reference:object(p.reference),compared:object(p.reference===p.a?p.b:p.a)}:{level:i+1,a:null,b:null,reference_object:null})};
}
function fromExport(data,objects){
 if(data?.schema!=='sizematch-first-ten'||data.version!==VERSION||!Array.isArray(data.levels)||data.levels.length!==LIMIT)throw Error('Это не файл подборки первых 10 уровней.');
 const slots=Array(LIMIT).fill(null),seen=new Set();
 for(const p of data.levels){if(!Number.isInteger(p.level)||p.level<1||p.level>LIMIT||seen.has(p.level))throw Error('Неверные номера уровней.');seen.add(p.level);slots[p.level-1]=p.a===null&&p.b===null&&p.reference_object===null?null:{a:p.a,b:p.b,reference:p.reference_object};}
 return validateSlots(slots,objects);
}
function validatePair(p,objects){
 const keys=new Set(objects.map(o=>o.key));
 if(!p||!keys.has(p.a)||!keys.has(p.b)||p.a===p.b||![p.a,p.b].includes(p.reference))throw Error('Выберите два разных объекта и эталон.');
 return {a:p.a,b:p.b,reference:p.reference};
}
function repairRepeatedObjects(state,data,base){
 const available=selectableObjects(data),byKey=new Map(available.map(o=>[o.key,o])),byId=new Map(base.map(p=>[signature(p),p]));
 const active=state.order.filter(id=>!state.removed.includes(id));
 const priority=[...active.filter(id=>state.edits[id]),...active.filter(id=>!state.edits[id])];
 const claimed=new Set(),repeats=[];
 for(const id of priority){const p=state.edits[id]||byId.get(id);for(const side of ['a','b']){if(claimed.has(p[side]))repeats.push({id,side});else claimed.add(p[side]);}}
 if(!repeats.length)return state;
 const missing=new Set(available.map(o=>o.key).filter(k=>!claimed.has(k)));
 for(const {id,side} of repeats){
  const basePair=byId.get(id),before=state.edits[id]||{a:basePair.a,b:basePair.b,reference:basePair.a};
  const other=byKey.get(before[side==='a'?'b':'a']),original=basePair[side];
  const eligible=[...missing].map(key=>byKey.get(key)).filter(o=>o&&o.key!==other.key);
  eligible.sort((a,b)=>{
   const score=o=>{const measured=o.size_m>0&&other.size_m>0,ratio=measured?o.size_m/other.size_m:1,reachable=measured&&ratio>=0.04&&ratio<=25;
    return (reachable?0:measured?1000:500)+(o.key===original?-600:0)+(o.content_group&&o.content_group===other.content_group?10:0)+Math.abs(Math.log(ratio));};
   return score(a)-score(b);
  });
  const replacement=eligible[0];if(!replacement)throw Error('Не удалось устранить повтор объекта.');
  missing.delete(replacement.key);
  const after={...before,[side]:replacement.key,reference:before.reference===before[side]?replacement.key:before.reference};
  state.edits[id]=after;
  const update=p=>p&&signature(p)===signature(before)?{...after,reference:[after.a,after.b].includes(p.reference)?p.reference:after.reference}:p;
  state.favorites=state.favorites.map(update);state.slots=state.slots.map(update);
 }
 return state;
}
function editorState(input,data){
 if(!input||input.version!==2)throw Error('Неизвестный формат редактора.');
 const available=selectableObjects(data);
 const base=catalog(data),ids=new Set(base.map(signature)),edits={};
 const aliases=new Map(base.filter(p=>p.previous_pair).map(p=>[signature({a:p.previous_pair[0],b:p.previous_pair[1]}),signature(p)]));
 for(const [before,after] of Object.entries(data.catalog_pair_aliases||{}))aliases.set(before,after);
 const museumYacht=base.find(p=>[p.a,p.b].includes('museum_of_the_future')&&[p.a,p.b].includes('luxury_yacht_65m'));
 if(museumYacht)aliases.set(signature({a:'moma_museum',b:'niagara_american_falls'}),signature(museumYacht));
 const objectAliases=new Map([['japan','mexico'],['moma_museum','museum_of_the_future'],['niagara_american_falls','luxury_yacht_65m']]);
 const activeKey=k=>objectAliases.get(k)||k;
 const identityKeys=[...(Array.isArray(input.order)?input.order:[]),...Object.keys(input.edits||{}),...(Array.isArray(input.removed)?input.removed:[])];
 // A valid new edit can reproduce an older pair combination. Only catalog row
 // identities signal a legacy save; favorite and slot contents are user choices.
 const legacy=identityKeys.some(k=>!ids.has(k));
 const resolve=k=>legacy&&aliases.has(k)?aliases.get(k):k;
 const pairsById=new Map(base.map(p=>[signature(p),p]));
 const migratePair=p=>{if(!p)return p;const mapped={a:activeKey(p.a),b:activeKey(p.b),reference:activeKey(p.reference)};if(!legacy)return mapped;const id=resolve(signature(p));if(id===signature(p))return mapped;const current=pairsById.get(id);return current?{a:current.a,b:current.b,reference:[current.a,current.b].includes(mapped.reference)?mapped.reference:current.a}:mapped;};
 const savedOrder=input.order===undefined?base.map(signature):input.order.map(resolve);
 if(!Array.isArray(savedOrder)||new Set(savedOrder).size!==savedOrder.length||savedOrder.some(k=>!ids.has(k)))throw Error('Неверный порядок пар.');
 const order=[...savedOrder,...base.map(signature).filter(id=>!savedOrder.includes(id))];
 if(!input.edits||typeof input.edits!=='object'||Array.isArray(input.edits))throw Error('Неверный список правок.');
 for(const [key,p] of Object.entries(input.edits)){const id=resolve(key);if(!ids.has(id))throw Error('Эта пара отсутствует в текущем Атласе.');edits[id]=validatePair(migratePair(p),available);}
 if(input.removed!==undefined&&(!Array.isArray(input.removed)||input.removed.some(k=>!ids.has(resolve(k)))))throw Error('Неверный список удалённых пар.');
 const removed=[...new Set((input.removed||[]).map(resolve))];
 const favorites=(input.favorites||[]).map(p=>validatePair(migratePair(p),available));
 if(new Set(favorites.map(signature)).size!==favorites.length)throw Error('В эталонных есть одинаковые пары.');
 return repairRepeatedObjects({version:2,slots:validateSlots(input.slots.map(migratePair),available),edits,favorites,removed,order:[...order],favoriteIndex:Number.isInteger(input.favoriteIndex)?Math.max(0,Math.min(Math.max(0,favorites.length-1),input.favoriteIndex)):0,mode:['levels','favorites'].includes(input.mode)?input.mode:'all',index:Number.isInteger(input.index)?Math.max(0,Math.min(base.length-1,input.index)):0,level:Number.isInteger(input.level)?Math.max(0,Math.min(9,input.level)):0},data,base);
}
function encodeEditor(state,data){return encodeURIComponent(JSON.stringify(editorState(state,data)));}
function decodeEditor(value,data){return editorState(JSON.parse(decodeURIComponent(value)),data);}
// Count unique unordered combinations, preserving their actual row positions for navigation.
function usageIndex(rows,objects){
 const groups=new Map(),byObject=Object.fromEntries(objects.map(o=>[o.key,[]]));
 rows.forEach((p,index)=>{if(!p)return;const key=signature(p);let g=groups.get(key);if(!g){g={a:p.a,b:p.b,signature:key,positions:[]};groups.set(key,g);}g.positions.push(index);});
 const pairs=[...groups.values()];for(const p of pairs)for(const k of [p.a,p.b])if(byObject[k])byObject[k].push(p);
 const used=Object.values(byObject).filter(a=>a.length).length;
 return {pairs,byObject,used,unused:objects.length-used,total:objects.length,unique:pairs.length,duplicates:pairs.reduce((n,p)=>n+p.positions.length-1,0)};
}
function editorUsage(state,data){
 const all=activeRows(state,data);
 const available=selectableObjects(data);
 return {all:usageIndex(all,available),favorites:usageIndex(state.favorites,available),levels:usageIndex(state.slots,available)};
}
function activeRows(state,data){
 const removed=new Set(state.removed||[]);
 return catalog(data).map(p=>removed.has(signature(p))?null:state.edits[signature(p)]||{a:p.a,b:p.b,reference:p.a});
}
function removePair(state,pair,data){
 const next=editorState(state,data),key=signature(validatePair(pair,selectableObjects(data))),base=catalog(data),removed=new Set(next.removed);
 base.forEach(p=>{if(signature(next.edits[signature(p)]||p)===key)removed.add(signature(p));});
 next.removed=[...removed];next.favorites=next.favorites.filter(p=>signature(p)!==key);next.slots=next.slots.map(p=>p&&signature(p)===key?null:p);
 return editorState(next,data);
}
const api={VERSION,LIMIT,signature,selectableObjects,moveItem,validateSlots,put,catalog,encode,decode,exportSelection,fromExport,validatePair,editorState,encodeEditor,decodeEditor,usageIndex,editorUsage,activeRows,removePair};
if(typeof module!=='undefined')module.exports=api;else root.AtlasPlanner=api;
})(typeof window!=='undefined'?window:globalThis);
