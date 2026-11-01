// Patrulla España · escena 3D de "Mi Comisaría" (Three.js r128)
// Edificio, coches patrulla con sirenas, helicóptero, bandera, agentes y el jefe visto de espaldas.
window.PE_HUB = (() => {
'use strict';
const ok = () => typeof THREE !== 'undefined';
let R=null, scene, cam, cvs, running=false, last=0, T=0, info=null, key='';
let sun, hemi, skyMesh, pmrem, envRT=null, mode='', dyn=null, flag=null, flagPos=null, heli=null, rotor=null, trotor=null;
let cars=[], people=[], glowTex=null, rain=null, lampGlows=[], winMats=[], blink=[], camSway=0;

function ctex(w,h,fn,rep){ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=8; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } return t; }
const M=o=>new THREE.MeshStandardMaterial(o);
function mesh(geo,mat,x=0,y=0,z=0,cast=true){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=true; return m; }
const rnd=(a,b)=>a+Math.random()*(b-a);

// ---------- texturas ----------
function skyTex(kind){
  return ctex(1024,512,(g,w,h)=>{
    const gr=g.createLinearGradient(0,0,0,h/2);
    const P={day:['#2a63b0','#7fb0e2','#e7dccb'],dusk:['#1a2550','#b4614a','#f4b26a'],night:['#03071a','#0c1838','#24345e']}[kind];
    gr.addColorStop(0,P[0]); gr.addColorStop(.7,P[1]); gr.addColorStop(1,P[2]); g.fillStyle=gr; g.fillRect(0,0,w,h/2);
    g.fillStyle=P[2]; g.fillRect(0,h/2,w,h/2);
    if(kind==='night'){ for(let i=0;i<500;i++){ g.fillStyle=`rgba(255,255,255,${Math.random()*.8})`; g.fillRect(Math.random()*w,Math.random()*h*.45,1.2,1.2); } }
    const cc=kind==='day'?'255,255,255':kind==='dusk'?'255,190,150':'90,110,160';
    for(let i=0;i<70;i++){ const x=Math.random()*w, y=40+Math.random()*170, r=20+Math.random()*60;
      const rg=g.createRadialGradient(x,y,0,x,y,r); rg.addColorStop(0,`rgba(${cc},${kind==='night'?.12:.55})`); rg.addColorStop(1,`rgba(${cc},0)`);
      g.fillStyle=rg; g.beginPath(); g.ellipse(x,y,r*2.2,r*.7,0,0,7); g.fill(); }
  });
}
function asphaltTex(){ return ctex(512,512,(g,w,h)=>{ g.fillStyle='#2b2f37'; g.fillRect(0,0,w,h);
  for(let i=0;i<9000;i++){ const v=30+Math.random()*40; g.fillStyle=`rgb(${v},${v+2},${v+6})`; g.fillRect(Math.random()*w,Math.random()*h,2,2); }
  for(let i=0;i<14;i++){ g.fillStyle='rgba(10,14,22,.35)'; g.beginPath(); g.ellipse(Math.random()*w,Math.random()*h,20+Math.random()*60,8+Math.random()*20,Math.random()*3,0,7); g.fill(); } },[30,30]); }
function pavingTex(){ return ctex(512,512,(g,w,h)=>{ g.fillStyle='#8d929b'; g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=64) for(let x=0;x<w;x+=64){ const v=128+Math.random()*30; g.fillStyle=`rgb(${v},${v+3},${v+8})`; g.fillRect(x+2,y+2,60,60); }
  for(let i=0;i<10;i++){ g.fillStyle='rgba(40,50,70,.35)'; g.beginPath(); g.ellipse(Math.random()*w,Math.random()*h,30+Math.random()*50,10+Math.random()*16,Math.random()*3,0,7); g.fill(); } },[10,8]); }
function windowTex(warm){ return ctex(1024,256,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#1c2c4a'); gr.addColorStop(1,'#0b1222'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  for(let x=0;x<w;x+=64) for(let y=0;y<h;y+=128){ if(Math.random()<.65){ const l=g.createLinearGradient(0,y,0,y+120); l.addColorStop(0,warm?'rgba(255,214,150,.95)':'rgba(170,200,240,.5)'); l.addColorStop(1,warm?'rgba(255,190,110,.6)':'rgba(120,150,200,.3)'); g.fillStyle=l; g.fillRect(x+6,y+8,52,112);
      g.fillStyle='rgba(30,40,60,.6)'; g.fillRect(x+10+Math.random()*30,y+60,14,60); } }
  g.fillStyle='#c8ced8'; for(let x=0;x<=w;x+=64) g.fillRect(x-3,0,6,h); for(let y=0;y<=h;y+=128) g.fillRect(0,y-4,w,8);
  const sh=g.createLinearGradient(0,0,w,h); sh.addColorStop(0,'rgba(255,255,255,.18)'); sh.addColorStop(.4,'rgba(255,255,255,0)'); g.fillStyle=sh; g.fillRect(0,0,w,h); }); }
function facadeTex(base){ return ctex(256,512,(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h);
  for(let y=16;y<h;y+=40) for(let x=14;x<w;x+=40){ g.fillStyle=Math.random()<.3?'#ffd8a0':'#2a3a58'; g.fillRect(x,y,24,26); g.fillStyle='rgba(255,255,255,.25)'; g.fillRect(x,y,24,3); } }); }
function signTex(){ return ctex(1024,160,(g,w,h)=>{ g.fillStyle='#0f1d42'; g.fillRect(0,0,w,h);
  g.save(); g.translate(90,80); g.fillStyle='#c99a1c'; g.beginPath(); g.moveTo(0,-62); g.lineTo(52,-42); g.lineTo(52,6); g.quadraticCurveTo(48,48,0,66); g.quadraticCurveTo(-48,48,-52,6); g.lineTo(-52,-42); g.closePath(); g.fill();
  g.fillStyle='#14234d'; g.scale(.8,.8); g.beginPath(); g.moveTo(0,-62); g.lineTo(52,-42); g.lineTo(52,6); g.quadraticCurveTo(48,48,0,66); g.quadraticCurveTo(-48,48,-52,6); g.lineTo(-52,-42); g.closePath(); g.fill();
  g.fillStyle='#ffc94a'; g.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?14:34; g.lineTo(Math.cos(a)*r,Math.sin(a)*r); } g.closePath(); g.fill(); g.restore();
  g.fillStyle='#ffffff'; g.font='bold 92px Arial'; g.textBaseline='middle'; g.fillText('COMISARÍA',190,84); }); }
function liveryTex(){ return ctex(512,128,(g,w,h)=>{ g.fillStyle='#132250'; g.fillRect(0,0,w,h); g.fillStyle='#eef2f8'; g.fillRect(0,h*.52,w,h*.48);
  g.fillStyle='#3d8bff'; g.fillRect(0,h*.47,w,h*.07); g.fillStyle='#132250'; g.font='bold 44px Arial'; g.textAlign='center'; g.fillText('POLICÍA',w/2,h*.9); }); }
function backTex(){ return ctex(256,96,(g,w,h)=>{ g.fillStyle='#111'; g.fillRect(0,0,w,h); g.fillStyle='#f3f6fb'; g.font='bold 58px Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('POLICÍA',w/2,h/2+2); }); }
function flagTex(){ return ctex(300,200,(g,w,h)=>{ g.fillStyle='#c60b1e'; g.fillRect(0,0,w,h); g.fillStyle='#ffc400'; g.fillRect(0,h/4,w,h/2); }); }
function glow(){ return ctex(128,128,(g)=>{ const r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.25,'rgba(255,255,255,.5)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,128,128); }); }
function heliTex(){ return ctex(512,128,(g,w,h)=>{ g.fillStyle='#132250'; g.fillRect(0,0,w,h); g.fillStyle='#eef2f8'; g.fillRect(0,h*.55,w,h*.18); g.fillStyle='#ffc94a'; g.fillRect(0,h*.73,w,h*.05); g.fillStyle='#eef2f8'; g.font='bold 36px Arial'; g.textAlign='center'; g.fillText('POLICÍA',w/2,h*.45); }); }

// ---------- modelos ----------
function sprite(color,scale){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); s.scale.set(scale,scale,1); return s; }
function makeCar(){
  const g=new THREE.Group(), liv=liveryTex();
  const navy=M({color:0x132250,roughness:.22,metalness:.75}), side=M({map:liv,roughness:.25,metalness:.55});
  const glass=M({color:0x0a111d,roughness:.05,metalness:.95});
  const body=mesh(new THREE.BoxGeometry(4.6,1.0,2.0),[navy,navy,navy,navy,side,side],0,.85,0); g.add(body);
  const hood=mesh(new THREE.BoxGeometry(1.2,.2,1.9),navy,1.6,1.42,0); hood.rotation.z=-.12; g.add(hood);
  g.add(mesh(new THREE.BoxGeometry(2.4,.8,1.84),glass,-.25,1.75,0));
  g.add(mesh(new THREE.BoxGeometry(2.0,.08,1.7),navy,-.35,2.18,0));
  g.add(mesh(new THREE.BoxGeometry(.5,.16,1.5),M({color:0x111111,roughness:.4}),-.35,2.3,0));
  const red=M({color:0x330000,emissive:0xff2030,emissiveIntensity:0}), blue=M({color:0x000833,emissive:0x2060ff,emissiveIntensity:0});
  g.add(mesh(new THREE.BoxGeometry(.42,.16,.6),red,-.35,2.38,.42,false)); g.add(mesh(new THREE.BoxGeometry(.42,.16,.6),blue,-.35,2.38,-.42,false));
  const tire=M({color:0x0b0b0e,roughness:.85}), rim=M({color:0x9aa3b0,metalness:.9,roughness:.3});
  for(const [x,z] of [[1.45,1],[1.45,-1],[-1.45,1],[-1.45,-1]]){ const w=mesh(new THREE.CylinderGeometry(.45,.45,.32,20),tire,x,.45,z); w.rotation.x=Math.PI/2; g.add(w);
    const r=mesh(new THREE.CylinderGeometry(.27,.27,.34,12),rim,x,.45,z,false); r.rotation.x=Math.PI/2; g.add(r); }
  const head=M({color:0xffffff,emissive:0xfff2d0,emissiveIntensity:1.2}); g.add(mesh(new THREE.BoxGeometry(.06,.16,.5),head,2.31,1.0,.62,false)); g.add(mesh(new THREE.BoxGeometry(.06,.16,.5),head,2.31,1.0,-.62,false));
  const tail=M({color:0x400000,emissive:0xff2020,emissiveIntensity:.8}); g.add(mesh(new THREE.BoxGeometry(.06,.16,.5),tail,-2.31,1.0,.62,false)); g.add(mesh(new THREE.BoxGeometry(.06,.16,.5),tail,-2.31,1.0,-.62,false));
  const gr=sprite(0xff2a3a,3.2), gb=sprite(0x2a6aff,3.2); gr.position.set(-.35,2.45,.45); gb.position.set(-.35,2.45,-.45); g.add(gr,gb);
  // reflejos de las sirenas sobre el suelo mojado
  const pm=c=>new THREE.MeshBasicMaterial({map:glowTex,color:c,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false});
  const fr=new THREE.Mesh(new THREE.PlaneGeometry(7,4),pm(0xff2a3a)), fb=new THREE.Mesh(new THREE.PlaneGeometry(7,4),pm(0x2a6aff));
  fr.rotation.x=fb.rotation.x=-Math.PI/2; fr.position.set(.5,.03,2.4); fb.position.set(.5,.03,-2.4); g.add(fr,fb);
  g.userData={red,blue,gr,gb,fr,fb,ph:Math.random()*10};
  return g;
}
function makePerson(o){
  const g=new THREE.Group();
  const uni=M({color:o.body,roughness:.8}), dark=M({color:0x0d1018,roughness:.7}), skin=M({color:o.skin,roughness:.7}), hairM=M({color:o.hair,roughness:.9});
  for(const x of [-.17,.17]){ g.add(mesh(new THREE.CylinderGeometry(.15,.13,.92,10),M({color:o.legs||0x141a28,roughness:.8}),x,.48,0)); g.add(mesh(new THREE.BoxGeometry(.24,.14,.4),dark,x,.07,.06)); }
  g.add(mesh(new THREE.CylinderGeometry(.34,.31,.12,16),dark,0,.98,0));
  g.add(mesh(new THREE.CylinderGeometry(.36,.31,.85,16),uni,0,1.42,0));
  if(o.vest) g.add(mesh(new THREE.CylinderGeometry(.385,.335,.62,16),M({color:o.vest,roughness:.6}),0,1.42,0));
  const arms=[];
  for(const x of [-.47,.47]){ const a=new THREE.Group(); a.position.set(x,1.8,0); const arm=mesh(new THREE.CylinderGeometry(.1,.09,.78,10),uni,0,-.38,0); a.add(arm); a.add(mesh(new THREE.SphereGeometry(.09,10,8),skin,0,-.8,0)); g.add(a); arms.push(a); }
  g.add(mesh(new THREE.CylinderGeometry(.09,.1,.14,10),skin,0,1.9,0));
  g.add(mesh(new THREE.SphereGeometry(.22,18,14),skin,0,2.08,0));
  if(o.cap){ g.add(mesh(new THREE.CylinderGeometry(.235,.24,.15,18),M({color:o.cap,roughness:.6}),0,2.24,0)); g.add(mesh(new THREE.BoxGeometry(.3,.03,.2),M({color:o.cap}),0,2.18,.24)); }
  else { const h=mesh(new THREE.SphereGeometry(.235,16,12,0,Math.PI*2,0,Math.PI*.55),hairM,0,2.1,-.02); g.add(h); if(o.long) g.add(mesh(new THREE.BoxGeometry(.4,.4,.12),hairM,0,1.92,-.17)); }
  if(o.back){ const p=new THREE.Mesh(new THREE.PlaneGeometry(.62,.23),new THREE.MeshStandardMaterial({map:backTex(),roughness:.6})); p.position.set(0,1.58,-.392); p.rotation.y=Math.PI; g.add(p); }
  g.userData={arms,ph:Math.random()*6};
  return g;
}
function makeHeli(){
  const g=new THREE.Group(), tex=heliTex();
  const navy=M({color:0x132250,roughness:.3,metalness:.6});
  const body=mesh(new THREE.SphereGeometry(1.2,24,16),M({map:tex,roughness:.3,metalness:.5}),0,0,0); body.scale.set(2.1,1,1.05); g.add(body);
  const glass=mesh(new THREE.SphereGeometry(.9,16,12,0,Math.PI*2,0,Math.PI/2),M({color:0x0a1424,roughness:.05,metalness:.9}),1.6,.15,0); glass.rotation.z=-1.1; g.add(glass);
  const boom=mesh(new THREE.CylinderGeometry(.16,.34,4.4,12),navy,-4,.25,0); boom.rotation.z=Math.PI/2; g.add(boom);
  g.add(mesh(new THREE.BoxGeometry(.7,1.2,.1),navy,-6,.8,0));
  trotor=new THREE.Group(); trotor.position.set(-6,.8,.12); trotor.add(mesh(new THREE.BoxGeometry(.08,1.4,.04),M({color:0x222222}),0,0,0)); g.add(trotor);
  rotor=new THREE.Group(); rotor.position.set(0,1.35,0); for(let i=0;i<4;i++){ const b=mesh(new THREE.BoxGeometry(10,.05,.28),M({color:0x1a1a1a}),0,0,0); b.rotation.y=i*Math.PI/4*2; rotor.add(b); } g.add(rotor);
  g.add(mesh(new THREE.CylinderGeometry(.18,.18,.5,10),M({color:0x333333}),0,1.1,0));
  for(const z of [-.8,.8]){ const sk=mesh(new THREE.CylinderGeometry(.05,.05,3.4,8),M({color:0x222831}),0,-1.25,z); sk.rotation.z=Math.PI/2; g.add(sk); g.add(mesh(new THREE.BoxGeometry(.06,.5,.06),M({color:0x222831}),.6,-1,z)); g.add(mesh(new THREE.BoxGeometry(.06,.5,.06),M({color:0x222831}),-.6,-1,z)); }
  const b1=sprite(0xff2a3a,1.6); b1.position.set(-1.2,-.9,0); g.add(b1); g.userData={b1};
  return g;
}

// ---------- escena ----------
function build(){
  cvs=document.getElementById('hub3d');
  R=new THREE.WebGLRenderer({canvas:cvs,antialias:true,powerPreference:'high-performance'});
  R.setPixelRatio(Math.min(2,window.devicePixelRatio||1)); R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFSoftShadowMap;
  R.toneMapping=THREE.ACESFilmicToneMapping; R.outputEncoding=THREE.sRGBEncoding;
  scene=new THREE.Scene(); pmrem=new THREE.PMREMGenerator(R); glowTex=glow();
  cam=new THREE.PerspectiveCamera(48,1,.1,900);
  skyMesh=new THREE.Mesh(new THREE.SphereGeometry(450,32,16),new THREE.MeshBasicMaterial({side:THREE.BackSide,fog:false,depthWrite:false}));
  scene.add(skyMesh);
  hemi=new THREE.HemisphereLight(0xbcd4ff,0x3a3428,.55); scene.add(hemi);
  sun=new THREE.DirectionalLight(0xfff1dc,1.6); sun.position.set(-60,80,40); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-70,right:70,top:70,bottom:-70,near:1,far:260}); sun.shadow.bias=-.0004; scene.add(sun);
  // suelo
  const ground=mesh(new THREE.PlaneGeometry(600,600),M({map:asphaltTex(),roughness:.4,metalness:.25}),0,0,0,false); ground.rotation.x=-Math.PI/2; scene.add(ground);
  const plaza=mesh(new THREE.PlaneGeometry(110,72),M({map:pavingTex(),color:0x9da3ad,roughness:.24,metalness:.3}),0,.02,8,false); plaza.rotation.x=-Math.PI/2; scene.add(plaza);
  const line=M({color:0xe8e4d0,roughness:.5});
  for(let x=-90;x<90;x+=8){ const l=mesh(new THREE.PlaneGeometry(4,.25),line,x,.03,50,false); l.rotation.x=-Math.PI/2; scene.add(l); }
  for(let x=-6;x<=6;x+=1.6){ const l=mesh(new THREE.PlaneGeometry(.8,6),line,x+18,.03,50,false); l.rotation.x=-Math.PI/2; scene.add(l); }
  const curb=M({color:0x9a9fa8,roughness:.7}); scene.add(mesh(new THREE.BoxGeometry(110,.25,.5),curb,0,.12,44));
  // bandera
  const pole=mesh(new THREE.CylinderGeometry(.12,.15,20,12),M({color:0xd8dde6,metalness:.8,roughness:.3}),-22,10,-13); scene.add(pole);
  const fg=new THREE.PlaneGeometry(6,4,24,12); fg.translate(3,0,0); flag=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:flagTex(),side:THREE.DoubleSide,roughness:.8}));
  flag.position.set(-22,17.5,-13); flag.castShadow=true; scene.add(flag); flagPos=fg.attributes.position.array.slice();
  // ciudad de fondo
  const fac=[facadeTex('#d9cdb6'),facadeTex('#b9bfc9'),facadeTex('#c98d6a'),facadeTex('#e6e1d6')];
  for(let i=0;i<55;i++){ const w=rnd(10,22), h=rnd(12,58), d=rnd(10,18); let x=rnd(-160,160), z=rnd(-60,-190); if(i<10){ x=(i%2?1:-1)*rnd(62,110); z=rnd(-40,10); }
    const t=fac[i%4].clone(); t.needsUpdate=true; t.repeat.set(Math.max(1,Math.round(w/8)),Math.max(1,Math.round(h/12))); t.wrapS=t.wrapT=THREE.RepeatWrapping;
    const m=M({map:t,roughness:.8,emissive:0xffffff,emissiveMap:t,emissiveIntensity:0}); winMats.push(m);
    scene.add(mesh(new THREE.BoxGeometry(w,h,d),m,x,h/2,z)); if(Math.random()<.35) scene.add(mesh(new THREE.BoxGeometry(w*.3,2,d*.3),M({color:0x777d88}),x,h+1,z)); }
  // árboles y farolas
  const trunk=M({color:0x4a3624,roughness:.9}), leaf=M({color:0x3e7a3e,roughness:.85,flatShading:true});
  for(const [x,z] of [[-42,-10],[-48,10],[42,-10],[48,10],[-40,30],[40,30],[-60,-30],[60,-30],[-70,12],[70,12]]){
    scene.add(mesh(new THREE.CylinderGeometry(.25,.35,3.4,8),trunk,x,1.7,z)); const c=mesh(new THREE.IcosahedronGeometry(rnd(2.4,3.2),1),leaf,x,5,z); c.scale.y=1.15; scene.add(c); }
  const lampM=M({color:0x2a2f38,metalness:.7,roughness:.4}), bulb=M({color:0xffffff,emissive:0xffd9a0,emissiveIntensity:1});
  for(const [x,z] of [[-30,22],[30,22],[-46,40],[46,40]]){ scene.add(mesh(new THREE.CylinderGeometry(.1,.14,7,8),lampM,x,3.5,z)); scene.add(mesh(new THREE.BoxGeometry(1.4,.15,.15),lampM,x+.6,7,z)); scene.add(mesh(new THREE.BoxGeometry(.6,.2,.4),bulb,x+1.2,6.9,z,false));
    const s=sprite(0xffc890,7); s.position.set(x+1.2,6.8,z); scene.add(s); lampGlows.push(s); }
  // lluvia
  const N=2200, pos=new Float32Array(N*6);
  for(let i=0;i<N;i++){ const x=rnd(-40,40), y=rnd(0,30), z=rnd(-25,40); pos.set([x,y,z,x+.05,y-.7,z],i*6); }
  const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  rain=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xa9c0e0,transparent:true,opacity:.35})); rain.visible=false; scene.add(rain);
  heli=makeHeli(); scene.add(heli);
  addEventListener('resize',resize); resize();
}
function buildDynamic(){
  if(dyn){ scene.remove(dyn); dyn.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); }
  dyn=new THREE.Group(); scene.add(dyn); cars=[]; people=[]; blink=[];
  const lvl=info.lvl||1, W=40+(lvl-1)*8;
  const concrete=M({color:0xb8bec8,roughness:.85}), navy=M({color:0x13224a,roughness:.5,metalness:.3});
  dyn.add(mesh(new THREE.BoxGeometry(W,14,14),concrete,0,7,-25));
  dyn.add(mesh(new THREE.BoxGeometry(W+.4,.6,14.4),M({color:0xb8bec8}),0,14.1,-25));
  const wt=windowTex(true), wm=M({map:wt,emissive:0xffffff,emissiveMap:wt,emissiveIntensity:.2,roughness:.08,metalness:.65}); winMats.push(wm);
  const glass=mesh(new THREE.PlaneGeometry(W-4,7.4),wm,0,4.6,-17.96,false); dyn.add(glass);
  const band=mesh(new THREE.BoxGeometry(W-2,4,.5),navy,0,11,-17.9); dyn.add(band);
  const sgt=signTex(), sign=mesh(new THREE.PlaneGeometry(24,3.75),M({map:sgt,emissive:0xffffff,emissiveMap:sgt,emissiveIntensity:.35,roughness:.4}),0,11,-17.62,false); dyn.add(sign); winMats.push(sign.material);
  dyn.add(mesh(new THREE.BoxGeometry(13,.5,5),concrete,0,8.4,-15.6));
  for(const x of [-5.6,5.6]) dyn.add(mesh(new THREE.CylinderGeometry(.3,.3,8.2,12),concrete,x,4.1,-13.6));
  for(let i=0;i<3;i++) dyn.add(mesh(new THREE.BoxGeometry(16-i*1.2,.3,1.4),concrete,0,.15+i*.3,-16.5+i*.0-i*1.1+3.3));
  dyn.add(mesh(new THREE.BoxGeometry(3,2,3),M({color:0x8d939c}),-12,15.5,-28)); dyn.add(mesh(new THREE.BoxGeometry(3,2,3),M({color:0x8d939c}),8,15.5,-28));
  dyn.add(mesh(new THREE.CylinderGeometry(.08,.08,8,6),M({color:0xcccccc}),15,18,-26));
  if(lvl>=2) for(const sx of [-1,1]){ const x=sx*(W/2+8); dyn.add(mesh(new THREE.BoxGeometry(16,10,13),concrete,x,5,-24)); const wg=mesh(new THREE.PlaneGeometry(14,5),wm,x,4.5,-17.45,false); dyn.add(wg); }
  if(lvl>=3){ const hp=mesh(new THREE.CylinderGeometry(6,6,.3,32),M({map:ctex(256,256,(g,w,h)=>{ g.fillStyle='#3a404a'; g.fillRect(0,0,w,h); g.strokeStyle='#ffc94a'; g.lineWidth=10; g.beginPath(); g.arc(128,128,100,0,7); g.stroke(); g.fillStyle='#fff'; g.font='bold 140px Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('H',128,136); }),roughness:.6}),W/2-9,14.6,-25); dyn.add(hp); }
  // coches
  const spots=[[-15,-4,.55],[11,-6,-.35],[22,-10,-.15],[-25,-11,.2],[30,2,-.9],[-33,3,.9],[4,6,1.2]];
  const n=Math.min(spots.length,(info.cars||0)+3);
  for(let i=0;i<n;i++){ const c=makeCar(); const [x,z,r]=spots[i]; c.position.set(x,0,z); c.rotation.y=r; dyn.add(c); cars.push(c); }
  // plantilla en la entrada
  const st=(info.staff||[]).slice(0,9);
  st.forEach((s,i)=>{ const p=makePerson(s); const row=i<5?0:1; p.position.set((i%5-2)*2.4+(row?1.2:0),0,-12.4+row*2.6); p.rotation.y=(Math.random()-.5)*.5; dyn.add(p); people.push(p); });
  // el jefe, de espaldas a la cámara
  const me=makePerson({body:0x14203f,skin:0xe6b48e,hair:0x2b1b12,vest:0x0c0f16,legs:0x10141f,back:true});
  me.position.set(0,0,25.6); me.rotation.y=Math.PI; me.scale.setScalar(1.05); dyn.add(me); people.push(me);
}
function setMode(m){
  if(m===mode) return; mode=m;
  const t=skyTex(m); skyMesh.material.map=t; skyMesh.material.needsUpdate=true;
  const envScene=new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100,32,16),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide})));
  if(envRT) envRT.dispose(); envRT=pmrem.fromScene(envScene,.02); scene.environment=envRT.texture;
  const cfg={day:{sun:1.5,sc:0xfff1dc,h:.45,e:.78,win:.15,lamp:0,fog:0xc9d6e6},dusk:{sun:.9,sc:0xffa060,h:.3,e:.8,win:.9,lamp:.7,fog:0x8a6a6a},night:{sun:.12,sc:0x8fa8ff,h:.1,e:.85,win:1.5,lamp:1,fog:0x0d1530}}[m];
  sun.intensity=cfg.sun; sun.color.setHex(cfg.sc); hemi.intensity=cfg.h; R.toneMappingExposure=cfg.e;
  winMats.forEach(w=>w.emissiveIntensity=w.map&&w.map.repeat&&w.map.repeat.x>1?cfg.win*.6:cfg.win);
  lampGlows.forEach(s=>s.material.opacity=cfg.lamp);
  scene.fog=new THREE.Fog(cfg.fog,90,330);
  const envK=m==='night'?.25:m==='dusk'?.5:.6;
  scene.traverse(o=>{ const ms=Array.isArray(o.material)?o.material:o.material?[o.material]:[]; ms.forEach(mt=>{ if(mt.isMeshStandardMaterial) mt.envMapIntensity=mt.metalness>.6?envK*1.6:envK*.5; }); });
}
function resize(){ if(!R) return; const w=innerWidth, h=innerHeight; R.setSize(w,h,false); cam.aspect=w/h;
  // en pantallas verticales se aleja la cámara para que quepa la comisaría
  cam.fov=w/h<1?68:48; cam.updateProjectionMatrix(); }
function tick(t){
  if(!running) return; requestAnimationFrame(tick);
  const dt=Math.min(.05,(t-last)/1000||0); last=t; T+=dt;
  // cámara sobre el hombro con un leve balanceo
  camSway+=dt; cam.position.set(.55+Math.sin(camSway*.25)*.2,2.32+Math.sin(camSway*.4)*.03,29.6); cam.lookAt(-.2,5.1,-25);
  // sirenas
  cars.forEach((c,i)=>{ const u=c.userData, ph=Math.floor((T*6+u.ph))%4, r=ph<2, k=mode==='day'?.7:1.2;
    u.red.emissiveIntensity=r?3:0; u.blue.emissiveIntensity=r?0:3; u.gr.material.opacity=r?k:0; u.gb.material.opacity=r?0:k; u.fr.material.opacity=r?.55*k:0; u.fb.material.opacity=r?0:.55*k; });
  // bandera
  const p=flag.geometry.attributes.position; for(let i=0;i<p.count;i++){ const x=flagPos[i*3], y=flagPos[i*3+1]; p.array[i*3+2]=Math.sin(x*1.3-T*4.5+y*.4)*.35*(x/6); } p.needsUpdate=true; flag.geometry.computeVertexNormals();
  // helicóptero
  const a=T*.16; heli.position.set(Math.cos(a)*26+4,21+Math.sin(T*.6)*1.2,-26+Math.sin(a)*12); heli.rotation.set(0,-a-Math.PI/2,.18); rotor.rotation.y+=dt*28; trotor.rotation.x+=dt*40;
  heli.userData.b1.material.opacity=Math.floor(T*2)%2?1:.1;
  // gente
  people.forEach(pp=>{ const u=pp.userData; u.ph+=dt; pp.children.forEach(()=>{}); if(u.arms) u.arms.forEach((ar,i)=>ar.rotation.x=Math.sin(u.ph*1.3+i)*.06); pp.position.y=Math.sin(u.ph*1.6)*.01; });
  if(rain.visible){ const ra=rain.geometry.attributes.position.array; for(let i=0;i<ra.length;i+=6){ ra[i+1]-=dt*26; ra[i+4]-=dt*26; if(ra[i+4]<0){ ra[i+1]+=30; ra[i+4]+=30; } } rain.geometry.attributes.position.needsUpdate=true; }
  R.render(scene,cam);
}
function open(data){
  if(!ok()) return false;
  try{
    if(!R) build();
    info=data; const k=[data.city,data.lvl,data.cars,(data.staff||[]).length].join('|');
    if(k!==key){ key=k; buildDynamic(); mode=''; }
    const h=data.hour; setMode(h>=8&&h<19?'day':(h>=19&&h<21.5)||(h>=6&&h<8)?'dusk':'night');
    rain.visible=!!data.rain;
    cvs.hidden=false; if(!running){ running=true; last=performance.now(); requestAnimationFrame(tick); }
    return true;
  }catch(e){ console.warn('Escena 3D no disponible',e); return false; }
}
function update(data){ if(running) open(data); }
function close(){ running=false; if(cvs) cvs.hidden=true; }
return {open,close,update,isOpen:()=>running,available:ok};
})();
