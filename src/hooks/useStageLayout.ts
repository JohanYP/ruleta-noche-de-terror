import { useEffect, useState } from 'react';
import { STAGE_HEIGHT, STAGE_WIDTH, isStageViewport } from '../config/roulette';

export interface StageLayout {
  mode: 'stage' | 'fluid';
  // Zoom that fits the 1920×1080 stage inside the viewport (letterboxed)
  scale: number;
}

function compute(): StageLayout {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    mode: isStageViewport(w, h) ? 'stage' : 'fluid',
    scale: Math.min(w / STAGE_WIDTH, h / STAGE_HEIGHT)
  };
}

export function useStageLayout(): StageLayout {
  const [layout, setLayout] = useState(compute);

  useEffect(() => {
    const onResize = () => setLayout(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return layout;
}
