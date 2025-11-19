// 1. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE
const header = document.querySelector('header');
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
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
    
    if (!nextContent || nextContent === currentActiveContent) return;

    // Animar salida del contenido actual
    if (currentActiveContent) {
        currentActiveContent.classList.remove('active');
        setTimeout(() => {
            currentActiveContent.style.display = 'none';
            
            // Animar entrada del nuevo contenido
            nextContent.style.display = 'block';
            void nextContent.offsetWidth; // Forzar reflow
            nextContent.classList.add('active');
            currentActiveContent = nextContent;
        }, 300); // Tiempo ajustado para ser más ágil
    } else {
        // Inicialización
        detailContents.forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
        nextContent.style.display = 'block';
        void nextContent.offsetWidth;
        nextContent.classList.add('active');
        currentActiveContent = nextContent;
    }

    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    const initialItem = document.querySelector('.nav-item.active');
    if (initialItem) {
        showContent(initialItem.getAttribute('data-target'), initialItem);
    }
});

// Eventos
navItems.forEach(item => {
    const targetId = item.getAttribute('data-target');
    item.addEventListener('mouseenter', () => showContent(targetId, item));
    item.addEventListener('click', (e) => { e.preventDefault(); showContent(targetId, item); });
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
