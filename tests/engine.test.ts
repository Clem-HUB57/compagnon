import {
  proudPhotoEnabled,
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
  suggestForMoment,
  momentSummary,
  currentMoment,
  doneTodayIds,
  localDay,
  addFromLibrary,
  setTrigger,
  completeCalmTool,
  setCalmPlan,
  skipStep,
  sessionSteps,
  hasShortVersion,
  upsertRoutine
} from '../src/logic/engine';
import { COMPLETION_BONUS, levelForXp, thresholdFor, worldStageForLevel } from '../src/logic/progression';
import type { AppState } from '../src/types';
import { LIBRARY } from '../src/data/library';
import { buildReminderIcs } from '../src/lib/calendar';

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

describe('Ma journée, bibliothèque et plan', () => {
  const dm = { matin: 5, apresEcole: 12, soir: 18 };

  it('détermine le moment de la journée', () => {
    expect(currentMoment(dm, new Date(2026, 9, 13, 7, 30))).toBe('matin');
    expect(currentMoment(dm, new Date(2026, 9, 13, 16, 0))).toBe('apres-ecole');
    expect(currentMoment(dm, new Date(2026, 9, 13, 20, 0))).toBe('soir');
    expect(currentMoment(dm, new Date(2026, 9, 13, 2, 0))).toBe('soir');
  });

  it('suggère d’abord une routine commencée', () => {
    const { state } = startOrResume(fresh(), 'nettoyer-toilettes');
    expect(suggestRoutine(state)?.id).toBe('nettoyer-toilettes');
  });

  it('suggère une seule quête par moment et passe à la suivante quand elle est faite', () => {
    const afternoon = new Date(2026, 9, 13, 16, 30);
    let s = fresh();
    expect(suggestRoutine(s, afternoon)?.id).toBe('commencer-devoirs');
    s = runRoutine(s, 'commencer-devoirs').state;
    expect(momentSummary(s, 'apres-ecole').done).toBe(1);
    // Plus rien après l'école : la suggestion du moment est vide.
    expect(suggestForMoment(s, 'apres-ecole')).toBeUndefined();
    expect(suggestForMoment(s, 'soir')?.id).toBe('preparer-sac');
  });

  it('compte les routines faites aujourd’hui en heure locale', () => {
    const s = runRoutine(fresh(), 'linge-sale').state;
    expect(doneTodayIds(s).has('linge-sale')).toBe(true);
    expect(localDay(new Date(2026, 9, 13, 23, 30))).toBe('2026-10-13');
  });

  it('ajoute un modèle de la bibliothèque avec des identifiants uniques', () => {
    const tpl = LIBRARY.find((t) => t.templateId === 'modele-dents-matin')!;
    const r1 = addFromLibrary(fresh(), tpl);
    const routine = getRoutine(r1.state, r1.routineId)!;
    expect(routine.moment).toBe('matin');
    expect(routine.templateId).toBe('modele-dents-matin');
    expect(routine.steps).toHaveLength(tpl.steps.length);
    const r2 = addFromLibrary(r1.state, tpl);
    const ids = r2.state.routines.flatMap((r) => r.steps.map((st) => st.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(suggestForMoment(r1.state, 'matin')?.id).toBe(r1.routineId);
  });

  it('tous les modèles de la bibliothèque ont des étapes complètes', () => {
    for (const t of LIBRARY) {
      expect(t.steps.length).toBeGreaterThanOrEqual(3);
      for (const [title, , help, easier] of t.steps) {
        expect(title && help && easier).toBeTruthy();
      }
    }
  });

  it('l’enfant peut choisir son plan « Quand… alors… »', () => {
    const s = setTrigger(fresh(), 'preparer-sac', '  Quand j’ai mis mon pyjama ');
    expect(getRoutine(s, 'preparer-sac')!.trigger).toBe('Quand j’ai mis mon pyjama');
  });

  it('met à niveau une ancienne sauvegarde sans moments', () => {
    const old = JSON.parse(exportData(fresh()));
    for (const r of old.data.routines) delete r.moment;
    delete old.data.preferences.dayMoments;
    const s = parseImport(JSON.stringify(old));
    expect(getRoutine(s, 'commencer-devoirs')!.moment).toBe('apres-ecole');
    expect(s.preferences.dayMoments.soir).toBe(18);
  });
});

describe('Coin calme', () => {
  it('récompense l’entraînement avec un plafond quotidien et une trouvaille', () => {
    const day = new Date(2026, 9, 14, 17, 0);
    const a = completeCalmTool(fresh(), 'respirer', day);
    expect(a.events.xpGained).toBe(15);
    expect(a.events.findings[0]?.reason).toBe('calme');
    const b = completeCalmTool(a.state, 'bouger', day);
    const c = completeCalmTool(b.state, 'presser', day);
    expect(b.events.xpGained).toBe(15);
    expect(c.events.xpGained).toBe(0); // plafond : 2 entraînements récompensés par jour
    expect(c.state.calm.history).toHaveLength(3);
    // Rien d'autre que l'outil et l'heure n'est enregistré.
    expect(Object.keys(c.state.calm.history[0]).sort()).toEqual(['at', 'id', 'tool']);
    const next = completeCalmTool(c.state, 'respirer', new Date(2026, 9, 15, 17, 0));
    expect(next.events.xpGained).toBe(15);
  });

  it('enregistre le plan tempête de l’enfant', () => {
    const s = setCalmPlan(fresh(), ' je sens la colère monter ', 'presser');
    expect(s.calm.plan).toEqual({ feeling: 'je sens la colère monter', tool: 'presser' });
    expect(setCalmPlan(s, '   ', 'presser').calm.plan).toBeNull();
  });

  it('les quêtes d’entraînement de la bibliothèque proposent un exercice', () => {
    const tpl = LIBRARY.find((t) => t.templateId === 'modele-respirer')!;
    const r = addFromLibrary(fresh(), tpl);
    expect(getRoutine(r.state, r.routineId)!.steps.some((st) => st.tool === 'respirer')).toBe(true);
  });

  it('une ancienne sauvegarde sans coin calme est mise à niveau', () => {
    const old = JSON.parse(exportData(fresh()));
    delete old.data.calm;
    delete old.data.progression.eventCounts.calme;
    const s = parseImport(JSON.stringify(old));
    expect(s.calm).toEqual({ plan: null, history: [] });
    expect(completeCalmTool(s, 'eau').state.progression.eventCounts.calme).toBe(1);
  });
});

describe('Ajustements recommandés par les familles', () => {
  it('une étape remise à plus tard revient à la fin, sans rien perdre', () => {
    const { state: s1, sessionId } = startOrResume(fresh(), 'preparer-sac');
    const steps = sortedSteps(getRoutine(s1, 'preparer-sac')!);
    const s2 = skipStep(s1, sessionId, steps[0].id);
    const sess = s2.sessions[0];
    const order = remainingSteps(getRoutine(s2, 'preparer-sac')!, sess).map((x) => x.id);
    expect(order[0]).toBe(steps[1].id);
    expect(order[order.length - 1]).toBe(steps[0].id);
    // On peut finir la routine en faisant l'étape gardée en dernier.
    let s = s2;
    let events = null;
    for (const id of order) {
      const r = completeStep(s, sessionId, id);
      s = r.state;
      events = r.events;
    }
    expect(events!.sessionCompleted).toBe(true);
  });

  it('la version courte ne garde que les étapes indispensables', () => {
    const routine = getRoutine(fresh(), 'preparer-sac')!;
    expect(hasShortVersion(routine)).toBe(true);
    const { state: s1, sessionId } = startOrResume(fresh(), 'preparer-sac', new Date(), { short: true });
    const sess = s1.sessions[0];
    const scope = sessionSteps(routine, sess);
    expect(sess.totalSteps).toBe(4);
    expect(scope.every((x) => x.essential)).toBe(true);
    let s = s1;
    let events = null;
    for (const st of scope) {
      const r = completeStep(s, sessionId, st.id);
      s = r.state;
      events = r.events;
    }
    expect(events!.sessionCompleted).toBe(true);
    expect(s.progression.totalXp).toBe(4 * 10 + 20);
  });

  it('sans étape indispensable, pas de version courte', () => {
    const r = getRoutine(fresh(), 'nettoyer-toilettes')!;
    expect(hasShortVersion(r)).toBe(false);
    const { state } = startOrResume(fresh(), 'nettoyer-toilettes', new Date(), { short: true });
    expect(state.sessions[0].short).toBe(false);
    expect(state.sessions[0].totalSteps).toBe(r.steps.length);
  });

  it('les modèles de la bibliothèque arrivent avec leurs étapes indispensables', () => {
    const tpl = LIBRARY.find((t) => t.templateId === 'modele-habiller')!;
    const r = addFromLibrary(fresh(), tpl);
    expect(getRoutine(r.state, r.routineId)!.steps.filter((st) => st.essential)).toHaveLength(3);
  });

  it('crée un rappel d’agenda quotidien ou en semaine', () => {
    const ics = buildReminderIcs({ title: 'Préparer mon sac', time: '18:30', weekdaysOnly: true, now: new Date(2026, 9, 14, 10, 0), uid: 'abc' });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART:20261014T183000');
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
    expect(ics).toContain('BEGIN:VALARM');
    const later = buildReminderIcs({ title: 'X', time: '08:00', weekdaysOnly: false, now: new Date(2026, 9, 14, 10, 0), uid: 'b' });
    expect(later).toContain('DTSTART:20261015T080000');
    expect(later).toContain('RRULE:FREQ=DAILY');
  });
});

describe('Photo de fierté', () => {
  it('est proposée par défaut, sauf pour les soins du corps, et reste réglable', () => {
    const s = createInitialState();
    const sac = getRoutine(s, 'preparer-sac')!;
    expect(proudPhotoEnabled(sac)).toBe(true);
    expect(proudPhotoEnabled({ ...sac, category: 'soin' })).toBe(false);
    expect(proudPhotoEnabled({ ...sac, category: 'soin', proudPhoto: true })).toBe(true);
    expect(proudPhotoEnabled({ ...sac, proudPhoto: false })).toBe(false);
  });
});
