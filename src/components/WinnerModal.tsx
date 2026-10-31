import { FC, useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { RouletteCard } from '../utils/helpers';
import ticketBgUrl from '../assets/images/winner-ticket-bg.jpg';

interface WinnerModalProps {
  winner: RouletteCard;
  onClose: () => void;
  onSpinAgain: () => void;
}

const EXIT_MS = 260;

export const WinnerModal: FC<WinnerModalProps> = ({ winner, onClose, onSpinAgain }) => {
  const [leaving, setLeaving] = useState(false);

  // Play the exit animation before unmounting
  const leave = (then: () => void) => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(then, EXIT_MS);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && leave(onClose);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return (
    <div
      className={`winner-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto ${leaving ? 'is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Número ganador ${winner.formatted}`}
    >
      <div className="winner-wrap relative flex flex-col items-center my-auto">
        <div className="winner-ticket relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-red-600/40 select-none">
          <img
            src={ticketBgUrl}
            alt="Boleto Ganador Noche de Terror"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Winner number positioned inside the white ticket cutout */}
          <div className="absolute top-[64%] left-[49%] -translate-x-1/2 -translate-y-1/2 w-[52%] h-[32%] flex items-center justify-center pointer-events-none">
            <span className="winner-number font-scary font-black tracking-wider text-[#0a0a0c] leading-none">
              {winner.formatted}
            </span>
          </div>

          <button
            onClick={() => leave(onClose)}
            className="winner-close ios-press absolute rounded-full bg-black/70 text-white hover:bg-black/90 border border-white/20 z-20 shadow-lg"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <X className="w-1/2 h-1/2" />
          </button>
        </div>

        <button
          onClick={() => leave(onSpinAgain)}
          title="Girar de nuevo"
          aria-label="Girar de nuevo"
          className="spin-again glass-btn ios-press"
        >
          <RotateCcw className="w-1/2 h-1/2 stroke-[2.4]" />
        </button>
      </div>
    </div>
  );
};
