import { create } from 'zustand';
import * as engine from '../logic/engine';
import type { ActionEvents, AppState } from '../types';
import { clearState, loadState, requestPersistence, saveState } from './storage';
import { clearPhotos } from '../lib/photos';
import { clearRecordings } from '../lib/recordings';

export type CabaneTab = 'compagnon' | 'ile' | 'carnet' | 'album';

export type Route =
  | { name: 'onboarding' }
  | { name: 'accueil' }
  | { name: 'aventures' }
  | { name: 'mission'; sessionId: string }
  | { name: 'fin'; sessionId: string }
  | { name: 'cabane'; tab?: CabaneTab }
  | { name: 'parent' }
  | { name: 'calme'; returnTo?: string };

/** Ce qui s'est passé pendant la mission en cours (non persisté). */
export interface MissionContext {
  sessionId: string;
  levelAtStart: number;
  stageAtStart: number;
  findings: ActionEvents['findings'];
  badge: ActionEvents['badge'];
  offer: ActionEvents['offer'];
  resumedAfterPause: boolean;
}

interface AppStore {
  ready: boolean;
  storageOk: boolean;
  data: AppState;
  route: Route;
  mission: MissionContext | null;
  init: () => Promise<void>;
  update: (fn: (s: AppState) => AppState) => void;
  navigate: (route: Route, replace?: boolean) => void;
  startMission: (routineId: string, restart?: boolean, short?: boolean) => void;
  completeSteps: (sessionId: string, stepIds: string[]) => ActionEvents;
  wipeAll: () => Promise<void>;
}

// Enregistrement immédiat après chaque changement, dans l'ordre (l'état est petit).
// Ainsi, fermer l'application juste après « C'est fait ! » ne perd rien.
let saveChain: Promise<void> = Promise.resolve();

function scheduleSave(get: () => AppStore, set: (p: Partial<AppStore>) => void) {
  const snapshot = get().data;
  saveChain = saveChain.then(() => saveState(snapshot)).catch(() => set({ storageOk: false }));
}

export const useApp = create<AppStore>((set, get) => ({
  ready: false,
  storageOk: true,
  data: engine.createInitialState(),
  route: { name: 'accueil' },
  mission: null,

  init: async () => {
    let data: AppState | null = null;
    let storageOk = true;
    try {
      data = await loadState();
    } catch {
      storageOk = false;
    }
    const state = data ?? engine.createInitialState();
    set({ data: state, ready: true, storageOk, route: state.profile ? { name: 'accueil' } : { name: 'onboarding' } });
    if (storageOk && !data) saveState(state).catch(() => set({ storageOk: false }));
    requestPersistence();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveState(get().data).catch(() => undefined);
      });
    }
  },

  update: (fn) => {
    set({ data: fn(get().data) });
    scheduleSave(get, set);
  },

  navigate: (route, replace = false) => {
    set({ route });
    if (typeof window !== 'undefined' && window.history) {
      try {
        if (replace) window.history.replaceState({ route }, '');
        else window.history.pushState({ route }, '');
      } catch {
        /* certains contextes (iframe) refusent l'historique */
      }
      window.scrollTo?.(0, 0);
    }
  },

  startMission: (routineId, restart = false, short = false) => {
    const before = get().data;
    const wasPaused = engine.openSession(before, routineId)?.status === 'en_pause';
    const r = restart ? { ...engine.restartRoutine(before, routineId, new Date(), { short }), resumed: false } : engine.startOrResume(before, routineId, new Date(), { short });
    set({
      data: r.state,
      mission: {
        sessionId: r.sessionId,
        levelAtStart: r.state.progression.level,
        stageAtStart: r.state.progression.worldStage,
        findings: [],
        badge: null,
        offer: null,
        resumedAfterPause: !restart && wasPaused
      }
    });
    scheduleSave(get, set);
    get().navigate({ name: 'mission', sessionId: r.sessionId });
  },

  completeSteps: (sessionId, stepIds) => {
    const r = engine.completeSteps(get().data, sessionId, stepIds);
    const m = get().mission;
    const mission =
      m && m.sessionId === sessionId
        ? {
            ...m,
            findings: [...m.findings, ...r.events.findings],
            badge: r.events.badge ?? m.badge,
            offer: r.events.offer ?? m.offer
          }
        : m;
    set({ data: r.state, mission });
    scheduleSave(get, set);
    return r.events;
  },

  wipeAll: async () => {
    try {
      await clearState();
      await clearPhotos();
      await clearRecordings();
    } catch {
      /* rien à effacer */
    }
    const state = engine.createInitialState();
    set({ data: state, mission: null, route: { name: 'onboarding' } });
  }
}));

/** Pour les tests : remet le magasin à zéro. */
export function resetStoreForTests(data?: AppState) {
  useApp.setState({
    ready: true,
    storageOk: true,
    data: data ?? engine.createInitialState(),
    route: data?.profile ? { name: 'accueil' } : { name: 'onboarding' },
    mission: null
  });
}
