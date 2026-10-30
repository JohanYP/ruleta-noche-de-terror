import confetti from 'canvas-confetti';

const BLOOD = ['#d80000', '#ffffff', '#ff2222', '#880000'];

export function fireWinnerConfetti() {
  try {
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: BLOOD });
    setTimeout(() => {
      confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0 }, colors: BLOOD.slice(0, 2) });
      confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1 }, colors: BLOOD.slice(0, 2) });
    }, 260);
  } catch {}
}
