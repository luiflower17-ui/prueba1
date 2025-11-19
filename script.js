// 1. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE (HEADER)
const header = document.querySelector('header');
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled'); 
    } else {
        header.classList.remove('scrolled');
    }
    
    // También verifica si el botón de scroll debe aparecer
    if (window.scrollY > 300) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

// 2. LÓGICA DEL PANEL LATERAL INTERACTIVO
const navItems = document.querySelectorAll('.nav-item');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

function showContent(targetId, item) {
    const nextContent = document.getElementById(targetId);
    
    // Evita recargar el mismo contenido
    if (!nextContent || nextContent === currentActiveContent) return;

    // 1. Desactivar el contenido y nav item actual
    if (currentActiveContent) {
        currentActiveContent.classList.remove('active');
        // Ocultar después de la animación de salida (definida en CSS)
        setTimeout(() => {
            currentActiveContent.style.display = 'none';
            
            // 2. Mostrar el nuevo contenido con animación de entrada
            nextContent.style.display = 'block';
            void nextContent.offsetWidth; // Forzar reflow para reiniciar la animación
            nextContent.classList.add('active');
            currentActiveContent = nextContent;
            
            // Si el contenido es la sección de alcaldías, ejecutar la función de barras
            if (targetId === 'content-alcaldias') {
                animateAlcaldiasBars();
            }
        }, 300); // 300ms es el tiempo de la transición del CSS
    } else {
        // Lógica de inicialización al cargar la página
        detailContents.forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
        
        nextContent.style.display = 'block';
        void nextContent.offsetWidth;
        nextContent.classList.add('active');
        currentActiveContent = nextContent;

        if (targetId === 'content-alcaldias') {
            animateAlcaldiasBars();
        }
    }

    // Actualizar el estado activo del menú y ARIA
    navItems.forEach(i => {
        i.classList.remove('active');
        i.removeAttribute('aria-current');
    });
    item.classList.add('active');
    item.setAttribute('aria-current', 'page'); // Mejora la accesibilidad
}

// 3. FUNCIÓN PARA ANIMAR LAS BARRAS DE PROGRESO DE ALCALDÍAS
function animateAlcaldiasBars() {
    const alcaldias = document.querySelectorAll('.alcaldias-list li');
    alcaldias.forEach(li => {
        const percentage = li.getAttribute('data-percentage');
        // Inyecta el valor del atributo (ej: "19%") a la variable CSS --percentage
        li.style.setProperty('--percentage', percentage);
    });
}


// Inicializar al cargar: activa el primer elemento por defecto
document.addEventListener('DOMContentLoaded', () => {
    const initialItem = document.querySelector('.nav-item.active');
    if (initialItem) {
        showContent(initialItem.getAttribute('data-target'), initialItem);
    }
});

// Eventos (mouseenter y click) - Mantenidos según la solicitud original
navItems.forEach(item => {
    const targetId = item.getAttribute('data-target');
    
    // Mantiene el comportamiento original de mouseenter (navegación por hover)
    item.addEventListener('mouseenter', () => showContent(targetId, item));
    
    // Mantiene el comportamiento original de click
    item.addEventListener('click', (e) => { 
        e.preventDefault(); 
        showContent(targetId, item); 
    });
});

// 4. BOTÓN VOLVER ARRIBA
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});
