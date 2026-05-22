// growth-tracker Web Audio Synthesis Engine
// Pure JS harmonic sound synthesizer (No external audio file dependencies)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('growth_audio_muted') === 'true';
  }

  // Safe AudioContext initializer on user interaction
  _initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    // Resume context if suspended (browser security autoplays)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('growth_audio_muted', this.muted);
    return this.muted;
  }

  // 1. Synthesizes a beautiful metallic coin chime & register click (Ideal for Spends)
  playCashRegister() {
    if (this.muted) return;
    const ctx = this._initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // A. The Metallic Coin "Click" (High Frequency transient)
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // B. The High-pitched register bell ring (Pure resonance)
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();

    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(2489.02, now); // D#7 (beautiful crystal resonance)
    
    // Add micro vibrato frequency modulation
    bellOsc.frequency.linearRampToValueAtTime(2500, now + 0.1);

    bellGain.gain.setValueAtTime(0.04, now);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    bellOsc.connect(bellGain);
    bellGain.connect(ctx.destination);

    // Start & Stop
    noiseNode.start(now);
    noiseNode.stop(now + 0.05);

    bellOsc.start(now);
    bellOsc.stop(now + 0.4);
  }

  // 2. Synthesizes a warm harmonic ascending chime (Ideal for Deposits / Actions)
  playSuccessChime() {
    if (this.muted) return;
    const ctx = this._initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      523.25, // C5
      659.25, // E5
      783.99  // G5
    ];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  }

  // 3. Synthesizes an ascending vintage-arcade fanfare sweeps (Ideal for Level Up / Milestones)
  playLevelUp() {
    if (this.muted) return;
    const ctx = this._initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Major scale arpeggio
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    arpeggio.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Triangle waves have a lovely smooth chiptune warmth
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now + idx * 0.06);
      filter.Q.setValueAtTime(4, now + idx * 0.06);

      gain.gain.setValueAtTime(0.0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.06 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }
}

// Global Sound Engine Instance
window.soundEngine = new SoundEngine();
