// --- JAVASCRIPT: Animación 1: Fade-in del contenido al cargar la página ---
window.addEventListener('load', () => {
    // 1. Elimina la clase 'preload' para activar las transiciones
    document.body.classList.remove('preload');
    
    // 2. Hace visible el contenido principal (main)
    const mainContent = document.querySelector('main');
    mainContent.classList.remove('hidden-on-load');
    mainContent.classList.add('visible-on-load');
});
// -------------------------------------------------------------------------

// --- JAVASCRIPT: Menú Flotante ---
const header = document.querySelector('header');
const scrollThreshold = 100; 

function handleScroll() {
    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleScroll);
// -------------------------------------------------------------------

// --- JAVASCRIPT: Control del Acordeón (Detalles) ---
const details = document.querySelectorAll("details");
details.forEach((targetDetail) => {
    targetDetail.addEventListener("toggle", () => {
        if (targetDetail.open) {
            details.forEach((detail) => {
                if (detail !== targetDetail) {
                    detail.open = false;
                }
            });
        }
    });
});

// --- JAVASCRIPT: Botón Volver Arriba ---
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
const scrollDistance = 300; 

// Muestra/Oculta el botón
window.addEventListener("scroll", () => {
    if (window.scrollY > scrollDistance) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

// Función de scroll suave al hacer clic
scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth" 
    });
});
// -------------------------------------------------------------------


// --- JAVASCRIPT: Animación 2: Detectar elementos visibles al hacer scroll ---
const scrollRevealElements = document.querySelectorAll('.reveal-on-scroll');

const checkVisibility = () => {
    scrollRevealElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        
        // El elemento se revela cuando el 80% de la ventana ya ha pasado
        const revealPoint = window.innerHeight * 0.8; 

        if (rect.top < revealPoint) {
            element.classList.add('is-visible');
        } else {
            // Elimina la clase si se hace scroll hacia arriba (para reanimar)
            element.classList.remove('is-visible');
        }
    });
};

// Ejecuta la función al hacer scroll y al cargar
window.addEventListener('scroll', checkVisibility);
window.addEventListener('load', checkVisibility); 
// -------------------------------------------------------------
