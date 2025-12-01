// ===============================================
// 0. PRELOADER
// ===============================================
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
const THEME_KEY = 'cdmx-flood-theme-v4';

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
// 2. CARRUSEL Y NAVEGACIÓN (Teclado + Click + Scroll)
// ===============================================
const carouselCards = Array.from(document.querySelectorAll('.carousel-card'));
const detailContents = document.querySelectorAll('.content-detail');
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentIndex = 0;
const CARD_WIDTH = 320; // Ancho aproximado + gap para scroll

// Función principal para activar una tarjeta y mostrar su contenido
function activateCard(index) {
    if (index < 0) index = carouselCards.length - 1;
    if (index >= carouselCards.length) index = 0;
    
    currentIndex = index;

    // 1. Actualizar clases visuales en las tarjetas
    carouselCards.forEach(c => c.classList.remove('active-card'));
    carouselCards[currentIndex].classList.add('active-card');

    // 2. Scroll del carrusel para mantener la tarjeta visible
    // Calculamos el desplazamiento para centrar o mover la tarjeta
    const simpleOffset = -(currentIndex * 320); 
    if (carouselTrack) {
        carouselTrack.style.transform = `translateX(${Math.min(0, simpleOffset)}px)`;
    }

    // 3. Mostrar el contenido correspondiente
    const targetId = carouselCards[currentIndex].getAttribute('data-target');
    showContent(targetId);
}

// Evento Click en tarjetas
carouselCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        activateCard(index);
        playClickSound(600, 0.05);
    });
});

// Botones de Flecha en la UI
if (nextBtn) nextBtn.addEventListener('click', () => { activateCard(currentIndex + 1); playClickSound(400, 0.05); });
if (prevBtn) prevBtn.addEventListener('click', () => { activateCard(currentIndex - 1); playClickSound(400, 0.05); });

// **NAVEGACIÓN CON TECLADO GLOBAL (Flechas Izquierda/Derecha)**
document.addEventListener('keydown', (e) => {
    // Evitar conflictos si el usuario está escribiendo en un input
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

// Función auxiliar para mostrar la sección de contenido
function showContent(id) {
    detailContents.forEach(c => {
        c.classList.remove('active');
        if(c.id === id) {
            c.classList.add('active');
            // Reiniciar animación css
            c.style.animation = 'none';
            c.offsetHeight; /* trigger reflow */
            c.style.animation = 'fadeInContent 0.5s ease-out';
            
            // Si es la sección de impacto, animar las barras
            if (id === 'content-impacto') animateAlcaldiasBars();
        }
    });
}

// Inicializar la primera tarjeta
activateCard(0);

// ===============================================
// 3. SIMULADOR DE RIESGO (Lógica Exacta)
// ===============================================
const btnCalc = document.getElementById('btn-calc');

// Actualizar números visuales de los sliders
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
        let nombreAlcaldia = "";
        
        // Mapeo de Multiplicadores
        switch(alcaldiaVal) {
            case '1': M = 1.4; nombreAlcaldia = "Tlalpan"; break;
            case '2': M = 1.3; nombreAlcaldia = "Iztapalapa"; break;
            case '3': M = 1.1; nombreAlcaldia = "GAM"; break;
            case '4': M = 1.1; nombreAlcaldia = "Xochimilco"; break;
            case '5': M = 1.0; nombreAlcaldia = "Tláhuac"; break;
            case '6': M = 0.8; nombreAlcaldia = "Otra"; break;
        }

        // Fórmula
        const R = (C + P + E) * M;
        
        // Elementos del DOM para resultado
        const resultBox = document.getElementById('sim-result');
        const txt = document.getElementById('riesgo-texto');
        const advice = document.getElementById('advice-container');

        resultBox.className = 'result-box'; // Reset clases
        
        // Lógica de Condicionales (Exacta a Python)
        if (M === 0) {
            // Error case, although select limits this
            txt.innerText = "Valor no válido";
        } else if (C <= 0) {
            // Cero riesgo por falta de lluvia (independiente de P y E)
            resultBox.classList.add('risk-zero');
            txt.innerText = `Cero riesgo (No hay lluvia)`;
            advice.innerHTML = `
                <div class="result-recommendation">Te recomendamos visitar esta url:</div>
                <div class="result-link"><a href="https://youtu.be/wAaV8rV2bRw" target="_blank">Ver Video Educativo</a></div>`;
        } else if (R > 8) {
            // Riesgo Alto (> 8)
            resultBox.classList.add('risk-high');
            txt.innerText = `Riesgo: Alto`;
            advice.innerHTML = `
                <div class="result-recommendation">Te recomendamos visitar estas recomendaciones de protección civil:</div>
                <div class="result-link"><a href="http://www.proteccioncivil.gob.mx/work/models/ProteccionCivil/Resource/377/1/images/cartel_i.pdf" target="_blank">Guía Protección Civil</a></div>`;
        } else if (R >= 4) {
            // Riesgo Medio (>= 4 y <= 8)
            resultBox.classList.add('risk-medium');
            txt.innerText = `Riesgo: Medio`;
            advice.innerHTML = `
                <div class="result-recommendation">Te recomendamos visitar esta url:</div>
                <div class="result-link"><a href="https://youtu.be/wAaV8rV2bRw" target="_blank">Ver Recomendaciones</a></div>`;
        } else {
            // Riesgo Bajo (Else)
            resultBox.classList.add('risk-low');
            txt.innerText = `Riesgo: Bajo`;
            advice.innerHTML = `
                <div class="result-recommendation">Te recomendamos visitar esta url:</div>
                <div class="result-link"><a href="https://youtu.be/wAaV8rV2bRw" target="_blank">Ver Recomendaciones</a></div>`;
        }
    });
}

// ===============================================
// 4. UTILIDADES (Audio, Barras, Scroll)
// ===============================================

// Animación de Barras de Progreso (Alcaldías)
function animateAlcaldiasBars() {
    const bars = document.querySelectorAll('.alcaldias-list li');
    bars.forEach(bar => {
        bar.style.setProperty('--percentage', '0%');
        const target = bar.getAttribute('data-percentage');
        void bar.offsetWidth; // Force Reflow
        setTimeout(() => {
            bar.style.setProperty('--percentage', `${target}%`);
            const counter = bar.querySelector('.percentage-counter');
            if(counter) counter.textContent = `${target}%`;
        }, 100);
    });
}

// Sistema de Sonido (Beep simple)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound(freq, dur) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    } catch(e) { console.log("Audio no disponible"); }
}

// Botón Scroll to Top
const scrollBtn = document.getElementById('scrollToTopBtn');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) scrollBtn.classList.add('show');
    else scrollBtn.classList.remove('show');
});
scrollBtn.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
