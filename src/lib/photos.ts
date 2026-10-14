// Photos des étapes : prises sur l'appareil, réduites, et gardées uniquement sur l'appareil
// (IndexedDB, à part des autres données pour ne pas alourdir les sauvegardes).
import { clear, createStore, del, get, set } from 'idb-keyval';
import { useEffect, useState } from 'react';

let store: ReturnType<typeof createStore> | null = null;
const photos = () => (store ??= createStore('compagnon-photos', 'photos'));

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export async function getPhoto(stepId: string): Promise<string | null> {
  try {
    return (await get<string>(stepId, photos())) ?? null;
  } catch {
    return null;
  }
}

export async function removePhoto(stepId: string) {
  try {
    await del(stepId, photos());
  } finally {
    notify();
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
}

/** Réduit une image à 900 px de côté maximum et la renvoie en JPEG (data URL). */
export async function resizeFile(file: File, max = 900): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.75);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function savePhoto(stepId: string, file: File): Promise<void> {
  await set(stepId, await resizeFile(file), photos());
  notify();
}

// ------------------------------------------------------------ Album « Mes exploits »

export interface AlbumEntry {
  id: string;
  at: string;
  routineId: string;
  routineTitle: string;
}

export const ALBUM_MAX = 30;
const ALBUM_KEY = 'album:index';
const imgKey = (id: string, kind: 'raw' | 'festive') => `album:${kind}:${id}`;

/** Garde les ALBUM_MAX photos les plus récentes (la liste est triée de la plus récente à la plus ancienne). */
export function pruneAlbum(list: AlbumEntry[], max = ALBUM_MAX): { keep: AlbumEntry[]; removed: AlbumEntry[] } {
  const sorted = [...list].sort((a, b) => b.at.localeCompare(a.at));
  return { keep: sorted.slice(0, max), removed: sorted.slice(max) };
}

export async function listAlbum(): Promise<AlbumEntry[]> {
  try {
    return (await get<AlbumEntry[]>(ALBUM_KEY, photos())) ?? [];
  } catch {
    return [];
  }
}

export async function getAlbumImage(id: string, kind: 'raw' | 'festive' = 'festive'): Promise<string | null> {
  try {
    return (await get<string>(imgKey(id, kind), photos())) ?? null;
  } catch {
    return null;
  }
}

/** Ajoute une photo (brute + version festive) et supprime les plus anciennes au-delà de la limite. */
export async function addAlbumPhoto(entry: AlbumEntry, raw: string, festive: string): Promise<void> {
  const store = photos();
  await set(imgKey(entry.id, 'raw'), raw, store);
  await set(imgKey(entry.id, 'festive'), festive, store);
  const { keep, removed } = pruneAlbum([entry, ...(await listAlbum())]);
  await set(ALBUM_KEY, keep, store);
  for (const r of removed) {
    await del(imgKey(r.id, 'raw'), store);
    await del(imgKey(r.id, 'festive'), store);
  }
  notify();
}

export async function removeAlbumPhoto(id: string): Promise<void> {
  const store = photos();
  await set(ALBUM_KEY, (await listAlbum()).filter((e) => e.id !== id), store);
  await del(imgKey(id, 'raw'), store);
  await del(imgKey(id, 'festive'), store);
  notify();
}

/** La photo de l'enfant devient la photo modèle d'une étape (sans le cadre festif). */
export async function setAlbumPhotoAsModel(id: string, stepId: string): Promise<boolean> {
  const raw = await getAlbumImage(id, 'raw');
  if (!raw) return false;
  await set(stepId, raw, photos());
  notify();
  return true;
}

/** Efface toutes les photos (modèles et album). */
export async function clearPhotos(): Promise<void> {
  try {
    await clear(photos());
  } finally {
    notify();
  }
}

/** Liste de l'album, mise à jour quand elle change. */
export function useAlbum(): AlbumEntry[] {
  const [list, setList] = useState<AlbumEntry[]>([]);
  useEffect(() => {
    let alive = true;
    const load = () => listAlbum().then((l) => alive && setList(l));
    load();
    listeners.add(load);
    return () => {
      alive = false;
      listeners.delete(load);
    };
  }, []);
  return list;
}

/** Une image de l'album, mise à jour quand elle change. */
export function useAlbumImage(id: string | undefined, kind: 'raw' | 'festive' = 'festive'): string | null {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    getAlbumImage(id, kind).then((p) => alive && setSrc(p));
    return () => {
      alive = false;
    };
  }, [id, kind]);
  return id ? src : null;
}

/** Photo d'une étape, mise à jour quand elle change. */
export function usePhoto(stepId: string | undefined): string | null {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!stepId) return;
    let alive = true;
    const load = () => getPhoto(stepId).then((p) => alive && setSrc(p));
    load();
    listeners.add(load);
    return () => {
      alive = false;
      listeners.delete(load);
    };
  }, [stepId]);
  return stepId ? src : null;
}
