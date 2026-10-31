import { useEffect, useState } from 'react';
import { CARD_METRICS, CardMetrics, isStageViewport } from '../config/roulette';

function pick(): CardMetrics {
  if (typeof window === 'undefined') return CARD_METRICS.regular;
  const { innerWidth: w, innerHeight: h } = window;
  // The zoomed stage is always 1920×1080, so it always uses regular cards
  if (isStageViewport(w, h)) return CARD_METRICS.regular;
  return w < 640 || h < 820 ? CARD_METRICS.compact : CARD_METRICS.regular;
}

/** Tamaño de tarjeta: regular en el escenario, compacto en móviles verticales */
export function useCardMetrics(): CardMetrics {
  const [metrics, setMetrics] = useState(pick);

  useEffect(() => {
    const onResize = () => setMetrics((prev) => {
      const next = pick();
      return next.width === prev.width ? prev : next;
    });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return metrics;
}
