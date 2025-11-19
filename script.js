// 1. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE
const header = document.querySelector('header');
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
        // Añade la clase 'scrolled' para cambiar el padding y el tamaño del título vía CSS
        header.classList.add('scrolled'); 
    } else {
        header.classList.remove('scrolled');
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
        }, 300); // 300ms es el tiempo de la transición del CSS
    } else {
        // Lógica de inicialización al cargar la página
        detailContents.forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
        
        nextContent.style.display = 'block';
        void nextContent.offsetWidth;
        nextContent.classList.add('active');
        currentActiveContent = nextContent;
    }

    // Actualizar el estado activo del menú y ARIA
    navItems.forEach(i => {
        i.classList.remove('active');
        i.removeAttribute('aria-current');
    });
    item.classList.add('active');
    item.setAttribute('aria-current', 'page'); // Mejora la accesibilidad
}

// Inicializar al cargar: activa el primer elemento por defecto
document.addEventListener('DOMContentLoaded', () => {
    const initialItem = document.querySelector('.nav-item.active');
    if (initialItem) {
        showContent(initialItem.getAttribute('data-target'), initialItem);
    }
});

// Eventos (Mantenemos mouseenter y click como se especificó en el código original)
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

// 3. BOTÓN VOLVER ARRIBA
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
    window.scrollTo({ top: 0, behavior: "smooth" });
});
