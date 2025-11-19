// ===============================================
// 1. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE (HEADER Y SCROLL)
// ===============================================
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.addEventListener('scroll', () => {
    // Muestra el botón de scroll al bajar
    if (window.scrollY > 300) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});


// ===============================================
// 2. LÓGICA DEL PANEL INTERACTIVO (CARRUSEL)
// ===============================================
const carouselCards = document.querySelectorAll('.carousel-card');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

function showContent(targetId) {
    const nextContent = document.getElementById(targetId);
    
    // Evita recargar el mismo contenido
    if (!nextContent || nextContent === currentActiveContent) return;

    // 1. Desactivar el contenido actual
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
}

// Inicializar al cargar: activa el primer elemento por defecto
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el ID del primer contenido (content-problema)
    const initialTargetId = detailContents[0]?.id; 
    if (initialTargetId) {
        showContent(initialTargetId);
    }
});

// Eventos para las tarjetas del carrusel (click)
carouselCards.forEach(card => {
    card.addEventListener('click', () => { 
        // Ocultar la tarjeta de carga de la simulación si se navega a otro lado
        if (card.getAttribute('data-target') !== 'content-algoritmo') {
            document.getElementById('riesgo-texto').textContent = "Esperando datos...";
            document.getElementById('riesgo-texto').className = `risk-level pending`; 
        }

        showContent(card.getAttribute('data-target')); 
    });
});


// ------------------------------------
// Lógica de navegación del Carrusel
// ------------------------------------
const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentCardIndex = 0;
// Ancho de la tarjeta + gap (330px + 20px = 350px)
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
        // Asumiendo que 3 tarjetas son visibles en desktop (ajuste para no mostrar espacio vacío)
        const maxIndex = totalCards - 3; 

        if (currentCardIndex < maxIndex) {
            currentCardIndex++;
            moveToCard(currentCardIndex);
        } else if (currentCardIndex >= maxIndex) {
            // Regresar al inicio
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
// 3. FUNCIÓN DE SIMULACIÓN (calcularRiesgo) - Lógica de riesgo actualizada
// ===============================================
function calcularRiesgo() {
    // 1. Obtener valores de los inputs
    const M = parseFloat(document.getElementById('alcaldia-select').value);
    const C = parseFloat(document.getElementById('lluvia-input').value);
    const P = parseFloat(document.getElementById('obstruccion-input').value);
    const E = parseFloat(document.getElementById('exposicion-input').value);

    // 2. FÓRMULA CLAVE: R = C + P + (E × M)
    const R = C + P + (E * M);

    // 3. Clasificación de riesgo (Actualizada según solicitud: Cero, Bajo, Medio, Alto)
    let riesgoText;
    let riesgoClass;

    if (R >= 6.0) {
        riesgoText = "Riesgo: ALTO"; // ROJO
        riesgoClass = "high";
    } else if (R >= 4.0) {
        riesgoText = "Riesgo: MEDIO"; // NARANJA
        riesgoClass = "medium";
    } else if (R >= 2.0) {
        riesgoText = "Riesgo: BAJO"; // AMARILLO
        riesgoClass = "low";
    } else {
        riesgoText = "Riesgo: CERO RIESGO"; // VERDE
        riesgoClass = "zero";
    }

    // 4. Actualizar el display
    const riesgoTextoEl = document.getElementById('riesgo-texto');
    
    // Muestra el valor R y la clasificación en el texto principal
    riesgoTextoEl.textContent = `${riesgoText} (Valor R: ${R.toFixed(2)})`;
    riesgoTextoEl.className = `risk-level ${riesgoClass}`; 
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
