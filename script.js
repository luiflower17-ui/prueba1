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
        // Animación de entrada pulida (Usando la animación CSS3 fadeInUp)
        block.style.animation = `fadeInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards`;
        block.style.animationDelay = `${0.2 + index * 0.1}s`; 
    });
}

function showContent(targetId) {
    const nextContent = document.getElementById(targetId);
    
    // ADICIÓN: Deep Linking (Actualizar el hash de la URL)
    window.location.hash = targetId;

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
        if (riesgoTextoEl) {
            riesgoTextoEl.textContent = "Esperando datos...";
            riesgoTextoEl.className = `risk-level pending`; 
        }
    }

    // MODIFICACIÓN: Actualizar la tarjeta activa en el carrusel
    carouselCards.forEach(card => card.classList.remove('active-card'));
    const newActiveCard = document.querySelector(`.carousel-card[data-target="${targetId}"]`);
    if (newActiveCard) {
        newActiveCard.classList.add('active-card');
    }
    

    if (currentActiveContent) {
        // Desactivar el contenido actual
        currentActiveContent.classList.remove('active');
        currentActiveContent.style.opacity = '0';
        currentActiveContent.style.transform = 'translateY(-20px)'; // Aplicar transformación para animación de salida

        setTimeout(() => {
            currentActiveContent.style.display = 'none'; 
            
            // Activar el nuevo contenido
            nextContent.style.display = 'block';
            void nextContent.offsetWidth; // Forzar reflow para que la transición funcione
            nextContent.classList.add('active');
            nextContent.style.opacity = '1';
            nextContent.style.transform = 'translateY(0)';
            
            currentActiveContent = nextContent;
            
            animateInfoBlocks(nextContent);
            
            // Si es la sección de impacto, iniciamos la animación del contador
            if (targetId === 'content-impacto') {
                animateAlcaldiasBars();
            }
        }, 300);
    } else {
        // Primera carga
        detailContents.forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
        nextContent.style.display = 'block';
        void nextContent.offsetWidth;
        nextContent.classList.add('active');
        nextContent.style.opacity = '1';
        nextContent.style.transform = 'translateY(0)';
        currentActiveContent = nextContent;

        animateInfoBlocks(nextContent);
        if (targetId === 'content-impacto') {
            animateAlcaldiasBars();
        }
    }
}

// Inicializar y manejar la tarjeta activa al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Usar el hash de la URL para la carga inicial (Deep Linking)
    const initialTargetId = window.location.hash ? window.location.hash.substring(1) : detailContents[0]?.id; 
    
    if (initialTargetId && document.getElementById(initialTargetId)) {
        showContent(initialTargetId);
        // La función showContent ya se encarga de actualizar el active-card
        
        // Sincronizar el scroll del carrusel si la tarjeta activa no es la primera
        const initialIndex = contentIds.indexOf(initialTargetId);
        if (initialIndex > -1) {
            // Este es un ajuste manual si la tarjeta activa no es una de las primeras visibles
            const totalCards = contentIds.length;
            const totalVisibleCards = 3; 
            const maxScrollIndex = totalCards - totalVisibleCards;
            
            let scrollIndex = 0;
            
            if (initialIndex >= totalVisibleCards) {
                // Si la tarjeta activa está fuera de la vista (índice 3 o más), movemos el carrusel
                // para que la tarjeta activa quede como la tercera tarjeta visible.
                scrollIndex = Math.min(initialIndex - (totalVisibleCards - 1), maxScrollIndex);
            }
            
            scrollIndex = Math.max(0, Math.min(scrollIndex, maxScrollIndex));
            
            currentCardIndex = scrollIndex;
            moveToCard(currentCardIndex);
        }
    }
});


// Añadir listeners de click a las tarjetas
carouselCards.forEach(card => {
    card.addEventListener('click', () => {
        const targetId = card.getAttribute('data-target');
        showContent(targetId);
    });
});

// ===============================================
// 4. LÓGICA DEL CARRUSEL (SCROLL VISUAL)
// ===============================================
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

// ===============================================
// 5. LÓGICA DEL SIMULADOR
// ===============================================

// Centralizar la actualización de los valores de rango
document.addEventListener('DOMContentLoaded', () => {
    const rangeInputs = [
        { id: 'lluvia-input', valueId: 'lluvia-val' },
        { id: 'obstruccion-input', valueId: 'obstruccion-val' },
        { id: 'vulnerabilidad-input', valueId: 'vulnerabilidad-val' },
        { id: 'exposicion-input', valueId: 'exposicion-val' },
    ];

    rangeInputs.forEach(item => {
        const input = document.getElementById(item.id);
        const valueSpan = document.getElementById(item.valueId);
        
        if (input && valueSpan) {
            input.oninput = function() {
                valueSpan.textContent = this.value;
            };
        }
    });
});


function calcularRiesgo() {
    playConfirmAction();

    // 1. Obtener valores de entrada
    const C = parseFloat(document.getElementById('lluvia-input').value); // Precipitación
    const P = parseFloat(document.getElementById('obstruccion-input').value); // Obstrucción
    const M = parseFloat(document.getElementById('vulnerabilidad-input').value); // Multiplicador de vulnerabilidad
    const E = parseFloat(document.getElementById('exposicion-input').value); // Exposición

    // 2. Fórmula conceptual: R = C + P + (E * M)
    const R = C + P + (E * M);

    // 3. Clasificar el riesgo (CORRECCIÓN: Se revierte a la lógica de 4 niveles)
    let riesgoText = '';
    let riesgoClass = '';
    let R_display = R.toFixed(2);
    
    // Clasificación de riesgo (CERO, BAJO, MEDIO, ALTO)
    if (R >= 4.0) {
        riesgoText = `Riesgo: ALTO (${R_display})`;
        riesgoClass = "high";
    } else if (R >= 2.0) {
        riesgoText = `Riesgo: MEDIO (${R_display})`;
        riesgoClass = "medium";
    } else if (R > 0) { 
        riesgoText = `Riesgo: BAJO (${R_display})`;
        riesgoClass = "low";
    } else { // R <= 0
        riesgoText = `Riesgo: CERO (${R_display})`;
        riesgoClass = "zero";
    }
    
    // 4. Actualizar el display de clasificación
    const riesgoTextoEl = document.getElementById('riesgo-texto');
    const adviceContainer = document.getElementById('advice-container');

    riesgoTextoEl.textContent = riesgoText;
    riesgoTextoEl.className = `risk-level ${riesgoClass}`;

    // 5. Añadir mensaje de sugerencia condicional
    let messageHTML = '';
    if (riesgoClass === 'high') {
        messageHTML = `<p class="impact-message high-alert"><strong>⚠️ ALERTA MÁXIMA:</strong> Siga las indicaciones de Protección Civil y evite zonas de riesgo.</p> 
        <a href="www.proteccioncivil.gob.mx/work/models/ProteccionCivil/Resource/377/1/images/cartel_i.pdf" target="_blank" class="impact-link high-risk-link"> <i class="fas fa-file-pdf"></i> Protocolo de Emergencia </a>`;
    } else if (riesgoClass === 'medium') {
        messageHTML = `<p class="impact-message medium-alert">El riesgo es moderado. Monitoree las condiciones climáticas y evite tirar basura en la vía pública.</p>`;
    } else {
        messageHTML = `<p class="impact-message low-alert">Riesgo bajo o nulo. Manténgase informado y preparado.</p> 
        <a href="https://youtu.be/wAaV8rV2bRw" target="_blank" class="impact-link low-risk-link"> <i class="fas fa-info-circle"></i> Ver consejos de prevención (Video) </a>`;
    }
    adviceContainer.innerHTML = messageHTML;
}

// ===============================================
// 6. ANIMACIÓN DE BARRAS DE ALCALDÍAS
// ===============================================
function animateAlcaldiasBars() {
    const alcaldiasList = document.querySelector('.alcaldias-list');
    if (!alcaldiasList) return;

    const alcaldias = alcaldiasList.querySelectorAll('li');
    
    alcaldias.forEach((li, index) => {
        const percentage = li.getAttribute('data-percentage');
        const counter = li.querySelector('.percentage-counter');
        
        // 1. Establecer la variable CSS para la animación
        li.style.setProperty('--percentage', `${percentage}%`);
        
        // 2. Animación de conteo numérico (simulada)
        let startValue = 0;
        const duration = 1500; //ms
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Valor actual: interpolación lineal simple
            const currentValue = Math.floor(progress * parseFloat(percentage));
            
            if (counter) {
                counter.textContent = `${currentValue}%`;
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                if (counter) {
                     counter.textContent = `${percentage}%`; // Asegurar el valor final exacto
                }
            }
        }
        
        // Retraso para que las barras aparezcan secuencialmente
        setTimeout(() => {
            requestAnimationFrame(updateCounter);
        }, index * 100); 
    });
}

// ===============================================
// 7. NAVEGACIÓN POR TECLADO (FLECHAS) - CORRECCIÓN DE SCROLL
// ===============================================

function getCurrentActiveIndex() {
    const currentActiveId = currentActiveContent?.id;
    return contentIds.indexOf(currentActiveId);
}

function navigateSections(direction) {
    let currentIndex = getCurrentActiveIndex();
    
    if (currentIndex === -1) {
        currentIndex = 0;
    }
    
    let newIndex = currentIndex;
    
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % contentIds.length;
    } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + contentIds.length) % contentIds.length;
    }

    const newTargetId = contentIds[newIndex];
    if (newTargetId) {
        // Simular el click en la nueva tarjeta (esto ya cambia el contenido y la clase 'active-card')
        showContent(newTargetId);

        // Lógica para sincronizar el scroll visual del carrusel:
        const totalCards = contentIds.length;
        const totalVisibleCards = 3; 
        const maxScrollIndex = totalCards - totalVisibleCards;
        
        // CORRECCIÓN: Ajustar currentCardIndex para mantener visible la nueva tarjeta activa
        if (newIndex < currentCardIndex) {
            // Si vamos hacia atrás, movemos el scroll al inicio de la nueva tarjeta (izquierda)
            currentCardIndex = newIndex;
        } else if (newIndex >= currentCardIndex + totalVisibleCards) {
            // Si vamos hacia adelante y la tarjeta se sale de la vista (derecha), 
            // la colocamos como la tercera tarjeta visible (indice - 2)
            currentCardIndex = newIndex - (totalVisibleCards - 1);
        }
        // Si la tarjeta ya está visible, no se ajusta currentCardIndex.

        // Aseguramos que el índice no sea negativo o exceda el máximo
        currentCardIndex = Math.max(0, Math.min(currentCardIndex, maxScrollIndex));
        
        // Aplicar el scroll
        moveToCard(currentCardIndex);
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


// ===============================================
// 8. FUNCIONALIDAD DE CAMBIO DE TEMA (DARK/LIGHT) 
// ===============================================
const themeToggle = document.getElementById('checkbox-theme');
const body = document.body;
const videoOverlay = document.querySelector('.video-overlay');
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';
const THEME_KEY = 'flood-risk-theme';
const DARK_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.65)'; // Color oscuro original
const LIGHT_OVERLAY_COLOR = 'rgba(255, 255, 255, 0.7)'; // Overlay más claro

/**
 * Aplica el tema guardado en localStorage o el tema oscuro por defecto.
 * También ajusta la opacidad del video de fondo.
 */
function initializeTheme() {
    // 1. Obtener tema guardado o usar 'dark' como default
    const savedTheme = localStorage.getItem(THEME_KEY) || DARK_THEME;
    
    // 2. Aplicar el tema al body
    body.setAttribute('data-theme', savedTheme);
    
    // 3. Sincronizar el estado del checkbox
    themeToggle.checked = (savedTheme === LIGHT_THEME);
    
    // 4. Ajustar el overlay del video de fondo
    if (videoOverlay) {
        if (savedTheme === LIGHT_THEME) {
            videoOverlay.style.backgroundColor = LIGHT_OVERLAY_COLOR;
        } else {
            videoOverlay.style.backgroundColor = DARK_OVERLAY_COLOR;
        }
    }
}

/**
 * Cambia entre el tema oscuro y claro, y guarda la preferencia.
 */
function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    
    localStorage.setItem(THEME_KEY, newTheme);
    // Llama a initializeTheme para aplicar el nuevo tema y ajustes visuales
    initializeTheme();
}

// Inicializar el tema al cargar la página
document.addEventListener('DOMContentLoaded', initializeTheme);

// Listener para el switch
if (themeToggle) {
    themeToggle.addEventListener('change', toggleTheme);
}
