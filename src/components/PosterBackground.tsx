import bgUrl from '../assets/images/bg-ruleta-del-terror.jpg';

// Full-viewport blurred copy of the poster that fills the letterbox bars around the stage
export function PosterBackdrop() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden>
      <img src={bgUrl} alt="" className="poster-backdrop w-full h-full object-cover object-center" />
    </div>
  );
}

// The sharp, uncropped poster plus the overlay that darkens it as the wheel slows (--tension)
export function PosterArt({ stage }: { stage: boolean }) {
  return (
    <>
      <img
        src={bgUrl}
        alt=""
        aria-hidden
        className={`pointer-events-none select-none ${stage ? 'absolute inset-0 w-full h-full' : 'relative w-full aspect-[16/9] object-contain'}`}
      />
      <div className="poster-fade absolute inset-x-0 bottom-0 h-1/2 pointer-events-none" />
      <div className="tension-overlay absolute inset-0 pointer-events-none" />
    </>
  );
}
