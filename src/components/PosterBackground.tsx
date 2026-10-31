import bgUrl from '../assets/images/bg-ruleta-del-terror.jpg';

// Page background. Landscape: the sharp poster fills the whole screen, with the overlays
// on top. Portrait: a blurred copy behind the poster shown whole by PosterArt.
export function PosterBackdrop({ stage }: { stage: boolean }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden>
      <img
        src={bgUrl}
        alt=""
        className={`w-full h-full object-cover object-center ${stage ? '' : 'poster-backdrop'}`}
      />
      {stage && <PosterOverlays />}
    </div>
  );
}

// Portrait only: the whole poster on top of the page
export function PosterArt() {
  return (
    <>
      <img src={bgUrl} alt="" aria-hidden className="pointer-events-none select-none relative w-full aspect-[16/9] object-contain" />
      <PosterOverlays />
    </>
  );
}

// Bottom fade for readability + overlay that darkens the scene as the wheel slows (--tension)
function PosterOverlays() {
  return (
    <>
      <div className="poster-fade absolute inset-x-0 bottom-0 h-1/2 pointer-events-none" />
      <div className="tension-overlay absolute inset-0 pointer-events-none" />
    </>
  );
}
