// Voix du parent enregistrée pour une étape : plus chaleureuse qu'une voix de synthèse.
// Les enregistrements restent sur l'appareil (IndexedDB), à part des autres données.
import { clear, createStore, del, get, set } from 'idb-keyval';
import { useEffect, useState } from 'react';

let store: ReturnType<typeof createStore> | null = null;
const voices = () => (store ??= createStore('compagnon-voix', 'enregistrements'));

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const MAX_RECORDING_SECONDS = 20;

export function recordingSupported(): boolean {
  return typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

export async function getRecording(stepId: string): Promise<Blob | null> {
  try {
    return (await get<Blob>(stepId, voices())) ?? null;
  } catch {
    return null;
  }
}

export async function saveRecording(stepId: string, blob: Blob) {
  await set(stepId, blob, voices());
  notify();
}

export async function removeRecording(stepId: string) {
  try {
    await del(stepId, voices());
  } finally {
    notify();
  }
}

export async function clearRecordings() {
  try {
    await clear(voices());
  } finally {
    notify();
  }
}

/** Vrai si l'étape a une voix enregistrée. */
export function useRecording(stepId: string | undefined): Blob | null {
  const [blob, setBlob] = useState<Blob | null>(null);
  useEffect(() => {
    if (!stepId) {
      setBlob(null);
      return;
    }
    let alive = true;
    const load = () => getRecording(stepId).then((b) => alive && setBlob(b));
    load();
    listeners.add(load);
    return () => {
      alive = false;
      listeners.delete(load);
    };
  }, [stepId]);
  return blob;
}

/** Démarre un enregistrement au micro ; renvoie de quoi l'arrêter. */
export async function startRecording(onDone: (blob: Blob) => void): Promise<{ stop: () => void }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((t) => MediaRecorder.isTypeSupported?.(t));
  const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.onstop = () => {
    stream.getTracks().forEach((t) => t.stop());
    onDone(new Blob(chunks, { type: rec.mimeType || type || 'audio/webm' }));
  };
  rec.start();
  const timer = window.setTimeout(() => rec.state === 'recording' && rec.stop(), MAX_RECORDING_SECONDS * 1000);
  return {
    stop: () => {
      window.clearTimeout(timer);
      if (rec.state === 'recording') rec.stop();
    }
  };
}
