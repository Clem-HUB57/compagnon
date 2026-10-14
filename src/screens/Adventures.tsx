import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { RoutineArt } from '../art/RoutineArt';
import { Button, IconButton, Pill, Screen } from '../components/ui';
import { openSession, routineStats, validStepCount } from '../logic/engine';
import { useApp } from '../store/useApp';
import type { AidLevel, RoutineCategory } from '../types';

const TABS: { id: RoutineCategory; label: string }[] = [
  { id: 'ecole', label: 'École' },
  { id: 'maison', label: 'Maison' },
  { id: 'soin', label: 'Moi' },
  { id: 'perso', label: 'Mes routines' }
];

export const AID_LABELS: Record<AidLevel, string> = { guide: 'Guidé', condense: 'Condensé', autonome: 'Autonome' };

export function Adventures() {
  const data = useApp((s) => s.data);
  const navigate = useApp((s) => s.navigate);
  const startMission = useApp((s) => s.startMission);
  const tabs = TABS.filter((t) => data.routines.some((r) => r.category === t.id));
  const [tab, setTab] = useState<RoutineCategory>(tabs[0]?.id ?? 'ecole');
  const routines = data.routines.filter((r) => r.category === tab);

  return (
    <Screen>
      <header className="flex items-center gap-2">
        <IconButton label="Retour à mon île" onClick={() => navigate({ name: 'accueil' })}>
          <ArrowLeft aria-hidden />
        </IconButton>
        <h1 className="titre">Choisis une aventure</h1>
      </header>

      {tabs.length > 1 && (
        <div className="mt-4 flex gap-2 rounded-3xl bg-sable-200 p-1.5" role="tablist" aria-label="Catégories">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-[44px] flex-1 rounded-2xl px-3 text-base font-semibold transition ${tab === t.id ? 'bg-white text-encre-900 shadow-carte' : 'text-encre-700 hover:bg-sable-300/60'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {data.routines.length === 0 && <p className="carte mt-6 p-6 text-center text-encre-700">Aucune routine pour l’instant. Un adulte peut en ajouter dans l’espace parent.</p>}

      <ul className="mt-4 flex flex-col gap-4" role="tabpanel">
        {routines.map((r) => {
          const open = openSession(data, r.id);
          const stats = routineStats(data, r.id);
          const done = open ? validStepCount(r, open) : 0;
          const empty = r.steps.length === 0;
          return (
            <li key={r.id} className="carte animate-apparait p-4">
              <div className="flex gap-4">
                <RoutineArt illustration={r.illustration} size={80} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold leading-snug">{r.title}</h2>
                  {r.description && <p className="mt-0.5 text-sm text-encre-700">{r.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill>≈ {r.estimatedMinutes} min</Pill>
                    <Pill>{r.steps.length} étapes</Pill>
                    {stats.aidLevel !== 'guide' && <Pill tone="lagon">{AID_LABELS[stats.aidLevel]}</Pill>}
                    {stats.completions > 0 && <Pill tone="mousse">Faite {stats.completions} fois</Pill>}
                  </div>
                </div>
              </div>
              {open && r.steps.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-sm text-encre-700">
                    <span>Commencée</span>
                    <span>
                      {done} / {r.steps.length} étapes
                    </span>
                  </div>
                  <div className="flex gap-1" aria-hidden>
                    {r.steps.map((st, i) => (
                      <span key={st.id} className={`h-2 flex-1 rounded-full ${i < done ? 'bg-mousse-500' : 'bg-sable-300'}`} />
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" disabled={empty} icon={open ? <RotateCcw aria-hidden /> : <Play aria-hidden />} onClick={() => startMission(r.id)}>
                  {empty ? 'Pas encore d’étapes' : open ? 'Reprendre' : 'Lancer'}
                </Button>
                {open && (
                  <Button variant="fantome" size="petit" onClick={() => startMission(r.id, true)}>
                    Recommencer
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
