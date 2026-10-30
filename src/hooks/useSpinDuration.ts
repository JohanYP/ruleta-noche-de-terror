import { useState } from 'react';
import { DEFAULT_DURATION_S, DURATION_STORAGE_KEY, MIN_DURATION_S } from '../config/roulette';

export function isValidDuration(n: number): boolean {
  return Number.isInteger(n) && Number.isFinite(n) && n >= MIN_DURATION_S;
}

function readStored(): number {
  try {
    const n = Number(localStorage.getItem(DURATION_STORAGE_KEY));
    if (isValidDuration(n)) return n;
  } catch {}
  return DEFAULT_DURATION_S;
}

/** Duración del giro en segundos, recordada en este navegador */
export function useSpinDuration() {
  const [duration, setDuration] = useState(readStored);

  const update = (seconds: number) => {
    if (!isValidDuration(seconds)) return;
    setDuration(seconds);
    try {
      localStorage.setItem(DURATION_STORAGE_KEY, String(seconds));
    } catch {}
  };

  return [duration, update] as const;
}
