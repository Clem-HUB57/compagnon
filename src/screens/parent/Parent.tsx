import { ArrowLeft, BookOpen, Check, Download, FileUp, Info, Pencil, Plus, RotateCcw, Smartphone, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { RoutineArt } from '../../art/RoutineArt';
import { Button, IconButton, Pill, Sheet } from '../../components/ui';
import { getTool } from '../../data/calm';
import { LIBRARY, LIBRARY_GROUPS } from '../../data/library';
import { addFromLibrary, deleteRoutine, MOMENT_LABELS, exportData, newCustomRoutine, parseImport, resetDemo, routineStats, setAidLevel, upsertRoutine } from '../../logic/engine';
import { useApp } from '../../store/useApp';
import type { AidLevel, AppState, Routine, Session } from '../../types';
import { AID_LABELS } from '../Adventures';
import { RoutineEditor } from './RoutineEditor';

type Tab = 'routines' | 'historique' | 'reglages' | 'donnees' | 'aide';

const TABS: { id: Tab; label: string }[] = [
  { id: 'routines', label: 'Routines' },
  { id: 'historique', label: 'Historique' },
  { id: 'reglages', label: 'Réglages' },
  { id: 'donnees', label: 'Données' },
  { id: 'aide', label: 'Installer & infos' }
];

/** Confirmation parentale simple. Ce n'est PAS une protection sécurisée. */
function ParentGate({ onOk }: { onOk: () => void }) {
  const navigate = useApp((s) => s.navigate);
  const [q] = useState(() => {
    const a = 3 + Math.floor(Math.random() * 7);
    const b = 4 + Math.floor(Math.random() * 6);
    return { a, b };
  });
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-5">
      <div className="carte p-6">
        <h1 className="titre">Espace parent</h1>
        <p className="mt-2 text-encre-700">Pour continuer, réponds à cette question.</p>
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(value) === q.a * q.b) onOk();
            else setError(true);
          }}
        >
          <label htmlFor="calcul" className="etiquette">
            Combien font {q.a} × {q.b} ?
          </label>
          <input id="calcul" className="champ" inputMode="numeric" autoComplete="off" value={value} onChange={(e) => { setValue(e.target.value); setError(false); }} aria-invalid={error} aria-describedby={error ? 'calcul-erreur' : undefined} autoFocus />
          {error && (
            <p id="calcul-erreur" className="mt-2 text-sm text-corail-700">
              Ce n’est pas la bonne réponse. Tu peux réessayer.
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button type="submit" className="flex-1">
              Entrer
            </Button>
            <Button variant="secondaire" onClick={() => navigate({ name: 'accueil' })}>
              Retour
            </Button>
          </div>
        </form>
        <p className="mt-4 text-xs text-encre-500">Simple vérification pour éviter les accès par erreur. Ce n’est pas une protection sécurisée.</p>
      </div>
    </main>
  );
}

export function Parent() {
  const [unlocked, setUnlocked] = useState(false);
  const navigate = useApp((s) => s.navigate);
  const [tab, setTab] = useState<Tab>('routines');
  if (!unlocked) return <ParentGate onOk={() => setUnlocked(true)} />;
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-3xl px-4 pb-10 pt-3 sm:px-6">
      <header className="flex items-center gap-2">
        <IconButton label="Retour à l’île" onClick={() => navigate({ name: 'accueil' })}>
          <ArrowLeft aria-hidden />
        </IconButton>
        <h1 className="titre">Espace parent</h1>
      </header>
      <nav className="mt-4 flex flex-wrap gap-1 rounded-3xl bg-sable-200 p-1.5" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-[44px] flex-1 whitespace-nowrap rounded-2xl px-3 text-sm font-semibold transition ${tab === t.id ? 'bg-white shadow-carte' : 'text-encre-700 hover:bg-sable-300/60'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="mt-5" role="tabpanel">
        {tab === 'routines' && <RoutinesTab />}
        {tab === 'historique' && <HistoryTab />}
        {tab === 'reglages' && <SettingsTab />}
        {tab === 'donnees' && <DataTab />}
        {tab === 'aide' && <HelpTab />}
      </div>
    </main>
  );
}

// ------------------------------------------------------------------ Routines

function RoutinesTab() {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const [editing, setEditing] = useState<{ routine: Routine; isNew: boolean } | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const added = new Set(data.routines.map((r) => r.templateId).filter(Boolean));

  if (editing) {
    return (
      <div>
        <h2 className="mb-4 text-xl font-semibold">{editing.isNew ? 'Nouvelle routine' : 'Modifier la routine'}</h2>
        <RoutineEditor
          initial={editing.routine}
          onCancel={() => setEditing(null)}
          onSave={(r) => {
            update((s) => upsertRoutine(s, r));
            setSaved(`« ${r.title} » est enregistrée.`);
            setEditing(null);
          }}
          onDelete={
            editing.isNew
              ? undefined
              : () => {
                  update((s) => deleteRoutine(s, editing.routine.id));
                  setSaved('La routine a été supprimée. Les XP déjà gagnés restent acquis.');
                  setEditing(null);
                }
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {saved && (
        <p className="rounded-2xl bg-mousse-100 px-4 py-3 text-mousse-700" role="status">
          {saved}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <Button icon={<BookOpen aria-hidden />} onClick={() => setLibraryOpen(true)}>
          Ajouter depuis la bibliothèque
        </Button>
        <Button variant="secondaire" icon={<Plus aria-hidden />} onClick={() => setEditing({ routine: newCustomRoutine(), isNew: true })}>
          Créer une routine
        </Button>
      </div>
      <Sheet open={libraryOpen} onClose={() => setLibraryOpen(false)} title="Bibliothèque de routines">
        <p className="mb-4 text-sm text-encre-700">Des modèles prêts à l’emploi. Une fois ajoutés, vous pouvez tout modifier : étapes, aides, moment, déclencheur.</p>
        {LIBRARY_GROUPS.map((g) => (
          <section key={g} className="mb-5">
            <h3 className="mb-2 font-semibold">{g}</h3>
            <ul className="flex flex-col gap-2">
              {LIBRARY.filter((t) => t.group === g).map((t) => {
                const isAdded = added.has(t.templateId);
                return (
                  <li key={t.templateId} className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-carte">
                    <RoutineArt illustration={t.illustration} size={48} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug">{t.title}</p>
                      <p className="text-xs text-encre-500">
                        {t.steps.length} étapes · ≈ {t.estimatedMinutes} min · {MOMENT_LABELS[t.moment].toLowerCase()}
                      </p>
                    </div>
                    {isAdded ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-mousse-700">
                        <Check size={16} aria-hidden /> Ajoutée
                      </span>
                    ) : (
                      <Button
                        size="petit"
                        variant="secondaire"
                        aria-label={`Ajouter « ${t.title} »`}
                        onClick={() => {
                          update((s) => addFromLibrary(s, t).state);
                          setSaved(`« ${t.title} » a été ajoutée.`);
                        }}
                      >
                        Ajouter
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </Sheet>
      {data.routines.length === 0 && <p className="carte p-5 text-encre-700">Aucune routine. Créez-en une, ou réinitialisez les données d’exemple dans l’onglet Données.</p>}
      {data.routines.map((r) => {
        const st = routineStats(data, r.id);
        return (
          <article key={r.id} className="carte flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3">
              <RoutineArt illustration={r.illustration} size={56} />
              <div className="min-w-0">
                <h3 className="font-semibold">{r.title}</h3>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Pill>{r.steps.length} étapes</Pill>
                  <Pill tone="lagon">{MOMENT_LABELS[r.moment]}</Pill>
                  {r.isDemo && <Pill tone="corail">Exemple</Pill>}
                  {r.isCustom && <Pill tone="lagon">Personnalisée</Pill>}
                  {st.completions > 0 && <Pill tone="mousse">Faite {st.completions} fois</Pill>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`aide-${r.id}`}>
                Niveau d’aide
              </label>
              <select
                id={`aide-${r.id}`}
                className="rounded-xl border-2 border-sable-300 bg-white px-2 py-2 text-sm"
                value={st.aidLevel}
                onChange={(e) => update((s) => setAidLevel(s, r.id, e.target.value as AidLevel))}
              >
                {(Object.keys(AID_LABELS) as AidLevel[]).map((k) => (
                  <option key={k} value={k}>
                    Aide : {AID_LABELS[k]}
                  </option>
                ))}
              </select>
              <Button variant="secondaire" size="petit" icon={<Pencil size={16} aria-hidden />} onClick={() => setEditing({ routine: r, isNew: false })}>
                Modifier
              </Button>
            </div>
          </article>
        );
      })}
      <p className="text-sm text-encre-500">Les routines marquées « Exemple » sont des données de démonstration : adaptez-les librement à votre quotidien.</p>
    </div>
  );
}

// ------------------------------------------------------------------ Historique

const STATUS_LABEL: Record<Session['status'], string> = {
  en_cours: 'en cours',
  en_pause: 'en pause',
  terminee: 'terminée',
  mise_de_cote: 'mise de côté'
};

function HistoryTab() {
  const sessions = useApp((s) => s.data.sessions);
  const calm = useApp((s) => s.data.calm);
  const list = useMemo(() => [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 40), [sessions]);
  const calmList = useMemo(() => [...calm.history].reverse().slice(0, 15), [calm.history]);
  const fmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="mb-3 text-sm text-encre-700">Un journal descriptif, sans score ni comparaison. Il sert à repérer ce qui aide, pas à évaluer.</p>
        {list.length === 0 ? (
          <p className="carte p-5 text-encre-700">Aucune routine réalisée pour l’instant. L’historique apparaîtra ici.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {list.map((s) => (
              <li key={s.id} className="carte p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">{s.routineTitle}</span>
                  <span className="text-sm capitalize text-encre-500">{fmt.format(new Date(s.startedAt))}</span>
                </div>
                <p className="mt-1 text-sm text-encre-700">
                  {s.completedStepIds.length} étape{s.completedStepIds.length > 1 ? 's' : ''} sur {s.totalSteps} · {STATUS_LABEL[s.status]} · mode {AID_LABELS[s.aidLevel].toLowerCase()}
                  {s.helpUsed > 0 && ` · aide demandée ${s.helpUsed} fois`}
                  {s.pauses > 0 && ` · ${s.pauses} pause${s.pauses > 1 ? 's' : ''}`}
                  {s.mood && ` · ressenti : ${s.mood}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="font-semibold">Coin calme</h3>
        <p className="mb-3 mt-1 text-sm text-encre-700">
          Les outils utilisés. La météo intérieure de l’enfant n’est jamais enregistrée.
          {calm.plan && (
            <>
              {' '}
              Son plan tempête : « Quand {calm.plan.feeling}, alors je choisis : {getTool(calm.plan.tool).short.toLowerCase()} ».
            </>
          )}
        </p>
        {calmList.length === 0 ? (
          <p className="carte p-5 text-encre-700">Le coin calme n’a pas encore été utilisé.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {calmList.map((h) => (
              <li key={h.id} className="carte flex flex-wrap items-baseline justify-between gap-2 p-4">
                <span className="font-medium">{getTool(h.tool).name}</span>
                <span className="text-sm capitalize text-encre-500">{fmt.format(new Date(h.at))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ Réglages

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 shadow-carte">
      <span>
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-sm text-encre-500">{hint}</span>}
      </span>
      <input type="checkbox" className="h-6 w-6 accent-lagon-700" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function SettingsTab() {
  const prefs = useApp((s) => s.data.preferences);
  const profile = useApp((s) => s.data.profile);
  const update = useApp((s) => s.update);
  const set = (patch: Partial<AppState['preferences']>) => update((s) => ({ ...s, preferences: { ...s.preferences, ...patch } }));
  return (
    <div className="flex flex-col gap-3">
      <Toggle label="Sons" hint="Petits sons doux lors des réussites." checked={prefs.soundEnabled} onChange={(v) => set({ soundEnabled: v })} />
      <Toggle label="Lecture à voix haute" hint="Affiche un bouton haut-parleur à côté des consignes." checked={prefs.voiceEnabled} onChange={(v) => set({ voiceEnabled: v })} />
      <Toggle label="Lire chaque étape automatiquement" checked={prefs.autoRead} onChange={(v) => set({ autoRead: v })} />
      <Toggle
        label="Texte plus grand"
        checked={prefs.displayPreferences.textSize === 'grand'}
        onChange={(v) => set({ displayPreferences: { ...prefs.displayPreferences, textSize: v ? 'grand' : 'normal' } })}
      />
      <fieldset className="rounded-2xl bg-white px-4 py-3 shadow-carte">
        <legend className="sr-only">Ma journée</legend>
        <p className="font-medium">Ma journée</p>
        <p className="text-sm text-encre-500">Heure à laquelle commence chaque moment. L’accueil propose les quêtes du moment en cours.</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              ['matin', 'Matin'],
              ['apresEcole', 'Après l’école'],
              ['soir', 'Soir']
            ] as const
          ).map(([k, label]) => (
            <div key={k}>
              <label htmlFor={`h-${k}`} className="etiquette">
                {label}
              </label>
              <select
                id={`h-${k}`}
                className="champ px-2"
                value={prefs.dayMoments[k]}
                onChange={(e) => set({ dayMoments: { ...prefs.dayMoments, [k]: Number(e.target.value) } })}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>
                    {h} h
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="rounded-2xl bg-white px-4 py-3 shadow-carte">
        <label htmlFor="anim" className="block font-medium">
          Animations
        </label>
        <select id="anim" className="champ mt-2" value={prefs.reducedMotion} onChange={(e) => set({ reducedMotion: e.target.value as AppState['preferences']['reducedMotion'] })}>
          <option value="systeme">Suivre le réglage de l’appareil</option>
          <option value="oui">Réduire les animations</option>
          <option value="non">Animations normales</option>
        </select>
      </div>
      {profile && (
        <div className="rounded-2xl bg-white px-4 py-3 shadow-carte">
          <label htmlFor="prenom-p" className="block font-medium">
            Prénom ou surnom de l’enfant
          </label>
          <input
            id="prenom-p"
            className="champ mt-2"
            maxLength={30}
            value={profile.childName}
            onChange={(e) => update((s) => ({ ...s, profile: s.profile ? { ...s.profile, childName: e.target.value } : s.profile }))}
          />
          <label htmlFor="nom-c" className="mt-3 block font-medium">
            Nom du compagnon
          </label>
          <input
            id="nom-c"
            className="champ mt-2"
            maxLength={20}
            value={profile.companionName}
            onChange={(e) => update((s) => ({ ...s, profile: s.profile ? { ...s.profile, companionName: e.target.value } : s.profile }))}
          />
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Données

function DataTab() {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const wipeAll = useApp((s) => s.wipeAll);
  const [confirm, setConfirm] = useState<'reset' | 'wipe' | null>(null);
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([exportData(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compagnon-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg({ tone: 'ok', text: 'Le fichier de sauvegarde a été téléchargé.' });
  };

  const doImport = async (file: File) => {
    try {
      const next = parseImport(await file.text());
      update(() => next);
      setMsg({ tone: 'ok', text: 'Sauvegarde restaurée.' });
    } catch (e) {
      setMsg({ tone: 'err', text: e instanceof Error ? e.message : 'Fichier illisible.' });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {msg && (
        <p className={`rounded-2xl px-4 py-3 ${msg.tone === 'ok' ? 'bg-mousse-100 text-mousse-700' : 'bg-corail-100 text-corail-700'}`} role="status">
          {msg.text}
        </p>
      )}
      <section className="carte p-5">
        <h2 className="font-semibold">Où sont les données ?</h2>
        <p className="mt-1 text-sm text-encre-700">
          Tout reste sur cet appareil, dans le navigateur. Rien n’est envoyé sur Internet : pas de compte, pas de publicité, pas de suivi. {data.sessions.length} session
          {data.sessions.length > 1 ? 's' : ''} et {data.routines.length} routine{data.routines.length > 1 ? 's' : ''} sont enregistrées.
        </p>
      </section>
      <section className="carte flex flex-col gap-3 p-5">
        <h2 className="font-semibold">Sauvegarde</h2>
        <p className="text-sm text-encre-700">Exportez régulièrement, surtout sur iPhone ou iPad : le navigateur peut effacer les données d’un site peu utilisé.</p>
        <div className="flex flex-wrap gap-2">
          <Button icon={<Download aria-hidden />} onClick={doExport}>
            Exporter en JSON
          </Button>
          <Button variant="secondaire" icon={<FileUp aria-hidden />} onClick={() => fileRef.current?.click()}>
            Restaurer une sauvegarde
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = '';
            }}
          />
        </div>
      </section>
      <section className="carte flex flex-col gap-3 p-5">
        <h2 className="font-semibold">Recommencer</h2>
        <p className="text-sm text-encre-700">
          <strong>Réinitialiser la démonstration</strong> remet les routines d’exemple et une progression à zéro, en gardant le profil et les réglages.
        </p>
        {confirm === 'reset' ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              onClick={() => {
                update((s) => resetDemo(s));
                setConfirm(null);
                setMsg({ tone: 'ok', text: 'Les données de démonstration ont été réinitialisées.' });
              }}
            >
              Oui, réinitialiser
            </Button>
            <Button variant="secondaire" onClick={() => setConfirm(null)}>
              Annuler
            </Button>
          </div>
        ) : (
          <Button variant="secondaire" icon={<RotateCcw aria-hidden />} onClick={() => setConfirm('reset')}>
            Réinitialiser la démonstration
          </Button>
        )}
        <p className="mt-2 text-sm text-encre-700">
          <strong>Supprimer toutes les données</strong> efface tout ce qui est enregistré sur cet appareil. Pensez à exporter avant.
        </p>
        {confirm === 'wipe' ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="danger" onClick={() => wipeAll()}>
              Oui, tout supprimer
            </Button>
            <Button variant="secondaire" onClick={() => setConfirm(null)}>
              Annuler
            </Button>
          </div>
        ) : (
          <Button variant="secondaire" className="text-corail-700" icon={<Trash2 aria-hidden />} onClick={() => setConfirm('wipe')}>
            Supprimer toutes les données
          </Button>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------------ Aide

function HelpTab() {
  return (
    <div className="flex flex-col gap-4">
      <section className="carte p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Smartphone aria-hidden /> Installer l’application
        </h2>
        <h3 className="mt-3 font-medium">iPhone et iPad (Safari)</h3>
        <ol className="ml-5 mt-1 list-decimal text-sm text-encre-700">
          <li>Ouvrez l’application dans Safari.</li>
          <li>Touchez le bouton Partager (carré avec une flèche).</li>
          <li>Choisissez « Sur l’écran d’accueil ».</li>
        </ol>
        <p className="mt-1 text-sm text-encre-700">Une fois installée, l’application garde ses données plus durablement.</p>
        <h3 className="mt-3 font-medium">Android (Chrome)</h3>
        <ol className="ml-5 mt-1 list-decimal text-sm text-encre-700">
          <li>Ouvrez l’application dans Chrome.</li>
          <li>Touchez le menu ⋮ en haut à droite.</li>
          <li>Choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».</li>
        </ol>
      </section>
      <section className="carte p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <Info aria-hidden /> À propos de ce prototype
        </h2>
        <ul className="ml-5 mt-2 list-disc text-sm text-encre-700">
          <li>Compagnon est un outil pour faciliter le quotidien. Ce n’est pas un dispositif médical : il ne diagnostique, ne traite et ne guérit aucun trouble.</li>
          <li>Il s’inspire de pratiques documentées (découpage des tâches, renforcement immédiat, plans « si… alors… », retrait progressif de l’aide), sans garantie d’efficacité.</li>
          <li>Pas de série quotidienne, pas de classement, pas de pénalité : rien n’est jamais perdu.</li>
          <li>Conseil : encouragez l’effort et la stratégie (« tu as trouvé comment commencer ») plutôt que la vitesse.</li>
        </ul>
      </section>
    </div>
  );
}
