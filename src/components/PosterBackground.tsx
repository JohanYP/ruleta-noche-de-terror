import bgUrl from '../assets/images/bg-ruleta-del-terror.jpg';

// Event poster + overlay that darkens and tints red as the wheel slows (driven by --tension)
export function PosterBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden>
      <img src={bgUrl} alt="" className="poster-bg w-full h-full object-cover object-center" />
      <div className="poster-fade absolute inset-x-0 bottom-0 h-1/2" />
      <div className="tension-overlay absolute inset-0" />
    </div>
  );
}
