document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. CAROUSEL Y NAVEGACIÓN ENTRE SECCIONES (TABS)
    // -----------------------------------------------------------------
    const track = document.getElementById('carousel-track');
    const cards = Array.from(document.querySelectorAll('.carousel-card'));
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const detailPanel = document.getElementById('interactive-content');
    const clickSound = document.getElementById('click-sound');

    let currentCardIndex = 0;

    // Función para reproducir el sonido de clic
    function playClickSound() {
        if (clickSound) {
            clickSound.currentTime = 0; // Reiniciar para permitir clics rápidos
            clickSound.play().catch(e => console.log("Audio play prevented:", e));
        }
    }

    // Función para actualizar la posición visual del carrusel
    function updateCarousel() {
        if (cards.length > 0) {
            const cardWidth = cards[0].offsetWidth + 20; // Ancho de la tarjeta + margin-right
            track.style.transform = `translateX(-${currentCardIndex * cardWidth}px)`;
            
            // Ocultar/mostrar botones si se llega a los límites
            prevBtn.style.visibility = currentCardIndex === 0 ? 'hidden' : 'visible';
            nextBtn.style.visibility = currentCardIndex === cards.length - 1 ? 'hidden' : 'visible';
        }
    }

    // Función para cambiar el contenido de la documentación
    function changeContent(targetId) {
        // 1. Ocultar todos los contenidos de detalle
        document.querySelectorAll('.content-detail').forEach(content => {
            content.classList.remove('active');
        });

        // 2. Mostrar el contenido objetivo
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
            // Asegurarse de que MathJax renderice el contenido si es el algoritmo
            if (window.MathJax) {
                window.MathJax.typeset();
            }
        }
    }

    // Event Listeners para las tarjetas del carrusel
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            playClickSound();
            
            // 1. Actualizar el carrusel y el índice activo
            cards.forEach(c => c.classList.remove('active-card'));
            card.classList.add('active-card');
            currentCardIndex = index;
            // updateCarousel(); // Opcional: Centrar la tarjeta, pero lo quitamos para simplificar.

            // 2. Cambiar el contenido de la documentación
            const targetId = card.getAttribute('data-target');
            changeContent(targetId);
        });
    });

    // Event Listeners para los botones del carrusel (movimiento)
    prevBtn.addEventListener('click', () => {
        playClickSound();
        if (currentCardIndex > 0) {
            currentCardIndex--;
            // La tarjeta activa sigue siendo la misma, solo se mueve la vista
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        playClickSound();
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
            // La tarjeta activa sigue siendo la misma, solo se mueve la vista
            updateCarousel();
        }
    });

    // Inicialización del carrusel
    updateCarousel();
    
    // Inicializar el contenido con la tarjeta activa por defecto (la primera)
    if (cards.length > 0) {
        changeContent(cards[0].getAttribute('data-target'));
    }

    // -----------------------------------------------------------------
    // 2. SIMULACIÓN DEL ALGORITMO R = C + P + E * M
    // -----------------------------------------------------------------
    
    // Función global para calcular el riesgo, accesible desde el HTML
    window.calcularRiesgo = function() {
        playClickSound();

        const lluviaInput = document.getElementById('lluvia-input');
        const obstruccionInput = document.getElementById('obstruccion-input');
        const exposicionInput = document.getElementById('exposicion-input');
        const alcaldiaSelect = document.getElementById('alcaldia-select');
        const riesgoTexto = document.getElementById('riesgo-texto');
        
        if (!lluviaInput || !obstruccionInput || !exposicionInput || !alcaldiaSelect || !riesgoTexto) {
             console.error("Faltan elementos del simulador.");
             return;
        }

        // Obtener valores y parsear a números
        const C = parseFloat(lluviaInput.value);      // Clima (Lluvia)
        const P = parseFloat(obstruccionInput.value); // Obstrucción (Basura)
        const E = parseFloat(exposicionInput.value);  // Exposición (Vulnerabilidad local)
        const M = parseFloat(alcaldiaSelect.value);   // Multiplicador histórico (Alcaldía)

        // Aplicar la fórmula conceptual: R = C + P + E * M
        const R = C + P + (E * M);
        
        // Redondear el resultado a dos decimales
        const riesgoFinal = R.toFixed(2);
        
        let nivelRiesgo = 'Nivel Indefinido';
        let className = 'pending';

        // Clasificación de riesgo (Reglas definidas en el HTML)
        if (C === 0.0) {
            nivelRiesgo = `Riesgo CERO (${riesgoFinal})`;
            className = 'low'; // Se usa 'low' por el estilo verde/bajo
        } else if (R >= 6.0) {
            nivelRiesgo = `ALERTA ROJA (R=${riesgoFinal})`;
            className = 'high';
        } else if (R >= 4.0 && R < 6.0) {
            nivelRiesgo = `ALERTA NARANJA (R=${riesgoFinal})`;
            className = 'medium';
        } else if (R > 0.0 && R < 4.0) {
            nivelRiesgo = `ALERTA AMARILLA (R=${riesgoFinal})`;
            className = 'low';
        } else {
            nivelRiesgo = `Esperando Datos (R=${riesgoFinal})`;
            className = 'pending';
        }

        // Actualizar el DOM
        riesgoTexto.textContent = nivelRiesgo;
        riesgoTexto.className = 'risk-level ' + className;
    };
    
    // Se ejecuta al cargar para mostrar un resultado inicial (o "Esperando Datos")
    window.calcularRiesgo(); 
});
