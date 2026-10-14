import { completeStep, createInitialState, getRoutine, setProfile, sortedSteps, startOrResume } from '../src/logic/engine';
import { clearState, loadState, saveState } from '../src/store/storage';
import { ALBUM_MAX, addAlbumPhoto, clearPhotos, getAlbumImage, getPhoto, listAlbum, pruneAlbum, removeAlbumPhoto, setAlbumPhotoAsModel } from '../src/lib/photos';

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

describe('Album « Mes exploits »', () => {
  const entry = (n: number) => ({ id: `p${n}`, at: new Date(2026, 9, 1, 8, n).toISOString(), routineId: 'preparer-sac', routineTitle: 'Préparer mon sac' });

  it('garde les 30 photos les plus récentes', () => {
    const list = Array.from({ length: 33 }, (_, i) => entry(i));
    const { keep, removed } = pruneAlbum(list);
    expect(keep).toHaveLength(ALBUM_MAX);
    expect(keep[0].id).toBe('p32');
    expect(removed.map((e) => e.id).sort()).toEqual(['p0', 'p1', 'p2']);
  });

  it('ajoute, transforme en photo modèle puis enlève une photo', async () => {
    await clearPhotos();
    await addAlbumPhoto(entry(1), 'data:brute', 'data:festive');
    expect((await listAlbum()).map((e) => e.id)).toEqual(['p1']);
    expect(await getAlbumImage('p1')).toBe('data:festive');
    expect(await setAlbumPhotoAsModel('p1', 'etape-x')).toBe(true);
    expect(await getPhoto('etape-x')).toBe('data:brute');
    await removeAlbumPhoto('p1');
    expect(await listAlbum()).toEqual([]);
    expect(await getAlbumImage('p1')).toBeNull();
    // la photo modèle reste
    expect(await getPhoto('etape-x')).toBe('data:brute');
  });

  it('supprime les plus anciennes images au-delà de la limite', async () => {
    await clearPhotos();
    for (let i = 0; i < ALBUM_MAX + 2; i++) await addAlbumPhoto(entry(i), `raw${i}`, `fest${i}`);
    expect(await listAlbum()).toHaveLength(ALBUM_MAX);
    expect(await getAlbumImage('p0')).toBeNull();
    expect(await getAlbumImage(`p${ALBUM_MAX + 1}`)).toBe(`fest${ALBUM_MAX + 1}`);
  });
});
