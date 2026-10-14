import { Backpack, Check, Compass, Gift, Home as HomeIcon, Lock, Moon, Pencil, Play, RotateCcw, Sunrise, Volume2, VolumeX, Wind } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Island } from '../art/Island';
import { RoutineArt } from '../art/RoutineArt';
import { MyCompanion, SpeakButton, SpeechBubble } from '../components/shared';
import { Button, IconButton, Pill, Screen, Sheet, XpBar } from '../components/ui';
import { GREETINGS, pick } from '../data/messages';
import { useReducedMotion } from '../lib/hooks';
import { currentMoment, getRoutine, hasShortVersion, momentSummary, MOMENTS, openSession, setTrigger, suggestForMoment, TRIGGER_IDEAS, validStepCount } from '../logic/engine';
import type { Moment, Routine } from '../types';
import { levelProgress, WORLD_STAGE_NAMES } from '../logic/progression';
import { useApp } from '../store/useApp';

export function Home() {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const navigate = useApp((s) => s.navigate);
  const startMission = useApp((s) => s.startMission);
  const reduced = useReducedMotion();
  const { progression, profile, preferences } = data;
  const lp = levelProgress(progression.totalXp);
  const greeting = useMemo(() => pick(GREETINGS), []);
  const [bubble, setBubble] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setBubble(false), 6000);
    return () => window.clearTimeout(t);
  }, []);
  const nowMoment = currentMoment(preferences.dayMoments);
  const [moment, setMoment] = useState<Exclude<Moment, 'libre'>>(nowMoment);
  const summary = momentSummary(data, moment);
  const inMoment = suggestForMoment(data, moment);
  const fallback = !inMoment && summary.total === 0 ? suggestForMoment(data, 'libre') : undefined;
  const suggestion = inMoment ?? fallback;
  const open = suggestion ? openSession(data, suggestion.id) : undefined;
  const lastOpen = data.sessions
    .filter((x) => x.status === 'en_cours' || x.status === 'en_pause')
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const openElsewhere = lastOpen && lastOpen.routineId !== suggestion?.id ? getRoutine(data, lastOpen.routineId) : undefined;
  const gifts = progression.pendingChoices.length;

  return (
    <Screen>
      <header className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-3 rounded-3xl bg-white/80 px-4 py-2 shadow-carte">
          <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-lagon-700 text-white" aria-label={`Niveau ${lp.level}`}>
            <span className="text-[10px] leading-none opacity-80">niv.</span>
            <span className="text-lg font-semibold leading-none">{lp.level}</span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex justify-between text-xs font-medium text-encre-700">
              <span>Expérience</span>
              <span>
                {lp.current} / {lp.needed} XP
              </span>
            </div>
            <XpBar ratio={lp.ratio} label={`Progression vers le niveau ${lp.level + 1}`} />
          </div>
        </div>
        <IconButton
          label={preferences.soundEnabled ? 'Couper le son' : 'Activer le son'}
          aria-pressed={preferences.soundEnabled}
          onClick={() => update((s) => ({ ...s, preferences: { ...s.preferences, soundEnabled: !s.preferences.soundEnabled } }))}
        >
          {preferences.soundEnabled ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
        </IconButton>
      </header>

      <section className="relative mt-4" aria-label="Ton île">
        <div className="overflow-hidden rounded-4xl shadow-carte">
          <Island stage={progression.worldStage} ambiance={progression.equipped.ambiance} decor={progression.equipped.decor} animate={!reduced} className="block w-full" />
        </div>
        <div className="absolute -bottom-6 left-1 flex items-end sm:left-4">
          <MyCompanion size={128} breathe />
        </div>
        <div className={`absolute left-3 top-3 max-w-[62%] transition-opacity duration-700 ${bubble ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <SpeechBubble className="px-3 py-2 text-sm sm:text-base">{profile?.childName ? `Coucou ${profile.childName} ! ${greeting}` : greeting}</SpeechBubble>
        </div>
      </section>
      <p className="mt-8 text-center text-sm text-encre-700">
        <span className="font-semibold">{profile?.companionName}</span> · {WORLD_STAGE_NAMES[progression.worldStage]}
      </p>

      {gifts > 0 && (
        <button
          type="button"
          onClick={() => navigate({ name: 'cabane', tab: 'compagnon' })}
          className="mt-3 flex items-center justify-center gap-2 rounded-3xl bg-corail-100 px-4 py-3 font-semibold text-corail-700 transition hover:bg-corail-300/40"
        >
          <Gift aria-hidden /> {gifts > 1 ? `${gifts} cadeaux t’attendent` : 'Un cadeau t’attend'} dans ta cabane
        </button>
      )}

      <section className="mt-4" aria-label="Ma journée">
        <div className="flex gap-1.5 rounded-3xl bg-sable-200 p-1.5" role="tablist" aria-label="Moments de ma journée">
          {MOMENTS.map((m) => {
            const sum = momentSummary(data, m.id);
            const selected = moment === m.id;
            const Icon = MOMENT_ICONS[m.id];
            const allDone = sum.total > 0 && sum.done === sum.total;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setMoment(m.id)}
                className={`flex min-h-[64px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-sm font-semibold leading-tight transition ${selected ? 'bg-white text-encre-900 shadow-carte' : 'text-encre-700 hover:bg-sable-300/60'}`}
              >
                <Icon size={20} aria-hidden />
                <span className="whitespace-nowrap">{m.label}</span>
                {sum.total > 0 && (
                  <span className={`flex items-center gap-1 text-xs font-medium ${allDone ? 'text-mousse-700' : 'text-encre-500'}`}>
                    {allDone && <Check size={12} aria-hidden />}
                    {sum.done} / {sum.total}
                    {m.id === nowMoment && <span className="sr-only">(maintenant)</span>}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {openElsewhere && (
          <button
            type="button"
            onClick={() => startMission(openElsewhere.id)}
            className="mt-3 flex w-full items-center gap-2 rounded-2xl bg-lagon-100 px-4 py-2.5 text-left text-sm font-medium text-lagon-900 transition hover:bg-lagon-300/50"
          >
            <RotateCcw size={16} aria-hidden /> Tu as commencé « {openElsewhere.title} ». Reprendre
          </button>
        )}

        {suggestion ? (
          <QuestCard routine={suggestion} label={fallback ? 'Une quête à tout moment' : open ? 'Ta quête en cours' : 'Ta prochaine quête'} />
        ) : (
          <div className="carte mt-3 flex items-center gap-4 p-5">
            <MyCompanion size={72} expression={summary.total > 0 ? 'joie' : 'content'} />
            <p className="flex-1 text-encre-700">
              {summary.total > 0
                ? 'Tout est fait pour ce moment ! Tu peux souffler, ou choisir une autre aventure.'
                : data.routines.length === 0
                  ? 'Aucune routine pour l’instant. Un adulte peut en ajouter dans l’espace parent.'
                  : 'Pas de quête prévue pour ce moment.'}
            </p>
          </div>
        )}
      </section>

      <nav className="mt-4 grid grid-cols-2 gap-3" aria-label="Navigation">
        <Button variant="secondaire" className="whitespace-nowrap" icon={<Compass aria-hidden />} onClick={() => navigate({ name: 'aventures' })}>
          Aventures
        </Button>
        <Button variant="secondaire" className="whitespace-nowrap" icon={<HomeIcon aria-hidden />} onClick={() => navigate({ name: 'cabane' })}>
          Ma cabane
          {progression.unseen.length > 0 && <span className="h-2.5 w-2.5 rounded-full bg-corail-500" aria-label="nouveautés" />}
        </Button>
      </nav>
      <Button variant="doux" className="mt-3 w-full" icon={<Wind aria-hidden />} onClick={() => navigate({ name: 'calme' })}>
        Mon coin calme
      </Button>

      <footer className="mt-auto flex justify-center pt-8">
        <button
          type="button"
          onClick={() => navigate({ name: 'parent' })}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-encre-500 transition hover:bg-sable-200 hover:text-encre-700"
        >
          <Lock size={14} aria-hidden /> Espace parent
        </button>
      </footer>
    </Screen>
  );
}

const MOMENT_ICONS = { matin: Sunrise, 'apres-ecole': Backpack, soir: Moon } as const;

/** La quête proposée, avec le plan « Quand… alors… » que l'enfant peut choisir lui-même. */
function QuestCard({ routine, label }: { routine: Routine; label: string }) {
  const data = useApp((s) => s.data);
  const startMission = useApp((s) => s.startMission);
  const [planOpen, setPlanOpen] = useState(false);
  const open = openSession(data, routine.id);
  const done = open ? validStepCount(routine, open) : 0;
  return (
    <section className="carte mt-3 p-5" aria-labelledby="mission-titre">
      <p className="text-sm font-medium text-lagon-700">{label}</p>
      <div className="mt-2 flex items-center gap-4">
        <RoutineArt illustration={routine.illustration} size={84} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h2 id="mission-titre" className="flex-1 text-xl font-semibold leading-snug">
              {routine.title}
            </h2>
            <SpeakButton text={routine.title} className="h-9 w-9" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill>≈ {routine.estimatedMinutes} min</Pill>
            <Pill>{routine.steps.length} étapes</Pill>
            {open && done > 0 && <Pill tone="mousse">{done} faite{done > 1 ? 's' : ''}</Pill>}
          </div>
        </div>
      </div>
      {!open && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-sable-100 py-1.5 pl-4 pr-1.5 text-sm text-encre-700">
          <p className="flex-1">
            {routine.trigger ? (
              <>
                <span className="font-semibold">Ton plan :</span> {routine.trigger}, alors je commence.
              </>
            ) : (
              'Choisis quand tu commenceras : ça aide à démarrer.'
            )}
          </p>
          <Button variant="fantome" size="petit" icon={<Pencil size={16} aria-hidden />} onClick={() => setPlanOpen(true)}>
            {routine.trigger ? 'Changer' : 'Mon plan'}
          </Button>
        </div>
      )}
      <Button size="grand" className="mt-4 w-full" icon={open ? <RotateCcw aria-hidden /> : <Play aria-hidden />} onClick={() => startMission(routine.id)}>
        {open ? 'Reprendre' : 'C’est parti !'}
      </Button>
      {!open && hasShortVersion(routine) && (
        <Button variant="fantome" size="petit" className="mt-2 w-full" onClick={() => startMission(routine.id, false, true)}>
          Version courte · {routine.steps.filter((s) => s.essential).length} étapes
        </Button>
      )}
      <PlanSheet routine={routine} open={planOpen} onClose={() => setPlanOpen(false)} />
    </section>
  );
}

export function PlanSheet({ routine, open, onClose }: { routine: Routine; open: boolean; onClose: () => void }) {
  const update = useApp((s) => s.update);
  const ideas = TRIGGER_IDEAS[routine.moment] ?? TRIGGER_IDEAS.libre;
  const [custom, setCustom] = useState('');
  const save = (t: string) => {
    if (!t.trim()) return;
    update((s) => setTrigger(s, routine.id, t));
    setCustom('');
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Mon plan">
      <p className="mb-3 text-encre-700">
        Choisis le moment où tu commenceras « {routine.title} ». Un moment précis, c’est plus facile pour démarrer.
      </p>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Idées de moments">
        {ideas.map((idea) => (
          <button
            key={idea}
            type="button"
            role="radio"
            aria-checked={routine.trigger === idea}
            onClick={() => save(idea)}
            className={`flex min-h-[52px] items-center gap-3 rounded-2xl border-2 px-4 text-left text-base font-medium transition ${routine.trigger === idea ? 'border-lagon-500 bg-lagon-100' : 'border-sable-300 bg-white hover:border-lagon-300'}`}
          >
            {routine.trigger === idea && <Check size={18} className="text-lagon-700" aria-hidden />}
            {idea}…
          </button>
        ))}
      </div>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          save(custom);
        }}
      >
        <label htmlFor="plan-perso" className="etiquette">
          Ou écris ton propre moment
        </label>
        <div className="flex gap-2">
          <input id="plan-perso" className="champ" maxLength={80} placeholder="Quand…" value={custom} onChange={(e) => setCustom(e.target.value)} />
          <Button type="submit" disabled={!custom.trim()}>
            OK
          </Button>
        </div>
      </form>
      <p className="mt-3 text-sm text-encre-500">… alors je commence « {routine.title} ».</p>
    </Sheet>
  );
}
