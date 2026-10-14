import { Camera, Images } from 'lucide-react';
import { useRef, useState } from 'react';
import { makeFestive, svgToDataUrl } from '../lib/festive';
import { addAlbumPhoto, resizeFile } from '../lib/photos';
import { playSound } from '../lib/sound';
import { useApp } from '../store/useApp';
import type { Routine } from '../types';
import { Sparkles } from './Sparkles';
import { Button } from './ui';

/**
 * Photo de fierté, proposée une seule fois à la fin d'une quête.
 * Facultative, sans XP : c'est un souvenir, pas une preuve.
 */
export function ProudPhoto({ routine, companionHost }: { routine: Routine; companionHost: React.RefObject<HTMLElement> }) {
  const navigate = useApp((s) => s.navigate);
  const sound = useApp((s) => s.data.preferences.soundEnabled);
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');
  const [result, setResult] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setState('busy');
    try {
      const raw = await resizeFile(file);
      const now = new Date();
      const festive = await makeFestive(raw, {
        title: routine.title,
        date: now,
        companionSvg: svgToDataUrl(companionHost.current?.querySelector('svg'))
      });
      await addAlbumPhoto({ id: `photo-${now.getTime()}`, at: now.toISOString(), routineId: routine.id, routineTitle: routine.title }, raw, festive);
      setResult(festive);
      setState('idle');
      playSound('trouvaille', sound);
    } catch {
      setState('error');
    }
  };

  if (result) {
    return (
      <section className="carte mt-4 animate-apparait p-4 text-center" aria-label="Ta photo de fierté">
        <div className="relative">
          <img src={result} alt={`Photo de fierté : ${routine.title}`} className="w-full rounded-3xl" />
          <Sparkles burstKey={result.length} />
        </div>
        <p className="mt-3 font-semibold">Rangée dans ton album !</p>
        <Button variant="fantome" size="petit" className="mt-1" icon={<Images size={18} aria-hidden />} onClick={() => navigate({ name: 'cabane', tab: 'album' })}>
          Voir mon album
        </Button>
      </section>
    );
  }

  return (
    <section className="carte mt-4 flex items-center gap-4 p-5" aria-label="Photo de fierté (facultatif)">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ciel-100 text-ciel-500">
        <Camera aria-hidden />
      </span>
      <div className="flex-1">
        <p className="font-semibold">Prends ton exploit en photo !</p>
        <p className="text-sm text-encre-700">Photographie ce que tu as fait. Si tu veux.</p>
        {state === 'error' && <p className="mt-1 text-sm text-corail-700">La photo n’a pas marché. Tu peux réessayer.</p>}
      </div>
      <Button variant="secondaire" size="petit" disabled={state === 'busy'} onClick={() => input.current?.click()}>
        {state === 'busy' ? '…' : 'Photo'}
      </Button>
      <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Prendre la photo" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </section>
  );
}
