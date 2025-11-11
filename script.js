/* ==================================== */
/* 0. Paleta y Tipografía (Fondo Oscuro)*/
/* ==================================== */
:root {
    --color-bg: #121212; 
    --color-main-bg: rgba(30, 30, 30, 0.95); 
    --color-text-light: #E0E0E0; 
    --color-navy-deep: #7986CB; /* Azul profesional */
    --color-accent-vibrant: #64FFDA; /* Verde brillante para interactividad */
    --color-divider: #333333; 
    --color-accent-alert: #FF5252; /* Rojo para alertas */
    --color-light-gray: rgba(41, 41, 41, 0.95); 
    --shadow-subtle: 0 4px 10px rgba(0, 0, 0, 0.3);
    --shadow-vibrant: 0 0 15px rgba(100, 255, 218, 0.3); /* Sombra vibrante */
}

body {
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
    line-height: 1.65; 
    margin: 0;
    padding: 0;
    color: var(--color-text-light); 
    min-height: 100vh;
    background-color: #000000; 
    display: flex;
    justify-content: center;
    padding: 4rem 0; 
    position: relative;
    overflow-x: hidden;
}

main {
    width: 100%;
    max-width: 850px; 
    margin: 0 2rem;
    padding: 0; 
    background-color: var(--color-main-bg); 
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6); 
    border-radius: 8px; /* Bordes más suaves */
    overflow: hidden;
    border: 1px solid var(--color-divider);
    z-index: 10; 
    position: relative; 
}

/* ==================================== */
/* 1. VIDEO DE FONDO Y OVERLAY          */
/* ==================================== */

.video-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 1; 
}

.video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6); 
    z-index: 2; 
}

#youtube-background {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100vw; 
    height: 56.25vw; 
    min-width: 100%;
    min-height: 100%;
    transform: translate(-50%, -50%);
    pointer-events: none; 
    border: none;
    z-index: 1;
}

/* ==================================== */
/* 2. Estilos Globales y HEADER         */
/* ==================================== */
header { 
    position: sticky; 
    top: 0;
    z-index: 20; 
    background-color: rgba(0, 0, 0, 0.9); 
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Curva de animación más suave */
    padding: 2.5rem 2.5rem; 
    box-shadow: 0 0px 0px rgba(0, 0, 0, 0.4); 
    color: var(--color-text-light); 
    text-align: left; 
    border-bottom: 3px solid var(--color-navy-deep); 
}

.scrolled {
    background-color: rgba(18, 18, 18, 0.98); 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); 
    padding: 1.2rem 2.5rem; /* Más compacto */
}

h1 { margin: 0; font-size: 2rem; font-weight: 300; letter-spacing: 0.5px; color: var(--color-text-light); transition: font-size 0.4s ease; }
.scrolled h1 { font-size: 1.6rem; }
header p { color: var(--color-divider); font-size: 0.85rem; margin: 0.5rem 0 0 0; transition: margin 0.4s ease; }
.scrolled header p { margin: 0.2rem 0 0 0; }

h2 {
    font-size: 1.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2rem;
    color: var(--color-accent-vibrant); 
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--color-divider);
    font-weight: 400;
}

h3 { font-size: 1.2rem; color: var(--color-text-light); margin-top: 2rem; font-weight: 500; }
a { color: var(--color-accent-vibrant); text-decoration: none; font-weight: 500; border-bottom: 1px dotted var(--color-accent-vibrant); transition: color 0.2s; }
a:hover { color: var(--color-navy-deep); border-bottom: 1px solid var(--color-navy-deep); }
section { padding: 2.5rem; border-bottom: 1px solid var(--color-divider); }
section:last-of-type { border-bottom: none; }
footer { text-align: center; padding: 1.5rem; background-color: var(--color-light-gray); color: var(--color-text-light); font-size: 0.8rem; }
footer a { color: var(--color-accent-alert); border-bottom: none; }
aside { background-color: var(--color-light-gray); border-left: 4px solid var(--color-accent-vibrant); padding: 2rem; margin-top: 2.5rem; border-radius: 4px; }
aside h3 { margin-top: 0; color: var(--color-navy-deep); }

/* --- Estilos para los DETAILS estándar (Tipología/Prevención) --- */
details { 
    border: 1px solid var(--color-divider); 
    border-radius: 4px; 
    margin-bottom: 15px; 
    background-color: var(--color-main-bg); 
    transition: background-color 0.3s, box-shadow 0.3s;
}
details:hover { 
    background-color: var(--color-light-gray); 
    box-shadow: var(--shadow-subtle);
}
summary { 
    padding: 15px 20px; 
    background-color: var(--color-main-bg); 
    color: var(--color-text-light); 
    list-style: none; 
    font-weight: 500; 
    border-radius: 4px;
    cursor: pointer;
}
summary::before { content: "▸"; margin-right: 15px; font-size: 1.1em; color: var(--color-navy-deep); font-weight: 700; transition: transform 0.2s; }
details[open] summary { 
    border-bottom: 1px solid var(--color-divider); 
    background-color: var(--color-light-gray);
    color: var(--color-accent-vibrant);
}
details[open] summary::before { content: "▾"; color: var(--color-accent-vibrant); }
details p, details ul, details ol { padding: 15px 20px 20px 20px; font-size: 0.95rem; }


/* ==================================== */
/* 3. Estilos de IMAGEN y APA 7         */
/* ==================================== */
.img-float-right {
    float: right;
    margin: 0 0 1.5rem 2rem;
    max-width: 40%;
    height: auto;
    border-radius: 4px;
    box-shadow: var(--shadow-subtle);
    transition: transform 0.3s;
}
.img-float-right:hover {
    transform: scale(1.02);
}
.img-float-left {
    float: left;
    margin: 0 2rem 1.5rem 0;
    max-width: 40%;
    height: auto;
    border-radius: 4px;
    box-shadow: var(--shadow-subtle);
    transition: transform 0.3s;
}
.img-float-left:hover {
    transform: scale(1.02);
}
.image-caption {
    clear: both; /* Limpia el float para que no afecte el siguiente H2 */
    font-size: 0.75rem;
    color: var(--color-divider);
    padding: 0 0 2rem 0;
    font-style: italic;
    line-height: 1.4;
}
/* Limpiar floats en el final de las secciones */
#alcaldias-afectadas::after, #residuos::after {
    content: "";
    display: table;
    clear: both;
}

/* ==================================== */
/* 4. SECCIÓN 1: PROBLEMAS (Hover/Grid) */
/* ==================================== */
#problemas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); /* 2 columnas en pantallas grandes */
    gap: 15px;
    margin-top: 1rem;
}

.problema-card {
    /* HEREDA estilos base de details */
    margin: 0; /* Anula el margin-bottom para usar el gap del grid */
    border: 1px solid var(--color-divider);
    border-radius: 6px;
    transition: all 0.3s;
    background-color: var(--color-light-gray);
    box-shadow: none;
}
.problema-card:hover {
    transform: translateY(-3px); /* Pequeño levante */
    box-shadow: var(--shadow-vibrant); /* Sombra vibrante al pasar el mouse */
    border-color: var(--color-accent-vibrant);
}

.problema-card summary {
    font-weight: 700; /* Pregunta más fuerte */
    background-color: transparent;
    color: var(--color-text-light);
    transition: color 0.3s;
}

.problema-card:hover summary {
    color: var(--color-accent-vibrant); /* Resalta la pregunta activa */
}

/* Animación de apertura: Oculta el contenido de forma animada */
.problema-card p {
    max-height: 0;
    overflow: hidden;
    padding: 0 20px;
    transition: max-height 0.4s ease-in-out, padding 0.4s ease-in-out;
}

.problema-card[open] p {
    max-height: 300px; /* Altura suficiente para el contenido */
    padding: 0 20px 20px 20px;
}

/* ==================================== */
/* 5. Animación de Entrada (Fade In)    */
/* ==================================== */

/* Ocultar elementos al inicio */
.fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

/* Mostrar elementos cuando el JS añade la clase 'is-visible' */
.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* ==================================== */
/* 6. Botón Volver Arriba (Scroll-to-Top) */
/* ==================================== */
#scrollToTopBtn {
    display: none; 
    position: fixed;
    bottom: 30px; 
    right: 30px; 
    z-index: 99; 
    border: none;
    outline: none;
    background-color: var(--color-accent-vibrant); /* Color vibrante */
    color: var(--color-bg); /* Texto oscuro */
    cursor: pointer;
    padding: 15px 20px;
    border-radius: 50%; 
    font-size: 24px;
    line-height: 1;
    box-shadow: 0 4px 15px rgba(100, 255, 218, 0.6); /* Sombra más fuerte */
    transition: background-color 0.3s, transform 0.3s;
    opacity: 0.9;
}

#scrollToTopBtn:hover {
    background-color: var(--color-navy-deep);
    color: white;
    transform: scale(1.1);
    opacity: 1;
    box-shadow: 0 4px 15px rgba(121, 134, 203, 0.8);
}
