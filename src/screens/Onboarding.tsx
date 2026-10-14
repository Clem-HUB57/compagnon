import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { Companion } from '../art/Companion';
import { Island } from '../art/Island';
import { Button, Screen } from '../components/ui';
import { COMPANIONS } from '../data/companions';
import { setProfile } from '../logic/engine';
import { useApp } from '../store/useApp';
import type { CompanionId } from '../types';

export function Onboarding() {
  const update = useApp((s) => s.update);
  const navigate = useApp((s) => s.navigate);
  const [step, setStep] = useState(0);
  const [companion, setCompanion] = useState<CompanionId>('moki');
  const [companionName, setCompanionName] = useState('Moki');
  const [childName, setChildName] = useState('');

  const choose = (id: CompanionId) => {
    const prev = COMPANIONS.find((c) => c.id === companion);
    setCompanion(id);
    if (!companionName || companionName === prev?.defaultName) setCompanionName(COMPANIONS.find((c) => c.id === id)!.defaultName);
  };

  const finish = () => {
    update((s) => setProfile(s, childName, companion, companionName));
    navigate({ name: 'accueil' }, true);
  };

  return (
    <Screen className="justify-between">
      {step === 0 && (
        <div className="flex flex-1 animate-apparait flex-col justify-center gap-6 text-center">
          <div className="overflow-hidden rounded-4xl shadow-carte">
            <Island stage={0} ambiance="ambiance-jour" decor={[]} className="block w-full" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Bienvenue sur ton île</h1>
            <p className="mt-3 text-lg text-encre-700">De petites quêtes aujourd’hui. Des compétences pour la vie.</p>
          </div>
          <Button size="grand" onClick={() => setStep(1)} icon={<ArrowRight aria-hidden />} className="flex-row-reverse">
            Commencer
          </Button>
          <p className="text-xs text-encre-500">
            Prototype pour des tests en famille. Ce n’est pas un dispositif médical et il ne remplace aucun accompagnement professionnel.
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 animate-apparait flex-col gap-5">
          <div>
            <p className="text-sm font-medium text-lagon-700">Étape 1 sur 2</p>
            <h1 className="titre mt-1">Choisis ton compagnon</h1>
            <p className="mt-1 text-encre-700">Il t’accompagnera dans tes quêtes et grandira avec toi.</p>
          </div>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Compagnons">
            {COMPANIONS.map((c) => {
              const selected = companion === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => choose(c.id)}
                  className={`relative flex flex-col items-center rounded-4xl border-4 bg-white p-3 text-center shadow-carte transition ${selected ? 'border-lagon-500' : 'border-transparent hover:border-sable-300'}`}
                >
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-lagon-700 text-white">
                      <Check size={18} aria-hidden />
                    </span>
                  )}
                  <Companion id={c.id} expression={selected ? 'joie' : 'content'} size={112} />
                  <span className="mt-1 text-lg font-semibold">{c.defaultName}</span>
                  <span className="text-sm text-encre-700">{c.species}</span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-encre-700">{COMPANIONS.find((c) => c.id === companion)?.description}</p>
          <div className="mt-auto flex gap-3">
            <Button variant="fantome" onClick={() => setStep(0)} icon={<ArrowLeft aria-hidden />}>
              Retour
            </Button>
            <Button className="flex-1 flex-row-reverse" onClick={() => setStep(2)} icon={<ArrowRight aria-hidden />}>
              Suivant
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form
          className="flex flex-1 animate-apparait flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            finish();
          }}
        >
          <div>
            <p className="text-sm font-medium text-lagon-700">Étape 2 sur 2</p>
            <h1 className="titre mt-1">Faisons connaissance</h1>
          </div>
          <div className="flex justify-center">
            <Companion id={companion} expression="joie" size={150} />
          </div>
          <div>
            <label htmlFor="nom-compagnon" className="etiquette">
              Le nom de ton compagnon
            </label>
            <input id="nom-compagnon" className="champ" value={companionName} maxLength={20} onChange={(e) => setCompanionName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="prenom" className="etiquette">
              Ton prénom ou ton surnom <span className="font-normal text-encre-500">(facultatif)</span>
            </label>
            <input id="prenom" className="champ" value={childName} maxLength={30} autoComplete="off" onChange={(e) => setChildName(e.target.value)} />
            <p className="mt-1 text-xs text-encre-500">Il reste uniquement sur cet appareil.</p>
          </div>
          <div className="mt-auto flex gap-3">
            <Button variant="fantome" onClick={() => setStep(1)} icon={<ArrowLeft aria-hidden />}>
              Retour
            </Button>
            <Button type="submit" className="flex-1" size="grand">
              C’est parti !
            </Button>
          </div>
        </form>
      )}
    </Screen>
  );
}
