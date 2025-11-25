// ===============================================
// 0. PRELOADER Y ANIMACIÓN DE CARGA INICIAL
// ===============================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});


// ===============================================
// 1. FUNCIONALIDAD DE AUDIO (CLICK)
// ===============================================
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


// ===============================================
// 2. MANEJO DE SCROLL Y BOTÓN DE INICIO
// ===============================================
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


// ===============================================
// 3. LÓGICA DEL PANEL INTERACTIVO (CARRUSEL Y ANIMACIONES)
// ===============================================
const carouselCards = document.querySelectorAll('.carousel-card');
const detailContents = document.querySelectorAll('.content-detail');
let currentActiveContent = null;
const contentIds = Array.from(carouselCards).map(card => card.getAttribute('data-target')).filter(id => id);

function animateInfoBlocks(contentElement) {
    const infoBlocks = contentElement.querySelectorAll('.info-block');
    infoBlocks.forEach((block, index) => {
        block.style.animation = `none`; 
        block.offsetHeight; 
        block.style.animation = `fadeInUp 0.6s ease-out forwards`;
        block.style.animationDelay = `${0.2 + index * 0.1}s`; 
    });
}

function showContent(targetId) {
    const nextContent = document.getElementById(targetId);
    
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


    if (currentActiveContent) {
        currentActiveContent.classList.remove('active');
        currentActiveContent.style.opacity = '0';
        currentActiveContent.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            currentActiveContent.style.display = 'none'; 
            
            nextContent.style.display = 'block';
            void nextContent.offsetWidth; 
            nextContent.classList.add('active');
            
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
        const initialCard = document.querySelector(`.carousel-card[data-target="${initialTargetId}"]`);
        if (initialCard) {
            initialCard.classList.add('active');
        }
    } else if (detailContents[0]?.id) {
        showContent(detailContents[0].id);
        carouselCards[0]?.classList.add('active');
    }
});

carouselCards.forEach(card => {
    card.addEventListener('click', () => { 
        const targetId = card.getAttribute('data-target');
        
        if (targetId) {
            carouselCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            window.location.hash = targetId; 
            showContent(targetId); 
            
            const cardIndex = contentIds.indexOf(targetId);
            if (cardIndex !== -1) {
                 const totalCards = contentIds.length;
                 const totalVisibleCards = 3; 
                 const maxScrollIndex = totalCards - totalVisibleCards; 
                 
                 let scrollIndex = 0;
                 if (cardIndex >= totalVisibleCards) {
                     scrollIndex = Math.min(cardIndex - (totalVisibleCards - 1), maxScrollIndex);
                 }
                 
                 scrollIndex = Math.max(0, scrollIndex);
                 
                 currentCardIndex = scrollIndex; 
                 moveToCard(currentCardIndex);
            }
        }
    });
});


// ------------------------------------
// Lógica de navegación del Carrusel
// ------------------------------------
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


// ===============================================
// 4. LÓGICA DEL SIMULADOR (FIEL A LAS REGLAS DE PYTHON)
// ===============================================

// Inicialización y visualización de valores de rango
document.addEventListener('DOMContentLoaded', () => {
    const rangeInputs = [
        { id: 'lluvia-input', valueId: 'lluvia-val' },
        { id: 'obstruccion-input', valueId: 'obstruccion-val' },
        { id: 'exposicion-input', valueId: 'exposicion-val' }
    ];

    rangeInputs.forEach(item => {
        const inputEl = document.getElementById(item.id);
        const valueEl = document.getElementById(item.valueId);
        
        if (inputEl && valueEl) {
            valueEl.textContent = inputEl.value; 
            
            inputEl.addEventListener('input', function() {
                valueEl.textContent = this.value;
            });
        }
    });
});


function calcularRiesgo() {
    playConfirmAction(); 

    // 1. Obtener y PARSEAR valores
    // Asegurarse de que M, C, P sean flotantes y E sea entero
    const M = parseFloat(document.getElementById('alcaldia-select').value);
    const C = parseFloat(document.getElementById('lluvia-input').value);
    const P = parseFloat(document.getElementById('obstruccion-input').value);
    const E = parseInt(document.getElementById('exposicion-input').value, 10); 

    // Validación de Input
    if (isNaN(C) || isNaN(P) || isNaN(E) || isNaN(M)) {
        const riesgoTextoEl = document.getElementById('riesgo-texto');
        riesgoTextoEl.textContent = "Error: Datos de entrada inválidos. Revise los valores.";
        riesgoTextoEl.className = `risk-level high`; 
        return; 
    }

    // 2. FÓRMULA CLAVE: R = (1*C + P + E) * M
    // El '1*' es implícito en la suma: (C + P + E) * M
    const R = (C + P + E) * M;

    // 3. Clasificación de riesgo (Fiel a la lógica de Python)
    let riesgoText;
    let riesgoClass;

    const adviceContainer = document.getElementById('advice-container');
    adviceContainer.innerHTML = ''; 
    
    // El orden de evaluación es crucial aquí:
    
    // Cero Riesgo
    if (C <= 0) {
        riesgoText = "Riesgo: CERO RIESGO (Lluvia nula)"; 
        riesgoClass = "zero";

    // Alto Riesgo: R >= 8
    } else if (R >= 8.0) { 
        riesgoText = "Riesgo: ALTO"; 
        riesgoClass = "high";

    // Medio Riesgo: R <= 7 Y R >= 4
    } else if (R >= 4.0 && R <= 7.0) { 
        riesgoText = "Riesgo: MEDIO"; 
        riesgoClass = "medium";
        
    // Bajo Riesgo (Cubre R < 4.0 y el "agujero" 7.0 < R < 8.0)
    } else { 
        riesgoText = "Riesgo: BAJO"; 
        riesgoClass = "low";
    }

    // 4. Actualizar el display y mensajes condicionales
    const riesgoTextoEl = document.getElementById('riesgo-texto');
    const simResultEl = document.getElementById('sim-result');
    riesgoTextoEl.textContent = riesgoText;
    riesgoTextoEl.className = `risk-level ${riesgoClass}`; 
    
    // Enlaces condicionales (Corregidos)
    const proteccionCivilLink = "https://www.proteccioncivil.gob.mx/work/models/ProteccionCivil/Resource/377/1/images/cartel_i.pdf"; 
    const videoInformativoLink = "https://youtu.be/wAaV8rV2bRw";

    let messageHTML = '';

    if (riesgoClass === 'high') {
        messageHTML = `<p class="impact-message high-alert"><strong>⚠️ ALERTA MÁXIMA:</strong> Siga las indicaciones de Protección Civil.</p>
                       <a href="${proteccionCivilLink}" target="_blank" class="impact-link high-risk-link">
                           <i class="fas fa-file-pdf"></i> Protocolo de Emergencia
                       </a>`;
    } else {
        messageHTML = `<p class="impact-message low-alert">Manténgase informado y preparado.</p>
                       <a href="${videoInformativoLink}" target="_blank" class="impact-link low-risk-link">
                           <i class="fas fa-video"></i> Video Informativo sobre Inundaciones
                       </a>`;
    }
    
    if (!adviceContainer.parentNode) { 
        adviceContainer.id = 'advice-container';
        simResultEl.appendChild(adviceContainer);
    }
    adviceContainer.innerHTML = messageHTML;
}

window.calcularRiesgo = calcularRiesgo;


// ===============================================
// 5. FUNCIÓN PARA ANIMAR LAS BARRAS DE PROGRESO DE ALCALDÍAS (Contador Dinámico)
// ===============================================
function animateAlcaldiasBars() {
    const alcaldias = document.querySelectorAll('.alcaldias-list li');
    
    alcaldias.forEach(li => {
        const fullText = li.textContent.trim();
        let textWithoutPercentage = fullText.includes('(') ? fullText.substring(0, fullText.indexOf('(')).trim() : fullText;
        if (!textWithoutPercentage) {
            textWithoutPercentage = li.childNodes[0].nodeValue ? li.childNodes[0].nodeValue.trim() : '';
        }
        
        const targetPercentage = parseInt(li.getAttribute('data-percentage').replace('%', ''), 10);
        
        let counterElement = li.querySelector('.percentage-counter');
        if (!counterElement) {
            li.innerHTML = `${textWithoutPercentage} <span class="percentage-counter">0%</span>`;
            counterElement = li.querySelector('.percentage-counter');
        } else {
             li.innerHTML = `${textWithoutPercentage} <span class="percentage-counter">0%</span>`;
             counterElement = li.querySelector('.percentage-counter');
        }

        li.style.setProperty('--percentage', '0%'); 
        
        
        let currentCount = 0;
        const duration = 1500; 
        const stepTime = 15; 
        const steps = duration / stepTime;
        const stepValue = targetPercentage / steps;
        
        let countInterval = setInterval(() => {
            currentCount += stepValue;
            
            if (currentCount >= targetPercentage) {
                clearInterval(countInterval);
                currentCount = targetPercentage;
            }
            
            const roundedCount = Math.floor(currentCount);
            
            li.style.setProperty('--percentage', `${roundedCount}%`);
            
            if(counterElement) {
                counterElement.textContent = `(${roundedCount}%)`;
            }
            
            if (currentCount === targetPercentage) {
                 li.style.setProperty('--percentage', `${targetPercentage}%`);
                 if(counterElement) {
                    counterElement.textContent = `(${targetPercentage}%)`;
                 }
            }

        }, stepTime);
    });
}

// ===============================================
// 6. NAVEGACIÓN POR TECLADO (Mejorada con Scroll)
// ===============================================
function navigateSections(direction) {
    if (!currentActiveContent) return; 

    const currentId = currentActiveContent.id;
    let currentIndex = contentIds.indexOf(currentId);
    
    if (currentIndex === -1) return; 

    let newIndex = currentIndex;

    if (direction === 'next') {
        newIndex = (currentIndex + 1) % contentIds.length; 
    } else if (direction === 'prev') {
        newIndex = (currentIndex - 1 + contentIds.length) % contentIds.length;
    }

    const newTargetId = contentIds[newIndex];
    
    if (newTargetId) {
        const targetCard = document.querySelector(`.carousel-card[data-target="${newTargetId}"]`);
        if (targetCard) {
            targetCard.click(); 
            
            const totalCards = contentIds.length;
            const totalVisibleCards = 3; 
            const maxScrollIndex = totalCards - totalVisibleCards;
            
            let scrollIndex = 0;
            
            if (newIndex >= totalVisibleCards) {
                scrollIndex = Math.min(newIndex - (totalVisibleCards - 1), maxScrollIndex);
            }
            
            scrollIndex = Math.max(0, Math.min(scrollIndex, maxScrollIndex));
            
            currentCardIndex = scrollIndex;
            moveToCard(currentCardIndex);
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
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
