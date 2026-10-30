import tickUrl from '../assets/audio/horror-tick.wav';
import winnerUrl from '../assets/audio/horror-winner.wav';

// Horror sound manager with Web Audio API Dynamics Compressor (anti-clipping)
class SoundFX {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private tickBuffer: AudioBuffer | null = null;
  private winnerBuffer: AudioBuffer | null = null;
  private isLoaded = false;
  private lastTickTime = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      // Pre-warm audio on the first user interaction (browsers block autoplay)
      window.addEventListener('click', () => this.init(), { once: true });
      window.addEventListener('touchstart', () => this.init(), { once: true });
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        const now = this.ctx.currentTime;

        // Compressor prevents clipping when ticks, heartbeats and impact overlap
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-12, now);
        this.compressor.knee.setValueAtTime(10, now);
        this.compressor.ratio.setValueAtTime(8, now);
        this.compressor.attack.setValueAtTime(0.003, now);
        this.compressor.release.setValueAtTime(0.2, now);

        const masterGain = this.ctx.createGain();
        masterGain.gain.setValueAtTime(0.85, now);

        this.compressor.connect(masterGain);
        masterGain.connect(this.ctx.destination);
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
      const [tickData, winnerData] = await Promise.all(
        [tickUrl, winnerUrl].map((url) => fetch(url).then((r) => r.arrayBuffer()))
      );
      this.tickBuffer = await this.ctx.decodeAudioData(tickData);
      this.winnerBuffer = await this.ctx.decodeAudioData(winnerData);
    } catch (e) {
      console.warn('Audio pre-buffer error:', e);
    }
  }

  private playBuffer(buffer: AudioBuffer | null, volume: number, rate = 1) {
    if (!this.ctx || !this.compressor || !buffer) return;
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    src.buffer = buffer;
    src.playbackRate.setValueAtTime(rate, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    src.connect(gain);
    gain.connect(this.compressor);
    src.start();
  }

  // Gothic BONG per card. tension 0..1: louder and slightly deeper as the wheel slows down
  playTick(tension = 0) {
    try {
      this.init();
      const now = performance.now();
      // Debounce: minimum 80ms between hits so rapid cards don't blur into noise
      if (now - this.lastTickTime < 80) return;
      this.lastTickTime = now;
      this.playBuffer(this.tickBuffer, 0.45 + 0.4 * tension, 1 - 0.12 * tension);
    } catch {}
  }

  // Synthesized double heartbeat "lub-dub" that builds suspense during the final crawl
  playHeartbeat(intensity = 1) {
    try {
      this.init();
      const ctx = this.ctx;
      if (!ctx || !this.compressor) return;
      const t0 = ctx.currentTime;
      [
        { offset: 0, freq: 64, peak: 0.95 },
        { offset: 0.19, freq: 54, peak: 0.65 }
      ].forEach(({ offset, freq, peak }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = t0 + offset;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(36, start + 0.18);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(peak * (0.35 + 0.65 * intensity), start + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.26);
        osc.connect(gain);
        gain.connect(this.compressor!);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {}
  }

  // Cinematic horror impact upon winning
  playImpact() {
    try {
      this.init();
      this.playBuffer(this.winnerBuffer, 0.9);
    } catch {}
  }
}

export const sound = new SoundFX();
