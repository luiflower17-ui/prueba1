document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // A. LÓGICA DEL CAMBIO DE TEMA Y ALMACENAMIENTO (CORREGIDA)
    // ==========================================================
    const checkbox = document.getElementById('theme-checkbox');
    const root = document.documentElement; 
    const themeLabel = document.getElementById('theme-label');

    // Función que aplica el tema y ajusta el texto
    function applyTheme(isLight) {
        if (isLight) {
            root.classList.add('light-mode');
            // Si está en modo claro, la etiqueta debe decir que cambia a oscuro
            if (themeLabel) themeLabel.textContent = 'Activar Modo Oscuro'; 
            localStorage.setItem('theme', 'light');
        } else {
            root.classList.remove('light-mode');
            // Si está en modo oscuro, la etiqueta debe decir que cambia a claro
            if (themeLabel) themeLabel.textContent = 'Activar Modo Claro'; 
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
            checkbox.checked = false; // Asegurar que el checkbox refleje el modo inicial
            applyTheme(false); 
        }
        
        // Manejar el evento de cambio
        checkbox.addEventListener('change', function() {
            applyTheme(this.checked);
        });
    }

    // ==========================================================
    // B. LÓGICA DEL SIMULADOR Y ALGORITMO (Se mantiene la última versión funcional)
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

    function getLabel(value) {
        const labels = {
            '0': 'Nulo/Mínimo', '1': 'Bajo/Moderado',
            '2': 'Medio/Alto', '3': 'Crítico/Extremo'
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
            riskClass = 'zero'; riskText = `BAJO (Seguro)`;
        } else if (riesgoFinal <= 2.5) {
            riskClass = 'low'; riskText = `MODERADO`;
        } else if (riesgoFinal <= 4.0) {
            riskClass = 'medium'; riskText = `ALTO`;
        } else {
            riskClass = 'high'; riskText = `CRÍTICO`;
        }

        if (riskResultDiv) riskResultDiv.className = 'risk-level ' + riskClass;
        if (riskOutput) riskOutput.innerHTML = `${riskText} <br> (${riesgoFinal} / 5.0)`;
    }

    if (cValueInput && pValueInput && eValueInput) {
        cValueInput.addEventListener('input', updateLabels);
        pValueInput.addEventListener('input', updateLabels);
        eValueInput.addEventListener('input', updateLabels);
    }
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calcularRiesgo);
    }
    
    // ==========================================================
    // C. LÓGICA DE NAVEGACIÓN Y CARRUSEL (APARTADOS CORREGIDOS)
    // ==========================================================
    
    const contentDetails = document.querySelectorAll('.content-detail');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const carouselCards = document.querySelectorAll('.carousel-card');

    function showContent(targetId) {
        // Ocultar todos los contenidos
        contentDetails.forEach(detail => detail.classList.remove('active'));
        // Desactivar todos los items del sidebar
        sidebarItems.forEach(item => item.classList.remove('active'));

        // Mostrar el contenido objetivo
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.classList.add('active');
        }
        
        // Activa el item del sidebar usando el atributo data-target
        document.querySelector(`.sidebar-item[data-target="${targetId}"]`)?.classList.add('active');
        
        // Inicializar el simulador si entramos a la sección
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
    
    // Lógica del Carrusel (Scroll Horizontal) - Se mantiene
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

    // 3. Scroll to Top - Se mantiene
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

    // Inicializa la vista en "Introducción"
    showContent('content-introduccion');
});
