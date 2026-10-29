import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { RouletteCard, formatNum, getRandomInt } from '../utils/helpers';
import { sound } from '../utils/sound';

export interface RouletteHandle {
  spin: (targetWinner?: number) => void;
  isSpinning: boolean;
}

interface RouletteProps {
  onSpinStart?: () => void;
  onSpinEnd?: (winner: RouletteCard) => void;
  soundEnabled?: boolean;
}

// 10% larger than before (170px width x 176px height)
const CARD_WIDTH = 170;
const CARD_MARGIN = 16;
const ITEM_STEP = CARD_WIDTH + CARD_MARGIN; // 186px total step
const TOTAL_CARDS = 105; // Extended track for 20-second spin
const WINNER_INDEX = 84; // Landing card slot

export const HorizontalRoulette = forwardRef<RouletteHandle, RouletteProps>(({
  onSpinStart,
  onSpinEnd,
  soundEnabled = true
}, ref) => {
  const [cards, setCards] = useState<RouletteCard[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const generateTrack = (winnerNum?: number) => {
    const list: RouletteCard[] = [];
    for (let i = 0; i < TOTAL_CARDS; i++) {
      let num: number;
      if (i === WINNER_INDEX && winnerNum !== undefined) {
        num = winnerNum;
      } else {
        num = getRandomInt(0, 2000);
      }
      list.push({
        id: `c_${i}_${num}_${Date.now()}`,
        number: num,
        formatted: formatNum(num),
        rarity: 'common'
      });
    }
    return list;
  };

  useEffect(() => {
    const initial = generateTrack();
    setCards(initial);
  }, []);

  const spin = (chosenWinner?: number) => {
    if (isSpinning) return;
    setIsSpinning(true);
    onSpinStart?.();

    const winnerNumber = chosenWinner !== undefined ? chosenWinner : getRandomInt(0, 2000);
    const newTrack = generateTrack(winnerNumber);
    setCards(newTrack);

    const containerWidth = containerRef.current?.offsetWidth || 950;
    const centerOffset = containerWidth / 2;

    const microJitter = (Math.random() - 0.5) * 50;
    const targetCardCenter = WINNER_INDEX * ITEM_STEP + CARD_WIDTH / 2;
    const finalTranslateX = -(targetCardCenter - centerOffset + microJitter);

    const track = trackRef.current;
    if (!track) return;

    track.style.transition = 'none';
    track.style.transform = 'translate3d(0px, 0, 0)';

    // Duration: Exactly 20 seconds for intense suspense
    const duration = 20000;
    const startTime = performance.now();
    let lastTickIndex = 0;

    // Slower, dramatic 20-second suspense deceleration curve
    const easeOutSuspense = (t: number): number => {
      return 1 - Math.pow(1 - t, 5.0);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutSuspense(progress);

      const currentX = finalTranslateX * easedProgress;
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;

      const centerRelative = -currentX + centerOffset;
      const currentPassedIndex = Math.floor(centerRelative / ITEM_STEP);

      if (currentPassedIndex !== lastTickIndex && currentPassedIndex >= 0 && currentPassedIndex < TOTAL_CARDS) {
        lastTickIndex = currentPassedIndex;
        if (soundEnabled) {
          sound.playTick();
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        if (soundEnabled) {
          sound.playImpact();
        }
        const winningCard = newTrack[WINNER_INDEX];
        onSpinEnd?.(winningCard);
      }
    };

    requestAnimationFrame(() => {
      animFrameRef.current = requestAnimationFrame(animate);
    });
  };

  useImperativeHandle(ref, () => ({
    spin,
    isSpinning
  }));

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="relative w-full select-none" ref={containerRef}>
      
      {/* Slasher Needle / Reticle (Top and Bottom Blood Arrows with Central Razor Line) */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-between">
        <div className="relative flex flex-col items-center -mt-2">
          <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-t-[22px] border-t-[#d80000] drop-shadow-[0_0_14px_rgba(216,0,0,1)]" />
        </div>

        <div className="w-[3px] h-full bg-[#d80000] animate-laser" />

        <div className="relative flex flex-col items-center -mb-2">
          <div className="w-0 h-0 border-l-[13px] border-l-transparent border-r-[13px] border-r-transparent border-b-[22px] border-b-[#d80000] drop-shadow-[0_0_14px_rgba(216,0,0,1)]" />
        </div>
      </div>

      {/* Transparent Vignettes */}
      <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-48 z-20 pointer-events-none bg-gradient-to-r from-[#060607]/90 to-transparent" />
      <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-48 z-20 pointer-events-none bg-gradient-to-l from-[#060607]/90 to-transparent" />

      {/* Transparent Roulette Viewport Window */}
      <div className="relative overflow-hidden py-8 px-2 bg-transparent shadow-none border-y border-white/5">
        
        {/* Animated Track */}
        <div
          ref={trackRef}
          className="flex items-center will-change-transform"
          style={{
            gap: `${CARD_MARGIN}px`,
            transform: 'translate3d(0px, 0, 0)'
          }}
        >
          {cards.map((card, idx) => {
            const isWhitePaper = idx % 2 === 0;

            return (
              <div
                key={card.id || idx}
                style={{
                  width: `${CARD_WIDTH}px`,
                  minWidth: `${CARD_WIDTH}px`,
                  height: '176px'
                }}
                className={`relative flex items-center justify-center p-3 select-none transition-transform duration-200 ${
                  isWhitePaper ? 'torn-ticket' : 'torn-ticket-dark border border-white/10'
                }`}
              >
                <div className="absolute inset-0 paper-texture pointer-events-none" />

                <div className={`absolute top-2 left-2 text-[10px] font-mono font-bold tracking-widest ${
                  isWhitePaper ? 'text-black/40' : 'text-white/30'
                }`}>
                  NO. {card.number}
                </div>

                {/* Extra Bold & 10% Larger Number */}
                <div className="relative z-10 text-center">
                  <span
                    className={`text-6xl sm:text-7xl font-scary font-black tracking-wider block ${
                      isWhitePaper
                        ? 'text-[#0f0f10] drop-shadow-sm font-extrabold'
                        : 'text-white drop-shadow-[0_3px_15px_rgba(216,0,0,0.7)] font-extrabold'
                    }`}
                  >
                    {card.formatted}
                  </span>
                </div>

                <div className={`absolute bottom-2 right-2 text-[9px] font-mono tracking-tighter ${
                  isWhitePaper ? 'text-black/30' : 'text-white/20'
                }`}>
                  ||| | |||| | ||
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
});

HorizontalRoulette.displayName = 'HorizontalRoulette';
