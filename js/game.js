// Patrulla España · motor del juego
(() => {
'use strict';
const D = window.PE_DATA;
const {POLY,OWNLAND,RIVERS,MOUNTAINS,CITIES,UPG,ROLES,DOGNAMES,CTYPES,PROF,NOMBRES,APELL,LOOKS,ANS,TIPS,MIS} = D;
const $ = id => document.getElementById(id);
const C=$('c'), ctx=C.getContext('2d');
const NC=document.createElement('canvas'), nctx=NC.getContext('2d');
const MINI=$('mini'), mctx=MINI.getContext('2d');
let DPR=1, VW=800, VH=600, ZOOM=.9, BASEZ=1, VIGN=null;
function resize(){
  DPR=Math.min(2,window.devicePixelRatio||1); VW=innerWidth; VH=innerHeight;
  C.width=NC.width=Math.round(VW*DPR); C.height=NC.height=Math.round(VH*DPR);
  C.style.width=VW+'px'; C.style.height=VH+'px';
  BASEZ=Math.max(.6,Math.min(1.2,Math.min(VW,VH)/720));
  VIGN=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.hypot(VW,VH)*.6);
  VIGN.addColorStop(0,'rgba(0,0,0,0)'); VIGN.addColorStop(1,'rgba(0,0,10,.45)');
}
addEventListener('resize',resize); resize();

// ================= GEOGRAFÍA =================
const K=1400, LON0=-10, LAT0=44.4, LF=1.3;
const W=Math.round((4.6-LON0)*K), H=Math.round((LAT0-34.8)*K*LF);
const toW=(lo,la)=>[(lo-LON0)*K,(LAT0-la)*K*LF];
const latOf=y=>LAT0-y/(K*LF);
const PATHS={};
for(const k in POLY){ const p=new Path2D(); POLY[k].forEach(([lo,la],i)=>{ const [x,y]=toW(lo,la); i?p.lineTo(x,y):p.moveTo(x,y); }); p.closePath(); PATHS[k]=p; }
const LANDALL=new Path2D(); for(const k in PATHS) LANDALL.addPath(PATHS[k]);
const OWNPATH=new Path2D(); for(const k of OWNLAND) OWNPATH.addPath(PATHS[k]);
const RIVERP=Object.values(RIVERS).map(r=>{ const p=new Path2D(); r.forEach(([lo,la],i)=>{ const [x,y]=toW(lo,la); i?p.lineTo(x,y):p.moveTo(x,y); }); return p; });
const MOUNT=MOUNTAINS.map(([lo,la,r,snow])=>{ const [x,y]=toW(lo,la); return {x,y,r:r*K,snow}; });
const MS=16, MW=Math.ceil(W/MS), MH=Math.ceil(H/MS);
const MC=document.createElement('canvas'); MC.width=MW; MC.height=MH;
{ const m=MC.getContext('2d'); m.scale(1/MS,1/MS); for(const k in PATHS){ m.fillStyle=OWNLAND.includes(k)?'#4a6650':'#3a4152'; m.fill(PATHS[k]); }
  m.strokeStyle='#5d8fc0'; m.lineWidth=60; for(const p of RIVERP) m.stroke(p); }
const MD=MC.getContext('2d').getImageData(0,0,MW,MH).data;
const land=(x,y)=>{ const ix=x/MS|0, iy=y/MS|0; if(ix<0||iy<0||ix>=MW||iy>=MH) return false; return MD[(iy*MW+ix)*4+3]>100; };
function rng(seed){ return ()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

// ================= CIUDADES =================
const CBY={};
const SOUTH=new Set(['malaga','marbella','algeciras','cadiz','sanlucar','huelva','almeria','sevilla','granada','murcia','alicante','palma','valencia']);
CITIES.forEach((c,ci)=>{
  [c.x,c.y]=toW(c.lo,c.la); CBY[c.id]=c; c.mult=1+c.cost/4000;
  c.plaza={x:c.x-105,y:c.y-105,w:210,h:210}; c.drop={x:c.x,y:c.y+12,r:28}; c.pad={x:c.x-60,y:c.y+34,w:120,h:58};
  const R=rng(100+ci), n=Math.floor(c.r/120); c.g=n; c.blocks=[];
  const hmax=12+c.r/16, tiles=SOUTH.has(c.id)?.55:.15, pools=(c.id==='marbella'||c.id==='malaga'||c.id==='palma')?.35:0;
  for(let i=-n;i<n;i++) for(let j=-n;j<n;j++){
    if(i>=-1&&i<=0&&j>=-1&&j<=0) continue;
    const x=c.x+i*120+15, y=c.y+j*120+15;
    const dc=Math.hypot(x+45-c.x,y+45-c.y);
    if(dc>c.r+30 || !land(x+45,y+45)) continue;
    const b={x,y,w:90,h:90,park:R()<.12,bld:[],trees:[]};
    if(b.park) for(let k=0;k<5;k++) b.trees.push({x:x+14+R()*62,y:y+14+R()*62,r:6+R()*6});
    else for(let a=0;a<2;a++) for(let e=0;e<2;e++){ const lx=x+a*45, ly=y+e*45;
      if(R()<.86){ const bw=34+R()*8, bh=34+R()*8, central=1-Math.min(1,dc/c.r);
        b.bld.push({x:lx+(45-bw)/2,y:ly+(45-bh)/2,w:bw,h:bh,hue:c.hue+R()*30-15,s:14+R()*22,l:34+R()*14,
          ht:5+R()*hmax*(.4+central),tile:R()<tiles,pool:R()<pools,ac:R()<.5,lit:R()}); }
      else b.trees.push({x:lx+22,y:ly+22,r:8+R()*4}); }
    c.blocks.push(b);
  }
  c.blocks.forEach(b=>b.bld.sort((p,q)=>p.y-q.y));
});
const HW=D.HIGHWAYS.map(([a,b,label])=>({a:CBY[a],b:CBY[b],label}));
function segDist(px,py,s){ const ax=s.a.x,ay=s.a.y,dx=s.b.x-ax,dy=s.b.y-ay; const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy))); return Math.hypot(px-ax-t*dx,py-ay-t*dy); }
const onHighway=(x,y)=>HW.some(s=>segDist(x,y,s)<26);
const cityAt=(x,y)=>CITIES.find(c=>Math.hypot(x-c.x,y-c.y)<c.r+20)||null;

// Paisaje: campos, bosques, olivares, viñedos y pueblos
const DECOR=[];
{ const R=rng(9); let t=0;
  while(DECOR.length<4200&&t<60000){ t++; const x=R()*W, y=R()*H;
    if(!land(x,y)||cityAt(x,y)||HW.some(s=>segDist(x,y,s)<60)) continue;
    const lat=latOf(y), r=R();
    let k;
    if(lat>42.3) k=r<.65?'forest':r<.9?'field':'village';
    else if(lat<38.3) k=r<.5?'olive':r<.8?'field':r<.95?'scrub':'village';
    else if(lat<40.3) k=r<.4?'vine':r<.85?'field':r<.95?'scrub':'village';
    else k=r<.6?'field':r<.8?'scrub':r<.94?'forest':'village';
    const it={x,y,k,a:R()*Math.PI,w:60+R()*120,h:40+R()*90,hue:R()};
    if(k==='village'){ it.houses=[]; for(let i=0;i<5+R()*6;i++) it.houses.push({x:(R()-.5)*70,y:(R()-.5)*60,w:10+R()*8,h:9+R()*6}); }
    if(k==='forest'){ it.trees=[]; for(let i=0;i<8+R()*8;i++) it.trees.push({x:(R()-.5)*it.w,y:(R()-.5)*it.h,r:6+R()*7}); }
    DECOR.push(it); } }

// ================= ESTADO =================
const SAVEKEY='patrulla-espana-v2';
let S, player, actors=[], crimes=[], peds=[], floats=[], traffic=[], boats=[], raiders=[], truck=null, parts=[], drops=[];
let padT=0, padCur=null, spawnT=2, saveT=0, hudT=0, pedT=0, hintMsg='', near=null, lastHour=0, weather={rain:0,target:0};
function fresh(){ return {money:250,rep:50,time:0,owned:{madrid:{car:0,lvl:1}},up:{},custody:[],carry:[],mis:null,done:[],intel:0,solved:0,auto:false,seen:false,px:null,py:null,nid:1,staff:null,xp:0,stats:{legal:0,nulls:0,conv:0,free:0,earned:0,missions:0},log:[],unread:0,dayEarn:0,lastDay:null,lowfx:false,rainOn:true}; }
const U=id=>S.up[id]||0;
function earn(v){ S.money+=v; S.dayEarn=(S.dayEarn||0)+v; S.stats.earned=(S.stats.earned||0)+v; }
const lvlFromXp=x=>Math.floor(Math.sqrt(x/50))+1;
function addXP(n,why){ const before=lvlFromXp(S.xp); S.xp+=n; const after=lvlFromXp(S.xp); if(after>before){ toast(`¡Subes a nivel ${after} de jefe!${why?' ('+why+')':''}`); } }
const ucost=id=>Math.round(UPG[id].base*Math.pow(UPG[id].k,U(id)));
const staffOf=(role,city)=>S.staff.filter(s=>s.role===role&&(!city||s.city===city));
const agN=c=>staffOf('agente',c).length;
const agMax=c=>3+3*(S.owned[c].lvl||1);
const custCap=()=>8+6*U('cel')+3*S.staff.filter(s=>s.role==='agente'&&s.order==='guardia').length;
const followers=role=>actors.filter(a=>a.st.order==='seguir'&&(!role||a.st.role===role));
const carryCap=()=>2+U('esp')+2*followers('agente').length;
const repMult=()=>.5+S.rep/100;
const agCost=c=>Math.round(120*Math.pow(1.45,agN(c)-1));
const carCost=c=>Math.round(300*Math.pow(1.5,S.owned[c].car));
const lvlCost=c=>Math.round(900*Math.pow(2.4,(S.owned[c].lvl||1)-1));
const lvlOf=st=>Math.min(5,1+Math.floor(st.xp/5));
function serialize(){ if(player){ S.px=player.x; S.py=player.y; } return JSON.parse(JSON.stringify(S)); }
function saveLocal(){ try{ localStorage.setItem(SAVEKEY,JSON.stringify(serialize())); }catch(e){} }
function loadLocal(){ try{ const s=localStorage.getItem(SAVEKEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
const pick=a=>a[Math.floor(Math.random()*a.length)];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const eur=n=>fmt(n)+' €';
const fmt=n=>{ n=Math.max(0,n); return n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'k':Math.floor(n).toLocaleString('es-ES'); };
const SKINS=['#f3d0b0','#e6b48e','#c98e66','#a46a45','#7a4a2c','#553220'];
const HAIRS=['#16100c','#2f1d12','#5a3820','#8c5e34','#c9a46a','#e2cf9a','#8a8a8a','#a33a24'];
function randLook(){ return {skin:pick(SKINS),hair:pick(HAIRS),long:Math.random()<.42,beard:Math.random()<.18}; }
function newStaff(role,city){
  const look=randLook(), nm=pick(NOMBRES)+' '+pick(APELL);
  const pre={agente:'Agente',detective:'Insp.',analista:'',guia:'Agente',jefe:'Subinsp.'}[role];
  const st={id:S.nid++,name:(pre?pre+' ':'')+nm,role,city,order:{agente:'patrulla',jefe:'oficina'}[role]||'oficina',prev:null,xp:0,energy:100,look};
  if(role==='guia') st.dog=pick(DOGNAMES);
  S.staff.push(st); return st;
}
function migrate(){
  if(S.staff) return;
  S.staff=[];
  for(const id in S.owned){ const o=S.owned[id]; o.lvl=o.lvl||1; newStaff('jefe',id); for(let k=0;k<(o.ag||1);k++) newStaff('agente',id); delete o.ag; }
  for(let k=0;k<U('det');k++) newStaff('detective','madrid');
  for(let k=0;k<U('ana');k++) newStaff('analista','madrid');
  for(let k=0;k<U('k9');k++) newStaff('guia','madrid');
}
function init(data){
  const f=fresh();
  S=data&&typeof data.money==='number'?{...f,...data,up:{...(data.up||{})},stats:{...f.stats,...(data.stats||{})},owned:JSON.parse(JSON.stringify(data.owned||f.owned))}:f;
  migrate();
  const m=CBY.madrid; player={x:S.px??m.x,y:S.py??m.y+60,ang:-Math.PI/2,walk:0,mode:'foot',vx:0,vy:0};
  actors=[]; crimes=[]; peds=[]; floats=[]; boats=[]; raiders=[]; truck=null; parts=[]; syncActors();
  traffic=[]; const R=rng(5); for(let i=0;i<90;i++) traffic.push({s:HW[Math.floor(R()*HW.length)],t:R(),dir:R()<.5?1:-1,sp:.02+R()*.03,col:`hsl(${Math.floor(R()*360)} ${40+R()*30}% ${50+R()*15}%)`,truck:R()<.2});
  lastHour=Math.floor(S.time);
  if(S.mis) setupStep();
  $('help').hidden=!!S.seen;
}
function syncActors(){
  const byId=new Map(actors.map(a=>[a.st.id,a]));
  actors=S.staff.map(st=>{ const old=byId.get(st.id); if(old){ old.st=st; return old; }
    const c=CBY[st.city]; return {st,x:c.x+(Math.random()-.5)*150,y:c.y+40+Math.random()*50,ang:Math.random()*6,walk:0,state:'idle',target:null,carry:[],car:false,tx:null,ty:null,wait:Math.random()*2,seed:Math.random()*9,dogx:0,dogy:0}; });
  for(const id in S.owned){ let i=0; for(const a of actors) if(a.st.role==='agente'&&a.st.city===id){ a.car=i<S.owned[id].car; i++; } }
}

// ================= UTILIDADES =================
function float(x,y,text,col){ floats.push({x,y,text,col,t:0}); }
let toastTO=null;
function toast(msg,bad){ if(S&&S.log){ S.log.unshift({h:S.time,msg,bad:!!bad}); if(S.log.length>40) S.log.length=40; S.unread=Math.min(99,(S.unread||0)+1); } const t=$('toast'); t.textContent=msg; t.classList.toggle('bad',!!bad); t.classList.add('show'); clearTimeout(toastTO); toastTO=setTimeout(()=>t.classList.remove('show'),3200); }
const hourOfDay=()=>(S.time+8)%24;
function darkness(){ const h=hourOfDay(); const c=Math.cos((h-13)/12*Math.PI); return Math.max(0,Math.min(1,(-c+.25)/1.1))*.62+weather.rain*.12; }
const isNight=()=>darkness()>.3;
function moveTo(o,tx,ty,sp,dt){ const dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy); if(d<.5) return true; const st=sp*dt; o.ang=Math.atan2(dy,dx); o.walk=(o.walk||0)+dt*sp/12; if(d<=st){o.x=tx;o.y=ty;return true;} o.x+=dx/d*st; o.y+=dy/d*st; return false; }
const inPlaza=(c,x,y,m=0)=>x>c.plaza.x-m&&x<c.plaza.x+c.plaza.w+m&&y>c.plaza.y-m&&y<c.plaza.y+c.plaza.h+m;
function stationHere(){ const c=cityAt(player.x,player.y); return c&&S.owned[c.id]&&inPlaza(c,player.x,player.y,20)?c:null; }
const makeName=()=>pick(NOMBRES)+' '+pick(APELL)+' '+pick(APELL);
function makeDNI(){ const n=10000000+Math.floor(Math.random()*89999999); return n+'-'+'TRWAGMYFPDXBNJZSQVHLCKE'[n%23]; }
function newDetainee(o){ return Object.assign({id:S.nid++,h:0,lawyer:false,lawyerAt:2+Math.floor(Math.random()*4)-U('conv')*.6,interrog:0,coerced:false,tainted:false,rights:true,intelGiven:false},o); }
const detBonus=()=>followers('detective').length?12:0;
function dogAvailable(){ if(followers('guia').length) return true; const c=cityAt(player.x,player.y); return !!c&&S.staff.some(s=>s.role==='guia'&&s.city===c.id&&s.order!=='descanso'); }

// ================= DELITOS =================
function roadPoint(c){
  for(let tries=0;tries<20;tries++){
    const horiz=Math.random()<.5, k=Math.floor(Math.random()*(2*c.g+1))-c.g, off=k*120, L=Math.sqrt(Math.max(0,c.r*c.r-off*off))-20;
    if(L<40) continue; const a=(Math.random()*2-1)*L;
    const x=horiz?c.x+a:c.x+off, y=horiz?c.y+off:c.y+a;
    if(!land(x,y)||inPlaza(c,x,y,30)) continue; return {x,y,horiz};
  } return null;
}
function spawnCrime(c){
  const p=roadPoint(c); if(!p) return;
  let tot=CTYPES.reduce((s,t)=>s+t.w,0), r=Math.random()*tot, T=CTYPES[0]; for(const t of CTYPES){ if((r-=t.w)<=0){T=t;break;} }
  crimes.push({city:c.id,x:p.x,y:p.y,T,horiz:p.horiz,dir:Math.random()<.5?1:-1,progress:0,life:T.life,max:T.life,taken:null,reward:T.rw*c.mult*(isNight()?1.3:1),looks:[randLook(),randLook()]});
}
function crimeDone(cr){ const i=crimes.indexOf(cr); if(i>=0) crimes.splice(i,1); const fine=cr.reward*.3*repMult(); earn(fine); S.rep=Math.min(100,S.rep+.5); float(cr.x,cr.y-26,'+$'+fmt(fine),'#ffc94a'); }
function crimeDetainees(cr,rights,bonus=0){
  const out=[]; for(let k=0;k<cr.T.s;k++) out.push(newDetainee({name:makeName(),crime:cr.T.n,art:cr.T.art,ev:58+bonus,rights,value:cr.reward*1.2/cr.T.s,intelCap:!!cr.T.intel||Math.random()<.2,city:cr.city}));
  return out;
}
function dropAt(c,u){ let n=0; while(u.carry.length&&S.custody.length<custCap()){ S.custody.push(u.carry.pop()); n++; } if(n) float(c.drop.x,c.drop.y-30,'+'+n+' a calabozos','#7fb3ff'); return n; }

// ================= PEATONES =================
const CLOTH=['#c0392b','#2e86de','#27ae60','#8e44ad','#f39c12','#e8e8e8','#34495e','#d35400','#16a085','#7f8c8d','#e84393','#222'];
function spawnPed(c){
  const p0=roadPoint(c); if(!p0) return;
  let tot=PROF.reduce((s,t)=>s+t.w,0), r=Math.random()*tot, pr='normal'; for(const t of PROF){ if((r-=t.w)<=0){pr=t.id;break;} }
  const ped={city:c.id,x:p0.x,y:p0.y,axis:p0.horiz?'h':'v',dir:Math.random()<.5?1:-1,sp:25+Math.random()*20,side:Math.random()<.5?-11:11,
    prof:pr,name:makeName(),dni:makeDNI(),age:18+Math.floor(Math.random()*55),look:pick(LOOKS),body:pick(CLOTH),lk:randLook(),walk:Math.random()*6,
    ind:false,indWhy:'',idChecked:false,searched:false,found:null,tainted:false,asked:0,dog:false,log:[],susT:4+Math.random()*10,showSus:0,stop:0,umb:Math.random()<.5};
  ped.cell=Math.floor(((p0.horiz?p0.x-c.x:p0.y-c.y))/120);
  peds.push(ped);
}
function managePeds(){
  for(const c of CITIES){ const d=Math.hypot(player.x-c.x,player.y-c.y);
    if(d<c.r+700){ const want=Math.round(c.r/28); let n=0; for(const p of peds) if(p.city===c.id) n++; for(;n<want;n++) spawnPed(c); } }
  peds=peds.filter(p=>{ const c=CBY[p.city]; return Math.hypot(player.x-c.x,player.y-c.y)<c.r+1000; });
}
function updatePeds(dt){
  for(const p of peds){
    const c=CBY[p.city];
    if(p.showSus>0) p.showSus-=dt;
    if(p.prof==='camello'||p.prof==='carterista'){ p.susT-=dt; if(p.susT<=0){ p.susT=9+Math.random()*10; p.showSus=3;
        if(dist(p,player)<300&&!p.ind){ p.ind=true; p.indWhy=p.prof==='camello'?'le has visto hacer un intercambio de algo pequeño por dinero':'le has visto meter la mano en un bolso ajeno'; p.log.push('Lo has visto actuar de forma sospechosa'); toast('Has visto algo sospechoso. Esa persona tiene indicios'); } } }
    if(p.stop>0){ p.stop-=dt; continue; }
    p.walk+=dt*p.sp/10;
    const s=p.sp*dt*p.dir; if(p.axis==='h') p.x+=s; else p.y+=s;
    const along=p.axis==='h'?p.x-c.x:p.y-c.y, cell=Math.floor(along/120);
    if(cell!==p.cell){ const snap=(p.dir>0?cell:cell+1)*120; p.cell=cell;
      if(Math.random()<.35){ if(p.axis==='h'){ p.x=c.x+snap; p.axis='v'; p.cell=Math.floor((p.y-c.y)/120); } else { p.y=c.y+snap; p.axis='h'; p.cell=Math.floor((p.x-c.x)/120); } p.dir=Math.random()<.5?1:-1; } }
    if(Math.hypot(p.x-c.x,p.y-c.y)>c.r-8||!land(p.x,p.y)){ p.dir*=-1; if(p.axis==='h') p.x+=p.sp*dt*p.dir*2; else p.y+=p.sp*dt*p.dir*2; }
  }
}
const pedPos=p=>p.axis==='h'?{x:p.x,y:p.y+p.side}:{x:p.x+p.side,y:p.y};
const pedAng=p=>p.axis==='h'?(p.dir>0?0:Math.PI):(p.dir>0?Math.PI/2:-Math.PI/2);

// ================= INTERACCIÓN CON PERSONAS =================
function pedModal(p){
  p.stop=9999;
  const items=p.found;
  const html=`
   <div class="ficha">
     <div><b>${p.idChecked?p.name:'Persona sin identificar'}</b> · ${p.age} años · ${p.look}</div>
     ${p.idChecked?`<div>DNI ${p.dni} · Antecedentes: ${p.prof==='camello'||p.prof==='carterista'?'sí, por hechos similares':'no constan'}</div>`:''}
     ${p.idChecked&&p.prof==='buscado'?'<div style="color:#ff8b97"><b>REQUISITORIA JUDICIAL EN VIGOR</b> · orden de busca y captura</div>':''}
     ${items?`<div>Cacheo: ${items.length?items.join(', '):'nada ilícito'}${p.tainted?' <span style="color:#ff8b97">(prueba ilícita)</span>':''}</div>`:''}
   </div>
   ${p.log.length?`<ul class="log">${p.log.slice(-5).map(l=>`<li>${l}</li>`).join('')}</ul>`:''}
   <div class="legal">Indicios para cachear: ${p.ind?`<b style="color:var(--ok)">sí</b>, ${p.indWhy}`:'<b>no</b>. Cachear sin motivo es ilegal y anula lo que encuentres.'}</div>`;
  const acts=[];
  if(!p.idChecked) acts.push({l:'Identificar (pedir DNI)',fn:()=>{ p.idChecked=true; p.log.push('Le pides la documentación (identificación en vía pública).');
    if(p.prof==='buscado'){ p.ind=true; p.indWhy='tiene una requisitoria judicial'; p.log.push('La base de datos devuelve una requisitoria en vigor.'); } pedModal(p); }});
  if(p.asked<2) acts.push({l:'Preguntar qué hace aquí',fn:()=>{ p.asked++; const a=pick(ANS[p.prof]); p.log.push('«'+a+'»');
    const ch={camello:.55,carterista:.5,buscado:.4,nervioso:.45,consumidor:.25,navaja:.2,normal:.03}[p.prof]+(followers('detective').length?.15:0);
    if(!p.ind&&Math.random()<ch){ p.ind=true; p.indWhy='se contradice y está muy nervioso'; p.log.push('Notas contradicciones en su relato.'); } pedModal(p); }});
  if(dogAvailable()&&!p.dog) acts.push({l:'Pasar al perro',fn:()=>{ p.dog=true; if(p.prof==='camello'||p.prof==='consumidor'){ p.ind=true; p.indWhy='el perro ha marcado droga'; p.log.push('El perro marca: olor a droga.'); } else p.log.push('El perro no marca nada.'); pedModal(p); }});
  if(!p.searched) acts.push({l:p.ind?'Cachear (hay indicios)':'Cachear sin indicios',cls:p.ind?'':'bad',fn:()=>{
    p.searched=true; const it=({camello:['22 papelinas de cocaína','640 € en billetes pequeños'],carterista:['3 carteras que no son suyas'],consumidor:['1 g de hachís'],navaja:['navaja de 14 cm'],buscado:[]}[p.prof]||[]).slice();
    it.kind=p.prof==='camello'||p.prof==='carterista'?'delito':it.length?'admin':'none'; p.found=it;
    if(!p.ind){ p.tainted=true; S.rep=Math.max(0,S.rep-4); p.log.push('Cacheo sin indicios: la persona pone una queja. −4 reputación.'); }
    else p.log.push(it.length?'Encuentras: '+it.join(', ')+'.':'El cacheo es negativo. Tenías motivos, así que fue legal.');
    pedModal(p); }});
  if(items&&items.kind==='admin'&&!p.fined) acts.push({l:'Proponer sanción (LO 4/2015)',fn:()=>{ p.fined=true; const v=30*repMult();
    if(p.tainted) p.log.push('La sanción no prosperará: la prueba se obtuvo sin indicios.'); else { earn(v); S.rep=Math.min(100,S.rep+1); p.log.push(`Se tramita la propuesta de sanción e intervienes el objeto. +${eur(v)}`); }
    pedModal(p); }});
  const full=S.carry.length>=carryCap();
  acts.push({l:full?'Detener (esposas llenas)':'Leer derechos y detener',cls:'go',dis:full,fn:()=>arrestPed(p,true)});
  if(!full) acts.push({l:'Detener sin leer derechos',cls:'bad',fn:()=>arrestPed(p,false)});
  acts.push({l:'Dejar marchar',fn:()=>{ p.stop=0; closeModal(); }});
  openModal({title:'Control en la vía pública',html,acts});
}
function arrestPed(p,rights){
  const items=p.found, wanted=p.idChecked&&p.prof==='buscado', delito=items&&items.kind==='delito', c=CBY[p.city];
  if(!wanted&&!delito){
    S.rep=Math.max(0,S.rep-10); S.money=Math.max(0,S.money-300); peds.splice(peds.indexOf(p),1); closeModal();
    toast('Detención ilegal: no había indicios de delito (art. 17 CE). −10 reputación, −300 €',true); return;
  }
  const crime=wanted?'Requisitoria judicial':p.prof==='camello'?'Tráfico de drogas':'Hurto';
  const art=wanted?'art. 490 LECrim':p.prof==='camello'?'art. 368 CP':'art. 234 CP';
  const value=({camello:200,carterista:120}[p.prof]||180)*c.mult;
  S.carry.push(newDetainee({name:p.name,crime,art,ev:(wanted?80:62)+detBonus(),rights,tainted:p.tainted,value,intelCap:p.prof==='camello'||wanted,city:p.city}));
  peds.splice(peds.indexOf(p),1); closeModal();
  if(rights&&!p.tainted){ S.stats.legal++; addXP(12,'detención legal'); toast(`Detenido: ${p.name} (${crime}). Derechos leídos`); missionEvent('arrest',{city:p.city,profile:p.prof}); }
  else toast(`Detenido ${p.name}, pero ${!rights?'sin leerle los derechos':'con una prueba ilícita'}: el juez puede anularlo`,true);
}
function crimeModal(cr){
  const finish=rights=>{ crimeDone(cr); const ds=crimeDetainees(cr,rights,detBonus()); S.carry.push(...ds); closeModal();
    if(rights){ S.stats.legal+=ds.length; addXP(8*ds.length); ds.forEach(()=>missionEvent('arrest',{city:cr.city,profile:'crimen'})); toast(`${cr.T.n}: ${ds.length} detenido(s), derechos leídos`); }
    else toast('Detenido sin leerle sus derechos: el juez anulará la detención',true); };
  const acts=[{l:'Leer derechos y detener (art. 520 LECrim)',cls:'go',fn:()=>finish(true)},{l:'Detener sin leer derechos',cls:'bad',fn:()=>finish(false)}];
  if(cr.T.minor) acts.push({l:'Denunciar y dejar en libertad (citación a juicio)',fn:()=>{ crimeDone(cr); closeModal(); S.rep=Math.min(100,S.rep+.5); toast('Denuncia tramitada. Queda citado a juicio'); }});
  openModal({title:cr.T.n+' en flagrante delito',html:`
    <div class="ficha"><div><b>${cr.T.n}</b> · ${cr.T.art} · ${cr.T.s} sospechoso(s)</div><div>Lugar: ${CBY[cr.city].n}</div></div>
    <div class="legal">Le has sorprendido cometiendo el delito, así que la detención está justificada. Al detener, informa siempre de sus derechos: guardar silencio, abogado e intérprete.</div>
    <label class="chk"><input type="checkbox" id="autoR" ${S.auto?'checked':''}> Leer derechos siempre sin preguntar en delitos flagrantes</label>`,acts});
  const cb=$('autoR'); if(cb) cb.onchange=()=>{ S.auto=cb.checked; };
}

// ================= PLANTILLA: ÓRDENES =================
const ORDERTXT={patrulla:'Patrullando',seguir:'Te acompaña',guardia:'De guardia en calabozos',descanso:'Descansando',oficina:'En la oficina',traslado:'Trasladándose'};
function setOrder(st,order,dest){
  const a=actors.find(x=>x.st.id===st.id);
  if(order==='traslado'){ if(!dest||dest===st.city) return; st.city=dest; st.order=st.role==='agente'?'patrulla':'oficina'; if(a){ a.state='travel'; a.target=null; a.carry.length&&S.carry.length<carryCap()&&0; } syncActors(); toast(`${st.name} se traslada a ${CBY[dest].n}`); return; }
  if(order==='seguir'&&followers().length>=4){ toast('Ya te acompañan 4 personas. Manda a alguien a otra tarea',true); return; }
  st.order=order; if(a){ a.state='idle'; if(a.target){ a.target.taken=null; a.target=null; } }
  toast(`${st.name}: ${ORDERTXT[order].toLowerCase()}`);
}
function staffModal(st){
  const R=ROLES[st.role], a=actors.find(x=>x.st.id===st.id), lv=lvlOf(st);
  const c=CBY[st.city];
  let extra='';
  if(st.role==='jefe'){
    const ag=staffOf('agente',st.city), tired=ag.filter(s=>s.energy<30).length, act=crimes.filter(x=>x.city===st.city).length;
    extra=`<div class="ficha"><div>Comisaría de ${c.n} · nivel ${S.owned[st.city].lvl||1}</div><div>Agentes: ${ag.length}/${agMax(st.city)} · cansados: ${tired}</div><div>Avisos abiertos en la ciudad: ${act}</div><div>Calabozos: ${S.custody.length}/${custCap()}</div></div>
      <div class="legal">«${pick(TIPS)}»</div>`;
  }
  const acts=R.orders.filter(([o])=>o!==st.order).map(([o,l])=>({l,fn:()=>{ setOrder(st,o); closeModal(); }}));
  const others=Object.keys(S.owned).filter(id=>id!==st.city);
  if(st.role!=='jefe'&&others.length) acts.push({l:'Trasladar a otra comisaría…',fn:()=>{
    openModal({title:'Trasladar a '+st.name,html:'<div class="note">Elige destino. Viajará por carretera.</div>',acts:[...others.map(id=>({l:CBY[id].n,fn:()=>{ setOrder(st,'traslado',id); closeModal(); }})),{l:'Cancelar',fn:()=>staffModal(st)}]}); }});
  if(st.energy<100&&st.order!=='descanso'&&!st.cheered){ acts.push({l:'Felicitar por su trabajo',fn:()=>{ st.cheered=true; st.energy=Math.min(100,st.energy+15); toast(st.name+' agradece el reconocimiento'); staffModal(st); }}); }
  acts.push({l:'Cerrar',cls:'go',fn:closeModal});
  openModal({title:st.name,html:`
    <div class="who"><div class="avatar" style="background:${R.color}">${st.name.split(' ').slice(-2).map(w=>w[0]).join('')}</div>
      <div><b>${R.n}</b> · ${c.n} · nivel ${lv}${st.dog?` · perro: ${st.dog}`:''}<div class="d">${ORDERTXT[st.order]||st.order}${a&&a.state==='travel'?' (en camino)':''}</div></div></div>
    <div><span class="k">Energía ${Math.round(st.energy)} %</span><div class="energy" style="max-width:none"><i style="width:${st.energy}%;background:${st.energy<30?'var(--siren)':'var(--ok)'}"></i></div></div>
    <div><span class="k">Experiencia ${st.xp} casos</span><div class="energy" style="max-width:none"><i style="width:${(st.xp%5)*20}%;background:var(--gold)"></i></div></div>
    ${extra}
    <div class="note">${{agente:'Si te acompaña, puedes llevar 2 detenidos más y reduces antes a los sospechosos.',detective:'Si te acompaña, detecta contradicciones y tus detenciones llegan con más pruebas.',guia:'Si te acompaña, puedes pasar al perro en cualquier sitio.',analista:'Cada 8 horas aporta datos de inteligencia para las misiones.',jefe:'Coordina la comisaría y te informa del turno.'}[st.role]}</div>`,acts});
}

// ================= CUSTODIA, JUEZ, INTERROGATORIO =================
function court(d){
  const i=S.custody.indexOf(d); if(i>=0) S.custody.splice(i,1);
  missionEvent('court',{});
  if(!d.rights||d.tainted){ S.stats.nulls++; S.rep=Math.max(0,S.rep-6); toast(`${d.name}: el juez anula la detención (${!d.rights?'no se le leyeron los derechos':'prueba obtenida sin indicios'}). −6 reputación`,true); return; }
  const ev=d.ev-(d.coerced?30:0);
  if(ev>=50){ const pay=d.value*(.6+ev/100)*repMult(); earn(pay); S.rep=Math.min(100,S.rep+2); S.solved++; S.stats.conv++; addXP(15); toast(`Condena para ${d.name} · +${eur(pay)}${d.coerced?' (declaración anulada por coacción)':''}`); }
  else { S.stats.free++; earn(d.value*.15); S.rep=Math.max(0,S.rep-1); toast(`${d.name}: libertad por falta de pruebas (${Math.round(ev)} %)`,true); }
}
function detectiveWork(st){
  const d=S.custody.find(x=>x.lawyer&&x.interrog<1&&x.rights&&!x.tainted);
  if(d){ d.interrog++; d.ev=Math.min(100,d.ev+12+lvlOf(st)*2); st.xp++; if(d.intelCap&&!d.intelGiven&&Math.random()<.35){ d.intelGiven=true; S.intel++; toast(`${st.name} obtiene información útil (+1 inteligencia)`); } return true; }
  const r=S.custody.find(x=>x.ev>=70||x.h>=56||!x.rights||x.tainted); if(r){ court(r); st.xp++; return true; } return false;
}
function hourTick(){
  for(const d of [...S.carry,...S.custody]){ d.h++; if(!d.lawyer&&d.h>=d.lawyerAt) d.lawyer=true; }
  for(const d of S.custody) d.ev=Math.min(100,d.ev+3*U('lab'));
  for(const list of [S.carry,S.custody]) for(let i=list.length-1;i>=0;i--){ const d=list[i]; if(d.h>72){ list.splice(i,1); S.rep=Math.max(0,S.rep-10); toast(`${d.name} supera las 72 h sin pasar al juez (art. 17.2 CE). Queda libre. −10 reputación`,true); } }
  for(const st of S.staff){ if(st.role==='detective'&&st.order==='oficina'&&st.energy>15) detectiveWork(st); }
  const ana=S.staff.filter(s=>s.role==='analista'&&s.order==='oficina');
  if(ana.length&&Math.floor(S.time)%8===0){ S.intel+=ana.length; ana.forEach(s=>s.xp++); toast(`Tus analistas aportan ${ana.length} dato(s) de inteligencia`); }
  if(Math.floor(S.time)%24===0){ S.staff.forEach(s=>s.cheered=false); S.lastDay=S.dayEarn; S.dayEarn=0; }
  if(Math.floor(S.time)%6===0) weather.target=S.rainOn&&Math.random()<.22?1:0;
  if(S.mis){ const st=curStep(); if(st&&st.t==='warrant'&&S.mis.d.ready&&S.time>=S.mis.d.ready){ toast('El juzgado concede la orden de entrada y registro (art. 18.2 CE)'); advance(); } }
}
function interrogate(d){
  const st={turns:3+U('sala'),coop:25+U('sala')*8+(d.ev>60?10:0),silent:false,log:[]};
  const turn=fn=>{ fn(); st.turns--; st.coop=Math.max(0,Math.min(100,st.coop));
    if(!st.silent&&st.turns>0&&Math.random()<.13){ st.silent=true; st.log.push(['Se acoge a su derecho a no declarar (art. 520.2 LECrim). Debes respetarlo.','']); }
    render(); };
  const end=()=>{ d.interrog++; closeModal(); renderPanel(); };
  function render(){
    const acts=st.turns>0&&!st.silent?[
      {l:'Preguntar por los hechos',fn:()=>turn(()=>{ if(Math.random()<st.coop/100+.15){ d.ev=Math.min(100,d.ev+8); st.log.push(['Da detalles que encajan con las pruebas. +8 % pruebas','ok']); } else st.log.push(['Responde con evasivas.','']); st.coop+=6; })},
      {l:'Mostrarle las pruebas',fn:()=>turn(()=>{ if(d.ev>=50&&Math.random()<.3+st.coop/200){ d.ev=Math.min(100,d.ev+20); st.log.push(['Ante las pruebas, reconoce los hechos. +20 % pruebas','ok']); } else { st.log.push(['Lo niega todo.','']); st.coop+=d.ev>=50?8:-4; } })},
      {l:'Explicar el atenuante por colaborar (art. 21.4 CP)',fn:()=>turn(()=>{ if(d.intelCap&&!d.intelGiven&&Math.random()<st.coop/100+.15){ d.intelGiven=true; S.intel++; st.log.push(['Da un nombre y un lugar. +1 inteligencia','ok']); } else { st.log.push([d.intelCap?'Duda… todavía no suelta nada.':'No parece saber nada más.','']); st.coop+=10; } })},
      {l:'Presionar y amenazar',cls:'bad',fn:()=>turn(()=>{ d.coerced=true; d.ev=Math.min(100,d.ev+30); S.rep=Math.max(0,S.rep-8); st.log.push(['Confiesa bajo presión. Es una declaración nula por coacción (art. 15 y 24 CE). −8 reputación','bad']); st.turns=1; })},
      {l:'Terminar',fn:end}]:[{l:'Terminar interrogatorio',cls:'go',fn:end}];
    openModal({title:'Interrogatorio · '+d.name,html:`
      <div class="ficha"><div>${d.crime} · ${d.art}</div><div>Pruebas ${Math.round(d.ev)} % · Abogado ${d.lawyer?'presente':'ausente'} · Turnos ${st.turns}</div></div>
      <div><span class="k">Colaboración</span><div class="bar"><i style="width:${st.coop}%;background:var(--blue)"></i></div></div>
      ${st.log.length?`<ul class="log">${st.log.map(([t,c])=>`<li class="${c}">${t}</li>`).join('')}</ul>`:'<div class="note">El abogado está presente. Recuerda que el detenido puede no declarar.</div>'}`,acts});
  }
  if(!d.lawyer){
    openModal({title:'Falta el abogado',html:`<div class="legal">${d.name} aún no tiene abogado. Tomarle declaración sin letrado vulnera el art. 520.2.c de la LECrim y la declaración será nula.</div><div class="note">Su abogado de oficio llegará en unas ${Math.max(1,Math.ceil(d.lawyerAt-d.h))} h.</div>`,
      acts:[{l:'Esperar al abogado',cls:'go',fn:()=>closeModal()},{l:'Interrogar igualmente',cls:'bad',fn:()=>{ d.coerced=true; S.rep=Math.max(0,S.rep-5); toast('Declaración sin abogado: será nula. −5 reputación',true); render(); }}]});
  } else render();
}

// ================= MISIONES =================
const MBY={}; MIS.forEach(m=>MBY[m.id]=m);
function stepText(s){
  if(s.txt) return s.txt;
  return {own:`Abre la comisaría de ${CBY[s.city]&&CBY[s.city].n}`, up:`Consigue: ${UPG[s.id]&&UPG[s.id].n} (Centro de mando)`, intel:`Reúne ${s.n} dato(s) de inteligencia interrogando con abogado`,
    warrant:'Pide la orden judicial en el Centro de mando y espera al juez', goto:`Ve a ${CBY[s.city]&&CBY[s.city].n}`}[s.t]||'';
}
const curMis=()=>S.mis?MBY[S.mis.id]:null;
const curStep=()=>{ const m=curMis(); return m?m.steps[S.mis.i]:null; };
const misAvail=m=>!S.done.includes(m.id)&&m.pre.every(p=>S.done.includes(p));
function startMission(id){ S.mis={id,i:0,p:0,d:{}}; setupStep(); toast('Misión: '+MBY[id].n); saveLocal(); }
function abandonMission(){ S.mis=null; boats=[]; raiders=[]; truck=null; }
function stepPoint(s){ const c=CBY[s.city]; return {x:c.x+s.off[0],y:c.y+s.off[1]}; }
function setupStep(){
  boats=[]; raiders=[]; truck=null; const s=curStep(); if(!s) return;
  S.mis.d=S.mis.d||{};
  if(s.t==='boats'){ const [cx,cy]=toW(...s.at); const left=s.n-(S.mis.p||0);
    for(let k=0;k<left;k++){ for(let t=0;t<60;t++){ const a=Math.random()*7, r=100+Math.random()*450, x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r; if(!land(x,y)){ boats.push({x,y,cx,cy,ang:Math.random()*7,sp:150+Math.random()*50}); break; } } } }
  if(s.t==='follow'){ const a=CBY[s.from]; truck={x:a.x+40,y:a.y+140,started:false,close:0,ang:0}; }
  if(s.t==='raid') S.mis.d.spawned=false;
}
function advance(){
  const m=curMis(); S.mis.i++; S.mis.p=0; S.mis.d={};
  if(S.mis.i>=m.steps.length){ S.done.push(m.id); earn(m.rw); S.rep=Math.min(100,S.rep+m.rep); S.stats.missions++; addXP(80+m.rw/20,'misión'); S.mis=null; boats=[]; raiders=[]; truck=null;
    followers().forEach(a=>a.st.xp+=2); toast(`Misión completada: ${m.n} · +${eur(m.rw)}`); saveLocal(); return; }
  setupStep(); toast('Siguiente objetivo: '+stepText(curStep()));
}
function missionEvent(type,data){
  const s=curStep(); if(!s) return;
  if(type==='arrest'&&s.t==='arrest'&&data.city===s.city&&(!s.profile||s.profile===data.profile)) S.mis.p++;
  if(type==='court'&&s.t==='court') S.mis.p++;
}
function updateMission(dt){
  const s=curStep(); if(!s) return;
  if(s.t==='goto'){ if(dist(player,CBY[s.city])<CBY[s.city].r) advance(); }
  else if(s.t==='own'){ if(S.owned[s.city]) advance(); }
  else if(s.t==='up'){ if(U(s.id)>0) advance(); }
  else if(s.t==='arrest'||s.t==='court'){ if(S.mis.p>=s.n) advance(); }
  else if(s.t==='intel'){ if(S.intel>=s.n){ S.intel-=s.n; advance(); } }
  else if(s.t==='inspect'){
    const done=S.mis.d.done||(S.mis.d.done=[]); const c=CBY[s.city];
    const i=s.pts.findIndex((p,k)=>!done.includes(k)&&Math.hypot(player.x-c.x-p[0],player.y-c.y-p[1])<36);
    if(i>=0){ S.mis.d.hold=(S.mis.d.hold||0)+dt; hintMsg='Inspeccionando: '+s.names[i]+'…';
      if(S.mis.d.hold>=2){ S.mis.d.hold=0; done.push(i); toast(s.names[i]+(s.city==='valencia'?(i===2?': el perro marca. Hay cocaína entre la fruta':': limpio'):': anotas matrículas y horarios')); if(done.length>=s.pts.length) advance(); } }
    else S.mis.d.hold=0;
  }
  else if(s.t==='warrant'){ hintMsg=!S.mis.d.ready?'Pide la orden judicial en el Centro de mando de cualquier comisaría':`Esperando la orden del juez (${Math.max(0,Math.ceil(S.mis.d.ready-S.time))} h)`; }
  else if(s.t==='raid'){
    const P=stepPoint(s);
    if(!S.mis.d.spawned&&dist(player,P)<170){ S.mis.d.spawned=true; for(let k=0;k<s.n-(S.mis.p||0);k++) raiders.push({x:P.x+(Math.random()-.5)*60,y:P.y+(Math.random()-.5)*60,cx:P.x,cy:P.y,ang:Math.random()*7,walk:0,lk:randLook()}); toast('¡Policía! Entrada y registro con orden judicial. Detén a todos'); }
    const helpers=followers('agente');
    for(let k=raiders.length-1;k>=0;k--){ const r=raiders[k]; const dx=r.x-player.x, dy=r.y-player.y, d=Math.hypot(dx,dy)||1;
      let vx=Math.cos(r.ang), vy=Math.sin(r.ang); if(d<200){ vx=dx/d; vy=dy/d; } else r.ang+=(Math.random()-.5)*dt*4;
      const nx=r.x+vx*130*dt, ny=r.y+vy*130*dt; if(Math.hypot(nx-r.cx,ny-r.cy)<260&&land(nx,ny)){ r.x=nx; r.y=ny; r.ang=Math.atan2(vy,vx); r.walk+=dt*12; } else r.ang+=Math.PI*(.5+Math.random());
      const caught=d<24||helpers.some(h=>dist(h,r)<22);
      if(caught){ raiders.splice(k,1); S.mis.p++; const c=CBY[s.city]; S.custody.push(newDetainee({name:makeName(),crime:'Organización criminal',art:'art. 570 bis CP',ev:75,rights:true,value:400*c.mult,intelCap:true,city:s.city})); earn(60*c.mult); float(r.x,r.y-20,'Detenido','#4fd18b'); } }
    // los agentes que te acompañan persiguen a los sospechosos
    helpers.forEach((h,i)=>{ const r=raiders[i%Math.max(1,raiders.length)]; if(r) h.chase=r; });
    if(S.mis.d.spawned&&S.mis.p>=s.n){ helpers.forEach(h=>h.chase=null); advance(); }
  }
  else if(s.t==='boats'){
    for(let k=boats.length-1;k>=0;k--){ const b=boats[k]; b.ang+=(Math.random()-.5)*dt*1.5;
      const pd=dist(b,player); if(pd<260&&player.mode==='boat') b.ang=Math.atan2(b.y-player.y,b.x-player.x)+(Math.random()-.5)*.6;
      const nx=b.x+Math.cos(b.ang)*b.sp*dt, ny=b.y+Math.sin(b.ang)*b.sp*dt;
      if(!land(nx,ny)&&Math.hypot(nx-b.cx,ny-b.cy)<700){ b.x=nx; b.y=ny; } else b.ang+=Math.PI*(.6+Math.random()*.8);
      if(Math.random()<.5) parts.push({x:b.x-Math.cos(b.ang)*24,y:b.y-Math.sin(b.ang)*24,vx:0,vy:0,t:0,life:1.2,k:'wake'});
      if(pd<34&&player.mode==='boat'){ boats.splice(k,1); S.mis.p++; const v=350*repMult(); earn(v); S.custody.push(newDetainee({name:makeName(),crime:'Contrabando de hachís',art:'art. 368 CP',ev:85,rights:true,value:300,intelCap:true,city:'algeciras'})); float(b.x,b.y-20,'Fardos intervenidos +$'+fmt(v),'#4fd18b'); } }
    if(!U('mar')) hintMsg='Necesitas la Unidad marítima para salir al mar';
    if(S.mis.p>=s.n) advance();
  }
  else if(s.t==='follow'&&truck){
    const to=CBY[s.to]; const d=dist(player,truck);
    if(!truck.started){ if(d<450){ truck.started=true; toast('El camión arranca. Síguelo de lejos'); } }
    else { moveTo(truck,to.x-200,to.y+200,190,dt);
      if(d<80){ truck.close+=dt; hintMsg='¡Demasiado cerca! Te van a ver'; if(truck.close>1.5){ toast('El conductor te ha visto. El camión vuelve al puerto',true); setupStep(); } } else truck.close=0;
      if(d>900){ toast('Has perdido el camión. Vuelve a empezar en el puerto',true); setupStep(); }
      if(truck&&dist(truck,{x:to.x-200,y:to.y+200})<10) advance(); }
  }
}
function misTarget(){
  const s=curStep(); if(!s) return null;
  const near=()=>{ let best=null,bd=1e12; for(const id in S.owned){ const c=CBY[id], d=dist(player,c); if(d<bd){bd=d;best=c;} } return best; };
  if(s.t==='goto'||s.t==='own'||s.t==='arrest') return CBY[s.city]||null;
  if(s.t==='up'||s.t==='court'||s.t==='intel'||(s.t==='warrant'&&!S.mis.d.ready)) return near();
  if(s.t==='inspect'){ const c=CBY[s.city], done=S.mis.d.done||[]; const k=s.pts.findIndex((p,i)=>!done.includes(i)); return k<0?null:{x:c.x+s.pts[k][0],y:c.y+s.pts[k][1]}; }
  if(s.t==='raid') return stepPoint(s);
  if(s.t==='boats'){ let b=null,bd=1e12; for(const x of boats){ const d=dist(player,x); if(d<bd){bd=d;b=x;} } return b; }
  if(s.t==='follow') return truck;
  return null;
}

// ================= ENTRADA =================
const keys=new Set(); let joy=null;
const paused=()=>!$('panel').hidden||!$('modal').hidden||!$('help').hidden||!$('confirm').hidden;
const frozen=()=>!$('modal').hidden&&$('mTitle').textContent==='Pausa';
function interact(){ if(!near) return; if(near.kind==='ped') pedModal(near.ref); else staffModal(near.ref.st); }
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(k==='escape'){ if(!$('modal').hidden){ const p=peds.find(x=>x.stop>999); if(p) p.stop=0; closeModal(); } else if(!$('panel').hidden) $('panel').hidden=true; return; }
  if(paused()) return;
  if(k==='e'){ if(inHub){ closeHub(); return; } if(near) interact(); else if(stationHere()) openHub(stationHere()); else openPanel(); return; }
  if(k==='m'){ openPanel('mis'); return; }
  if(k==='p'){ openPanel('pla'); return; }
  keys.add(k); if(e.key.startsWith('Arrow')) e.preventDefault();
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>keys.clear());
C.addEventListener('pointerdown',e=>{
  if(inHub) return;
  const wx=cam.x+e.clientX/ZOOM, wy=cam.y+e.clientY/ZOOM, R=24/Math.min(1,ZOOM);
  const hp=peds.find(p=>{ const q=pedPos(p); return Math.hypot(q.x-wx,q.y-wy)<R&&dist(player,q)<150; });
  if(hp){ pedModal(hp); return; }
  const ha=actors.find(a=>a.visible&&Math.hypot(a.x-wx,a.y-wy)<R&&dist(player,a)<170);
  if(ha){ staffModal(ha.st); return; }
  C.setPointerCapture(e.pointerId); joy={id:e.pointerId,ox:e.clientX,oy:e.clientY,x:e.clientX,y:e.clientY};
});
C.addEventListener('pointermove',e=>{ if(joy&&joy.id===e.pointerId){ joy.x=e.clientX; joy.y=e.clientY; } });
const endJoy=e=>{ if(joy&&joy.id===e.pointerId) joy=null; };
C.addEventListener('pointerup',endJoy); C.addEventListener('pointercancel',endJoy);
function inputDir(){
  let dx=0,dy=0; if(inHub) return [0,0];
  if(keys.has('w')||keys.has('arrowup')) dy-=1; if(keys.has('s')||keys.has('arrowdown')) dy+=1;
  if(keys.has('a')||keys.has('arrowleft')) dx-=1; if(keys.has('d')||keys.has('arrowright')) dx+=1;
  if(joy){ const jx=joy.x-joy.ox, jy=joy.y-joy.oy, d=Math.hypot(jx,jy); if(d>6){ const m=Math.min(1,d/55); dx=jx/d*m; dy=jy/d*m; } }
  const m=Math.hypot(dx,dy); if(m>1){dx/=m;dy/=m;} return [dx,dy];
}

// ================= ACTUALIZACIÓN =================
let pSpeed=190;
function updateActors(dt){
  for(const a of actors){
    const st=a.st, c=CBY[st.city], lv=lvlOf(st), boost=1+.08*(lv-1)*(st.energy>30?1:.6);
    a.visible=true; let moving=false;
    if(a.state==='travel'){ moving=!moveTo(a,c.x+(Math.random()-.5)*4,c.y+60,700,dt); if(!moving){ a.state='idle'; } a.visible=false; if(dist(a,c)<c.r) a.visible=true; continue; }
    if(st.order==='seguir'){
      if(player.mode!=='foot'){ a.x=player.x; a.y=player.y; a.visible=false; }
      else { if(dist(a,player)>900){ a.x=player.x-30; a.y=player.y+20; }
        if(a.chase&&raiders.includes(a.chase)) moveTo(a,a.chase.x,a.chase.y,Math.max(220,pSpeed*1.05),dt);
        else { const k=followers().indexOf(a), ang=player.ang+Math.PI+(k-1.5)*.55, tx=player.x+Math.cos(ang)*(34+k*6), ty=player.y+Math.sin(ang)*(34+k*6);
          if(dist(a,{x:tx,y:ty})>6) moving=!moveTo(a,tx,ty,Math.max(200,pSpeed*1.05),dt); } }
      st.energy=Math.max(0,st.energy-dt*.12);
      if(st.energy<8){ st.order='descanso'; st.prev='seguir'; toast(`${st.name} está agotado y vuelve a la comisaría a descansar`,true); }
    }
    else if(st.role==='agente'&&st.order==='patrulla'&&st.energy>5){
      const osp=(a.car?240:125)*boost;
      if(a.state==='idle'){ if(a.carry.length){ a.state='ret'; }
        else { let best=null,bd=1e9; for(const cr of crimes){ if(cr.taken||cr.city!==st.city) continue; const d=dist(a,cr); if(d<bd){bd=d;best=cr;} }
          if(best){ best.taken=a; a.target=best; a.state='go'; } else wander(a,c,dt); } }
      else if(a.state==='go'){ const cr=a.target;
        if(!crimes.includes(cr)){ a.target=null; a.state=a.carry.length?'ret':'idle'; }
        else if(dist(a,cr)>24){ moving=!moveTo(a,cr.x,cr.y,osp,dt); }
        else { cr.progress+=dt*.85*boost; if(cr.progress>=cr.T.t){ crimeDone(cr); a.carry.push(...crimeDetainees(cr,true)); st.xp++; a.target=null; a.state='ret'; if(st.xp%5===0) toast(`${st.name} sube a nivel ${lvlOf(st)}`); } } }
      else if(a.state==='ret'){ if(moveTo(a,c.drop.x+Math.cos(a.seed)*14,c.drop.y+Math.sin(a.seed)*10,osp,dt)){ dropAt(c,a); if(!a.carry.length) a.state='idle'; } else moving=true; }
      if(moving) st.energy=Math.max(0,st.energy-dt*.22);
      if(st.energy<=5){ st.prev='patrulla'; st.order='descanso'; if(a.target){ a.target.taken=null; a.target=null; } toast(`${st.name} está agotado y se va a descansar`,true); }
    }
    else {
      if(a.carry.length){ if(moveTo(a,c.drop.x,c.drop.y,125,dt)) dropAt(c,a); }
      else wander(a,c,dt);
      const rate=st.order==='descanso'?2.2:.6; st.energy=Math.min(100,st.energy+dt*rate);
      if(st.order==='descanso'&&st.energy>=100){ st.order=st.prev||(st.role==='agente'?'patrulla':'oficina'); st.prev=null; }
    }
    if(st.role==='guia'){ const tx=a.x+Math.cos(a.ang+2.3)*14, ty=a.y+Math.sin(a.ang+2.3)*14; a.dogx+=(tx-a.dogx)*Math.min(1,dt*6); a.dogy+=(ty-a.dogy)*Math.min(1,dt*6); if(Math.abs(a.dogx-tx)>200){ a.dogx=tx; a.dogy=ty; } }
  }
}
function wander(a,c,dt){
  const P=c.plaza;
  if(a.tx==null||(a.wait<=0&&dist(a,{x:a.tx,y:a.ty})<2)){
    if(a.wait<=0){ a.wait=1+Math.random()*4;
      if(a.st.order==='descanso'){ a.tx=P.x+P.w-30-Math.random()*40; a.ty=P.y+P.h-30-Math.random()*40; }
      else if(a.st.order==='guardia'){ a.tx=c.drop.x+(Math.random()-.5)*80; a.ty=c.drop.y+30+Math.random()*20; }
      else { a.tx=P.x+20+Math.random()*(P.w-40); a.ty=P.y+80+Math.random()*(P.h-100); } } }
  if(a.tx!=null&&!moveTo(a,a.tx,a.ty,42,dt)){} else a.wait-=dt;
}
function update(dt){
  S.time+=dt/5;
  if(Math.floor(S.time)!==lastHour){ lastHour=Math.floor(S.time); hourTick(); }
  weather.rain+=(weather.target-weather.rain)*Math.min(1,dt*.3);
  const here=cityAt(player.x,player.y);
  player.mode=!land(player.x,player.y)?'boat':here?'foot':'car';
  const hw=player.mode==='car'&&onHighway(player.x,player.y);
  pSpeed=player.mode==='foot'?190*(1+.12*U('bot')):player.mode==='car'?430*(1+.12*U('mot'))*(hw?1.35:1):330;
  const [dx,dy]=inputDir();
  if(dx||dy){ player.ang=Math.atan2(dy,dx); player.walk+=dt*10;
    const ok=(x,y)=>x>20&&y>20&&x<W-20&&y<H-20&&(land(x,y)||U('mar'));
    const nx=player.x+dx*pSpeed*dt, ny=player.y+dy*pSpeed*dt;
    if(ok(nx,player.y)) player.x=nx; else hintMsg='Necesitas la Unidad marítima para salir al mar';
    if(ok(player.x,ny)) player.y=ny; else hintMsg='Necesitas la Unidad marítima para salir al mar';
    if(player.mode==='car'&&Math.random()<.5) parts.push({x:player.x-Math.cos(player.ang)*16,y:player.y-Math.sin(player.ang)*16,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*20,t:0,life:.8,k:'dust'});
    if(player.mode==='boat') parts.push({x:player.x-Math.cos(player.ang)*20,y:player.y-Math.sin(player.ang)*20,vx:0,vy:0,t:0,life:1.4,k:'wake'}); }
  const zt=BASEZ*(player.mode==='foot'?.95:player.mode==='car'?.42:.55); ZOOM+=(zt-ZOOM)*Math.min(1,dt*2.5);
  // abrir comisaría
  let on=null; if(here&&!S.owned[here.id]){ const p=here.pad; if(player.x>p.x&&player.x<p.x+p.w&&player.y>p.y&&player.y<p.y+p.h) on=here; }
  if(on!==padCur){ padCur=on; padT=0; }
  if(on){ if(S.money<on.cost){ hintMsg=`Abrir la comisaría de ${on.n}: te faltan ${eur(on.cost-S.money)}`; padT=0; }
    else { padT+=dt; hintMsg='Firmando la apertura…'; if(padT>=1){ S.money-=on.cost; S.owned[on.id]={car:0,lvl:1}; newStaff('jefe',on.id); newStaff('agente',on.id); syncActors(); addXP(60,'nueva comisaría'); toast('Nueva comisaría: '+on.n+'. Te esperan su jefe de turno y un agente'); saveLocal(); padCur=null; } } }
  if(here&&S.owned[here.id]&&dist(player,here.drop)<here.drop.r+8&&S.carry.length){ dropAt(here,S); if(S.carry.length) hintMsg='Calabozos llenos: pasa detenidos al juez o amplíalos'; }
  // delitos
  spawnT-=dt; const ownedIds=Object.keys(S.owned);
  if(spawnT<=0){ const c=CBY[pick(ownedIds)]; if(crimes.filter(x=>x.city===c.id).length<4+Math.floor(c.r/150)) spawnCrime(c);
    spawnT=(3.2/Math.sqrt(ownedIds.length))*(isNight()?.65:1)*(.7+Math.random()*.6); }
  for(let i=crimes.length-1;i>=0;i--){ const cr=crimes[i]; cr.life-=dt;
    if(cr.T.move){ const c=CBY[cr.city]; const s=46*dt*cr.dir; if(cr.horiz) cr.x+=s; else cr.y+=s; if(Math.hypot(cr.x-c.x,cr.y-c.y)>c.r-20||!land(cr.x,cr.y)) cr.dir*=-1; }
    if(cr.life<=0){ if(cr.taken) cr.taken.target=null; crimes.splice(i,1); S.rep=Math.max(0,S.rep-2); toast(`${cr.T.n} sin atender en ${CBY[cr.city].n}. −2 reputación`,true); } }
  const help=1+.5*followers('agente').length;
  for(const cr of crimes){ if(dist(player,cr)<30){
    if(carryCap()-S.carry.length>=cr.T.s){ cr.progress+=dt*help; if(cr.progress>=cr.T.t){ followers().forEach(a=>a.st.xp++);
        if(S.auto){ crimeDone(cr); const ds=crimeDetainees(cr,true,detBonus()); S.carry.push(...ds); S.stats.legal+=ds.length; addXP(8*ds.length); ds.forEach(()=>missionEvent('arrest',{city:cr.city,profile:'crimen'})); toast(`${cr.T.n}: detenido(s) con derechos leídos`); } else crimeModal(cr); break; } }
    else hintMsg='Esposas llenas: lleva a los detenidos a una comisaría'; } }
  updateActors(dt);
  pedT-=dt; if(pedT<=0){ pedT=1; managePeds(); }
  updatePeds(dt);
  near=null; let nd=46;
  for(const p of peds){ const d=dist(player,pedPos(p)); if(d<nd){ nd=d; near={kind:'ped',ref:p}; } }
  for(const a of actors){ if(!a.visible||a.st.order==='seguir') continue; const d=dist(player,a); if(d<nd){ nd=d; near={kind:'staff',ref:a}; } }
  updateMission(dt);
  earn(U('rec')*ownedIds.length*repMult()*dt);
  for(const t of traffic){ t.t+=t.dir*t.sp*dt*(1000/Math.hypot(t.s.b.x-t.s.a.x,t.s.b.y-t.s.a.y)); if(t.t>1){t.t=1;t.dir=-1;} if(t.t<0){t.t=0;t.dir=1;} }
  for(let i=floats.length-1;i>=0;i--){ floats[i].t+=dt; if(floats[i].t>1.5) floats.splice(i,1); }
  for(let i=parts.length-1;i>=0;i--){ const p=parts[i]; p.t+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.t>p.life) parts.splice(i,1); }
  if(parts.length>400) parts.splice(0,parts.length-400);
  saveT+=dt; if(saveT>6){ saveT=0; saveLocal(); }
}

// ================= DIBUJO: ciudades en caché =================
const CS=1.5, cityCache=new Map();
function getCityCache(c){
  let e=cityCache.get(c.id); if(e){ e.t=now; return e; }
  const R=c.r+70, size=Math.ceil(2*R*CS), ox=c.x-R, oy=c.y-R;
  const cv=document.createElement('canvas'); cv.width=cv.height=size; const g=cv.getContext('2d');
  const wv=document.createElement('canvas'); wv.width=wv.height=size; const wg=wv.getContext('2d');
  for(const k of [g,wg]){ k.setTransform(CS,0,0,CS,-ox*CS,-oy*CS); k.save(); k.clip(LANDALL); }
  paintCity(c,g,wg);
  g.restore(); wg.restore();
  e={cv,wv,ox,oy,R,t:now}; cityCache.set(c.id,e);
  if(cityCache.size>6){ let old=null; for(const [k,v] of cityCache) if(!old||v.t<old[1].t) old=[k,v]; cityCache.delete(old[0]); }
  return e;
}
function paintCity(c,g,wg){
  const RR=c.r+40;
  // asfalto con borde
  const grd=g.createRadialGradient(c.x,c.y,c.r*.2,c.x,c.y,RR); grd.addColorStop(0,'#2b303d'); grd.addColorStop(1,'#242935');
  g.fillStyle=grd; g.beginPath(); g.arc(c.x,c.y,RR,0,7); g.fill();
  // aceras
  for(const b of c.blocks){ g.fillStyle='#5a6176'; g.fillRect(b.x-5,b.y-5,b.w+10,b.h+10); g.fillStyle='#6b7289'; g.fillRect(b.x-5,b.y-5,b.w+10,2); }
  // líneas y pasos de cebra
  g.strokeStyle='rgba(255,214,120,.35)'; g.lineWidth=1.2; g.setLineDash([9,8]); g.beginPath();
  for(let k=-c.g;k<=c.g;k++){ const off=k*120, L=Math.sqrt(Math.max(0,(c.r+30)**2-off*off)); g.moveTo(c.x+off,c.y-L); g.lineTo(c.x+off,c.y+L); g.moveTo(c.x-L,c.y+off); g.lineTo(c.x+L,c.y+off); }
  g.stroke(); g.setLineDash([]);
  g.fillStyle='rgba(235,240,250,.55)';
  for(let i=-c.g;i<=c.g;i++) for(let j=-c.g;j<=c.g;j++){ const x=c.x+i*120, y=c.y+j*120; if(Math.hypot(x-c.x,y-c.y)>c.r-10||(Math.abs(i)<=1&&Math.abs(j)<=1)) continue;
    for(let s=-12;s<=12;s+=4){ g.fillRect(x+s-1,y-24,2.4,9); g.fillRect(x+s-1,y+15,2.4,9); g.fillRect(x-24,y+s-1,9,2.4); g.fillRect(x+15,y+s-1,9,2.4); } }
  // manzanas
  for(const b of c.blocks){
    if(b.park){ const pg=g.createLinearGradient(b.x,b.y,b.x+b.w,b.y+b.h); pg.addColorStop(0,'#3c7348'); pg.addColorStop(1,'#2d5b38');
      g.fillStyle=pg; g.fillRect(b.x,b.y,b.w,b.h);
      g.strokeStyle='#c2ae82'; g.lineWidth=4; g.beginPath(); g.moveTo(b.x,b.y+b.h/2); g.quadraticCurveTo(b.x+b.w/2,b.y+12,b.x+b.w,b.y+b.h/2); g.moveTo(b.x+b.w/2,b.y+b.h); g.lineTo(b.x+b.w/2,b.y+b.h*.35); g.stroke();
      g.fillStyle='#7fb7d8'; g.beginPath(); g.arc(b.x+b.w/2,b.y+b.h*.62,7,0,7); g.fill(); g.strokeStyle='#d8d2c0'; g.lineWidth=2; g.stroke(); }
    else { g.fillStyle='#3d4459'; g.fillRect(b.x,b.y,b.w,b.h); }
    for(const t of b.trees) tree(g,t.x,t.y,t.r);
    for(const d of b.bld) building(g,wg,d);
  }
}
function tree(g,x,y,r){
  g.fillStyle='rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x+r*.4,y+r*.5,r,r*.8,0,0,7); g.fill();
  const tg=g.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r); tg.addColorStop(0,'#78c07f'); tg.addColorStop(1,'#2f6b3c');
  g.fillStyle=tg; g.beginPath(); g.arc(x,y,r,0,7); g.fill();
}
function building(g,wg,d){
  const {x,y,w,h,ht}=d, top=y-ht*.55, wallH=ht*.55;
  // sombra proyectada
  g.fillStyle='rgba(0,0,0,.32)'; g.beginPath(); g.moveTo(x+w,top+h); g.lineTo(x+w+ht*.45,top+h+ht*.2); g.lineTo(x+w+ht*.45,y+h+ht*.2); g.lineTo(x+4,y+h+ht*.2); g.lineTo(x,y+h); g.closePath(); g.fill();
  // fachada sur
  const wl=g.createLinearGradient(0,top+h,0,y+h); wl.addColorStop(0,`hsl(${d.hue} ${d.s}% ${d.l-6}%)`); wl.addColorStop(1,`hsl(${d.hue} ${d.s}% ${d.l-16}%)`);
  g.fillStyle=wl; g.fillRect(x,top+h,w,wallH);
  // ventanas
  if(wallH>5){ for(let wy=top+h+2.5;wy<y+h-3;wy+=5.5) for(let wx=x+3;wx<x+w-3;wx+=5.5){
      g.fillStyle='rgba(20,28,45,.75)'; g.fillRect(wx,wy,3,3);
      if(((wx*7+wy*13)|0)%10<d.lit*7){ wg.fillStyle='#ffd27a'; wg.fillRect(wx,wy,3,3); } } }
  // tejado
  if(d.tile){ g.fillStyle='#b5582f'; g.fillRect(x,top,w,h); g.strokeStyle='rgba(80,30,15,.45)'; g.lineWidth=1; g.beginPath(); for(let ly=top+3;ly<top+h;ly+=3.5){ g.moveTo(x,ly); g.lineTo(x+w,ly); } g.stroke();
    g.fillStyle='rgba(255,210,170,.25)'; g.fillRect(x,top+h/2-1,w,2); }
  else { const rg=g.createLinearGradient(x,top,x+w,top+h); rg.addColorStop(0,`hsl(${d.hue} ${d.s}% ${d.l+12}%)`); rg.addColorStop(1,`hsl(${d.hue} ${d.s}% ${d.l+4}%)`);
    g.fillStyle=rg; g.fillRect(x,top,w,h); g.strokeStyle=`hsl(${d.hue} ${d.s}% ${d.l+20}%)`; g.lineWidth=1.5; g.strokeRect(x+.75,top+.75,w-1.5,h-1.5);
    if(d.pool){ g.fillStyle='#4fc3e8'; g.fillRect(x+w*.2,top+h*.25,w*.45,h*.3); g.strokeStyle='#e8f6ff'; g.lineWidth=1; g.strokeRect(x+w*.2,top+h*.25,w*.45,h*.3); }
    else if(d.ac){ g.fillStyle=`hsl(${d.hue} 8% 62%)`; g.fillRect(x+w*.6,top+h*.2,w*.2,h*.2); g.fillRect(x+w*.2,top+h*.6,w*.15,h*.15); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x+w*.6,top+h*.4,w*.2,2); }
    if(ht>44&&d.lit>.6){ g.strokeStyle='rgba(255,255,255,.5)'; g.lineWidth=1.2; g.beginPath(); g.arc(x+w/2,top+h/2,w*.22,0,7); g.stroke(); g.font='bold 8px sans-serif'; g.fillStyle='rgba(255,255,255,.6)'; g.textAlign='center'; g.fillText('H',x+w/2,top+h/2+3); } }
}

// ================= DIBUJO: personajes y vehículos =================
let cam={x:0,y:0}, now=0;
function rrect(x,y,w,h,r,g=ctx){ g.beginPath(); g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h); }
function drawPerson(x,y,ang,walk,o){
  ctx.save(); ctx.translate(x,y); const s=o.scale||1; ctx.scale(s,s);
  ctx.fillStyle='rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(2.5,3.5,9,6.5,0,0,7); ctx.fill();
  if(o.ring){ ctx.beginPath(); ctx.arc(0,0,13,0,7); ctx.strokeStyle=o.ring; ctx.lineWidth=2; ctx.stroke(); }
  ctx.rotate(ang+Math.PI/2);
  const sw=Math.sin(walk)*3;
  ctx.fillStyle=o.legs||'#1c2233'; ctx.beginPath(); ctx.ellipse(-3,-sw*.8,2.3,3.4,0,0,7); ctx.ellipse(3,sw*.8,2.3,3.4,0,0,7); ctx.fill();
  ctx.fillStyle=o.body; ctx.beginPath(); ctx.arc(-7.8,sw*.7,2.8,0,7); ctx.arc(7.8,-sw*.7,2.8,0,7); ctx.fill();
  ctx.fillStyle=o.skin; ctx.beginPath(); ctx.arc(-8.2,sw*.7-2.6,1.7,0,7); ctx.arc(8.2,-sw*.7-2.6,1.7,0,7); ctx.fill();
  ctx.fillStyle=o.body; ctx.beginPath(); ctx.ellipse(0,1,8.2,5.4,0,0,7); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(-1.5,-.5,5.5,3,0,0,7); ctx.fill();
  if(o.vest){ ctx.fillStyle=o.vest; ctx.fillRect(-7,1.2,14,1.8); }
  if(o.umb){ ctx.fillStyle=o.umb; ctx.beginPath(); ctx.arc(0,0,11,0,7); ctx.fill(); ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.lineWidth=1; for(let k=0;k<6;k++){ ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(k)*11,Math.sin(k)*11); ctx.stroke(); } ctx.restore(); return; }
  ctx.fillStyle=o.skin; ctx.beginPath(); ctx.arc(0,-.6,4.4,0,7); ctx.fill();
  if(o.hat){ ctx.fillStyle=o.hat; ctx.beginPath(); ctx.arc(0,.2,4.8,0,7); ctx.fill(); ctx.beginPath(); ctx.ellipse(0,-4.6,4.2,1.8,0,0,7); ctx.fill(); ctx.fillStyle=o.badge||'#ffc94a'; ctx.fillRect(-1,-2.2,2,1.8); }
  else { ctx.fillStyle=o.hair; ctx.beginPath(); ctx.arc(0,0,4.7,-.25,Math.PI+.25); ctx.fill(); if(o.long){ ctx.fillRect(-4.2,0,8.4,5); } }
  ctx.restore();
}
function lookOf(st){ const R=ROLES[st.role]; return {skin:st.look.skin,hair:st.look.hair,long:st.look.long,body:R.body,hat:R.hat,vest:R.vest,legs:st.role==='analista'?'#2d3443':'#141a28'}; }
function drawDog(x,y,ang){
  ctx.save(); ctx.translate(x,y); ctx.rotate(ang);
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(1.5,2,7,4,0,0,7); ctx.fill();
  ctx.fillStyle='#6b4423'; ctx.beginPath(); ctx.ellipse(0,0,6.5,3.4,0,0,7); ctx.fill();
  ctx.fillStyle='#2a1a0e'; ctx.beginPath(); ctx.ellipse(-1,0,3.5,2.6,0,0,7); ctx.fill();
  ctx.fillStyle='#8a5a2e'; ctx.beginPath(); ctx.arc(6.5,0,2.8,0,7); ctx.fill(); ctx.fillStyle='#111'; ctx.fillRect(8.4,-.7,1.6,1.4);
  ctx.strokeStyle='#6b4423'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-9,Math.sin(now/90)*2); ctx.stroke();
  ctx.restore();
}
function drawCar(x,y,ang,o){
  ctx.save(); ctx.translate(x,y); ctx.rotate(ang);
  ctx.fillStyle='rgba(0,0,0,.4)'; rrect(-14,-6,32,16,4); ctx.fill();
  ctx.fillStyle='#111'; ctx.fillRect(-11,-9.5,6,2.5); ctx.fillRect(6,-9.5,6,2.5); ctx.fillRect(-11,7,6,2.5); ctx.fillRect(6,7,6,2.5);
  const bg=ctx.createLinearGradient(0,-8,0,8); bg.addColorStop(0,o.c1); bg.addColorStop(.5,o.c2); bg.addColorStop(1,o.c1);
  ctx.fillStyle=bg; rrect(-16,-8,32,16,5); ctx.fill();
  if(o.stripe){ ctx.fillStyle=o.stripe; ctx.fillRect(-16,-1.5,32,3); }
  ctx.fillStyle='rgba(25,40,70,.9)'; rrect(3,-6,7,12,2); ctx.fill(); rrect(-12,-6,5,12,2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(4,-5,2,10);
  ctx.fillStyle='#fff6c8'; ctx.fillRect(15,-6.5,1.6,3.5); ctx.fillRect(15,3,1.6,3.5);
  ctx.fillStyle='#d9343f'; ctx.fillRect(-16.5,-6.5,1.5,3); ctx.fillRect(-16.5,3.5,1.5,3);
  if(o.siren){ const on=Math.floor(now/150+(o.seed||0))%2; ctx.fillStyle='#222'; ctx.fillRect(-4,-6,4,12); ctx.fillStyle=on?'#ff3b4e':'#5b1520'; ctx.fillRect(-4,-6,4,5.5); ctx.fillStyle=on?'#1a3770':'#3d8bff'; ctx.fillRect(-4,.5,4,5.5); }
  ctx.restore();
}
function drawPlayer(){
  const p=player;
  if(p.mode==='car') drawCar(p.x,p.y,p.ang,{c1:'#e7ebf3',c2:'#ffffff',stripe:'#c99a1c',siren:true});
  else if(p.mode==='boat'){ ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.ang);
    ctx.fillStyle='rgba(0,0,0,.3)'; ctx.beginPath(); ctx.moveTo(23,3); ctx.lineTo(10,-6); ctx.lineTo(-16,-6); ctx.lineTo(-16,12); ctx.lineTo(10,12); ctx.fill();
    ctx.fillStyle='#e8efff'; ctx.beginPath(); ctx.moveTo(22,0); ctx.lineTo(9,-9); ctx.lineTo(-18,-9); ctx.lineTo(-18,9); ctx.lineTo(9,9); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#c99a1c'; ctx.fillRect(-18,-2,32,4); ctx.fillStyle='#1d4fb0'; ctx.fillRect(-11,-6,12,12); ctx.fillStyle='rgba(180,220,255,.8)'; ctx.fillRect(-1,-5,3,10);
    ctx.fillStyle=Math.floor(now/150)%2?'#ff3b4e':'#3d8bff'; ctx.fillRect(-7,-2,4,4); ctx.restore(); }
  else drawPerson(p.x,p.y,p.ang,p.walk,{skin:'#e6b48e',hair:'#2f1d12',body:'#1a2f6b',hat:'#0d1a3a',vest:'#ffc94a',badge:'#ffc94a',legs:'#101627',ring:'rgba(255,201,74,.55)'});
  const n=S.carry.length; if(n){ ctx.font='700 11px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle='#ff9aa5'; ctx.fillText(n+' detenido'+(n>1?'s':''),p.x,p.y-20); }
}
function drawActor(a){
  const st=a.st;
  if(st.role==='agente'&&a.car&&st.order==='patrulla'&&(a.state==='go'||a.state==='ret')) drawCar(a.x,a.y,a.ang,{c1:'#e7ebf3',c2:'#fff',stripe:'#1d4fb0',siren:a.state==='go',seed:a.seed});
  else { drawPerson(a.x,a.y,a.ang,a.walk,{...lookOf(st),ring:near&&near.ref===a?'#ffc94a':null}); if(st.role==='guia') drawDog(a.dogx||a.x-10,a.dogy||a.y+10,a.ang); }
  const showName=near&&near.ref===a||(ZOOM>.8&&dist(a,player)<160);
  if(showName){ ctx.font='700 11px "Saira Condensed",sans-serif'; ctx.textAlign='center'; const t=st.name+' · '+ROLES[st.role].n;
    const w=ctx.measureText(t).width+8; ctx.fillStyle='rgba(12,19,36,.8)'; ctx.fillRect(a.x-w/2,a.y-31,w,14); ctx.fillStyle=ROLES[st.role].color; ctx.fillText(t,a.x,a.y-20);
    ctx.fillStyle='#1b2747'; ctx.fillRect(a.x-12,a.y-15,24,3); ctx.fillStyle=st.energy<30?'#ff3b4e':'#4fd18b'; ctx.fillRect(a.x-12,a.y-15,24*st.energy/100,3); }
  if(st.order==='descanso'&&!showName){ ctx.font='700 11px "Saira Condensed",sans-serif'; ctx.fillStyle='#9fb3dc'; ctx.textAlign='center'; ctx.fillText('z z',a.x+8,a.y-14-Math.sin(now/300)*2); }
  if(a.carry.length){ ctx.font='700 10px "JetBrains Mono",monospace'; ctx.fillStyle='#ff9aa5'; ctx.textAlign='center'; ctx.fillText(a.carry.length+' det.',a.x,a.y-16); }
}


// ================= DIBUJO: terreno en trozos =================
const TS=1024, TSC=.8, tileCache=new Map(); let tilesBuilt=0;
function buildTile(tx,ty){
  const cv=document.createElement('canvas'); cv.width=cv.height=Math.ceil(TS*TSC); const g=cv.getContext('2d');
  const x0=tx*TS, y0=ty*TS;
  g.setTransform(TSC,0,0,TSC,-x0*TSC,-y0*TSC);
  const sea=g.createLinearGradient(0,y0,0,y0+TS); sea.addColorStop(0,'#123056'); sea.addColorStop(1,'#0e284c'); g.fillStyle=sea; g.fillRect(x0,y0,TS,TS);
  const R=rng(tx*733+ty*977); g.strokeStyle='rgba(160,210,255,.09)'; g.lineWidth=2;
  for(let i=0;i<40;i++){ const x=x0+R()*TS, y=y0+R()*TS, w=14+R()*26; g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+w/2,y-4,x+w,y); g.stroke(); }
  g.lineJoin='round';
  g.strokeStyle='rgba(40,110,150,.45)'; g.lineWidth=170; g.stroke(LANDALL);
  g.strokeStyle='rgba(70,150,180,.35)'; g.lineWidth=70; g.stroke(LANDALL);
  g.strokeStyle='rgba(255,255,255,.16)'; g.lineWidth=44; g.setLineDash([30,22]); g.stroke(LANDALL); g.setLineDash([]);
  g.strokeStyle='#d9c48f'; g.lineWidth=26; g.stroke(OWNPATH);
  for(const k in PATHS){ g.fillStyle=OWNLAND.includes(k)?'#4a5d3e':'#3a3f45'; g.fill(PATHS[k]); }
  g.save(); g.clip(LANDALL);
  const inT=(x,y,m)=>x>x0-m&&x<x0+TS+m&&y>y0-m&&y<y0+TS+m;
  for(const m of MOUNT){ if(!inT(m.x,m.y,m.r)) continue; const gr=g.createRadialGradient(m.x-m.r*.15,m.y-m.r*.2,0,m.x,m.y,m.r);
    if(m.snow){ gr.addColorStop(0,'rgba(240,244,250,.75)'); gr.addColorStop(.18,'rgba(170,165,150,.55)'); } else gr.addColorStop(0,'rgba(120,105,80,.55)');
    gr.addColorStop(.55,'rgba(95,90,70,.35)'); gr.addColorStop(1,'rgba(80,80,60,0)'); g.fillStyle=gr; g.beginPath(); g.ellipse(m.x,m.y,m.r,m.r*.7,0,0,7); g.fill(); }
  for(const d of DECOR) if(inT(d.x,d.y,140)) drawDecor(g,d);
  g.strokeStyle='#3d78a8'; g.lineWidth=10; g.lineCap='round'; for(const p of RIVERP) g.stroke(p);
  g.strokeStyle='rgba(140,200,240,.35)'; g.lineWidth=3; for(const p of RIVERP) g.stroke(p);
  g.restore();
  g.lineWidth=4; g.strokeStyle='rgba(20,30,40,.6)'; g.setLineDash([16,10]); g.stroke(PATHS.portugal); g.stroke(PATHS.france); g.setLineDash([]);
  g.lineCap='round';
  for(const s of HW){ g.strokeStyle='#6c7180'; g.lineWidth=34; g.beginPath(); g.moveTo(s.a.x,s.a.y); g.lineTo(s.b.x,s.b.y); g.stroke(); }
  for(const s of HW){ g.strokeStyle='#23272f'; g.lineWidth=30; g.beginPath(); g.moveTo(s.a.x,s.a.y); g.lineTo(s.b.x,s.b.y); g.stroke(); }
  g.lineCap='butt'; g.setLineDash([18,16]); g.strokeStyle='rgba(255,255,255,.45)'; g.lineWidth=1.6;
  for(const s of HW){ g.beginPath(); g.moveTo(s.a.x,s.a.y); g.lineTo(s.b.x,s.b.y); g.stroke(); } g.setLineDash([]);
  return {cv,t:now};
}
function drawTiles(v){
  const tx0=Math.floor(v.x0/TS), ty0=Math.floor(v.y0/TS), tx1=Math.floor(v.x1/TS), ty1=Math.floor(v.y1/TS);
  let built=0;
  for(let ty=ty0;ty<=ty1;ty++) for(let tx=tx0;tx<=tx1;tx++){
    const key=tx+','+ty; let e=tileCache.get(key);
    if(!e&&(built<2||tileCache.size<4)){ e=buildTile(tx,ty); tileCache.set(key,e); built++; }
    if(e){ e.t=now; ctx.drawImage(e.cv,tx*TS,ty*TS,TS+1,TS+1); }
    else { ctx.fillStyle='#24304a'; ctx.fillRect(tx*TS,ty*TS,TS,TS); }
  }
  if(tileCache.size>40){ const arr=[...tileCache].sort((a,b)=>a[1].t-b[1].t); for(let i=0;i<arr.length-40;i++) tileCache.delete(arr[i][0]); }
}

// ================= DIBUJO: escena =================

function draw(){
  cam.x=player.x-VW/2/ZOOM; cam.y=player.y-VH/2/ZOOM;
  const v={x0:cam.x-80,y0:cam.y-80,x1:cam.x+VW/ZOOM+80,y1:cam.y+VH/ZOOM+80};
  const vis=(x,y,m=0)=>x>v.x0-m&&x<v.x1+m&&y>v.y0-m&&y<v.y1+m;
  ctx.setTransform(1,0,0,1,0,0);
  const sea=ctx.createLinearGradient(0,0,0,C.height); sea.addColorStop(0,'#123056'); sea.addColorStop(1,'#0c2342'); ctx.fillStyle=sea; ctx.fillRect(0,0,C.width,C.height);
  ctx.setTransform(DPR*ZOOM,0,0,DPR*ZOOM,-cam.x*DPR*ZOOM,-cam.y*DPR*ZOOM);
  // terreno estático (mar, costa, relieve, campos, ríos y autovías) desde la caché de trozos
  drawTiles(v);
  for(const s of HW){ if(!s.label) continue; const mx=(s.a.x+s.b.x)/2, my=(s.a.y+s.b.y)/2; if(!vis(mx,my)) continue;
    const fs=Math.max(12,11/ZOOM); ctx.font=`800 ${fs}px "Saira Condensed",sans-serif`; const w=ctx.measureText(s.label).width+fs*.8;
    ctx.fillStyle='#1d55b8'; rrect(mx-w/2,my-fs*.75,w,fs*1.4,3); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText(s.label,mx,my+fs*.35); }
  for(const t of traffic){ const s=t.s, x=s.a.x+(s.b.x-s.a.x)*t.t, y=s.a.y+(s.b.y-s.a.y)*t.t; if(!vis(x,y)) continue;
    const a=Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x)+(t.dir<0?Math.PI:0); const ox=-Math.sin(a)*7, oy=Math.cos(a)*7;
    if(t.truck){ ctx.save(); ctx.translate(x+ox,y+oy); ctx.rotate(a); ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(-15,-5,34,13); ctx.fillStyle='#dfe3ea'; ctx.fillRect(-18,-6,26,12); ctx.fillStyle=t.col; ctx.fillRect(9,-6,9,12); ctx.restore(); }
    else drawCar(x+ox,y+oy,a,{c1:t.col,c2:t.col}); }
  // ciudades
  for(const c of CITIES) if(vis(c.x,c.y,c.r+80)){ const e=getCityCache(c); ctx.drawImage(e.cv,e.ox,e.oy,2*e.R,2*e.R); }
  for(const c of CITIES) if(vis(c.x,c.y,c.r+80)) drawPlaza(c);
  drawMission(vis);
  for(const cr of crimes) if(vis(cr.x,cr.y)) drawCrime(cr);
  const raining=weather.rain>.4;
  for(const p of peds){ const q=pedPos(p); if(!vis(q.x,q.y)) continue; drawPerson(q.x,q.y,pedAng(p),p.walk,{skin:p.lk.skin,hair:p.lk.hair,long:p.lk.long,body:p.body,ring:near&&near.ref===p?'#ffc94a':null,umb:raining&&p.umb?p.body:null});
    if(p.showSus>0){ ctx.fillStyle='#ffc94a'; ctx.font='800 16px "Saira Condensed",sans-serif'; ctx.textAlign='center'; ctx.fillText('?',q.x,q.y-13); }
    else if(p.ind){ ctx.fillStyle='#ff9aa5'; ctx.beginPath(); ctx.arc(q.x,q.y-14,2.5,0,7); ctx.fill(); } }
  for(const a of actors) if(a.visible&&vis(a.x,a.y)) drawActor(a);
  for(const p of parts){ if(!vis(p.x,p.y)) continue; const k=p.t/p.life;
    if(p.k==='dust'){ ctx.fillStyle=`rgba(200,190,160,${.35*(1-k)})`; ctx.beginPath(); ctx.arc(p.x,p.y,3+k*8,0,7); ctx.fill(); }
    else { ctx.strokeStyle=`rgba(255,255,255,${.5*(1-k)})`; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(p.x,p.y,3+k*14,0,7); ctx.stroke(); } }
  drawPlayer();
  // rótulos de ciudades
  ctx.textAlign='center';
  for(const c of CITIES){ if(!vis(c.x,c.y,c.r+200)) continue; const fs=Math.max(14,15/ZOOM);
    ctx.font=`800 ${fs}px "Saira Condensed",sans-serif`; ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillText(c.n.toUpperCase(),c.x+2,c.y-c.r-30+2);
    ctx.fillStyle=S.owned[c.id]?'#bcd4ff':'rgba(232,239,255,.8)'; ctx.fillText(c.n.toUpperCase(),c.x,c.y-c.r-30);
    ctx.font=`600 ${fs*.6}px "Saira Condensed",sans-serif`; ctx.fillStyle=S.owned[c.id]?'#7fb3ff':'#ffc94a';
    ctx.fillText(S.owned[c.id]?`Comisaría nivel ${S.owned[c.id].lvl||1} · ${staffOf(null,c.id).length||S.staff.filter(s=>s.city===c.id).length} personas`:`Sin comisaría · ${eur(c.cost)}`,c.x,c.y-c.r-30+fs*.75); }
  for(const f of floats){ ctx.globalAlpha=1-f.t/1.5; ctx.font=`700 ${16/Math.min(1,ZOOM)}px "JetBrains Mono",monospace`; ctx.fillStyle='#000'; ctx.fillText(f.text,f.x+1,f.y-f.t*30+1); ctx.fillStyle=f.col; ctx.fillText(f.text,f.x,f.y-f.t*30); }
  ctx.globalAlpha=1;
  drawNight(vis); drawWeather(); drawScreen();
}
function drawDecor(ctx,d){
  const {x,y}=d;
  if(d.k==='field'){ ctx.save(); ctx.translate(x,y); ctx.rotate(d.a); const hue=40+d.hue*40; ctx.fillStyle=`hsla(${hue},45%,${38+d.hue*12}%,.55)`; ctx.fillRect(-d.w/2,-d.h/2,d.w,d.h);
    ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=2; ctx.beginPath(); for(let i=-d.w/2+6;i<d.w/2;i+=8){ ctx.moveTo(i,-d.h/2); ctx.lineTo(i,d.h/2); } ctx.stroke(); ctx.restore(); }
  else if(d.k==='olive'||d.k==='vine'){ ctx.save(); ctx.translate(x,y); ctx.rotate(d.a); ctx.fillStyle=d.k==='olive'?'rgba(150,135,95,.35)':'rgba(140,110,80,.35)'; ctx.fillRect(-d.w/2,-d.h/2,d.w,d.h);
    ctx.fillStyle=d.k==='olive'?'#6f8a4f':'#5d7a3a'; const sp=d.k==='olive'?14:8;
    for(let i=-d.w/2+6;i<d.w/2;i+=sp) for(let j=-d.h/2+6;j<d.h/2;j+=d.k==='olive'?14:5){ ctx.beginPath(); ctx.arc(i,j,d.k==='olive'?3.6:1.8,0,7); ctx.fill(); } ctx.restore(); }
  else if(d.k==='forest'){ for(const t of d.trees){ ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(x+t.x+3,y+t.y+3,t.r,0,7); ctx.fill(); ctx.fillStyle='#2f5e35'; ctx.beginPath(); ctx.arc(x+t.x,y+t.y,t.r,0,7); ctx.fill(); ctx.fillStyle='#4c8a4f'; ctx.beginPath(); ctx.arc(x+t.x-t.r*.3,y+t.y-t.r*.3,t.r*.45,0,7); ctx.fill(); } }
  else if(d.k==='scrub'){ ctx.fillStyle='rgba(110,120,70,.45)'; for(let i=0;i<6;i++){ ctx.beginPath(); ctx.arc(x+Math.cos(i*1.7+d.a)*d.w*.25,y+Math.sin(i*2.3+d.a)*d.h*.2,5+i,0,7); ctx.fill(); } }
  else if(d.k==='village'){ for(const h of d.houses){ ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(x+h.x+2,y+h.y+2,h.w,h.h); ctx.fillStyle='#ece4d2'; ctx.fillRect(x+h.x,y+h.y+h.h*.55,h.w,h.h*.45); ctx.fillStyle='#b5582f'; ctx.fillRect(x+h.x,y+h.y,h.w,h.h*.6); }
    ctx.fillStyle='#d8cfb8'; ctx.fillRect(x-4,y-14,8,10); ctx.fillStyle='#8a4a2a'; ctx.beginPath(); ctx.moveTo(x-5,y-14); ctx.lineTo(x,y-20); ctx.lineTo(x+5,y-14); ctx.fill(); }
}
function drawPlaza(c){
  const P=c.plaza, own=!!S.owned[c.id], lvl=own?(S.owned[c.id].lvl||1):1;
  ctx.fillStyle=own?'#3a4767':'#30343f'; ctx.fillRect(P.x,P.y,P.w,P.h);
  ctx.strokeStyle='rgba(255,255,255,.05)'; ctx.lineWidth=1; ctx.beginPath();
  for(let x=P.x;x<=P.x+P.w;x+=15){ctx.moveTo(x,P.y);ctx.lineTo(x,P.y+P.h);} for(let y=P.y;y<=P.y+P.h;y+=15){ctx.moveTo(P.x,y);ctx.lineTo(P.x+P.w,y);} ctx.stroke();
  // jardineras y bancos
  ctx.fillStyle='#2e5a37'; ctx.fillRect(P.x+6,P.y+P.h-26,24,20); ctx.fillRect(P.x+P.w-30,P.y+P.h-26,24,20);
  tree(ctx,P.x+18,P.y+P.h-16,8); tree(ctx,P.x+P.w-18,P.y+P.h-16,8);
  if(own){ ctx.fillStyle='#6b5640'; ctx.fillRect(P.x+P.w-70,P.y+P.h-24,30,6); ctx.fillRect(P.x+40,P.y+P.h-24,30,6);
    ctx.fillStyle='#bfc6d6'; for(let i=0;i<Math.min(4,S.owned[c.id].car+1);i++){ ctx.fillRect(P.x+10,P.y+78+i*18,22,12); } ctx.fillStyle='#e8efff'; ctx.font='600 8px "Saira Condensed",sans-serif'; ctx.textAlign='center'; ctx.fillText('GARAJE',P.x+21,P.y+74); }
  // edificio 2.5D según nivel
  const bw=lvl===1?160:lvl===2?190:206, bx=c.x-bw/2, by=P.y+6, bh=46, ht=18+lvl*8;
  ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillRect(bx+6,by+bh+ht*.2,bw,ht*.25);
  const wall=ctx.createLinearGradient(0,by+bh-ht*.55,0,by+bh+ht*.45); wall.addColorStop(0,own?'#21468f':'#4a4f5e'); wall.addColorStop(1,own?'#142a5a':'#33363f');
  ctx.fillStyle=wall; ctx.fillRect(bx,by+bh,bw,ht*.45+4);
  for(let wx=bx+6;wx<bx+bw-6;wx+=9){ ctx.fillStyle=own&&isNight()?'#ffd27a':'rgba(160,200,255,.45)'; ctx.fillRect(wx,by+bh+4,5,5); }
  ctx.fillStyle=own?'#2a63d4':'#5a6070'; ctx.fillRect(bx,by,bw,bh); ctx.fillStyle=own?'#3570e0':'#646a7a'; ctx.fillRect(bx+5,by+5,bw-10,bh-10);
  ctx.fillStyle='#e8efff'; ctx.fillRect(bx,by+bh-6,bw,3);
  if(own&&lvl>=3){ ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(bx+bw-22,by+bh/2,13,0,7); ctx.stroke(); ctx.font='800 13px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText('H',bx+bw-22,by+bh/2+5); }
  if(own&&lvl>=2){ ctx.fillStyle='#8aa1c8'; ctx.fillRect(bx+8,by+10,14,10); ctx.fillRect(bx+26,by+10,10,10); }
  ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.font='800 20px "Saira Condensed",sans-serif'; ctx.fillText(own?'COMISARÍA':'CERRADA',c.x,by+30);
  if(own){ ctx.font='700 10px "Saira Condensed",sans-serif'; ctx.fillStyle='#bcd4ff'; ctx.fillText(c.n.toUpperCase()+' · NIVEL '+lvl,c.x,by+41);
    const on=Math.floor(now/400)%2; ctx.fillStyle=on?'#ff3b4e':'#3d8bff'; ctx.fillRect(c.x-22,by+2,18,5); ctx.fillStyle=on?'#3d8bff':'#ff3b4e'; ctx.fillRect(c.x+4,by+2,18,5);
    ctx.beginPath(); ctx.arc(c.drop.x,c.drop.y,c.drop.r,0,7); ctx.fillStyle='rgba(61,139,255,.22)'; ctx.fill();
    ctx.lineWidth=3; ctx.strokeStyle='#3d8bff'; ctx.setLineDash([7,5]); ctx.lineDashOffset=-now/40; ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset=0;
    ctx.font='700 11px "Saira Condensed",sans-serif'; ctx.fillStyle='#bcd4ff'; ctx.fillText('ENTREGA',c.drop.x,c.drop.y+4);
    ctx.font='700 12px "Saira Condensed",sans-serif'; ctx.fillStyle='#ffc94a'; ctx.fillText('CENTRO DE MANDO · E',c.x,P.y+P.h-34);
  } else { const p=c.pad, can=S.money>=c.cost;
    rrect(p.x,p.y,p.w,p.h,6); ctx.fillStyle=can?'rgba(255,201,74,.2)':'rgba(255,255,255,.07)'; ctx.fill();
    if(padCur===c&&padT>0){ ctx.save(); ctx.clip(); ctx.fillStyle='rgba(255,201,74,.55)'; ctx.fillRect(p.x,p.y+p.h*(1-Math.min(1,padT)),p.w,p.h*Math.min(1,padT)); ctx.restore(); }
    rrect(p.x,p.y,p.w,p.h,6); ctx.lineWidth=2; ctx.strokeStyle=can?'#ffc94a':'#56648f'; ctx.setLineDash(can?[]:[6,4]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#e8efff'; ctx.font='700 13px "Saira Condensed",sans-serif'; ctx.fillText('Abrir comisaría',c.x,p.y+20);
    ctx.font='700 15px "JetBrains Mono",monospace'; ctx.fillStyle=can?'#ffc94a':'#c26b74'; ctx.fillText(eur(c.cost),c.x,p.y+42); }
}
function drawCrime(cr){
  const pulse=(Math.sin(now/180)+1)/2, urgent=cr.life<12;
  ctx.beginPath(); ctx.arc(cr.x,cr.y,24+pulse*8,0,7); ctx.strokeStyle=`rgba(255,59,78,${.25+pulse*.4})`; ctx.lineWidth=3; ctx.stroke();
  for(let k=0;k<cr.T.s;k++){ const ox=(k-(cr.T.s-1)/2)*14, lk=cr.looks[k%2];
    drawPerson(cr.x+ox,cr.y+Math.sin(now/120+k)*2,now/400+k*2,now/80,{skin:lk.skin,hair:lk.hair,long:lk.long,body:'#3a2030',ring:'rgba(255,59,78,.8)'}); }
  const my=cr.y-40-pulse*4; ctx.fillStyle=urgent&&Math.floor(now/200)%2?'#ffc94a':'#ff3b4e';
  ctx.beginPath(); ctx.moveTo(cr.x,my+13); ctx.lineTo(cr.x-10,my); ctx.lineTo(cr.x,my-13); ctx.lineTo(cr.x+10,my); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#fff'; ctx.font='800 15px "Saira Condensed",sans-serif'; ctx.textAlign='center'; ctx.fillText('!',cr.x,my+5);
  ctx.font='700 12px "Saira Condensed",sans-serif'; ctx.fillStyle='#ffd0d5'; ctx.fillText(`${cr.T.n.toUpperCase()} · ${eur(cr.reward)}`,cr.x,my-19);
  ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(cr.x-20,cr.y+16,40,4); ctx.fillStyle=urgent?'#ff3b4e':'#93a3c8'; ctx.fillRect(cr.x-20,cr.y+16,40*cr.life/cr.max,4);
  if(cr.progress>0){ ctx.beginPath(); ctx.arc(cr.x,cr.y,20,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,cr.progress/cr.T.t)); ctx.strokeStyle='#4fd18b'; ctx.lineWidth=4; ctx.stroke(); }
}
function drawMission(vis){
  const s=curStep(); if(!s) return; ctx.textAlign='center';
  const marker=(x,y,label,prog)=>{ const pulse=(Math.sin(now/220)+1)/2; ctx.beginPath(); ctx.arc(x,y,30+pulse*5,0,7); ctx.strokeStyle='#ffc94a'; ctx.lineWidth=3; ctx.setLineDash([8,6]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,201,74,.15)'; ctx.fill(); if(prog>0){ ctx.beginPath(); ctx.arc(x,y,22,-Math.PI/2,-Math.PI/2+Math.PI*2*prog); ctx.strokeStyle='#4fd18b'; ctx.lineWidth=5; ctx.stroke(); }
    ctx.font='700 14px "Saira Condensed",sans-serif'; ctx.fillStyle='#ffe3a0'; ctx.fillText(label,x,y-40); };
  if(s.t==='inspect'){ const c=CBY[s.city], done=S.mis.d.done||[]; s.pts.forEach((p,i)=>{ if(done.includes(i)) return; const x=c.x+p[0],y=c.y+p[1]; if(!vis(x,y)) return;
    if(s.city==='valencia'){ ctx.fillStyle=['#b23a2a','#2a6bb2','#3a8a3a','#c9902a'][i]; ctx.fillRect(x-22,y-9,44,18); ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1; for(let k=-18;k<22;k+=5){ ctx.beginPath(); ctx.moveTo(x+k,y-9); ctx.lineTo(x+k,y+9); ctx.stroke(); } }
    marker(x,y,s.names[i],Math.hypot(player.x-x,player.y-y)<36?(S.mis.d.hold||0)/2:0); }); }
  if(s.t==='raid'){ const P=stepPoint(s); if(vis(P.x,P.y)){ if(!S.mis.d.spawned){ ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(P.x-44,P.y-24,100,70); ctx.fillStyle='#5a4a38'; ctx.fillRect(P.x-50,P.y-35,100,70); ctx.fillStyle='#7a6448'; ctx.fillRect(P.x-50,P.y-35,100,40); ctx.strokeStyle='rgba(0,0,0,.25)'; for(let k=-44;k<50;k+=8){ ctx.beginPath(); ctx.moveTo(P.x+k,P.y-35); ctx.lineTo(P.x+k,P.y+5); ctx.stroke(); } } marker(P.x,P.y,'Objetivo del registro',0); }
    for(const r of raiders) drawPerson(r.x,r.y,r.ang,r.walk,{skin:r.lk.skin,hair:r.lk.hair,long:r.lk.long,body:'#5a1420',ring:'#ff3b4e'}); }
  if(s.t==='boats') for(const b of boats){ if(!vis(b.x,b.y)) continue; ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.ang);
    ctx.fillStyle='rgba(0,0,0,.3)'; ctx.beginPath(); ctx.moveTo(28,4); ctx.lineTo(14,-4); ctx.lineTo(-20,-4); ctx.lineTo(-20,12); ctx.lineTo(14,12); ctx.fill();
    ctx.fillStyle='#3a4250'; ctx.beginPath(); ctx.moveTo(26,0); ctx.lineTo(12,-8); ctx.lineTo(-22,-8); ctx.lineTo(-22,8); ctx.lineTo(12,8); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#c9a46a'; ctx.fillRect(-12,-5,8,4); ctx.fillRect(-2,-5,8,4); ctx.fillRect(-12,1,8,4); ctx.fillRect(-2,1,8,4); ctx.fillStyle='#111'; ctx.fillRect(-26,-6,4,4); ctx.fillRect(-26,-1,4,4); ctx.fillRect(-26,4,4,3); ctx.restore();
    ctx.font='700 12px "Saira Condensed",sans-serif'; ctx.fillStyle='#ffd0d5'; ctx.fillText('NARCOLANCHA',b.x,b.y-18); }
  if(s.t==='follow'&&truck&&vis(truck.x,truck.y)){ ctx.save(); ctx.translate(truck.x,truck.y); ctx.rotate(truck.ang||0); ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(-20,-6,46,18); ctx.fillStyle='#d8dde6'; ctx.fillRect(-24,-9,34,18); ctx.fillStyle='#8a2f2f'; ctx.fillRect(10,-8,12,16); ctx.fillStyle='rgba(30,50,90,.85)'; ctx.fillRect(18,-6,3,12); ctx.restore();
    ctx.beginPath(); ctx.arc(truck.x,truck.y,80,0,7); ctx.strokeStyle='rgba(255,59,78,.35)'; ctx.lineWidth=2; ctx.stroke();
    ctx.font='700 12px "Saira Condensed",sans-serif'; ctx.fillStyle='#ffe3a0'; ctx.fillText('CAMIÓN VIGILADO',truck.x,truck.y-22); }
}
const LSPR=(()=>{ const cv=document.createElement('canvas'); cv.width=cv.height=128; const g=cv.getContext('2d'); const gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); return cv; })();
function drawNight(vis){
  const d=darkness(); if(d<.02) return;
  nctx.setTransform(1,0,0,1,0,0); nctx.globalCompositeOperation='source-over'; nctx.clearRect(0,0,NC.width,NC.height);
  nctx.fillStyle=`rgba(6,10,32,${d})`; nctx.fillRect(0,0,NC.width,NC.height); nctx.globalCompositeOperation='destination-out';
  const S2=ZOOM*DPR, sx=x=>(x-cam.x)*S2, sy=y=>(y-cam.y)*S2;
  const light=(x,y,r,a=1)=>{ const X=sx(x), Y=sy(y), sr=r*S2; if(X<-sr||Y<-sr||X>NC.width+sr||Y>NC.height+sr) return;
    nctx.globalAlpha=a; nctx.drawImage(LSPR,X-sr,Y-sr,sr*2,sr*2); nctx.globalAlpha=1; };
  const cone=(x,y,ang,len,spread)=>{ const X=sx(x), Y=sy(y), L=len*S2; const g=nctx.createRadialGradient(X,Y,0,X,Y,L); g.addColorStop(0,'rgba(0,0,0,.95)'); g.addColorStop(1,'rgba(0,0,0,0)');
    nctx.fillStyle=g; nctx.beginPath(); nctx.moveTo(X,Y); nctx.arc(X,Y,L,ang-spread,ang+spread); nctx.closePath(); nctx.fill(); };
  light(player.x,player.y,player.mode==='foot'?150:110);
  if(player.mode!=='foot') cone(player.x,player.y,player.ang,player.mode==='car'?420:300,.42);
  for(const c of CITIES){ if(!vis(c.x,c.y,c.r+100)) continue;
    if(ZOOM<.6) light(c.x,c.y,c.r*1.05,.75);
    else { for(let i=-c.g;i<=c.g;i++) for(let j=-c.g;j<=c.g;j++){ const x=c.x+i*120, y=c.y+j*120; if(Math.hypot(x-c.x,y-c.y)>c.r||!vis(x,y,80)) continue; light(x,y,78,.85); } }
    if(S.owned[c.id]) light(c.x,c.y,160); }
  for(const a of actors) if(a.visible&&a.car&&vis(a.x,a.y)) cone(a.x,a.y,a.ang,180,.4);
  for(const t of traffic){ const s=t.s, x=s.a.x+(s.b.x-s.a.x)*t.t, y=s.a.y+(s.b.y-s.a.y)*t.t; if(!vis(x,y)) continue; cone(x,y,Math.atan2(s.b.y-s.a.y,s.b.x-s.a.x)+(t.dir<0?Math.PI:0),150,.35); }
  for(const cr of crimes) if(vis(cr.x,cr.y)) light(cr.x,cr.y,55);
  ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(NC,0,0);
  // ventanas encendidas y luces de sirena por encima de la oscuridad
  ctx.setTransform(DPR*ZOOM,0,0,DPR*ZOOM,-cam.x*DPR*ZOOM,-cam.y*DPR*ZOOM);
  ctx.globalAlpha=Math.min(1,d*1.7);
  for(const c of CITIES) if(vis(c.x,c.y,c.r+80)){ const e=cityCache.get(c.id); if(e) ctx.drawImage(e.wv,e.ox,e.oy,2*e.R,2*e.R); }
  ctx.globalAlpha=1; ctx.globalCompositeOperation='lighter';
  const glow=(x,y,r,col)=>{ const g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,col); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2); };
  const on=Math.floor(now/150)%2;
  if(player.mode!=='foot') glow(player.x,player.y,46,on?'rgba(255,60,80,.55)':'rgba(60,120,255,.55)');
  for(const a of actors) if(a.visible&&a.car&&a.state==='go'&&vis(a.x,a.y)) glow(a.x,a.y,40,(Math.floor(now/150+a.seed)%2)?'rgba(255,60,80,.5)':'rgba(60,120,255,.5)');
  for(const c of CITIES) if(S.owned[c.id]&&vis(c.x,c.y)) glow(c.x,c.plaza.y+8,40,on?'rgba(255,60,80,.35)':'rgba(60,120,255,.35)');
  ctx.globalCompositeOperation='source-over';
}
const RAIN=Array.from({length:180},()=>({x:Math.random(),y:Math.random(),s:.6+Math.random()*.6}));
function drawWeather(){
  if(weather.rain<.05) return;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=`rgba(40,55,80,${.18*weather.rain})`; ctx.fillRect(0,0,VW,VH);
  ctx.strokeStyle=`rgba(190,210,240,${.35*weather.rain})`; ctx.lineWidth=1; ctx.beginPath();
  for(const r of RAIN){ r.y+=.018*r.s; r.x+=.004*r.s; if(r.y>1){ r.y-=1; r.x=Math.random(); } if(r.x>1) r.x-=1;
    const x=r.x*VW, y=r.y*VH; ctx.moveTo(x,y); ctx.lineTo(x+4,y+14*r.s); } ctx.stroke();
}
function drawScreen(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=VIGN; ctx.fillRect(0,0,VW,VH);
  const arrow=(x,y,col,label)=>{ const sx=(x-cam.x)*ZOOM, sy=(y-cam.y)*ZOOM; if(sx>0&&sx<VW&&sy>0&&sy<VH) return;
    const cx=VW/2, cy=VH/2, a=Math.atan2(sy-cy,sx-cx), m=40;
    const t=Math.min((VW/2-m)/Math.abs(Math.cos(a)||1e-6),(VH/2-m-30)/Math.abs(Math.sin(a)||1e-6));
    const ex=cx+Math.cos(a)*t, ey=cy+Math.sin(a)*t;
    ctx.save(); ctx.translate(ex,ey); ctx.rotate(a); ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(15,0); ctx.lineTo(-8,-10); ctx.lineTo(-8,10); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.font='700 11px "JetBrains Mono",monospace'; ctx.textAlign='center'; ctx.fillStyle=col; ctx.fillText(label,ex-Math.cos(a)*26,ey-Math.sin(a)*26+4); };
  const km=d=>d>K*.1?Math.round(d/K*85)+' km':Math.round(d/K*85000/10)*10+' m';
  const list=crimes.map(c=>({c,d:dist(player,c)})).filter(o=>o.d<2500).sort((a,b)=>a.d-b.d).slice(0,5);
  for(const {c,d} of list) arrow(c.x,c.y,c.life<12?'#ffc94a':'#ff3b4e',km(d));
  const mt=misTarget(); if(mt) arrow(mt.x,mt.y,'#ffe08a','★ '+km(dist(player,mt)));
  if(joy){ ctx.beginPath(); ctx.arc(joy.ox,joy.oy,50,0,7); ctx.strokeStyle='rgba(232,239,255,.35)'; ctx.lineWidth=2; ctx.stroke();
    const jx=joy.x-joy.ox, jy=joy.y-joy.oy, d=Math.hypot(jx,jy), k=d>50?50/d:1; ctx.beginPath(); ctx.arc(joy.ox+jx*k,joy.oy+jy*k,20,0,7); ctx.fillStyle='rgba(232,239,255,.35)'; ctx.fill(); }
}
// ================= MINIMAPA LOCAL =================
let mmZoom=2600;
function mmBadge(x,y,col){ mctx.save(); mctx.translate(x,y); mctx.fillStyle=col; mctx.strokeStyle='#fff'; mctx.lineWidth=3;
  mctx.beginPath(); mctx.moveTo(0,-20); mctx.lineTo(16,-13); mctx.lineTo(16,2); mctx.quadraticCurveTo(14,14,0,21); mctx.quadraticCurveTo(-14,14,-16,2); mctx.lineTo(-16,-13); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.fillStyle='#fff'; mctx.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?3.6:8.5; mctx.lineTo(Math.cos(a)*r,Math.sin(a)*r+1); } mctx.closePath(); mctx.fill(); mctx.restore(); }
function mmPin(x,y,col){ mctx.save(); mctx.translate(x,y); mctx.fillStyle=col; mctx.strokeStyle='#fff'; mctx.lineWidth=2.5; mctx.beginPath(); mctx.arc(0,-22,13,Math.PI*.85,Math.PI*2.15); mctx.lineTo(0,0); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.fillStyle='#fff'; mctx.font='800 18px Arial'; mctx.textAlign='center'; mctx.fillText('!',0,-15); mctx.restore(); }
function drawMini(){
  const w=MINI.width, h=MINI.height, vw=mmZoom, vh=mmZoom*h/w, x0=player.x-vw/2, y0=player.y-vh/2, k=w/vw;
  const X=x=>(x-x0)*k, Y=y=>(y-y0)*k;
  mctx.setTransform(1,0,0,1,0,0); mctx.fillStyle='#16365a'; mctx.fillRect(0,0,w,h);
  mctx.drawImage(MC,x0/MS,y0/MS,vw/MS,vh/MS,0,0,w,h);
  mctx.lineCap='round'; mctx.strokeStyle='rgba(240,230,200,.8)'; mctx.lineWidth=Math.max(3,30*k); mctx.beginPath();
  for(const s of HW){ mctx.moveTo(X(s.a.x),Y(s.a.y)); mctx.lineTo(X(s.b.x),Y(s.b.y)); } mctx.stroke();
  for(const c of CITIES){ const cx=X(c.x), cy=Y(c.y), r=c.r*k; if(cx<-r-60||cy<-r-60||cx>w+r+60||cy>h+r+60) continue;
    mctx.fillStyle='rgba(58,64,80,.95)'; mctx.beginPath(); mctx.arc(cx,cy,r+40*k,0,7); mctx.fill();
    if(r>50){ mctx.strokeStyle='rgba(235,238,245,.6)'; mctx.lineWidth=Math.max(1.5,12*k); mctx.beginPath();
      for(let i=-c.g;i<=c.g;i++){ const off=i*120, L=Math.sqrt(Math.max(0,(c.r+30)**2-off*off)); mctx.moveTo(X(c.x+off),Y(c.y-L)); mctx.lineTo(X(c.x+off),Y(c.y+L)); mctx.moveTo(X(c.x-L),Y(c.y+off)); mctx.lineTo(X(c.x+L),Y(c.y+off)); } mctx.stroke();
      for(const b of c.blocks) if(b.park){ mctx.fillStyle='rgba(70,140,80,.8)'; mctx.fillRect(X(b.x),Y(b.y),b.w*k,b.h*k); } }
    if(S.owned[c.id]) mmBadge(cx,cy,'#2a63d4'); else { mctx.fillStyle='#8a93a8'; mctx.beginPath(); mctx.arc(cx,cy,7,0,7); mctx.fill(); }
    mctx.font='700 24px "Saira Condensed",sans-serif'; mctx.textAlign='center'; mctx.lineWidth=5; mctx.strokeStyle='rgba(0,0,0,.65)'; mctx.strokeText(c.n,cx,cy-r-34*k-26); mctx.fillStyle='#fff'; mctx.fillText(c.n,cx,cy-r-34*k-26); }
  for(const cr of crimes){ const x=X(cr.x), y=Y(cr.y); if(x>-20&&y>-20&&x<w+20&&y<h+40) mmPin(x,y,cr.life<12?'#ffc94a':'#ff3b4e'); }
  const mt=misTarget();
  if(mt){ let x=X(mt.x), y=Y(mt.y); const out=x<0||y<0||x>w||y>h; x=Math.max(16,Math.min(w-16,x)); y=Math.max(16,Math.min(h-16,y));
    mctx.fillStyle='#ffc94a'; mctx.strokeStyle='#1a1300'; mctx.lineWidth=2; mctx.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=(i%2?6:14)*(1+.1*Math.sin(now/200)); mctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r); } mctx.closePath(); mctx.fill(); mctx.stroke(); void out; }
  mctx.save(); mctx.translate(w/2,h/2); mctx.fillStyle='rgba(61,139,255,.25)'; mctx.beginPath(); mctx.arc(0,0,34,0,7); mctx.fill(); mctx.strokeStyle='rgba(255,255,255,.7)'; mctx.lineWidth=2; mctx.stroke();
  mctx.rotate(player.ang+Math.PI/2); mctx.fillStyle='#3d8bff'; mctx.strokeStyle='#fff'; mctx.lineWidth=3; mctx.beginPath(); mctx.moveTo(0,-22); mctx.lineTo(15,16); mctx.lineTo(0,8); mctx.lineTo(-15,16); mctx.closePath(); mctx.fill(); mctx.stroke(); mctx.restore();
}

// ================= HUD =================
function homeCity(){ const c=cityAt(player.x,player.y); if(c&&S.owned[c.id]) return c; let best=null,bd=1e12; for(const id in S.owned){ const x=CBY[id], d=dist(player,x); if(d<bd){bd=d;best=x;} } return best; }
function hud(){
  const L=lvlFromXp(S.xp), a=50*(L-1)**2, b=50*L*L;
  $('pLvl').textContent='Nivel '+L; $('pXpBar').style.width=Math.min(100,(S.xp-a)/(b-a)*100)+'%'; $('pXp').textContent=`XP ${fmt(S.xp)} / ${fmt(b)}`;
  $('hMoney').textContent=eur(S.money); $('hRep').textContent=Math.round(S.rep); $('hIntel').textContent=S.intel;
  const mb=$('bMail'); let bd=mb.querySelector('.badge'); if(S.unread){ if(!bd){ bd=document.createElement('i'); bd.className='badge'; mb.appendChild(bd); } bd.textContent=S.unread; } else if(bd) bd.remove();
  const hc=inHub&&hubCity?hubCity:homeCity(), o=S.owned[hc.id];
  $('iTitle').textContent='Tu comisaría de '+hc.n; $('iLvl').textContent=`Nivel ${o.lvl||1} / 3`; $('iLvlBar').style.width=((o.lvl||1)/3*100)+'%';
  const hrs=S.time%24, inc=S.lastDay!=null?S.lastDay:(hrs>1?S.dayEarn*24/hrs:0); $('iInc').textContent=inc>0?eur(inc)+'/día ▲':'—';
  const totCars=Object.values(S.owned).reduce((x,y)=>x+y.car,0), totAg=S.staff.filter(x=>x.role==='agente').length;
  $('cCars').textContent=`${totCars} / ${totAg}`; $('cAg').textContent=totAg;
  $('cLaw').textContent=S.custody.filter(d=>d.lawyer).length; const ev=S.custody.length?S.custody.reduce((x,d)=>x+d.ev,0)/S.custody.length:0; $('cEv').textContent=S.custody.length?Math.round(ev)+' %':'—';
  $('cCap').textContent=`${S.custody.length} / ${custCap()}`; const mh=S.custody.length?Math.max(...S.custody.map(d=>d.h)):null; $('cH').textContent=mh==null?'—':`${72-mh} h`;
  const h=hourOfDay(), c=cityAt(player.x,player.y), f=followers();
  $('status').textContent=`Día ${Math.floor((S.time+8)/24)+1} · ${String(Math.floor(h)).padStart(2,'0')}:${String(Math.floor((h%1)*6)*10).padStart(2,'0')}${weather.rain>.4?' · lluvia':''} · ${c?c.n:player.mode==='boat'?'En el mar':onHighway(player.x,player.y)?'Autovía':'Carretera'} · Esposas ${S.carry.length}/${carryCap()} · Calabozos ${S.custody.length}/${custCap()}${f.length?' · Contigo: '+f.map(x=>ROLES[x.st.role].n.split(' ')[0]).join(', '):''}`;
  const m=curMis(), sp=curStep(), avail=MIS.filter(misAvail);
  const mn=$('misN'); mn.hidden=!avail.length||!!m; mn.textContent=avail.length;
  if(m){ const prog=(sp.t==='arrest'||sp.t==='court'||sp.t==='raid'||sp.t==='boats')?` (${S.mis.p}/${sp.n})`:sp.t==='inspect'?` (${(S.mis.d.done||[]).length}/${sp.pts.length})`:sp.t==='intel'?` (${S.intel}/${sp.n})`:'';
    $('hMis').innerHTML=`<span class="ex">!</span><div><h3>${m.n} · paso ${S.mis.i+1}/${m.steps.length}</h3><p>${stepText(sp)}${prog}</p><small>Recompensa: ${eur(m.rw)}</small></div>`; }
  else if(avail.length){ const x=avail[0]; $('hMis').innerHTML=`<span class="ex">!</span><div><h3>Nueva misión</h3><p>${x.n}: ${x.d}</p><small>Recompensa: ${eur(x.rw)}</small></div>`; }
  else $('hMis').innerHTML=`<span class="ex">✓</span><div><h3>Sin misiones nuevas</h3><p>Abre comisarías y sigue patrullando</p></div>`;
  let msg=hintMsg;
  if(!msg){ const st=stationHere();
    if(near&&near.kind==='staff') msg=`Pulsa E o toca a ${near.ref.st.name} para darle órdenes`;
    else if(near) msg='Pulsa E, toca a la persona o usa Arrestar para darle el alto';
    else if(st) msg=S.carry.length?'Pisa el círculo de ENTREGA para dejar a los detenidos':'Pulsa E para entrar en Mi Comisaría';
    else if(S.carry.length>=carryCap()) msg='Esposas llenas: lleva a los detenidos a una comisaría';
    else if(player.mode==='car') msg='Las autovías son más rápidas. Las ciudades con comisaría tienen avisos';
    else msg='Sigue las flechas rojas a los avisos y la estrella dorada a tu misión'; }
  $('hint').textContent=msg;
}

// ================= MI COMISARÍA (3D) =================
let inHub=false, hubCity=null, hubT=0;
function hubInfo(c){
  const staff=S.staff.filter(s=>s.city===c.id).map(s=>{ const R=ROLES[s.role]; return {body:R.body,skin:s.look.skin,hair:s.look.hair,long:s.look.long,cap:R.hat,vest:R.hat?'#0c0f16':null,legs:'#141a28'}; });
  return {city:c.id,lvl:S.owned[c.id].lvl||1,cars:S.owned[c.id].car,staff,hour:hourOfDay(),rain:weather.rain>.4};
}
function setSideOn(go){ document.querySelectorAll('#side button').forEach(b=>b.classList.toggle('on',b.dataset.go===go)); }
function openHub(c){
  c=c||homeCity(); hubCity=c; inHub=true; keys.clear(); joy=null;
  document.body.classList.add('hub'); document.body.classList.remove('patrol'); setSideOn('hub');
  if(window.PE_HUB&&PE_HUB.open(hubInfo(c))) C.style.visibility='hidden';
}
function closeHub(){ inHub=false; if(window.PE_HUB) PE_HUB.close(); C.style.visibility='visible'; document.body.classList.remove('hub'); document.body.classList.add('patrol'); setSideOn(null); }

// ================= ACCIONES =================
function doAction(a){
  if(a==='deploy'){ const c=inHub&&hubCity?hubCity:homeCity(); const ag=S.staff.filter(s=>s.role==='agente'&&s.city===c.id&&s.order!=='seguir');
    ag.forEach(s=>{ s.order=s.energy<15?'descanso':'patrulla'; }); syncActors(); toast(`${ag.length} agente(s) de ${c.n} salen a patrullar`); }
  else if(a==='fine'||a==='arrest'){ if(inHub){ toast('Sal a patrullar para dar el alto a alguien',true); return; }
    if(near&&(near.kind==='ped'||a==='arrest')) interact();
    else if(crimes.some(cr=>dist(player,cr)<140)) toast('Quédate encima del aviso para reducir al sospechoso');
    else toast('Acércate a una persona para darle el alto',true); }
  else if(a==='backup'){ const c=homeCity(); const cand=actors.filter(x=>x.st.role==='agente'&&x.st.order!=='seguir'&&x.st.energy>20).sort((p,q)=>dist(p,player)-dist(q,player)).slice(0,Math.max(0,Math.min(2,4-followers().length)));
    if(!cand.length){ toast('No hay agentes disponibles. Contrata más o deja que descansen',true); return; }
    cand.forEach(x=>{ x.st.order='seguir'; x.state='idle'; if(x.target){ x.target.taken=null; x.target=null; } }); toast(`Refuerzos en camino: ${cand.map(x=>x.st.name).join(' y ')}`); void c; }
  else if(a==='heli'){ if(U('heli')) openPanel('com'); else toast('Aún no tienes helicóptero. Cómpralo en Flota → Especialistas',true); }
  saveLocal();
}
function settingsModal(){
  openModal({title:'Ajustes',html:`
    <label class="chk"><input type="checkbox" id="setAuto" ${S.auto?'checked':''}> Leer los derechos siempre sin preguntar en delitos flagrantes</label>
    <label class="chk"><input type="checkbox" id="setRain" ${S.rainOn?'checked':''}> Lluvia y cambios de tiempo</label>
    <div class="note">La partida se guarda sola en este navegador.</div>`,
    acts:[{l:'Cómo se juega',fn:()=>{ closeModal(); $('help').hidden=false; }},{l:'Reiniciar partida',cls:'bad',fn:()=>{ closeModal(); $('confirm').hidden=false; }},{l:'Cerrar',cls:'go',fn:closeModal}]});
  $('setAuto').onchange=e=>{ S.auto=e.target.checked; saveLocal(); }; $('setRain').onchange=e=>{ S.rainOn=e.target.checked; if(!S.rainOn) weather.target=0; saveLocal(); };
}
function mailModal(){
  S.unread=0;
  const list=S.log.length?S.log.map(l=>`<li class="${l.bad?'bad':''}"><span class="tag">Día ${Math.floor((l.h+8)/24)+1} ${String(Math.floor((l.h+8)%24)).padStart(2,'0')}:00</span> ${l.msg}</li>`).join(''):'<li>Sin avisos todavía.</li>';
  openModal({title:'Avisos de la central',html:`<ul class="log">${list}</ul>`,acts:[{l:'Cerrar',cls:'go',fn:closeModal}]});
}
function trophyModal(){
  const o=Object.keys(S.owned), st=S.stats;
  const A=[['Primera detención legal',st.legal>=1],['10 detenciones legales',st.legal>=10],['50 detenciones legales',st.legal>=50],['Primera condena',st.conv>=1],
    ['10 condenas sin ninguna nulidad',st.conv>=10&&st.nulls===0],['3 comisarías abiertas',o.length>=3],['Toda la Costa del Sol (Málaga, Marbella, Algeciras)',['malaga','marbella','algeciras'].every(x=>S.owned[x])],
    ['10 comisarías abiertas',o.length>=10],['Plantilla de 15 personas',S.staff.length>=15],['Primera misión completada',st.missions>=1],['Operación Costa del Sol',S.done.includes('m11')],
    ['Nivel 10 de jefe',lvlFromXp(S.xp)>=10],['Un millón de euros ganados',st.earned>=1e6]];
  const n=A.filter(x=>x[1]).length;
  openModal({title:`Logros · ${n}/${A.length}`,html:`<ul class="log">${A.map(([t,ok])=>`<li class="${ok?'ok':''}">${ok?'✓':'○'} ${t}</li>`).join('')}</ul>`,acts:[{l:'Cerrar',cls:'go',fn:closeModal}]});
}
function pauseModal(){ openModal({title:'Pausa',html:`<div class="note">El tiempo está detenido.</div>`,acts:[{l:'Continuar',cls:'go',fn:closeModal},{l:'Ajustes',fn:settingsModal}]}); }

// ================= PANEL Y MODALES =================
function openModal({title,html,acts}){
  $('mTitle').textContent=title; $('mBody').innerHTML=html; const A=$('mActs'); A.innerHTML='';
  acts.forEach(a=>{ const b=document.createElement('button'); b.textContent=a.l; if(a.cls) b.className=a.cls; if(a.dis) b.disabled=true; b.onclick=a.fn; A.appendChild(b); });
  $('modal').hidden=false; keys.clear(); joy=null; const f=A.querySelector('button:not(:disabled)'); if(f) f.focus();
}
function closeModal(){ $('modal').hidden=true; renderPanel(); }
let panelTab='det';
function openPanel(tab){ if(tab) panelTab=tab; keys.clear(); joy=null; $('panel').hidden=false; renderPanel(); }
const TABS=[['det','Detenidos'],['pla','Plantilla'],['per','Flota y personal'],['ins','Instalaciones'],['com','Comisarías'],['est','Estadísticas'],['mis','Misiones']];
function renderPanel(){
  if($('panel').hidden) return;
  const st=stationHere();
  $('pWhere').textContent=st?'Comisaría de '+st.n:'Fuera de comisaría: órdenes por radio y consulta';
  $('pTabs').innerHTML=TABS.map(([id,l])=>`<button role="tab" aria-selected="${panelTab===id}" data-tab="${id}">${l}</button>`).join('');
  const need=st?'':'disabled title="Ve a una comisaría"';
  let h='';
  if(panelTab==='det'){
    h+=`<div class="note">Plazo máximo de detención: 72 horas (art. 17.2 CE). El abogado de oficio llega solo. Sin él, no tomes declaración.</div>`;
    if(S.carry.length) h+=`<div class="tag gold">Llevas ${S.carry.length} detenido(s) contigo. Entrégalos en el círculo azul.</div>`;
    if(!S.custody.length) h+=`<div class="item"><div><b>Calabozos vacíos</b><div class="d">Detén a sospechosos y entrégalos en cualquier comisaría.</div></div></div>`;
    for(const d of S.custody){
      const flags=[d.rights?'<span class="tag ok">derechos leídos</span>':'<span class="tag bad">sin derechos</span>', d.tainted?'<span class="tag bad">prueba ilícita</span>':'', d.coerced?'<span class="tag bad">declaración nula</span>':'',
        d.lawyer?'<span class="tag ok">abogado presente</span>':`<span class="tag">abogado en ${Math.max(1,Math.ceil(d.lawyerAt-d.h))} h</span>`, d.h>=60?`<span class="tag bad">${d.h} h / 72</span>`:`<span class="tag">${d.h} h / 72</span>`].join('');
      h+=`<div class="item"><div><b>${d.name}</b><div class="d">${d.crime} · ${d.art} · ${CBY[d.city].n}</div><div>${flags}</div>
        <div class="bar"><i style="width:${d.ev}%"></i></div><div class="d">Pruebas ${Math.round(d.ev)} %${d.ev<50?' · insuficientes para condena':''}</div></div>
        <div class="btnrow"><button data-a="int:${d.id}" ${need}>Interrogar</button><button class="go" data-a="court:${d.id}" ${need}>Pasar al juez</button><button data-a="free:${d.id}" ${need}>Liberar</button></div></div>`;
    }
  } else if(panelTab==='pla'){
    h+=`<div class="note">Da órdenes por radio a cualquier persona de tu plantilla. Hasta 4 pueden acompañarte a la vez. La energía baja trabajando y sube descansando.</div>`;
    for(const id of Object.keys(S.owned)){
      h+=`<div class="citygrp">${CBY[id].n} · nivel ${S.owned[id].lvl||1}</div>`;
      for(const s of S.staff.filter(x=>x.city===id)){ const R=ROLES[s.role];
        const opts=R.orders.map(([o,l])=>`<option value="${o}" ${s.order===o?'selected':''}>${l}</option>`).join('')+
          Object.keys(S.owned).filter(c=>c!==id&&s.role!=='jefe').map(c=>`<option value="tr:${c}">Trasladar a ${CBY[c].n}</option>`).join('');
        h+=`<div class="item"><div class="who"><div class="avatar" style="background:${R.color}">${s.name.split(' ').slice(-2).map(w=>w[0]).join('')}</div>
          <div><b>${s.name}</b> <span class="tag">${R.n}</span><span class="tag gold">nv ${lvlOf(s)}</span>${s.dog?`<span class="tag ok">${s.dog}</span>`:''}
          <div class="d">${ORDERTXT[s.order]||s.order}</div><div class="energy"><i style="width:${s.energy}%;background:${s.energy<30?'var(--siren)':'var(--ok)'}"></i></div></div></div>
          <div class="btnrow">${R.orders.length?`<select data-st="${s.id}" aria-label="Orden para ${s.name}">${s.order==='traslado'?'<option>Trasladándose</option>':''}${opts}</select>`:'<span class="tag">coordina el turno</span>'}</div></div>`; }
    }
  } else if(panelTab==='per'){
    if(st){ const o=S.owned[st.id], n=agN(st.id), mx=agMax(st.id);
      h+=`<div class="sec">Comisaría de ${st.n}</div>
      <div class="item"><div><b>Ampliar comisaría · nivel ${o.lvl||1}</b><div class="d">Más plazas para agentes y un edificio más grande. ${(o.lvl||1)>=3?'Con helipuerto.':''}</div></div><div class="btnrow"><button class="go" data-a="lvl" ${(o.lvl||1)>=3||S.money<lvlCost(st.id)?'disabled':''}>${(o.lvl||1)>=3?'Nivel máximo':eur(lvlCost(st.id))}</button></div></div>
      <div class="item"><div><b>Agentes · ${n}/${mx}</b><div class="d">Nuevo personaje con nombre propio. Patrulla ${st.n} y detiene según la ley</div></div><div class="btnrow"><button class="go" data-a="ag" ${n>=mx||S.money<agCost(st.id)?'disabled':''}>${n>=mx?'Amplía la comisaría':'Contratar $'+fmt(agCost(st.id))}</button></div></div>
      <div class="item"><div><b>Coches patrulla · ${o.car}/${n}</b><div class="d">Tus agentes llegan casi el doble de rápido</div></div><div class="btnrow"><button class="go" data-a="car" ${o.car>=n||S.money<carCost(st.id)?'disabled':''}>${o.car>=n?'Contrata más agentes':'Comprar $'+fmt(carCost(st.id))}</button></div></div>`; }
    else h+=`<div class="note">Ve a una de tus comisarías para contratar personal allí.</div>`;
    h+=`<div class="sec">Especialistas y unidades</div>`+upgList('p',st);
  } else if(panelTab==='ins'){ h+=upgList('i',st); }
  else if(panelTab==='est'){ const t=S.stats, rows=[['Nivel de jefe',lvlFromXp(S.xp)],['Experiencia',fmt(S.xp)+' XP'],['Detenciones legales',t.legal],['Condenas',t.conv],['Libertades por falta de pruebas',t.free],['Detenciones anuladas por el juez',t.nulls],
      ['Misiones completadas',t.missions],['Comisarías',Object.keys(S.owned).length],['Plantilla',S.staff.length+' personas'],['Coches patrulla',Object.values(S.owned).reduce((x,y)=>x+y.car,0)],['Dinero ganado',eur(t.earned||0)],['Días de servicio',Math.floor((S.time+8)/24)+1]];
    h+=rows.map(([k,v])=>`<div class="item"><div><b>${k}</b></div><div class="btnrow"><span class="tag gold" style="font-size:14px">${v}</span></div></div>`).join('');
    const tot=t.conv+t.nulls+t.free; h+=`<div class="note">Tasa de casos limpios: ${tot?Math.round(t.conv/tot*100):0} % de los casos acabaron en condena.</div>`; }
  else if(panelTab==='com'){
    for(const c of CITIES){ const o=S.owned[c.id], d=Math.round(dist(player,c)/K*85);
      h+=`<div class="item"><div><b>${c.n}</b><div class="d">${o?`nivel ${o.lvl||1} · ${S.staff.filter(s=>s.city===c.id).length} personas · ${o.car} coches`:`Abrir: ${eur(c.cost)} · ve a la plaza central`} · a ${d} km · casos ×${c.mult.toFixed(1)}</div></div>
        <div class="btnrow">${o&&U('heli')&&st!==c?`<button data-a="fly:${c.id}" ${need}>Volar</button>`:''}${o?'<span class="tag ok">tuya</span>':''}</div></div>`; }
  } else if(panelTab==='mis'){
    const m=curMis();
    if(m){ const s=curStep();
      h+=`<div class="item"><div><b>${m.n}</b> <span class="tag gold">activa</span><div class="d">${m.d}</div>
        <ul class="log">${m.steps.map((x,i)=>`<li class="${i<S.mis.i?'ok':''}">${i<S.mis.i?'✓ ':i===S.mis.i?'▶ ':''}${stepText(x)}</li>`).join('')}</ul></div>
        <div class="btnrow">${s.t==='warrant'&&!S.mis.d.ready?`<button class="go" data-a="warrant" ${need}>Solicitar orden judicial</button>`:''}<button class="bad" data-a="abandon">Abandonar</button></div></div>`; }
    for(const x of MIS){ if(m&&x.id===m.id) continue; const done=S.done.includes(x.id), av=misAvail(x);
      h+=`<div class="item"><div><b>${x.n}</b> ${done?'<span class="tag ok">completada</span>':''}<div class="d">${x.zona} · ${x.d}</div>
        ${!done&&!av?`<div class="d">Requiere: ${x.pre.filter(p=>!S.done.includes(p)).map(p=>MBY[p].n).join(', ')}</div>`:''}</div>
        <div class="btnrow">${av?`<button class="go" data-a="start:${x.id}" ${m?'disabled title="Ya tienes una misión activa"':''}>Empezar · ${eur(x.rw)}</button>`:''}</div></div>`; }
  }
  $('pBody').innerHTML=h;
}
function upgList(g,st){
  let h=''; for(const id in UPG){ const u=UPG[id]; if(u.g!==g) continue; const lv=U(id), mx=lv>=u.max, c=ucost(id);
    h+=`<div class="item"><div><b>${u.n}${u.max>1?` · ${u.role?lv+' en plantilla':'nivel '+lv}`:lv?' · activa':''}</b><div class="d">${u.d}</div></div>
      <div class="btnrow"><button class="go" data-a="up:${id}" ${mx||!st||S.money<c?'disabled':''} ${!st?'title="Ve a una comisaría"':''}>${mx?(u.max>1?'Máximo':'Comprada'):eur(c)}</button></div></div>`; }
  return h;
}
$('pTabs').addEventListener('click',e=>{ const b=e.target.closest('[data-tab]'); if(b){ panelTab=b.dataset.tab; renderPanel(); } });
$('pBody').addEventListener('change',e=>{ const sel=e.target.closest('select[data-st]'); if(!sel) return; const st=S.staff.find(s=>String(s.id)===sel.dataset.st); if(!st) return;
  const v=sel.value; if(v.startsWith('tr:')) setOrder(st,'traslado',v.slice(3)); else setOrder(st,v); saveLocal(); renderPanel(); });
$('pBody').addEventListener('click',e=>{
  const b=e.target.closest('[data-a]'); if(!b||b.disabled) return; const [a,arg]=b.dataset.a.split(':'); const st=stationHere();
  const d=arg&&S.custody.find(x=>String(x.id)===arg);
  if(a==='int'&&d) return interrogate(d);
  if(a==='court'&&d) court(d);
  if(a==='free'&&d){ S.custody.splice(S.custody.indexOf(d),1); toast(d.name+' queda en libertad'); }
  if(a==='lvl'&&st){ const c=lvlCost(st.id); if(S.money>=c){ S.money-=c; S.owned[st.id].lvl=(S.owned[st.id].lvl||1)+1; toast(`Comisaría de ${st.n} ampliada a nivel ${S.owned[st.id].lvl}`); } }
  if(a==='ag'&&st){ const c=agCost(st.id); if(S.money>=c&&agN(st.id)<agMax(st.id)){ S.money-=c; const n=newStaff('agente',st.id); syncActors(); toast(`${n.name} se incorpora a ${st.n}`); } }
  if(a==='car'&&st){ const c=carCost(st.id); if(S.money>=c){ S.money-=c; S.owned[st.id].car++; syncActors(); toast('Coche patrulla en '+st.n); } }
  if(a==='up'&&st){ const c=ucost(arg), u=UPG[arg]; if(S.money>=c&&U(arg)<u.max){ S.money-=c; S.up[arg]=U(arg)+1;
      if(u.role){ const n=newStaff(u.role,st.id); syncActors(); toast(`${n.name} (${ROLES[u.role].n}) se incorpora a ${st.n}${n.dog?' con '+n.dog:''}`); } else toast(u.n+(u.max>1?' · nivel '+U(arg):' disponible')); } }
  if(a==='fly'){ const c=CBY[arg]; player.x=c.x; player.y=c.y+60; followers().forEach(f=>{ f.x=player.x; f.y=player.y; }); $('panel').hidden=true; toast('Aterrizas en '+c.n); }
  if(a==='start') startMission(arg);
  if(a==='abandon'){ abandonMission(); toast('Misión abandonada'); }
  if(a==='warrant'&&S.mis){ const s=curStep(); S.mis.d.ready=S.time+s.h; toast(`Solicitud enviada al juzgado. Respuesta en ${s.h} h`); }
  saveLocal(); renderPanel();
});

// ================= BUCLE =================
let last=0;
function loop(t){
  const dt=Math.min(.05,(t-last)/1000||0); last=t; now=t; hintMsg='';
  const busy=paused();
  if(!busy||(inHub&&!frozen()&&$('help').hidden)) update(dt);
  if(!inHub||!window.PE_HUB||!PE_HUB.isOpen()) draw();
  else { hubT+=dt; if(hubT>3){ hubT=0; PE_HUB.update(hubInfo(hubCity)); } }
  hudT+=dt; if(hudT>.15){ hudT=0; hud(); drawMini(); }
  requestAnimationFrame(loop);
}
$('pClose').onclick=()=>{ $('panel').hidden=true; };
$('bStart').onclick=()=>{ $('help').hidden=true; S.seen=true; saveLocal(); };
$('bNo').onclick=()=>{ $('confirm').hidden=true; };
$('bYes').onclick=()=>{ try{localStorage.removeItem(SAVEKEY);}catch(e){} init({...fresh(),seen:true}); $('confirm').hidden=true; openHub(CBY.madrid); toast('Partida nueva'); };
$('bPatrol').onclick=()=>closeHub();
$('bMail').onclick=mailModal; $('bTrophy').onclick=trophyModal; $('bSettings').onclick=settingsModal; $('bPause').onclick=pauseModal;
$('zIn').onclick=()=>{ mmZoom=Math.max(900,mmZoom/1.6); drawMini(); }; $('zOut').onclick=()=>{ mmZoom=Math.min(16000,mmZoom*1.6); drawMini(); };
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{ const g=b.dataset.go; if(g==='hub') openHub(); else { setSideOn(g); openPanel(g); } }));
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openPanel(b.dataset.open)));
document.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>doAction(b.dataset.act)));
addEventListener('visibilitychange',()=>{ if(document.hidden) saveLocal(); });
if(window.PE_ICONS) PE_ICONS.fill();
window.PATRULLA_DEBUG={get S(){return S;},get peds(){return peds;},get actors(){return actors;},get player(){return player;},pedModal,staffModal,openPanel,startMission,openHub,closeHub};

window.claude?.hot?.snapshot?.(()=>serialize());
const start=data=>{ init(data&&typeof data.money==='number'?data:loadLocal()); openHub(cityAt(player.x,player.y)&&S.owned[cityAt(player.x,player.y).id]?cityAt(player.x,player.y):CBY.madrid); requestAnimationFrame(t=>{last=t;loop(t);}); };
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
})();
