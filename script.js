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
// 2. ACORDEÓN INTERACTIVO (Aplica a TODAS las tarjetas con la clase .problema-card)
// Solo permite que una tarjeta esté abierta a la vez.
// ===================================================================
const problemaDetails = document.querySelectorAll('.problema-card');

problemaDetails.forEach(detail => {
    // Evento para abrir al pasar el cursor (Hover)
    detail.addEventListener('mouseenter', () => {
        // Cierra todos los demás detalles abiertos en la página
        problemaDetails.forEach(otherDetail => {
            if (otherDetail !== detail) {
                otherDetail.open = false;
            }
        });
        // Abre el detalle actual
        detail.open = true;
    });

    // Evento para cerrar al retirar el cursor (Salida del Hover)
    detail.addEventListener('mouseleave', () => {
        // Cierra el detalle actual
        detail.open = false;
    });
});

// ===================================================================
// 3. ANIMACIÓN DE ENTRADA (Intersection Observer)
// ===================================================================
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.1, 
    rootMargin: "0px 0px -50px 0px" 
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
// 4. BOTÓN VOLVER ARRIBA (Scroll-to-Top)
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
