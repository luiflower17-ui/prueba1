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
        // La función showContent ya maneja la clase 'active-card' y el hash.
    } else if (detailContents.length > 0) {
        // Si no hay hash y hay contenidos, mostrar el primero sin deep linking
        showContent(detailContents[0].id);
    }
    
    // Asignar listeners a las tarjetas después de que showContent se haya definido
    carouselCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const targetId = card.getAttribute('data-target');
            showContent(targetId);
        });
    });

    // ===============================================
    // 4. LÓGICA DEL CARRUSEL (SCROLL VISUAL) - Adaptado para evitar conflicto en móvil
    // ===============================================
    const carouselTrack = document.getElementById('carousel-track');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentCardIndex = 0; // Índice de desplazamiento visual (NO índice de la tarjeta activa)
    const CARD_WIDTH = 330;
    const CARD_GAP = 20;
    const totalStepSize = CARD_WIDTH + CARD_GAP;

    function moveToCard(index) {
        // CORRECCIÓN: Solo aplicar el transform en pantallas grandes (> 900px)
        // para evitar conflictos con el scroll-snap de CSS en móvil.
        if (carouselTrack && window.innerWidth > 900) { 
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
            } else {
                // Ir al inicio si se llega al final
                currentCardIndex = 0;
                moveToCard(currentCardIndex);
            }
        });
    }

    if (prevBtn && carouselTrack) {
        prevBtn.addEventListener('click', () => {
            playSoftClick();
            const totalCards = carouselTrack.children.length;
            const totalVisibleCards = 3;
            const maxIndex = totalCards - totalVisibleCards;

            if (currentCardIndex > 0) {
                currentCardIndex--;
                moveToCard(currentCardIndex);
            } else {
                // Ir al final si se llega al inicio
                currentCardIndex = maxIndex;
                moveToCard(currentCardIndex);
            }
        });
    }


    // Función de sincronización para navegación por teclado/hash
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
            let scrollIndex = currentCardIndex;
            let initialIndex = newIndex; 
            
            if (totalCards > totalVisibleCards) {
                // Si la nueva tarjeta activa es una de las primeras dos, el carrusel vuelve al inicio.
                if (initialIndex <= 1) { 
                    scrollIndex = 0;
                } 
                // Si la tarjeta activa está fuera de la vista (índice 3 o más), movemos el carrusel
                // para que la tarjeta activa quede como la tercera tarjeta visible.
                else if (initialIndex >= currentCardIndex + totalVisibleCards - 1) { 
                     scrollIndex = Math.min(initialIndex - (totalVisibleCards - 1), maxScrollIndex);
                } else if (initialIndex < currentCardIndex) {
                    scrollIndex = initialIndex;
                }
            }

            scrollIndex = Math.max(0, Math.min(scrollIndex, maxScrollIndex));
            currentCardIndex = scrollIndex;
            moveToCard(currentCardIndex);
        }
    }
    
    // Listener para navegación por teclado (flechas izquierda/derecha)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault(); 
            navigateSections('next');
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault(); 
            navigateSections('prev');
        }
    });
    
    
    
    // ===============================================
    // 5. LÓGICA DEL SIMULADOR DE RIESGO (NUEVA IMPLEMENTACIÓN)
    // ===============================================
    const simForm = document.getElementById('simulation-area');
    if (simForm) {
        // Listener unificado para todos los inputs
        simForm.addEventListener('input', runSimulation); 
        // El botón de simulación está comentado en HTML, se elimina su listener.
    }

    function runSimulation() {
        playConfirmAction(); // Reproducir sonido de confirmación al ejecutar la simulación

        const lluviaInput = document.getElementById('lluvia-input');
        const obstruccionInput = document.getElementById('obstruccion-input');
        const exposicionInput = document.getElementById('exposicion-input'); // Nuevo input E
        const alcaldiaSelect = document.getElementById('alcaldia-select');
        const riesgoTextoEl = document.getElementById('riesgo-texto');
        const consejoEl = document.getElementById('advice-container');

        if (!lluviaInput || !obstruccionInput || !exposicionInput || !alcaldiaSelect || !riesgoTextoEl || !consejoEl) return;

        // 1. Recolección de datos y Multiplicador (M)
        const C = parseInt(lluviaInput.value); // Precipitación (C)
        const P = parseInt(obstruccionInput.value); // Obstrucción (P)
        const E = parseInt(exposicionInput.value); // Exposición (E)
        
        const selectedOption = alcaldiaSelect.options[alcaldiaSelect.selectedIndex];
        const M = parseFloat(selectedOption.getAttribute('data-m') || 0); // Default 0 (Valor no valido)
        const alcaldia = selectedOption.value;
        const porcentaje = selectedOption.getAttribute('data-percentage'); // Mantener para el mensaje de detalle

        // 2. Cálculo del Riesgo (R) - Fórmula conceptual: R = (C + P + E) * M
        const R = (C + P + E) * M;

        // 3. Determinación del Nivel y Mensaje (NUEVA LÓGICA)
        let riesgoText = '';
        let riesgoClass = '';
        let messageHTML = '';
        let R_display = R.toFixed(2); 
        const url_bajo_medio = 'https://youtu.be/wAaV8rV2bRw';
        const url_alto = 'http://www.proteccioncivil.gob.mx/work/models/ProteccionCivil/Resource/377/1/images/cartel_i.pdf';

        if (M === 0) {
            riesgoText = "Valor no valido";
            riesgoClass = "pending";
            messageHTML = `<p class="impact-message zero-alert"><strong>❌ Error:</strong> Por favor, seleccione una alcaldía válida.</p>`;
        } else if (C === 0 && R === 0) {
            riesgoText = `Cero riesgo (R=${R_display})`;
            riesgoClass = "zero";
            messageHTML = `<p class="impact-message zero-alert"><strong>✅ Cero Riesgo:</strong> No hay lluvia (C=0). Condiciones normales.</p>
            <p class="impact-detail">Te recomendamos visitar esta URL: <a href="${url_bajo_medio}" target="_blank">${url_bajo_medio}</a></p>`;
        } else if (R >= 9) { // El rango de riesgo alto parte de 8 hasta el límite más alto que es 12.6
            riesgoText = `Riesgo: ALTO (${R_display})`;
            riesgoClass = "high";
            messageHTML = `<p class="impact-message high-alert"><strong>⚠️ ALERTA MÁXIMA:</strong> Riesgo Alto en ${alcaldia}. Siga las indicaciones de Protección Civil.</p>
            <a href="${url_alto}" target="_blank" class="impact-link high-risk-link">
            <i class="fas fa-exclamation-triangle"></i> Ver Guía Operativa de Protección Civil</a>
            <p class="impact-detail">Una combinación de factores críticos y alta vulnerabilidad histórica (${alcaldia}, ${porcentaje}% de reportes) eleva el riesgo por encima del umbral de 9.0.</p>`;
        } else if (R >= 4) {
            riesgoText = `Riesgo: MEDIO (${R_display})`;
            riesgoClass = "medium";
            messageHTML = `<p class="impact-message medium-alert"><strong>❗ Precaución:</strong> Riesgo Medio en ${alcaldia}. Monitoreo constante.</p>
            <p class="impact-detail">La probabilidad de encharcamiento es moderada. Priorizar limpieza de coladeras. Te recomendamos visitar esta URL: <a href="${url_bajo_medio}" target="_blank">${url_bajo_medio}</a></p>`;
        } else { // R < 4 (Riesgo Bajo)
            riesgoText = `Riesgo: BAJO (${R_display})`;
            riesgoClass = "low";
            messageHTML = `<p class="impact-message low-alert"><strong>🟢 Bajo Riesgo:</strong> Mantener monitoreo preventivo y limpiar residuos.</p>
            <p class="impact-detail">El sistema opera dentro de los límites de seguridad para ${alcaldia}. Te recomendamos visitar esta URL: <a href="${url_bajo_medio}" target="_blank">${url_bajo_medio}</a></p>`;
        }


        // 4. Actualizar el display de clasificación
        riesgoTextoEl.textContent = riesgoText;
        riesgoTextoEl.className = `risk-level ${riesgoClass}`;


        // 5. Actualizar contenedor de consejos
        consejoEl.innerHTML = `<div class="result-box">${messageHTML}</div>`;
    }

    // ===============================================
    // 6. ANIMACIÓN DE BARRAS EN SECCIÓN IMPACTO
    // ===============================================
    function animateAlcaldiasBars() {
        const alcaldiaItems = document.querySelectorAll('#content-impacto .alcaldias-list li');
        
        alcaldiasItems.forEach(item => {
            const percentage = item.getAttribute('data-percentage');
            // Usar una variable CSS para animar la barra
            item.style.setProperty('--percentage', `${percentage}%`);
        });
        
        // La animación real se maneja con la transición CSS en la propiedad `width` del pseudoelemento ::before.
    }


    // ===============================================
    // 7. LÓGICA DE CAMBIO DE TEMA (DARK/LIGHT)
    // ===============================================
    const body = document.body;
    const themeToggle = document.getElementById('checkbox-theme');
    const videoOverlay = document.querySelector('.video-overlay');
    
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';
    const THEME_KEY = 'flood_theme_preference';
    const DARK_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.65)'; // Opacidad oscura para el tema oscuro
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
        // Llama a initializeTheme para aplicar los cambios de inmediato
        initializeTheme();
    }

    // Inicializar el tema al cargar la página
    initializeTheme();

    // Listener para el cambio de tema
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }
    
    // ===============================================
    // FIN DEL DOMContentLoaded
    // ===============================================
});
