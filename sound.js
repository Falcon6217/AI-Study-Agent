/**
 * CogniStudy AI - Sound Engine (Web Audio API Synthesizer)
 * Generates high quality ambient focus audio (Rain, White Noise, Binaural Beats)
 * and notification chimes purely through procedural audio synthesis.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = {};
    this.volumes = {
      rain: 0.5,
      whitenoise: 0.5,
      binaural: 0.5
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Rain Audio Generator (Pink Noise + Lowpass Filter + Resonance) ---
  toggleRain(enable, volume = 0.5) {
    this.init();
    if (enable) {
      if (this.activeNodes.rain) return;
      
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;

      const gain = this.ctx.createGain();
      gain.gain.value = volume;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      this.activeNodes.rain = { source: whiteNoise, gain: gain, filter: filter };
    } else {
      if (this.activeNodes.rain) {
        this.activeNodes.rain.source.stop();
        this.activeNodes.rain.source.disconnect();
        delete this.activeNodes.rain;
      }
    }
  }

  // --- White Noise Generator ---
  toggleWhiteNoise(enable, volume = 0.5) {
    this.init();
    if (enable) {
      if (this.activeNodes.whitenoise) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.value = volume * 0.15; // attenuated for comfort

      whiteNoise.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      this.activeNodes.whitenoise = { source: whiteNoise, gain: gain };
    } else {
      if (this.activeNodes.whitenoise) {
        this.activeNodes.whitenoise.source.stop();
        this.activeNodes.whitenoise.source.disconnect();
        delete this.activeNodes.whitenoise;
      }
    }
  }

  // --- 432Hz Alpha Wave Binaural Tone Generator ---
  toggleBinaural(enable, volume = 0.5) {
    this.init();
    if (enable) {
      if (this.activeNodes.binaural) return;

      // Base carrier frequency 216Hz + 10Hz Alpha difference (216Hz Left, 226Hz Right)
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.value = 216;
      oscR.frequency.value = 226;

      const merger = this.ctx.createChannelMerger(2);
      const gain = this.ctx.createGain();
      gain.gain.value = volume * 0.25;

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gain);
      gain.connect(this.ctx.destination);

      oscL.start();
      oscR.start();
      this.activeNodes.binaural = { oscL, oscR, gain };
    } else {
      if (this.activeNodes.binaural) {
        this.activeNodes.binaural.oscL.stop();
        this.activeNodes.binaural.oscR.stop();
        delete this.activeNodes.binaural;
      }
    }
  }

  setVolume(soundType, val) {
    this.volumes[soundType] = val;
    if (this.activeNodes[soundType] && this.activeNodes[soundType].gain) {
      let multiplier = 1;
      if (soundType === 'whitenoise') multiplier = 0.15;
      if (soundType === 'binaural') multiplier = 0.25;
      this.activeNodes[soundType].gain.gain.setTargetAtTime(val * multiplier, this.ctx.currentTime, 0.05);
    }
  }

  // --- Notification Chime (Completion Bell) ---
  playChime() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  }
}

window.soundEngine = new SoundEngine();
