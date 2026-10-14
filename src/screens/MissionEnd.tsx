import { Award, Check, Coffee, Compass, Gift, Home, Mail, TrendingDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Companion } from '../art/Companion';
import { CosmeticThumb } from '../art/Accessories';
import { Island } from '../art/Island';
import { MyCompanion } from '../components/shared';
import { Sparkles } from '../components/Sparkles';
import { Button, Screen } from '../components/ui';
import { FINDING_REASONS, getCosmetic } from '../data/cosmetics';
import { END_AFTER_PAUSE_MESSAGES, END_MESSAGES, pick } from '../data/messages';
import { useReducedMotion } from '../lib/hooks';
import { playSound } from '../lib/sound';
import { chooseReward, getRoutine, respondToOffer, routineStats, setMood, sortedSteps } from '../logic/engine';
import { WORLD_STAGE_NAMES } from '../logic/progression';
import { useApp } from '../store/useApp';
import type { Mood } from '../types';

const OFFER_TEXT = {
  condense: { title: 'Tu connais bien cette routine !', body: 'Tu veux essayer le mode condensé ? Les étapes seront regroupées en 2 ou 3 blocs.' },
  autonome: { title: 'Envie d’essayer le mode autonome ?', body: 'Une seule validation quand tout est fait. Tu gagnes un écusson la première fois.' },
  guide: { title: '', body: '' }
};

export function MissionEnd({ sessionId }: { sessionId: string }) {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const navigate = useApp((s) => s.navigate);
  const mission = useApp((s) => s.mission);
  const reduced = useReducedMotion();
  const session = data.sessions.find((x) => x.id === sessionId);
  const routine = session ? getRoutine(data, session.routineId) : undefined;
  const p = data.progression;
  const ctx = mission?.sessionId === sessionId ? mission : null;
  const levelUp = ctx && p.level > ctx.levelAtStart;
  const stageUp = ctx && p.worldStage > ctx.stageAtStart;
  const message = useMemo(() => pick(session && session.pauses > 0 ? END_AFTER_PAUSE_MESSAGES : END_MESSAGES), [session]);
  const [resting, setResting] = useState(false);
  const [offerAnswered, setOfferAnswered] = useState(false);
  const [burst] = useState(() => Date.now());

  useEffect(() => {
    if (levelUp) window.setTimeout(() => playSound('niveau', data.preferences.soundEnabled), 400);
    else if (ctx?.findings.length) window.setTimeout(() => playSound('trouvaille', data.preferences.soundEnabled), 400);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session || !routine) {
    return (
      <Screen className="items-center justify-center text-center">
        <p className="text-lg">Cette quête n’est plus disponible.</p>
        <Button className="mt-6" onClick={() => navigate({ name: 'accueil' }, true)}>
          Revenir à mon île
        </Button>
      </Screen>
    );
  }

  const stats = routineStats(data, routine.id);
  const offer = !offerAnswered ? stats.pendingOffer : null;
  const choice = p.pendingChoices[0];
  const doneSteps = sortedSteps(routine).filter((st) => session.completedStepIds.includes(st.id));

  if (resting) {
    return (
      <Screen className="items-center text-center">
        <div className="mt-16">
          <MyCompanion size={180} expression="calme" breathe />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Bonne pause !</h1>
        <p className="mt-2 text-lg text-encre-700">Ton île t’attend tranquillement. Reviens quand tu veux.</p>
        <Button size="grand" className="mt-auto w-full" icon={<Home aria-hidden />} onClick={() => navigate({ name: 'accueil' }, true)}>
          Revenir à mon île
        </Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <section className="flex flex-col items-center pt-4 text-center" aria-live="polite">
        <div className="relative">
          <MyCompanion size={150} expression="bravo" bounceKey={reduced ? undefined : burst} />
          <Sparkles burstKey={burst} />
        </div>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{message}</h1>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-mousse-100 px-4 py-1.5 font-semibold text-mousse-700">+{session.xpEarned} XP gagnés</p>
      </section>

      <section className="carte mt-5 p-5" aria-label="Étapes réalisées">
        <h2 className="text-sm font-medium text-encre-700">{routine.title}</h2>
        <ul className="mt-2 flex flex-col gap-1.5">
          {doneSteps.map((st) => (
            <li key={st.id} className="flex items-center gap-2 text-base">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mousse-500 text-white">
                <Check size={14} aria-hidden />
              </span>
              {st.title}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-encre-700">Tu as fait cette routine {stats.completions} fois en tout.</p>
      </section>

      <section className="carte mt-4 overflow-hidden" aria-label="Ton île">
        <Island
          stage={p.worldStage}
          ambiance={p.equipped.ambiance}
          decor={p.equipped.decor}
          animate={!reduced}
          highlight={stageUp ? `stage-${p.worldStage}` : null}
          className="block w-full"
        />
        <div className="p-4 text-center">
          {levelUp ? (
            <>
              <p className="text-xl font-semibold text-lagon-900">Niveau {p.level} !</p>
              {stageUp && <p className="text-encre-700">Ton île change : {WORLD_STAGE_NAMES[p.worldStage].toLowerCase()}.</p>}
            </>
          ) : (
            <p className="text-encre-700">Ton île grandit avec chaque quête.</p>
          )}
        </div>
      </section>

      {ctx?.findings.map((f) => {
        const c = getCosmetic(f.cosmeticId);
        if (!c) return null;
        return (
          <section key={f.cosmeticId} className="carte mt-4 flex animate-apparait items-center gap-4 p-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-ciel-100">
              {c.kind === 'accessoire' && data.profile ? (
                <Companion id={data.profile.companionId} accessory={c.id} color={p.equipped.color} size={64} />
              ) : (
                <CosmeticThumb id={c.id} kind={c.kind} />
              )}
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-lagon-700">
                <Mail size={16} aria-hidden /> Une bouteille est arrivée sur la plage
              </p>
              <p className="text-lg font-semibold">{c.name}</p>
              <p className="text-sm text-encre-700">{FINDING_REASONS[f.reason]}</p>
            </div>
          </section>
        );
      })}

      {ctx?.badge && (
        <section className="carte mt-4 flex animate-apparait items-center gap-4 bg-corail-100 p-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-corail-500 text-white">
            <Award aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-corail-700">Nouvel écusson dans ton carnet</p>
            <p className="text-lg font-semibold">{ctx.badge.title}</p>
            <p className="text-sm text-encre-700">Tu as moins besoin d’aide : c’est le plus beau des progrès.</p>
          </div>
        </section>
      )}

      {choice && (
        <section className="carte mt-4 p-5">
          <p className="flex items-center gap-2 font-semibold">
            <Gift className="text-corail-500" aria-hidden /> Choisis ton cadeau du niveau {choice.level}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {choice.options.map((id) => {
              const c = getCosmetic(id)!;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    update((s) => chooseReward(s, choice.id, id));
                    playSound('trouvaille', data.preferences.soundEnabled);
                  }}
                  className="flex flex-col items-center gap-1 rounded-3xl border-2 border-sable-300 bg-sable-50 p-2 text-center text-sm font-medium transition hover:border-lagon-500"
                >
                  <span className="flex h-16 items-center justify-center">
                    {c.kind === 'accessoire' && data.profile ? (
                      <Companion id={data.profile.companionId} accessory={c.id} color={p.equipped.color} size={64} />
                    ) : c.kind === 'couleur' && data.profile ? (
                      <Companion id={data.profile.companionId} color={c.id} accessory={p.equipped.accessory} size={64} />
                    ) : (
                      <CosmeticThumb id={c.id} kind={c.kind} />
                    )}
                  </span>
                  {c.name}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs text-encre-500">Tu peux aussi choisir plus tard, dans ta cabane.</p>
        </section>
      )}

      {offer && offer !== 'guide' && (
        <section className="carte mt-4 p-5">
          <p className="flex items-center gap-2 font-semibold">
            <TrendingDown className="text-lagon-700" aria-hidden /> {OFFER_TEXT[offer].title}
          </p>
          <p className="mt-1 text-encre-700">{OFFER_TEXT[offer].body}</p>
          <p className="mt-1 text-sm text-encre-500">Tu pourras revenir en mode guidé quand tu veux.</p>
          <div className="mt-3 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                update((s) => respondToOffer(s, routine.id, true));
                setOfferAnswered(true);
              }}
            >
              J’essaie
            </Button>
            <Button
              variant="doux"
              className="flex-1"
              onClick={() => {
                update((s) => respondToOffer(s, routine.id, false));
                setOfferAnswered(true);
              }}
            >
              Pas maintenant
            </Button>
          </div>
        </section>
      )}

      <section className="mt-5 text-center" aria-label="Ton ressenti (facultatif)">
        <p className="text-sm text-encre-700">Si tu veux : c’était comment ?</p>
        <div className="mt-2 flex justify-center gap-2">
          {(['facile', 'moyen', 'difficile'] as Mood[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={session.mood === m}
              onClick={() => update((s) => setMood(s, session.id, m))}
              className={`min-h-[44px] rounded-2xl px-4 text-sm font-semibold capitalize transition ${session.mood === m ? 'bg-lagon-700 text-white' : 'bg-white text-encre-700 shadow-carte hover:bg-lagon-100'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3">
        <Button size="grand" icon={<Compass aria-hidden />} onClick={() => navigate({ name: 'aventures' }, true)}>
          Continuer l’aventure
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondaire" className="whitespace-nowrap" icon={<Coffee aria-hidden />} onClick={() => setResting(true)}>
            Une pause
          </Button>
          <Button variant="secondaire" icon={<Home aria-hidden />} onClick={() => navigate({ name: 'accueil' }, true)}>
            Mon île
          </Button>
        </div>
      </div>
    </Screen>
  );
}
