import { FC } from 'react';
import { RouletteCard } from '../utils/helpers';
import { RotateCcw, X } from 'lucide-react';

interface WinnerModalProps {
  winner: RouletteCard;
  onClose: () => void;
  onSpinAgain: () => void;
}

export const WinnerModal: FC<WinnerModalProps> = ({ winner, onClose, onSpinAgain }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl sm:max-w-5xl md:max-w-6xl flex flex-col items-center gap-4 sm:gap-6 my-auto">
        
        {/* The Graphic Ticket: 60% Larger */}
        <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-red-600/40 shadow-[0_0_120px_rgba(216,0,0,0.65)] animate-winner select-none">
          {/* Background Ticket Image */}
          <img
            src="/winner-ticket-bg.jpg"
            alt="Boleto Ganador Noche de Terror"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Dynamic Winner Number accurately positioned inside the White Ticket cutout */}
          <div className="absolute top-[64%] left-[49%] -translate-x-1/2 -translate-y-1/2 w-[52%] h-[32%] flex items-center justify-center pointer-events-none">
            <span className="font-scary font-black text-6xl sm:text-8xl md:text-9xl tracking-wider text-[#0a0a0c] drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] leading-none">
              {winner.formatted}
            </span>
          </div>

          {/* The Single Close (X) Icon Top-Right */}
          <button
            onClick={onClose}
            className="ios-press absolute top-3 right-3 sm:top-6 sm:right-6 p-2.5 rounded-full bg-black/70 text-white hover:bg-black/90 border border-white/20 z-20 shadow-lg"
            aria-label="Cerrar"
            title="Cerrar"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Sole Action Below: Pure Rotate Icon Button (No text, transparent Apple Glass) */}
        <div className="flex items-center justify-center mt-1 select-none">
          <button
            onClick={onSpinAgain}
            title="Girar de nuevo"
            aria-label="Girar de nuevo"
            className="ios-press w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#d80000]/30 hover:bg-[#d80000]/50 text-white shadow-[0_0_35px_rgba(216,0,0,0.7)] hover:shadow-[0_0_60px_rgba(255,20,20,0.95)] flex items-center justify-center border-2 border-red-500/60 backdrop-blur-xl transition-all"
          >
            <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.4]" />
          </button>
        </div>

      </div>
    </div>
  );
};
