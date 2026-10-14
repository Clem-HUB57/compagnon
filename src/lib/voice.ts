// Lecture à voix haute avec la synthèse vocale du navigateur (gratuite, sans réseau sur la plupart des appareils).

export function voiceAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function frenchVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'fr-FR' && v.localService) ?? voices.find((v) => v.lang.startsWith('fr'));
}

export function speak(text: string) {
  if (!voiceAvailable()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/’/g, "'"));
    u.lang = 'fr-FR';
    u.rate = 0.95;
    const v = frenchVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignoré */
  }
}

export function stopSpeaking() {
  if (voiceAvailable()) window.speechSynthesis.cancel();
}
