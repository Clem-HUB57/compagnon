import { useState } from 'react';
import { RoutineArt } from '../../art/RoutineArt';
import { Button, Sheet } from '../../components/ui';
import { guessIllustration, parseStepLines, quickRoutine } from '../../logic/setup';
import type { Moment, Routine } from '../../types';

const MOMENTS: [Moment, string][] = [
  ['matin', 'Le matin'],
  ['apres-ecole', 'Après l’école'],
  ['soir', 'Le soir'],
  ['libre', 'À tout moment']
];

/** Créer une routine en une minute : un nom, un moment, une étape par ligne. */
export function QuickCreate({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (r: Routine, refine: boolean) => void }) {
  const [title, setTitle] = useState('');
  const [moment, setMoment] = useState<Moment>('libre');
  const [text, setText] = useState('');
  const lines = parseStepLines(text);
  const ok = title.trim().length > 0 && lines.length > 0;

  const create = (refine: boolean) => {
    onCreate(quickRoutine({ title, moment, lines }), refine);
    setTitle('');
    setText('');
    setMoment('libre');
  };

  return (
    <Sheet open={open} onClose={onClose} title="Créer une routine">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="qc-titre" className="etiquette">
            Nom de la routine
          </label>
          <div className="flex items-center gap-3">
            <input id="qc-titre" className="champ flex-1" maxLength={60} placeholder="Ex. Ranger ma chambre" value={title} onChange={(e) => setTitle(e.target.value)} />
            <RoutineArt illustration={guessIllustration(title)} size={48} />
          </div>
        </div>
        <fieldset>
          <legend className="etiquette">Quand ?</legend>
          <div className="grid grid-cols-2 gap-2">
            {MOMENTS.map(([m, label]) => (
              <button
                key={m}
                type="button"
                aria-pressed={moment === m}
                onClick={() => setMoment(m)}
                className={`min-h-[44px] rounded-2xl border-2 px-3 text-sm font-semibold transition ${moment === m ? 'border-lagon-500 bg-lagon-100 text-lagon-900' : 'border-sable-300 bg-white text-encre-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="qc-etapes" className="etiquette">
            Les étapes, une par ligne
          </label>
          <textarea
            id="qc-etapes"
            className="champ"
            rows={6}
            placeholder={'Ramasse les vêtements par terre\nMets-les dans le panier\nRange les jouets dans le bac\nFais ton lit'}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="mt-1 text-xs text-encre-500">
            {lines.length === 0
              ? 'Commencez chaque étape par un verbe : « Mets », « Range », « Prends »… Vous pouvez aussi coller une liste.'
              : `${lines.length} étape${lines.length > 1 ? 's' : ''}${lines.length > 7 ? ' : c’est long, pensez à couper en deux routines' : lines.length >= 4 ? ', parfait' : ''}.`}
          </p>
        </div>
        <p className="rounded-2xl bg-sable-200 px-4 py-3 text-sm text-encre-700">
          Les aides (« plus facile », « comment commencer ») ont un texte par défaut. Vous pourrez les personnaliser, ajouter une photo ou enregistrer votre voix plus tard.
        </p>
        <div className="flex flex-col gap-2">
          <Button disabled={!ok} onClick={() => create(false)}>
            Créer la routine
          </Button>
          <Button variant="secondaire" disabled={!ok} onClick={() => create(true)}>
            Créer et ajouter des détails
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
