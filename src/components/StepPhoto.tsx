import { Camera, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { removePhoto, savePhoto, usePhoto } from '../lib/photos';

/** Photo modèle d'une étape (« voilà à quoi ça ressemble quand c'est fait »). */
export function StepPhoto({ stepId, editable = true, compact = false }: { stepId: string; editable?: boolean; compact?: boolean }) {
  const src = usePhoto(stepId);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(false);
    try {
      await savePhoto(stepId, file);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {src && <img src={src} alt="Photo de l’étape" className={`w-full rounded-3xl object-cover ${compact ? 'max-h-40' : 'max-h-56'}`} />}
      {editable && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl px-3 text-sm font-medium text-lagon-900 hover:bg-lagon-100"
          >
            <Camera size={18} aria-hidden /> {src ? 'Changer la photo' : 'Ajouter une photo'}
          </button>
          {src && (
            <button type="button" onClick={() => removePhoto(stepId)} className="inline-flex min-h-[40px] items-center gap-2 rounded-xl px-3 text-sm text-corail-700 hover:bg-corail-100">
              <Trash2 size={16} aria-hidden /> Enlever
            </button>
          )}
          <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
      )}
      {error && <p className="text-sm text-corail-700">La photo n’a pas pu être enregistrée. Réessaie avec une autre image.</p>}
    </div>
  );
}
