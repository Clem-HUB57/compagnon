import {
  chooseReward,
  completeStep,
  completeSteps,
  condensedBlocks,
  createInitialState,
  deleteRoutine,
  equip,
  exportData,
  FADING_THRESHOLD,
  getRoutine,
  newCustomRoutine,
  openSession,
  parseImport,
  pauseSession,
  recordHelp,
  remainingSteps,
  resetDemo,
  respondToOffer,
  restartRoutine,
  setAidLevel,
  setProfile,
  sortedSteps,
  startOrResume,
  suggestRoutine,
  upsertRoutine
} from '../src/logic/engine';
import { COMPLETION_BONUS, levelForXp, thresholdFor, worldStageForLevel } from '../src/logic/progression';
import type { AppState } from '../src/types';

function fresh(): AppState {
  return setProfile(createInitialState(), 'Léa', 'moki', 'Moki');
}

function runRoutine(state: AppState, routineId: string) {
  const { state: s1, sessionId } = startOrResume(state, routineId);
  const routine = getRoutine(s1, routineId)!;
  let s = s1;
  let last = null;
  let levelUp = null;
  let worldStageChanged = null;
  for (const step of sortedSteps(routine)) {
    const r = completeStep(s, sessionId, step.id);
    s = r.state;
    last = r.events;
    levelUp = levelUp ?? r.events.levelUp;
    worldStageChanged = worldStageChanged ?? r.events.worldStageChanged;
  }
  return { state: s, sessionId, events: { ...last!, levelUp, worldStageChanged } };
}

describe('Contenu initial', () => {
  it('précharge les routines d’exemple, dont les trois routines principales', () => {
    const s = createInitialState();
    const ids = s.routines.map((r) => r.id);
    expect(ids).toEqual(expect.arrayContaining(['preparer-sac', 'commencer-devoirs', 'ranger-activite']));
    expect(getRoutine(s, 'preparer-sac')!.steps).toHaveLength(6);
    expect(s.routines.every((r) => r.isDemo)).toBe(true);
  });
});

describe('Sessions et XP', () => {
  it('attribue les XP une seule fois par étape et par session, même en cas de clics répétés', () => {
    const { state: s1, sessionId } = startOrResume(fresh(), 'preparer-sac');
    const step = sortedSteps(getRoutine(s1, 'preparer-sac')!)[0];
    const a = completeStep(s1, sessionId, step.id);
    expect(a.events.xpGained).toBe(10);
    const b = completeStep(a.state, sessionId, step.id);
    const c = completeStep(b.state, sessionId, step.id);
    expect(b.events.xpGained).toBe(0);
    expect(c.state.progression.totalXp).toBe(10);
  });

  it('donne un bonus de fin une seule fois et termine la session', () => {
    const { state, events } = runRoutine(fresh(), 'preparer-sac');
    expect(events.sessionCompleted).toBe(true);
    expect(state.progression.totalXp).toBe(60 + COMPLETION_BONUS);
    const sess = state.sessions[0];
    expect(sess.status).toBe('terminee');
    // Rejouer une étape d'une session terminée ne rapporte rien.
    const again = completeStep(state, sess.id, sess.completedStepIds[0]);
    expect(again.state.progression.totalXp).toBe(80);
  });

  it('reprend une session interrompue sans remettre les étapes à zéro', () => {
    const { state: s1, sessionId } = startOrResume(fresh(), 'preparer-sac');
    const steps = sortedSteps(getRoutine(s1, 'preparer-sac')!);
    let s = completeStep(s1, sessionId, steps[0].id).state;
    s = completeStep(s, sessionId, steps[1].id).state;
    s = pauseSession(s, sessionId);
    // L'application est fermée puis rouverte : la session est retrouvée.
    const reopened = parseImport(exportData(s));
    const r = startOrResume(reopened, 'preparer-sac');
    expect(r.resumed).toBe(true);
    expect(r.sessionId).toBe(sessionId);
    const sess = r.state.sessions.find((x) => x.id === sessionId)!;
    expect(sess.completedStepIds).toHaveLength(2);
    expect(remainingSteps(getRoutine(r.state, 'preparer-sac')!, sess)[0].id).toBe(steps[2].id);
    expect(r.state.progression.eventCounts.reprise).toBe(1);
  });

  it('peut repartir de zéro sans perdre les XP déjà gagnés', () => {
    const { state: s1, sessionId } = startOrResume(fresh(), 'preparer-sac');
    const step = sortedSteps(getRoutine(s1, 'preparer-sac')!)[0];
    const s2 = completeStep(s1, sessionId, step.id).state;
    const r = restartRoutine(s2, 'preparer-sac');
    expect(r.sessionId).not.toBe(sessionId);
    expect(r.state.progression.totalXp).toBe(10);
    expect(r.state.sessions.find((x) => x.id === sessionId)!.status).toBe('mise_de_cote');
  });

  it('la pause ne retire jamais d’XP', () => {
    const { state: s1, sessionId } = startOrResume(fresh(), 'ranger-activite');
    const step = sortedSteps(getRoutine(s1, 'ranger-activite')!)[0];
    const s2 = completeStep(s1, sessionId, step.id).state;
    const s3 = pauseSession(s2, sessionId);
    expect(s3.progression.totalXp).toBe(s2.progression.totalXp);
    expect(openSession(s3, 'ranger-activite')!.status).toBe('en_pause');
  });
});

describe('Niveaux, monde et récompenses', () => {
  it('calcule les niveaux et les paliers du monde', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(thresholdFor(2))).toBe(2);
    expect(levelForXp(thresholdFor(2) - 1)).toBe(1);
    expect(worldStageForLevel(1)).toBe(0);
    expect(worldStageForLevel(3)).toBe(2);
    expect(worldStageForLevel(7)).toBe(5);
  });

  it('fait monter de niveau, évoluer le monde et propose un choix de récompense', () => {
    const { state, events } = runRoutine(fresh(), 'preparer-sac');
    expect(events.levelUp).toEqual({ from: 1, to: 2 });
    expect(events.worldStageChanged).toEqual({ from: 0, to: 1 });
    expect(state.progression.worldStage).toBe(1);
    expect(state.progression.pendingChoices).toHaveLength(1);
    const choice = state.progression.pendingChoices[0];
    expect(choice.options.length).toBeGreaterThan(0);
    expect(choice.options.length).toBeLessThanOrEqual(3);
    const chosen = chooseReward(state, choice.id, choice.options[0]);
    expect(chosen.progression.unlockedCosmetics).toContain(choice.options[0]);
    expect(chosen.progression.pendingChoices).toHaveLength(0);
    // Un objet qui n'était pas proposé ne peut pas être pris.
    const cheat = chooseReward(state, choice.id, 'ambiance-aurore');
    expect(cheat.progression.unlockedCosmetics).not.toContain('ambiance-aurore');
  });

  it('donne au plus une trouvaille par session, liée à une stratégie', () => {
    const runWithHelp = (state: AppState) => {
      const { state: s1, sessionId } = startOrResume(state, 'linge-sale');
      let s = recordHelp(s1, sessionId);
      let events = null;
      for (const st of sortedSteps(getRoutine(s, 'linge-sale')!)) {
        const r = completeStep(s, sessionId, st.id);
        s = r.state;
        events = r.events;
      }
      return { s, events: events! };
    };
    const first = runWithHelp(fresh());
    expect(first.events.findings).toHaveLength(1);
    expect(first.events.findings[0].reason).toBe('decouverte');
    // La stratégie « aide » non encore récompensée l'est à la session suivante.
    const second = runWithHelp(first.s);
    expect(second.events.findings).toHaveLength(1);
    expect(second.events.findings[0].reason).toBe('aide');
    expect(second.events.findings[0].cosmeticId).not.toBe(first.events.findings[0].cosmeticId);
  });

  it('ne retire jamais un objet acquis et permet de l’équiper', () => {
    const { state } = runRoutine(fresh(), 'linge-sale');
    const owned = state.progression.unlockedCosmetics.find((id) => id === 'lunettes')!;
    expect(owned).toBe('lunettes');
    const s = equip(state, 'lunettes', 'accessoire');
    expect(s.progression.equipped.accessory).toBe('lunettes');
    const s2 = equip(s, 'ambiance-aurore', 'ambiance');
    expect(s2.progression.equipped.ambiance).toBe('ambiance-jour'); // non possédée : refusé
  });
});

describe('Estompage de l’aide', () => {
  it('propose le mode condensé après plusieurs réussites, sans l’imposer', () => {
    let s = fresh();
    let events = null;
    for (let i = 0; i < FADING_THRESHOLD; i++) {
      const r = runRoutine(s, 'linge-sale');
      s = r.state;
      events = r.events;
    }
    expect(events!.offer).toBe('condense');
    const refused = respondToOffer(s, 'linge-sale', false);
    expect(refused.progression.routineStats['linge-sale'].aidLevel).toBe('guide');
    const accepted = respondToOffer(s, 'linge-sale', true);
    expect(accepted.progression.routineStats['linge-sale'].aidLevel).toBe('condense');
  });

  it('remet un écusson à la première réussite en autonomie, et on peut revenir en mode guidé', () => {
    let s = setAidLevel(fresh(), 'linge-sale', 'autonome');
    const { state: s1, sessionId } = startOrResume(s, 'linge-sale');
    const ids = getRoutine(s1, 'linge-sale')!.steps.map((x) => x.id);
    const r = completeSteps(s1, sessionId, ids);
    expect(r.events.sessionCompleted).toBe(true);
    expect(r.events.badge?.routineId).toBe('linge-sale');
    s = setAidLevel(r.state, 'linge-sale', 'guide');
    expect(s.progression.routineStats['linge-sale'].aidLevel).toBe('guide');
    expect(s.progression.badges).toHaveLength(1);
  });

  it('découpe les étapes en 2 ou 3 blocs', () => {
    const steps = sortedSteps(getRoutine(createInitialState(), 'preparer-sac')!);
    expect(condensedBlocks(steps)).toHaveLength(3);
    expect(condensedBlocks(steps.slice(0, 4))).toHaveLength(2);
    expect(condensedBlocks(steps).flat()).toHaveLength(6);
  });
});

describe('Espace parent', () => {
  it('modifie une routine, borne les XP et garde la session ouverte cohérente', () => {
    const { state: s1, sessionId } = startOrResume(fresh(), 'preparer-sac');
    const routine = getRoutine(s1, 'preparer-sac')!;
    const first = sortedSteps(routine)[0];
    const s2 = completeStep(s1, sessionId, first.id).state;
    const edited = {
      ...routine,
      title: 'Mon cartable',
      steps: [...routine.steps.slice(0, 3).map((x) => ({ ...x, xpReward: 999 })), { ...routine.steps[3], title: '   ' }]
    };
    const s3 = upsertRoutine(s2, edited);
    const r = getRoutine(s3, 'preparer-sac')!;
    expect(r.title).toBe('Mon cartable');
    expect(r.steps).toHaveLength(3); // l'étape vide est retirée
    expect(r.steps.every((x) => x.xpReward === 30)).toBe(true);
    const sess = openSession(s3, 'preparer-sac')!;
    expect(sess.completedStepIds).toContain(first.id);
    expect(sess.totalSteps).toBe(3);
  });

  it('crée et supprime une routine personnalisée', () => {
    const custom = { ...newCustomRoutine(), title: 'Brosser mes dents' };
    custom.steps[0].title = 'Prends ta brosse';
    const s = upsertRoutine(fresh(), custom);
    expect(getRoutine(s, custom.id)?.isCustom).toBe(true);
    const s2 = deleteRoutine(s, custom.id);
    expect(getRoutine(s2, custom.id)).toBeUndefined();
  });

  it('exporte, réimporte et réinitialise les données', () => {
    const { state } = runRoutine(fresh(), 'preparer-sac');
    const back = parseImport(exportData(state));
    expect(back.progression.totalXp).toBe(state.progression.totalXp);
    expect(() => parseImport('{"bonjour": 1}')).toThrow();
    const reset = resetDemo(state);
    expect(reset.progression.totalXp).toBe(0);
    expect(reset.profile?.childName).toBe('Léa');
  });
});

describe('Suggestion', () => {
  it('suggère d’abord une routine commencée', () => {
    const { state } = startOrResume(fresh(), 'nettoyer-toilettes');
    expect(suggestRoutine(state)?.id).toBe('nettoyer-toilettes');
  });
  it('suggère les devoirs un mardi après l’école', () => {
    const tuesday = new Date(2026, 9, 13, 16, 30);
    expect(suggestRoutine(fresh(), tuesday)?.id).toBe('commencer-devoirs');
  });
});
