// Patrulla España · iconos e ilustraciones SVG (sin logotipos reales)
window.PE_ICONS = (() => {
const s = (body, vb='0 0 48 48') => `<svg class="i" viewBox="${vb}" aria-hidden="true">${body}</svg>`;
const EMBLEM = `<path d="M24 3l17 6v13c0 11-7.5 19-17 23C14.5 41 7 33 7 22V9z" fill="#c99a1c" stroke="#ffe08a" stroke-width="2"/>
  <path d="M24 8l13 4.6v9.6c0 8.4-5.6 14.6-13 17.8-7.4-3.2-13-9.4-13-17.8v-9.6z" fill="#14234d"/>
  <path d="M24 13l2.9 6.4 7 .7-5.3 4.6 1.6 6.8L24 28l-6.2 3.5 1.6-6.8-5.3-4.6 7-.7z" fill="#ffc94a"/>`;
const I = {
  emblem: s(EMBLEM),
  money: s(`<rect x="4" y="13" width="36" height="22" rx="3" fill="#1f8f3f" transform="rotate(-8 22 24)"/><rect x="8" y="15" width="36" height="22" rx="3" fill="#3fcf68" stroke="#b6f5c6" stroke-width="1.5"/><circle cx="26" cy="26" r="6" fill="#1f8f3f"/><text x="26" y="30" font-size="10" font-weight="800" text-anchor="middle" fill="#d6ffe0" font-family="Arial">€</text>`),
  shield: s(`<path d="M24 4l16 6v12c0 11-7 18-16 22C15 40 8 33 8 22V10z" fill="#ffc94a" stroke="#fff2c0" stroke-width="2"/><path d="M17 24l5 5 10-11" stroke="#7a4f00" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  bolt: s(`<path d="M27 3L9 27h12l-3 18 21-26H27z" fill="#3d8bff" stroke="#bcd8ff" stroke-width="2" stroke-linejoin="round"/>`),
  mail: s(`<rect x="5" y="11" width="38" height="27" rx="4" fill="#eef3ff"/><path d="M6 13l18 13 18-13" stroke="#1a2a50" stroke-width="3" fill="none"/>`),
  trophy: s(`<path d="M14 6h20v10a10 10 0 01-20 0z" fill="#ffc94a"/><path d="M14 10H7a7 7 0 007 9M34 10h7a7 7 0 01-7 9" stroke="#ffc94a" stroke-width="3.5" fill="none"/><rect x="21" y="25" width="6" height="8" fill="#e0a91c"/><rect x="13" y="33" width="22" height="7" rx="2" fill="#ffc94a"/>`),
  gear: s(`<circle cx="24" cy="24" r="13" fill="none" stroke="#eef3ff" stroke-width="7" stroke-dasharray="6 4.2"/><circle cx="24" cy="24" r="10" fill="none" stroke="#eef3ff" stroke-width="4"/><circle cx="24" cy="24" r="4" fill="#eef3ff"/>`),
  pause: s(`<rect x="11" y="8" width="9" height="32" rx="2" fill="#eef3ff"/><rect x="28" y="8" width="9" height="32" rx="2" fill="#eef3ff"/>`),
  info: s(`<circle cx="24" cy="24" r="19" fill="#eef3ff"/><rect x="21.5" y="20" width="5" height="16" rx="2" fill="#14234d"/><circle cx="24" cy="13.5" r="3.2" fill="#14234d"/>`),
  car: s(`<path d="M5 30l4-11c1-3 3-4 6-4h18c3 0 5 1 6 4l4 11v8h-6v-4H11v4H5z" fill="#eef3ff"/><path d="M12 19c.6-1.6 1.6-2 3-2h18c1.4 0 2.4.4 3 2l2 6H10z" fill="#14234d"/><circle cx="13" cy="30" r="3" fill="#14234d"/><circle cx="35" cy="30" r="3" fill="#14234d"/>`),
  people: s(`<circle cx="17" cy="15" r="7" fill="#eef3ff"/><path d="M4 40c0-9 6-14 13-14s13 5 13 14z" fill="#eef3ff"/><circle cx="33" cy="17" r="6" fill="#9fb0d4"/><path d="M28 27c2-1 3.5-1.3 5-1.3 6 0 11 4.6 11 12.3H32" fill="#9fb0d4"/>`),
  building: s(`<rect x="8" y="10" width="20" height="32" fill="#eef3ff"/><rect x="28" y="20" width="12" height="22" fill="#9fb0d4"/>${[14,20,26,32].map(y=>`<rect x="12" y="${y}" width="4" height="3" fill="#14234d"/><rect x="20" y="${y}" width="4" height="3" fill="#14234d"/>`).join('')}<rect x="31" y="25" width="6" height="3" fill="#14234d"/><rect x="31" y="31" width="6" height="3" fill="#14234d"/><rect x="15" y="36" width="6" height="6" fill="#14234d"/>`),
  chart: s(`<rect x="7" y="27" width="7" height="14" fill="#eef3ff"/><rect x="17" y="19" width="7" height="22" fill="#eef3ff"/><rect x="27" y="23" width="7" height="18" fill="#eef3ff"/><rect x="37" y="11" width="7" height="30" fill="#eef3ff"/><path d="M6 42h40" stroke="#9fb0d4" stroke-width="2"/>`),
  cup: s(`<path d="M14 6h20v10a10 10 0 01-20 0z" fill="#eef3ff"/><path d="M14 10H7a7 7 0 007 9M34 10h7a7 7 0 01-7 9" stroke="#eef3ff" stroke-width="3.5" fill="none"/><rect x="21" y="25" width="6" height="8" fill="#eef3ff"/><rect x="13" y="33" width="22" height="7" rx="2" fill="#eef3ff"/>`),
  star: s(`<path d="M24 4l16 6v12c0 11-7 18-16 22C15 40 8 33 8 22V10z" fill="none" stroke="#eef3ff" stroke-width="3.5"/><path d="M24 13l2.9 6.4 7 .7-5.3 4.6 1.6 6.8L24 28l-6.2 3.5 1.6-6.8-5.3-4.6 7-.7z" fill="#eef3ff"/>`),
  run: s(`<circle cx="29" cy="8" r="5" fill="#eef3ff"/><path d="M18 18l9-3 5 8 7 2M27 15l-4 13 8 6-2 10M23 28l-6 7-8-1M18 18l-6 6" stroke="#eef3ff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  gavel: s(`<rect x="15" y="6" width="22" height="10" rx="2" fill="#eef3ff" transform="rotate(35 26 11)"/><path d="M23 19L9 38" stroke="#eef3ff" stroke-width="5" stroke-linecap="round"/><rect x="26" y="38" width="18" height="5" rx="2" fill="#9fb0d4"/><circle cx="37" cy="30" r="3" fill="#3d8bff"/>`),
  cuffs: s(`<circle cx="14" cy="28" r="9" fill="none" stroke="#eef3ff" stroke-width="4"/><circle cx="34" cy="28" r="9" fill="none" stroke="#eef3ff" stroke-width="4"/><path d="M21 16c2-3 4-3 6 0" stroke="#eef3ff" stroke-width="3.5" fill="none"/><rect x="11" y="15" width="6" height="6" rx="1" fill="#eef3ff"/><rect x="31" y="15" width="6" height="6" rx="1" fill="#eef3ff"/>`),
  heli: s(`<path d="M6 13h36" stroke="#eef3ff" stroke-width="3" stroke-linecap="round"/><rect x="22" y="13" width="4" height="5" fill="#eef3ff"/><path d="M10 26c0-5 5-8 12-8h6c5 0 8 3 8 8s-3 7-8 7H17c-4 0-7-3-7-7z" fill="#eef3ff"/><path d="M36 25h8l2-4" stroke="#eef3ff" stroke-width="3" fill="none"/><path d="M14 37h18M17 33v4M29 33v4" stroke="#eef3ff" stroke-width="2.5"/><path d="M12 25c1-3 4-4 7-4v5h-7z" fill="#14234d"/>`),
  chat: s(`<path d="M6 10h36v22H20l-9 8v-8H6z" fill="#eef3ff"/><circle cx="16" cy="21" r="2.5" fill="#14234d"/><circle cx="24" cy="21" r="2.5" fill="#14234d"/><circle cx="32" cy="21" r="2.5" fill="#14234d"/>`),
  bars: s(`<rect x="6" y="8" width="36" height="4" fill="#eef3ff"/><rect x="6" y="36" width="36" height="4" fill="#eef3ff"/>${[9,17,25,33].map(x=>`<rect x="${x}" y="8" width="4" height="32" fill="#eef3ff"/>`).join('')}`),
  map: s(`<path d="M5 10l12-4 14 4 12-4v32l-12 4-14-4-12 4z" fill="#eef3ff"/><path d="M17 6v32M31 10v32" stroke="#14234d" stroke-width="2"/><circle cx="24" cy="20" r="5" fill="#ff3b4e"/><path d="M24 30l-4-7h8z" fill="#ff3b4e"/>`),
  cart: s(`<path d="M4 8h6l5 22h22l5-16H13" stroke="#eef3ff" stroke-width="3.5" fill="none" stroke-linejoin="round"/><circle cx="18" cy="37" r="3.5" fill="#eef3ff"/><circle cx="33" cy="37" r="3.5" fill="#eef3ff"/><path d="M15 18h25M17 24h21" stroke="#eef3ff" stroke-width="2"/>`),
  radio: s(`<rect x="12" y="14" width="22" height="30" rx="3" fill="#eef3ff"/><path d="M28 14V4" stroke="#eef3ff" stroke-width="3" stroke-linecap="round"/><rect x="16" y="18" width="14" height="8" rx="1" fill="#14234d"/><circle cx="19" cy="34" r="2" fill="#14234d"/><circle cx="27" cy="34" r="2" fill="#14234d"/><path d="M38 18c3 3 3 9 0 12M42 14c5 5 5 15 0 20" stroke="#3d8bff" stroke-width="2.5" fill="none"/>`),
  siren: s(`<path d="M14 36v-12a10 10 0 0120 0v12z" fill="#ff3b4e"/><rect x="10" y="36" width="28" height="6" rx="2" fill="#eef3ff"/><path d="M24 4v6M8 12l4 4M40 12l-4 4M3 26h5M40 26h5" stroke="#ffc94a" stroke-width="3" stroke-linecap="round"/><path d="M19 24a5 5 0 015-5" stroke="#fff" stroke-width="2.5" fill="none"/>`),
  cam: s(`<path d="M24 6l18 9v18l-18 9-18-9V15z" fill="none" stroke="#eef3ff" stroke-width="3" stroke-linejoin="round"/><path d="M6 15l18 9 18-9M24 24v18" stroke="#eef3ff" stroke-width="3" stroke-linejoin="round"/>`),
  ask: s(`<circle cx="18" cy="16" r="7" fill="#eef3ff"/><path d="M6 40c0-9 5-14 12-14s12 5 12 14z" fill="#eef3ff"/><path d="M32 8h12v10h-6l-4 4v-4h-2z" fill="#3d8bff"/>`),
  docs: s(`<rect x="12" y="6" width="22" height="30" rx="2" fill="#9fb0d4"/><rect x="16" y="11" width="22" height="30" rx="2" fill="#eef3ff"/><path d="M20 19h14M20 25h14M20 31h9" stroke="#14234d" stroke-width="2.5"/>`),
  press: s(`<circle cx="24" cy="24" r="17" fill="none" stroke="#eef3ff" stroke-width="3.5"/><path d="M24 13v14" stroke="#ff8b97" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="33" r="2.6" fill="#ff8b97"/>`),
  deal: s(`<path d="M4 22l8-8 8 4 6-3 8 3 10 8-6 6-8-6-6 2-8 8-6-6z" fill="#eef3ff"/><path d="M20 28l4 4M24 24l5 5M28 21l5 5" stroke="#14234d" stroke-width="2"/>`),
  stop: s(`<path d="M24 6c6 3 12 5 16 5v11c0 9-7 15-16 20-9-5-16-11-16-20V11c4 0 10-2 16-5z" fill="#eef3ff"/><path d="M17 24l5 5 9-10" stroke="#14234d" stroke-width="3.5" fill="none" stroke-linecap="round"/>`),
  coin: s(`<circle cx="24" cy="24" r="18" fill="#ffc94a" stroke="#fff2c0" stroke-width="2"/><circle cx="24" cy="24" r="12" fill="none" stroke="#c99a1c" stroke-width="2.5"/>`),
};
const AVATAR = s(`<defs><linearGradient id="avbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d86c8"/><stop offset="1" stop-color="#1c3570"/></linearGradient></defs>
  <rect width="100" height="100" fill="url(#avbg)"/>
  <path d="M8 100c2-20 18-28 42-28s40 8 42 28z" fill="#14203f"/><path d="M38 74l12 14 12-14" fill="#e8eef8"/><path d="M47 80h6l-1 20h-4z" fill="#14203f"/>
  <rect x="16" y="84" width="16" height="5" rx="1" fill="#ffc94a"/><rect x="68" y="84" width="16" height="5" rx="1" fill="#ffc94a"/>
  <rect x="42" y="60" width="16" height="16" fill="#d9a07a"/>
  <ellipse cx="50" cy="44" rx="19" ry="23" fill="#e6b48e"/>
  <path d="M30 40c0-16 9-24 20-24s21 8 21 24c-3-7-8-11-21-11s-17 4-20 11z" fill="#2b1b12"/>
  <ellipse cx="42" cy="46" rx="2.2" ry="2.6" fill="#1a1a1a"/><ellipse cx="58" cy="46" rx="2.2" ry="2.6" fill="#1a1a1a"/>
  <path d="M38 40l8-1M54 39l8 1" stroke="#2b1b12" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M50 47v8h-3" stroke="#b9805c" stroke-width="2" fill="none"/><path d="M44 59c4 2 8 2 12 0" stroke="#8a4f3a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M32 50c1 9 6 16 18 18 12-2 17-9 18-18-2 6-6 10-18 10s-16-4-18-10z" fill="#2b1b12" opacity=".35"/>`,'0 0 100 100');
const ART = {
  garage: `<svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a6a"/><stop offset="1" stop-color="#121a2c"/></linearGradient><radialGradient id="gb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3d8bff" stop-opacity=".9"/><stop offset="1" stop-color="#3d8bff" stop-opacity="0"/></radialGradient></defs>
    <rect width="280" height="130" fill="url(#gg)"/>${[0,1,2,3,4,5].map(i=>`<rect x="${i*50}" y="0" width="30" height="8" fill="#e8efff" opacity=".7"/>`).join('')}
    <path d="M0 96h280v34H0z" fill="#1a2234"/><path d="M0 96h280" stroke="#4a5878"/>
    <g transform="translate(30 58)"><ellipse cx="60" cy="40" rx="64" ry="7" fill="#000" opacity=".4"/><path d="M6 34l8-14c3-5 7-7 13-7h56c6 0 10 2 13 7l10 14v9H6z" fill="#14234d"/><path d="M6 30h104" stroke="#3d8bff" stroke-width="3"/><path d="M26 14l6-9h50l7 9z" fill="#0b1222"/><rect x="44" y="0" width="28" height="6" rx="2" fill="#1a1a1a"/><rect x="44" y="0" width="13" height="6" fill="#3d8bff"/><rect x="59" y="0" width="13" height="6" fill="#ff3b4e"/><circle cx="58" cy="2" r="22" fill="url(#gb)"/><circle cx="26" cy="42" r="8" fill="#0b0f18"/><circle cx="92" cy="42" r="8" fill="#0b0f18"/><text x="58" y="27" font-family="Arial" font-weight="800" font-size="10" fill="#e8efff" text-anchor="middle">POLICÍA</text></g>
    <g transform="translate(160 66) scale(.8)"><path d="M6 34l8-14c3-5 7-7 13-7h56c6 0 10 2 13 7l10 14v9H6z" fill="#14234d"/><path d="M6 30h104" stroke="#3d8bff" stroke-width="3"/><path d="M26 14l6-9h50l7 9z" fill="#0b1222"/><rect x="44" y="0" width="28" height="6" rx="2" fill="#3d8bff"/><circle cx="26" cy="42" r="8" fill="#0b0f18"/><circle cx="92" cy="42" r="8" fill="#0b0f18"/></g></svg>`,
  interro: `<svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="ig" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#55607a"/><stop offset="1" stop-color="#151b28"/></radialGradient></defs>
    <rect width="280" height="130" fill="url(#ig)"/><rect x="0" y="0" width="280" height="130" fill="none"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M${i*44} 0v90" stroke="#2a3346"/>`).join('')}
    <path d="M128 0v18" stroke="#888"/><path d="M116 18h24l-4 6h-16z" fill="#ddd"/><path d="M110 24h36l40 70H70z" fill="#fff6d0" opacity=".08"/>
    <rect x="60" y="78" width="160" height="10" fill="#70757f"/><rect x="66" y="88" width="6" height="40" fill="#4b5060"/><rect x="208" y="88" width="6" height="40" fill="#4b5060"/>
    <g><circle cx="88" cy="50" r="12" fill="#c98e66"/><path d="M76 46c0-10 6-14 12-14s12 4 12 12c-4-4-8-4-12-4s-8 2-12 6z" fill="#2b1b12"/><path d="M66 80c0-14 10-22 22-22s22 8 22 22z" fill="#9aa2b2"/><path d="M80 62l4 10M96 62l-4 10" stroke="#7a8292"/><ellipse cx="88" cy="70" rx="14" ry="6" fill="#c98e66" opacity=".0"/><path d="M98 66l8 12" stroke="#c98e66" stroke-width="6" stroke-linecap="round"/></g>
    <g><circle cx="196" cy="46" r="12" fill="#e6b48e"/><path d="M184 42c0-10 6-13 12-13s12 3 12 11c-3-3-7-4-12-4s-9 2-12 6z" fill="#3b2416"/><path d="M172 80c0-16 10-24 24-24s24 8 24 24z" fill="#14234d"/><rect x="184" y="62" width="24" height="5" fill="#e8efff" opacity=".85"/><text x="196" y="66.5" font-family="Arial" font-weight="800" font-size="5" fill="#14234d" text-anchor="middle">POLICÍA</text></g></svg>`,
  cell: `<svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a505c"/><stop offset="1" stop-color="#1b1f28"/></linearGradient></defs>
    <rect width="280" height="130" fill="url(#cg)"/>${[0,1,2,3,4,5,6,7,8].map(i=>`<path d="M0 ${i*16}h280" stroke="#3a404c" stroke-width="1"/>`).join('')}
    <rect x="96" y="80" width="80" height="12" fill="#5a606c"/>
    <g><circle cx="136" cy="56" r="11" fill="#a46a45"/><path d="M125 52c0-8 5-12 11-12s11 4 11 11c-3-3-7-4-11-4s-8 1-11 5z" fill="#1d1410"/><path d="M116 92c0-16 9-24 20-24s20 8 20 24z" fill="#e8742a"/><path d="M122 92l-4 24h12l4-24M150 92l4 24h-12l-4-24" fill="#d8661f"/></g>
    ${[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=>`<rect x="${14+i*20}" y="0" width="6" height="130" fill="#2a2e36"/><rect x="${15+i*20}" y="0" width="2" height="130" fill="#6a707c"/>`).join('')}
    <rect x="0" y="16" width="280" height="6" fill="#2a2e36"/><rect x="0" y="108" width="280" height="6" fill="#2a2e36"/></svg>`,
  silhouette: `<svg class="sil" viewBox="0 0 150 140" aria-hidden="true"><path d="M40 140c0-30 10-50 35-55l-6-10c-8-2-12-10-12-20 0-16 10-26 24-26s22 10 22 24c0 10-4 18-12 22l-4 10c25 5 35 25 35 55z" fill="#050b1c"/><path d="M52 50c4-20 40-24 46-2-8-6-38-6-46 2z" fill="#0d1a3a"/><rect x="58" y="44" width="34" height="8" rx="3" fill="#2a4fa8" opacity=".8"/><path d="M60 98h60l20-8v8l-18 10H60z" fill="#111a2c"/></svg>`,
};
function fill(){
  document.querySelectorAll('[data-ico]').forEach(el=>{ el.innerHTML = I[el.dataset.ico] || ''; });
  document.querySelectorAll('[data-art]').forEach(el=>{ el.insertAdjacentHTML('afterbegin', el.dataset.art==='silhouette'?ART.silhouette:ART[el.dataset.art]); });
  const av=document.getElementById('ava'); if(av) av.innerHTML=AVATAR;
}
return {I, ART, AVATAR, fill};
})();
