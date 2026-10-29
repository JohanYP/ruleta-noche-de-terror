// High-quality Horror sound manager with Web Audio API pre-buffering
class SoundFX {
  private ctx: AudioContext | null = null;
  private tickBuffer: AudioBuffer | null = null;
  private winnerBuffer: AudioBuffer | null = null;
  private isLoaded = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.isLoaded) {
      this.loadAudioFiles();
    }
  }

  private async loadAudioFiles() {
    if (this.isLoaded || !this.ctx) return;
    this.isLoaded = true;
    try {
      const base = import.meta.env.BASE_URL || '/';
      const [tickRes, winnerRes] = await Promise.all([
        fetch(`${base}audio/horror-tick.wav`),
        fetch(`${base}audio/horror-winner.wav`)
      ]);
      const tickData = await tickRes.arrayBuffer();
      const winnerData = await winnerRes.arrayBuffer();
      if (this.ctx) {
        this.tickBuffer = await this.ctx.decodeAudioData(tickData);
        this.winnerBuffer = await this.ctx.decodeAudioData(winnerData);
      }
    } catch (e) {
      console.warn('Audio pre-buffer fallback enabled', e);
    }
  }

  // Full, non-cut resonant gothic church BONG. Each instance plays independently on overlapping polyphonic voices.
  playTick() {
    try {
      this.init();
      if (!this.ctx) return;

      if (this.tickBuffer) {
        const src = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        src.buffer = this.tickBuffer;
        // Natural full playback rate, full sustain tail without cutting
        src.playbackRate.setValueAtTime(1.0, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        src.connect(gain);
        gain.connect(this.ctx.destination);
        src.start();
        return;
      }

      // Procedural fallback
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch {}
  }

  // Terrifying 4-second cinematic horror impact upon winning
  playImpact() {
    try {
      this.init();
      if (!this.ctx) return;

      if (this.winnerBuffer) {
        const src = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        src.buffer = this.winnerBuffer;
        gain.gain.setValueAtTime(0.9, this.ctx.currentTime);
        src.connect(gain);
        gain.connect(this.ctx.destination);
        src.start();
        return;
      }

      const now = this.ctx.currentTime;
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sawtooth';
      sub.frequency.setValueAtTime(120, now);
      sub.frequency.exponentialRampToValueAtTime(30, now + 1.2);
      subGain.gain.setValueAtTime(0.8, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      sub.connect(subGain);
      subGain.connect(this.ctx.destination);
      sub.start(now);
      sub.stop(now + 1.2);
    } catch {}
  }
}

export const sound = new SoundFX();
