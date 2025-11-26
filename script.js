// ====================================
// script.js — Lógica corregida
// ====================================

// Preloader
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('fade-out');
    setTimeout(() => preloader.style.display = 'none', 500);
  }
});

// --------------------
// Theme switch
// --------------------
const themeToggle = document.getElementById('checkbox-theme');
const body = document.body;
const THEME_KEY = 'flood-risk-theme';
const DARK = 'dark', LIGHT = 'light';
const videoOverlay = document.querySelector('.video-overlay');
function initializeTheme(){
  const saved = localStorage.getItem(THEME_KEY) || DARK;
  body.setAttribute('data-theme', saved);
  if (themeToggle) themeToggle.checked = (saved === LIGHT);
  if (videoOverlay) videoOverlay.style.backgroundColor = (saved === LIGHT) ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)';
}
function toggleTheme(){
  const current = body.getAttribute('data-theme') || DARK;
  const next = current === DARK ? LIGHT : DARK;
  localStorage.setItem(THEME_KEY, next);
  initializeTheme();
}
if (themeToggle) themeToggle.addEventListener('change', toggleTheme);
document.addEventListener('DOMContentLoaded', initializeTheme);

// --------------------
// Utility: play small sound (keeps original feel but safe)
function createSound(f=1500,d=0.02,v=0.08,type='sine'){ try{
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return;
  const ctx = new AC();
  if(ctx.state === 'suspended'){ ctx.resume().catch(()=>{}); }
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, ctx.currentTime);
  g.gain.setValueAtTime(v, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
  o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime); o.stop(ctx.currentTime + d);
}catch(e){/* silence */} }
const playConfirmAction = ()=> createSound(1200,0.06,0.18,'sine');

// --------------------
// Element references
// --------------------
const lluviaInput = document.getElementById('lluvia-input');
const obstruccionInput = document.getElementById('obstruccion-input');
const exposicionInput = document.getElementById('exposicion-input');
const alcaldiaSelect = document.getElementById('alcaldia-select');

const lluviaVal = document.getElementById('lluvia-val');
const obstruccionVal = document.getElementById('obstruccion-val');
const exposicionVal = document.getElementById('exposicion-val');
const alcaldiaVal = document.getElementById('alcaldia-val');

const btnCalc = document.getElementById('btn-calc');
const riesgoTextoEl = document.getElementById('riesgo-texto');
const simResultAlcaldia = document.getElementById('sim-result-alcaldia');

// sync display values on input
function safeSetText(el, text){
  if(el) el.textContent = String(text);
}
document.addEventListener('DOMContentLoaded', () => {
  // ensure default values display
  safeSetText(lluviaVal, lluviaInput ? lluviaInput.value : '0');
  safeSetText(obstruccionVal, obstruccionInput ? obstruccionInput.value : '0');
  safeSetText(exposicionVal, exposicionInput ? exposicionInput.value : '0');
  safeSetText(alcaldiaVal, alcaldiaSelect ? alcaldiaSelect.value : '');
  // bind range oninput
  if(lluviaInput) lluviaInput.oninput = ()=> safeSetText(lluviaVal, lluviaInput.value);
  if(obstruccionInput) obstruccionInput.oninput = ()=> safeSetText(obstruccionVal, obstruccionInput.value);
  if(exposicionInput) exposicionInput.oninput = ()=> safeSetText(exposicionVal, exposicionInput.value);
  if(alcaldiaSelect) alcaldiaSelect.onchange = ()=> safeSetText(alcaldiaVal, alcaldiaSelect.value);
  // animate alcaldias bars (if visible)
  animateAlcaldiasBars();
});

// --------------------
// Lógica EXACTA del simulador (adaptación de tu script Python)
// --------------------
function getMultiplicadorFromSelect(selectEl){
  if(!selectEl) return 1.0;
  // usamos el atributo data-m si existe (más explícito)
  const opt = selectEl.selectedOptions[0];
  if(opt && opt.dataset && opt.dataset.m) return parseFloat(opt.dataset.m);
  // fallback por nombre
  const val = (selectEl.value || '').toLowerCase();
  if(val.includes('tlalpan')) return 1.4;
  if(val.includes('iztapalapa')) return 1.3;
  if(val.includes('gam') || val.includes('gustavo')) return 1.1;
  if(val.includes('xochimilco')) return 1.1;
  if(val.includes('tlahuac') || val.includes('tla')) return 1.0;
  return 0.8;
}

function calcularRiesgo(){
  playConfirmAction();
  // Obtener valores (asegurando que sean numéricos)
  const C = Number(lluviaInput ? lluviaInput.value : 0);
  const P = Number(obstruccionInput ? obstruccionInput.value : 0);
  const E = Number(exposicionInput ? exposicionInput.value : 0);
  const alcaldiaName = (alcaldiaSelect ? alcaldiaSelect.value : 'Otra');
  const M = getMultiplicadorFromSelect(alcaldiaSelect);

  // Si C <= 0 → Cero riesgo
  if(C <= 0){
    // mostrar solo alcaldía y "Cero riesgo"
    safeSetText(simResultAlcaldia, `Alcaldía: ${alcaldiaName}`);
    safeSetText(riesgoTextoEl, `Cero riesgo`);
    riesgoTextoEl.className = 'risk-level zero';
    return;
  }

  // Calculo R = (C + P + E) * M  (según tu instrucción)
  const R = (C + P + E) * M;

  // Clasificación según tu rango exacto
  let nivel = '';
  if(R >= 8) nivel = 'Riesgo: Alto';
  else if(R >= 4 && R <= 7) nivel = 'Riesgo: Medio';
  else nivel = 'Riesgo: Bajo';

  // Mostrar SOLO alcaldía y nivel
  safeSetText(simResultAlcaldia, `Alcaldía: ${alcaldiaName}`);
  safeSetText(riesgoTextoEl, nivel);

  // Aplicar clase visual (para color)
  riesgoTextoEl.className = 'risk-level ' + (
    nivel.includes('Alto') ? 'high' :
    nivel.includes('Medio') ? 'medium' :
    nivel.includes('Bajo') ? 'low' : 'zero'
  );
}

// bind button
if(btnCalc) btnCalc.addEventListener('click', calcularRiesgo);

// --------------------
// Animación de alcaldías (usa data-percentage)
function animateAlcaldiasBars(){
  const list = document.querySelectorAll('.alcaldias-list li');
  list.forEach((li, idx) => {
    const pct = li.getAttribute('data-percentage') || '0';
    // set css var for ::before
    li.style.setProperty('--percentage', pct + '%');
    // animated counter
    const counter = li.querySelector('.percentage-counter');
    if(counter){
      let start = 0;
      const target = parseFloat(pct);
      const duration = 900;
      const startTime = performance.now();
      function tick(now){
        const t = Math.min((now - startTime)/duration, 1);
        counter.textContent = Math.floor(t*target) + '%';
        if(t < 1) requestAnimationFrame(tick);
        else counter.textContent = target + '%';
      }
      setTimeout(()=> requestAnimationFrame(tick), idx * 100);
    }
  });
}
