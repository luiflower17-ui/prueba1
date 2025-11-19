// ===============================================
// 1. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE (HEADER)
// ===============================================
const header = document.querySelector('header');
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

// ===============================================
// 2. LÓGICA DEL PANEL LATERAL INTERACTIVO (SIDEBAR Y CARRUSEL)
// ===============================================
const navItems = document.querySelectorAll('.nav-item');
const carouselCards = document.querySelectorAll('.carousel-card');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

function showContent(targetId, item) {
    const nextContent = document.getElementById(targetId);
    
    // Evita recargar el mismo contenido
    if (!nextContent || nextContent === currentActiveContent) return;

    // 1. Desactivar el contenido y nav item actual
    if (currentActiveContent) {
        currentActiveContent.classList.remove('active');
        // Usamos un pequeño timeout para que la animación de salida se complete
        setTimeout(() => {
            currentActiveContent.style.display = 'none';
            
            // 2. Mostrar el nuevo contenido con animación de entrada
            nextContent.style.display = 'block';
            void nextContent.offsetWidth; // Forzar reflow para reiniciar la animación
            nextContent.classList.add('active');
            currentActiveContent = nextContent;
            
            // Si el contenido es la sección de alcaldías, ejecutar la función de barras
            if (targetId === 'content-impacto') {
                animateAlcaldiasBars();
            }
        }, 300); 
    } else {
        // Lógica de inicialización al cargar la página
        detailContents.forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
        
        nextContent.style.display = 'block';
        void nextContent.offsetWidth;
        nextContent.classList.add('active');
        currentActiveContent = nextContent;

        if (targetId === 'content-impacto') {
            animateAlcaldiasBars();
        }
    }

    // Actualizar el estado activo del menú lateral y ARIA
    navItems.forEach(i => {
        i.classList.remove('active');
        i.removeAttribute('aria-current');
    });
    // Buscar y activar el item de navegación lateral correspondiente
    const targetNavItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
    if(targetNavItem) {
        targetNavItem.classList.add('active');
        targetNavItem.setAttribute('aria-current', 'page');
    }
}

// Inicializar al cargar: activa el primer elemento por defecto
document.addEventListener('DOMContentLoaded', () => {
    const initialItem = document.querySelector('.nav-item.active');
    if (initialItem) {
        showContent(initialItem.getAttribute('data-target'), initialItem);
    }
});

// Eventos para la navegación lateral (click para ser más accesible)
navItems.forEach(item => {
    item.addEventListener('click', (e) => { 
        e.preventDefault(); 
        showContent(item.getAttribute('data-target'), item); 
    });
});

// Eventos para las tarjetas del carrusel (click)
carouselCards.forEach(card => {
    card.addEventListener('click', () => { 
        showContent(card.getAttribute('data-target'), card); 
    });
});


// ------------------------------------
// Lógica de navegación del Carrusel
// ------------------------------------
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentCardIndex = 0;
// Ancho de la tarjeta + gap (330px + 20px = 350px, ajusta si cambias el CSS)
const cardWidth = 350; 

function moveToCard(index) {
    if (carouselTrack) {
        const offset = -index * cardWidth;
        carouselTrack.style.transform = `translateX(${offset}px)`;
    }
}

if (nextBtn && carouselTrack) {
    nextBtn.addEventListener('click', () => {
        const totalCards = carouselTrack.children.length;
        // Asumiendo que 3 tarjetas son visibles en desktop (1000px ancho / 350px card = 2.8)
        // La condición debe evitar que el carrusel se desplace demasiado lejos
        const maxIndex = totalCards - 3; 

        if (currentCardIndex < maxIndex) {
            currentCardIndex++;
            moveToCard(currentCardIndex);
        } else if (currentCardIndex >= maxIndex) {
            // Regresar al inicio opcionalmente
            currentCardIndex = 0; 
            moveToCard(currentCardIndex);
        }
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            moveToCard(currentCardIndex);
        }
    });
}


// ===============================================
// 3. FUNCIÓN DE SIMULACIÓN (calcularRiesgo) - NO MODIFICADA
// ===============================================
function calcularRiesgo() {
    // 1. Obtener valores de los inputs
    const M = parseFloat(document.getElementById('alcaldia-select').value);
    const C = parseFloat(document.getElementById('lluvia-input').value);
    const P = parseFloat(document.getElementById('obstruccion-input').value);
    const E = parseFloat(document.getElementById('exposicion-input').value);

    // 2. FÓRMULA CLAVE: R = C + P + (E × M)
    const R = C + P + (E * M);

    // 3. Clasificación de riesgo
    let riesgoText;
    let riesgoClass;

    // Estos límites deben coincidir con la documentación (Sección 8)
    if (R >= 8.5) {
        riesgoText = "Riesgo: PELIGRO CATASTRÓFICO";
        riesgoClass = "catastrophic";
    } else if (R >= 6.0) {
        riesgoText = "Riesgo: ALTO";
        riesgoClass = "high";
    } else if (R >= 4.0) {
        riesgoText = "Riesgo: MEDIO";
        riesgoClass = "medium";
    } else {
        riesgoText = "Riesgo: BAJO";
        riesgoClass = "low";
    }

    // 4. Actualizar el display
    const riesgoTextoEl = document.getElementById('riesgo-texto');
    const riesgoValorEl = document.getElementById('riesgo-valor');
    
    riesgoTextoEl.textContent = riesgoText;
    riesgoTextoEl.className = `risk-level ${riesgoClass}`; 
    riesgoValorEl.innerHTML = `Fórmula: R = C + P + (E &times; M) | Valor R: ${R.toFixed(2)}`;
}


// ===============================================
// 4. FUNCIÓN PARA ANIMAR LAS BARRAS DE PROGRESO DE ALCALDÍAS
// ===============================================
function animateAlcaldiasBars() {
    const alcaldias = document.querySelectorAll('.alcaldias-list li');
    alcaldias.forEach(li => {
        const percentage = li.getAttribute('data-percentage');
        // Inyecta el valor del atributo (ej: "19%") a la variable CSS --percentage
        li.style.setProperty('--percentage', percentage);
    });
}


// ===============================================
// 5. BOTÓN VOLVER ARRIBA
// ===============================================
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
