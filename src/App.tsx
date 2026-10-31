import { CSSProperties, useRef, useState } from 'react';
import { HorizontalRoulette, RouletteHandle } from './components/HorizontalRoulette';
import { PosterArt, PosterBackdrop } from './components/PosterBackground';
import { SettingsMenu } from './components/SettingsMenu';
import { SpinButton } from './components/SpinButton';
import { WinnerModal } from './components/WinnerModal';
import { STAGE_HEIGHT, STAGE_WIDTH } from './config/roulette';
import { useSpinDuration } from './hooks/useSpinDuration';
import { useStageLayout } from './hooks/useStageLayout';
import { fireWinnerConfetti } from './utils/confetti';
import { RouletteCard } from './utils/helpers';

export default function App() {
  const rouletteRef = useRef<RouletteHandle>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteCard | null>(null);
  const [duration, setDuration] = useSpinDuration();
  const layout = useStageLayout();
  const isStage = layout.mode === 'stage';
  // Operator controls grow with the screen but never shrink below their normal size
  const uiZoom = isStage ? Math.max(1, layout.scale) : 1;

  const handleStartSpin = () => {
    if (spinning) return;
    rouletteRef.current?.spin(duration);
  };

  const handleSpinStart = () => {
    setSpinning(true);
    setWinner(null);
  };

  const handleSpinEnd = (winningCard: RouletteCard) => {
    setSpinning(false);
    setWinner(winningCard);
    fireWinnerConfetti(uiZoom);
  };

  // Stage: the scene is laid out at 1920×1080 and zoomed to fit, so nothing is ever cropped
  const stageStyle: CSSProperties = isStage
    ? { width: STAGE_WIDTH, height: STAGE_HEIGHT, zoom: layout.scale }
    : { width: '100%', minHeight: '100svh' };

  return (
    <div
      className={`layout-${layout.mode} relative w-full text-[#f1f1f1] selection:bg-red-600 ${
        isStage ? 'h-[100svh] overflow-hidden flex items-center justify-center' : 'min-h-[100svh]'
      }`}
    >
      <PosterBackdrop />

      <SettingsMenu duration={duration} onChange={setDuration} disabled={spinning} zoom={uiZoom} />

      <div className="stage relative z-10 flex flex-col overflow-hidden" style={stageStyle}>
        <PosterArt stage={isStage} />

        {/* Roulette sits in the dark lower area of the poster, below the title */}
        <main className={`stage-enter relative z-10 ${isStage ? 'mt-auto' : 'my-auto pt-6'} w-full mx-auto px-2 sm:px-6 flex flex-col items-center gap-3 sm:gap-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-8`}>
          <div className="roulette-frame w-full mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
            <HorizontalRoulette
              ref={rouletteRef}
              onSpinStart={handleSpinStart}
              onSpinEnd={handleSpinEnd}
            />
          </div>

          <SpinButton spinning={spinning} durationS={duration} onClick={handleStartSpin} />
        </main>
      </div>

      {winner && (
        <WinnerModal
          winner={winner}
          onClose={() => setWinner(null)}
          onSpinAgain={() => {
            setWinner(null);
            rouletteRef.current?.spin(duration);
          }}
        />
      )}
    </div>
  );
}
