// Patrulla España · sonido sintetizado con Web Audio (sin archivos externos)
window.PE_AUDIO = (() => {
'use strict';
let ac=null, master=null, enabled=true, vol=.7;
let siren=null, engine=null, amb=null, sea=null, noiseBuf=null;
function noise(){ if(noiseBuf) return noiseBuf; const b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return noiseBuf=b; }
function loopNoise(){ const s=ac.createBufferSource(); s.buffer=noise(); s.loop=true; s.start(); return s; }
function init(){
  if(ac) { if(ac.state==='suspended') ac.resume(); return; }
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  try{ ac=new AC(); }catch(e){ return; }
  master=ac.createGain(); master.gain.value=enabled?vol:0; master.connect(ac.destination);
  // sirena: diente de sierra modulada por un LFO (sonido «wail»)
  { const o=ac.createOscillator(); o.type='sawtooth'; o.frequency.value=900;
    const lfo=ac.createOscillator(); lfo.frequency.value=.55; const lg=ac.createGain(); lg.gain.value=380; lfo.connect(lg); lg.connect(o.frequency);
    const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2200; const g=ac.createGain(); g.gain.value=0;
    o.connect(f); f.connect(g); g.connect(master); o.start(); lfo.start(); siren={g,lfo}; }
  // motor
  { const o=ac.createOscillator(); o.type='sawtooth'; o.frequency.value=55; const o2=ac.createOscillator(); o2.type='square'; o2.frequency.value=27.5;
    const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=380; const g=ac.createGain(); g.gain.value=0; const g2=ac.createGain(); g2.gain.value=.35;
    o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(master); o.start(); o2.start(); engine={o,o2,f,g}; }
  // ambiente de ciudad (rumor grave)
  { const n=loopNoise(); const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=420; const g=ac.createGain(); g.gain.value=0; n.connect(f); f.connect(g); g.connect(master); amb={g}; }
  // mar (olas con volumen que sube y baja)
  { const n=loopNoise(); const f=ac.createBiquadFilter(); f.type='bandpass'; f.frequency.value=600; f.Q.value=.4; const g=ac.createGain(); g.gain.value=0;
    const lfo=ac.createOscillator(); lfo.frequency.value=.12; const lg=ac.createGain(); lg.gain.value=.5; const base=ac.createGain(); base.gain.value=0;
    n.connect(f); f.connect(base); lfo.connect(lg); lg.connect(base.gain); base.connect(g); g.connect(master); lfo.start(); sea={g}; }
}
const now=()=>ac.currentTime;
function ramp(param,v,t=.25){ if(!ac) return; param.cancelScheduledValues(now()); param.setTargetAtTime(v,now(),t/3); }
function tone(freq,dur,type='sine',gain=.2,when=0,slide=null){ if(!ac||!enabled) return; const o=ac.createOscillator(), g=ac.createGain(); o.type=type; o.frequency.setValueAtTime(freq,now()+when);
  if(slide) o.frequency.exponentialRampToValueAtTime(slide,now()+when+dur);
  g.gain.setValueAtTime(0,now()+when); g.gain.linearRampToValueAtTime(gain,now()+when+.01); g.gain.exponentialRampToValueAtTime(.0001,now()+when+dur);
  o.connect(g); g.connect(master); o.start(now()+when); o.stop(now()+when+dur+.05); }
function burst(dur,freq,gain=.15){ if(!ac||!enabled) return; const s=ac.createBufferSource(); s.buffer=noise(); const f=ac.createBiquadFilter(); f.type='bandpass'; f.frequency.value=freq; f.Q.value=1.2; const g=ac.createGain();
  g.gain.setValueAtTime(gain,now()); g.gain.exponentialRampToValueAtTime(.0001,now()+dur); s.connect(f); f.connect(g); g.connect(master); s.start(); s.stop(now()+dur); }
return {
  init,
  setEnabled(b){ enabled=b; if(master) ramp(master.gain,b?vol:0,.2); },
  get enabled(){ return enabled; },
  click(){ tone(880,.05,'sine',.06); },
  horn(){ tone(415,.42,'square',.11); tone(523,.42,'square',.09); },
  radio(){ burst(.22,1800,.08); tone(1250,.07,'square',.05,.24); tone(1250,.07,'square',.05,.36); },
  success(){ [523,659,784,1047].forEach((f,i)=>tone(f,.22,'triangle',.13,i*.09)); },
  arrest(){ tone(660,.12,'triangle',.12); tone(880,.18,'triangle',.12,.1); },
  fail(){ tone(392,.25,'sawtooth',.07); tone(294,.35,'sawtooth',.07,.18); },
  cash(){ tone(1319,.08,'square',.05); tone(1760,.14,'square',.05,.07); },
  // se llama cada fotograma con el estado del jugador
  tick(st){ if(!ac) return;
    ramp(siren.g.gain,st.siren?.07:0,.3);
    ramp(engine.g.gain,st.car?.035+.05*st.speed:0,.3); engine.o.frequency.setTargetAtTime(48+110*st.speed,now(),.15); engine.o2.frequency.setTargetAtTime(24+55*st.speed,now(),.15); engine.f.frequency.setTargetAtTime(300+500*st.speed,now(),.2);
    ramp(amb.g.gain,st.city?.045:.012,1); ramp(sea.g.gain,st.sea?.05:0,1.5); },
};
})();
