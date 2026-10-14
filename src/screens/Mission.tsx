import { ArrowRight, Check, Circle, Coffee, HandHelping, Hourglass as HourglassIcon, Lightbulb, ListChecks, Redo2, Sparkle, Wand2, Wind, X } from 'lucide-react';
import { StepPhoto } from '../components/StepPhoto';
import { CalmPlanEditor, CalmToolRunner } from './Calm';
import { Hourglass } from '../components/Hourglass';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RoutineArt } from '../art/RoutineArt';
import { MyCompanion, SpeakButton, SpeechBubble } from '../components/shared';
import { Sparkles } from '../components/Sparkles';
import { Button, IconButton, Screen, Sheet, XpBar } from '../components/ui';
import { PAUSE_MESSAGES, pick, STEP_AFTER_HELP_MESSAGES, STEP_MESSAGES } from '../data/messages';
import { playSound } from '../lib/sound';
import { speak, stopSpeaking } from '../lib/voice';
import { condensedBlocks, getRoutine, pauseSession, recordHelp, remainingSteps, resumeSession, sessionSteps, setAidLevel, skipStep, validStepCount } from '../logic/engine';
import { levelProgress } from '../logic/progression';
import { useApp } from '../store/useApp';
import type { Step } from '../types';
import { AID_LABELS } from './Adventures';

type View = 'etape' | 'recompense' | 'plus-facile' | 'comment' | 'pause';

export function Mission({ sessionId }: { sessionId: string }) {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const navigate = useApp((s) => s.navigate);
  const completeStepsAction = useApp((s) => s.completeSteps);
  const session = data.sessions.find((x) => x.id === sessionId);
  const routine = session ? getRoutine(data, session.routineId) : undefined;
  const sound = data.preferences.soundEnabled;

  const [view, setView] = useState<View>(session?.status === 'en_pause' ? 'pause' : 'etape');
  const [helpOpen, setHelpOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const timer = data.preferences.displayPreferences;
  const setTimer = (patch: Partial<typeof timer>) =>
    update((s) => ({ ...s, preferences: { ...s.preferences, displayPreferences: { ...s.preferences.displayPreferences, ...patch } } }));
  const [listOpen, setListOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reward, setReward] = useState<{ xp: number; message: string; key: number } | null>(null);
  const [helpedThisStep, setHelpedThisStep] = useState(false);
  const [startedBanner, setStartedBanner] = useState(false);
  const pauseMessage = useMemo(() => pick(PAUSE_MESSAGES), []);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Unité de travail courante selon le niveau d'aide
  const unit = useMemo(() => {
    if (!routine || !session) return null;
    const all = sessionSteps(routine, session);
    const remaining = remainingSteps(routine, session);
    if (remaining.length === 0) return null;
    if (session.aidLevel === 'autonome') {
      return { steps: remaining, index: 0, total: 1, label: 'Toute la routine', title: routine.title };
    }
    if (session.aidLevel === 'condense') {
      const blocks = condensedBlocks(all);
      const idx = blocks.findIndex((b) => b.some((st) => !session.completedStepIds.includes(st.id)));
      const block = blocks[idx].filter((st) => !session.completedStepIds.includes(st.id));
      return { steps: block, index: idx, total: blocks.length, label: `Bloc ${idx + 1} sur ${blocks.length}`, title: block.length === 1 ? block[0].title : `${block.length} étapes d’un coup` };
    }
    const done = all.length - remaining.length;
    const isLater = (session.skipped ?? []).includes(remaining[0].id);
    return {
      steps: [remaining[0]],
      index: done,
      total: all.length,
      label: isLater ? 'On revient à l’étape gardée pour plus tard' : `Étape ${done + 1} sur ${all.length}`,
      title: remaining[0].title,
      canSkip: remaining.length > 1 && !isLater
    };
  }, [routine, session]);

  const current: Step | undefined = unit?.steps[0];

  // Lecture automatique (si activée) et focus sur le titre à chaque nouvelle étape
  useEffect(() => {
    if (view !== 'etape' || !unit) return;
    headingRef.current?.focus();
    if (data.preferences.voiceEnabled && data.preferences.autoRead) speak(unit.title);
  }, [unit?.title, view]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopSpeaking(), []);

  if (!session || !routine) {
    return (
      <Screen className="items-center justify-center text-center">
        <MyCompanion expression="reflechit" size={140} />
        <p className="mt-4 text-lg">Cette quête n’est plus disponible.</p>
        <Button className="mt-6" onClick={() => navigate({ name: 'accueil' }, true)}>
          Revenir à mon île
        </Button>
      </Screen>
    );
  }

  const scope = sessionSteps(routine, session);
  const totalSteps = scope.length;
  const doneCount = validStepCount(routine, session);
  const lp = levelProgress(data.progression.totalXp);

  const leave = () => {
    if (session.status === 'en_cours' && doneCount < totalSteps) update((s) => pauseSession(s, sessionId));
    navigate({ name: 'accueil' });
  };

  const validate = () => {
    if (busy || !unit) return;
    setBusy(true);
    const events = completeStepsAction(sessionId, unit.steps.map((x) => x.id));
    stopSpeaking();
    if (events.sessionCompleted) {
      playSound('fin', sound);
      setReward({ xp: events.xpGained, message: 'Mission accomplie !', key: Date.now() });
      setView('recompense');
      window.setTimeout(() => navigate({ name: 'fin', sessionId }, true), 1300);
      return;
    }
    playSound('etape', sound);
    setReward({ xp: events.xpGained, message: pick(helpedThisStep ? STEP_AFTER_HELP_MESSAGES : STEP_MESSAGES), key: Date.now() });
    setView('recompense');
    setHelpedThisStep(false);
    setStartedBanner(false);
    setBusy(false);
  };

  const askHelp = (kind: 'plus-facile' | 'comment' | 'pause') => {
    setHelpOpen(false);
    update((s) => recordHelp(s, sessionId));
    setHelpedThisStep(true);
    if (kind === 'pause') {
      update((s) => pauseSession(s, sessionId));
      setView('pause');
    } else {
      setView(kind);
    }
  };

  const companionExpression = view === 'recompense' ? (reward?.message === 'Mission accomplie !' ? 'bravo' : 'joie') : view === 'pause' ? 'calme' : view === 'comment' || view === 'plus-facile' ? 'reflechit' : 'content';

  return (
    <Screen>
      <header className="flex items-center gap-2">
        <IconButton label="Quitter la quête (tu pourras reprendre)" onClick={leave}>
          <X aria-hidden />
        </IconButton>
        <div className="flex-1">
          <p className="text-center text-sm font-medium text-encre-700">{routine.title}</p>
          <ol className="mt-1.5 flex gap-1" aria-label={`${doneCount} étapes faites sur ${totalSteps}`}>
            {scope.map((st) => {
              const isDone = session.completedStepIds.includes(st.id);
              const isNow = unit?.steps.some((u) => u.id === st.id);
              return (
                <li
                  key={st.id}
                  className={`h-2.5 flex-1 rounded-full transition-colors ${isDone ? 'bg-mousse-500' : isNow ? 'bg-lagon-300 ring-2 ring-lagon-500' : 'bg-sable-300'}`}
                  aria-label={`${st.title} : ${isDone ? 'faite' : isNow ? 'en cours' : 'à venir'}`}
                />
              );
            })}
          </ol>
        </div>
        <IconButton
          label="Sablier"
          aria-pressed={timer.showTimer}
          onClick={() => setTimerOpen(true)}
          className={timer.showTimer ? 'bg-ciel-100 text-encre-900' : ''}
        >
          <HourglassIcon aria-hidden />
        </IconButton>
        <IconButton label="Voir toutes les étapes" onClick={() => setListOpen(true)}>
          <ListChecks aria-hidden />
        </IconButton>
      </header>

      {/* ------------------------------------------------ Étape */}
      {view === 'etape' && unit && current && (
        <div className="flex flex-1 animate-apparait flex-col" key={current.id}>
          <p className="mb-2 mt-5 text-sm font-medium text-lagon-700">{unit.label}</p>
          <section className="carte p-6" aria-live="polite">
            <div className="flex items-start gap-3">
              <h1 ref={headingRef} tabIndex={-1} className="flex-1 text-2xl font-semibold leading-snug outline-none sm:text-3xl">
                {unit.title}
              </h1>
              <SpeakButton text={[unit.title, ...(unit.steps.length === 1 ? [current.description] : unit.steps.map((x) => x.title))].join('. ')} />
            </div>
            {unit.steps.length === 1 && current.description && <p className="mt-3 text-lg text-encre-700">{current.description}</p>}
            {unit.steps.length > 1 && (
              <ul className="mt-4 flex flex-col gap-2">
                {unit.steps.map((st) => (
                  <li key={st.id} className="flex items-center gap-3 rounded-2xl bg-sable-100 px-4 py-3 text-base">
                    <Circle size={18} className="shrink-0 text-lagon-500" aria-hidden />
                    {st.title}
                  </li>
                ))}
              </ul>
            )}
            {session.aidLevel === 'autonome' && <p className="mt-3 text-encre-700">Tu connais cette routine. Fais-la à ta façon, puis reviens ici.</p>}
            {unit.steps.length === 1 && current.tool && (
              <Button variant="secondaire" className="mt-4 w-full" icon={<Wind aria-hidden />} onClick={() => setToolOpen(true)}>
                {current.tool === 'plan' ? 'Ouvrir mon plan tempête' : 'Faire l’exercice avec mon compagnon'}
              </Button>
            )}
            {unit.steps.length === 1 && (
              <div className="mt-3">
                <StepPhoto stepId={current.id} editable={false} compact />
              </div>
            )}
          </section>
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4">
            {startedBanner && <SpeechBubble className="text-center">Tu as commencé, c’est le plus dur ! On continue ?</SpeechBubble>}
            <div className="flex items-end justify-center gap-6">
              <MyCompanion size={timer.showTimer ? 110 : startedBanner ? 120 : 140} expression={startedBanner ? 'joie' : 'content'} breathe />
              {timer.showTimer && <Hourglass key={`${current.id}-${timer.timerMinutes}`} minutes={timer.timerMinutes} size={120} />}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button size="grand" onClick={validate} disabled={busy} icon={<Check aria-hidden size={28} />} silent>
              C’est fait !
            </Button>
            <div className="flex gap-2">
              <Button variant="secondaire" className="flex-1" onClick={() => setHelpOpen(true)} icon={<HandHelping aria-hidden />}>
                J’ai besoin d’aide
              </Button>
              {'canSkip' in unit && unit.canSkip && (
                <Button
                  variant="fantome"
                  icon={<Redo2 aria-hidden />}
                  onClick={() => {
                    update((s) => skipStep(s, sessionId, current.id));
                    setStartedBanner(false);
                  }}
                >
                  Plus tard
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ Récompense immédiate */}
      {view === 'recompense' && reward && (
        <div className="flex flex-1 animate-apparait flex-col items-center justify-center text-center" role="status" aria-live="assertive">
          <div className="relative">
            <MyCompanion size={180} expression={companionExpression} bounceKey={reward.key} />
            <Sparkles burstKey={reward.key} />
            <span key={reward.key} className="xp-flotte absolute -right-4 top-2 rounded-full bg-mousse-500 px-3 py-1 text-lg font-bold text-white shadow">
              +{reward.xp} XP
            </span>
          </div>
          <p className="mt-4 text-2xl font-semibold">{reward.message}</p>
          <p className="mt-1 text-encre-700">
            {doneCount} étape{doneCount > 1 ? 's' : ''} faite{doneCount > 1 ? 's' : ''} sur {totalSteps}
          </p>
          <div className="mt-5 w-full max-w-xs">
            <div className="mb-1 flex justify-between text-xs text-encre-700">
              <span>Niveau {lp.level}</span>
              <span>
                {lp.current} / {lp.needed} XP
              </span>
            </div>
            <XpBar ratio={lp.ratio} label="Expérience" />
          </div>
          {doneCount < totalSteps && (
            <Button size="grand" className="mt-8 w-full flex-row-reverse" icon={<ArrowRight aria-hidden />} onClick={() => setView('etape')} autoFocus>
              Étape suivante
            </Button>
          )}
        </div>
      )}

      {/* ------------------------------------------------ Rends cette étape plus facile */}
      {view === 'plus-facile' && current && (
        <div className="flex flex-1 animate-apparait flex-col">
          <div className="mt-4 flex items-end gap-2">
            <MyCompanion size={96} expression="reflechit" />
            <SpeechBubble className="mb-6 flex-1">On commence par un tout petit pas.</SpeechBubble>
          </div>
          <section className="carte p-6">
            <p className="flex items-center gap-2 text-sm font-medium text-lagon-700">
              <Wand2 size={18} aria-hidden /> Une étape plus petite
            </p>
            <div className="mt-2 flex items-start gap-3">
              <h1 className="flex-1 text-2xl font-semibold leading-snug">{current.easierText || `Fais juste le tout premier geste de : « ${current.title.toLowerCase()} ».`}</h1>
              <SpeakButton text={current.easierText || current.title} />
            </div>
          </section>
          <div className="mt-auto flex flex-col gap-3 pt-6">
            <Button size="grand" onClick={() => { setStartedBanner(true); setView('etape'); }} icon={<Sparkle aria-hidden />}>
              J’ai fait ce petit pas
            </Button>
            <Button variant="secondaire" onClick={validate} icon={<Check aria-hidden />} silent>
              J’ai fait toute l’étape
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ Montre-moi comment commencer */}
      {view === 'comment' && current && (
        <div className="flex flex-1 animate-apparait flex-col">
          <section className="carte mt-4 p-6">
            <div className="flex items-center gap-4">
              <RoutineArt illustration={routine.illustration} size={72} />
              <p className="flex items-center gap-2 text-sm font-medium text-lagon-700">
                <Lightbulb size={18} aria-hidden /> Comment commencer
              </p>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <p className="flex-1 text-xl font-medium leading-relaxed">{current.helpText || `Prépare ce dont tu as besoin, puis fais le premier geste de « ${current.title.toLowerCase()} ».`}</p>
              <SpeakButton text={current.helpText || current.title} />
            </div>
          </section>
          <div className="mt-6 flex justify-center">
            <MyCompanion size={120} expression="reflechit" />
          </div>
          <div className="mt-auto flex flex-col gap-3 pt-6">
            <Button size="grand" onClick={() => setView('etape')}>
              J’ai compris, j’y vais
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ Pause */}
      {view === 'pause' && (
        <div className="flex flex-1 animate-apparait flex-col items-center text-center">
          <div className="mt-10">
            <MyCompanion size={170} expression="calme" breathe />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">C’est la pause</h1>
          <p className="mt-2 max-w-sm text-lg text-encre-700">{pauseMessage}</p>
          <p className="mt-2 text-sm text-encre-500">
            {doneCount > 0 ? `${doneCount} étape${doneCount > 1 ? 's' : ''} déjà faite${doneCount > 1 ? 's' : ''}. Rien n’est perdu.` : 'Tu pourras commencer quand tu voudras.'}
          </p>
          <div className="mt-auto flex w-full flex-col gap-3 pt-8">
            <Button
              size="grand"
              onClick={() => {
                update((s) => resumeSession(s, sessionId));
                setView('etape');
              }}
            >
              Je reprends
            </Button>
            <Button variant="secondaire" icon={<Wind aria-hidden />} onClick={() => navigate({ name: 'calme', returnTo: sessionId })}>
              Aller dans mon coin calme
            </Button>
            <Button variant="secondaire" onClick={() => navigate({ name: 'aventures' })}>
              Choisir une autre mission
            </Button>
            <Button variant="fantome" onClick={() => navigate({ name: 'accueil' })}>
              Revenir à mon île
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------ Aide */}
      <Sheet open={helpOpen} onClose={() => setHelpOpen(false)} title="De quoi as-tu besoin ?">
        <div className="flex flex-col gap-3">
          {[
            { k: 'plus-facile' as const, icon: <Wand2 aria-hidden />, label: 'Rends cette étape plus facile' },
            { k: 'comment' as const, icon: <Lightbulb aria-hidden />, label: 'Montre-moi comment commencer' },
            { k: 'pause' as const, icon: <Coffee aria-hidden />, label: 'J’ai besoin d’une pause' }
          ].map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => askHelp(o.k)}
              className="flex min-h-[64px] items-center gap-4 rounded-3xl bg-white px-5 text-left text-lg font-semibold shadow-carte transition hover:bg-lagon-100"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lagon-100 text-lagon-900">{o.icon}</span>
              {o.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-encre-500">Demander de l’aide ne fait rien perdre.</p>
      </Sheet>

      {/* ------------------------------------------------ Exercice du coin calme lié à une étape */}
      <Sheet open={toolOpen && !!current?.tool} onClose={() => setToolOpen(false)} title={current?.tool === 'plan' ? 'Mon plan tempête' : 'Exercice'}>
        {current?.tool === 'plan' ? (
          <CalmPlanEditor onSaved={() => setToolOpen(false)} />
        ) : current?.tool ? (
          <CalmToolRunner tool={current.tool} onDone={() => setToolOpen(false)} />
        ) : null}
      </Sheet>

      {/* ------------------------------------------------ Sablier facultatif */}
      <Sheet open={timerOpen} onClose={() => setTimerOpen(false)} title="Le sablier">
        <p className="mb-4 text-encre-700">Le sablier montre le temps qui passe. Ce n’est pas une course : quand il est vide, rien ne se passe, tu continues à ton rythme.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant={timer.showTimer ? 'principal' : 'secondaire'} aria-pressed={timer.showTimer} onClick={() => setTimer({ showTimer: true })}>
            Avec sablier
          </Button>
          <Button variant={!timer.showTimer ? 'principal' : 'secondaire'} aria-pressed={!timer.showTimer} onClick={() => setTimer({ showTimer: false })}>
            Sans sablier
          </Button>
        </div>
        {timer.showTimer && (
          <fieldset className="mt-5">
            <legend className="etiquette">Durée pour chaque étape</legend>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 10, 15].map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={timer.timerMinutes === m}
                  onClick={() => setTimer({ timerMinutes: m })}
                  className={`min-h-[48px] rounded-2xl border-2 font-semibold transition ${timer.timerMinutes === m ? 'border-lagon-500 bg-lagon-100' : 'border-sable-300 bg-white hover:border-lagon-300'}`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <Button className="mt-5 w-full" onClick={() => setTimerOpen(false)}>
          C’est noté
        </Button>
      </Sheet>

      {/* ------------------------------------------------ Liste des étapes */}
      <Sheet open={listOpen} onClose={() => setListOpen(false)} title="Les étapes">
        <ol className="flex flex-col gap-2">
          {scope.map((st, i) => {
            const isDone = session.completedStepIds.includes(st.id);
            const isNow = unit?.steps.some((u) => u.id === st.id);
            return (
              <li key={st.id} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${isNow ? 'bg-lagon-100' : 'bg-white'}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${isDone ? 'bg-mousse-500 text-white' : isNow ? 'bg-lagon-700 text-white' : 'bg-sable-200 text-encre-700'}`}>
                  {isDone ? <Check size={16} aria-hidden /> : i + 1}
                </span>
                <span className={`flex-1 ${isDone ? 'text-encre-500' : ''}`}>{st.title}</span>
                <span className="text-xs text-encre-500">{isDone ? 'faite' : isNow ? 'maintenant' : ''}</span>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 rounded-3xl bg-white p-4">
          <p className="text-sm font-medium text-encre-700">Mode d’aide : {AID_LABELS[session.aidLevel]}</p>
          {session.aidLevel !== 'guide' && (
            <Button
              variant="doux"
              size="petit"
              className="mt-2"
              onClick={() => {
                update((s) => setAidLevel(s, routine.id, 'guide'));
                setListOpen(false);
              }}
            >
              Revenir en mode guidé, une étape à la fois
            </Button>
          )}
        </div>
      </Sheet>
    </Screen>
  );
}
