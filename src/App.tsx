import { useRef, useState } from 'react';
import { HorizontalRoulette, RouletteHandle } from './components/HorizontalRoulette';
import { PosterBackground } from './components/PosterBackground';
import { SettingsMenu } from './components/SettingsMenu';
import { SpinButton } from './components/SpinButton';
import { WinnerModal } from './components/WinnerModal';
import { useSpinDuration } from './hooks/useSpinDuration';
import { fireWinnerConfetti } from './utils/confetti';
import { RouletteCard } from './utils/helpers';

export default function App() {
  const rouletteRef = useRef<RouletteHandle>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteCard | null>(null);
  const [duration, setDuration] = useSpinDuration();

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
    fireWinnerConfetti();
  };

  return (
    <div className="min-h-[100svh] w-full flex flex-col text-[#f1f1f1] selection:bg-red-600 relative overflow-hidden">
      <PosterBackground />

      <SettingsMenu duration={duration} onChange={setDuration} disabled={spinning} />

      {/* Roulette stage sits in the dark lower area of the poster, below the title */}
      <main className="stage-enter relative z-10 mt-auto w-full mx-auto px-2 sm:px-6 flex flex-col items-center gap-3 sm:gap-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-8">
        <div className="w-full max-w-6xl lg:max-w-[60vw] mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
          <HorizontalRoulette
            ref={rouletteRef}
            onSpinStart={handleSpinStart}
            onSpinEnd={handleSpinEnd}
          />
        </div>

        <SpinButton spinning={spinning} durationS={duration} onClick={handleStartSpin} />
      </main>

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
