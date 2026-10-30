// Slasher needle: top and bottom blood arrows joined by a pulsing laser line
export function RouletteNeedle() {
  return (
    <div className="roulette-needle absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-between">
      <div className="needle-arrow needle-arrow-top -mt-2" />
      <div className="needle-line" />
      <div className="needle-arrow needle-arrow-bottom -mb-2" />
    </div>
  );
}
