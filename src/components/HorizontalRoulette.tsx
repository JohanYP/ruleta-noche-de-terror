import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { REVEAL_DELAY_MS } from '../config/roulette';
import { useCardMetrics } from '../hooks/useCardMetrics';
import { RouletteCard, formatNum, randomTicketNumber } from '../utils/helpers';
import { sound } from '../utils/sound';
import { cardsToTravel, createSpinProfile, positionAt, tensionAt } from '../utils/spinProfile';
import { RouletteNeedle } from './RouletteNeedle';
import { TicketSlot } from './TicketSlot';

export interface RouletteHandle {
  spin: (durationS: number) => void;
}

interface RouletteProps {
  onSpinStart?: () => void;
  onSpinEnd?: (winner: RouletteCard) => void;
  soundEnabled?: boolean;
}

// Extra cards rendered beyond the visible width so nothing pops in at the edges
const SLOT_BUFFER = 5;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const setTension = (value: number) =>
  document.documentElement.style.setProperty('--tension', value.toFixed(3));

/**
 * Infinite horizontal track. Only a small pool of DOM cards exists; they are recycled
 * every frame, so a spin can last any number of seconds without growing the DOM.
 * Scroll position is stored in "card units" so it survives card size changes.
 */
export const HorizontalRoulette = forwardRef<RouletteHandle, RouletteProps>(({
  onSpinStart,
  onSpinEnd,
  soundEnabled = true
}, ref) => {
  const metrics = useCardMetrics();
  const [slotCount, setSlotCount] = useState(12);

  // Refs mirror state so the animation loop always reads current values
  const metricsRef = useRef(metrics);
  metricsRef.current = metrics;
  const slotCountRef = useRef(slotCount);
  slotCountRef.current = slotCount;
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollRef = useRef(0);
  const numbersRef = useRef(new Map<number, number>());
  const spinningRef = useRef(false);
  const lastCenterRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  const numberAt = (idx: number) => {
    let n = numbersRef.current.get(idx);
    if (n === undefined) {
      n = randomTicketNumber();
      numbersRef.current.set(idx, n);
    }
    return n;
  };

  // Positions the slot pool for the current scroll and returns the index under the needle
  const render = (): number => {
    const { width, gap } = metricsRef.current;
    const step = width + gap;
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const centerCards = containerWidth / 2 / step;
    const scroll = scrollRef.current;
    const slots = slotRefs.current.slice(0, slotCountRef.current);
    const first = Math.floor(scroll) - 2;

    for (let k = 0; k < slots.length; k++) {
      const idx = first + k;
      const el = slots[((idx % slots.length) + slots.length) % slots.length];
      if (!el) continue;

      const x = (idx - scroll) * step;
      const focus = Math.max(0, 1 - Math.abs(x + width / 2 - containerWidth / 2) / step);
      el.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) scale(${(1 + 0.12 * focus).toFixed(4)})`;
      el.style.setProperty('--focus', focus.toFixed(3));
      el.style.zIndex = focus > 0.5 ? '2' : '1';

      if (el.dataset.idx !== String(idx)) {
        const num = numberAt(idx);
        el.dataset.idx = String(idx);
        el.dataset.tone = Math.abs(idx) % 2 === 0 ? 'light' : 'dark';
        el.classList.remove('is-winner');
        el.querySelector('[data-num]')!.textContent = formatNum(num);
        el.querySelector('[data-serial]')!.textContent = `NO. ${num}`;
      }
    }

    return Math.floor(scroll + centerCards + gap / 2 / step);
  };

  const updateReadout = (idx: number, tension: number, animate: boolean) => {
    const el = readoutRef.current;
    if (!el) return;
    el.textContent = formatNum(numberAt(idx));
    if (animate && !prefersReducedMotion()) {
      el.animate(
        [
          { transform: 'scale(1.22)', filter: 'brightness(1.8)' },
          { transform: 'scale(1)', filter: 'brightness(1)' }
        ],
        { duration: 140 + 260 * tension, easing: 'cubic-bezier(.2,.8,.2,1)' }
      );
    }
  };

  const shake = (tension: number) => {
    if (prefersReducedMotion()) return;
    const amp = 1.5 + 3.5 * tension;
    shakeRef.current?.animate(
      [
        { transform: 'translate3d(0,0,0)' },
        { transform: `translate3d(0,${amp}px,0)` },
        { transform: 'translate3d(0,0,0)' }
      ],
      { duration: 170, easing: 'ease-out' }
    );
  };

  // Re-layout the pool whenever its size or the card size changes
  useLayoutEffect(() => {
    slotRefs.current.forEach((el) => el && delete el.dataset.idx);
    const center = render();
    if (lastCenterRef.current === null) updateReadout(center, 0, false);
    lastCenterRef.current = center;
  }, [slotCount, metrics]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const step = metricsRef.current.width + metricsRef.current.gap;
      setSlotCount(Math.ceil(container.clientWidth / step) + SLOT_BUFFER);
      if (!spinningRef.current) render();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [metrics]);

  useEffect(() => () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    setTension(0);
  }, []);

  const spin = (durationS: number) => {
    const container = containerRef.current;
    if (spinningRef.current || !container) return;
    spinningRef.current = true;
    onSpinStart?.();
    slotRefs.current.forEach((el) => el?.classList.remove('is-winner'));
    rootRef.current?.classList.remove('is-stopped');

    const { width, gap } = metricsRef.current;
    const step = width + gap;
    const centerCards = container.clientWidth / 2 / step;
    const start = scrollRef.current;
    const winnerIdx = Math.floor(start + centerCards) + cardsToTravel(durationS);
    const winnerNumber = randomTicketNumber();
    numbersRef.current.set(winnerIdx, winnerNumber);

    // Land anywhere inside the winning ticket, not always dead center: near-misses add drama
    const jitter = ((Math.random() * 2 - 1) * width * 0.36) / step;
    const target = winnerIdx + width / 2 / step - centerCards + jitter;
    const profile = createSpinProfile(durationS, target - start);

    const t0 = performance.now();
    let lastBeat = 0;

    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      scrollRef.current = start + positionAt(profile, t);
      const tension = tensionAt(profile, t);
      setTension(tension);

      const center = render();
      if (center !== lastCenterRef.current) {
        lastCenterRef.current = center;
        updateReadout(center, tension, true);
        if (soundEnabled) sound.playTick(tension);
        if (tension > 0.55) shake(tension);
      }
      if (soundEnabled && tension > 0.2 && now - lastBeat > 1050 - 500 * tension) {
        lastBeat = now;
        sound.playHeartbeat(tension);
      }

      if (t < profile.duration) {
        animFrameRef.current = requestAnimationFrame(frame);
        return;
      }

      // Stopped: highlight the winner, hold the suspense a moment, then reveal
      if (soundEnabled) sound.playImpact();
      slotRefs.current.find((el) => el?.dataset.idx === String(winnerIdx))?.classList.add('is-winner');
      rootRef.current?.classList.add('is-stopped');
      revealTimerRef.current = window.setTimeout(() => {
        spinningRef.current = false;
        setTension(0);
        onSpinEnd?.({ number: winnerNumber, formatted: formatNum(winnerNumber) });
      }, REVEAL_DELAY_MS);
    };

    animFrameRef.current = requestAnimationFrame(frame);
  };

  useImperativeHandle(ref, () => ({ spin }));

  return (
    <div ref={rootRef} className="relative w-full select-none">
      {/* Live readout: the number currently under the needle */}
      <div className="flex justify-center mb-2 sm:mb-3">
        <div className="live-readout">
          <span className="live-readout-label">Nº</span>
          <span ref={readoutRef} className="live-readout-value">----</span>
        </div>
      </div>

      <div className="roulette-window relative">
        <RouletteNeedle />

        <div
          ref={containerRef}
          className="roulette-viewport relative overflow-hidden"
          style={{ height: metrics.height + metrics.padY }}
        >
          <div ref={shakeRef} className="absolute inset-0">
            {Array.from({ length: slotCount }, (_, i) => (
              <TicketSlot
                key={i}
                ref={(el) => { slotRefs.current[i] = el; }}
                metrics={metrics}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

HorizontalRoulette.displayName = 'HorizontalRoulette';
