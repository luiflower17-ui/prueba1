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
const detailPanel = document.getElementById('detail-panel');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

// Función para mostrar el contenido con animación
function showContent(targetId, item) {
    const nextContent = document.getElementById(targetId);

    if (nextContent && nextContent !== currentActiveContent) {
        // 1. Desactivar y animar salida del contenido actual (si existe)
        if (currentActiveContent) {
            currentActiveContent.classList.remove('active');
            // Nota: El display:none es crucial para evitar que el contenido oculto ocupe espacio
            // Se realiza después del fade-out para permitir la animación
            setTimeout(() => {
                detailContents.forEach(content => content.style.display = 'none');
                
                // 2. Activar y animar entrada del nuevo contenido
                nextContent.style.display = 'block';
                // Forzar reflow/repaint antes de aplicar la clase 'active' para reiniciar la transición
                nextContent.offsetHeight; 
                nextContent.classList.add('active');
                currentActiveContent = nextContent;
            }, 350); // Tiempo ligeramente mayor que la transición CSS (0.4s)
        } else {
            // Caso inicial (al cargar la página)
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

// Inicializa el primer elemento como activo y lo muestra
if (navItems.length > 0) {
    const initialTarget = navItems[0].getAttribute('data-target');
    showContent(initialTarget, navItems[0]); 
}

navItems.forEach(item => {
    const targetId = item.getAttribute('data-target');
    
    // Evento de mouse: al pasar el cursor (Hover)
    item.addEventListener('mouseenter', () => {
        showContent(targetId, item);
    });

    // Evento de click: (Para navegadores móviles)
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

    // Opcional: Cerrar al salir (puede ser molesto, lo dejamos comentado para prueba)
    /*
    detail.addEventListener('mouseleave', () => {
        detail.open = false;
    });
    */
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
