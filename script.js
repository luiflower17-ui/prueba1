// ===============================================
// 4. FUNCIÓN DE SIMULACIÓN (calcularRiesgo) - MEJORADO
// ===============================================
const numberFormatter = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function calcularRiesgo() {
    playActionSound(); 
    
    // 1. Obtener valores de los inputs
    // Usar 'valueAsNumber' para asegurarse de obtener un tipo numérico (solo para inputs numéricos)
    const M = parseFloat(document.getElementById('alcaldia-select').value);
    const C = document.getElementById('lluvia-input').valueAsNumber; 
    const P = document.getElementById('obstruccion-input').valueAsNumber;
    const E = document.getElementById('exposicion-input').valueAsNumber;

    // 2. FÓRMULA CLAVE: R = C + P + (E × M)
    const R = C + P + (E * M);

    // 3. Clasificación de riesgo 
    let riesgoText;
    let riesgoClass;

    // La lógica es clara: Cero riesgo SOLO si la precipitación (C) es cero.
    if (C === 0) {
        riesgoText = "Riesgo: CERO RIESGO (Sistema Estable)";
        riesgoClass = "zero";
    } else if (R >= 6.0) {
        riesgoText = "Riesgo: ALTO"; 
        riesgoClass = "high";
    } else if (R >= 4.0) {
        riesgoText = "Riesgo: MEDIO"; 
        riesgoClass = "medium";
    } else { // C > 0 y R < 4.0
        riesgoText = "Riesgo: BAJO";
        riesgoClass = "low";
    }

    // 4. Actualizar el display
    const riesgoTextoEl = document.getElementById('riesgo-texto');
    
    // Uso del formateador de números
    riesgoTextoEl.textContent = `${riesgoText} (Valor R: ${numberFormatter.format(R)})`;
    riesgoTextoEl.className = `risk-level ${riesgoClass}`; 
}

// ------------------------------------
// Agrupar Listeners del Simulador
// ------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const calcularBtn = document.getElementById('calcular-btn');
    if (calcularBtn) {
        calcularBtn.addEventListener('click', calcularRiesgo);
    }
    // Añadir listeners de cambio para recalcular automáticamente (UX mejorada)
    // Aunque el requisito era solo click, esto mejora la experiencia:
    /*
    document.getElementById('alcaldia-select')?.addEventListener('change', calcularRiesgo);
    document.getElementById('lluvia-input')?.addEventListener('input', calcularRiesgo);
    document.getElementById('obstruccion-input')?.addEventListener('input', calcularRiesgo);
    document.getElementById('exposicion-input')?.addEventListener('input', calcularRiesgo);
    */
});
