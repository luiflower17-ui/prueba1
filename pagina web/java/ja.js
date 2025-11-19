// --- JAVASCRIPT: Manejo de la Barra de Navegación Flotante ---
const header = document.querySelector('header');
const scrollThreshold = 100; // Distancia de desplazamiento para activar el cambio

function handleScroll() {
    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleScroll);
// -------------------------------------------------------------------

// Script para manejar el acordeón (detalles)
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