window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.style.display = 'none', 500);
    }
});

// ===============================================
// 1. MANEJO DE TEMA (Con persistencia)
// ===============================================
const themeToggle = document.getElementById('checkbox-theme');
const body = document.body;
const THEME_KEY = 'cdmx-flood-theme-v2';

// Cargar tema guardado
const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
body.setAttribute('data-theme', savedTheme);
if (themeToggle) themeToggle.checked = (savedTheme === 'light');

if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    });
}

// ===============================================
// 2. CARRUSEL Y NAVEGACIÓN (Teclado + Click)
// ===============================================
const carouselCards = Array.from(document.querySelectorAll('.carousel-card'));
const detailContents = document.querySelectorAll('.content-detail');
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentIndex = 0;
const CARD_WIDTH = 320; // Aproximado ancho + gap

// Función para activar una tarjeta específica
function activateCard(index) {
    if (index < 0) index = carouselCards.length - 1;
    if (index >= carouselCards.length) index = 0;
    
    currentIndex = index;

    // 1. Actualizar clases visuales
    carouselCards.forEach(c => c.classList.remove('active-card'));
    carouselCards[currentIndex].classList.add('active-card');

    // 2. Scroll para asegurar visibilidad
    // Para simplificar UX, movemos el track basado en el índice
    const simpleOffset = -(currentIndex * 320); 
    if (carouselTrack) {
        carouselTrack.style.transform = `translateX(${Math.min(0, simpleOffset)}px)`;
    }

    // 3. Mostrar Contenido
    const targetId = carouselCards[currentIndex].getAttribute('data-target');
    showContent(targetId);
}

// Click en tarjetas
carouselCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        activateCard(index);
        playClickSound(600, 0.05);
    });
});

// Botones Flecha UI
if (nextBtn) nextBtn.addEventListener('click', () => { activateCard(currentIndex + 1); playClickSound(400, 0.05); });
if (prevBtn) prevBtn.addEventListener('click', () => { activateCard(currentIndex - 1); playClickSound(400, 0.05); });

// **NAVEGACIÓN CON TECLADO GLOBAL**
document.addEventListener('keydown', (e) => {
    // Ignorar si el foco está en inputs del simulador
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.key === 'ArrowRight') {
        e.preventDefault();
        activateCard(currentIndex + 1);
        playClickSound(500, 0.05);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        activateCard(currentIndex - 1);
        playClickSound(500, 0.05);
    }
});

function showContent(id) {
    detailContents.forEach(c => {
        c.classList.remove('active');
        if(c.id === id) {
            c.classList.add('active');
            // Pequeña animación de entrada
            c.style.animation = 'none';
            c.offsetHeight; /* trigger reflow */
            c.style.animation = 'fadeInContent 0.5s ease-out';
        }
    });
}

// Inicializar
activateCard(0);

// ===============================================
// 3. SIMULADOR DE RIESGO
// ===============================================
const btnCalc = document.getElementById('btn-calc');
// Actualizar displays de sliders
['lluvia', 'obstruccion', 'exposicion'].forEach(id => {
    const input = document.getElementById(`${id}-input`);
    const display = document.getElementById(`${id}-val`);
    if(input && display) input.addEventListener('input', () => display.innerText = input.value);
});

if (btnCalc) {
    btnCalc.addEventListener('click', () => {
        playClickSound(800, 0.1);
        
        const alcaldiaVal = document.getElementById('alcaldia-select').value;
        const C = parseInt(document.getElementById('lluvia-input').value);
        const P = parseInt(document.getElementById('obstruccion-input').value);
        const E = parseInt(document.getElementById('exposicion-input').value);

        if (!alcaldiaVal) { alert("Selecciona una alcaldía."); return; }

        let M = 0;
        switch(alcaldiaVal) {
            case '1': M = 1.4; break;
            case '2': M = 1.3; break;
            case '3': M = 1.1; break;
            case '4': M = 1.1; break;
            case '5': M = 1.0; break;
            case '6': M = 0.8; break;
        }

        const R = (C + P + E) * M;
        const resultBox = document.getElementById('sim-result');
        const txt = document.getElementById('riesgo-texto');
        const advice = document.getElementById('advice-container');

        resultBox.className = 'result-box'; // Reset clases
        
        if (C <= 0 && R === 0) {
            resultBox.classList.add('risk-zero');
            txt.innerText = `Cero Riesgo (${R.toFixed(1)})`;
            advice.innerHTML = `<p>Condiciones seguras.</p><a href="https://youtu.be/wAaV8rV2bRw" target="_blank">Ver Info</a>`;
        } else if (R >= 9) {
            resultBox.classList.add('risk-high');
            txt.innerText = `ALTO RIESGO (${R.toFixed(1)})`;
            advice.innerHTML = `<p><strong>¡ALERTA!</strong> Sigue protocolos.</p><a href="http://www.proteccioncivil.gob.mx/work/models/ProteccionCivil/Resource/377/1/images/cartel_i.pdf" target="_blank">Guía PDF</a>`;
        } else if (R >= 4) {
            resultBox.classList.add('risk-medium');
            txt.innerText = `Riesgo Medio (${R.toFixed(1)})`;
            advice.innerHTML = `<p>Precaución con basura y drenaje.</p>`;
        } else {
            resultBox.classList.add('risk-low');
            txt.innerText = `Riesgo Bajo (${R.toFixed(1)})`;
            advice.innerHTML = `<p>Mantente informado.</p>`;
        }
    });
}

// ===============================================
// 4. UTILIDADES (Audio & Scroll)
// ===============================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound(freq, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
}

const scrollBtn = document.getElementById('scrollToTopBtn');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) scrollBtn.classList.add('show');
    else scrollBtn.classList.remove('show');
});
scrollBtn.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
