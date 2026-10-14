// Logique métier pure : chaque fonction reçoit l'état et renvoie un nouvel état.
// Aucune dépendance à React ou au stockage, ce qui la rend facile à tester.

import { COSMETICS, FINDING_MILESTONES, STARTING_COSMETICS } from '../data/cosmetics';
import { DEMO_ROUTINES } from '../data/routines';
import type {
  ActionEvents,
  AidLevel,
  AppState,
  Badge,
  CompanionId,
  FindingEvent,
  Mood,
  Progression,
  Routine,
  RoutineStats,
  Session,
  Step
} from '../types';
import { COMPLETION_BONUS, clampXp, levelForXp, worldStageForLevel } from './progression';

export const SCHEMA_VERSION = 1;
/** Nombre de réussites à un niveau d'aide avant de proposer le niveau suivant. */
export const FADING_THRESHOLD = 3;

let idCounter = 0;
export function makeId(prefix: string): string {
  idCounter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${rand}${idCounter}`;
}

const clone = <T,>(v: T): T => structuredClone(v);

export function emptyEvents(): ActionEvents {
  return { xpGained: 0, levelUp: null, worldStageChanged: null, sessionCompleted: false, findings: [], badge: null, offer: null };
}

export function initialProgression(): Progression {
  return {
    totalXp: 0,
    level: 1,
    unlockedCosmetics: [...STARTING_COSMETICS],
    worldStage: 0,
    equipped: { color: 'couleur-origine', accessory: null, ambiance: 'ambiance-jour', decor: [] },
    pendingChoices: [],
    routineStats: {},
    eventCounts: { reprise: 0, aide: 0, decouverte: 0, autonomie: 0 },
    badges: [],
    rewardedMilestones: [],
    unseen: []
  };
}

export function createInitialState(now = new Date()): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: null,
    routines: clone(DEMO_ROUTINES),
    sessions: [],
    progression: initialProgression(),
    preferences: {
      soundEnabled: true,
      reducedMotion: 'systeme',
      voiceEnabled: true,
      autoRead: false,
      displayPreferences: { textSize: 'normal' }
    },
    createdAt: now.toISOString()
  };
}

// ---------------------------------------------------------------- Profil

export function setProfile(state: AppState, childName: string, companionId: CompanionId, companionName: string, now = new Date()): AppState {
  const s = clone(state);
  s.profile = {
    childName: childName.trim().slice(0, 30),
    companionId,
    companionName: companionName.trim().slice(0, 20) || 'Compagnon',
    createdAt: s.profile?.createdAt ?? now.toISOString()
  };
  return s;
}

// ---------------------------------------------------------------- Routines

export function getRoutine(state: AppState, routineId: string): Routine | undefined {
  return state.routines.find((r) => r.id === routineId);
}

export function sortedSteps(routine: Routine): Step[] {
  return [...routine.steps].sort((a, b) => a.order - b.order);
}

export function routineStats(state: AppState, routineId: string): RoutineStats {
  return (
    state.progression.routineStats[routineId] ?? {
      completions: 0,
      aidLevel: 'guide',
      completionsAtLevel: 0,
      declinedAt: null,
      pendingOffer: null,
      lastCompletedAt: null
    }
  );
}

/** Session ouverte (en cours ou en pause) pour une routine, s'il y en a une. */
export function openSession(state: AppState, routineId: string): Session | undefined {
  return state.sessions.find((x) => x.routineId === routineId && (x.status === 'en_cours' || x.status === 'en_pause'));
}

/** Étapes de la routine pas encore validées dans cette session, dans l'ordre. */
export function remainingSteps(routine: Routine, session: Session): Step[] {
  return sortedSteps(routine).filter((st) => !session.completedStepIds.includes(st.id));
}

export function validStepCount(routine: Routine, session: Session): number {
  const ids = new Set(routine.steps.map((x) => x.id));
  return session.completedStepIds.filter((id) => ids.has(id)).length;
}

// ---------------------------------------------------------------- Sessions

/** Lance une routine, ou reprend la session ouverte sans perdre les étapes déjà faites. */
export function startOrResume(state: AppState, routineId: string, now = new Date()): { state: AppState; sessionId: string; resumed: boolean } {
  const routine = getRoutine(state, routineId);
  if (!routine) throw new Error(`Routine introuvable : ${routineId}`);
  const existing = openSession(state, routineId);
  if (existing) {
    const s = clone(state);
    const sess = s.sessions.find((x) => x.id === existing.id)!;
    const wasPaused = sess.status === 'en_pause';
    sess.status = 'en_cours';
    if (wasPaused) s.progression.eventCounts.reprise += 1;
    return { state: s, sessionId: sess.id, resumed: true };
  }
  const s = clone(state);
  const session: Session = {
    id: makeId('session'),
    routineId,
    routineTitle: routine.title,
    startedAt: now.toISOString(),
    completedAt: null,
    completedStepIds: [],
    status: 'en_cours',
    aidLevel: routineStats(s, routineId).aidLevel,
    xpEarned: 0,
    helpUsed: 0,
    pauses: 0,
    bonusAwarded: false,
    totalSteps: routine.steps.length
  };
  s.sessions.push(session);
  return { state: s, sessionId: session.id, resumed: false };
}

/** Met de côté une session ouverte pour repartir de zéro (les XP gagnés restent acquis). */
export function restartRoutine(state: AppState, routineId: string, now = new Date()): { state: AppState; sessionId: string } {
  const s = clone(state);
  for (const sess of s.sessions) {
    if (sess.routineId === routineId && (sess.status === 'en_cours' || sess.status === 'en_pause')) {
      sess.status = 'mise_de_cote';
    }
  }
  const r = startOrResume(s, routineId, now);
  return { state: r.state, sessionId: r.sessionId };
}

export function pauseSession(state: AppState, sessionId: string): AppState {
  const s = clone(state);
  const sess = s.sessions.find((x) => x.id === sessionId);
  if (sess && sess.status === 'en_cours') {
    sess.status = 'en_pause';
    sess.pauses += 1;
  }
  return s;
}

export function resumeSession(state: AppState, sessionId: string): AppState {
  const s = clone(state);
  const sess = s.sessions.find((x) => x.id === sessionId);
  if (sess && sess.status === 'en_pause') {
    sess.status = 'en_cours';
    s.progression.eventCounts.reprise += 1;
  }
  return s;
}

export function recordHelp(state: AppState, sessionId: string): AppState {
  const s = clone(state);
  const sess = s.sessions.find((x) => x.id === sessionId);
  if (sess) sess.helpUsed += 1;
  return s;
}

export function setMood(state: AppState, sessionId: string, mood: Mood): AppState {
  const s = clone(state);
  const sess = s.sessions.find((x) => x.id === sessionId);
  if (sess) sess.mood = mood;
  return s;
}

/**
 * Valide une ou plusieurs étapes. Une étape ne rapporte des XP qu'une seule fois par
 * session : un double clic ou un rejeu ne donne rien de plus.
 */
export function completeSteps(state: AppState, sessionId: string, stepIds: string[], now = new Date()): { state: AppState; events: ActionEvents } {
  const events = emptyEvents();
  const original = state.sessions.find((x) => x.id === sessionId);
  if (!original || original.status === 'terminee' || original.status === 'mise_de_cote') return { state, events };
  const routine = getRoutine(state, original.routineId);
  if (!routine) return { state, events };

  const s = clone(state);
  const sess = s.sessions.find((x) => x.id === sessionId)!;
  sess.status = 'en_cours';
  let gained = 0;
  for (const id of stepIds) {
    const step = routine.steps.find((st) => st.id === id);
    if (!step || sess.completedStepIds.includes(id)) continue;
    sess.completedStepIds.push(id);
    gained += clampXp(step.xpReward);
  }

  const allDone = routine.steps.every((st) => sess.completedStepIds.includes(st.id));
  if (allDone && !sess.bonusAwarded) {
    sess.bonusAwarded = true;
    gained += COMPLETION_BONUS;
  }
  sess.xpEarned += gained;
  events.xpGained = gained;
  const withXp = addXp(s, gained, events);

  if (allDone) return finishSession(withXp, sessionId, now, events);
  return { state: withXp, events };
}

export function completeStep(state: AppState, sessionId: string, stepId: string, now = new Date()) {
  return completeSteps(state, sessionId, [stepId], now);
}

function addXp(s: AppState, gained: number, events: ActionEvents): AppState {
  if (gained <= 0) return s;
  const p = s.progression;
  const before = p.level;
  const stageBefore = p.worldStage;
  p.totalXp += gained;
  p.level = levelForXp(p.totalXp);
  p.worldStage = worldStageForLevel(p.level);
  if (p.level > before) {
    events.levelUp = { from: before, to: p.level };
    for (let lvl = before + 1; lvl <= p.level; lvl++) {
      const options = pickLevelOptions(p, lvl);
      if (options.length > 0) p.pendingChoices.push({ id: makeId('choix'), level: lvl, options });
    }
  }
  if (p.worldStage !== stageBefore) events.worldStageChanged = { from: stageBefore, to: p.worldStage };
  return s;
}

/** Choisit jusqu'à 3 objets à proposer pour un niveau : déterministe, jamais aléatoire. */
export function pickLevelOptions(p: Progression, level: number): string[] {
  const alreadyOffered = new Set(p.pendingChoices.flatMap((c) => c.options));
  const owned = new Set(p.unlockedCosmetics);
  const pool = COSMETICS.filter((c) => c.source === 'niveau' && c.minLevel <= level && !owned.has(c.id) && !alreadyOffered.has(c.id));
  // Priorité aux objets du niveau atteint, puis aux plus anciens non choisis.
  pool.sort((a, b) => (b.minLevel === level ? 1 : 0) - (a.minLevel === level ? 1 : 0) || a.minLevel - b.minLevel);
  // Varier les types : un objet de chaque sorte si possible.
  const result: string[] = [];
  const kinds = new Set<string>();
  for (const c of pool) {
    if (result.length >= 3) break;
    if (!kinds.has(c.kind)) {
      result.push(c.id);
      kinds.add(c.kind);
    }
  }
  for (const c of pool) {
    if (result.length >= 3) break;
    if (!result.includes(c.id)) result.push(c.id);
  }
  return result;
}

function finishSession(state: AppState, sessionId: string, now: Date, events: ActionEvents): { state: AppState; events: ActionEvents } {
  const s = state; // déjà cloné par l'appelant
  const sess = s.sessions.find((x) => x.id === sessionId)!;
  sess.status = 'terminee';
  sess.completedAt = now.toISOString();
  events.sessionCompleted = true;

  const p = s.progression;
  const prev = routineStats(s, sess.routineId);
  const stats: RoutineStats = { ...prev };
  stats.completions += 1;
  stats.completionsAtLevel += 1;
  stats.lastCompletedAt = sess.completedAt;
  p.routineStats[sess.routineId] = stats;

  // Événements qui déclenchent les trouvailles
  const triggered: FindingEvent[] = [];
  if (stats.completions === 1) triggered.push('decouverte');
  if (sess.helpUsed > 0) triggered.push('aide');
  if (sess.aidLevel === 'autonome' && !p.badges.some((b) => b.routineId === sess.routineId)) triggered.push('autonomie');
  for (const ev of triggered) p.eventCounts[ev] += 1;

  // L'événement « reprise » est compté au moment de la reprise ; on vérifie ses paliers ici.
  const toCheck: FindingEvent[] = [...triggered];
  if (sess.pauses > 0) toCheck.push('reprise');
  for (const ev of toCheck) {
    // Au plus une trouvaille par type d'événement et par session.
    const milestone = FINDING_MILESTONES.find((m) => m <= p.eventCounts[ev] && !p.rewardedMilestones.includes(`${ev}:${m}`));
    if (milestone === undefined) continue;
    const item = nextFinding(p);
    if (!item) break;
    p.unlockedCosmetics.push(item);
    p.unseen.push(item);
    p.rewardedMilestones.push(`${ev}:${milestone}`);
    events.findings.push({ cosmeticId: item, reason: ev });
    break; // une seule trouvaille par session : la récompense garde son sens
  }

  // Écusson quand une routine est faite pour la première fois en autonomie
  if (sess.aidLevel === 'autonome' && !p.badges.some((b) => b.routineId === sess.routineId)) {
    const routine = getRoutine(s, sess.routineId);
    const badge: Badge = {
      id: makeId('ecusson'),
      routineId: sess.routineId,
      title: `Autonome : ${routine?.title ?? sess.routineTitle}`,
      earnedAt: now.toISOString()
    };
    p.badges.push(badge);
    events.badge = badge;
  }

  // Estompage : proposer moins d'aide après plusieurs réussites (jamais imposé)
  const next = nextAidLevel(stats.aidLevel);
  const declinedOk = stats.declinedAt === null || stats.completions >= stats.declinedAt + FADING_THRESHOLD;
  if (next && stats.completionsAtLevel >= FADING_THRESHOLD && declinedOk) {
    stats.pendingOffer = next;
    events.offer = next;
  }
  return { state: s, events };
}

export function nextFinding(p: Progression): string | null {
  const owned = new Set(p.unlockedCosmetics);
  const item = COSMETICS.find((c) => c.source === 'trouvaille' && !owned.has(c.id));
  return item ? item.id : null;
}

export function nextAidLevel(level: AidLevel): AidLevel | null {
  if (level === 'guide') return 'condense';
  if (level === 'condense') return 'autonome';
  return null;
}

/** Réponse de l'enfant à une proposition de passage au niveau d'aide suivant. */
export function respondToOffer(state: AppState, routineId: string, accept: boolean): AppState {
  const s = clone(state);
  const stats = { ...routineStats(s, routineId) };
  if (!stats.pendingOffer) return s;
  if (accept) {
    stats.aidLevel = stats.pendingOffer;
    stats.completionsAtLevel = 0;
    stats.declinedAt = null;
  } else {
    stats.declinedAt = stats.completions;
  }
  stats.pendingOffer = null;
  s.progression.routineStats[routineId] = stats;
  return s;
}

/** L'enfant (ou le parent) peut toujours changer de niveau d'aide, sans rien perdre. */
export function setAidLevel(state: AppState, routineId: string, level: AidLevel): AppState {
  const s = clone(state);
  const stats = { ...routineStats(s, routineId) };
  if (stats.aidLevel !== level) {
    stats.aidLevel = level;
    stats.completionsAtLevel = 0;
    stats.pendingOffer = null;
  }
  s.progression.routineStats[routineId] = stats;
  const open = s.sessions.find((x) => x.routineId === routineId && (x.status === 'en_cours' || x.status === 'en_pause'));
  if (open) open.aidLevel = level;
  return s;
}

/** Découpe les étapes en 2 ou 3 blocs pour le mode condensé. */
export function condensedBlocks(steps: Step[]): Step[][] {
  const n = steps.length;
  if (n <= 2) return steps.map((x) => [x]);
  const blockCount = n <= 4 ? 2 : 3;
  const size = Math.ceil(n / blockCount);
  const blocks: Step[][] = [];
  for (let i = 0; i < n; i += size) blocks.push(steps.slice(i, i + size));
  return blocks;
}

// ---------------------------------------------------------------- Récompenses et personnalisation

export function chooseReward(state: AppState, choiceId: string, cosmeticId: string): AppState {
  const s = clone(state);
  const p = s.progression;
  const choice = p.pendingChoices.find((c) => c.id === choiceId);
  if (!choice || !choice.options.includes(cosmeticId)) return state;
  p.pendingChoices = p.pendingChoices.filter((c) => c.id !== choiceId);
  if (!p.unlockedCosmetics.includes(cosmeticId)) {
    p.unlockedCosmetics.push(cosmeticId);
    p.unseen.push(cosmeticId);
  }
  // Les options non choisies reviendront dans les propositions des niveaux suivants.
  autoEquip(p, cosmeticId);
  return s;
}

function autoEquip(p: Progression, cosmeticId: string) {
  const c = COSMETICS.find((x) => x.id === cosmeticId);
  if (!c) return;
  if (c.kind === 'decor' && !p.equipped.decor.includes(c.id)) p.equipped.decor.push(c.id);
  if (c.kind === 'accessoire') p.equipped.accessory = c.id;
}

export function equip(state: AppState, cosmeticId: string | null, kind: 'couleur' | 'accessoire' | 'ambiance' | 'decor'): AppState {
  const s = clone(state);
  const p = s.progression;
  if (cosmeticId && !p.unlockedCosmetics.includes(cosmeticId)) return state;
  if (kind === 'couleur' && cosmeticId) p.equipped.color = cosmeticId;
  if (kind === 'ambiance' && cosmeticId) p.equipped.ambiance = cosmeticId;
  if (kind === 'accessoire') p.equipped.accessory = p.equipped.accessory === cosmeticId ? null : cosmeticId;
  if (kind === 'decor' && cosmeticId) {
    p.equipped.decor = p.equipped.decor.includes(cosmeticId)
      ? p.equipped.decor.filter((d) => d !== cosmeticId)
      : [...p.equipped.decor, cosmeticId];
  }
  return s;
}

export function markSeen(state: AppState, ids?: string[]): AppState {
  const s = clone(state);
  s.progression.unseen = ids ? s.progression.unseen.filter((x) => !ids.includes(x)) : [];
  return s;
}

// ---------------------------------------------------------------- Espace parent

export function upsertRoutine(state: AppState, routine: Routine): AppState {
  const s = clone(state);
  const cleaned: Routine = {
    ...routine,
    title: routine.title.trim().slice(0, 60) || 'Nouvelle routine',
    description: routine.description.trim().slice(0, 140),
    trigger: routine.trigger.trim().slice(0, 80),
    estimatedMinutes: Math.max(1, Math.min(120, Math.round(routine.estimatedMinutes || 5))),
    steps: routine.steps
      .filter((st) => st.title.trim().length > 0)
      .map((st, i) => ({ ...st, title: st.title.trim().slice(0, 80), xpReward: clampXp(st.xpReward), order: i }))
  };
  const idx = s.routines.findIndex((r) => r.id === routine.id);
  if (idx >= 0) s.routines[idx] = cleaned;
  else s.routines.push(cleaned);
  // Les sessions ouvertes gardent leurs étapes validées ; le total est mis à jour.
  for (const sess of s.sessions) {
    if (sess.routineId === cleaned.id && sess.status !== 'terminee' && sess.status !== 'mise_de_cote') {
      sess.totalSteps = cleaned.steps.length;
      sess.routineTitle = cleaned.title;
    }
  }
  return s;
}

export function deleteRoutine(state: AppState, routineId: string): AppState {
  const s = clone(state);
  s.routines = s.routines.filter((r) => r.id !== routineId);
  for (const sess of s.sessions) {
    if (sess.routineId === routineId && (sess.status === 'en_cours' || sess.status === 'en_pause')) sess.status = 'mise_de_cote';
  }
  return s;
}

export function newCustomRoutine(): Routine {
  const id = makeId('routine');
  return {
    id,
    title: 'Ma nouvelle routine',
    description: '',
    illustration: 'etoile',
    estimatedMinutes: 5,
    category: 'perso',
    isCustom: true,
    isDemo: false,
    trigger: '',
    steps: [newStep(0)]
  };
}

export function newStep(order: number): Step {
  return { id: makeId('etape'), title: '', description: '', helpText: '', easierText: '', xpReward: 10, order };
}

/** Réinitialise les données de démonstration en gardant le profil et les réglages. */
export function resetDemo(state: AppState, now = new Date()): AppState {
  const fresh = createInitialState(now);
  return { ...fresh, profile: state.profile ? clone(state.profile) : null, preferences: clone(state.preferences) };
}

// ---------------------------------------------------------------- Suggestion de mission

/** Une seule mission suggérée : d'abord une routine commencée, puis selon le moment de la journée. */
export function suggestRoutine(state: AppState, now = new Date()): Routine | undefined {
  if (state.routines.length === 0) return undefined;
  const open = state.sessions
    .filter((x) => x.status === 'en_cours' || x.status === 'en_pause')
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .map((x) => getRoutine(state, x.routineId))
    .find(Boolean);
  if (open) return open;
  const hour = now.getHours();
  const day = now.getDay(); // 0 dimanche … 6 samedi
  const schoolTomorrow = day >= 0 && day <= 4; // dimanche à jeudi
  const today = now.toISOString().slice(0, 10);
  const doneToday = new Set(
    state.sessions.filter((x) => x.status === 'terminee' && x.completedAt?.startsWith(today)).map((x) => x.routineId)
  );
  const candidates = state.routines.filter((r) => r.steps.length > 0 && !doneToday.has(r.id));
  const byId = (id: string) => candidates.find((r) => r.id === id);
  if (schoolTomorrow && hour >= 16 && hour < 18) return byId('commencer-devoirs') ?? byId('preparer-sac') ?? candidates[0];
  if (schoolTomorrow && hour >= 18) return byId('preparer-sac') ?? candidates[0];
  if (hour >= 19) return byId('linge-sale') ?? candidates[0];
  return byId('ranger-activite') ?? candidates[0] ?? state.routines[0];
}

// ---------------------------------------------------------------- Import / export

export function exportData(state: AppState): string {
  return JSON.stringify({ application: 'Compagnon', exportedAt: new Date().toISOString(), data: state }, null, 2);
}

export function parseImport(json: string): AppState {
  const parsed = JSON.parse(json);
  const data = parsed?.data ?? parsed;
  if (!data || typeof data !== 'object' || !Array.isArray(data.routines) || !data.progression || !Array.isArray(data.sessions)) {
    throw new Error('Ce fichier ne ressemble pas à une sauvegarde de Compagnon.');
  }
  return migrate(data);
}

/** Met à niveau une sauvegarde ancienne ou incomplète. */
export function migrate(raw: Partial<AppState>): AppState {
  const base = createInitialState();
  const p = { ...initialProgression(), ...(raw.progression ?? {}) } as Progression;
  p.eventCounts = { ...initialProgression().eventCounts, ...(raw.progression?.eventCounts ?? {}) };
  p.rewardedMilestones = p.rewardedMilestones ?? [];
  p.equipped = { ...initialProgression().equipped, ...(raw.progression?.equipped ?? {}) };
  for (const id of STARTING_COSMETICS) if (!p.unlockedCosmetics.includes(id)) p.unlockedCosmetics.push(id);
  // Les XP ne diminuent jamais : le niveau est toujours recalculé à partir du total.
  p.totalXp = Math.max(0, Number(p.totalXp) || 0);
  p.level = Math.max(p.level || 1, levelForXp(p.totalXp));
  p.worldStage = worldStageForLevel(p.level);
  return {
    ...base,
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    routines: raw.routines ?? base.routines,
    sessions: raw.sessions ?? [],
    progression: p,
    preferences: {
      ...base.preferences,
      ...(raw.preferences ?? {}),
      displayPreferences: { ...base.preferences.displayPreferences, ...(raw.preferences?.displayPreferences ?? {}) }
    }
  } as AppState;
}
