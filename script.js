// ===============================================
// 0.1. TOGGLE MODO CLARO/OSCURO (Punto 1 y 3)
// ==============================================
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

function toggleDarkMode() {
    // Si está marcado, el modo oscuro está activo (el default), si no, es modo claro.
    const isDarkMode = darkModeToggle.checked;
    
    if (!isDarkMode) {
        // Modo Claro
        body.classList.add('light-mode');
        // Recordar la preferencia
        localStorage.setItem('darkMode', 'disabled');
    } else {
        // Modo Oscuro
        body.classList.remove('light-mode');
        // Recordar la preferencia
        localStorage.setItem('darkMode', 'enabled');
    }
    playSoftClick(); // Sonido de click
}

// Inicializar el modo basado en la preferencia del usuario o por defecto (oscuro)
document.addEventListener('DOMContentLoaded', () => {
    // Revisar LocalStorage
    const darkModePreference = localStorage.getItem('darkMode');
    
    if (darkModePreference === 'disabled') {
        body.classList.add('light-mode');
        darkModeToggle.checked = false; // Desmarcar el switch si está en modo claro
    } else {
        // Si no hay preferencia o es 'enabled', el modo oscuro es el predeterminado
        body.classList.remove('light-mode');
        darkModeToggle.checked = true;
    }
    
    // Asignar el listener después de la inicialización para evitar el toggle inicial
    darkModeToggle.addEventListener('change', toggleDarkMode);
});

// ===============================================
// 0. PRELOADER Y ANIMACIÓN DE CARGA INICIAL
// ===============================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Añadir una clase para iniciar la animación de desvanecimiento
        preloader.classList.add('fade-out');
        // Quitar el preloader del DOM después de que termine la transición (500ms)
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});


// ===============================================
// 1. FUNCIONALIDAD DE AUDIO (CLICK)
// ===============================================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
// Asegura que el contexto se reactive en la primera interacción del usuario
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
 * Genera un sonido sintetizado con la Web Audio API.
 */
function createSound(frequency, duration, volume, type = 'square') {
    if (audioContext.state === 'closed' || audioContext.state === 'suspended') return;
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = type; 
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); 
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime); 

        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.warn("Fallo al reproducir audio:", e.message);
    }
}

// Sonido de click digital (navegación sutil)
const playSoftClick = () => createSound(1500, 0.015, 0.1, 'square');
// Sonido de acción (botón de simulación)
const playConfirmAction = () => createSound(1200, 0.08, 0.2, 'sine');

// ===============================================
// 2. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE (HEADER Y SCROLL)
// ===============================================
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
if (scrollToTopBtn) {
    const observerTarget = document.querySelector('header');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scrollToTopBtn.style.display = "none";
            } else {
                scrollToTopBtn.style.display = "block";
            }
        });
    }, {
        threshold: 0.1 
    });
    if (observerTarget) {
        observer.observe(observerTarget);
    }

    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        playSoftClick(); 
    });
}


// ===============================================
// 3. LÓGICA DEL PANEL INTERACTIVO (CARRUSEL Y ANIMACIONES)
// ===============================================
const carouselCards = document.querySelectorAll('.carousel-card');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

// Array ordenado de IDs para navegación secuencial (teclado)
const contentIds = Array.from(carouselCards).map(card => card.getAttribute('data-target')).filter(id => id);

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

    playSoftClick();
    // Limpiar mensajes del simulador al cambiar de sección
    const adviceContainer = document.getElementById('advice-container');
    if (adviceContainer) {
        adviceContainer.innerHTML = '';
    }
    
    // Reiniciar el estado del simulador si salimos
    if (targetId !== 'content-algoritmo') {
        const riesgoTextoEl = document.getElementById('riesgo-texto');
        const simResultEl = document.getElementById('sim-result');
        if (riesgoTextoEl) {
            riesgoTextoEl.textContent = "Esperando datos...";
            riesgoTextoEl.className = `risk-level pending`; 
        }
        if (simResultEl) {
             simResultEl.classList.remove('high-pulse', 'medium-pulse'); // Limpiar pulso
        }
    }


    if (currentActiveContent) {
        // Desactivar el contenido actual
        currentActiveContent.classList.remove('active');
        currentActiveContent.style.opacity = '0';
        currentActiveContent.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            currentActiveContent.style.display = 'none'; 
            
            // Activar el nuevo contenido
            nextContent.style.display = 'block';
            void nextContent.offsetWidth; 
            nextContent.classList.add('active');
            nextContent.style.opacity = '1';
            nextContent.style.transform = 'translateY(0)';
            
            currentActiveContent = nextContent;
            
            animateInfoBlocks(nextContent);
            
            // Si es la sección de impacto, iniciamos la animación del contador
            if (targetId === 'content-impacto') {
                animateAlcaldiaPercentages();
            }
            
            // Actualizar la tarjeta activa en el carrusel
            updateActiveCard(targetId);
            
            // Mover el carrusel para sincronizar el scroll visual
            const currentIndex = contentIds.indexOf(targetId);
            if (currentIndex !== -1) {
                const totalCards = contentIds.length;
                const totalVisibleCards = 3; 
                const maxScrollIndex = totalCards - totalVisibleCards;
                
                let scrollIndex = 0;
                
                if (currentIndex >= totalVisibleCards) {
                    // Si la nueva tarjeta está fuera de la vista (índice 3 o más), movemos el carrusel
                    // para que la tarjeta activa quede como la tercera tarjeta visible.
                    scrollIndex = Math.min(currentIndex - (totalVisibleCards - 1), maxScrollIndex);
                }
                
                // Aseguramos que el índice no sea negativo o exceda el máximo
                scrollIndex = Math.max(0, Math.min(scrollIndex, maxScrollIndex));
                
                currentCardIndex = scrollIndex;
                moveToCard(currentCardIndex);
            }
        }, 400); // Esperar a que la transición de opacidad termine
    } else {
        // Primer contenido a mostrar
        nextContent.style.display = 'block';
        void nextContent.offsetWidth; 
        nextContent.classList.add('active');
        nextContent.style.opacity = '1';
        nextContent.style.transform = 'translateY(0)';
        currentActiveContent = nextContent;
        animateInfoBlocks(nextContent);
        updateActiveCard(targetId);
    }
}

// Inicializar mostrando el primer contenido
document.addEventListener('DOMContentLoaded', () => {
    if (contentIds.length > 0) {
        showContent(contentIds[0]);
    }
});

// Asignar listeners a las tarjetas
carouselCards.forEach(card => {
    card.addEventListener('click', () => {
        showContent(card.getAttribute('data-target'));
    });
});

// Función para actualizar la clase 'active' de la tarjeta
function updateActiveCard(targetId) {
    carouselCards.forEach(card => {
        if (card.getAttribute('data-target') === targetId) {
            card.classList.add('active-card');
        } else {
            card.classList.remove('active-card');
        }
    });
}

// Lógica de carrusel (movimiento visual)
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentCardIndex = 0; // Índice de desplazamiento visual (NO índice de la tarjeta activa)
const CARD_WIDTH = 330;
const CARD_GAP = 20;
const totalStepSize = CARD_WIDTH + CARD_GAP;

function moveToCard(index) {
    if (carouselTrack) {
        const offset = -index * totalStepSize;
        carouselTrack.style.transform = `translateX(${offset}px)`;
    }
}

if (nextBtn && carouselTrack) {
    nextBtn.addEventListener('click', () => {
        playSoftClick();
        const totalCards = carouselTrack.children.length;
        const totalVisibleCards = 3;
        const maxIndex = totalCards - totalVisibleCards;
        
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
        playSoftClick();
        if (currentCardIndex > 0) {
            currentCardIndex--;
            moveToCard(currentCardIndex);
        }
    });
}

// Navegación con flechas del teclado
function navigateSections(direction) {
    if (!currentActiveContent) return;
    
    const currentTargetId = currentActiveContent.id;
    const currentIndex = contentIds.indexOf(currentTargetId);
    let newIndex;
    
    if (currentIndex !== -1) {
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % contentIds.length;
        } else if (direction === 'prev') {
            newIndex = (currentIndex - 1 + contentIds.length) % contentIds.length;
        }
        
        const newTargetId = contentIds[newIndex];
        if (newTargetId) {
            // Simular el click
            const targetCard = document.querySelector(`.carousel-card[data-target="${newTargetId}"]`);
            if (targetCard) {
                targetCard.click();
            }
            
            // Mover el carrusel para sincronizar el scroll visual del carrusel:
            const totalCards = contentIds.length;
            const totalVisibleCards = 3; 
            const maxScrollIndex = totalCards - totalVisibleCards;
            
            let scrollIndex = 0;
            
            if (newIndex >= totalVisibleCards) {
                // Si la nueva tarjeta está fuera de la vista (índice 3 o más), movemos el carrusel
                // para que la tarjeta activa quede como la tercera tarjeta visible.
                scrollIndex = Math.min(newIndex - (totalVisibleCards - 1), maxScrollIndex);
            }
            
            // Aseguramos que el índice no sea negativo o exceda el máximo
            scrollIndex = Math.max(0, Math.min(scrollIndex, maxScrollIndex));
            
            currentCardIndex = scrollIndex;
            moveToCard(currentCardIndex);
        }
    }
}

document.addEventListener('keydown', (event) => {
    // Evitar navegación si el usuario está interactuando con un campo de formulario
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
        return;
    }

    if (event.key === 'ArrowRight') {
        event.preventDefault(); // Prevenir el scroll por defecto
        navigateSections('next');
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault(); // Prevenir el scroll por defecto
        navigateSections('prev');
    }
});


// Función para animar porcentajes
function animateAlcaldiaPercentages() {
    const alcaldiaItems = document.querySelectorAll('.alcaldias-list li');
    alcaldiaItems.forEach((item, index) => {
        const percentage = parseFloat(item.getAttribute('data-percentage'));
        const delay = index * 200; // Retraso para el efecto escalonado
        
        // Usamos setProperty para la variable de CSS que controla el ancho
        setTimeout(() => {
            item.style.setProperty('--percentage', `${percentage}%`);
        }, delay);

        // Animación del contador de número (opcional, si es visible)
        // El CSS ya lo maneja con el ancho del pseudo-elemento.
    });
}


// ===============================================
// 4. LÓGICA DEL SIMULADOR
// ===============================================

// Centralizar la actualización de los valores de rango
document.addEventListener('DOMContentLoaded', () => {
    // ... (Inicialización del switch arriba) ...
    
    // Inicializar el display de factores (Punto 4)
    updateFactorDisplay('capacidad', document.getElementById('capacidad-input').value);
    updateFactorDisplay('hidraulica', document.getElementById('hidraulica-input').value);
    updateFactorDisplay('obstruccion', document.getElementById('obstruccion-input').value);
    updateFactorDisplay('exposicion', document.getElementById('exposicion-input').value);
});


// NUEVA FUNCIÓN PARA BARRAS DE FACTOR (Punto 4)
function updateFactorDisplay(factor, value) {
    const displayElement = document.getElementById(`${factor}-display`);
    if (!displayElement) return;

    const barAfter = displayElement.querySelector('::after'); // No funciona con JS, usar setProperty en el padre

    let max, color;

    // Definir el máximo valor y color para cada factor
    switch (factor) {
        case 'capacidad': // C, Max 5 (Alto C = Peor)
            max = 5;
            // Escala de Verde (0) a Rojo (5)
            if (value <= 1) color = 'var(--risk-zero)';
            else if (value <= 2.5) color = 'var(--risk-low)';
            else if (value <= 4) color = 'var(--risk-medium)';
            else color = 'var(--risk-high)';
            break;
        case 'hidraulica': // K, Max 5 (Alto K = Mejor)
            max = 5;
            // Escala de Rojo (0) a Verde (5)
            if (value <= 1) color = 'var(--risk-high)';
            else if (value <= 2.5) color = 'var(--risk-medium)';
            else if (value <= 4) color = 'var(--risk-low)';
            else color = 'var(--risk-zero)';
            break;
        case 'obstruccion': // P, Max 3 (Alto P = Peor)
            max = 3;
            // Escala de Verde (0) a Rojo (3)
            if (value == 0) color = 'var(--risk-zero)';
            else if (value <= 1) color = 'var(--risk-low)';
            else if (value <= 2) color = 'var(--risk-medium)';
            else color = 'var(--risk-high)';
            break;
        case 'exposicion': // E, Max 3 (Alto E = Peor)
            max = 3;
            // Escala de Verde (0) a Rojo (3)
            if (value == 0) color = 'var(--risk-zero)';
            else if (value == 1) color = 'var(--risk-low)';
            else if (value == 2) color = 'var(--risk-medium)';
            else color = 'var(--risk-high)';
            break;
        default:
            max = 1;
            color = 'var(--color-accent-blue)';
    }

    // Calcular el porcentaje para la barra
    const percentage = (value / max) * 100;

    // Actualizar el estilo de la barra usando variables CSS en el elemento padre
    displayElement.style.setProperty('--percentage-width', `${percentage}%`);
    displayElement.style.setProperty('--bar-color', color);
}


function calcularRiesgo() {
    playConfirmAction();

    // Factores estáticos (constantes)
    const M = 1.8; // Vulnerabilidad Histórica

    // Factores dinámicos (sliders)
    const C = parseFloat(document.getElementById('capacidad-input').value);
    const K = parseFloat(document.getElementById('hidraulica-input').value);
    const P = parseFloat(document.getElementById('obstruccion-input').value);
    const E = parseInt(document.getElementById('exposicion-input').value);

    // 1. Calcular el riesgo base (R_base)
    // El riesgo se acumula con la lluvia (C) + obstrucción (P), y se amplifica por la exposición (E) y vulnerabilidad (M).
    // R = (C + P) + (E * M)
    const R_initial = C + P + (E * M);

    // 2. Aplicar el factor de capacidad hidráulica (K) como mitigación.
    // Usamos K como un factor de descuento, donde un K alto reduce el riesgo.
    // Asumimos que K no puede ser 0 para evitar división por cero; el mínimo es 0.5.
    const K_adjusted = Math.max(K, 0.5); 
    const R_mitigated = R_initial / (K_adjusted / 5); // Normalizamos K a una escala 0-1 (K/MaxK) e invertimos el efecto.

    // 3. Redondear el riesgo final
    const R = Math.round(R_mitigated * 10) / 10;
    
    let riesgoText = "Riesgo: CERO";
    let riesgoClass = "zero";

    if (R < 0.5) {
        riesgoText = "Riesgo: CERO";
        riesgoClass = "zero";
    } else if (R >= 8) {
        riesgoText = "Riesgo: ALTO";
        riesgoClass = "high";
    } else if (R >= 4.0 && R < 8.0) {
        riesgoText = "Riesgo: MEDIO";
        riesgoClass = "medium";
    } else if (R >= 0.5 && R < 4.0) {
        riesgoText = "Riesgo: BAJO";
        riesgoClass = "low";
    }


    // 4. Actualizar el display de clasificación (Punto 2 anterior: Solo Riesgo: [Nivel])
    const riesgoTextoEl = document.getElementById('riesgo-texto');
    const simResultEl = document.getElementById('sim-result'); // Elemento para control de impacto visual
    const adviceContainer = document.getElementById('advice-container');
    
    // --- NUEVO: Control de impacto visual (Pulso) ---
    simResultEl.classList.remove('high-pulse', 'medium-pulse'); // Limpiar clases anteriores

    let messageHTML = '';
    riesgoTextoEl.textContent = riesgoText; // Ya contiene "Riesgo: ..."
    riesgoTextoEl.className = `risk-level ${riesgoClass}`;


    // 5. Añadir mensaje de sugerencia condicional y activar pulso
    if (riesgoClass === 'high') {
        simResultEl.classList.add('high-pulse'); // Añadir pulso rojo
        messageHTML = `<p class="impact-message high-alert"><strong>⚠️ ALERTA MÁXIMA:</strong> Siga las indicaciones de Protección Civil. La combinación de lluvia alta (C=${C}) y obstrucción (P=${P}) ha superado la capacidad crítica de drenaje (K=${K}).</p> <a href="www.proteccioncivil.gob.mx/work/models/ProteccionCivil/Resource/377/1/images/cartel_i.pdf" target="_blank" class="impact-link high-risk-link"> <i class="fas fa-file-pdf"></i> Protocolo de Emergencia </a>`;
    } else if (riesgoClass === 'medium') {
        simResultEl.classList.add('medium-pulse'); // Añadir pulso naranja
        messageHTML = `<p class="impact-message medium-alert"><strong>❗️ ALERTA:</strong> Nivel de riesgo moderado. Se recomienda limpiar coladeras y evitar áreas bajas. El factor de Obstrucción (P=${P}) es un mitigador potencial.</p>`;
    } else if (riesgoClass === 'low') {
        messageHTML = `<p class="impact-message low-alert"><strong>🟢 PRECAUCIÓN:</strong> Nivel de riesgo bajo, pero K=${K} indica que el drenaje puede comenzar a saturarse con precipitaciones continuas. Siga limpiando coladeras.</p>`;
    } else {
        messageHTML = `<p class="impact-message zero-alert"><strong>✅ RIESGO CERO:</strong> El sistema se encuentra estable. Mantenga la vigilancia en la limpieza de residuos (P) para evitar futuros picos.</p>`;
    }

    adviceContainer.innerHTML = messageHTML;
}

