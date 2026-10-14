import { Volume2 } from 'lucide-react';
import { Companion, type Expression } from '../art/Companion';
import { playAudio, speak, voiceAvailable } from '../lib/voice';
import { useReducedMotion } from '../lib/hooks';
import { useApp } from '../store/useApp';
import { useRecording } from '../lib/recordings';

/** Le compagnon de l'enfant, avec sa couleur et son accessoire. */
export function MyCompanion({ expression = 'content', size = 160, bounceKey, breathe = false, className = '' }: { expression?: Expression; size?: number; bounceKey?: number; breathe?: boolean; className?: string }) {
  const profile = useApp((s) => s.data.profile);
  const equipped = useApp((s) => s.data.progression.equipped);
  const reduced = useReducedMotion();
  if (!profile) return null;
  const anim = reduced ? '' : bounceKey ? 'animate-rebond' : breathe ? 'animate-respire' : '';
  return (
    <div className={`${anim} ${className}`} key={bounceKey ?? 'stable'}>
      <Companion id={profile.companionId} color={equipped.color} accessory={equipped.accessory} expression={expression} size={size} title={profile.companionName} />
    </div>
  );
}

export function SpeakButton({ text, stepId, className = '' }: { text: string; stepId?: string; className?: string }) {
  const enabled = useApp((s) => s.data.preferences.voiceEnabled);
  const recording = useRecording(stepId);
  if (!enabled || (!voiceAvailable() && !recording)) return null;
  return (
    <button
      type="button"
      onClick={() => (recording ? playAudio(recording) : speak(text))}
      aria-label="Lire à voix haute"
      title="Lire à voix haute"
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lagon-100 text-lagon-900 transition hover:bg-lagon-300 ${className}`}
    >
      <Volume2 aria-hidden size={22} />
    </button>
  );
}

export function SpeechBubble({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-3xl bg-white px-4 py-3 text-base font-medium text-encre-900 shadow-carte ${className}`} role="status">
      {children}
      
    </div>
  );
}
