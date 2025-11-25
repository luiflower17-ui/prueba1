// ===============================================
// 1. FUNCIONALIDAD DE AUDIO (CLICK) - MEJORA: Contexto Único y Robustez
// ===============================================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Asegura que el contexto se reactive en la primera interacción del usuario (necesario en navegadores)
document.addEventListener('DOMContentLoaded', () => {
    if (audioContext.state === 'suspended') {
        const resumeContext = () => {
            audioContext.resume().then(() => {
                document.removeEventListener('click', resumeContext);
                document.removeEventListener('touchstart', resumeContext);
            }).catch(e => console.error("Error al reanudar AudioContext:", e));
        };
        document.addEventListener('click', resumeContext, { once: true });
        document.addEventListener('touchstart', resumeContext, { once: true });
    }
});

/**
 * Genera y reproduce un sonido de clic.
 */
function createClickSound(frequency = 1000, duration = 0.02, volume = 0.1) {
    // Si el contexto está cerrado o suspendido (y no se ha podido reanudar), no intentar reproducir
    if (audioContext.state === 'closed' || audioContext.state === 'suspended') return; 

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'square'; 
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); 
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime); 

        // MEJORA: Fade out suave para un sonido más limpio
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration); 
    } catch (e) {
        console.warn("Fallo al reproducir audio:", e.message);
    }
}

const playClickSound = () => createClickSound(800, 0.05, 0.1); 
const playActionSound = () => createClickSound(1200, 0.1, 0.15); 


// ===============================================
// 2. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE (HEADER Y SCROLL)
// ===============================================
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

// MEJORA: Uso de Intersection Observer (Máximo rendimiento)
if (scrollToTopBtn) {
    const observerTarget = document.querySelector('header');
    
    // Observador que detecta cuando el 'header' ya no es visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scrollToTopBtn.style.display = "none";
            } else {
                scrollToTopBtn.style.display = "block";
            }
        });
    }, {
        threshold: 0.1 // Activar cuando el 10% del header ha desaparecido
    });

    if (observerTarget) {
        observer.observe(observerTarget);
    }

    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        playClickSound(); 
    });
}


// ===============================================
// 3. LÓGICA DEL PANEL INTERACTIVO (CARRUSEL Y ANIMACIONES)
// ===============================================
const carouselCards = document.querySelectorAll('.carousel-card');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

function animateInfoBlocks(contentElement) {
    const infoBlocks = contentElement.querySelectorAll('.info-block');
    infoBlocks.forEach((block, index) => {
        block.style.animation = `none`; 
        block.offsetHeight; 
        block.style.animation = `fadeInUp 0.6s ease-out forwards`;
        block.style.animationDelay = `${0.2 + index * 0.1}s`; 
    });
}

function showContent(targetId) {
    const nextContent = document.getElementById(targetId);
    
    if (!nextContent || nextContent === currentActiveContent) return;

    playClickSound(); 

    if (currentActiveContent) {
        // Desactivar el contenido actual
        currentActiveContent.classList.remove('active');
        currentActiveContent.style.opacity = '0';
        currentActiveContent.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            currentActiveContent.style.display = 'none';
            
            // Activar el nuevo contenido
            nextContent.style.display = 'block';
            nextContent.style.opacity = '0'; 
            void nextContent.offsetWidth; 
            nextContent.classList.add('active');
            
            currentActiveContent = nextContent;
            
            animateInfoBlocks(nextContent);
            if (targetId === 'content-impacto') animateAlcaldiasBars();
        }, 300); 
    } else {
        // Primera carga
        detailContents.forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
        
        nextContent.style.display = 'block';
        void nextContent.offsetWidth;
        nextContent.classList.add('active');
        currentActiveContent = nextContent;

        animateInfoBlocks(nextContent); 
        if (targetId === 'content-impacto') animateAlcaldiasBars();
    }
}

// Inicializar al cargar: activa el primer elemento por defecto o el del hash
document.addEventListener('DOMContentLoaded', () => {
    // Si hay hash, cargarlo, si no, usar el primer elemento por defecto
    const initialTargetId = window.location.hash ? window.location.hash.substring(1) : detailContents[0]?.id; 
    
    // Asegurar que el hash exista como contenido y cargarlo
    if (initialTargetId && document.getElementById(initialTargetId)) {
        showContent(initialTargetId);
    } else if (detailContents[0]?.id) {
        // Si el hash no es válido, cargar el primer elemento por defecto
        showContent(detailContents[0].id);
    }
});

// Eventos para las tarjetas del carrusel (click)
carouselCards.forEach(card => {
    card.addEventListener('click', () => { 
        const targetId = card.getAttribute('data-target');
        
        // Ocultar la tarjeta de carga de la simulación si se navega a otro lado
        if (targetId !== 'content-algoritmo') {
            const riesgoTextoEl = document.getElementById('riesgo-texto');
            if (riesgoTextoEl) {
                riesgoTextoEl.textContent = "Esperando datos...";
                riesgoTextoEl.className = `risk-level pending`; 
            }
        }

        // MEJORA: Persistencia de estado (Actualizar el hash de la URL)
        if (targetId) {
            window.location.hash = targetId; 
            showContent(targetId); 
        }
    });
});


// ------------------------------------
// Lógica de navegación del Carrusel
// ------------------------------------
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentCardIndex = 0;
const cardWidth = 350; 

function moveToCard(index) {
    if (carouselTrack) {
        const offset = -index * cardWidth;
        carouselTrack.style.transform = `translateX(${offset}px)`;
    }
}

if (nextBtn && carouselTrack) {
    nextBtn.addEventListener('click', () => {
        playClickSound();
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
        playClickSound();
        if (currentCardIndex > 0) {
            currentCardIndex--;
            moveToCard(currentCardIndex);
        }
    });
}


// ===============================================
// 4. FUNCIÓN DE SIMULACIÓN (calcularRiesgo) - MEJORA: Validación de Inputs
// ===============================================
function calcularRiesgo() {
    playActionSound(); 
    
    // 1. Obtener valores de los inputs
    const M = parseFloat(document.getElementById('alcaldia-select').value);
    const C = parseFloat(document.getElementById('lluvia-input').value);
    const P = parseFloat(document.getElementById('obstruccion-input').value);
    const E = parseFloat(document.getElementById('exposicion-input').value);

    // MEJORA: Validación de Input para robustez
    if (isNaN(C) || isNaN(P) || isNaN(E) || isNaN(M)) {
        const riesgoTextoEl = document.getElementById('riesgo-texto');
        riesgoTextoEl.textContent = "Error: Datos de entrada inválidos. Revise los valores.";
        riesgoTextoEl.className = `risk-level high`; // Usar high para notificar error
        console.error("Entrada inválida en la simulación.");
        return; 
    }

    // 2. FÓRMULA CLAVE: R = C + P + (E × M)
    const R = C + P + (E * M);

    // 3. Clasificación de riesgo
    let riesgoText;
    let riesgoClass;

    if (C === 0) {
        riesgoText = "Riesgo: CERO RIESGO (Sistema Estable)"; 
        riesgoClass = "zero";
    } else if (R >= 6.0) {
        riesgoText = "Riesgo: ALTO"; 
        riesgoClass = "high";
    } else if (R >= 4.0) {
        riesgoText = "Riesgo: MEDIO"; 
        riesgoClass = "medium";
    } else { // C > 0 y R < 4.0
        riesgoText = "Riesgo: BAJO"; 
        riesgoClass = "low";
    }

    // 4. Actualizar el display
    const riesgoTextoEl = document.getElementById('riesgo-texto');
    
    riesgoTextoEl.textContent = `${riesgoText} (Valor R: ${R.toFixed(2)})`;
    riesgoTextoEl.className = `risk-level ${riesgoClass}`; 
}

window.calcularRiesgo = calcularRiesgo;


// ===============================================
// 5. FUNCIÓN PARA ANIMAR LAS BARRAS DE PROGRESO DE ALCALDÍAS
// ===============================================
function animateAlcaldiasBars() {
    const alcaldias = document.querySelectorAll('.alcaldias-list li');
    alcaldias.forEach(li => {
        const percentage = li.getAttribute('data-percentage');
        li.style.setProperty('--percentage', percentage);
    });
}
