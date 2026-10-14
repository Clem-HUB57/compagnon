import { Camera, Check, ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { removeAlbumPhoto, setAlbumPhotoAsModel, useAlbum, useAlbumImage, type AlbumEntry } from '../lib/photos';
import { getRoutine, sortedSteps } from '../logic/engine';
import { useApp } from '../store/useApp';
import { Button, Sheet } from './ui';

function Thumb({ entry, onOpen }: { entry: AlbumEntry; onOpen: () => void }) {
  const src = useAlbumImage(entry.id);
  return (
    <button type="button" onClick={onOpen} className="self-start overflow-hidden rounded-3xl bg-white shadow-carte transition hover:scale-[1.02]" aria-label={`${entry.routineTitle}, ${new Date(entry.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}>
      {src ? <img src={src} alt="" className="w-full" /> : <div className="aspect-[4/5] w-full bg-sable-200" />}
    </button>
  );
}

function Viewer({ entry, onClose }: { entry: AlbumEntry; onClose: () => void }) {
  const data = useApp((s) => s.data);
  const src = useAlbumImage(entry.id);
  const routine = getRoutine(data, entry.routineId);
  const steps = routine ? sortedSteps(routine) : [];
  const [mode, setMode] = useState<'voir' | 'modele' | 'enlever'>('voir');
  const [done, setDone] = useState<string | null>(null);
  const date = new Date(entry.at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Sheet open onClose={onClose} title={entry.routineTitle}>
      {src && <img src={src} alt={`Photo de fierté : ${entry.routineTitle}`} className={`mx-auto w-full rounded-3xl object-contain ${mode === 'modele' ? 'max-h-[28dvh]' : 'max-h-[52dvh]'}`} />}
      <p className="mt-2 text-center text-sm text-encre-700">{date}</p>
      {done && (
        <p className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-mousse-100 p-3 text-mousse-700" role="status">
          <Check size={18} aria-hidden /> Ta photo montre maintenant l’étape « {done} ».
        </p>
      )}
      {mode === 'voir' && (
        <div className="mt-4 flex flex-col gap-2">
          {steps.length > 0 && (
            <Button variant="secondaire" icon={<ImagePlus aria-hidden />} onClick={() => setMode('modele')}>
              Utiliser comme modèle
            </Button>
          )}
          <Button variant="fantome" className="text-corail-700" icon={<Trash2 aria-hidden />} onClick={() => setMode('enlever')}>
            Enlever cette photo
          </Button>
        </div>
      )}
      {mode === 'modele' && (
        <div className="mt-4">
          <p className="font-semibold">Pour quelle étape ?</p>
          <p className="text-sm text-encre-700">La prochaine fois, tu verras ta photo pendant cette étape.</p>
          <ul className="mt-2 flex flex-col gap-2">
            {steps.map((st) => (
              <li key={st.id}>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-sable-100 px-4 py-3 text-left font-medium hover:bg-lagon-100"
                  onClick={async () => {
                    if (await setAlbumPhotoAsModel(entry.id, st.id)) setDone(st.title);
                    setMode('voir');
                  }}
                >
                  {st.title}
                </button>
              </li>
            ))}
          </ul>
          <Button variant="fantome" className="mt-2 w-full" onClick={() => setMode('voir')}>
            Annuler
          </Button>
        </div>
      )}
      {mode === 'enlever' && (
        <div className="mt-4 flex gap-2">
          <Button
            variant="danger"
            className="flex-1"
            onClick={async () => {
              await removeAlbumPhoto(entry.id);
              onClose();
            }}
          >
            Oui, l’enlever
          </Button>
          <Button variant="secondaire" className="flex-1" onClick={() => setMode('voir')}>
            La garder
          </Button>
        </div>
      )}
    </Sheet>
  );
}

/** Album « Mes exploits » : les photos de fierté prises à la fin des quêtes. */
export function Album() {
  const list = useAlbum();
  const [open, setOpen] = useState<AlbumEntry | null>(null);
  return (
    <section className="carte p-5">
      <h2 className="font-semibold">Mes exploits</h2>
      {list.length === 0 ? (
        <div className="mt-3 flex items-center gap-3 text-encre-700">
          <Camera className="shrink-0 text-ciel-500" aria-hidden />
          <p className="text-sm">À la fin d’une quête, tu peux prendre ce que tu as fait en photo. Elle arrivera ici, avec un cadre de fête.</p>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-encre-700">{list.length === 1 ? 'Ta première photo de fierté.' : `Tes ${list.length} dernières photos de fierté.`}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {list.map((e) => (
              <Thumb key={e.id} entry={e} onOpen={() => setOpen(e)} />
            ))}
          </div>
        </>
      )}
      {open && <Viewer entry={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
