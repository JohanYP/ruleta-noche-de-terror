import { useEffect, useState } from 'react';
import { CARD_METRICS, CardMetrics } from '../config/roulette';

function pick(): CardMetrics {
  if (typeof window === 'undefined') return CARD_METRICS.regular;
  return window.innerWidth < 640 || window.innerHeight < 820 ? CARD_METRICS.compact : CARD_METRICS.regular;
}

/** Tamaño de tarjeta según la pantalla: compacto en móviles y laptops bajas */
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
