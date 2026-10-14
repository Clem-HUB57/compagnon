// Petits sons synthétisés localement (aucun fichier audio, aucun réseau).
// Doux, courts, et désactivables à tout moment depuis l'app.
//
// Particularités iPhone / iPad (Safari) prises en compte :
// - le son doit être « débloqué » par un premier toucher de l'utilisateur ;
// - le contexte audio peut passer en état « interrupted » (appel, retour d'arrière-plan) ;
// - par défaut, Safari traite le son des pages comme un son d'ambiance, coupé par le mode
//   silencieux et parfois inaudible : on demande la catégorie « playback » quand elle existe.

type SoundName = 'etape' | 'fin' | 'niveau' | 'tap' | 'trouvaille';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (session) session.type = 'playback';
    } catch {
      /* API absente : sans conséquence */
    }
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  return ctx;
}

function ensureRunning(ac: AudioContext): Promise<void> {
  if (ac.state === 'running') return Promise.resolve();
  return ac.resume().catch(() => undefined);
}

/** Joue un son muet pour débloquer l'audio sur iOS. À appeler pendant un geste de l'utilisateur. */
function unlock() {
  const ac = audio();
  if (!ac) return;
  ensureRunning(ac);
  if (unlocked) return;
  try {
    const buffer = ac.createBuffer(1, 1, 22050);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.connect(ac.destination);
    src.start(0);
    unlocked = true;
  } catch {
    /* ignoré */
  }
}

/** Installe le déblocage audio sur les premiers gestes et la reprise au retour dans l'app. */
export function setupAudioUnlock() {
  if (typeof window === 'undefined') return;
  const opts = { capture: true, passive: true } as const;
  for (const ev of ['touchend', 'pointerdown', 'click', 'keydown']) window.addEventListener(ev, unlock, opts);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ctx) ensureRunning(ctx);
  });
}

function note(ac: AudioContext, out: AudioNode, freq: number, start: number, duration: number, volume: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  const t0 = ac.currentTime + 0.01 + start;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(out);
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
    if (!ac || !master) return;
    const out = master;
    const volume = name === 'tap' ? 0.12 : 0.25;
    const play = () => {
      for (const [freq, start, dur] of PATTERNS[name]) note(ac, out, freq, start, dur, volume);
    };
    // On attend que le contexte tourne avant de programmer les notes (sinon iOS les perd).
    if (ac.state === 'running') play();
    else ensureRunning(ac).then(play);
  } catch {
    /* le son est un bonus : jamais bloquant */
  }
}

/** Petite vibration de validation (Android ; l'iPhone ne la permet pas depuis le web). */
export function haptic(ms = 25) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignoré */
  }
}
