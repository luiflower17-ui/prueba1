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
// 2. LÓGICA DEL PANEL LATERAL INTERACTIVO (8 TEMAS)
// ===================================================================
const navItems = document.querySelectorAll('.nav-item');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

// Función para mostrar el contenido con animación
function showContent(targetId, item) {
    const nextContent = document.getElementById(targetId);

    if (!nextContent || nextContent === currentActiveContent) {
        return; 
    }

    // 1. Desactivar y animar salida del contenido actual
    if (currentActiveContent) {
        currentActiveContent.classList.remove('active');
        
        // Retraso para permitir que la transición CSS de salida se complete
        setTimeout(() => {
            currentActiveContent.style.display = 'none';
            
            // 2. Activar y animar entrada del nuevo contenido
            nextContent.style.display = 'block';
            void nextContent.offsetWidth; // Forzar reflow para reiniciar la animación
            nextContent.classList.add('active');
            currentActiveContent = nextContent;
        }, 400); // Coincide con el tiempo de transición CSS (0.6s)
    } else {
        // Caso inicial (al cargar la página)
        detailContents.forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
        });
        
        nextContent.style.display = 'block';
        void nextContent.offsetWidth; 
        nextContent.classList.add('active');
        currentActiveContent = nextContent;
    }

    // Manejar el estado activo del botón de navegación
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
}

// Inicializa el sistema: Muestra el primer contenido al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const initialItem = document.querySelector('.nav-item.active'); 
    if (initialItem) {
        const initialTarget = initialItem.getAttribute('data-target');
        // Usamos showContent para inicializar correctamente el estado activo
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
