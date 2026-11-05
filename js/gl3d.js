// Patrulla España · modelos 3D con GLTF (three.js r128)
// Personas realistas: Quaternius "Universal Base Characters" + "Universal Animation Library" 1 y 2 (CC0).
// La ropa (uniforme, traje, chándal, mono de preso…) se pinta sobre la textura del cuerpo con su mapa UV,
// así cada personaje conserva la anatomía, la piel y la luz realistas y cambia solo lo que lleva puesto.
// Si los modelos no cargan, el juego sigue con las personas procedurales de siempre.
window.PE_GL = (() => {
'use strict';
const ok = () => typeof THREE !== 'undefined' && !!THREE.GLTFLoader && !!THREE.SkeletonUtils;
const G = { budget:2, ready:false, loading:false, err:null, cbs:[], body:{}, hair:{}, clips:{}, skin:{}, outfits:new Map(), live:new Set() };
const BASE = (() => { try { const s=document.currentScript&&document.currentScript.src; if(s&&/\/js\/gl3d\.js/.test(s)) return s.replace(/js\/gl3d\.js.*$/,''); } catch(e){} return ''; })();
const HAIRS = ['Hair_SimpleParted','Hair_Buzzed','Hair_Long','Hair_Beard'];
const HEIGHT = 2.12;   // altura de una persona en unidades del juego (igual que la procedural)

// ---------- carga ----------
function load(){
  if(G.loading||!ok()) return; G.loading=true;
  const L=new THREE.GLTFLoader(), TL=new THREE.TextureLoader();
  const get=f=>new Promise(r=>L.load(BASE+'modelos/'+f,g=>r(g),undefined,e=>{ console.warn('modelo',f,e); r(null); }));
  const img=f=>new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.onerror=()=>r(null); i.src=BASE+'modelos/'+f; });
  Promise.all([get('humano-h.glb'),get('humano-m.glb'),get('anim-1.glb'),get('anim-2.glb'),...HAIRS.map(h=>get('pelo-'+h+'.glb')),img('piel-h-clara.jpg'),img('piel-m-clara.jpg')]).then(r=>{
    const [h,m,a1,a2]=r, hairs=r.slice(4,4+HAIRS.length), [lh,lm]=r.slice(4+HAIRS.length);
    if(!h||!m||!a1){ G.err='faltan modelos'; return; }
    for(const c of [...a1.animations,...(a2?a2.animations:[])]) G.clips[c.name]=c;
    G.body.h=prep(h,lh); G.body.m=prep(m,lm);
    HAIRS.forEach((k,i)=>{ if(hairs[i]) G.hair[k]=hairs[i]; });
    G.ready=true; G.cbs.splice(0).forEach(f=>{ try{ f(); }catch(e){ console.warn(e); } });
  }).catch(e=>{ G.err=e; console.warn('PE_GL',e); });
}
function onReady(f){ if(G.ready) f(); else G.cbs.push(f); }

// ---------- preparación del cuerpo: zonas por hueso dominante ----------
// zonas: 0 cabeza y cuello · 1 torso · 2 cadera · 3 brazo · 4 antebrazo · 5 mano · 6 muslo · 7 pierna · 8 pie
const ZONE=n=>/^(Head|neck)/i.test(n)?0:/^(spine|clavicle)/i.test(n)?1:/^pelvis/i.test(n)?2:/^upperarm/i.test(n)?3:/^lowerarm/i.test(n)?4:/^(hand|thumb|index|middle|ring|pinky)/i.test(n)?5:/^thigh/i.test(n)?6:/^calf/i.test(n)?7:/^(foot|ball)/i.test(n)?8:1;
function prep(g,lightImg){
  const sc=g.scene; sc.updateMatrixWorld(true); const P={g,body:null,zones:null,pos:null,lightImg,box:new THREE.Box3()};
  sc.traverse(o=>{ if(!o.isSkinnedMesh) return; o.frustumCulled=false;
    if(/Superhero|SuperHero/.test(o.name)){ P.body=o; const sk=o.skeleton, si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight, pa=o.geometry.attributes.position, n=pa.count;
      P.zones=new Uint8Array(n); P.pos=new Float32Array(n*3); const v=new THREE.Vector3();
      for(let i=0;i<n;i++){ let best=0,bw=-1; const ws=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)], is=[si.getX(i),si.getY(i),si.getZ(i),si.getW(i)]; for(let k=0;k<4;k++){ if(ws[k]>bw){ bw=ws[k]; best=is[k]; } }
        P.zones[i]=ZONE((sk.bones[best]||sk.bones[0]).name); v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld); P.pos.set([v.x,v.y,v.z],i*3); P.box.expandByPoint(v); } } });
  const m=P.body&&P.body.material; P.baseImg=m&&m.map&&m.map.image; P.normImg=m&&m.normalMap&&m.normalMap.image; P.roughImg=m&&m.roughnessMap&&m.roughnessMap.image;
  return P;
}

// ---------- ropa pintada sobre el mapa UV ----------
let NOISE=null; function noise(){ if(NOISE) return NOISE; const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'), im=g.createImageData(256,256);
  for(let i=0;i<im.data.length;i+=4){ const v=128+(Math.random()-.5)*255; im.data[i]=im.data[i+1]=im.data[i+2]=v; im.data[i+3]=255; } g.putImageData(im,0,0); return NOISE=c; }
// paleta cerrada para que la gente de la calle comparta texturas
const PAL=[0x14203f,0x0c0f16,0x23262e,0x1d2333,0x2a3040,0x7b808a,0xd7dce3,0xeef2f8,0xe8742a,0xd8661f,0x8e2b2b,0xc94a4a,0x3a6b4a,0x2f5d8a,0x6b4a8e,0xd9b84a,0x5a4a38,0x3a2a1c,0x9a9a9a,0x111111].map(c=>new THREE.Color(c));
const SKINS=[0xf1cdb0,0xe6b48e,0xc58c68,0x8d5a3b,0x5a3824].map(c=>new THREE.Color(c));
function snap(c,list){ if(c==null) return c; const k=new THREE.Color(c); let best=list[0],bd=1e9; for(const q of list){ const d=(q.r-k.r)**2+(q.g-k.g)**2+(q.b-k.b)**2; if(d<bd){ bd=d; best=q; } } return best.getHex(); }
function levels(P){ if(P.collarY) return; const H=P.box.max.y-P.box.min.y; P.hipY=P.box.min.y+H*.52; P.chestY=P.box.min.y+H*.72; P.collarY=P.box.min.y+H*.832;
  let zs=0,c=0; for(let i=0;i<P.zones.length;i++) if(P.zones[i]===0&&Math.abs(P.pos[i*3+1]-P.collarY-.04)<.03){ zs+=P.pos[i*3+2]; c++; } P.neckZ=c?zs/c:0; P.neckR=.082; }
const hex=c=>'#'+new THREE.Color(c==null?0x777777:c).getHexString();
function lum(c){ const k=new THREE.Color(c); return .299*k.r+.587*k.g+.114*k.b; }
function outfitKey(sex,o,size){ return [sex,size,hex(o.skin),hex(o.body),hex(o.legs),o.vest?hex(o.vest):'',o.suit?1:0,o.short?1:0,o.hood?1:0,o.prison?1:0,o.gloves?1:0].join('|'); }
function paintOutfit(P,sex,o,size){
  const key=outfitKey(sex,o,size); if(G.outfits.has(key)) return G.outfits.get(key);
  if(G.outfits.size>40){ const k0=G.outfits.keys().next().value; const v=G.outfits.get(k0); v.map.dispose(); v.normal.dispose(); v.rough.dispose(); G.outfits.delete(k0); }
  const N=size, mk=()=>{ const c=document.createElement('canvas'); c.width=c.height=N; return c; };
  const cb=mk(), cn=mk(), cr=mk(), gb=cb.getContext('2d',{willReadFrequently:true}), gn=cn.getContext('2d'), gr=cr.getContext('2d');
  // piel: textura clara u oscura según el tono, teñida hacia el color pedido
  const skinL=lum(o.skin||0xe6b48e), light=skinL>.42&&P.lightImg;
  gb.drawImage(light?P.lightImg:P.baseImg,0,0,N,N);
  const ref=new THREE.Color(light?0xe8bf9c:0x9b6a4c), want=new THREE.Color(o.skin||0xe6b48e);
  gb.globalCompositeOperation='multiply'; gb.fillStyle='#'+new THREE.Color(Math.min(1,want.r/ref.r*.92+.08),Math.min(1,want.g/ref.g*.92+.08),Math.min(1,want.b/ref.b*.92+.08)).getHexString(); gb.fillRect(0,0,N,N); gb.globalCompositeOperation='source-over';
  if(P.normImg) gn.drawImage(P.normImg,0,0,N,N); else { gn.fillStyle='#8080ff'; gn.fillRect(0,0,N,N); }
  if(P.roughImg) gr.drawImage(P.roughImg,0,0,N,N); else { gr.fillStyle='#999'; gr.fillRect(0,0,N,N); }
  // color de cada zona (null = piel)
  const shirt=hex(o.body), pants=hex(o.legs||0x1d2333), shoes=o.prison?'#e9e6df':'#14161a', vest=o.vest!=null?hex(o.vest):null;
  const sleeve=o.short?null:shirt, glove=o.gloves?'#15171b':null;
  const zoneCol=(z,x,y,zz)=>{
    if(z===6&&y>P.hipY) z=2;
    if(z===0||z===1){ const r=Math.hypot(x,zz-P.neckZ); if(z===0&&y>P.collarY+.05||y>P.collarY&&r<P.neckR) return (o.hood&&y<P.collarY+.1)?shirt:null;
      if(o.suit&&zz>0&&Math.abs(x)<.05+(P.collarY-y)*.12&&y>P.chestY-.22) return Math.abs(x)<.017&&y<P.collarY-.025?'#6b1c26':'#eef1f5';
      if(y<P.hipY) return pants; return vest&&y<P.collarY-.035?vest:shirt; }
    if(z===2) return y>P.hipY?(vest&&y<P.collarY-.035?vest:shirt):pants;
    if(z===2) return pants; if(z===3) return sleeve||null; if(z===4) return o.short?null:sleeve; if(z===5) return glove;
    if(z===6||z===7) return pants; if(z===8) return shoes; return null; };
  const geo=P.body.geometry, uv=geo.attributes.uv, idx=geo.index, Z=P.zones, X=P.pos;
  levels(P);
  const tri=(g,a,b,c,col)=>{ g.fillStyle=col; g.strokeStyle=col; g.lineWidth=2.2; g.beginPath(); g.moveTo(uv.getX(a)*N,uv.getY(a)*N); g.lineTo(uv.getX(b)*N,uv.getY(b)*N); g.lineTo(uv.getX(c)*N,uv.getY(c)*N); g.closePath(); g.fill(); g.stroke(); };
  // recorte de cada triángulo en franjas de altura (cintura y chaleco) para que los bordes salgan rectos
  const poly=(g,pts,col)=>{ g.fillStyle=col; g.strokeStyle=col; g.lineWidth=2.2; g.beginPath(); pts.forEach((q,j)=>j?g.lineTo(q[3]*N,q[4]*N):g.moveTo(q[3]*N,q[4]*N)); g.closePath(); g.fill(); g.stroke(); };
  const clip=(pts,t,keepAbove)=>{ const out=[]; for(let j=0;j<pts.length;j++){ const A=pts[j], B=pts[(j+1)%pts.length], ia=keepAbove?A[1]>=t:A[1]<t, ib=keepAbove?B[1]>=t:B[1]<t;
      if(ia) out.push(A); if(ia!==ib){ const f=(t-A[1])/(B[1]-A[1]); out.push(A.map((v,k)=>v+(B[k]-v)*f)); } } return out; };
  const cuts=[P.hipY,P.collarY-.035];
  const n=idx?idx.count:geo.attributes.position.count;
  for(let i=0;i<n;i+=3){ const a=idx?idx.getX(i):i, b=idx?idx.getX(i+1):i+1, c=idx?idx.getX(i+2):i+2;
    const z=Z[a]===Z[b]||Z[a]===Z[c]?Z[a]:Z[b];
    const pts=[a,b,c].map(v=>[X[v*3],X[v*3+1],X[v*3+2],uv.getX(v),uv.getY(v)]);
    const parts=(z<=2||z===6)?[clip(pts,cuts[0],false),clip(clip(pts,cuts[0],true),cuts[1],false),clip(pts,cuts[1],true)]:[pts];
    for(const q of parts){ if(q.length<3) continue; let cx=0,cy=0,cz=0; q.forEach(v=>{ cx+=v[0]; cy+=v[1]; cz+=v[2]; }); const col=zoneCol(z,cx/q.length,cy/q.length,cz/q.length); if(!col) continue;
      poly(gb,q,col); poly(gn,q,'#8080ff'); poly(gr,q,z===8?'#7a7a7a':'#e4e4e4'); } }
  // tejido: grano fino (capa de ruido precalculada) para que no parezca plástico
  gb.globalAlpha=.1; gb.globalCompositeOperation='overlay'; gb.drawImage(noise(),0,0,N,N); gb.globalAlpha=1; gb.globalCompositeOperation='source-over';
  const tx=(c,srgb)=>{ const t=new THREE.CanvasTexture(c); t.flipY=false; if(srgb) t.encoding=THREE.sRGBEncoding; t.anisotropy=4; return t; };
  const out={map:tx(cb,true),normal:tx(cn),rough:tx(cr)}; G.outfits.set(key,out); return out;
}

// ---------- volumen de la ropa: suaviza la musculatura y separa la tela del cuerpo ----------
// Se calcula una vez por sexo y tipo de manga; las costuras UV comparten desplazamiento para no abrir grietas.
const CLOTH_IN=[0,.022,.02,.012,.01,0,.017,.012,.014], CLOTH_SM=[0,6,9,2,2,0,5,3,1];
function clothGeo(P,sex,short){ const key=sex+'|'+(short?1:0); P.geos=P.geos||{}; if(P.geos[key]) return P.geos[key];
  const src=P.body.geometry, geo=src.clone(), pa=geo.attributes.position, na=geo.attributes.normal, n=pa.count, Z=P.zones, idx=geo.index;
  const sc=new THREE.Vector3(); P.body.matrixWorld.decompose(new THREE.Vector3(),new THREE.Quaternion(),sc); const gs=1/(sc.x||1);
  levels(P); const clothed=(z,i)=>z>=1&&z!==5&&!(short&&z===4)&&!(z===1&&P.pos[i*3+1]>P.collarY&&Math.hypot(P.pos[i*3],P.pos[i*3+2]-P.neckZ)<P.neckR);
  // soldar vértices duplicados por las costuras
  const map=new Map(), weld=new Int32Array(n); let W=0; const rep=[];
  for(let i=0;i<n;i++){ const k=Math.round(pa.getX(i)*2e4)+','+Math.round(pa.getY(i)*2e4)+','+Math.round(pa.getZ(i)*2e4); let w=map.get(k); if(w==null){ w=W++; map.set(k,w); rep.push(i); } weld[i]=w; }
  const nb=Array.from({length:W},()=>new Set()); const m=idx?idx.count:n;
  for(let t=0;t<m;t+=3){ const a=weld[idx?idx.getX(t):t], b=weld[idx?idx.getX(t+1):t+1], c=weld[idx?idx.getX(t+2):t+2]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
  const zw=new Uint8Array(W), ri=new Int32Array(W), pos=new Float32Array(W*3), nor=new Float32Array(W*3);
  for(let i=0;i<n;i++){ const w=weld[i]; zw[w]=Z[i]; ri[w]=i; pos[w*3]=pa.getX(i); pos[w*3+1]=pa.getY(i); pos[w*3+2]=pa.getZ(i); nor[w*3]+=na.getX(i); nor[w*3+1]+=na.getY(i); nor[w*3+2]+=na.getZ(i); }
  const it=Math.max(...CLOTH_SM); let cur=pos.slice();
  for(let r=0;r<it;r++){ const nx=cur.slice(); for(let w=0;w<W;w++){ const z=zw[w]; if(!clothed(z,ri[w])||r>=CLOTH_SM[z]) continue; let sx=0,sy=0,sz=0,c=0; for(const j of nb[w]){ sx+=cur[j*3]; sy+=cur[j*3+1]; sz+=cur[j*3+2]; c++; } if(!c) continue;
      nx[w*3]=cur[w*3]*.5+sx/c*.5; nx[w*3+1]=cur[w*3+1]*.5+sy/c*.5; nx[w*3+2]=cur[w*3+2]*.5+sz/c*.5; } cur=nx; }
  for(let i=0;i<n;i++){ const w=weld[i], z=zw[w]; if(!clothed(z,i)) continue; let x=nor[w*3],y=nor[w*3+1],q=nor[w*3+2]; const l=Math.hypot(x,y,q)||1; const d=CLOTH_IN[z]*gs/l;
    pa.setXYZ(i,cur[w*3]+x*d,cur[w*3+1]+y*d,cur[w*3+2]+q*d); }
  pa.needsUpdate=true; geo.computeVertexNormals(); P.geos[key]=geo; return geo; }

// ---------- complementos anclados a huesos ----------
function anchor(bone,root,pos,quat){ const g=new THREE.Group(); root.updateMatrixWorld(true);
  const want=new THREE.Matrix4().compose(pos,quat||new THREE.Quaternion(),new THREE.Vector3(1,1,1)).premultiply(root.matrixWorld);
  new THREE.Matrix4().copy(bone.matrixWorld).invert().multiply(want).decompose(g.position,g.quaternion,g.scale); bone.add(g); return g; }
const MAT={};
const mat=(c,r=.6,m=0)=>{ const k=c+'|'+r+'|'+m; return MAT[k]||(MAT[k]=new THREE.MeshStandardMaterial({color:new THREE.Color(c).convertSRGBToLinear(),roughness:r,metalness:m})); };
function cap(color){ const g=new THREE.Group(), cm=mat(color,.7);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(.116,28,14,0,Math.PI*2,0,Math.PI/2),cm); dome.scale.set(1,.6,1.06); g.add(dome);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.115,.115,.01,28,1,false,-Math.PI*.42,Math.PI*.84),cm); brim.scale.set(.95,1,1.05); brim.position.set(0,.006,.05); brim.rotation.x=.16; g.add(brim);
  const btn=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),cm); btn.position.y=.07; g.add(btn);
  const badge=new THREE.Mesh(new THREE.BoxGeometry(.04,.032,.006),mat(0xd9b04a,.3,.9)); badge.position.set(0,.04,.112); badge.rotation.x=-.4; g.add(badge);
  g.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); return g; }
function belt(r){ const g=new THREE.Group(); const b=new THREE.Mesh(new THREE.TorusGeometry(r,.02,8,32),mat(0x0c0d10,.38,.1)); b.rotation.x=Math.PI/2; b.scale.set(1,.78,1); g.add(b);
  for(const a of [-.9,.9,2.2]){ const p=new THREE.Mesh(new THREE.BoxGeometry(.06,.08,.05),mat(0x16181d,.5)); p.position.set(Math.sin(a)*r,-.01,Math.cos(a)*r*.78); p.rotation.y=a; g.add(p); }
  g.traverse(m=>{ if(m.isMesh) m.castShadow=true; }); return g; }
let BACKTX=null;
function backLabel(){ if(!BACKTX){ const c=document.createElement('canvas'); c.width=256; c.height=64; const g=c.getContext('2d'); g.fillStyle='rgba(0,0,0,0)'; g.fillRect(0,0,256,64); g.fillStyle='#f2f4f8'; g.font='bold 44px Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('POLICÍA',128,34); BACKTX=new THREE.CanvasTexture(c); BACKTX.encoding=THREE.sRGBEncoding; }
  const m=new THREE.Mesh(new THREE.PlaneGeometry(.3,.075),new THREE.MeshStandardMaterial({map:BACKTX,transparent:true,roughness:.6,depthWrite:false})); m.rotation.y=Math.PI; return m; }

// ---------- persona ----------
function backZ(P){ if(P.bz!=null) return P.bz; let z=0; const X=P.pos; for(let i=0;i<P.zones.length;i++) if(P.zones[i]===1&&Math.abs(X[i*3])<.08&&Math.abs(X[i*3+1]-P.chestY)<.08&&X[i*3+2]<z) z=X[i*3+2]; return P.bz=z; }
function makeHuman(o){
  if(!G.ready) return null;
  if(!o.must&&G.budget<=0) return null; G.budget--;
  o=Object.assign({},o,{body:snap(o.body,PAL),legs:snap(o.legs,PAL),skin:snap(o.skin==null?0xe6b48e:o.skin,SKINS),vest:o.vest==null?o.vest:snap(o.vest,PAL.concat([new THREE.Color(0xd7f04a)]))});
  const sex=o.long||o.female?'m':'h', P=G.body[sex]; if(!P||!P.body) return null;
  const size=o.big?1024:512, fit=paintOutfit(P,sex,o,size);
  const sc=THREE.SkeletonUtils.clone(P.g.scene); let body=null, head=null, pelvis=null, spine=null; const bones={};
  sc.traverse(m=>{ if(m.isBone){ bones[m.name]=m; } if(!m.isSkinnedMesh) return; m.frustumCulled=false; m.castShadow=true; m.receiveShadow=false;
    if(/Superhero|SuperHero/.test(m.name)){ body=m; m.geometry=clothGeo(P,sex,!!o.short); m.material=new THREE.MeshStandardMaterial({map:fit.map,normalMap:fit.normal,roughnessMap:fit.rough,roughness:1,metalness:0,skinning:true}); }
    else if(/Eyebrows/.test(m.name)){ m.material=m.material.clone(); m.material.color.set(o.hair||0x2b1b12); } });
  head=bones.Head; pelvis=bones.pelvis; spine=bones.spine_03||bones.spine_02;
  // pelo con el mismo esqueleto
  // variedad estable a partir del aspecto: peinado y barba
  const seed=o.seed!=null?o.seed:[...(hex(o.hair)+hex(o.body)+hex(o.skin))].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
  const hk=o.cap&&!o.long?'Hair_Buzzed':o.long?'Hair_Long':(o.bald?null:(o.hairStyle||(seed%3===0?'Hair_Buzzed':'Hair_SimpleParted')));
  if(o.beard==null&&!o.long&&!o.cap&&!o.suit&&seed%4===1) o.beard=true;
  const addHair=k=>{ const hg=G.hair[k]; if(!hg||!body) return; hg.scene.traverse(m=>{ if(!m.isSkinnedMesh) return; const hm=m.clone(); hm.material=m.material.clone(); hm.material.color.set(o.hair||0x2b1b12); hm.material.skinning=true;
      hm.bind(new THREE.Skeleton(m.skeleton.bones.map(b=>bones[b.name]||b),m.skeleton.boneInverses),body.bindMatrix); hm.frustumCulled=false; hm.castShadow=true; body.parent.add(hm); }); };
  if(hk) addHair(hk); if(!o.long&&o.beard) addHair('Hair_Beard');
  const root=new THREE.Group(); const k=HEIGHT/(P.box.max.y-P.box.min.y); sc.scale.setScalar(k); root.add(sc);
  // A-pose de referencia para anclar complementos
  root.updateMatrixWorld(true);
  if(o.cap&&head){ const top=P.box.max.y*k; const c=anchor(head,root,new THREE.Vector3(0,top-.075,.008)); const hat=cap(new THREE.Color(o.cap).getHex()); hat.scale.setScalar(k*.95); c.add(hat); }
  if((o.vest||o.back)&&pelvis){ const b=anchor(pelvis,root,new THREE.Vector3(0,P.hipY*k+.01,0)); b.add(belt(.165*k)); }
  if(o.back&&spine){ const bz=backZ(P); const b=anchor(spine,root,new THREE.Vector3(0,P.chestY*k-.03,(bz-.03)*k)); const l=backLabel(); l.scale.setScalar(k); b.add(l); }
  const mixer=new THREE.AnimationMixer(sc), acts={};
  const act=n=>{ if(acts[n]) return acts[n]; const c=G.clips[n]; if(!c) return null; return acts[n]=mixer.clipAction(c); };
  // huesos de mentira para el código que movía brazos y piernas de la persona procedural
  const dm=()=>new THREE.Group(); const legs=[dm(),dm()], arms=[dm(),dm()], hd=dm();
  const gl={mixer,act,cur:null,want:null,lock:null,sc,headBone:head,neck:bones.neck_01,last:null,spd:0,ph:Math.random()*20};
  root.userData={arms,legs,head:hd,ph:Math.random()*6,gl,human:true};
  play(root,'Idle_Loop',0); const a=acts.Idle_Loop; if(a) a.time=Math.random()*a.getClip().duration;
  G.live.add(root); return root;
}
function play(o,name,fade=.25,ts=1,once=false){ const g=o.userData.gl; if(!g) return; const a=g.act(name)||g.act('Idle_Loop'); if(!a) return; a.timeScale=ts;
  if(g.cur===name) return; const prev=g.cur&&g.act(g.cur);
  a.reset(); a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat); a.clampWhenFinished=once; a.setEffectiveWeight(1); a.play(); if(prev&&fade>0) prev.crossFadeTo(a,fade,false); else if(prev) prev.stop(); g.cur=name; }
// fija una animación (sentado, conduciendo, hablando…) o la libera con null para volver a la automática
function pose(o,name,opt){ const g=o&&o.userData&&o.userData.gl; if(!g) return false; g.lock=name||null; if(name) play(o,name,opt&&opt.fade!=null?opt.fade:.3,opt&&opt.ts||1,opt&&opt.once); return true; }
const Q=new THREE.Quaternion(), V=new THREE.Vector3(), W=new THREE.Quaternion(), WP=new THREE.Vector3();
function tick(dt){
  G.budget=2;
  for(const o of G.live){ const g=o.userData.gl;
    if(!o.parent){ g.orph=(g.orph||0)+dt; if(g.orph>3&&g.seen){ G.live.delete(o); g.mixer.stopAllAction(); } continue; } g.orph=0; g.seen=true;
    if(!g.lock){ o.getWorldPosition(WP); if(g.last){ const d=Math.hypot(WP.x-g.last.x,WP.z-g.last.z)/Math.max(dt,1e-3); g.spd+=(Math.min(d,20)-g.spd)*Math.min(1,dt*6); } else g.last=new THREE.Vector3(); g.last.copy(WP);
      const s=g.spd/(o.scale.x||1); let n='Idle_Loop',ts=1;
      if(g.want) n=g.want; else if(s>6.2){ n='Sprint_Loop'; ts=Math.min(1.35,s/7.5); } else if(s>2.9){ n='Jog_Fwd_Loop'; ts=Math.min(1.3,s/3.8); } else if(s>.35){ n='Walk_Loop'; ts=Math.max(.6,Math.min(1.5,s/1.55)); }
      else { g.ph+=dt; n=(g.idle||'Idle_Loop'); }
      play(o,n,.28,ts); }
    g.mixer.update(dt);
    // giros de cabeza que pide el juego (interrogatorio, calabozos)
    const h=o.userData.head; if(g.headBone&&h&&(h.rotation.x||h.rotation.y)){ const b=g.headBone;
      b.updateWorldMatrix(true,false); b.getWorldQuaternion(W).invert(); V.set(0,1,0).applyQuaternion(W).normalize(); Q.setFromAxisAngle(V,h.rotation.y); b.quaternion.multiply(Q);
      o.getWorldQuaternion(W); V.set(1,0,0).applyQuaternion(W); b.getWorldQuaternion(Q).invert(); V.applyQuaternion(Q).normalize(); Q.setFromAxisAngle(V,h.rotation.x); b.quaternion.multiply(Q); } }
}
return { load, onReady, makeHuman, pose, play, tick, ok, get ready(){ return G.ready; }, get err(){ return G.err; }, G };
})();
try{ if(document.readyState!=='loading') PE_GL.load(); else document.addEventListener('DOMContentLoaded',()=>PE_GL.load()); }catch(e){}
