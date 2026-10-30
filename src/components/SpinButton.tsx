import { Play } from 'lucide-react';

interface SpinButtonProps {
  spinning: boolean;
  durationS: number;
  onClick: () => void;
}

export function SpinButton({ spinning, durationS, onClick }: SpinButtonProps) {
  return (
    <div className="w-full max-w-xs sm:max-w-md px-4 flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        disabled={spinning}
        className={`spin-btn ios-press font-scary ${spinning ? 'is-spinning' : ''}`}
      >
        <span className="spin-btn-shine" aria-hidden />
        {spinning ? (
          <>
            <span className="w-6 h-6 sm:w-7 sm:h-7 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <span>GIRANDO...</span>
          </>
        ) : (
          <>
            <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
            <span>¡GIRAR RULETA!</span>
          </>
        )}
      </button>
      <span className="font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/50 drop-shadow">
        Giro de {durationS} s
      </span>
    </div>
  );
}
