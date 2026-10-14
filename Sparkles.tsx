import { useReducedMotion } from '../lib/hooks';

/** Petite gerbe d'étincelles, courte (environ 1 seconde). */
export function Sparkles({ burstKey }: { burstKey: number }) {
  const reduced = useReducedMotion();
  if (reduced || !burstKey) return null;
  const pts = [
    [-70, -50, '#FFD66B'], [60, -64, '#FF8FB1'], [-40, -90, '#8CCBC4'], [80, -10, '#FFD66B'], [-84, 0, '#B9A6F2'], [20, -100, '#F6A98A']
  ] as const;
  return (
    <div key={burstKey} className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
      {pts.map(([x, y, c], i) => (
        <svg key={i} width="22" height="22" viewBox="0 0 20 20" className="absolute animate-etincelle" style={{ left: x, top: y, animationDelay: `${i * 60}ms` }}>
          <path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" fill={c} />
        </svg>
      ))}
    </div>
  );
}
