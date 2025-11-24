<script>
    // **********************************************
    // LÓGICA DE INTERACCIÓN, NAVEGACIÓN Y TEMA
    // **********************************************
    document.addEventListener('DOMContentLoaded', () => {
        
        // ==========================================================
        // A. LÓGICA EL CAMBIO DE TEMA Y ALMACENAMIENTO (LOCALSTORAGE)
        // ==========================================================
        const checkbox = document.getElementById('theme-checkbox');
        const root = document.documentElement; // El elemento <html>
        const themeLabel = document.getElementById('theme-label');

        // Función para aplicar el tema
        function applyTheme(isLight) {
            if (isLight) {
                root.classList.add('light-mode');
                if (themeLabel) themeLabel.textContent = 'Modo Oscuro';
                localStorage.setItem('theme', 'light');
            } else {
                root.classList.remove('light-mode');
                if (themeLabel) themeLabel.textContent = 'Modo Claro';
                localStorage.setItem('theme', 'dark');
            }
        }

        // Cargar la preferencia del usuario al inicio
        const savedTheme = localStorage.getItem('theme');
        if (checkbox) {
            if (savedTheme === 'light') {
                checkbox.checked = true;
                applyTheme(true);
            } else {
                // Por defecto, aplica el modo oscuro
                applyTheme(false); 
            }
            
            // Manejar el evento de cambio
            checkbox.addEventListener('change', function() {
                applyTheme(this.checked);
            });
        }


        // ==========================================================
        // B. LÓGICA DE NAVEGACIÓN Y CARRUSEL
        // ==========================================================
        const carouselCards = document.querySelectorAll('.carousel-card');
        const detailSections = document.querySelectorAll('.content-detail');
        const clickSound = document.getElementById('click-sound');

        // Función para cambiar la sección visible
        const showSection = (targetId) => {
            detailSections.forEach(section => {
                section.classList.remove('active');
            });
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Actualizar el estado 'active' en las tarjetas del carrusel
            carouselCards.forEach(card => {
                card.classList.remove('active-card');
                if (card.getAttribute('data-target') === targetId) {
                    card.classList.add('active-card');
                }
            });

            // Forzar el desplazamiento al inicio del panel de detalles
            const detailPanel = document.getElementById('detail-panel');
            if (detailPanel) {
                detailPanel.scrollTop = 0;
            }
            
            // Si es la sección del simulador, ejecutar cálculo inicial
            if (targetId === 'content-algoritmo') {
                // Se llama la función que está definida globalmente
                window.calcularRiesgo(); 
            }
        };

        // Escuchadores de eventos para las tarjetas del carrusel
        carouselCards.forEach(card => {
            card.addEventListener('click', () => {
                if (clickSound) {
                    clickSound.play().catch(e => console.log("Audio play prevented: ", e));
                }
                const targetId = card.getAttribute('data-target');
                // La variable targetId contiene el ID correcto de la sección (ej. "content-problema")
                showSection(targetId);
            });
        });

        // Lógica de navegación del carrusel
        const carouselTrack = document.getElementById('carousel-track');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        let currentIndex = 0;
        // La tarjeta tiene un ancho de 200px + 20px de margen = 220px
        const cardWidth = 220; 
        const maxIndex = carouselCards.length - 1;

        const updateCarouselPosition = () => {
             // Calcula el desplazamiento solo para la tarjeta actual
            carouselTrack.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        };

        nextBtn.addEventListener('click', () => {
            if (clickSound) {
                clickSound.play().catch(e => console.log("Audio play prevented: ", e));
            }
            if (currentIndex < maxIndex) { 
                currentIndex++;
            } else {
                currentIndex = 0; // Loop al inicio
            }
            updateCarouselPosition();
        });

        prevBtn.addEventListener('click', () => {
            if (clickSound) {
                clickSound.play().catch(e => console.log("Audio play prevented: ", e));
            }
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = maxIndex; // Loop al final
            }
            updateCarouselPosition();
        });

        // Inicializar mostrando la primera sección
        if (carouselCards.length > 0) {
            const initialTarget = carouselCards[0].getAttribute('data-target');
            showSection(initialTarget);
        }

        // ==========================================================
        // C. MANEJO DE INPUTS DEL SIMULADOR (Para actualizar al mover slider)
        // ==========================================================
        const lluviaInput = document.getElementById('lluvia-input');
        const obstruccionInput = document.getElementById('obstruccion-input');
        const exposicionInput = document.getElementById('exposicion-input');
        const alcaldiaSelect = document.getElementById('alcaldia-select');
        
        // Función para actualizar los valores de la simulación al cambiar cualquier input
        function updateSimulationState() {
            // Se asegura de que los span de valor se actualicen 
            document.getElementById('lluvia-val').textContent = lluviaInput.value;
            document.getElementById('obstruccion-val').textContent = obstruccionInput.value;
            document.getElementById('exposicion-val').textContent = exposicionInput.value;
            
            // Llamar a la función de cálculo inmediatamente
            window.calcularRiesgo(); 
        }

        if (lluviaInput && obstruccionInput && exposicionInput && alcaldiaSelect) {
            // Ejecutar cálculo al cambiar cualquier input (slider o select)
            lluviaInput.addEventListener('input', updateSimulationState);
            obstruccionInput.addEventListener('input', updateSimulationState);
            exposicionInput.addEventListener('input', updateSimulationState);
            alcaldiaSelect.addEventListener('change', updateSimulationState);
        }
    });

    // **********************************************
    // LÓGICA DE LA SIMULACIÓN (Global, llamada por HTML y JS)
    // **********************************************
    // Se mantiene global para ser llamada por el 'onclick' del botón en el HTML.
    window.calcularRiesgo = function() {
        const C = parseFloat(document.getElementById('lluvia-input').value); // Clima/Lluvia
        const P = parseFloat(document.getElementById('obstruccion-input').value); // Obstrucción/Basura
        const E = parseFloat(document.getElementById('exposicion-input').value); // Exposición/Vulnerabilidad
        const M = parseFloat(document.getElementById('alcaldia-select').value); // Multiplicador de riesgo (M)
        const resultadoDiv = document.getElementById('riesgo-texto');
        const resultadoSim = document.getElementById('sim-result');

        // Fórmula conceptual: R = C + P + E * M
        const R = C + P + (E * M);

        let nivelRiesgo = "";
        let colorClass = "";

        if (C === 0.0) {
            nivelRiesgo = "Riesgo Cero";
            colorClass = "risk-zero"; // Verde
        } else if (R < 4.0) {
            nivelRiesgo = "Riesgo Bajo (Amarillo)";
            colorClass = "risk-low"; // Amarillo
        } else if (R >= 4.0 && R < 6.0) {
            nivelRiesgo = "Riesgo Medio (Naranja)";
            colorClass = "risk-medium"; // Naranja
        } else { // R >= 6.0
            nivelRiesgo = "Riesgo Alto (Rojo)";
            colorClass = "risk-high"; // Rojo
        }

        resultadoDiv.textContent = `${nivelRiesgo} | Valor R: ${R.toFixed(2)}`;
        resultadoDiv.className = colorClass; // Aplicar clase de color

        // Mostrar el resultado de la simulación
        resultadoSim.style.display = 'block';

        // Opcional: Sonido al calcular (si se incluyó en el HTML)
        const clickSound = document.getElementById('click-sound');
        if (clickSound) {
            clickSound.currentTime = 0; // Reinicia el sonido si se hace clic muy rápido
            clickSound.play().catch(e => console.log("Audio play prevented: ", e));
        }
    }
</script>

