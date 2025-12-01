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
// 1. MANEJO DE TEMA (CLARO / OSCURO)
// ===============================================
const themeToggle = document.getElementById('checkbox-theme');
const body = document.body;
const THEME_KEY = 'cdmx-flood-theme';

// Inicializar tema guardado
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
// 2. INTERACTIVIDAD DEL CARRUSEL Y NAVEGACIÓN
// ===============================================
const carouselCards = document.querySelectorAll('.carousel-card');
const detailContents = document.querySelectorAll('.content-detail');
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentScrollIndex = 0;
const CARD_WIDTH = 340; // Card width + gap (approx)

// Mostrar contenido al hacer clic en tarjeta
carouselCards.forEach(card => {
    card.addEventListener('click', () => {
        // 1. Activar tarjeta visualmente
        carouselCards.forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');

        // 2. Mostrar contenido correspondiente
        const targetId = card.getAttribute('data-target');
        showContent(targetId);

        // 3. Reproducir sonido sutil
        playClickSound(600, 0.05);
    });
});

function showContent(id) {
    // Ocultar todos
    detailContents.forEach(content => {
        content.classList.remove('active');
        content.style.opacity = '0';
        setTimeout(() => {
             if (!content.classList.contains('active')) content.style.display = 'none';
        }, 300);
    });

    // Mostrar target
    const targetContent = document.getElementById(id);
    if (targetContent) {
        targetContent.style.display = 'block';
        // Pequeño delay para permitir transición CSS
        setTimeout(() => {
            targetContent.classList.add('active');
            targetContent.style.opacity = '1';
            
            // Si es la sección de impacto, animar barras
            if (id === 'content-impacto') animateAlcaldiasBars();
        }, 50);
    }
}

// Botones de Carrusel
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentScrollIndex++; 
        updateCarouselScroll();
        playClickSound(400, 0.05);
    });
}
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentScrollIndex > 0) currentScrollIndex--;
        updateCarouselScroll();
        playClickSound(400, 0.05);
    });
}

function updateCarouselScroll() {
    if (carouselTrack) {
        const offset = -(currentScrollIndex * CARD_WIDTH);
        carouselTrack.style.transform = `translateX(${offset}px)`;
    }
}

// Activar la primera tarjeta por defecto
if (carouselCards.length > 0) {
    carouselCards[0].click();
}


// ===============================================
// 3. LÓGICA DEL SIMULADOR (PYTHON LOGIC PORT)
// ===============================================
const btnCalc = document.getElementById('btn-calc');

// Actualizar valores visuales de los sliders en tiempo real
['lluvia', 'obstruccion', 'exposicion'].forEach(id => {
    const input = document.getElementById(`${id}-input`);
    const display = document.getElementById(`${id}-val`);
    if (input && display) {
        input.addEventListener('input', () => display.textContent = input.value);
    }
});

if (btnCalc) {
    btnCalc.addEventListener('click', () => {
        playClickSound(800, 0.1); // Sonido de confirmación

        // 1. Obtener Entradas
        const alcaldiaSelect = document.getElementById('alcaldia-select');
        const opcion = alcaldiaSelect.value;
        
        const C = parseInt(document.getElementById('lluvia-input').value);
        const P = parseInt(document.getElementById('obstruccion-input').value);
        const E = parseInt(document.getElementById('exposicion-input').value);

        // Validar selección de alcaldía
        if (!opcion) {
            alert("Por favor, selecciona una alcaldía.");
            return;
        }

        // 2. Lógica de Multiplicador (Python logic)
        let M = 0;
        let nombreAlcaldia = "";

        if (opcion === '1') { M = 1.4; nombreAlcaldia = "Tlalpan"; }
        else if (opcion === '2') { M = 1.3; nombreAlcaldia = "Iztapalapa"; }
        else if (opcion === '3') { M = 1.1; nombreAlcaldia = "GAM"; }
        else if (opcion === '4') { M = 1.1; nombreAlcaldia = "Xochimilco"; }
        else if (opcion === '5') { M = 1.0; nombreAlcaldia = "Tláhuac"; }
        else if (opcion === '6') { M = 0.8; nombreAlcaldia = "Otra Alcaldía"; }
        else { M = 0; } // Valor no válido

        // 3. Cálculo de Riesgo
        // R = (C + P + E) * M
        const R = (C + P + E) * M;
        
        // 4. Determinar Resultado (Python logic)
        const resultBox = document.getElementById('sim-result');
        const riesgoTexto = document.getElementById('riesgo-texto');
        const adviceContainer = document.getElementById('advice-container');

        // Limpiar clases previas
        resultBox.className = 'result-box'; 

        let mensajeRiesgo = "";
        let recomendacionesHTML = "";
        let claseCSS = "";

        if (M === 0) {
            mensajeRiesgo = "Valor no válido";
        } 
        else if (C <= 0 && R === 0) {
            // Caso Cero Riesgo
            mensajeRiesgo = `Cero riesgo en ${nombreAlcaldia} (No hay lluvia)`;
            claseCSS = "risk-zero";
            recomendacionesHTML = `
                <div class="result-recommendation">Condiciones óptimas. Mantente informado.</div>
                <div class="result-link">
                    <a href="https://youtu.be/wAaV8rV2bRw" target="_blank">
                    <i class="fab fa-youtube"></i> Ver Video Educativo</a>
                </div>
            `;
        } 
        else if (R >= 9) {
            // Caso Riesgo Alto (>= 9)
            mensajeRiesgo = `Riesgo: ALTO (${R.toFixed(1)})`;
            claseCSS = "risk-high";
            recomendacionesHTML = `
                <div class="result-recommendation"><strong>¡ALERTA!</strong> Sigue protocolos de emergencia inmediatamente.</div>
                <div class="result-link">
                    <a href="http://www.proteccioncivil.gob.mx/work/models/ProteccionCivil/Resource/377/1/images/cartel_i.pdf" target="_blank">
                    <i class="fas fa-file-pdf"></i> Ver Guía Protección Civil</a>
                </div>
            `;
        } 
        else if (R >= 4) {
            // Caso Riesgo Medio (>= 4)
            mensajeRiesgo = `Riesgo: MEDIO (${R.toFixed(1)})`;
            claseCSS = "risk-medium";
            recomendacionesHTML = `
                <div class="result-recommendation">Precaución. Evita tirar basura y monitorea reportes.</div>
                <div class="result-link">
                    <a href="https://youtu.be/wAaV8rV2bRw" target="_blank">
                    <i class="fab fa-youtube"></i> Ver Recomendaciones</a>
                </div>
            `;
        } 
        else {
            // Caso Riesgo Bajo (Else)
            mensajeRiesgo = `Riesgo: BAJO (${R.toFixed(1)})`;
            claseCSS = "risk-low";
            recomendacionesHTML = `
                <div class="result-recommendation">Riesgo menor, pero mantén la vigilancia.</div>
                <div class="result-link">
                    <a href="https://youtu.be/wAaV8rV2bRw" target="_blank">
                    <i class="fab fa-youtube"></i> Ver Recomendaciones</a>
                </div>
            `;
        }

        // 5. Renderizar
        resultBox.classList.add(claseCSS);
        riesgoTexto.textContent = mensajeRiesgo;
        adviceContainer.innerHTML = recomendacionesHTML;
        
        // Scroll suave hacia el resultado en móvil
        if (window.innerWidth < 768) {
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

// ===============================================
// 4. ANIMACIONES Y UTILIDADES
// ===============================================

// Animación barras de alcaldías
function animateAlcaldiasBars() {
    const bars = document.querySelectorAll('.alcaldias-list li');
    bars.forEach(bar => {
        // Reset width
        bar.style.setProperty('--percentage', '0%');
        const target = bar.getAttribute('data-percentage');
        
        // Forzar reflow
        void bar.offsetWidth; 
        
        // Animate
        setTimeout(() => {
            bar.style.setProperty('--percentage', `${target}%`);
            // Animar contador numérico (simple)
            const counter = bar.querySelector('.percentage-counter');
            if (counter) counter.textContent = `${target}%`;
        }, 200);
    });
}

// Audio Context (Simple beep synthesizer)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClickSound(freq, duration) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Scroll to Top
const scrollBtn = document.getElementById('scrollToTopBtn');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) scrollBtn.classList.add('show');
    else scrollBtn.classList.remove('show');
});
scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
