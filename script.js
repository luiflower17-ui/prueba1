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
        if (!cValueInput || !pValueInput || !eValueInput) return; 
        
        if (cLabel) cLabel.textContent = getLabel(cValueInput.value);
        if (pLabel) pLabel.textContent = getLabel(pValueInput.value);
        if (eLabel) eLabel.textContent = getLabel(eValueInput.value);
        
        calcularRiesgo(); 
    }

    function calcularRiesgo() {
        if (!cValueInput || !pValueInput || !eValueInput) return; 

        const C = parseFloat(cValueInput.value);
        const P = parseFloat(pValueInput.value);
        const E = parseFloat(eValueInput.value);

        const C_Inverso = 3 - C; 
        const P_Factor = P * 1.5; 
        const E_Factor = E * 1.2; 

        let riesgoBruto = (P_Factor + E_Factor) * C_Inverso; 
        
        let riesgoFinal = Math.min(5.0, riesgoBruto / 4.86); 
        
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

        if (riskResultDiv) riskResultDiv.className = 'risk-level ' + riskClass;
        if (riskOutput) riskOutput.innerHTML = `${riskText} <br> (${riesgoFinal} / 5.0)`;
    }

    // Event Listeners para el simulador
    if (cValueInput && pValueInput && eValueInput) {
        cValueInput.addEventListener('input', updateLabels);
        pValueInput.addEventListener('input', updateLabels);
        eValueInput.addEventListener('input', updateLabels);
    }
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calcularRiesgo);
    }
    
    // ==========================================================
    // C. LÓGICA DE NAVEGACIÓN Y CARRUSEL (CORREGIDA)
    // ==========================================================
    
    const contentDetails = document.querySelectorAll('.content-detail');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const carouselCards = document.querySelectorAll('.carousel-card');

    function showContent(targetId) {
        // Desactivar todos los contenidos
        contentDetails.forEach(detail => detail.classList.remove('active'));
        
        // Desactivar todos los items del sidebar
        sidebarItems.forEach(item => item.classList.remove('active'));

        // Activar el contenido y el item del sidebar correspondiente
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.classList.add('active');
        }
        
        // Usar la coincidencia de data-target para activar el menú lateral
        document.querySelector(`.sidebar-item[data-target="${targetId}"]`)?.classList.add('active');
        
        // Si el contenido activo es el simulador, inicializar la simulación
        if (targetId === 'content-algoritmo' && cValueInput) {
            updateLabels(); 
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
    const scrollAmount = 300; 

    if (carouselContainer) {
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                carouselContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                carouselContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    }

    // 3. Scroll to Top (Se mantiene la lógica anterior)
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    window.onscroll = function() {
        if (scrollToTopBtn) {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        }
    };

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            document.body.scrollTop = 0; 
            document.documentElement.scrollTop = 0; 
        });
    }

    // ** [CORRECCIÓN APLICADA AQUÍ] **
    // Mostrar el contenido inicial (Introducción) SOLO después de que todos los listeners estén listos.
    showContent('content-introduccion');
});
