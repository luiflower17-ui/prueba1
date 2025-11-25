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
        if (riesgoTextoEl) {
            riesgoTextoEl.textContent = "Esperando datos...";
            riesgoTextoEl.className = `risk-level pending`; 
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
        currentActiveContent = nextContent;

        animateInfoBlocks(nextContent); 
        if (targetId === 'content-impacto') {
            animateAlcaldiasBars();
        }
    }
}

// Inicializar y manejar la tarjeta activa al cargar
document.addEventListener('DOMContentLoaded', () => {
    const initialTargetId = window.location.hash ? window.location.hash.substring(1) : detailContents[0]?.id; 
    
    if (initialTargetId && document.getElementById(initialTargetId)) {
        showContent(initialTargetId);
        const initialCard = document.querySelector(`.carousel-card[data-target="${initialTargetId}"]`);
        if (initialCard) {
            initialCard.classList.add('active');
        }
    } else if (detailContents[0]?.id) {
        showContent(detailContents[0].id);
        carouselCards[0]?.classList.add('active');
    }
});

// Eventos para las tarjetas del carrusel (click)
carouselCards.forEach(card => {
    card.addEventListener('click', () => { 
        const targetId = card.getAttribute('data-target');
        
        if (targetId) {
            // Manejar la clase 'active' para el efecto de pulse/glow
            carouselCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            window.location.hash = targetId; 
            showContent(targetId); 
            
            // Sincronizar el scroll del carrusel cuando se hace click
            const cardIndex = contentIds.indexOf(targetId);
            if (cardIndex !== -1) {
                 const totalVisibleCards = 3; 
                 const totalCards = contentIds.length;
                 const maxScrollIndex = totalCards - totalVisibleCards; 
                 
                 let scrollIndex = 0;
                 if (cardIndex >= totalVisibleCards) {
                     // Calcula el índice de desplazamiento para que la tarjeta quede a la derecha
                     scrollIndex = Math.min(cardIndex - (totalVisibleCards - 1), maxScrollIndex);
                 }
                 
                 scrollIndex = Math.max(0, scrollIndex);
                 
                 currentCardIndex = scrollIndex; // Sincroniza el índice global
                 moveToCard(currentCardIndex);
            }
        }
    });
});


// ------------------------------------
// Lógica de navegación del Carrusel
// ------------------------------------
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
        
        // Al usar el botón, no cambiamos la tarjeta activa, solo el scroll.
        // Si queremos que al mover el scroll se active la primera visible, es más complejo.
        // Dejaremos que los botones solo muevan el scroll visualmente.
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
// 4. LÓGICA DEL SIMULADOR
// ===============================================

// Centralizar la actualización de los valores de rango
document.addEventListener('DOMContentLoaded', () => {
    const rangeInputs = [
        { id: 'lluvia-input', valueId: 'lluvia-val' },
        { id: 'obstruccion-input', valueId: 'obstruccion-val' },
        { id: 'exposicion-input', valueId: 'exposicion-val' }
    ];

    rangeInputs.forEach(item => {
        const inputEl = document.getElementById(item.id);
        const valueEl = document.getElementById(item.valueId);
        
        if (inputEl && valueEl) {
            valueEl.textContent = inputEl.value; 
            
            inputEl.addEventListener('input', function() {
                valueEl.textContent = this.value;
            });
        }
    });
});


function calcularRiesgo() {
    playConfirmAction(); // Usar el sonido de acción

    // 1. Obtener valores de los inputs
    const M = parseFloat(document.getElementById('alcaldia-select').value);
    const C = parseFloat(document.getElementById('lluvia-input').value);
    const P = parseFloat(document.getElementById('obstruccion-input').value);
    const E = parseFloat(document.getElementById('exposicion-input').value);

    // Validación de Input
    if (isNaN(C) || isNaN(P) || isNaN(E) || isNaN(M)) {
        const riesgoTextoEl = document.getElementById('riesgo-texto');
        riesgoTextoEl.textContent = "Error: Datos de entrada inválidos. Revise los valores.";
        riesgoTextoEl.className = `risk-level high`; 
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

    // 4. Actualizar el display de clasificación
    const riesgoTextoEl = document.getElementById('riesgo-texto');
    const simResultEl = document.getElementById('sim-result');
    let messageHTML = '';

    riesgoTextoEl.textContent = riesgoText;
    riesgoTextoEl.className = `risk-level ${riesgoClass}`; 

    // 5. Añadir mensaje de sugerencia condicional
    if (riesgoClass === 'high') {
        messageHTML = `<p class="impact-message high-alert"><strong>⚠️ ALERTA MÁXIMA:</strong> Siga las indicaciones de Protección Civil.</p>
                       <a href="www.proteccioncivil.gob.mx/work/models/ProteccionCivil/Resource/377/1/images/cartel_i.pdf" target="_blank" class="impact-link high-risk-link">
                           <i class="fas fa-file-pdf"></i> Protocolo de Emergencia
                       </a>`;
    } else {
        messageHTML = `<p class="impact-message low-alert">Manténgase informado y preparado.</p>
                       <a href="https://youtu.be/wAaV8rV2bRw" target="_blank" class="impact-link low-risk-link">
                           <i class="fas fa-video"></i> Video Informativo sobre Inundaciones
                       </a>`;
    }
    
    // Inyectar el mensaje y el enlace en un nuevo contenedor dentro de result-box
    let adviceContainer = document.getElementById('advice-container');
    if (!adviceContainer) {
        adviceContainer = document.createElement('div');
        adviceContainer.id = 'advice-container';
        simResultEl.appendChild(adviceContainer);
    }
    adviceContainer.innerHTML = messageHTML;
}

window.calcularRiesgo = calcularRiesgo;


// ===============================================
// 5. FUNCIÓN PARA ANIMAR LAS BARRAS DE PROGRESO DE ALCALDÍAS (Contador Dinámico)
// ===============================================
function animateAlcaldiasBars() {
    const alcaldias = document.querySelectorAll('.alcaldias-list li');
    
    // 1. Resetear y preparar las barras
    alcaldias.forEach(li => {
        const fullText = li.textContent.trim();
        const textParts = fullText.split(/\s+\(/); // Divide el texto de la alcaldía
        const textWithoutPercentage = textParts[0]; 
        
        const targetPercentage = parseInt(li.getAttribute('data-percentage').replace('%', ''), 10);
        
        // Inyectamos el span del contador
        li.innerHTML = `${textWithoutPercentage} <span class="percentage-counter">0%</span>`;
        li.style.setProperty('--percentage', '0%'); 
        
        const counterElement = li.querySelector('.percentage-counter');
        
        let currentCount = 0;
        const duration = 1500; 
        const stepTime = 15; 
        const steps = duration / stepTime;
        const stepValue = targetPercentage / steps;
        
        // 2. Iniciar el contador
        let countInterval = setInterval(() => {
            currentCount += stepValue;
            
            if (currentCount >= targetPercentage) {
                clearInterval(countInterval);
                currentCount = targetPercentage;
            }
            
            const roundedCount = Math.floor(currentCount);
            
            // Actualizar el porcentaje de la barra (CSS transition)
            li.style.setProperty('--percentage', `${roundedCount}%`);
            
            // Actualizar el contador en el texto
            if(counterElement) {
                counterElement.textContent = `(${roundedCount}%)`;
            }
            
            if (currentCount === targetPercentage) {
                 li.style.setProperty('--percentage', `${targetPercentage}%`);
                 if(counterElement) {
                    counterElement.textContent = `(${targetPercentage}%)`;
                 }
            }

        }, stepTime);
    });
}

// ===============================================
// 6. NAVEGACIÓN POR TECLADO (Mejorada con Scroll)
// ===============================================
function navigateSections(direction) {
    if (!currentActiveContent) return; 

    const currentId = currentActiveContent.id;
    let currentIndex = contentIds.indexOf(currentId);
    
    if (currentIndex === -1) return; 

    let newIndex = currentIndex;

    if (direction === 'next') {
        newIndex = (currentIndex + 1) % contentIds.length; 
    } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + contentIds.length) % contentIds.length;
    }

    const newTargetId = contentIds[newIndex];
    
    if (newTargetId) {
        // Simular el click en la nueva tarjeta (esto ya cambia el contenido y la clase 'active')
        const targetCard = document.querySelector(`.carousel-card[data-target="${newTargetId}"]`);
        if (targetCard) {
            targetCard.click(); 
            
            // Lógica para sincronizar el scroll visual del carrusel:
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
