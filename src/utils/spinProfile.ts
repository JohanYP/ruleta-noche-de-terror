import { CRUISE_CARDS_PER_SECOND, DECEL_POWER } from '../config/roulette';
import { clamp } from './helpers';

/**
 * Perfil de velocidad del giro en tres fases:
 *  1. Aceleración  — arranque suave (v crece cuadráticamente)
 *  2. Crucero      — velocidad constante y legible: se ven pasar todos los números
 *  3. Frenada      — ease-out de potencia DECEL_POWER: arrastre final lento y tenso
 *
 * La fase de crucero absorbe la duración extra, así que la velocidad máxima es la
 * misma con 10 s que con 5 minutos; solo cambia cuánto dura el desfile de números.
 */
export interface SpinProfile {
  accel: number;
  cruise: number;
  decel: number;
  duration: number;
  vmax: number; // px/s
}

function phases(durationS: number) {
  const accel = clamp(durationS * 0.12, 1.2, 3);
  const decel = clamp(durationS * 0.5, 5, 13);
  const cruise = Math.max(0, durationS - accel - decel);
  return { accel, cruise, decel };
}

// Distancia recorrida por cada px/s de velocidad máxima
function distanceFactor({ accel, cruise, decel }: ReturnType<typeof phases>) {
  return accel / 3 + cruise + decel / DECEL_POWER;
}

/** Cuántas tarjetas debe recorrer el giro para ir a velocidad de crucero */
export function cardsToTravel(durationS: number): number {
  return Math.max(30, Math.round(CRUISE_CARDS_PER_SECOND * distanceFactor(phases(durationS))));
}

export function createSpinProfile(durationS: number, distancePx: number): SpinProfile {
  const p = phases(durationS);
  return { ...p, duration: durationS, vmax: distancePx / distanceFactor(p) };
}

/** Desplazamiento (px) a los t segundos */
export function positionAt(p: SpinProfile, t: number): number {
  const { accel, cruise, decel, vmax } = p;
  if (t <= 0) return 0;
  if (t < accel) return (vmax * t * t * t) / (3 * accel * accel);
  const afterAccel = (vmax * accel) / 3;
  if (t < accel + cruise) return afterAccel + vmax * (t - accel);
  const s = Math.min(1, (t - accel - cruise) / decel);
  return afterAccel + vmax * cruise + ((vmax * decel) / DECEL_POWER) * (1 - Math.pow(1 - s, DECEL_POWER));
}

/** Tensión 0..1: sube a medida que la ruleta frena (1 = casi detenida) */
export function tensionAt(p: SpinProfile, t: number): number {
  const decelStart = p.accel + p.cruise;
  if (t < decelStart) return 0;
  const s = Math.min(1, (t - decelStart) / p.decel);
  return 1 - Math.pow(1 - s, DECEL_POWER - 1);
}
