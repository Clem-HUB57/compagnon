import { useEffect, useState } from 'react';
import { useApp } from '../store/useApp';

function systemPrefersReduced(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Vrai si les animations doivent être réduites (réglage de l'app ou de l'appareil). */
export function useReducedMotion(): boolean {
  const pref = useApp((s) => s.data.preferences.reducedMotion);
  const [system, setSystem] = useState(systemPrefersReduced());
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setSystem(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  if (pref === 'oui') return true;
  if (pref === 'non') return false;
  return system;
}

export function useSound() {
  return useApp((s) => s.data.preferences.soundEnabled);
}
