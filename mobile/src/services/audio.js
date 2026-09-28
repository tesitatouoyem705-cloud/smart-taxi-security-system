// Web Audio API emergency police / panic siren synthesizer

let audioCtx = null;
let oscillator1 = null;
let oscillator2 = null;
let gainNode = null;
let lfo = null;
let isPlaying = false;

export const SirenAudio = {
  start() {
    if (isPlaying) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = new AudioContext();

      // Main Oscillator (Primary Tone)
      oscillator1 = audioCtx.createOscillator();
      oscillator1.type = "sawtooth";
      oscillator1.frequency.setValueAtTime(750, audioCtx.currentTime);

      // Secondary Oscillator for disharmonic urgency
      oscillator2 = audioCtx.createOscillator();
      oscillator2.type = "square";
      oscillator2.frequency.setValueAtTime(960, audioCtx.currentTime);

      // Low Frequency Oscillator (LFO) for sweeping siren effect (4Hz pitch sweep)
      lfo = audioCtx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(3.5, audioCtx.currentTime);

      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(350, audioCtx.currentTime); // sweep range ±350Hz

      lfo.connect(lfoGain);
      lfoGain.connect(oscillator1.frequency);
      lfoGain.connect(oscillator2.frequency);

      // Gain Node (Volume)
      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);

      // Master output
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator1.start();
      oscillator2.start();
      lfo.start();
      isPlaying = true;
    } catch (e) {
      console.warn("Audio siren synthesis not supported or blocked:", e);
    }
  },

  stop() {
    if (!isPlaying) return;
    try {
      if (oscillator1) oscillator1.stop();
      if (oscillator2) oscillator2.stop();
      if (lfo) lfo.stop();
      if (audioCtx) audioCtx.close();
    } catch (e) {
      // Ignored
    } finally {
      oscillator1 = null;
      oscillator2 = null;
      lfo = null;
      gainNode = null;
      audioCtx = null;
      isPlaying = false;
    }
  },

  playBeep(freq = 880, duration = 0.15) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  },

  isActive() {
    return isPlaying;
  },
};
