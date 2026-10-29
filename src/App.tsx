import { useState, useRef } from 'react';
import { HorizontalRoulette, RouletteHandle } from './components/HorizontalRoulette';
import { WinnerModal } from './components/WinnerModal';
import { RouletteCard } from './utils/helpers';
import confetti from 'canvas-confetti';
import { Play } from 'lucide-react';

export default function App() {
  const rouletteRef = useRef<RouletteHandle>(null);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteCard | null>(null);

  const handleStartSpin = () => {
    if (spinning) return;
    rouletteRef.current?.spin();
  };

  const handleSpinStart = () => {
    setSpinning(true);
    setWinner(null);
  };

  const handleSpinEnd = (winningCard: RouletteCard) => {
    setSpinning(false);
    setWinner(winningCard);

    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#d80000', '#ffffff', '#ff2222', '#880000']
      });
      setTimeout(() => {
        confetti({
          particleCount: 65,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#d80000', '#ffffff']
        });
        confetti({
          particleCount: 65,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#d80000', '#ffffff']
        });
      }, 260);
    } catch {}
  };

  return (
    <div className="min-h-screen w-full bg-[#060607] text-[#f1f1f1] flex flex-col justify-between selection:bg-red-600 relative overflow-hidden">
      
      {/* 100% Original, Clean & Bright Background Graphic (No darkening, no heavy vignettes) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}bg-noche-de-terror.jpg`}
          alt="Noche de Terror Background"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Top Open Area so the entire upper half of the poster (logo, Ghostface, bottle) is 100% uncovered */}
      <div className="w-full h-[48vh] sm:h-[54vh] md:h-[58vh] relative z-10 pointer-events-none" />

      {/* Main Roulette Stage: Positioned in the lower third of the screen */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-6 flex flex-col items-center justify-center gap-4 sm:gap-6 pb-6">
        
        {/* Transparent Horizontal Roulette Component */}
        <div className="w-full max-w-6xl mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
          <HorizontalRoulette
            ref={rouletteRef}
            onSpinStart={handleSpinStart}
            onSpinEnd={handleSpinEnd}
            soundEnabled={true}
          />
        </div>

        {/* Transparent Apple Glass Spin Button */}
        <div className="w-full max-w-xs sm:max-w-md px-4 pt-1">
          <button
            onClick={handleStartSpin}
            disabled={spinning}
            className={`ios-press w-full py-4 sm:py-5 px-8 sm:px-12 rounded-full font-scary font-black text-2xl sm:text-3xl md:text-4xl tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3.5 shadow-2xl backdrop-blur-2xl ${
              spinning
                ? 'bg-black/50 text-white/30 cursor-not-allowed border border-white/10'
                : 'bg-[#d80000]/40 hover:bg-[#d80000]/60 text-white shadow-[0_0_45px_rgba(216,0,0,0.75)] hover:shadow-[0_0_75px_rgba(255,20,20,1)] border-2 border-red-500/70 hover:scale-[1.02]'
            }`}
          >
            {spinning ? (
              <>
                <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <span>GIRANDO...</span>
              </>
            ) : (
              <>
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white" />
                <span>¡GIRAR RULETA!</span>
              </>
            )}
          </button>
        </div>

      </main>

      {/* Bottom Spacer */}
      <div className="w-full h-8 sm:h-12 relative z-10" />

      {/* Winner Celebration Modal */}
      {winner && (
        <WinnerModal
          winner={winner}
          onClose={() => setWinner(null)}
          onSpinAgain={() => {
            setWinner(null);
            setTimeout(() => handleStartSpin(), 150);
          }}
        />
      )}

    </div>
  );
}
