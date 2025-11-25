// ===============================================
// 1. FUNCIONALIDAD DE AUDIO (CLICK)
// ===============================================
function playClickSound() {
    // Tono sutil para navegación
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        if (context.state === 'suspended') {
            context.resume();
        }
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'sine'; // Tono suave
        oscillator.frequency.setValueAtTime(440, context.currentTime); 
        gainNode.gain.setValueAtTime(0.1, context.currentTime); // Volumen bajo

        oscillator.start();
        oscillator.stop(context.currentTime + 0.05); 
    } catch (e) {
        console.log("Web Audio API no soportada o bloqueada.");
    }
}

function playActionSound() {
    // Tono más distintivo e intensivo para acciones clave (e.g., calcular)
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        if (context.state === 'suspended') context.resume();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'square'; // Tono más duro
        oscillator.frequency.setValueAtTime(600, context.currentTime); 
        gainNode.gain.setValueAtTime(0.15, context.currentTime); // Volumen un poco más alto

        oscillator.start();
        oscillator.stop(context.currentTime + 0.10); // Más largo
    } catch (e) {
        console.log("Web Audio API no soportada o bloqueada.");
    }
}


// ===============================================
// 2. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE (HEADER Y SCROLL)
// ===============================================
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.addEventListener('scroll', () => {
    // Muestra el botón de scroll al bajar
    if (window.scrollY > 300) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    playClickSound(); // Sonido de navegación
});


// ===============================================
// 3. LÓGICA DEL PANEL INTERACTIVO (CARRUSEL)
// ===============================================
const carouselCards = document.querySelectorAll('.carousel-card');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

function showContent(targetId) {
    const nextContent = document.getElementById(targetId);
    
    if (!nextContent || nextContent === currentActiveContent) return;

    playClickSound(); // Sonido de navegación

    if (currentActiveContent) {
        currentActiveContent.classList.remove('active');
        setTimeout(() => {
            currentActiveContent.style.display = 'none';
            
            nextContent.style.display = 'block';
            void nextContent.offsetWidth; 
            nextContent.classList.add('active');
            currentActiveContent = nextContent;
            
            if (targetId === 'content-impacto') {
                animateAlcaldiasBars();
            }
        }, 300); 
    } else {
        detailContents.forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
        
        nextContent.style.display = 'block';
        void nextContent.offsetWidth;
        nextContent.classList.add('active');
        currentActiveContent = nextContent;

        if (targetId === 'content-impacto') {
            animateAlcaldiasBars();
        }
    }
}

// Inicializar al cargar: activa el primer elemento por defecto
document.addEventListener('DOMContentLoaded', () => {
    const initialTargetId = detailContents[0]?.id; 
    if (initialTargetId) {
        showContent(initialTargetId);
    }
});

// Eventos para las tarjetas del carrusel (click)
carouselCards.forEach(card => {
    card.addEventListener('click', () => { 
        // Ocultar la tarjeta de carga de la simulación si se navega a otro lado
        if (card.getAttribute('data-target') !== 'content-algoritmo') {
            document.getElementById('riesgo-texto').textContent = "Esperando datos...";
            document.getElementById('riesgo-texto').className = `risk-level pending`; 
        }

        showContent(card.getAttribute('data-target')); 
    });
});


// ------------------------------------
// Lógica de navegación del Carrusel
// ------------------------------------
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentCardIndex = 0;
// Ancho de la tarjeta + gap (330px + 20px = 350px)
const cardWidth = 350; 

function moveToCard(index) {
    if (carouselTrack) {
        const offset = -index * cardWidth;
        carouselTrack.style.transform = `translateX(${offset}px)`;
    }
}

if (nextBtn && carouselTrack) {
    nextBtn.addEventListener('click', () => {
        playClickSound(); // Sonido de navegación
        const totalCards = carouselTrack.children.length;
        const maxIndex = totalCards - Math.floor(carouselTrack.offsetWidth / cardWidth);

        if (currentCardIndex < maxIndex) {
            currentCardIndex++;
            moveToCard(currentCardIndex);
        } else if (currentCardIndex >= maxIndex) {
            currentCardIndex = 0; 
            moveToCard(currentCardIndex);
        }
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        playClickSound(); // Sonido de navegación
        if (currentCardIndex > 0) {
            currentCardIndex--;
            moveToCard(currentCardIndex);
        }
    });
}


// ===============================================
// 4. FUNCIÓN DE SIMULACIÓN (calcularRiesgo) - Lógica de riesgo ajustada
// ===============================================
function calcularRiesgo() {
    playActionSound(); // <--- Sonido más intensivo para la acción
    
    // 1. Obtener valores de los inputs
    const M = parseFloat(document.getElementById('alcaldia-select').value);
    const C = parseFloat(document.getElementById('lluvia-input').value);
    const P = parseFloat(document.getElementById('obstruccion-input').value);
    const E = parseFloat(document.getElementById('exposicion-input').value);

    // 2. FÓRMULA CLAVE: R = C + P + (E × M)
    const R = C + P + (E * M);

    // 3. Clasificación de riesgo (Ajustada: C=0 es CERO RIESGO)
    let riesgoText;
    let riesgoClass;

    if (C === 0) {
        riesgoText = "Riesgo: CERO RIESGO (Sistema Estable)"; // VERDE - Solo si no hay lluvia
        riesgoClass = "zero";
    } else if (R >= 6.0) {
        riesgoText = "Riesgo: ALTO"; // ROJO
        riesgoClass = "high";
    } else if (R >= 4.0) {
        riesgoText = "Riesgo: MEDIO"; // NARANJA
        riesgoClass = "medium";
    } else { // C > 0 y R < 4.0
        riesgoText = "Riesgo: BAJO"; // AMARILLO - El riesgo existe por haber lluvia
        riesgoClass = "low";
    }

    // 4. Actualizar el display
    const riesgoTextoEl = document.getElementById('riesgo-texto');
    
    riesgoTextoEl.textContent = `${riesgoText} (Valor R: ${R.toFixed(2)})`;
    riesgoTextoEl.className = `risk-level ${riesgoClass}`; 
}


// ===============================================
// 5. FUNCIÓN PARA ANIMAR LAS BARRAS DE PROGRESO DE ALCALDÍAS
// ===============================================
function animateAlcaldiasBars() {
    const alcaldias = document.querySelectorAll('.alcaldias-list li');
    alcaldias.forEach(li => {
        const percentage = li.getAttribute('data-percentage');
        // Inyecta el valor del atributo (ej: "19%") a la variable CSS --percentage
        li.style.setProperty('--percentage', percentage);
    });
}
