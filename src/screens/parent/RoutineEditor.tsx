import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ILLUSTRATIONS, RoutineArt } from '../../art/RoutineArt';
import { Button, IconButton } from '../../components/ui';
import { CALM_TOOLS } from '../../data/calm';
import { MOMENT_LABELS, newStep } from '../../logic/engine';
import { XP_MAX, XP_MIN } from '../../logic/progression';
import type { Moment, Routine, RoutineCategory, Step } from '../../types';

const XP_CHOICES = [5, 10, 15, 20, 25, 30].filter((x) => x >= XP_MIN && x <= XP_MAX);

export function RoutineEditor({ initial, onSave, onCancel, onDelete }: { initial: Routine; onSave: (r: Routine) => void; onCancel: () => void; onDelete?: () => void }) {
  const [r, setR] = useState<Routine>(() => structuredClone(initial));
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const steps = [...r.steps].sort((a, b) => a.order - b.order);
  const filled = steps.filter((s) => s.title.trim()).length;

  const setStep = (id: string, patch: Partial<Step>) => setR((prev) => ({ ...prev, steps: prev.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const move = (index: number, dir: -1 | 1) => {
    const list = [...steps];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    setR((prev) => ({ ...prev, steps: list.map((s, i) => ({ ...s, order: i })) }));
  };
  const remove = (id: string) => setR((prev) => ({ ...prev, steps: prev.steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })) }));
  const add = () => {
    const st = newStep(steps.length);
    setR((prev) => ({ ...prev, steps: [...prev.steps, st] }));
    setOpenStep(st.id);
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(r);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="etiquette" htmlFor="r-titre">
            Titre de la routine
          </label>
          <input id="r-titre" className="champ" required maxLength={60} value={r.title} onChange={(e) => setR({ ...r, title: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="etiquette" htmlFor="r-desc">
            Description courte
          </label>
          <input id="r-desc" className="champ" maxLength={140} value={r.description} onChange={(e) => setR({ ...r, description: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className="etiquette" htmlFor="r-trigger">
            Déclencheur du plan « Quand…, alors je commence »
          </label>
          <input id="r-trigger" className="champ" maxLength={80} placeholder="Quand je rentre de l’école" value={r.trigger} onChange={(e) => setR({ ...r, trigger: e.target.value })} />
          <p className="mt-1 text-xs text-encre-500">Idéalement choisi avec l’enfant : un moment précis et habituel.</p>
        </div>
        <div>
          <label className="etiquette" htmlFor="r-cat">
            Catégorie
          </label>
          <select id="r-cat" className="champ" value={r.category} onChange={(e) => setR({ ...r, category: e.target.value as RoutineCategory })}>
            <option value="ecole">École</option>
            <option value="maison">Maison</option>
            <option value="soin">Prendre soin de moi</option>
            <option value="perso">Mes routines</option>
          </select>
        </div>
        <div>
          <label className="etiquette" htmlFor="r-moment">
            Moment de la journée
          </label>
          <select id="r-moment" className="champ" value={r.moment} onChange={(e) => setR({ ...r, moment: e.target.value as Moment })}>
            {(Object.keys(MOMENT_LABELS) as Moment[]).map((m) => (
              <option key={m} value={m}>
                {MOMENT_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="etiquette" htmlFor="r-min">
            Durée indicative (minutes)
          </label>
          <input id="r-min" className="champ" type="number" min={1} max={120} value={r.estimatedMinutes} onChange={(e) => setR({ ...r, estimatedMinutes: Number(e.target.value) })} />
        </div>
      </div>

      <fieldset>
        <legend className="etiquette">Illustration</legend>
        <div className="flex flex-wrap gap-2">
          {ILLUSTRATIONS.map((il) => (
            <button
              key={il.key}
              type="button"
              aria-pressed={r.illustration === il.key}
              aria-label={il.label}
              title={il.label}
              onClick={() => setR({ ...r, illustration: il.key })}
              className={`rounded-3xl border-4 transition ${r.illustration === il.key ? 'border-lagon-500' : 'border-transparent'}`}
            >
              <RoutineArt illustration={il.key} size={56} />
            </button>
          ))}
        </div>
      </fieldset>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">Étapes ({filled})</h3>
          <p className="text-xs text-encre-500">Une action concrète par étape. 4 à 7 étapes, c’est idéal.</p>
        </div>
        <ol className="flex flex-col gap-2">
          {steps.map((st, i) => {
            const expanded = openStep === st.id;
            return (
              <li key={st.id} className="rounded-3xl border-2 border-sable-300 bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sable-200 text-sm font-semibold">{i + 1}</span>
                  <label className="sr-only" htmlFor={`st-${st.id}`}>
                    Étape {i + 1}
                  </label>
                  <input
                    id={`st-${st.id}`}
                    className="min-w-0 flex-1 rounded-xl border-2 border-transparent px-2 py-2 text-base hover:border-sable-200 focus:border-lagon-500 focus:outline-none"
                    placeholder="Ex. Mets ta trousse dans ton sac"
                    maxLength={80}
                    value={st.title}
                    onChange={(e) => setStep(st.id, { title: e.target.value })}
                  />
                  <select aria-label={`XP de l’étape ${i + 1}`} className="rounded-xl border-2 border-sable-200 bg-white px-2 py-2 text-sm" value={st.xpReward} onChange={(e) => setStep(st.id, { xpReward: Number(e.target.value) })}>
                    {XP_CHOICES.map((x) => (
                      <option key={x} value={x}>
                        {x} XP
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <IconButton label="Monter" className="h-9 w-9" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp size={18} aria-hidden />
                  </IconButton>
                  <IconButton label="Descendre" className="h-9 w-9" onClick={() => move(i, 1)} disabled={i === steps.length - 1}>
                    <ArrowDown size={18} aria-hidden />
                  </IconButton>
                  <IconButton label="Supprimer l’étape" className="h-9 w-9 text-corail-700" onClick={() => remove(st.id)}>
                    <Trash2 size={18} aria-hidden />
                  </IconButton>
                  <button type="button" className="ml-auto inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm text-lagon-900 hover:bg-lagon-100" aria-expanded={expanded} onClick={() => setOpenStep(expanded ? null : st.id)}>
                    Détails et aides {expanded ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
                  </button>
                </div>
                {expanded && (
                  <div className="mt-2 grid gap-3">
                    <div>
                      <label className="etiquette" htmlFor={`d-${st.id}`}>
                        Précision (facultatif)
                      </label>
                      <input id={`d-${st.id}`} className="champ" maxLength={140} value={st.description} onChange={(e) => setStep(st.id, { description: e.target.value })} />
                    </div>
                    <div>
                      <label className="etiquette" htmlFor={`h-${st.id}`}>
                        « Montre-moi comment commencer »
                      </label>
                      <textarea id={`h-${st.id}`} className="champ" rows={2} maxLength={200} value={st.helpText} onChange={(e) => setStep(st.id, { helpText: e.target.value })} />
                    </div>
                    <div>
                      <label className="etiquette" htmlFor={`t-${st.id}`}>
                        Exercice du coin calme à proposer (facultatif)
                      </label>
                      <select
                        id={`t-${st.id}`}
                        className="champ"
                        value={st.tool ?? ''}
                        onChange={(e) => setStep(st.id, { tool: (e.target.value || undefined) as Step['tool'] })}
                      >
                        <option value="">Aucun</option>
                        {CALM_TOOLS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                        <option value="plan">Préparer le plan tempête</option>
                      </select>
                    </div>
                    <div>
                      <label className="etiquette" htmlFor={`e-${st.id}`}>
                        « Rends cette étape plus facile » : une toute petite action
                      </label>
                      <input id={`e-${st.id}`} className="champ" maxLength={120} placeholder="Ex. Prends juste ta trousse dans ta main" value={st.easierText} onChange={(e) => setStep(st.id, { easierText: e.target.value })} />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <Button variant="doux" className="mt-3 w-full" icon={<Plus aria-hidden />} onClick={add}>
          Ajouter une étape
        </Button>
      </section>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-2 bg-sable-100/95 px-1 py-3 backdrop-blur">
        <Button type="submit" className="flex-1" disabled={filled === 0 || !r.title.trim()}>
          Enregistrer
        </Button>
        <Button variant="secondaire" onClick={onCancel}>
          Annuler
        </Button>
        {onDelete &&
          (confirmDelete ? (
            <Button variant="danger" onClick={onDelete}>
              Confirmer la suppression
            </Button>
          ) : (
            <Button variant="fantome" className="text-corail-700" icon={<Trash2 size={18} aria-hidden />} onClick={() => setConfirmDelete(true)}>
              Supprimer
            </Button>
          ))}
      </div>
    </form>
  );
}
