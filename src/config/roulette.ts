// Rango del sorteo
export const MIN_NUMBER = 1;
export const MAX_NUMBER = 2000;
export const NUMBER_DIGITS = 4;

// Duración del giro (segundos). Sin máximo a propósito.
export const MIN_DURATION_S = 10;
export const DEFAULT_DURATION_S = 20;
export const DURATION_PRESETS_S = [15, 20, 30, 60];
export const DURATION_STORAGE_KEY = 'ruleta-terror:duration-s';

// Velocidad de crucero: tarjetas por segundo en la fase rápida.
// Lo bastante lento para que el público alcance a leer cada número.
export const CRUISE_CARDS_PER_SECOND = 9;
// Potencia de la frenada final: más alta = arrastre final más largo.
export const DECEL_POWER = 3;

// Pausa dramática entre que la ruleta se detiene y aparece el boleto ganador
export const REVEAL_DELAY_MS = 1100;

export interface CardMetrics {
  width: number;
  height: number;
  gap: number;
  // Vertical room around the tickets for the focus zoom and glow
  padY: number;
}

export const CARD_METRICS: Record<'regular' | 'compact', CardMetrics> = {
  regular: { width: 170, height: 176, gap: 16, padY: 56 },
  compact: { width: 128, height: 136, gap: 12, padY: 36 }
};
