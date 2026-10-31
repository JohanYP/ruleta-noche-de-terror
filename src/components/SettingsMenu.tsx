import { FormEvent, useEffect, useRef, useState } from 'react';
import { Minus, Plus, Settings, X } from 'lucide-react';
import { DURATION_PRESETS_S, MIN_DURATION_S } from '../config/roulette';
import { isValidDuration } from '../hooks/useSpinDuration';

interface SettingsMenuProps {
  duration: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
  zoom?: number;
}

export function SettingsMenu({ duration, onChange, disabled, zoom = 1 }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(String(duration));
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const draftNum = Number(draft);
  const valid = draft !== '' && isValidDuration(draftNum);

  useEffect(() => {
    if (!open) return;
    setDraft(String(duration));
    requestAnimationFrame(() => inputRef.current?.select());

    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onChange(draftNum);
    setOpen(false);
  };

  const nudge = (delta: number) => {
    const base = draft === '' ? MIN_DURATION_S : draftNum;
    setDraft(String(Math.max(MIN_DURATION_S, base + delta)));
  };

  return (
    <div ref={rootRef} className="fixed top-3 right-3 sm:top-5 sm:right-5 z-40" style={{ zoom }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-label="Configuración"
        aria-expanded={open}
        title={disabled ? 'Disponible al terminar el giro' : 'Configuración'}
        className={`glass-btn settings-trigger ios-press w-12 h-12 sm:w-14 sm:h-14 ${open ? 'is-open' : ''}`}
      >
        <Settings className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>

      <div className={`settings-panel glass-panel ${open ? 'is-open' : ''}`} role="dialog" aria-label="Configuración de la ruleta">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-scary text-2xl tracking-wider text-white">Configuración</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="ios-press p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <label htmlFor="spin-duration" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            Duración del giro
          </label>

          <div className={`duration-field ${valid ? '' : 'is-invalid'}`}>
            <button type="button" onClick={() => nudge(-5)} disabled={draft !== '' && draftNum <= MIN_DURATION_S} aria-label="Restar 5 segundos" className="duration-step ios-press">
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex items-baseline justify-center gap-1 flex-1 min-w-0">
              <input
                ref={inputRef}
                id="spin-duration"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
                className="duration-input font-scary"
                aria-invalid={!valid}
                aria-describedby="spin-duration-hint"
              />
              <span className="text-white/50 text-lg font-semibold">s</span>
            </div>
            <button type="button" onClick={() => nudge(5)} aria-label="Sumar 5 segundos" className="duration-step ios-press">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS_S.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDraft(String(s))}
                className={`preset-chip ios-press ${draftNum === s ? 'is-active' : ''}`}
              >
                {s} s
              </button>
            ))}
          </div>

          <p id="spin-duration-hint" className={`text-xs leading-relaxed transition-colors ${valid ? 'text-white/45' : 'text-red-400'}`}>
            {valid
              ? `Solo números enteros. Mínimo ${MIN_DURATION_S} segundos, sin máximo.`
              : `Ingresa un número de al menos ${MIN_DURATION_S} segundos.`}
          </p>

          <button type="submit" disabled={!valid} className="save-btn ios-press">
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
