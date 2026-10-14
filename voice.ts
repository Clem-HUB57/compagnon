// Lecture à voix haute avec la synthèse vocale de l'appareil (gratuite, souvent sans réseau).
// La qualité dépend des voix installées : on choisit automatiquement la plus naturelle,
// et le parent peut en choisir une autre. Une étape peut aussi avoir une voix enregistrée
// par le parent (voir recordings.ts), qui passe alors en priorité.

export function voiceAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

let settings: { name?: string; rate: number } = { rate: 1 };

/** Réglages choisis par le parent (appelé par l'application quand ils changent). */
export function setVoiceSettings(next: { name?: string; rate?: number }) {
  settings = { name: next.name, rate: next.rate ?? 1 };
}

// Voix « fantaisie » ou très robotiques présentes sur iPhone et Mac.
const NOVELTY = /eddy|flo|grandma|grandpa|grand-m|grand-p|reed|rocko|sandy|shelley|bahh|bells|boing|bubbles|cellos|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|bad news|good news|fred|junior|ralph|kathy/i;

/** Note de « naturel » d'une voix, d'après ce que l'on sait des voix courantes. */
export function voiceScore(v: Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.replace('_', '-').toLowerCase();
  if (!lang.startsWith('fr')) return -100;
  let score = 0;
  if (lang === 'fr-fr') score += 10;
  if (NOVELTY.test(name)) score -= 50;
  if (/premium/.test(name)) score += 40;
  if (/enhanced|améliorée|amelioree|natural|neural|naturelle/.test(name)) score += 30;
  if (/google/.test(name)) score += 18;
  if (/online/.test(name)) score += 12;
  if (/audrey|amélie|amelie|aurélie|aurelie|marie|thomas|denise|vivienne|eloise|henri|remy|julie|hortense/.test(name)) score += 8;
  if (/compact/.test(name)) score -= 10;
  if (v.localService) score += 2;
  return score;
}

export function frenchVoices(): SpeechSynthesisVoice[] {
  if (!voiceAvailable()) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => voiceScore(v) > -40)
    .sort((a, b) => voiceScore(b) - voiceScore(a));
}

function chosenVoice(): SpeechSynthesisVoice | undefined {
  const list = frenchVoices();
  return (settings.name && list.find((v) => v.name === settings.name)) || list[0];
}

/** Rend le texte plus agréable à l'oreille : respirations aux bons endroits. */
export function prepareText(text: string): string {
  return text
    .replace(/’/g, "'")
    .replace(/\s*:\s*/g, ', ')
    .replace(/\s*…/g, '...')
    .replace(/«\s*|\s*»/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speak(text: string, opts: { voiceName?: string; rate?: number } = {}) {
  if (!voiceAvailable()) return;
  try {
    stopPlayback();
    window.speechSynthesis.cancel();
    // Une phrase à la fois : les pauses entre les phrases sonnent plus naturelles.
    const sentences = (prepareText(text).match(/[^.!?]+[.!?]*/g) ?? []).map((x) => x.trim()).filter(Boolean);
    const list = frenchVoices();
    const v = (opts.voiceName && list.find((x) => x.name === opts.voiceName)) || chosenVoice();
    for (const sentence of sentences) {
      const u = new SpeechSynthesisUtterance(sentence);
      u.lang = v?.lang ?? 'fr-FR';
      if (v) u.voice = v;
      // Un peu plus lent et un peu plus haut : plus chaleureux pour un enfant.
      u.rate = 0.92 * (opts.rate ?? settings.rate);
      u.pitch = /!/.test(sentence) ? 1.15 : 1.06;
      window.speechSynthesis.speak(u);
    }
  } catch {
    /* ignoré */
  }
}

// ------------------------------------------------------------ Voix enregistrée

let current: HTMLAudioElement | null = null;

export function playAudio(blob: Blob) {
  stopSpeaking();
  const url = URL.createObjectURL(blob);
  const a = new Audio(url);
  current = a;
  a.onended = () => URL.revokeObjectURL(url);
  a.play().catch(() => URL.revokeObjectURL(url));
}

function stopPlayback() {
  if (current) {
    current.pause();
    current = null;
  }
}

export function stopSpeaking() {
  stopPlayback();
  if (voiceAvailable()) window.speechSynthesis.cancel();
}

/** Recharge la liste des voix quand l'appareil la fournit (elle arrive parfois en retard). */
export function onVoicesChanged(cb: () => void): () => void {
  if (!voiceAvailable()) return () => undefined;
  window.speechSynthesis.addEventListener?.('voiceschanged', cb);
  return () => window.speechSynthesis.removeEventListener?.('voiceschanged', cb);
}
