// Patrulla España · motor 3D (Three.js r128)
// Escenas: comisaría (hub), interrogatorio, calabozos, patrulla por la calle y miniaturas de la tienda.
// Sin logotipos reales: emblema inventado y rotulación genérica «POLICÍA».
window.PE_HUB = (() => {
'use strict';
const ok = () => typeof THREE !== 'undefined';
let R=null, cvs, running=false, last=0, T=0, view=null, glowTex=null, pmrem=null;
const SC={};
const rnd=(a,b)=>a+Math.random()*(b-a);

// ================= utilidades =================
function ctex(w,h,fn,rep){ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=8; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } return t; }
const M=o=>new THREE.MeshStandardMaterial(o);
function mesh(geo,mat,x=0,y=0,z=0,cast=true){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=cast; m.receiveShadow=true; return m; }
const memo={}; const once=(k,f)=>memo[k]||(memo[k]=f());
function sprite(color,scale){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true})); s.scale.set(scale,scale,1); return s; }
function boxUV(w,h,d,tw,th){ const g=new THREE.BoxGeometry(w,h,d); const uv=g.attributes.uv; g.attributes.uv.setUsage&&0;
  const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++) for(let i=0;i<4;i++){ const k=f*4+i; uv.setXY(k,uv.getX(k)*dims[f][0]/tw,uv.getY(k)*dims[f][1]/th); }
  return g; }

// ================= texturas =================
function skyTex(kind){ return ctex(1024,512,(g,w,h)=>{
  const P={day:['#2a63b0','#7fb0e2','#e7dccb'],dusk:['#1a2550','#b4614a','#f4b26a'],night:['#03071a','#0c1838','#24345e']}[kind];
  const gr=g.createLinearGradient(0,0,0,h/2); gr.addColorStop(0,P[0]); gr.addColorStop(.7,P[1]); gr.addColorStop(1,P[2]); g.fillStyle=gr; g.fillRect(0,0,w,h/2);
  g.fillStyle=P[2]; g.fillRect(0,h/2,w,h/2);
  if(kind==='night') for(let i=0;i<500;i++){ g.fillStyle=`rgba(255,255,255,${Math.random()*.8})`; g.fillRect(Math.random()*w,Math.random()*h*.45,1.2,1.2); }
  const cc=kind==='day'?'255,255,255':kind==='dusk'?'255,190,150':'90,110,160';
  for(let i=0;i<70;i++){ const x=Math.random()*w, y=40+Math.random()*170, r=20+Math.random()*60;
    const rg=g.createRadialGradient(x,y,0,x,y,r); rg.addColorStop(0,`rgba(${cc},${kind==='night'?.12:.55})`); rg.addColorStop(1,`rgba(${cc},0)`);
    g.fillStyle=rg; g.beginPath(); g.ellipse(x,y,r*2.2,r*.7,0,0,7); g.fill(); } }); }
const asphaltTex=()=>ctex(512,512,(g,w,h)=>{ g.fillStyle='#2b2f37'; g.fillRect(0,0,w,h);
  for(let i=0;i<9000;i++){ const v=30+Math.random()*40; g.fillStyle=`rgb(${v},${v+2},${v+6})`; g.fillRect(Math.random()*w,Math.random()*h,2,2); }
  for(let i=0;i<14;i++){ g.fillStyle='rgba(10,14,22,.35)'; g.beginPath(); g.ellipse(Math.random()*w,Math.random()*h,20+Math.random()*60,8+Math.random()*20,Math.random()*3,0,7); g.fill(); } },[30,30]);
const pavingTex=()=>ctex(512,512,(g,w,h)=>{ g.fillStyle='#8d929b'; g.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=64) for(let x=0;x<w;x+=64){ const v=128+Math.random()*30; g.fillStyle=`rgb(${v},${v+3},${v+8})`; g.fillRect(x+2,y+2,60,60); }
  for(let i=0;i<10;i++){ g.fillStyle='rgba(40,50,70,.35)'; g.beginPath(); g.ellipse(Math.random()*w,Math.random()*h,30+Math.random()*50,10+Math.random()*16,Math.random()*3,0,7); g.fill(); } },[10,8]);
const windowTex=()=>ctex(1024,256,(g,w,h)=>{
  const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#1c2c4a'); gr.addColorStop(1,'#0b1222'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  for(let x=0;x<w;x+=64) for(let y=0;y<h;y+=128){ if(Math.random()<.65){ const l=g.createLinearGradient(0,y,0,y+120); l.addColorStop(0,'rgba(255,214,150,.95)'); l.addColorStop(1,'rgba(255,190,110,.6)'); g.fillStyle=l; g.fillRect(x+6,y+8,52,112);
      g.fillStyle='rgba(30,40,60,.6)'; g.fillRect(x+10+Math.random()*30,y+60,14,60); } }
  g.fillStyle='#c8ced8'; for(let x=0;x<=w;x+=64) g.fillRect(x-3,0,6,h); for(let y=0;y<=h;y+=128) g.fillRect(0,y-4,w,8);
  const sh=g.createLinearGradient(0,0,w,h); sh.addColorStop(0,'rgba(255,255,255,.18)'); sh.addColorStop(.4,'rgba(255,255,255,0)'); g.fillStyle=sh; g.fillRect(0,0,w,h); });
const facadeTex=(base,lit=.3)=>ctex(256,512,(g,w,h)=>{ g.fillStyle=base; g.fillRect(0,0,w,h);
  for(let y=16;y<h;y+=40) for(let x=14;x<w;x+=40){ g.fillStyle=Math.random()<lit?'#ffd8a0':'#2a3a58'; g.fillRect(x,y,24,26); g.fillStyle='rgba(255,255,255,.25)'; g.fillRect(x,y,24,3); g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(x-2,y+26,28,4); } },[1,1]);
const signTex=()=>ctex(1024,160,(g,w,h)=>{ g.fillStyle='#0f1d42'; g.fillRect(0,0,w,h);
  g.save(); g.translate(90,80); const sh=()=>{ g.beginPath(); g.moveTo(0,-62); g.lineTo(52,-42); g.lineTo(52,6); g.quadraticCurveTo(48,48,0,66); g.quadraticCurveTo(-48,48,-52,6); g.lineTo(-52,-42); g.closePath(); };
  g.fillStyle='#c99a1c'; sh(); g.fill(); g.scale(.8,.8); g.fillStyle='#14234d'; sh(); g.fill();
  g.fillStyle='#ffc94a'; g.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, r=i%2?14:34; g.lineTo(Math.cos(a)*r,Math.sin(a)*r); } g.closePath(); g.fill(); g.restore();
  g.fillStyle='#ffffff'; g.font='bold 92px Arial'; g.textBaseline='middle'; g.fillText('COMISARÍA',190,84); });
const liveryTex=()=>once('livery',()=>ctex(512,128,(g,w,h)=>{ g.fillStyle='#132250'; g.fillRect(0,0,w,h); g.fillStyle='#eef2f8'; g.fillRect(0,h*.52,w,h*.48);
  g.fillStyle='#3d8bff'; g.fillRect(0,h*.47,w,h*.07); g.fillStyle='#132250'; g.font='bold 44px Arial'; g.textAlign='center'; g.fillText('POLICÍA',w/2,h*.9); }));
const backTex=()=>once('back',()=>ctex(256,96,(g,w,h)=>{ g.fillStyle='#111'; g.fillRect(0,0,w,h); g.fillStyle='#f3f6fb'; g.font='bold 58px Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('POLICÍA',w/2,h/2+2); }));
const flagTex=()=>ctex(300,200,(g,w,h)=>{ g.fillStyle='#c60b1e'; g.fillRect(0,0,w,h); g.fillStyle='#ffc400'; g.fillRect(0,h/4,w,h/2); });
const glow=()=>ctex(128,128,g=>{ const r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.25,'rgba(255,255,255,.5)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,128,128); });
const heliTex=()=>once('helitex',()=>ctex(512,128,(g,w,h)=>{ g.fillStyle='#132250'; g.fillRect(0,0,w,h); g.fillStyle='#eef2f8'; g.fillRect(0,h*.55,w,h*.18); g.fillStyle='#ffc94a'; g.fillRect(0,h*.73,w,h*.05); g.fillStyle='#eef2f8'; g.font='bold 36px Arial'; g.textAlign='center'; g.fillText('POLICÍA',w/2,h*.45); }));
const tileFloor=()=>ctex(512,512,(g,w,h)=>{ g.fillStyle='#6d717a'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=128) for(let x=0;x<w;x+=128){ const v=95+Math.random()*25; g.fillStyle=`rgb(${v},${v+2},${v+6})`; g.fillRect(x+2,y+2,124,124); } },[6,6]);
const panelWall=(c1,c2)=>ctex(512,512,(g,w,h)=>{ g.fillStyle=c1; g.fillRect(0,0,w,h); for(let x=0;x<w;x+=128){ g.fillStyle=c2; g.fillRect(x,0,3,h); } g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(0,h-40,w,40);
  for(let i=0;i<40;i++){ g.fillStyle=`rgba(0,0,0,${Math.random()*.06})`; g.fillRect(Math.random()*w,Math.random()*h,40,80); } },[3,1]);
function textSprite(txt,col='#fff',bg='rgba(10,20,45,.85)'){ const t=ctex(512,96,(g,w,h)=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.fillStyle=col; g.font='bold 52px Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,w/2,h/2); });
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthWrite:false,transparent:true})); s.scale.set(2.4,.45,1); return s; }

// ================= modelos =================
function makeCar(o={}){
  const L=o.len||4.6, BH=o.h||1.0, CB=o.cab||.8, WR=o.suv?.5:.45, base=WR-.1;
  const g=new THREE.Group(), color=o.color;
  const navy=M({color:color||0x132250,roughness:.22,metalness:.75}), side=color?navy:M({map:liveryTex(),roughness:.25,metalness:.55});
  const glass=M({color:0x0a111d,roughness:.05,metalness:.95});
  g.add(mesh(new THREE.BoxGeometry(L,BH,2.0),[navy,navy,navy,navy,side,side],0,base+BH/2,0));
  const hood=mesh(new THREE.BoxGeometry(L*.26,.18,1.9),navy,L*.35,base+BH+.05,0); hood.rotation.z=-.12; g.add(hood);
  g.add(mesh(new THREE.BoxGeometry(L*.52,CB,1.84),glass,-L*.05,base+BH+CB/2,0));
  g.add(mesh(new THREE.BoxGeometry(L*.44,.08,1.7),navy,-L*.08,base+BH+CB+.04,0));
  const u={ph:Math.random()*10};
  if(!o.civil){ const top=base+BH+CB+.16;
    g.add(mesh(new THREE.BoxGeometry(.5,.16,1.5),M({color:0x111111,roughness:.4}),-L*.08,top,0));
    u.red=M({color:0x330000,emissive:0xff2030,emissiveIntensity:0}); u.blue=M({color:0x000833,emissive:0x2060ff,emissiveIntensity:0});
    g.add(mesh(new THREE.BoxGeometry(.42,.16,.6),u.red,-L*.08,top+.08,.42,false)); g.add(mesh(new THREE.BoxGeometry(.42,.16,.6),u.blue,-L*.08,top+.08,-.42,false));
    u.gr=sprite(0xff2a3a,3.2); u.gb=sprite(0x2a6aff,3.2); u.gr.position.set(-L*.08,top+.15,.45); u.gb.position.set(-L*.08,top+.15,-.45); u.gr.material.opacity=0; u.gb.material.opacity=0; g.add(u.gr,u.gb);
    const pm=c=>new THREE.MeshBasicMaterial({map:glowTex,color:c,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0});
    u.fr=new THREE.Mesh(new THREE.PlaneGeometry(7,4),pm(0xff2a3a)); u.fb=new THREE.Mesh(new THREE.PlaneGeometry(7,4),pm(0x2a6aff));
    u.fr.rotation.x=u.fb.rotation.x=-Math.PI/2; u.fr.position.set(.5,.03,2.4); u.fb.position.set(.5,.03,-2.4); g.add(u.fr,u.fb); }
  const tire=M({color:0x0b0b0e,roughness:.85}), rim=M({color:0x9aa3b0,metalness:.9,roughness:.3});
  for(const [x,z] of [[L*.31,1],[L*.31,-1],[-L*.31,1],[-L*.31,-1]]){ const w=mesh(new THREE.CylinderGeometry(WR,WR,.32,20),tire,x,WR,z); w.rotation.x=Math.PI/2; g.add(w);
    const r=mesh(new THREE.CylinderGeometry(WR*.6,WR*.6,.34,12),rim,x,WR,z,false); r.rotation.x=Math.PI/2; g.add(r); }
  const head=M({color:0xffffff,emissive:0xfff2d0,emissiveIntensity:1.2}), tail=M({color:0x400000,emissive:0xff2020,emissiveIntensity:.8});
  for(const z of [.62,-.62]){ g.add(mesh(new THREE.BoxGeometry(.06,.16,.5),head,L/2+.01,base+BH*.65,z,false)); g.add(mesh(new THREE.BoxGeometry(.06,.16,.5),tail,-L/2-.01,base+BH*.65,z,false)); }
  g.userData=u; return g;
}
function lightBar(g,x,y,u){ u.red=M({color:0x330000,emissive:0xff2030,emissiveIntensity:0}); u.blue=M({color:0x000833,emissive:0x2060ff,emissiveIntensity:0});
  g.add(mesh(new THREE.BoxGeometry(.4,.16,.7),u.red,x,y,.45,false)); g.add(mesh(new THREE.BoxGeometry(.4,.16,.7),u.blue,x,y,-.45,false));
  u.gr=sprite(0xff2a3a,3); u.gb=sprite(0x2a6aff,3); u.gr.position.set(x,y+.1,.45); u.gb.position.set(x,y+.1,-.45); u.gr.material.opacity=0; u.gb.material.opacity=0; g.add(u.gr,u.gb); }
function makeVan(){
  const g=new THREE.Group(), navy=M({color:0x132250,roughness:.25,metalness:.6}), side=M({map:liveryTex(),roughness:.3,metalness:.4}), glass=M({color:0x0a111d,roughness:.05,metalness:.95});
  g.add(mesh(new THREE.BoxGeometry(5.6,2.2,2.2),[navy,navy,navy,navy,side,side],-.2,1.5,0));
  g.add(mesh(new THREE.BoxGeometry(.08,.9,1.9),glass,2.62,2.0,0)); g.add(mesh(new THREE.BoxGeometry(.9,.6,2.1),navy,2.9,.95,0));
  const u={ph:Math.random()*10}; lightBar(g,1.8,2.7,u);
  const tire=M({color:0x0b0b0e,roughness:.85}); for(const [x,z] of [[1.9,1.05],[1.9,-1.05],[-2,1.05],[-2,-1.05]]){ const w=mesh(new THREE.CylinderGeometry(.48,.48,.3,18),tire,x,.48,z); w.rotation.x=Math.PI/2; g.add(w); }
  const head=M({color:0xffffff,emissive:0xfff2d0,emissiveIntensity:1.2}); for(const z of [.75,-.75]) g.add(mesh(new THREE.BoxGeometry(.06,.2,.4),head,3.36,1.05,z,false));
  g.userData=u; return g;
}
function makeMoto(){
  const g=new THREE.Group(), white=M({color:0xeef2f8,roughness:.3,metalness:.4}), navy=M({color:0x132250,roughness:.3,metalness:.5}), tire=M({color:0x0b0b0e,roughness:.85});
  for(const x of [.85,-.85]) g.add(mesh(new THREE.TorusGeometry(.36,.1,10,22),tire,x,.42,0));
  g.add(mesh(new THREE.BoxGeometry(1.5,.38,.34),white,0,.85,0)); g.add(mesh(new THREE.BoxGeometry(.7,.3,.42),navy,.25,1.12,0));
  g.add(mesh(new THREE.BoxGeometry(.6,.14,.36),M({color:0x111111}),-.35,1.12,0)); g.add(mesh(new THREE.BoxGeometry(.06,.5,.5),M({color:0x9fc4ff,transparent:true,opacity:.5}),.75,1.35,0));
  g.add(mesh(new THREE.BoxGeometry(.08,.08,.8),M({color:0x222222}),.6,1.25,0));
  const u={ph:Math.random()*10}; u.blue=M({color:0x000833,emissive:0x2060ff,emissiveIntensity:0}); u.red=M({color:0x330000,emissive:0xff2030,emissiveIntensity:0});
  g.add(mesh(new THREE.BoxGeometry(.12,.12,.12),u.blue,-.75,1.3,.12,false)); g.add(mesh(new THREE.BoxGeometry(.12,.12,.12),u.red,-.75,1.3,-.12,false));
  const rider=makePerson({body:0x14203f,skin:0xe6b48e,hair:0x2b1b12,vest:0xd7f04a,cap:0xeef2f8,legs:0x10141f,scale:.82}); seat(rider); rider.userData.arms.forEach(a=>a.rotation.x=-1.0); rider.position.set(-.2,rider.position.y*.82+.95,0); rider.rotation.y=Math.PI/2; g.add(rider);
  g.userData=u; return g;
}
function makeDrone(){
  const g=new THREE.Group(), dark=M({color:0x22262e,roughness:.4,metalness:.6});
  g.add(mesh(new THREE.BoxGeometry(.6,.18,.6),M({color:0xeef2f8,roughness:.3}),0,0,0));
  const rotors=[]; for(const [x,z] of [[.55,.55],[.55,-.55],[-.55,.55],[-.55,-.55]]){ const a=mesh(new THREE.BoxGeometry(Math.hypot(x,z)*1.1,.06,.08),dark,x/2,0,z/2); a.rotation.y=-Math.atan2(z,x); g.add(a);
    const r=mesh(new THREE.CylinderGeometry(.32,.32,.02,16),M({color:0x111111,transparent:true,opacity:.55}),x,.1,z,false); g.add(r); rotors.push(r); }
  g.add(mesh(new THREE.SphereGeometry(.12,10,8),M({color:0x111111,metalness:.9,roughness:.1}),.2,-.14,0));
  g.add(mesh(new THREE.BoxGeometry(.1,.05,.1),M({color:0x000833,emissive:0x2060ff,emissiveIntensity:2}),0,.12,0,false));
  g.userData={rotors}; return g;
}
function makeHeli(){
  const g=new THREE.Group(), navy=M({color:0x132250,roughness:.3,metalness:.6});
  const body=mesh(new THREE.SphereGeometry(1.2,24,16),M({map:heliTex(),roughness:.3,metalness:.5}),0,0,0); body.scale.set(2.1,1,1.05); g.add(body);
  const gl=mesh(new THREE.SphereGeometry(.9,16,12,0,Math.PI*2,0,Math.PI/2),M({color:0x0a1424,roughness:.05,metalness:.9}),1.6,.15,0); gl.rotation.z=-1.1; g.add(gl);
  const boom=mesh(new THREE.CylinderGeometry(.16,.34,4.4,12),navy,-4,.25,0); boom.rotation.z=Math.PI/2; g.add(boom);
  g.add(mesh(new THREE.BoxGeometry(.7,1.2,.1),navy,-6,.8,0));
  const trotor=new THREE.Group(); trotor.position.set(-6,.8,.12); trotor.add(mesh(new THREE.BoxGeometry(.08,1.4,.04),M({color:0x222222}))); g.add(trotor);
  const rotor=new THREE.Group(); rotor.position.set(0,1.35,0); for(let i=0;i<2;i++){ const b=mesh(new THREE.BoxGeometry(10,.05,.28),M({color:0x1a1a1a})); b.rotation.y=i*Math.PI/2; rotor.add(b); } g.add(rotor);
  g.add(mesh(new THREE.CylinderGeometry(.18,.18,.5,10),M({color:0x333333}),0,1.1,0));
  for(const z of [-.8,.8]){ const sk=mesh(new THREE.CylinderGeometry(.05,.05,3.4,8),M({color:0x222831}),0,-1.25,z); sk.rotation.z=Math.PI/2; g.add(sk); for(const x of [.6,-.6]) g.add(mesh(new THREE.BoxGeometry(.06,.5,.06),M({color:0x222831}),x,-1,z)); }
  const b1=sprite(0xff2a3a,1.6); b1.position.set(-1.2,-.9,0); g.add(b1);
  g.userData={rotor,trotor,b1}; return g;
}
function makePerson(o){
  const g=new THREE.Group();
  const uni=M({color:o.body,roughness:.8}), dark=M({color:0x0d1018,roughness:.7}), skin=M({color:o.skin,roughness:.7}), hairM=M({color:o.hair||'#2b1b12',roughness:.9});
  const legs=[];
  for(const x of [-.17,.17]){ const lg=new THREE.Group(); lg.position.set(x,.95,0); lg.add(mesh(new THREE.CylinderGeometry(.15,.13,.92,10),M({color:o.legs||0x141a28,roughness:.8}),0,-.47,0)); lg.add(mesh(new THREE.BoxGeometry(.24,.14,.4),dark,0,-.88,.06)); g.add(lg); legs.push(lg); }
  g.add(mesh(new THREE.CylinderGeometry(.34,.31,.12,16),o.suit?uni:dark,0,.98,0));
  g.add(mesh(new THREE.CylinderGeometry(.36,.31,.85,16),uni,0,1.42,0));
  if(o.vest) g.add(mesh(new THREE.CylinderGeometry(.385,.335,.62,16),M({color:o.vest,roughness:.6}),0,1.42,0));
  if(o.suit) g.add(mesh(new THREE.BoxGeometry(.18,.5,.05),M({color:0xe8edf5}),0,1.6,.33));
  const arms=[];
  for(const x of [-.47,.47]){ const a=new THREE.Group(); a.position.set(x,1.8,0); a.add(mesh(new THREE.CylinderGeometry(.1,.09,.78,10),uni,0,-.38,0)); a.add(mesh(new THREE.SphereGeometry(.09,10,8),skin,0,-.8,0)); g.add(a); arms.push(a); }
  g.add(mesh(new THREE.CylinderGeometry(.09,.1,.14,10),skin,0,1.9,0));
  const head=new THREE.Group(); head.position.set(0,2.08,0); g.add(head);
  head.add(mesh(new THREE.SphereGeometry(.22,18,14),skin));
  for(const x of [-.075,.075]) head.add(mesh(new THREE.SphereGeometry(.025,8,6),M({color:0x111111}),x,.03,.2,false));
  if(o.cap){ head.add(mesh(new THREE.CylinderGeometry(.235,.24,.15,18),M({color:o.cap,roughness:.6}),0,.16,0)); head.add(mesh(new THREE.BoxGeometry(.3,.03,.2),M({color:o.cap}),0,.1,.24)); }
  else { head.add(mesh(new THREE.SphereGeometry(.235,16,12,0,Math.PI*2,0,Math.PI*.55),hairM,0,.02,-.02)); if(o.long) head.add(mesh(new THREE.BoxGeometry(.4,.4,.12),hairM,0,-.16,-.17)); }
  if(o.hood) head.add(mesh(new THREE.SphereGeometry(.27,14,10,0,Math.PI*2,0,Math.PI*.6),uni,0,0,-.05));
  if(o.back){ const p=new THREE.Mesh(new THREE.PlaneGeometry(.62,.23),new THREE.MeshStandardMaterial({map:backTex(),roughness:.6})); p.position.set(0,1.58,-.392); p.rotation.y=Math.PI; g.add(p); }
  if(o.scale) g.scale.setScalar(o.scale);
  g.userData={arms,legs,head,ph:Math.random()*6}; return g;
}
function seat(p){ p.userData.legs.forEach(l=>{ l.rotation.x=-Math.PI/2; l.position.z=.05; }); p.position.y-=.5; p.userData.arms.forEach(a=>a.rotation.x=-1.2); p.userData.seated=true; return p; }
function makeTree(s=1){ const g=new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.22*s,.32*s,3*s,7),once('trunkM',()=>M({color:0x4a3624,roughness:.9})),0,1.5*s,0));
  const c=mesh(new THREE.IcosahedronGeometry(2.4*s,1),once('leafM',()=>M({color:0x3e7a3e,roughness:.85,flatShading:true})),0,4.4*s,0); c.scale.y=1.15; g.add(c); return g; }
function flashSirens(list,k){ for(const c of list){ const u=c.userData; if(!u||!u.red) continue; const r=Math.floor((T*6+u.ph))%4<2;
  u.red.emissiveIntensity=r?3:0; u.blue.emissiveIntensity=r?0:3; if(u.gr){ u.gr.material.opacity=r?k:0; u.gb.material.opacity=r?0:k; } if(u.fr){ u.fr.material.opacity=r?.55*k:0; u.fb.material.opacity=r?0:.55*k; } } }
function sirensOff(c){ const u=c.userData; if(!u||!u.red) return; u.red.emissiveIntensity=0; u.blue.emissiveIntensity=0; if(u.gr){ u.gr.material.opacity=0; u.gb.material.opacity=0; } if(u.fr){ u.fr.material.opacity=0; u.fb.material.opacity=0; } }

// ================= exteriores (cielo, sol, lluvia) =================
function outdoor(scene,shadowSize=70){
  const o={winMats:[],lamps:[],mode:''};
  o.sky=new THREE.Mesh(new THREE.SphereGeometry(450,32,16),new THREE.MeshBasicMaterial({side:THREE.BackSide,fog:false,depthWrite:false})); scene.add(o.sky);
  o.hemi=new THREE.HemisphereLight(0xbcd4ff,0x3a3428,.45); scene.add(o.hemi);
  o.sun=new THREE.DirectionalLight(0xfff1dc,1.5); o.sun.position.set(-60,80,40); o.sun.castShadow=true; o.sun.shadow.mapSize.set(2048,2048);
  Object.assign(o.sun.shadow.camera,{left:-shadowSize,right:shadowSize,top:shadowSize,bottom:-shadowSize,near:1,far:300}); o.sun.shadow.bias=-.0004; scene.add(o.sun); scene.add(o.sun.target);
  const N=2200, pos=new Float32Array(N*6); for(let i=0;i<N;i++){ const x=rnd(-40,40), y=rnd(0,30), z=rnd(-40,40); pos.set([x,y,z,x+.05,y-.7,z],i*6); }
  const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  o.rain=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xa9c0e0,transparent:true,opacity:.35})); o.rain.visible=false; o.rain.frustumCulled=false; scene.add(o.rain);
  o.setMode=(m)=>{ if(m===o.mode) return; o.mode=m; const t=skyTex(m); o.sky.material.map=t; o.sky.material.needsUpdate=true;
    const es=new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(100,32,16),new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide})));
    if(o.env) o.env.dispose(); o.env=pmrem.fromScene(es,.02); scene.environment=o.env.texture;
    const cfg={day:{sun:1.5,sc:0xfff1dc,h:.45,e:.78,win:.15,lamp:0,fog:0xc9d6e6},dusk:{sun:.9,sc:0xffa060,h:.3,e:.8,win:.9,lamp:.7,fog:0x8a6a6a},night:{sun:.18,sc:0x8fa8ff,h:.24,e:1.0,win:1.5,lamp:1,fog:0x0d1530}}[m];
    o.cfg=cfg; o.sun.intensity=cfg.sun; o.sun.color.setHex(cfg.sc); o.hemi.intensity=cfg.h; o.exposure=cfg.e;
    o.winMats.forEach(w=>w.emissiveIntensity=w.userData.k!=null?cfg.win*w.userData.k:cfg.win);
    o.lamps.forEach(s=>s.material.opacity=cfg.lamp); scene.fog=new THREE.Fog(cfg.fog,90,330);
    const envK=m==='night'?.25:m==='dusk'?.5:.6;
    scene.traverse(x=>{ const ms=Array.isArray(x.material)?x.material:x.material?[x.material]:[]; ms.forEach(mt=>{ if(mt.isMeshStandardMaterial) mt.envMapIntensity=mt.metalness>.6?envK*1.6:envK*.5; }); }); };
  o.rainTick=(dt,cx,cz)=>{ if(!o.rain.visible) return; o.rain.position.set(cx||0,0,cz||0); const ra=o.rain.geometry.attributes.position.array; for(let i=0;i<ra.length;i+=6){ ra[i+1]-=dt*26; ra[i+4]-=dt*26; if(ra[i+4]<0){ ra[i+1]+=30; ra[i+4]+=30; } } o.rain.geometry.attributes.position.needsUpdate=true; };
  return o;
}
const modeOf=h=>h>=8&&h<19?'day':(h>=19&&h<21.5)||(h>=6&&h<8)?'dusk':'night';

// ================= escena: COMISARÍA =================
function buildHub(){
  const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(48,1,.1,900), out=outdoor(scene);
  const ground=mesh(new THREE.PlaneGeometry(600,600),M({map:asphaltTex(),roughness:.4,metalness:.25}),0,0,0,false); ground.rotation.x=-Math.PI/2; scene.add(ground);
  const plaza=mesh(new THREE.PlaneGeometry(110,72),M({map:pavingTex(),color:0x9da3ad,roughness:.24,metalness:.3}),0,.02,8,false); plaza.rotation.x=-Math.PI/2; scene.add(plaza);
  const line=M({color:0xe8e4d0,roughness:.5});
  for(let x=-90;x<90;x+=8){ const l=mesh(new THREE.PlaneGeometry(4,.25),line,x,.03,50,false); l.rotation.x=-Math.PI/2; scene.add(l); }
  scene.add(mesh(new THREE.BoxGeometry(110,.25,.5),M({color:0x9a9fa8,roughness:.7}),0,.12,44));
  scene.add(mesh(new THREE.CylinderGeometry(.12,.15,20,12),M({color:0xd8dde6,metalness:.8,roughness:.3}),-22,10,-13));
  const fg=new THREE.PlaneGeometry(6,4,24,12); fg.translate(3,0,0); const flag=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:flagTex(),side:THREE.DoubleSide,roughness:.8}));
  flag.position.set(-22,17.5,-13); flag.castShadow=true; scene.add(flag); const flagPos=fg.attributes.position.array.slice();
  const fac=['#d9cdb6','#b9bfc9','#c98d6a','#e6e1d6'].map(c=>facadeTex(c));
  for(let i=0;i<55;i++){ const w=rnd(10,22), h=rnd(12,58), d=rnd(10,18); let x=rnd(-160,160), z=rnd(-60,-190); if(i<10){ x=(i%2?1:-1)*rnd(62,110); z=rnd(-40,10); }
    const t=fac[i%4]; const m=M({map:t,roughness:.8,emissive:0xffffff,emissiveMap:t,emissiveIntensity:0}); m.userData.k=.6; out.winMats.push(m);
    scene.add(mesh(boxUV(w,h,d,10,20),m,x,h/2,z)); }
  for(const [x,z] of [[-42,-10],[-48,10],[42,-10],[48,10],[-40,30],[40,30],[-60,-30],[60,-30],[-70,12],[70,12]]){ const t=makeTree(rnd(.9,1.2)); t.position.set(x,0,z); scene.add(t); }
  const lampM=M({color:0x2a2f38,metalness:.7,roughness:.4}), bulb=M({color:0xffffff,emissive:0xffd9a0,emissiveIntensity:1});
  for(const [x,z] of [[-30,22],[30,22],[-46,40],[46,40]]){ scene.add(mesh(new THREE.CylinderGeometry(.1,.14,7,8),lampM,x,3.5,z)); scene.add(mesh(new THREE.BoxGeometry(1.4,.15,.15),lampM,x+.6,7,z)); scene.add(mesh(new THREE.BoxGeometry(.6,.2,.4),bulb,x+1.2,6.9,z,false));
    const s=sprite(0xffc890,7); s.position.set(x+1.2,6.8,z); scene.add(s); out.lamps.push(s); }
  const heli=makeHeli(); scene.add(heli);
  SC.hub={scene,cam,out,flag,flagPos,heli,dyn:null,cars:[],people:[],key:'',sway:0};
}
function vehicleModel(v){ const V=(window.PE_DATA.VEHICLES||[]).find(x=>x.id===v)||{cat:'patrulla',model:{}};
  if(V.cat==='furgoneta') return makeVan(); if(V.cat==='moto') return makeMoto();
  if(V.cat==='dron'){ const d=makeDrone(); d.position.y=3; const g=new THREE.Group(); g.add(d); g.userData=d.userData; return g; }
  if(V.cat==='heli'){ const h=makeHeli(); h.position.y=1.3; const g=new THREE.Group(); g.add(h); g.userData=h.userData; return g; }
  return makeCar(V.model); }
function hubDynamic(info){
  const H=SC.hub, scene=H.scene;
  if(H.dyn) scene.remove(H.dyn);
  const dyn=H.dyn=new THREE.Group(); scene.add(dyn); H.cars=[]; H.people=[];
  const lvl=info.lvl||1, W=40+(lvl-1)*8;
  const concrete=M({color:0xb8bec8,roughness:.85}), navy=M({color:0x13224a,roughness:.5,metalness:.3});
  dyn.add(mesh(new THREE.BoxGeometry(W,14,14),concrete,0,7,-25)); dyn.add(mesh(new THREE.BoxGeometry(W+.4,.6,14.4),M({color:0xb8bec8}),0,14.1,-25));
  const wt=windowTex(), wm=M({map:wt,emissive:0xffffff,emissiveMap:wt,emissiveIntensity:.2,roughness:.08,metalness:.65}); H.out.winMats.push(wm);
  dyn.add(mesh(new THREE.PlaneGeometry(W-4,7.4),wm,0,4.6,-17.96,false));
  dyn.add(mesh(new THREE.BoxGeometry(W-2,4,.5),navy,0,11,-17.9));
  const sgt=signTex(), sm=M({map:sgt,emissive:0xffffff,emissiveMap:sgt,emissiveIntensity:.35,roughness:.4}); sm.userData.k=.4; H.out.winMats.push(sm);
  dyn.add(mesh(new THREE.PlaneGeometry(24,3.75),sm,0,11,-17.62,false));
  dyn.add(mesh(new THREE.BoxGeometry(13,.5,5),concrete,0,8.4,-15.6));
  for(const x of [-5.6,5.6]) dyn.add(mesh(new THREE.CylinderGeometry(.3,.3,8.2,12),concrete,x,4.1,-13.6));
  for(let i=0;i<3;i++) dyn.add(mesh(new THREE.BoxGeometry(16-i*1.2,.3,1.4),concrete,0,.15+i*.3,-13.2-i*1.1));
  dyn.add(mesh(new THREE.BoxGeometry(3,2,3),M({color:0x8d939c}),-12,15.5,-28)); dyn.add(mesh(new THREE.BoxGeometry(3,2,3),M({color:0x8d939c}),8,15.5,-28));
  if(lvl>=2) for(const sx of [-1,1]){ const x=sx*(W/2+8); dyn.add(mesh(new THREE.BoxGeometry(16,10,13),concrete,x,5,-24)); dyn.add(mesh(new THREE.PlaneGeometry(14,5),wm,x,4.5,-17.45,false)); }
  if(lvl>=3) dyn.add(mesh(new THREE.CylinderGeometry(6,6,.3,32),M({map:ctex(256,256,(g,w,h)=>{ g.fillStyle='#3a404a'; g.fillRect(0,0,w,h); g.strokeStyle='#ffc94a'; g.lineWidth=10; g.beginPath(); g.arc(128,128,100,0,7); g.stroke(); g.fillStyle='#fff'; g.font='bold 140px Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('H',128,136); }),roughness:.6}),W/2-9,14.6,-25));
  const spots=[[-15,-4,.55],[11,-6,-.35],[22,-10,-.15],[-25,-11,.2],[30,2,-.9],[-33,3,.9],[4,6,1.2],[-8,8,-1.0]];
  (info.fleet||[]).filter(v=>v!=='heli').slice(0,spots.length).forEach((v,i)=>{ const [x,z,r]=spots[i]; const c=vehicleModel(v); c.position.set(x,0,z); c.rotation.y=r; dyn.add(c); H.cars.push(c); });
  (info.staff||[]).slice(0,9).forEach((s,i)=>{ const p=makePerson(s); const row=i<5?0:1; p.position.set((i%5-2)*2.4+(row?1.2:0),0,-12.4+row*2.6); p.rotation.y=(Math.random()-.5)*.5; dyn.add(p); H.people.push(p); });
  const me=makePerson({body:0x14203f,skin:0xe6b48e,hair:0x2b1b12,vest:0x0c0f16,legs:0x10141f,back:true}); me.position.set(0,0,25.6); me.rotation.y=Math.PI; me.scale.setScalar(1.05); dyn.add(me); H.people.push(me);
  H.heli.visible=!!info.heli; H.out.mode='';
}
function hubTick(dt){
  const H=SC.hub; H.sway+=dt;
  H.cam.position.set(.55+Math.sin(H.sway*.25)*.2,2.32+Math.sin(H.sway*.4)*.03,29.6); H.cam.lookAt(-.2,5.1,-25);
  flashSirens(H.cars,H.out.mode==='day'?.7:1.2);
  H.cars.forEach(c=>{ const u=c.userData; if(u.rotors) u.rotors.forEach(r=>r.rotation.y+=dt*40); });
  const p=H.flag.geometry.attributes.position; for(let i=0;i<p.count;i++){ const x=H.flagPos[i*3], y=H.flagPos[i*3+1]; p.array[i*3+2]=Math.sin(x*1.3-T*4.5+y*.4)*.35*(x/6); } p.needsUpdate=true; H.flag.geometry.computeVertexNormals();
  const a=T*.16, hh=H.heli; hh.position.set(Math.cos(a)*26+4,21+Math.sin(T*.6)*1.2,-26+Math.sin(a)*12); hh.rotation.set(0,-a-Math.PI/2,.18); hh.userData.rotor.rotation.y+=dt*28; hh.userData.trotor.rotation.x+=dt*40; hh.userData.b1.material.opacity=Math.floor(T*2)%2?1:.1;
  H.people.forEach(pp=>{ const u=pp.userData; u.ph+=dt; u.arms.forEach((ar,i)=>ar.rotation.x=Math.sin(u.ph*1.3+i)*.06); });
  H.out.rainTick(dt,0,20); R.toneMappingExposure=H.out.exposure||.8;
}

// ================= escena: INTERROGATORIO =================
function evidenceTex(kind){ return ctex(256,192,(g,w,h)=>{ g.fillStyle='#f2efe6'; g.fillRect(0,0,w,h); g.fillStyle='#333'; g.fillRect(10,10,w-20,h-40);
  if(kind===0){ g.fillStyle='#5a6a80'; g.fillRect(10,90,w-20,52); g.fillStyle='#1a2338'; g.fillRect(60,70,120,40); g.fillStyle='#0b0f18'; g.beginPath(); g.arc(80,112,12,0,7); g.arc(160,112,12,0,7); g.fill(); }
  else if(kind===1){ g.fillStyle='#8a8f98'; g.fillRect(10,10,w-20,h-40); g.fillStyle='#c9a46a'; for(let i=0;i<6;i++) g.fillRect(30+i*32,60+(i%2)*20,26,40); }
  else { g.fillStyle='#2a3348'; g.fillRect(10,10,w-20,h-40); g.fillStyle='#e7b48f'; g.beginPath(); g.arc(128,70,26,0,7); g.fill(); g.fillStyle='#555'; g.fillRect(90,98,76,50); }
  g.fillStyle='#555'; g.font='14px Arial'; g.fillText('PRUEBA Nº '+(100+kind*7),14,h-12); }); }
function buildInterro(){
  const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(46,1,.05,100);
  scene.background=new THREE.Color(0x0b0e14);
  const floor=mesh(new THREE.PlaneGeometry(14,12),M({map:tileFloor(),roughness:.3,metalness:.25}),0,0,-1,false); floor.rotation.x=-Math.PI/2; scene.add(floor);
  const wall=M({map:panelWall('#5c626d','#4a4f59'),roughness:.85});
  scene.add(mesh(new THREE.BoxGeometry(14,5,.2),wall,0,2.5,-5.5)); scene.add(mesh(new THREE.BoxGeometry(.2,5,12),wall,7,2.5,-1)); scene.add(mesh(new THREE.BoxGeometry(.2,5,12),wall,-7,2.5,-1));
  const mirror=mesh(new THREE.PlaneGeometry(5,2.2),M({color:0x0a0d14,roughness:.04,metalness:1}),-6.88,2.2,-1.5,false); mirror.rotation.y=Math.PI/2; scene.add(mirror);
  scene.add(mesh(new THREE.BoxGeometry(.1,2.4,5.2),M({color:0x2a2e36,metalness:.6}),-6.9,2.2,-1.5));
  const ceil=mesh(new THREE.PlaneGeometry(14,12),M({color:0x1a1d24}),0,5,-1,false); ceil.rotation.x=Math.PI/2; scene.add(ceil);
  scene.add(new THREE.HemisphereLight(0x8090b0,0x202020,.3));
  const spot=new THREE.SpotLight(0xfff1d6,3,14,.75,.55,1.2); spot.position.set(0,3.6,-1); spot.target.position.set(0,.8,-1.1); spot.castShadow=true; spot.shadow.mapSize.set(1024,1024); scene.add(spot,spot.target);
  const fill=new THREE.PointLight(0x7f9cff,.6,20); fill.position.set(4,3,3); scene.add(fill);
  scene.add(mesh(new THREE.CylinderGeometry(.01,.01,1.2,4),M({color:0x111111}),0,4.4,-1));
  scene.add(mesh(new THREE.ConeGeometry(.45,.35,20,1,true),M({color:0x2b2f36,metalness:.7,roughness:.4,side:THREE.DoubleSide}),0,3.75,-1));
  scene.add(mesh(new THREE.SphereGeometry(.12,10,8),M({color:0xffffff,emissive:0xfff0d0,emissiveIntensity:3}),0,3.62,-1,false));
  const steel=M({color:0x8a8f98,metalness:.75,roughness:.32});
  scene.add(mesh(new THREE.BoxGeometry(3.2,.08,1.6),steel,0,.8,-1.1)); for(const [x,z] of [[1.5,-.4],[-1.5,-.4],[1.5,-1.8],[-1.5,-1.8]]) scene.add(mesh(new THREE.CylinderGeometry(.04,.04,.8,8),steel,x,.4,z));
  const chair=(x,z,r)=>{ const g=new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(.6,.06,.6),steel,0,.48,0)); g.add(mesh(new THREE.BoxGeometry(.6,.7,.06),steel,0,.85,-.28)); for(const [a,b] of [[.25,.25],[-.25,.25],[.25,-.25],[-.25,-.25]]) g.add(mesh(new THREE.CylinderGeometry(.025,.025,.48,6),steel,a,.24,b)); g.position.set(x,0,z); g.rotation.y=r; scene.add(g); };
  chair(0,-2.05,0); chair(1.4,-2.05,0); chair(.2,.6,Math.PI+.3);
  [0,1,2].forEach(k=>{ const p=mesh(new THREE.PlaneGeometry(.42,.31),M({map:evidenceTex(k),roughness:.7}),-.9+k*.5,.845,-.75+(k%2)*.1,false); p.rotation.x=-Math.PI/2; p.rotation.z=(k-1)*.2; scene.add(p); });
  const folder=mesh(new THREE.BoxGeometry(.5,.02,.36),M({color:0xc9a46a,roughness:.8}),.95,.85,-.75); folder.rotation.y=.2; scene.add(folder);
  scene.add(mesh(new THREE.CylinderGeometry(.05,.04,.14,12),M({color:0xdde8f5,transparent:true,opacity:.6,roughness:.05}),-1.2,.91,-1.4));
  const me=makePerson({body:0x14203f,skin:0xe6b48e,hair:0x2b1b12,vest:0x0c0f16,legs:0x10141f,back:true}); me.position.set(2.5,0,2.1); me.rotation.y=-2.56; scene.add(me);
  SC.interro={scene,cam,suspect:null,lawyer:null,me,lookKey:'',mood:'neutral',moodT:0};
}
function interroSet(d){
  const I=SC.interro, k=JSON.stringify(d.look);
  if(k!==I.lookKey){ if(I.suspect) I.scene.remove(I.suspect); I.lookKey=k;
    I.suspect=seat(makePerson({body:d.look.cloth||'#7b808a',skin:d.look.skin,hair:d.look.hair,long:d.look.long,legs:'#2a3040',hood:true})); I.suspect.position.z=-1.95; I.scene.add(I.suspect); }
  if(!I.lawyer){ I.lawyer=seat(makePerson({body:'#23262e',skin:'#e6b48e',hair:'#5a3820',suit:true,legs:'#23262e'})); I.lawyer.position.set(1.4,I.lawyer.position.y,-1.95); I.lawyer.userData.arms.forEach(a=>a.rotation.x=-.9); I.scene.add(I.lawyer); }
  I.lawyer.visible=!!d.lawyer;
  if(d.mood&&d.mood!==I.mood){ I.mood=d.mood; I.moodT=0; }
}
function interroTick(dt){
  const I=SC.interro; I.moodT+=dt;
  I.cam.position.set(3.35+Math.sin(T*.3)*.05,2.4,4.5); I.cam.lookAt(-.9,1.0,-1.9);
  if(I.suspect){ const h=I.suspect.userData.head, m=I.mood, t=I.moodT; h.rotation.set(0,0,0); I.suspect.position.z=-1.95;
    if(m==='deny') h.rotation.y=Math.sin(t*9)*.35*Math.max(0,1-t/1.6);
    else if(m==='confess') h.rotation.x=.25+Math.sin(t*6)*.15*Math.max(0,1-t/2);
    else if(m==='silent') h.rotation.x=.45;
    else if(m==='scared'){ h.rotation.x=-.15; h.rotation.y=Math.sin(t*3)*.15; I.suspect.position.z=-1.95-.1*Math.min(1,t*3); }
    else { h.rotation.y=Math.sin(T*.6)*.1; h.rotation.x=Math.sin(T*.4)*.05; } }
  if(I.lawyer&&I.lawyer.visible) I.lawyer.userData.head.rotation.y=-.4+Math.sin(T*.5)*.1;
  R.toneMappingExposure=1.1;
}

// ================= escena: CALABOZOS =================
function buildCells(){
  const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(50,1,.05,120); scene.background=new THREE.Color(0x080a10); scene.fog=new THREE.Fog(0x080a10,20,46);
  const floor=mesh(new THREE.PlaneGeometry(26,50),M({map:tileFloor(),roughness:.18,metalness:.4}),0,0,-14,false); floor.rotation.x=-Math.PI/2; scene.add(floor);
  const wall=M({map:panelWall('#7a7f88','#6a6f78'),roughness:.85});
  scene.add(mesh(new THREE.BoxGeometry(.3,4.4,50),wall,-10,2.2,-14)); scene.add(mesh(new THREE.BoxGeometry(.3,4.4,50),wall,10,2.2,-14)); scene.add(mesh(new THREE.BoxGeometry(20,4.4,.3),wall,0,2.2,-38));
  const ceil=mesh(new THREE.PlaneGeometry(26,50),M({color:0x2a2d34}),0,4.4,-14,false); ceil.rotation.x=Math.PI/2; scene.add(ceil);
  scene.add(new THREE.HemisphereLight(0x9fb0d0,0x202020,.4));
  const strip=M({color:0xffffff,emissive:0xe8f0ff,emissiveIntensity:2});
  for(let z=2;z>-36;z-=7){ scene.add(mesh(new THREE.BoxGeometry(.4,.06,2.6),strip,0,4.36,z,false)); const pl=new THREE.PointLight(0xdfe8ff,.9,14,1.6); pl.position.set(0,4,z); scene.add(pl); }
  const bar=M({color:0x5d636d,metalness:.85,roughness:.35}), barG=new THREE.CylinderGeometry(.04,.04,3.6,8), sep=M({color:0x6a6f78,roughness:.8});
  const cells=[];
  for(let i=0;i<8;i++){ const side=i%2?1:-1, z=-3-Math.floor(i/2)*6.2, x=side*4;
    for(let k=-2.7;k<=2.71;k+=.3){ const b=new THREE.Mesh(barG,bar); b.position.set(x,1.8,z+k); b.castShadow=true; scene.add(b); }
    for(const y of [.4,2.2,3.5]) scene.add(mesh(new THREE.BoxGeometry(.08,.08,5.6),bar,x,y,z));
    scene.add(mesh(new THREE.BoxGeometry(6,4.4,.2),sep,side*7,2.2,z-3.1));
    scene.add(mesh(new THREE.BoxGeometry(1,.5,3),M({color:0x8a8f98,roughness:.7}),side*8.8,.25,z));
    scene.add(mesh(new THREE.BoxGeometry(.6,.45,.6),M({color:0xd8dde6,metalness:.6,roughness:.3}),side*9.4,.23,z+2.2));
    cells.push({x,z,side}); }
  scene.add(mesh(new THREE.BoxGeometry(6,4.4,.2),sep,-7,2.2,-27.9)); scene.add(mesh(new THREE.BoxGeometry(6,4.4,.2),sep,7,2.2,-27.9));
  const sel=new THREE.SpotLight(0xffc94a,0,10,.5,.6,1); sel.position.set(0,4.2,0); scene.add(sel,sel.target);
  const guard=makePerson({body:0x14203f,skin:0xe6b48e,hair:0x2b1b12,vest:0x0c0f16,legs:0x10141f,back:true}); guard.position.set(.4,0,3.2); guard.rotation.y=Math.PI+.15; scene.add(guard);
  SC.cells={scene,cam,cells,prisoners:[],key:'',sel,guard,labels:[]};
}
function cellsSet(d){
  const C=SC.cells, k=d.list.map(x=>x.id).join(',');
  if(k!==C.key){ C.key=k; C.prisoners.forEach(p=>C.scene.remove(p)); C.labels.forEach(l=>C.scene.remove(l)); C.prisoners=[]; C.labels=[];
    d.list.slice(0,8).forEach((x,i)=>{ const c=C.cells[i]; const p=makePerson({body:'#e8742a',skin:x.look.skin,hair:x.look.hair,long:x.look.long,legs:'#d8661f'});
      if(i%3===0){ seat(p); p.userData.arms.forEach(a=>a.rotation.x=-.4); p.position.set(c.side*8.6,p.position.y+.5,c.z); p.rotation.y=-c.side*Math.PI/2; }
      else { p.position.set(c.x+c.side*.8,0,c.z+(i%2?.6:-.6)); p.rotation.y=-c.side*Math.PI/2; }
      C.scene.add(p); C.prisoners.push(p);
      const lb=textSprite(x.name.split(' ').slice(0,2).join(' ')); lb.position.set(c.x-c.side*.3,3.9,c.z); C.scene.add(lb); C.labels.push(lb); }); }
  const i=d.sel; if(i!=null&&i>=0&&i<8){ const c=C.cells[i]; C.sel.intensity=2.4; C.sel.position.set(c.x+c.side*2.2,4.2,c.z); C.sel.target.position.set(c.x+c.side*2.2,0,c.z); } else C.sel.intensity=0;
}
function cellsTick(dt){ const C=SC.cells; C.cam.position.set(1.2+Math.sin(T*.25)*.15,2.05,6.6); C.cam.lookAt(-.6,1.5,-14);
  C.prisoners.forEach((p,i)=>{ const u=p.userData; u.ph+=dt; if(!u.seated) u.arms.forEach((a,j)=>a.rotation.x=Math.sin(u.ph*.8+j)*.08); u.head.rotation.y=Math.sin(u.ph*.5+i)*.3; });
  R.toneMappingExposure=1.0; }

// ================= escena: PATRULLA EN LA CALLE =================
const PS=.25;   // 1 píxel del mapa = 0,25 unidades 3D
function buildStreet(){
  const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(62,1,.1,700), out=outdoor(scene,90);
  const grass=mesh(new THREE.PlaneGeometry(900,900),M({color:0x4a5d3e,roughness:.95}),0,-.06,0,false); grass.rotation.x=-Math.PI/2; scene.add(grass);
  const head=new THREE.SpotLight(0xfff4e0,0,70,.45,.5,1.2); scene.add(head,head.target);
  SC.street={scene,cam,out,city:null,group:null,ents:new Map(),head,camPos:new THREE.Vector3(0,8,20),camLook:new THREE.Vector3(),sirens:[]};
}
const FAC=()=>once('streetFac',()=>['#d9cdb6','#b9bfc9','#c98d6a','#e6e1d6','#a9b4c4','#d8b98e'].map(c=>{ const t=facadeTex(c,.35); const m=M({map:t,roughness:.8,emissive:0xffffff,emissiveMap:t,emissiveIntensity:0}); m.userData.k=.7; return m; }));
function streetCity(c){
  const S=SC.street; const key=c.id+'|'+c.owned+'|'+c.lvl; if(S.city===key) return; S.city=key; S.cx=c.x; S.cy=c.y;
  if(S.group) S.scene.remove(S.group);
  S.ents.forEach(e=>S.scene.remove(e.obj)); S.ents.clear();
  const g=S.group=new THREE.Group(); S.scene.add(g);
  const RR=c.r+70, tex=new THREE.CanvasTexture(c.ground); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=8;
  const gp=mesh(new THREE.PlaneGeometry(2*RR*PS,2*RR*PS),M({map:tex,roughness:.45,metalness:.2}),0,0,0,false); gp.rotation.x=-Math.PI/2; g.add(gp);
  const fac=FAC(); fac.forEach(m=>{ if(!S.out.winMats.includes(m)) S.out.winMats.push(m); });
  const roofM=M({color:0x8d939c,roughness:.8}), tileM=M({color:0xa8502c,roughness:.75}), poolM=M({color:0x3fb3dc,roughness:.1,metalness:.2}), swM=M({color:0x8a8f99,roughness:.8});
  for(const b of c.blocks){
    g.add(mesh(new THREE.BoxGeometry((b.w+10)*PS,.18,(b.h+10)*PS),swM,(b.x+b.w/2-c.x)*PS,.09,(b.y+b.h/2-c.y)*PS,false));
    for(const d of b.bld){ const w=d.w*PS, dp=d.h*PS, h=3+d.ht*.5, fm=fac[Math.abs(Math.round(d.hue))%fac.length];
      const m=mesh(boxUV(w,h,dp,10,20),[fm,fm,d.tile?tileM:roofM,roofM,fm,fm],(d.x+d.w/2-c.x)*PS,h/2+.18,(d.y+d.h/2-c.y)*PS); g.add(m);
      if(d.pool&&!d.tile) g.add(mesh(new THREE.BoxGeometry(w*.45,.05,dp*.3),poolM,m.position.x,h+.2,m.position.z,false)); }
    for(const t of b.trees){ const tr=makeTree(.55+t.r/40); tr.position.set((t.x-c.x)*PS,.18,(t.y-c.y)*PS); g.add(tr); }
  }
  const poleG=new THREE.CylinderGeometry(.09,.12,6,6), armG=new THREE.BoxGeometry(1.2,.1,.1), headG=new THREE.BoxGeometry(.5,.16,.3), poleM=once('poleM',()=>M({color:0x2a2f38,metalness:.7,roughness:.4})), bulbM=once('bulbM',()=>M({color:0xffffff,emissive:0xffd9a0,emissiveIntensity:1.2}));
  S.out.lamps=S.out.lamps.filter(l=>l.parent&&l.parent!==S.group&&!l.userData.city);
  const n=Math.floor(c.r/120);
  for(let i=-n;i<=n;i++) for(let j=-n;j<=n;j++){ const x=c.x+i*120+18, y=c.y+j*120+18; if(Math.hypot(x-c.x,y-c.y)>c.r-6||(Math.abs(i)<=1&&Math.abs(j)<=1)) continue;
    const X=(x-c.x)*PS, Z=(y-c.y)*PS; g.add(mesh(poleG,poleM,X,3,Z,false)); g.add(mesh(armG,poleM,X-.5,6,Z,false)); g.add(mesh(headG,bulbM,X-1,5.92,Z,false));
    const sp=sprite(0xffc890,6); sp.position.set(X-1,5.8,Z); sp.userData.city=true; sp.material.opacity=0; g.add(sp); S.out.lamps.push(sp); }
  const P=c.plaza, bw=(c.owned?(c.lvl===1?160:c.lvl===2?190:206):160)*PS;
  const st=new THREE.Group(); st.position.set(0,0,(P.y+30-c.y)*PS); g.add(st);
  st.add(mesh(new THREE.BoxGeometry(bw,9,46*PS),M({color:c.owned?0xb8bec8:0x7a7f88,roughness:.85}),0,4.5,0));
  if(c.owned){ const sgt=signTex(); st.add(mesh(new THREE.PlaneGeometry(bw*.8,bw*.8*.16),M({map:sgt,emissive:0xffffff,emissiveMap:sgt,emissiveIntensity:.5}),0,7.2,46*PS/2+.02,false));
    const wt=windowTex(); st.add(mesh(new THREE.PlaneGeometry(bw*.9,4),M({map:wt,emissive:0xffffff,emissiveMap:wt,emissiveIntensity:.4,roughness:.1,metalness:.6}),0,2.6,46*PS/2+.02,false));
    const ring=new THREE.Mesh(new THREE.RingGeometry(c.drop.r*PS-.4,c.drop.r*PS,40),new THREE.MeshBasicMaterial({color:0x3d8bff,transparent:true,opacity:.85})); ring.rotation.x=-Math.PI/2; ring.position.set((c.drop.x-c.x)*PS,.06,(c.drop.y-c.y)*PS); g.add(ring); }
  S.out.mode='';
}
function entity(key,make){ const S=SC.street; let e=S.ents.get(key); if(!e){ e={obj:make(),seen:true}; S.ents.set(key,e); S.scene.add(e.obj); } e.seen=true; return e.obj; }
function place(o,x,y,a,kind){ const S=SC.street; o.position.x=(x-S.cx)*PS; o.position.z=(y-S.cy)*PS; o.rotation.y=kind==='car'?-a:Math.PI/2-a; }
function animWalk(o,walk,moving){ const u=o.userData; if(!u.legs||u.seated) return; const s=moving?Math.sin(walk)*.6:0; u.legs[0].rotation.x=s; u.legs[1].rotation.x=-s; u.arms[0].rotation.x=-s*.7; u.arms[1].rotation.x=s*.7; }
function streetSync(st){
  const S=SC.street; S.ents.forEach(e=>e.seen=false); S.sirens=[];
  const p=st.player, pk=p.mode==='foot'?'me-foot':'me-car';
  const me=entity(pk,()=>p.mode==='foot'?makePerson({body:0x14203f,skin:0xe6b48e,hair:0x2b1b12,vest:0x0c0f16,legs:0x10141f,back:true}):makeCar({len:4.6,h:1.05,cab:.82}));
  place(me,p.x,p.y,p.ang,p.mode==='foot'?'p':'car'); if(p.mode==='foot') animWalk(me,p.walk,p.moving); else if(p.siren) S.sirens.push(me); else sirensOff(me);
  S.me=me; S.meCar=p.mode!=='foot'; S.pang=p.ang;
  for(const a of st.actors){ const o=entity('a'+a.id+(a.veh||''),()=>a.veh?vehicleModel(a.veh):makePerson(a.look));
    place(o,a.x,a.y,a.ang,a.veh?'car':'p'); if(a.veh){ if(a.siren) S.sirens.push(o); else sirensOff(o); } else animWalk(o,a.walk,a.moving); }
  for(const k of (st.cars||[])){ const o=entity('t'+k.id,()=>makeCar({civil:true,color:k.col,len:4.2,h:.9,cab:.75})); place(o,k.x,k.y,k.ang,'car'); }
  for(const q of st.peds){ const o=entity('p'+q.id,()=>makePerson({body:q.body,skin:q.skin,hair:q.hair,long:q.long,legs:'#2a3040'})); place(o,q.x,q.y,q.ang,'p'); animWalk(o,q.walk,!q.stopped);
    if(!o.userData.mark){ const s=textSprite('?','#1a1300','rgba(255,201,74,.95)'); s.scale.set(.5,.5,1); s.position.y=2.9; o.add(s); o.userData.mark=s; }
    o.userData.mark.visible=!!q.sus; }
  for(const c of st.crimes){ c.people.forEach((lk,i)=>{ const o=entity('c'+c.id+'_'+i,()=>{ const pp=makePerson({body:'#3a2030',skin:lk.skin,hair:lk.hair,long:lk.long}); const s=sprite(0xff2a3a,2.4); s.position.y=1.2; pp.add(s); return pp; });
      place(o,c.x+(i-(c.people.length-1)/2)*14,c.y,T*.5+i*2,'p'); animWalk(o,T*8+i,true); });
    const mk=entity('cm'+c.id,()=>{ const s=textSprite('!','#fff','rgba(255,59,78,.95)'); s.scale.set(1,1,1); s.material.depthTest=false; s.renderOrder=6; return s; }); mk.position.set((c.x-S.cx)*PS,4.2+Math.sin(T*4)*.2,(c.y-S.cy)*PS); }
  for(const r of st.raiders){ const o=entity('r'+r.id,()=>makePerson({body:'#5a1420',skin:r.look.skin,hair:r.look.hair,long:r.look.long})); place(o,r.x,r.y,r.ang,'p'); animWalk(o,r.walk,true); }
  for(const m of st.markers){ const o=entity('m'+m.key,()=>{ const g=new THREE.Group(); const ring=new THREE.Mesh(new THREE.RingGeometry(2.4,3,40),new THREE.MeshBasicMaterial({color:0xffc94a,transparent:true,opacity:.9,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.y=.08; g.add(ring);
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,30,20,1,true),new THREE.MeshBasicMaterial({color:0xffc94a,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false})); beam.position.y=15; g.add(beam); const lb=textSprite(m.label,'#1a1300','rgba(255,201,74,.95)'); lb.position.y=5; lb.material.depthTest=false; lb.renderOrder=6; g.add(lb); return g; });
    o.position.set((m.x-S.cx)*PS,0,(m.y-S.cy)*PS); }
  S.ents.forEach((e,k)=>{ if(!e.seen){ S.scene.remove(e.obj); S.ents.delete(k); } });
  if(S.ringFor!==st.nearKey){ if(S.ring&&S.ring.parent) S.ring.parent.remove(S.ring); S.ringFor=st.nearKey;
    const e=st.nearKey&&(S.ents.get(st.nearKey)||[...S.ents.entries()].find(([k])=>k.startsWith(st.nearKey))?.[1]);
    if(e){ if(!S.ring){ S.ring=new THREE.Mesh(new THREE.RingGeometry(.7,.9,32),new THREE.MeshBasicMaterial({color:0xffc94a,transparent:true,opacity:.95,side:THREE.DoubleSide,depthTest:false})); S.ring.rotation.x=-Math.PI/2; S.ring.position.y=.08; S.ring.renderOrder=5; } (e.obj||e).add(S.ring); } }
  S.out.setMode(modeOf(st.hour)); S.out.rain.visible=!!st.rain;
}
function streetTick(dt){
  const S=SC.street; if(!S.me) return;
  const dir=new THREE.Vector3(Math.cos(S.pang),0,Math.sin(S.pang));
  const D=S.meCar?11:6.5, Hh=S.meCar?4.6:3.1;
  const want=S.me.position.clone().addScaledVector(dir,-D); want.y=Hh;
  S.camPos.lerp(want,Math.min(1,dt*4)); S.cam.position.copy(S.camPos);
  const look=S.me.position.clone().addScaledVector(dir,8); look.y=S.meCar?1.6:1.8; S.camLook.lerp(look,Math.min(1,dt*6)); S.cam.lookAt(S.camLook);
  const sp=S.me.position; S.out.sun.position.set(sp.x-60,80,sp.z+40); S.out.sun.target.position.copy(sp);
  const night=S.out.mode!=='day'; S.head.intensity=night&&S.meCar?2.4:0; S.head.position.set(sp.x+dir.x*2,1.4,sp.z+dir.z*2); S.head.target.position.set(sp.x+dir.x*20,0,sp.z+dir.z*20);
  flashSirens(S.sirens,S.out.mode==='day'?.8:1.3);
  S.out.rainTick(dt,sp.x,sp.z); R.toneMappingExposure=S.out.exposure||.8;
}

// ================= miniaturas de la tienda =================
let TR=null, TSc=null; const thumbCache={};
function thumb(id){
  if(!ok()) return null; if(thumbCache[id]) return thumbCache[id];
  try{
    if(!glowTex) glowTex=glow();
    if(!TR){ TR=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:true}); TR.setSize(420,260); TR.outputEncoding=THREE.sRGBEncoding; TR.toneMapping=THREE.ACESFilmicToneMapping; TR.toneMappingExposure=.85; TR.shadowMap.enabled=true;
      TSc={scene:new THREE.Scene(),cam:new THREE.PerspectiveCamera(32,420/260,.1,100)};
      const s=TSc.scene; s.add(new THREE.HemisphereLight(0xcfe0ff,0x303030,.7)); const d=new THREE.DirectionalLight(0xffffff,1.6); d.position.set(5,9,6); d.castShadow=true; s.add(d);
      const r=new THREE.PointLight(0x3d8bff,1.2,20); r.position.set(-4,3,-3); s.add(r);
      const fl=new THREE.Mesh(new THREE.CircleGeometry(9,48),M({color:0x141a26,roughness:.55,metalness:.3})); fl.rotation.x=-Math.PI/2; fl.receiveShadow=true; s.add(fl);
      const p=new THREE.PMREMGenerator(TR); const es=new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(50,16,8),new THREE.MeshBasicMaterial({map:skyTex('day'),side:THREE.BackSide}))); s.environment=p.fromScene(es,.03).texture; }
    const m=vehicleModel(id); const V=window.PE_DATA.VEHICLES.find(x=>x.id===id)||{};
    m.rotation.y=.55; TSc.scene.add(m);
    const far={heli:15,dron:2.6,moto:4.6,furgoneta:9.5}[V.cat]||8.2, y={heli:5,dron:4.1,moto:2,furgoneta:3.4}[V.cat]||2.8, ty={heli:1.3,dron:3,moto:.9,furgoneta:1.3}[V.cat]||.85;
    TSc.cam.position.set(far*.55,y,far*.85); TSc.cam.lookAt(0,ty,0);
    const keep=T; T=0; flashSirens([m],.9); T=keep;
    TR.render(TSc.scene,TSc.cam); const url=TR.domElement.toDataURL('image/png'); TSc.scene.remove(m);
    thumbCache[id]=url; return url; }catch(e){ console.warn(e); return null; }
}

// ================= bucle y API =================
function ensure(){ if(R) return; cvs=document.getElementById('hub3d');
  R=new THREE.WebGLRenderer({canvas:cvs,antialias:true,powerPreference:'high-performance'});
  R.setPixelRatio(Math.min(2,window.devicePixelRatio||1)); R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFSoftShadowMap;
  R.toneMapping=THREE.ACESFilmicToneMapping; R.outputEncoding=THREE.sRGBEncoding; pmrem=new THREE.PMREMGenerator(R); glowTex=glowTex||glow();
  addEventListener('resize',resize); resize(); }
function resize(){ if(!R) return; const w=innerWidth, h=innerHeight; R.setSize(w,h,false);
  for(const k in SC){ const c=SC[k].cam; c.aspect=w/h; if(k==='hub') c.fov=w/h<1?68:48; if(k==='street') c.fov=w/h<1?78:62; if(k==='interro') c.fov=w/h<1?70:46; if(k==='cells') c.fov=w/h<1?74:50; c.updateProjectionMatrix(); } }
function start(v){ view=v; resize(); cvs.hidden=false; if(!running){ running=true; last=performance.now(); requestAnimationFrame(tick); } }
function tick(t){
  if(!running) return; requestAnimationFrame(tick);
  const dt=Math.min(.05,(t-last)/1000||0); last=t; T+=dt;
  const s=SC[view]; if(!s) return;
  if(view==='hub') hubTick(dt); else if(view==='interro') interroTick(dt); else if(view==='cells') cellsTick(dt); else if(view==='street') streetTick(dt);
  R.render(s.scene,s.cam);
}
const guard=f=>(...a)=>{ if(!ok()) return false; try{ ensure(); return f(...a); }catch(e){ console.warn('3D no disponible',e); return false; } };
const API={
  open:guard(info=>{ if(!SC.hub) buildHub(); const H=SC.hub; const k=[info.city,info.lvl,(info.fleet||[]).join(),(info.staff||[]).length,info.heli].join('|');
    if(k!==H.key){ H.key=k; hubDynamic(info); } H.out.setMode(modeOf(info.hour)); H.out.rain.visible=!!info.rain; start('hub'); return true; }),
  update:guard(info=>{ if(view==='hub'&&running) API.open(info); return true; }),
  openInterro:guard(d=>{ if(!SC.interro) buildInterro(); interroSet(d); start('interro'); return true; }),
  setInterro:guard(d=>{ if(SC.interro) interroSet(d); return true; }),
  openCells:guard(d=>{ if(!SC.cells) buildCells(); cellsSet(d); start('cells'); return true; }),
  setCells:guard(d=>{ if(SC.cells) cellsSet(d); return true; }),
  openStreet:guard(c=>{ if(!SC.street) buildStreet(); streetCity(c); start('street'); return true; }),
  syncStreet:guard(st=>{ if(SC.street&&view==='street') streetSync(st); return true; }),
  thumb,
  close(){ running=false; view=null; if(cvs) cvs.hidden=true; },
  isOpen:()=>running, mode:()=>view, available:ok,
};
return API;
})();
