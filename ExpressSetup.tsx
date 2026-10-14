import { Check, Sparkles as SparklesIcon } from 'lucide-react';
import { useState } from 'react';
import { Button, Sheet } from '../../components/ui';
import { EXPRESS_CHOICES, EXPRESS_GROUPS, EXPRESS_RECOMMENDED_MAX, expressSetup } from '../../logic/setup';
import { useApp } from '../../store/useApp';

/** Démarrage express : le parent coche les moments difficiles, l'app prépare les routines. */
export function ExpressSetup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const update = useApp((s) => s.update);
  const [picked, setPicked] = useState<string[]>([]);
  const [keepOthers, setKeepOthers] = useState(false);
  const [done, setDone] = useState<string[] | null>(null);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const close = () => {
    setDone(null);
    setPicked([]);
    onClose();
  };

  return (
    <Sheet open={open} onClose={close} title={done ? 'C’est prêt !' : 'Démarrage express'}>
      {done ? (
        <div>
          <ul className="flex flex-col gap-2">
            {done.map((label) => (
              <li key={label} className="flex items-center gap-2 rounded-2xl bg-mousse-100 px-4 py-3 font-medium text-mousse-700">
                <Check size={18} aria-hidden /> {label}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-encre-700">
            Les étapes, les aides et les moments sont déjà remplis. Vous pouvez tout ajuster plus tard, mais rien ne presse : l’app est utilisable telle quelle.
          </p>
          <p className="mt-2 text-sm text-encre-700">
            Prochaine étape, avec l’enfant : sous sa quête, sur l’accueil, il choisit son <strong>plan</strong> (« Quand j’ai fini de goûter, alors je commence »).
          </p>
          <Button className="mt-5 w-full" onClick={close}>
            Voir mes routines
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-encre-700">
            Quels moments sont difficiles en ce moment ? Choisissez-en <strong>1 à 3</strong> : mieux vaut peu de routines bien installées que beaucoup qui s’essoufflent.
          </p>
          {EXPRESS_GROUPS.map((g) => (
            <fieldset key={g} className="mt-4">
              <legend className="etiquette">{g}</legend>
              <div className="flex flex-wrap gap-2">
                {EXPRESS_CHOICES.filter((c) => c.group === g).map((c) => {
                  const on = picked.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(c.id)}
                      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border-2 px-3 text-sm font-semibold transition ${on ? 'border-lagon-500 bg-lagon-100 text-lagon-900' : 'border-sable-300 bg-white text-encre-700 hover:border-lagon-300'}`}
                    >
                      {on && <Check size={16} aria-hidden />} {c.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
          {picked.length > EXPRESS_RECOMMENDED_MAX && (
            <p className="mt-4 rounded-2xl bg-ciel-100 px-4 py-3 text-sm text-encre-900" role="status">
              {picked.length} routines, c’est beaucoup pour démarrer. Vous pouvez garder les autres pour plus tard.
            </p>
          )}
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-lagon-700" checked={keepOthers} onChange={(e) => setKeepOthers(e.target.checked)} />
            <span>Garder aussi les autres routines d’exemple (sinon elles sont retirées pour ne pas encombrer l’app ; vos propres routines sont toujours gardées)</span>
          </label>
          <Button
            className="mt-5 w-full"
            icon={<SparklesIcon aria-hidden />}
            disabled={picked.length === 0}
            onClick={() => {
              update((s) => expressSetup(s, picked, keepOthers));
              setDone(EXPRESS_CHOICES.filter((c) => picked.includes(c.id)).map((c) => c.label));
            }}
          >
            {picked.length === 0 ? 'Choisissez au moins un moment' : `Préparer ${picked.length > 1 ? `mes ${picked.length} routines` : 'ma routine'}`}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
