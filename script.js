// Variable para el elemento de sonido (se inicializa en initProject)
let clickSound;

/**
 * Función para gestionar el clic en las tarjetas y mostrar el contenido detallado.
 * Esta función corrige el problema de visibilidad asegurando que solo un bloque sea visible.
 * @param {string} targetId - El ID del div de contenido a mostrar (ej: 'content-problema').
 */
function handleCardClick(targetId) {
    // 1. Reproducir sonido de clic
    if (clickSound) {
        clickSound.currentTime = 0; // Reiniciar para permitir clics rápidos
        clickSound.play().catch(e => {
            // Ignorar errores de autoplay (comunes en navegadores)
            console.warn("Error al reproducir sonido de clic:", e);
        });
    }

    // 2. Ocultar todos los bloques de contenido detallado y quitar clase 'active'
    const allContent = document.querySelectorAll('.content-detail');
    allContent.forEach(content => {
        content.classList.remove('active');
        // Usar un pequeño retraso antes de ocultar completamente el display, 
        // para que la transición de opacidad se vea.
        setTimeout(() => {
            content.style.display = 'none';
        }, 500); // 500ms es el tiempo de la transición CSS
    });

    // 3. Mostrar el bloque de contenido objetivo y añadir clase 'active'
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
        // Mostrar inmediatamente para preparar la transición
        targetContent.style.display = 'block'; 
        
        // Usar setTimeout con 10ms para asegurar que el navegador registre el display: block 
        // antes de aplicar la clase 'active' que inicia la transición
        setTimeout(() => {
            targetContent.classList.add('active');
        }, 10);
        
        // 4. Desplazarse al panel de detalle para asegurar que el usuario vea el contenido
        const detailPanel = document.getElementById('interactive-content');
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 5. Actualizar la tarjeta activa en el carrusel
    const allCards = document.querySelectorAll('.carousel-card');
    allCards.forEach(card => card.classList.remove('active-card'));
    
    // Encontrar la tarjeta correspondiente al targetId y activarla
    const activeCard = document.querySelector(`.carousel-card[data-target="${targetId}"]`);
    if (activeCard) {
        activeCard.classList.add('active-card');
    }
}


/**
 * Lógica del Simulador de Riesgo de Inundación (R = C + P + (E * M))
 */
function calcularRiesgo() {
    // Capturar valores de los inputs
    const M = parseFloat(document.getElementById('alcaldia-select').value);
    const C = parseFloat(document.getElementById('lluvia-input').value);
    const P = parseFloat(document.getElementById('obstruccion-input').value);
    const E = parseFloat(document.getElementById('exposicion-input').value);

    // Calcular el Riesgo (R)
    const R = C + P + (E * M);
    const riesgoRedondeado = R.toFixed(2);

    // Elemento de texto de resultado
    const riesgoTextoElement = document.getElementById('riesgo-texto');
    
    // Limpiar clases de riesgo previas
    riesgoTextoElement.classList.remove('cero', 'bajo', 'medio', 'alto', 'pending');

    let nivelRiesgoTexto = '';
    let nivelRiesgoClase = '';

    // Clasificación de Riesgo
    if (R <= 0.0) {
        nivelRiesgoTexto = 'Riesgo: CERO';
        nivelRiesgoClase = 'cero';
    } else if (R < 4.0) {
        nivelRiesgoTexto = 'Riesgo: BAJO';
        nivelRiesgoClase = 'bajo';
    } else if (R < 6.0) {
        nivelRiesgoTexto = 'Riesgo: MEDIO';
        nivelRiesgoClase = 'medio';
    } else {
        nivelRiesgoTexto = 'Riesgo: ALTO';
        nivelRiesgoClase = 'alto';
    }

    // Actualizar el resultado en el DOM
    riesgoTextoElement.textContent = `${nivelRiesgoTexto} (R = ${riesgoRedondeado})`;
    riesgoTextoElement.classList.add(nivelRiesgoClase);
}


/**
 * Lógica del Carrusel (Desplazamiento Horizontal)
 */
function setupCarousel() {
    const track = document.getElementById('carousel-track');
    const cards = Array.from(track.children);
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');

    let currentIndex = 0;

    const updateCarousel = () => {
        const cardWidth = cards[0].offsetWidth + 20; // Ancho de la tarjeta + margin-right
        // Asegurar que no se desplace más allá del final
        const maxIndex = cards.length - Math.floor(track.parentElement.offsetWidth / cardWidth);
        
        if (currentIndex < 0) {
            currentIndex = 0;
        } else if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }

        const offset = -currentIndex * cardWidth;
        track.style.transform = `translateX(${offset}px)`;

        // Ocultar/Mostrar botones de navegación
        prevButton.style.display = currentIndex > 0 ? 'block' : 'none';
        nextButton.style.display = currentIndex < maxIndex ? 'block' : 'none';
    };

    nextButton.addEventListener('click', () => {
        currentIndex++;
        updateCarousel();
    });

    prevButton.addEventListener('click', () => {
        currentIndex--;
        updateCarousel();
    });

    // Recalcular en resize para mantener la posición correcta
    window.addEventListener('resize', updateCarousel);

    // Inicializar la posición
    updateCarousel();
}


/**
 * Lógica del Botón de Scroll a Top
 */
function setupScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Mostrar u ocultar el botón
    window.onscroll = function() {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };

    // Función al hacer clic
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


/**
 * Inicialización del proyecto al cargar el DOM.
 */
function initProject() {
    // 1. Inicializar Audio
    clickSound = document.getElementById('click-sound');

    // 2. Inicializar Carrusel
    setupCarousel();

    // 3. Inicializar Botón Scroll a Top
    setupScrollToTop();

    // 4. Configurar escuchadores de clic para las tarjetas
    const carouselCards = document.querySelectorAll('.carousel-card');
    carouselCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.getAttribute('data-target');
            handleCardClick(targetId);
        });
    });

    // 5. [FIX DE VISIBILIDAD] Mostrar el primer bloque de contenido ('content-problema') al cargar.
    // Usamos un pequeño retraso para asegurar que las transiciones CSS iniciales hayan terminado.
    setTimeout(() => {
        handleCardClick('content-problema');
    }, 100); 

    // 6. Inicializar el simulador
    calcularRiesgo(); // Establecer el estado inicial del resultado del simulador
}

// Ejecutar la inicialización cuando el documento esté listo
document.addEventListener('DOMContentLoaded', initProject);
