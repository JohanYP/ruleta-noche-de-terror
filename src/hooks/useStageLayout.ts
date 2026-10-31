import { useEffect, useState } from 'react';
import { STAGE_HEIGHT, STAGE_WIDTH, isStageViewport } from '../config/roulette';

export interface StageLayout {
  mode: 'stage' | 'fluid';
  // Zoom that fits the 1920×1080 design inside the viewport
  scale: number;
  // Viewport height in stage units, so the stage can span the full screen height
  stageHeight: number;
}

function compute(): StageLayout {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scale = Math.min(w / STAGE_WIDTH, h / STAGE_HEIGHT);
  return {
    mode: isStageViewport(w, h) ? 'stage' : 'fluid',
    scale,
    stageHeight: h / scale
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
