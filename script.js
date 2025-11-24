document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // A. LÓGICA DEL CAMBIO DE TEMA Y ALMACENAMIENTO (LOCALSTORAGE)
    // ==========================================================
    const checkbox = document.getElementById('theme-checkbox');
    const root = document.documentElement; // El elemento <html>
    const themeLabel = document.getElementById('theme-label');

    // Función para aplicar el tema
    function applyTheme(isLight) {
        if (isLight) {
            root.classList.add('light-mode');
            themeLabel.textContent = 'Modo Oscuro';
            localStorage.setItem('theme', 'light');
        } else {
            root.classList.remove('light-mode');
            themeLabel.textContent = 'Modo Claro';
            localStorage.setItem('theme', 'dark');
        }
    }

    // Cargar la preferencia del usuario al inicio
    const savedTheme = localStorage.getItem('theme');
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

    // ==========================================================
    // B. LÓGICA DEL SIMULADOR Y ALGORITMO
    // ==========================================================
    
    const cValueInput = document.getElementById('c-value');
    const pValueInput = document.getElementById('p-value');
    const eValueInput = document.getElementById('e-value');
    const calculateBtn = document.getElementById('calculate-btn');
    const riskResultDiv = document.getElementById('risk-result');
    const riskOutput = document.getElementById('risk-output');
    const cLabel = document.getElementById('c-label');
    const pLabel = document.getElementById('p-label');
    const eLabel = document.getElementById('e-label');

    // Mapeo de valores numéricos a etiquetas descriptivas
    function getLabel(value) {
        const labels = {
            '0': 'Nulo/Mínimo',
            '1': 'Bajo/Moderado',
            '2': 'Medio/Alto',
            '3': 'Crítico/Extremo'
        };
        return value + " (" + labels[value] + ")";
    }

    function updateLabels() {
        cLabel.textContent = getLabel(cValueInput.value);
        pLabel.textContent = getLabel(pValueInput.value);
        eLabel.textContent = getLabel(eValueInput.value);
    }

    function calcularRiesgo() {
        const C = parseFloat(cValueInput.value);
        const P = parseFloat(pValueInput.value);
        const E = parseFloat(eValueInput.value);

        // Algoritmo de Lógica Difusa Simplificado (para demostración)
        // Multiplicador: El riesgo es el producto de las 3 variables, con P y E teniendo más peso.
        // Se escala a un máximo teórico de 5.0 (Riesgo total: 3*3*3 = 27 -> escalado / 5.4)
        
        // Ponderación de variables:
        // C (Capacidad) actúa como atenuador: Menos C = Mayor Riesgo. Se invierte: (3 - C)
        const C_Inverso = 3 - C; // C=0 -> 3; C=3 -> 0
        const P_Factor = P * 1.5; // La lluvia es un factor importante
        const E_Factor = E * 1.2; // La exposición amplifica el riesgo

        // Riesgo Bruto (Max. teórico: (3*1.5 + 3*1.2) * (3-0) = 8.1 * 3 = 24.3)
        let riesgoBruto = (P_Factor + E_Factor) * C_Inverso; 
        
        // Escalar el resultado a un rango de 0.0 a 5.0 (Máximo teórico 24.3 / 4.86 = 5.0)
        let riesgoFinal = Math.min(5.0, riesgoBruto / 4.86); 
        
        // Redondear a un decimal
        riesgoFinal = riesgoFinal.toFixed(1);

        let riskClass = '';
        let riskText = '';

        if (riesgoFinal <= 1.0) {
            riskClass = 'zero';
            riskText = `BAJO (Seguro)`;
        } else if (riesgoFinal <= 2.5) {
            riskClass = 'low';
            riskText = `MODERADO`;
        } else if (riesgoFinal <= 4.0) {
            riskClass = 'medium';
            riskText = `ALTO`;
        } else {
            riskClass = 'high';
            riskText = `CRÍTICO`;
        }

        // Actualizar la interfaz
        riskResultDiv.className = 'risk-level ' + riskClass;
        riskOutput.innerHTML = `${riskText} <br> (${riesgoFinal} / 5.0)`;
    }

    // Event Listeners para el simulador
    cValueInput.addEventListener('input', updateLabels);
    pValueInput.addEventListener('input', updateLabels);
    eValueInput.addEventListener('input', updateLabels);
    
    // Botón de cálculo
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calcularRiesgo);
    }
    
    // Asegurar que las etiquetas se actualicen al cargar y al cambiar de pestaña
    updateLabels();

    // ==========================================================
    // C. LÓGICA DE NAVEGACIÓN Y CARRUSEL
    // ==========================================================
    
    const contentDetails = document.querySelectorAll('.content-detail');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const carouselCards = document.querySelectorAll('.carousel-card');

    function showContent(targetId) {
        // Desactivar todos
        contentDetails.forEach(detail => detail.classList.remove('active'));
        sidebarItems.forEach(item => item.classList.remove('active'));

        // Activar el contenido y el item del sidebar
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.classList.add('active');
        }
        document.querySelector(`.sidebar-item[data-target="${targetId}"]`)?.classList.add('active');
        
        // Si el contenido activo es el simulador, calcular el riesgo al mostrar
        if (targetId === 'content-algoritmo') {
            calcularRiesgo(); 
        }
    }

    // 1. Navegación del Sidebar
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            showContent(targetId);
        });
    });

    // 2. Navegación del Carrusel
    carouselCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            showContent(targetId);
        });
    });
    
    // Lógica del Carrusel (Scroll Horizontal)
    const carouselContainer = document.querySelector('.carousel-cards');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const scrollAmount = 300; // Cuánto desplazar

    if (carouselContainer) {
        prevBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    // 3. Scroll to Top
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    window.onscroll = function() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };

    scrollToTopBtn.addEventListener('click', function() {
        document.body.scrollTop = 0; // Para Safari
        document.documentElement.scrollTop = 0; // Para Chrome, Firefox, IE y Opera
    });

    // Mostrar el contenido inicial (Introducción)
    showContent('content-introduccion');
});
