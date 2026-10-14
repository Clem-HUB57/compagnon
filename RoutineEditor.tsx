import { ArrowDown, ArrowUp, CalendarPlus, ChevronDown, ChevronUp, Eye, ListPlus, Plus, Trash2 } from 'lucide-react';
import { StepPhoto } from '../../components/StepPhoto';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { guessIllustration, parseStepLines } from '../../logic/setup';
import { buildReminderIcs, downloadIcs } from '../../lib/calendar';
import { useState } from 'react';
import { ILLUSTRATIONS, RoutineArt } from '../../art/RoutineArt';
import { Button, IconButton } from '../../components/ui';
import { CALM_TOOLS } from '../../data/calm';
import { MOMENT_LABELS, newStep, proudPhotoEnabled } from '../../logic/engine';
import { XP_MAX, XP_MIN } from '../../logic/progression';
import type { Moment, Routine, RoutineCategory, Step } from '../../types';

const SHOW_ADULT_TITLE = 'Montre à un adulte ce que tu as fait';

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
  const [weekdaysOnly, setWeekdaysOnly] = useState(false);
  const [autoArt, setAutoArt] = useState(initial.isCustom && initial.illustration === 'etoile');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const addLines = () => {
    const lines = parseStepLines(pasteText);
    setR((prev) => {
      const kept = prev.steps.filter((x) => x.title.trim());
      return { ...prev, steps: [...kept, ...lines.map((title, i) => ({ ...newStep(kept.length + i), title }))] };
    });
    setPasteText('');
    setPasteOpen(false);
  };
  const [icsDone, setIcsDone] = useState(false);
  const addShowAdult = () => {
    const st = { ...newStep(steps.length), title: SHOW_ADULT_TITLE, description: 'Montre ce que tu as fait et partage ce moment.', helpText: 'Va chercher un adulte et dis : « tu viens voir ? »', easierText: 'Appelle un adulte.' };
    setR((prev) => ({ ...prev, steps: [...prev.steps, st] }));
  };
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
      <div>
        <label className="etiquette" htmlFor="r-titre">
          Nom de la routine
        </label>
        <div className="flex items-center gap-3">
          <input
            id="r-titre"
            className="champ flex-1"
            required
            maxLength={60}
            value={r.title}
            onChange={(e) => setR((prev) => ({ ...prev, title: e.target.value, illustration: autoArt ? guessIllustration(e.target.value) : prev.illustration }))}
          />
          <RoutineArt illustration={r.illustration} size={52} />
        </div>
      </div>
      <fieldset>
        <legend className="etiquette">Quand ?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(MOMENT_LABELS) as Moment[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={r.moment === m}
              onClick={() => setR({ ...r, moment: m })}
              className={`min-h-[44px] rounded-2xl border-2 px-3 text-sm font-semibold transition ${r.moment === m ? 'border-lagon-500 bg-lagon-100 text-lagon-900' : 'border-sable-300 bg-white text-encre-700'}`}
            >
              {MOMENT_LABELS[m]}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="etiquette" htmlFor="r-trigger">
          Déclencheur « Quand…, alors je commence » (facultatif)
        </label>
        <input id="r-trigger" className="champ" maxLength={80} placeholder="Quand je rentre de l’école" value={r.trigger} onChange={(e) => setR({ ...r, trigger: e.target.value })} />
        <p className="mt-1 text-xs text-encre-500">L’enfant peut aussi le choisir lui-même depuis l’accueil, c’est même mieux.</p>
      </div>

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
                  <label className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm text-encre-700 hover:bg-sable-100">
                    <input type="checkbox" className="h-4 w-4 accent-lagon-700" checked={!!st.essential} onChange={(e) => setStep(st.id, { essential: e.target.checked || undefined })} />
                    Indispensable
                  </label>
                  <button type="button" className="ml-auto inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm text-lagon-900 hover:bg-lagon-100" aria-expanded={expanded} onClick={() => setOpenStep(expanded ? null : st.id)}>
                    Aides, voix, photo {expanded ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
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
                      <p className="etiquette">Votre voix (lue à la place de la voix de synthèse)</p>
                      <VoiceRecorder stepId={st.id} />
                    </div>
                    <div>
                      <p className="etiquette">Photo modèle (facultative, gardée sur cet appareil)</p>
                      <StepPhoto stepId={st.id} compact />
                    </div>
                    <div>
                      <label className="etiquette" htmlFor={`xp-${st.id}`}>
                        Récompense
                      </label>
                      <select id={`xp-${st.id}`} className="champ" value={st.xpReward} onChange={(e) => setStep(st.id, { xpReward: Number(e.target.value) })}>
                        {XP_CHOICES.map((x) => (
                          <option key={x} value={x}>
                            {x} XP{x === 10 ? ' (habituel)' : x > 10 ? ' : étape qui coûte plus' : ''}
                          </option>
                        ))}
                      </select>
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
        {pasteOpen && (
          <div className="mt-3 rounded-3xl bg-white p-3 shadow-carte">
            <label htmlFor="r-coller" className="etiquette">
              Ajouter plusieurs étapes, une par ligne
            </label>
            <textarea id="r-coller" className="champ" rows={4} value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder={'Sors ton cahier\nOuvre-le à la bonne page'} />
            <div className="mt-2 flex gap-2">
              <Button size="petit" disabled={parseStepLines(pasteText).length === 0} onClick={addLines}>
                Ajouter {parseStepLines(pasteText).length || ''} étape{parseStepLines(pasteText).length > 1 ? 's' : ''}
              </Button>
              <Button size="petit" variant="fantome" onClick={() => setPasteOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Button variant="doux" icon={<Plus aria-hidden />} onClick={add}>
            Ajouter une étape
          </Button>
          <Button variant="doux" icon={<ListPlus aria-hidden />} onClick={() => setPasteOpen(true)}>
            Coller une liste
          </Button>
          {!steps.some((s) => s.title === SHOW_ADULT_TITLE) && (
            <Button variant="doux" icon={<Eye aria-hidden />} onClick={addShowAdult}>
              Finir par « Montre à un adulte »
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-encre-500">
          Cochez « Indispensable » sur les étapes à garder les jours difficiles : l’enfant pourra alors choisir la version courte. « Montre à un adulte » crée un moment de fierté partagé, sans contrôle.
        </p>
      </section>

      <details className="group rounded-3xl bg-sable-200/60 p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
          Plus d’options
          <ChevronDown size={18} className="transition group-open:rotate-180" aria-hidden />
        </summary>
        <p className="mt-1 text-sm text-encre-700">Description, catégorie, illustration, photo de fierté, rappel dans l’agenda.</p>
        <div className="mt-4 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="etiquette" htmlFor="r-desc">
            Description courte
          </label>
          <input id="r-desc" className="champ" maxLength={140} value={r.description} onChange={(e) => setR({ ...r, description: e.target.value })} />
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
              onClick={() => {
                setAutoArt(false);
                setR({ ...r, illustration: il.key });
              }}
              className={`rounded-3xl border-4 transition ${r.illustration === il.key ? 'border-lagon-500' : 'border-transparent'}`}
            >
              <RoutineArt illustration={il.key} size={48} />
            </button>
          ))}
        </div>
      </fieldset>
      <section className="rounded-3xl bg-white p-4 shadow-carte">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-lagon-700" checked={proudPhotoEnabled(r)} onChange={(e) => setR({ ...r, proudPhoto: e.target.checked })} />
          <span>
            <span className="font-semibold">Proposer la photo de fierté à la fin</span>
            <span className="mt-1 block text-sm text-encre-700">
              Une fois la quête finie, l’enfant peut photographier ce qu’il a fait. La photo reçoit un cadre festif et rejoint son album, dans la cabane. Facultatif, sans XP. Utile pour ranger ou préparer son sac, moins pour la douche.
            </span>
          </span>
        </label>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-carte">
        <h3 className="font-semibold">Rappel dans l’agenda du téléphone</h3>
        <p className="mt-1 text-sm text-encre-700">L’app n’envoie pas de notification (elle n’a pas de serveur). Elle crée un rendez-vous qui se répète, avec une alerte, dans l’agenda de cet appareil.</p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label className="etiquette" htmlFor="r-rappel">
              Heure
            </label>
            <input id="r-rappel" type="time" className="champ w-36" value={r.reminderTime ?? ''} onChange={(e) => setR({ ...r, reminderTime: e.target.value || undefined })} />
          </div>
          <label className="mb-3 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-lagon-700" checked={weekdaysOnly} onChange={(e) => setWeekdaysOnly(e.target.checked)} />
            Du lundi au vendredi seulement
          </label>
          <Button
            variant="secondaire"
            size="petit"
            className="mb-1"
            icon={<CalendarPlus size={18} aria-hidden />}
            disabled={!r.reminderTime}
            onClick={() => {
              downloadIcs(`rappel-${r.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.ics`, buildReminderIcs({ title: r.title, time: r.reminderTime!, weekdaysOnly, uid: r.id }));
              setIcsDone(true);
            }}
          >
            Ajouter à mon agenda
          </Button>
        </div>
        {icsDone && <p className="mt-2 text-sm text-mousse-700" role="status">Ouvrez le fichier téléchargé : votre agenda propose d’ajouter le rappel.</p>}
      </section>
        </div>
      </details>

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
