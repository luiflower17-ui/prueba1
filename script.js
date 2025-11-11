// ===================================================================
// 1. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE
// ===================================================================
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

// ===================================================================
// 2. ACORDEÓN ESTÁNDAR (Solo permite una sección abierta a la vez)
// Aplica a Tipología y Prevención
// ===================================================================
// Nota: Excluimos la sección de problemas de este script para que funcione el hover
const details = document.querySelectorAll("details:not(.problema-card)"); 
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

// ===================================================================
// 3. SECCIÓN 1: PROBLEMAS (Apertura al pasar el ratón: HOVER)
// ===================================================================
const problemaDetails = document.querySelectorAll('.problema-card');

problemaDetails.forEach(detail => {
    // Evento para abrir al pasar el cursor
    detail.addEventListener('mouseenter', () => {
        // Cierra todos los demás detalles en la misma sección antes de abrir el actual
        problemaDetails.forEach(otherDetail => {
            if (otherDetail !== detail) {
                otherDetail.open = false;
            }
        });
        // Abre el detalle actual
        detail.open = true;
    });

    // Evento para cerrar al retirar el cursor
    detail.addEventListener('mouseleave', () => {
        // Cierra el detalle actual
        detail.open = false;
    });
});

// ===================================================================
// 4. ANIMACIÓN DE ENTRADA (Intersection Observer)
// ===================================================================
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.1, // El 10% del elemento debe estar visible
    rootMargin: "0px 0px -50px 0px" // Dispara un poco antes de llegar al final de la vista
};

const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('is-visible');
            appearOnScroll.unobserve(entry.target);
        }
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});


// ===================================================================
// 5. BOTÓN VOLVER ARRIBA (Scroll-to-Top)
// ===================================================================
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
