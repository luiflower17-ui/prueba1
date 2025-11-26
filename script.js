/* =============================================== */
/* 0. PRELOADER Y ANIMACIÓN DE CARGA INICIAL */
/* =============================================== */
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

/* =============================================== */
/* 1. FUNCIONALIDAD DE AUDIO (CLICK) */
/* =============================================== */
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
document.addEventListener('DOMContentLoaded', () => {
    if (audioContext.state === 'suspended') {
        const resumeContext = () => {
            audioContext.resume().then(() => {
                document.removeEventListener('click', resumeContext);
                document.removeEventListener('touchstart', resumeContext);
            }).catch(e => console.error("Error al reanudar AudioContext:", e));
        };
        document.addEventListener('click', resumeContext, { once: true });
        document.addEventListener('touchstart', resumeContext, { once: true });
    }
});

function createSound(frequency, duration, volume, type = 'square') {
    if (audioContext.state === 'closed' || audioContext.state === 'suspended') return;
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.warn("Fallo al reproducir audio:", e.message);
    }
}

const playSoftClick = () => createSound(1500, 0.015, 0.1, 'square');
const playConfirmAction = () => createSound(1200, 0.08, 0.2, 'sine');

/* =============================================== */
/* 2. MANEJO DE LA BARRA DE NAVEGACIÓN FLOTANTE */
/* =============================================== */

const scrollToTopBtn = document.getElementById("scrollToTopBtn");
if (scrollToTopBtn) {
    const observerTarget = document.querySelector('header');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scrollToTopBtn.style.display = "none";
            } else {
                scrollToTopBtn.style.display = "block";
            }
        });
    }, {
        threshold: 0.1
    });

    if (observerTarget) {
        observer.observe(observerTarget);
    }

    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        playSoftClick();
    });
}

/* =============================================== */
/* 3. LÓGICA DEL PANEL INTERACTIVO */
/* =============================================== */

const carouselCards = document.querySelectorAll('.carousel-card');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;

const contentIds = Array.from(carouselCards).map(card => card.getAttribute('data-target')).filter(id => id);

function animateInfoBlocks(contentElement) {
    const infoBlocks = contentElement.querySelectorAll('.info-block');
    infoBlocks.forEach((block, index) => {
        block.style.animation = `none`;
        block.offsetHeight;
        block.style.animation = `fadeInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards`;
        block.style.animationDelay = `${0.2 + index * 0.1}s`;
    });
}

function showContent(targetId) {
    const nextContent = document.getElementById(targetId);

    window.location.hash = targetId;

    if (!nextContent || nextContent === currentActiveContent) return;

    playSoftClick();

    const adviceContainer = document.getElementById('advice-container');
    if (adviceContainer) {
        adviceContainer.innerHTML = '';
    }

    if (targetId !== 'content-algoritmo') {
        const riesgoTextoEl = document.getElementById('riesgo-texto');
        if (riesgoTextoEl) {
            riesgoTextoEl.textContent = "Esperando datos...";
            riesgoTextoEl.className = `risk-level pending`;
        }
    }

    carouselCards.forEach(card => card.classList.remove('active-card'));
    const newActiveCard = document.querySelector(`.carousel-card[data-target="${targetId}"]`);
    if (newActiveCard) {
        newActiveCard.classList.add('active-card');
    }

    if (currentActiveContent) {
        currentActiveContent.classList.remove('active');
        currentActiveContent.style.opacity = '0';
        currentActiveContent.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            currentActiveContent.style.display = 'none';

            nextContent.style.display = 'block';
            void nextContent.offsetWidth;
            nextContent.classList.add('active');
            nextContent.style.opacity = '1';
            nextContent.style.transform = 'translateY(0)';

            currentActiveContent = nextContent;

            animateInfoBlocks(nextContent);

            if (targetId === 'content-impacto') {
                animateAlcaldiasBars();
            }
        }, 300);
    } else {
        detailContents.forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });
        nextContent.style.display = 'block';
        void nextContent.offsetWidth;
        nextContent.classList.add('active');
        nextContent.style.opacity = '1';
        nextContent.style.transform = 'translateY(0)';
        currentActiveContent = nextContent;

        animateInfoBlocks(nextContent);
        if (targetId === 'content-impacto') {
            animateAlcaldiasBars();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const initialTargetId = window.location.hash ? window.location.hash.substring(1) : detailContents[0]?.id;

    if (initialTargetId && document.getElementById(initialTargetId)) {
        showContent(initialTargetId);

        const initialIndex = contentIds.indexOf(initialTargetId);
        if (initialIndex > -1) {
            const totalCards = contentIds.length;
            const totalVisibleCards = 3;
            const maxScrollIndex = totalCards - totalVisibleCards;

            let scrollIndex = 0;

            if (initialIndex >= totalVisibleCards) {
                scrollIndex = Math.min(initialIndex - (totalVisibleCards - 1), maxScrollIndex);
            }

            scrollIndex = Math.max(0, Math.min(scrollIndex, maxScrollIndex));

            currentCardIndex = scrollIndex;
            moveToCard(currentCardIndex);
        }
    }
});

carouselCards.forEach(card => {
    card.addEventListener('click', () => {
        const targetId = card.getAttribute('data-target');
        showContent(targetId);
    });
});

/* =============================================== */
/* 4. LÓGICA DEL CARRUSEL */
/* =============================================== */

const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentCardIndex = 0;
const CARD_WIDTH = 330;
const CARD_GAP = 20;
const totalStepSize = CARD_WIDTH + CARD_GAP;

function moveToCard(index) {
    if (carouselTrack) {
        const offset = -index * totalStepSize;
        carouselTrack.style.transform = `translateX(${offset}px)`;
    }
}

if (nextBtn && carouselTrack) {
    nextBtn.addEventListener('click', () => {
        playSoftClick();
        const totalCards = carouselTrack.children.length;
        const totalVisibleCards = 3;
        const maxIndex = totalCards - totalVisibleCards;

        if (currentCardIndex < maxIndex) {
            currentCardIndex++;
            moveToCard(currentCardIndex);
        } else if (currentCardIndex >= maxIndex) {
            currentCardIndex = 0;
            moveToCard(currentCardIndex);
        }
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        playSoftClick();
        if (currentCardIndex > 0) {
            currentCardIndex--;
            moveToCard(currentCardIndex);
        }
    });
}
/* =============================================== */
/* 5. LÓGICA DEL SIMULADOR */
/* =============================================== */

document.addEventListener('DOMContentLoaded', () => {
    const rangeInputs = [
        { id: 'lluvia-input', valueId: 'lluvia-val' },
        { id: 'obstruccion-input', valueId: 'obstruccion-val' },
        { id: 'vulnerabilidad-input', valueId: 'vulnerabilidad-val' },
        { id: 'exposicion-input', valueId: 'exposicion-val' },
    ];

    rangeInputs.forEach(item => {
        const input = document.getElementById(item.id);
        const valueSpan = document.getElementById(item.valueId);

        if (input && valueSpan) {
            input.oninput = function() {
                valueSpan.textContent = this.value;
            };
        }
    });
});

/* =============================================== */
/* ⚠️ AQUÍ VA LA NUEVA FUNCIÓN calcularRiesgo() */
/* COMPLETA en la PARTE 3 */
/* =============================================== */


/* =============================================== */
/* 6. ANIMACIÓN DE BARRAS DE ALCALDÍAS */
/* =============================================== */

function animateAlcaldiasBars() {
    const alcaldiasList = document.querySelector('.alcaldias-list');
    if (!alcaldiasList) return;

    const alcaldias = alcaldiasList.querySelectorAll('li');

    alcaldias.forEach((li, index) => {
        const percentage = li.getAttribute('data-percentage');
        const counter = li.querySelector('.percentage-counter');

        li.style.setProperty('--percentage', `${percentage}%`);

        let startValue = 0;
        const duration = 1500;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            const currentValue = Math.floor(progress * parseFloat(percentage));

            if (counter) {
                counter.textContent = `${currentValue}%`;
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                if (counter) {
                    counter.textContent = `${percentage}%`;
                }
            }
        }

        setTimeout(() => {
            requestAnimationFrame(updateCounter);
        }, index * 100);
    });
}

/* =============================================== */
/* 7. NAVEGACIÓN POR TECLADO */
/* =============================================== */

function getCurrentActiveIndex() {
    const currentActiveId = currentActiveContent?.id;
    return contentIds.indexOf(currentActiveId);
}

function navigateSections(direction) {
    let currentIndex = getCurrentActiveIndex();

    if (currentIndex === -1) {
        currentIndex = 0;
    }

    let newIndex = currentIndex;

    if (direction === 'next') {
        newIndex = (currentIndex + 1) % contentIds.length;
    } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + contentIds.length) % contentIds.length;
    }

    const newTargetId = contentIds[newIndex];
    if (newTargetId) {
        showContent(newTargetId);

        const totalCards = contentIds.length;
        const totalVisibleCards = 3;
        const maxScrollIndex = totalCards - totalVisibleCards;

        if (newIndex < currentCardIndex) {
            currentCardIndex = newIndex;
        } else if (newIndex >= currentCardIndex + totalVisibleCards) {
            currentCardIndex = newIndex - (totalVisibleCards - 1);
        }

        currentCardIndex = Math.max(0, Math.min(currentCardIndex, maxScrollIndex));

        moveToCard(currentCardIndex);
    }
}

document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'SELECT' || 
        event.target.tagName === 'TEXTAREA') {
        return;
    }

    if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateSections('next');
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateSections('prev');
    }
});

/* =============================================== */
/* 8. CAMBIO DE TEMA (DARK/LIGHT) */
/* =============================================== */

const themeToggle = document.getElementById('checkbox-theme');
const body = document.body;
const videoOverlay = document.querySelector('.video-overlay');
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';
const THEME_KEY = 'flood-risk-theme';
const DARK_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.65)';
const LIGHT_OVERLAY_COLOR = 'rgba(255, 255, 255, 0.7)';

function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || DARK_THEME;

    body.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.checked = (savedTheme === LIGHT_THEME);
    }

    if (videoOverlay) {
        videoOverlay.style.backgroundColor = 
            savedTheme === LIGHT_THEME ? LIGHT_OVERLAY_COLOR : DARK_OVERLAY_COLOR;
    }
}

function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

    localStorage.setItem(THEME_KEY, newTheme);

    initializeTheme();
}

document.addEventListener('DOMContentLoaded', initializeTheme);

if (themeToggle) {
    themeToggle.addEventListener('change', toggleTheme);
}
/* =============================================== */
/* ⚠️ NUEVA FUNCIÓN DEL SIMULADOR — LÓGICA EXACTA DE TU PYTHON */
/* =============================================== */

function calcularRiesgo() {
    playConfirmAction();

    // 1. Obtener alcaldía seleccionada
    const alcaldiaSelect = document.getElementById("alcaldia-select");
    const opcion = alcaldiaSelect ? alcaldiaSelect.value : "6";

    let M = 0.8;
    let alcaldia = "Otra Alcaldía";

    // Multiplicadores según tu código Python
    switch (opcion) {
        case "1":
            M = 1.4;
            alcaldia = "Tlalpan";
            break;
        case "2":
            M = 1.3;
            alcaldia = "Iztapalapa";
            break;
        case "3":
            M = 1.1;
            alcaldia = "GAM";
            break;
        case "4":
            M = 1.1;
            alcaldia = "Xochimilco";
            break;
        case "5":
            M = 1.0;
            alcaldia = "Tláhuac";
            break;
        default:
            M = 0.8;
            alcaldia = "Otra Alcaldía";
    }

    // 2. Obtener C, P, E
    const C = parseFloat(document.getElementById("lluvia-input").value);
    const P = parseFloat(document.getElementById("obstruccion-input").value);
    const E = parseFloat(document.getElementById("exposicion-input").value);

    // 3. Fórmula EXACTA:
    // R = (C + P + E) * M
    const R = (C + P + E) * M;

    const riesgoTextoEl = document.getElementById('riesgo-texto');
    const adviceContainer = document.getElementById('advice-container');

    // 4. Clasificación EXACTA a como la escribiste:
    let riesgoText = "";
    let riesgoClass = "";

    if (C <= 0) {
        riesgoText = "Cero riesgo";
        riesgoClass = "zero";
    } 
    else if (R >= 8) {
        riesgoText = `Riesgo: Alto (${R.toFixed(2)})`;
        riesgoClass = "high";
    }
    else if (R >= 4 && R <= 7) {
        riesgoText = `Riesgo: Medio (${R.toFixed(2)})`;
        riesgoClass = "medium";
    }
    else {
        riesgoText = `Riesgo: Bajo (${R.toFixed(2)})`;
        riesgoClass = "low";
    }

    // 5. Mostrar en pantalla
    riesgoTextoEl.textContent = riesgoText;
    riesgoTextoEl.className = `risk-level ${riesgoClass}`;

    // 6. Mensajes simples sin modificar tu estilo
    let messageHTML = "";

    if (riesgoClass === "high") {
        messageHTML = `<p class="impact-message high-alert"><strong>⚠️ ALERTA MÁXIMA:</strong> Evite zonas de riesgo.</p>`;
    } else if (riesgoClass === "medium") {
        messageHTML = `<p class="impact-message medium-alert">Riesgo moderado. Manténgase atento.</p>`;
    } else {
        messageHTML = `<p class="impact-message low-alert">Riesgo bajo o nulo.</p>`;
    }

    adviceContainer.innerHTML = messageHTML;
}
