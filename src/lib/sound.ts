// Petits sons synthétisés localement (aucun fichier audio, aucun réseau).
// Doux, courts, et désactivables à tout moment.

type SoundName = 'etape' | 'fin' | 'niveau' | 'tap' | 'trouvaille';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
  return ctx;
}

function note(ac: AudioContext, freq: number, start: number, duration: number, volume = 0.08, type: OscillatorType = 'sine') {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + start;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

const PATTERNS: Record<SoundName, Array<[number, number, number]>> = {
  tap: [[660, 0, 0.08]],
  etape: [[587, 0, 0.18], [880, 0.09, 0.28]],
  trouvaille: [[784, 0, 0.2], [988, 0.12, 0.2], [1175, 0.24, 0.35]],
  fin: [[523, 0, 0.25], [659, 0.12, 0.25], [784, 0.24, 0.25], [1047, 0.36, 0.5]],
  niveau: [[523, 0, 0.2], [659, 0.1, 0.2], [784, 0.2, 0.2], [988, 0.3, 0.2], [1047, 0.4, 0.6]]
};

export function playSound(name: SoundName, enabled: boolean) {
  if (!enabled) return;
  try {
    const ac = audio();
    if (!ac) return;
    for (const [freq, start, dur] of PATTERNS[name]) note(ac, freq, start, dur, name === 'tap' ? 0.04 : 0.07, 'triangle');
  } catch {
    /* le son est un bonus : jamais bloquant */
  }
}
