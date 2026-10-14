// Photos des étapes : prises sur l'appareil, réduites, et gardées uniquement sur l'appareil
// (IndexedDB, à part des autres données pour ne pas alourdir les sauvegardes).
import { createStore, del, get, set } from 'idb-keyval';
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

/** Réduit l'image à 900 px de côté maximum (JPEG) avant de l'enregistrer. */
export async function savePhoto(stepId: string, file: File): Promise<void> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, 900 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
    await set(stepId, canvas.toDataURL('image/jpeg', 0.75), photos());
    notify();
  } finally {
    URL.revokeObjectURL(url);
  }
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
