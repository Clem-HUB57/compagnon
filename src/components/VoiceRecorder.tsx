import { Mic, Play, RotateCcw, Square, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MAX_RECORDING_SECONDS, recordingSupported, removeRecording, saveRecording, startRecording, useRecording } from '../lib/recordings';
import { playAudio } from '../lib/voice';

/** Enregistrer sa propre voix pour une étape : l'enfant l'entend à la place de la voix de synthèse. */
export function VoiceRecorder({ stepId }: { stepId: string }) {
  const recording = useRecording(stepId);
  const [state, setState] = useState<'idle' | 'rec' | 'error'>('idle');
  const [seconds, setSeconds] = useState(0);
  const ctrl = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (state !== 'rec') return;
    const t = window.setInterval(() => setSeconds((x) => x + 1), 1000);
    return () => window.clearInterval(t);
  }, [state]);
  useEffect(() => () => ctrl.current?.stop(), []);

  if (!recordingSupported()) return <p className="text-sm text-encre-500">L’enregistrement de la voix n’est pas disponible sur ce navigateur.</p>;

  const start = async () => {
    try {
      setSeconds(0);
      ctrl.current = await startRecording(async (blob) => {
        ctrl.current = null;
        setState('idle');
        if (blob.size > 0) await saveRecording(stepId, blob);
      });
      setState('rec');
    } catch {
      setState('error');
    }
  };

  const btn = 'inline-flex min-h-[40px] items-center gap-2 rounded-xl px-3 text-sm font-medium';
  return (
    <div className="flex flex-wrap items-center gap-2">
      {state === 'rec' ? (
        <button type="button" className={`${btn} bg-corail-100 text-corail-700`} onClick={() => ctrl.current?.stop()}>
          <Square size={16} className="fill-current" aria-hidden /> Arrêter ({MAX_RECORDING_SECONDS - seconds} s)
        </button>
      ) : recording ? (
        <>
          <button type="button" className={`${btn} bg-lagon-100 text-lagon-900`} onClick={() => playAudio(recording)}>
            <Play size={16} aria-hidden /> Écouter
          </button>
          <button type="button" className={`${btn} text-lagon-900 hover:bg-lagon-100`} onClick={start}>
            <RotateCcw size={16} aria-hidden /> Refaire
          </button>
          <button type="button" className={`${btn} text-corail-700 hover:bg-corail-100`} onClick={() => removeRecording(stepId)}>
            <Trash2 size={16} aria-hidden /> Enlever
          </button>
        </>
      ) : (
        <button type="button" className={`${btn} text-lagon-900 hover:bg-lagon-100`} onClick={start}>
          <Mic size={18} aria-hidden /> Enregistrer ma voix
        </button>
      )}
      {state === 'error' && <p className="w-full text-sm text-corail-700">Le micro n’est pas accessible. Autorisez-le dans les réglages du navigateur, puis réessayez.</p>}
    </div>
  );
}
