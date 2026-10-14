import { useEffect, useState } from 'react';
import { levelProgress } from '../logic/progression';
import { XpBar } from './ui';

/**
 * Barre de niveau de fin de quête : elle part de l'expérience d'avant la quête
 * et se remplit avec les XP gagnés. Si un niveau est passé, elle se remplit,
 * annonce le nouveau niveau, puis repart.
 */
export function LevelGain({ before, after, reduced }: { before: number; after: number; reduced: boolean }) {
  const from = levelProgress(before);
  const to = levelProgress(after);
  const leveled = to.level > from.level;
  const [phase, setPhase] = useState<'debut' | 'plein' | 'nouveau'>(reduced ? 'nouveau' : 'debut');

  useEffect(() => {
    if (reduced) return;
    const t1 = window.setTimeout(() => setPhase(leveled ? 'plein' : 'nouveau'), 350);
    const t2 = leveled ? window.setTimeout(() => setPhase('nouveau'), 1500) : undefined;
    return () => {
      window.clearTimeout(t1);
      if (t2) window.clearTimeout(t2);
    };
  }, [leveled, reduced]);

  const shown = phase === 'nouveau' ? to : from;
  const ratio = phase === 'debut' ? from.ratio : phase === 'plein' ? 1 : to.ratio;

  return (
    <div className="w-full">
      {leveled && phase === 'nouveau' ? (
        <p className="animate-apparait text-xl font-semibold text-lagon-900">Niveau {to.level} !</p>
      ) : (
        <p className="text-sm font-medium text-encre-700">Niveau {shown.level}</p>
      )}
      <XpBar key={phase === 'nouveau' && leveled ? 'n' : 'a'} ratio={ratio} label={`Expérience vers le niveau ${shown.level + 1}`} className="mt-2" />
      <p className="mt-1 text-right text-xs text-encre-700">
        {phase === 'nouveau' ? to.current : from.current + (phase === 'plein' ? from.needed - from.current : 0)} / {shown.needed} XP
      </p>
    </div>
  );
}
