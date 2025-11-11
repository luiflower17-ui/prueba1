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
// 2. LÓGICA DEL PANEL LATERAL INTERACTIVO (Sección 1)
// ===================================================================
const navItems = document.querySelectorAll('.nav-item');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

// Función para mostrar el contenido con animación
function showContent(targetId, item) {
    const nextContent = document.getElementById(targetId);

    // Solo procede si el contenido es diferente al que ya está activo
    if (nextContent && nextContent !== currentActiveContent) {
        
        // 1. Desactivar y animar salida del contenido actual (si existe)
        if (currentActiveContent) {
            // Inicia la transición CSS (opacity y transform) para el contenido que sale
            currentActiveContent.classList.remove('active');
            
            // Retrasa el cambio de display para permitir que la animación se complete
            setTimeout(() => {
                currentActiveContent.style.display = 'none';
                
                // 2. Activar y animar entrada del nuevo contenido
                nextContent.style.display = 'block';
                // Forzar reflow/repaint antes de aplicar la clase 'active' para reiniciar la transición
                nextContent.offsetHeight; 
                nextContent.classList.add('active');
                currentActiveContent = nextContent;
            }, 350); // Tiempo ligeramente menor que la transición CSS (0.4s) para asegurar la continuidad
        } else {
            // Caso inicial (al cargar la página): Mostrar el primero sin animación de salida
            detailContents.forEach(content => content.style.display = 'none');
            nextContent.style.display = 'block';
            nextContent.offsetHeight; 
            nextContent.classList.add('active');
            currentActiveContent = nextContent;
        }

        // Manejar el estado activo del botón de navegación
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    }
}

// Inicializa el sistema: Muestra el primer contenido y establece el currentActiveContent
// Esto garantiza que al cargar la página, el contenido de "Tipos de inundaciones" esté visible.
document.addEventListener('DOMContentLoaded', () => {
    const initialItem = document.querySelector('.nav-item.active');
    if (initialItem) {
        const initialTarget = initialItem.getAttribute('data-target');
        showContent(initialTarget, initialItem);
    }
});


navItems.forEach(item => {
    const targetId = item.getAttribute('data-target');
    
    // Evento de mouse: al pasar el cursor (Hover)
    item.addEventListener('mouseenter', () => {
        showContent(targetId, item);
    });

    // Evento de click: (Para navegadores móviles y fallback)
    item.addEventListener('click', (e) => {
        e.preventDefault();
        showContent(targetId, item);
    });
});


// ===================================================================
// 3. ACORDEÓN INTERACTIVO (Para secciones 2, 3, 6, 7)
// ===================================================================
const problemaDetails = document.querySelectorAll('.problema-card');

problemaDetails.forEach(detail => {
    detail.addEventListener('mouseenter', () => {
        // Cierra todos los demás detalles abiertos en la misma sección
        detail.closest('section').querySelectorAll('.problema-card').forEach(otherDetail => {
            if (otherDetail !== detail) {
                otherDetail.open = false;
            }
        });
        // Abre el detalle actual
        detail.open = true;
    });

    detail.addEventListener('mouseleave', () => {
        // Cierra el detalle actual al retirar el cursor
        detail.open = false;
    });
});


// ===================================================================
// 4. ANIMACIÓN DE ENTRADA (Intersection Observer)
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
// 5. BOTÓN VOLVER ARRIBA (Scroll-to-Top)
// ===================================================================
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
const scrollDistance = 300; 

window.addEventListener("scroll", () => {
    if (window.scrollY > scrollDistance) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
