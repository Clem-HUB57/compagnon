import { Compass, Gift, Home as HomeIcon, Lock, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Island } from '../art/Island';
import { RoutineArt } from '../art/RoutineArt';
import { MyCompanion, SpeakButton, SpeechBubble } from '../components/shared';
import { Button, IconButton, Pill, Screen, XpBar } from '../components/ui';
import { GREETINGS, pick } from '../data/messages';
import { useReducedMotion } from '../lib/hooks';
import { openSession, suggestRoutine, validStepCount } from '../logic/engine';
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
  const suggestion = suggestRoutine(data);
  const open = suggestion ? openSession(data, suggestion.id) : undefined;
  const done = open && suggestion ? validStepCount(suggestion, open) : 0;
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

      {suggestion ? (
        <section className="carte mt-4 p-5" aria-labelledby="mission-titre">
          <p className="text-sm font-medium text-lagon-700">{open ? 'Ta quête en cours' : 'Quête suggérée'}</p>
          <div className="mt-2 flex items-center gap-4">
            <RoutineArt illustration={suggestion.illustration} size={84} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <h2 id="mission-titre" className="flex-1 text-xl font-semibold leading-snug">
                  {suggestion.title}
                </h2>
                <SpeakButton text={suggestion.title} className="h-9 w-9" />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>≈ {suggestion.estimatedMinutes} min</Pill>
                <Pill>{suggestion.steps.length} étapes</Pill>
                {open && done > 0 && <Pill tone="mousse">{done} faite{done > 1 ? 's' : ''}</Pill>}
              </div>
            </div>
          </div>
          {suggestion.trigger && !open && (
            <p className="mt-3 rounded-2xl bg-sable-100 px-4 py-2 text-sm text-encre-700">
              <span className="font-semibold">Ton plan :</span> {suggestion.trigger}, alors je commence.
            </p>
          )}
          <Button size="grand" className="mt-4 w-full" icon={open ? <RotateCcw aria-hidden /> : <Play aria-hidden />} onClick={() => startMission(suggestion.id)}>
            {open ? 'Reprendre' : 'C’est parti !'}
          </Button>
        </section>
      ) : (
        <section className="carte mt-4 p-5 text-center">
          <p className="text-encre-700">Aucune routine pour l’instant. Un adulte peut en créer dans l’espace parent.</p>
        </section>
      )}

      <nav className="mt-4 grid grid-cols-2 gap-3" aria-label="Navigation">
        <Button variant="secondaire" className="whitespace-nowrap" icon={<Compass aria-hidden />} onClick={() => navigate({ name: 'aventures' })}>
          Aventures
        </Button>
        <Button variant="secondaire" className="whitespace-nowrap" icon={<HomeIcon aria-hidden />} onClick={() => navigate({ name: 'cabane' })}>
          Ma cabane
          {progression.unseen.length > 0 && <span className="h-2.5 w-2.5 rounded-full bg-corail-500" aria-label="nouveautés" />}
        </Button>
      </nav>

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
