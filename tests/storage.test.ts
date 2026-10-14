import { completeStep, createInitialState, getRoutine, setProfile, sortedSteps, startOrResume } from '../src/logic/engine';
import { clearState, loadState, saveState } from '../src/store/storage';

describe('Stockage local (IndexedDB)', () => {
  it('retrouve la progression et la session en cours après fermeture', async () => {
    const base = setProfile(createInitialState(), 'Léa', 'moki', 'Moki');
    const { state, sessionId } = startOrResume(base, 'preparer-sac');
    const first = sortedSteps(getRoutine(state, 'preparer-sac')!)[0];
    const s = completeStep(state, sessionId, first.id).state;
    await saveState(s);
    const loaded = await loadState();
    expect(loaded?.progression.totalXp).toBe(10);
    expect(loaded?.sessions[0].completedStepIds).toEqual([first.id]);
    expect(loaded?.profile?.companionName).toBe('Moki');
  });

  it('efface toutes les données', async () => {
    await saveState(createInitialState());
    await clearState();
    expect(await loadState()).toBeNull();
  });
});
