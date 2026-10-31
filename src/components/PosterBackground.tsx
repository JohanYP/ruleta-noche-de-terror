import bgUrl from '../assets/images/bg-ruleta-del-terror.jpg';

// Plain dark backdrop behind the poster: fills the bars when the screen isn't 16:9
export function PosterBackdrop() {
  return <div className="app-backdrop fixed inset-0 z-0 pointer-events-none" aria-hidden />;
}

// The poster, always shown whole and untouched (never cropped, stretched or darkened),
// plus the overlay that darkens the scene only while the wheel slows (--tension)
export function PosterArt({ stage }: { stage: boolean }) {
  return (
    <>
      <img
        src={bgUrl}
        alt=""
        aria-hidden
        className={`pointer-events-none select-none ${stage ? 'absolute inset-0 w-full h-full' : 'poster-fluid relative w-full aspect-[16/9]'}`}
      />
      <div className="tension-overlay absolute inset-0 pointer-events-none" />
    </>
  );
}
