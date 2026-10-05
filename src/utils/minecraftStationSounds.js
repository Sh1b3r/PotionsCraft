// Authentic Minecraft Web Audio Synthesizer for Brewing and Crafting Station

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Item click / pop sound
 */
export function playItemClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
}

/**
 * Successful craft sound (Minecraft pop)
 */
export function playCraftSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

/**
 * Fuel refuel sound (flame whoosh)
 */
export function playRefuelSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {}
}

/**
 * Potion brewed celebration sound (bubble glug + chime)
 */
export function playPotionBrewedSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Glug 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(320, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.09);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.1);

    // Glug 2
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(420, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.22, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.12);
      } catch (e) {}
    }, 120);

    // Chime
    setTimeout(() => {
      try {
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(880, ctx.currentTime);
        osc3.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.25);
        gain3.gain.setValueAtTime(0.18, ctx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.35);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start();
        osc3.stop(ctx.currentTime + 0.35);
      } catch (e) {}
    }, 240);
  } catch (e) {}
}
