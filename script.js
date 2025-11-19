/**
 * Clase para simular un modelo simplificado de riesgo de inundación en una
 * Alcaldía (Delegación) de la Ciudad de México.
 * El riesgo se calcula basándose en factores clave como la precipitación,
 * la capacidad de drenaje y el hundimiento del suelo.
 *
 * Factores de Ponderación (simulados para el ejemplo):
 * - Precipitación: factor 0.40 (Alto impacto)
 * - Capacidad de Drenaje: factor 0.35 (Impacto moderado/alto)
 * - Tasa de Hundimiento: factor 0.25 (Impacto significativo a largo plazo)
 */
public class FloodRiskSimulator {

    // Constantes para el cálculo de riesgo
    private static final double WEIGHT_PRECIPITATION = 0.40;
    private static final double WEIGHT_DRAINAGE = 0.35;
    private static final double WEIGHT_SINKING = 0.25;

    /**
     * Calcula el índice de riesgo de inundación normalizado (0.0 a 100.0)
     * para una alcaldía específica.
     *
     * @param precipitationIndex Índice de precipitación (0.0 = baja, 1.0 = alta).
     * @param drainageCapacity Índice de capacidad de drenaje (1.0 = buena, 0.0 = mala).
     * @param sinkingRate Tasa de hundimiento del suelo (0.0 = baja, 1.0 = alta).
     * @return El índice de riesgo de inundación simulado (0.0 a 100.0).
     */
    public double calculateFloodRisk(double precipitationIndex, double drainageCapacity, double sinkingRate) {
        // Validación de entradas (deben estar entre 0.0 y 1.0)
        if (precipitationIndex < 0 || precipitationIndex > 1 ||
            drainageCapacity < 0 || drainageCapacity > 1 ||
            sinkingRate < 0 || sinkingRate > 1) {
            System.err.println("Error: Todos los índices de entrada deben estar entre 0.0 y 1.0.");
            return -1.0; // Retorna un valor de error
        }

        // El riesgo aumenta con:
        // 1. Mayor Precipitación
        // 2. Menor Capacidad de Drenaje (se invierte 1 - drainageCapacity)
        // 3. Mayor Tasa de Hundimiento

        // Componente 1: Precipitación alta (directo)
        double riskFromPrecipitation = precipitationIndex * WEIGHT_PRECIPITATION;

        // Componente 2: Drenaje deficiente (se invierte el índice: 1.0 - capacidad)
        double riskFromDrainage = (1.0 - drainageCapacity) * WEIGHT_DRAINAGE;

        // Componente 3: Hundimiento del suelo (directo)
        double riskFromSinking = sinkingRate * WEIGHT_SINKING;

        // Suma de los componentes ponderados (el resultado estará entre 0.0 y 1.0)
        double totalRiskNormalized = riskFromPrecipitation + riskFromDrainage + riskFromSinking;

        // Normaliza el resultado a una escala de 0.0 a 100.0
        return totalRiskNormalized * 100.0;
    }

    /**
     * Método principal para ejecutar la simulación.
     * @param args Argumentos de la línea de comandos (no utilizados).
     */
    public static void main(String[] args) {
        FloodRiskSimulator simulator = new FloodRiskSimulator();

        // --- SIMULACIÓN DE ESCENARIOS ---

        // Escenario 1: Alcaldía de ALTO RIESGO (Ejemplo: una de las más afectadas)
        String alcaldiaAltoRiesgo = "Iztapalapa";
        double precipHigh = 0.9;   // Precipitación muy alta
        double drainageLow = 0.2;  // Capacidad de drenaje muy baja
        double sinkingHigh = 0.7;  // Tasa de hundimiento significativa
        double riskHigh = simulator.calculateFloodRisk(precipHigh, drainageLow, sinkingHigh);

        System.out.println("--- Reporte de Simulación de Riesgo de Inundación ---");
        System.out.printf("Alcaldía: %s\n", alcaldiaAltoRiesgo);
        System.out.printf("  Precipitación (0-1): %.1f\n", precipHigh);
        System.out.printf("  Drenaje (0-1): %.1f\n", drainageLow);
        System.out.printf("  Hundimiento (0-1): %.1f\n", sinkingHigh);
        System.out.printf("  ÍNDICE DE RIESGO SIMULADO (0-100): %.2f\n\n", riskHigh);


        // Escenario 2: Alcaldía de BAJO RIESGO (Ejemplo: una con mejor infraestructura)
        String alcaldiaBajoRiesgo = "Cuajimalpa";
        double precipLow = 0.4;    // Precipitación moderada
        double drainageHigh = 0.8; // Capacidad de drenaje alta
        double sinkingLow = 0.1;   // Tasa de hundimiento baja
        double riskLow = simulator.calculateFloodRisk(precipLow, drainageHigh, sinkingLow);

        System.out.printf("Alcaldía: %s\n", alcaldiaBajoRiesgo);
        System.out.printf("  Precipitación (0-1): %.1f\n", precipLow);
        System.out.printf("  Drenaje (0-1): %.1f\n", drainageHigh);
        System.out.printf("  Hundimiento (0-1): %.1f\n", sinkingLow);
        System.out.printf("  ÍNDICE DE RIESGO SIMULADO (0-100): %.2f\n\n", riskLow);

        // Ejemplo de uso de la salida para clasificación de riesgo
        if (riskHigh > 75.0) {
            System.out.printf("ALERTA: El índice de riesgo de %s (%.2f) sugiere una clasificación de RIESGO EXTREMO.\n", alcaldiaAltoRiesgo, riskHigh);
        } else if (riskHigh > 50.0) {
            System.out.printf("ADVERTENCIA: %s presenta RIESGO ALTO.\n", alcaldiaAltoRiesgo);
        } else {
             System.out.printf("%s presenta RIESGO MODERADO o BAJO.\n", alcaldiaAltoRiesgo);
        }
    }
}
