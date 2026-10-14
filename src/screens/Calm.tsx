import { Activity, ArrowLeft, Cloud, Mail, CloudLightning, Eye, GlassWater, Hand, Pencil, Sofa, Sun, Tornado, Wind } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MyCompanion, SpeakButton, SpeechBubble } from '../components/shared';
import { Button, IconButton, Screen } from '../components/ui';
import { CALM_TOOLS, FEELING_IDEAS, getTool, SUGGESTED_TOOLS, WEATHER_MESSAGES, WEATHERS, type ToolId, type Weather } from '../data/calm';
import { useReducedMotion } from '../lib/hooks';
import { playSound } from '../lib/sound';
import { speak, stopSpeaking } from '../lib/voice';
import { completeCalmTool, getRoutine, setCalmPlan } from '../logic/engine';
import { getCosmetic } from '../data/cosmetics';
import { useApp } from '../store/useApp';

export const TOOL_ICONS: Record<ToolId, typeof Wind> = {
  respirer: Wind,
  bouger: Activity,
  presser: Hand,
  'cinq-sens': Eye,
  coin: Sofa,
  eau: GlassWater
};

const WEATHER_ICONS: Record<Weather, typeof Sun> = { soleil: Sun, nuages: Cloud, orage: CloudLightning, tempete: Tornado };
const WEATHER_COLORS: Record<Weather, string> = {
  soleil: 'bg-[#FFF4D6] text-[#9A6B00]',
  nuages: 'bg-ciel-100 text-[#3C5A8A]',
  orage: 'bg-[#EFE8FB] text-[#5E4699]',
  tempete: 'bg-corail-100 text-corail-700'
};

// ------------------------------------------------------------------ Respiration guidée

/** Respiration lente (environ 6 respirations par minute : 5 s pour inspirer, 5 s pour souffler). */
export function Breathing({ onDone }: { onDone: () => void }) {
  const [minutes, setMinutes] = useState<number | null>(null);
  if (minutes === null) {
    return (
      <div className="flex flex-col items-center text-center">
        <MyCompanion size={130} expression="calme" />
        <p className="mt-3 text-lg">Respire avec ton compagnon : quand il gonfle, tu inspires par le nez. Quand il se dégonfle, tu souffles doucement par la bouche.</p>
        <p className="mt-4 text-sm font-medium text-encre-700">Combien de temps ?</p>
        <div className="mt-2 grid w-full grid-cols-3 gap-2">
          {[1, 2, 3].map((m) => (
            <Button key={m} variant={m === 1 ? 'principal' : 'secondaire'} onClick={() => setMinutes(m)}>
              {m} min
            </Button>
          ))}
        </div>
      </div>
    );
  }
  return <BreathingRun minutes={minutes} onDone={onDone} />;
}

function BreathingRun({ minutes, onDone }: { minutes: number; onDone: () => void }) {
  const reduced = useReducedMotion();
  const voice = useApp((s) => s.data.preferences.voiceEnabled && s.data.preferences.autoRead);
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(start);
  const total = minutes * 60_000;
  const elapsed = now - start;
  const cycle = 10_000;
  const inCycle = elapsed % cycle;
  const inhale = inCycle < cycle / 2;
  const phase = (inCycle % (cycle / 2)) / (cycle / 2);
  const amount = inhale ? phase : 1 - phase; // 0 = vide, 1 = plein
  const breaths = Math.floor(elapsed / cycle);
  const finished = elapsed >= total;
  const lastPhase = useRef<boolean | null>(null);

  useEffect(() => {
    if (finished) return;
    const t = window.setInterval(() => setNow(Date.now()), 80);
    return () => window.clearInterval(t);
  }, [finished]);

  useEffect(() => {
    if (finished || lastPhase.current === inhale) return;
    lastPhase.current = inhale;
    if (voice) speak(inhale ? 'Inspire' : 'Souffle');
  }, [inhale, finished, voice]);

  useEffect(() => () => stopSpeaking(), []);

  if (finished) {
    return (
      <div className="flex flex-col items-center text-center">
        <MyCompanion size={150} expression="calme" />
        <p className="mt-3 text-xl font-semibold">Bravo, tu as respiré {breaths} fois avec moi.</p>
        <Button size="grand" className="mt-6 w-full" onClick={onDone}>
          J’ai fini
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center" aria-live="polite">
      <div className="relative flex h-64 w-64 items-center justify-center">
        {reduced ? (
          <div className="flex h-56 w-20 items-end overflow-hidden rounded-full bg-lagon-100" aria-hidden>
            <div className="w-full rounded-full bg-lagon-300" style={{ height: `${15 + amount * 85}%` }} />
          </div>
        ) : (
          <>
            <div className="absolute rounded-full bg-lagon-100" style={{ width: `${55 + amount * 45}%`, height: `${55 + amount * 45}%` }} aria-hidden />
            <div style={{ transform: `scale(${0.8 + amount * 0.3})` }}>
              <MyCompanion size={130} expression="calme" />
            </div>
          </>
        )}
      </div>
      <p className="mt-2 text-3xl font-semibold text-lagon-900">{inhale ? 'Inspire…' : 'Souffle…'}</p>
      <p className="mt-1 text-encre-700">{inhale ? 'par le nez, doucement' : 'par la bouche, tout doucement'}</p>
      <div className="mt-5 h-2 w-48 overflow-hidden rounded-full bg-sable-300" aria-hidden>
        <div className="h-full rounded-full bg-lagon-500" style={{ width: `${Math.min(100, (elapsed / total) * 100)}%` }} />
      </div>
      <Button variant="fantome" className="mt-4" onClick={onDone}>
        J’ai fini plus tôt
      </Button>
    </div>
  );
}

// ------------------------------------------------------------------ Outils en étapes

function StepsTool({ tool, onDone }: { tool: ToolId; onDone: () => void }) {
  const t = getTool(tool);
  const [i, setI] = useState(0);
  const last = i === t.steps.length - 1;
  return (
    <div className="flex flex-col items-center text-center">
      <MyCompanion size={120} expression="calme" />
      <p className="mt-2 text-sm font-medium text-lagon-700">
        {i + 1} sur {t.steps.length}
      </p>
      <div className="mt-2 flex items-start gap-2">
        <p className="text-2xl font-semibold leading-snug" key={i}>
          {t.steps[i]}
        </p>
        <SpeakButton text={t.steps[i]} />
      </div>
      <Button size="grand" className="mt-8 w-full" onClick={() => (last ? onDone() : setI(i + 1))}>
        {last ? 'J’ai fini' : 'C’est fait'}
      </Button>
    </div>
  );
}

/** Lance un outil du coin calme. Utilisable aussi depuis une étape de mission. */
export function CalmToolRunner({ tool, onDone }: { tool: ToolId; onDone: () => void }) {
  return tool === 'respirer' ? <Breathing onDone={onDone} /> : <StepsTool tool={tool} onDone={onDone} />;
}

// ------------------------------------------------------------------ Plan tempête

export function CalmPlanEditor({ onSaved }: { onSaved: () => void }) {
  const plan = useApp((s) => s.data.calm.plan);
  const update = useApp((s) => s.update);
  const [feeling, setFeeling] = useState(plan?.feeling ?? '');
  const [tool, setTool] = useState<ToolId>(plan?.tool ?? 'respirer');
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        update((s) => setCalmPlan(s, feeling, tool));
        onSaved();
      }}
    >
      <p className="text-encre-700">On prépare ton plan quand tout va bien. Comme ça, le jour où c’est difficile, tu sais déjà quoi faire.</p>
      <fieldset>
        <legend className="mb-2 font-semibold">Quand…</legend>
        <div className="flex flex-col gap-2">
          {FEELING_IDEAS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={feeling === f}
              onClick={() => setFeeling(f)}
              className={`min-h-[48px] rounded-2xl border-2 px-4 text-left font-medium transition ${feeling === f ? 'border-lagon-500 bg-lagon-100' : 'border-sable-300 bg-white hover:border-lagon-300'}`}
            >
              … {f}
            </button>
          ))}
        </div>
        <label htmlFor="ressenti-perso" className="etiquette mt-3">
          Ou avec tes mots
        </label>
        <input id="ressenti-perso" className="champ" maxLength={80} placeholder="je sens…" value={FEELING_IDEAS.includes(feeling) ? '' : feeling} onChange={(e) => setFeeling(e.target.value)} />
      </fieldset>
      <fieldset>
        <legend className="mb-2 font-semibold">… alors je…</legend>
        <div className="grid grid-cols-2 gap-2">
          {CALM_TOOLS.map((t) => {
            const Icon = TOOL_ICONS[t.id];
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={tool === t.id}
                onClick={() => setTool(t.id)}
                className={`flex min-h-[56px] items-center gap-2 rounded-2xl border-2 px-3 text-left text-sm font-medium transition ${tool === t.id ? 'border-lagon-500 bg-lagon-100' : 'border-sable-300 bg-white hover:border-lagon-300'}`}
              >
                <Icon size={20} className="shrink-0 text-lagon-700" aria-hidden />
                {t.name}
              </button>
            );
          })}
        </div>
      </fieldset>
      <Button type="submit" size="grand" disabled={!feeling.trim()}>
        Enregistrer mon plan
      </Button>
    </form>
  );
}

// ------------------------------------------------------------------ Écran principal

type Stage = 'meteo' | 'outils' | 'outil' | 'fin' | 'plan';

export function Calm({ returnTo }: { returnTo?: string }) {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const navigate = useApp((s) => s.navigate);
  const startMission = useApp((s) => s.startMission);
  const [stage, setStage] = useState<Stage>('meteo');
  const [weather, setWeather] = useState<Weather | null>(null);
  const [tool, setTool] = useState<ToolId | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [xp, setXp] = useState(0);
  const [found, setFound] = useState<string | null>(null);
  const plan = data.calm.plan;
  const returnSession = returnTo ? data.sessions.find((x) => x.id === returnTo) : undefined;
  const returnRoutine = returnSession ? getRoutine(data, returnSession.routineId) : undefined;
  const suggested = useMemo(() => {
    const base = SUGGESTED_TOOLS[weather ?? 'aucune'];
    return plan && !base.includes(plan.tool) ? [plan.tool, ...base.slice(0, 2)] : base;
  }, [weather, plan]);
  const others = CALM_TOOLS.filter((t) => !suggested.includes(t.id));

  const choose = (t: ToolId) => {
    setTool(t);
    setStage('outil');
  };

  const finishTool = () => {
    if (!tool) return;
    const r = completeCalmTool(data, tool);
    update(() => r.state);
    setXp(r.events.xpGained);
    setFound(r.events.findings[0]?.cosmeticId ?? null);
    playSound(r.events.findings.length ? 'trouvaille' : 'etape', data.preferences.soundEnabled);
    setStage('fin');
  };

  const back = () => {
    if (stage === 'outil' || stage === 'plan') setStage('outils');
    else if (stage === 'outils') setStage('meteo');
    else navigate({ name: 'accueil' });
  };

  return (
    <Screen>
      <header className="flex items-center gap-2">
        <IconButton label="Retour" onClick={back}>
          <ArrowLeft aria-hidden />
        </IconButton>
        <h1 className="titre">Mon coin calme</h1>
      </header>

      {stage === 'meteo' && (
        <div className="mt-4 flex flex-1 animate-apparait flex-col">
          <div className="flex items-end gap-2">
            <MyCompanion size={100} expression="calme" />
            <SpeechBubble className="mb-6 flex-1">Quel temps fait-il dans ta tête ? Tu peux aussi passer.</SpeechBubble>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Ma météo intérieure">
            {WEATHERS.map((w) => {
              const Icon = WEATHER_ICONS[w.id];
              return (
                <button
                  key={w.id}
                  type="button"
                  role="radio"
                  aria-checked={weather === w.id}
                  onClick={() => {
                    setWeather(w.id);
                    setStage('outils');
                  }}
                  className={`flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-4xl p-3 text-center shadow-carte transition hover:scale-[1.02] ${WEATHER_COLORS[w.id]}`}
                >
                  <Icon size={40} aria-hidden />
                  <span className="text-lg font-semibold">{w.label}</span>
                  <span className="text-sm opacity-90">{w.hint}</span>
                </button>
              );
            })}
          </div>
          <Button variant="fantome" className="mt-4" onClick={() => setStage('outils')}>
            Passer
          </Button>
          <p className="mt-auto pt-6 text-center text-xs text-encre-500">Ta météo n’est pas enregistrée. Elle sert juste à te proposer des idées.</p>
        </div>
      )}

      {stage === 'outils' && (
        <div className="mt-4 flex animate-apparait flex-col gap-4">
          {weather && <p className="rounded-3xl bg-white px-4 py-3 text-encre-700 shadow-carte">{WEATHER_MESSAGES[weather]}</p>}
          {plan && (
            <button
              type="button"
              onClick={() => choose(plan.tool)}
              className="flex items-center gap-3 rounded-3xl border-2 border-lagon-300 bg-lagon-100 px-4 py-3 text-left transition hover:border-lagon-500"
            >
              <span className="flex-1">
                <span className="block text-sm font-medium text-lagon-700">Mon plan</span>
                Quand {plan.feeling}, alors je choisis : <strong>{getTool(plan.tool).short.toLowerCase()}</strong>.
              </span>
            </button>
          )}
          <section>
            <h2 className="mb-2 font-semibold">Qu’est-ce qui pourrait t’aider ?</h2>
            <div className="flex flex-col gap-2">
              {suggested.map((id, i) => {
                const t = getTool(id);
                const Icon = TOOL_ICONS[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choose(id)}
                    className={`flex items-center gap-4 rounded-3xl bg-white px-4 text-left font-semibold shadow-carte transition hover:bg-lagon-100 ${i === 0 ? 'min-h-[80px] text-lg' : 'min-h-[64px]'}`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lagon-100 text-lagon-900">
                      <Icon aria-hidden />
                    </span>
                    {t.name}
                  </button>
                );
              })}
            </div>
            {!showAll ? (
              <Button variant="fantome" size="petit" className="mt-2" onClick={() => setShowAll(true)}>
                Voir les autres outils
              </Button>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {others.map((t) => {
                  const Icon = TOOL_ICONS[t.id];
                  return (
                    <button key={t.id} type="button" onClick={() => choose(t.id)} className="flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-3xl bg-white p-2 text-sm font-medium shadow-carte hover:bg-lagon-100">
                      <Icon className="text-lagon-700" aria-hidden />
                      {t.short}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
          <Button variant="doux" icon={<Pencil size={18} aria-hidden />} onClick={() => setStage('plan')}>
            {plan ? 'Changer mon plan tempête' : 'Préparer mon plan tempête'}
          </Button>
        </div>
      )}

      {stage === 'outil' && tool && (
        <div className="mt-6 flex flex-1 animate-apparait flex-col">
          <CalmToolRunner tool={tool} onDone={finishTool} />
        </div>
      )}

      {stage === 'plan' && (
        <div className="mt-4 animate-apparait">
          <CalmPlanEditor onSaved={() => setStage('outils')} />
        </div>
      )}

      {stage === 'fin' && (
        <div className="mt-8 flex flex-1 animate-apparait flex-col items-center text-center">
          <MyCompanion size={160} expression="joie" breathe />
          <h2 className="mt-3 text-2xl font-semibold">Tu as pris soin de toi.</h2>
          <p className="mt-1 text-encre-700">Savoir se calmer, ça s’apprend, et tu t’entraînes.</p>
          {xp > 0 && <p className="mt-3 rounded-full bg-mousse-100 px-4 py-1.5 font-semibold text-mousse-700">+{xp} XP d’entraînement</p>}
          {found && (
            <p className="mt-3 flex items-center gap-2 rounded-3xl bg-ciel-100 px-4 py-2 text-sm">
              <Mail size={16} aria-hidden /> Une bouteille est arrivée sur ta plage : <strong>{getCosmetic(found)?.name}</strong>
            </p>
          )}
          <div className="mt-auto flex w-full flex-col gap-3 pt-8">
            {returnRoutine && (
              <Button size="grand" onClick={() => startMission(returnRoutine.id)}>
                Revenir à ma quête
              </Button>
            )}
            <Button variant={returnRoutine ? 'secondaire' : 'principal'} size={returnRoutine ? 'normal' : 'grand'} onClick={() => navigate({ name: 'accueil' }, true)}>
              Revenir à mon île
            </Button>
            <Button variant="fantome" onClick={() => setStage('outils')}>
              Essayer un autre outil
            </Button>
          </div>
        </div>
      )}
    </Screen>
  );
}
