// Persistance locale dans IndexedDB (via idb-keyval).
import { createStore, del, get, set } from 'idb-keyval';
import { migrate } from '../logic/engine';
import type { AppState } from '../types';

const KEY = 'etat';
let dbStore: ReturnType<typeof createStore> | null = null;

function store() {
  if (!dbStore) dbStore = createStore('compagnon', 'donnees');
  return dbStore;
}

export async function loadState(): Promise<AppState | null> {
  const raw = await get<AppState>(KEY, store());
  return raw ? migrate(raw) : null;
}

export async function saveState(state: AppState): Promise<void> {
  await set(KEY, state, store());
}

export async function clearState(): Promise<void> {
  await del(KEY, store());
}

/** Demande au navigateur de ne pas effacer les données (utile sur Android et iOS installé). */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch {
    /* ignoré */
  }
  return false;
}
