import { useEffect, useState } from 'react';

// Sablier visuel facultatif : il rend le temps visible, sans chiffres, sans alarme, sans pénalité.

export function Hourglass({ minutes, size = 120 }: { minutes: number; size?: number }) {
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(start);
  const total = Math.max(1, minutes) * 60_000;
  const ratio = Math.min(1, (now - start) / total);
  const finished = ratio >= 1;

  useEffect(() => {
    if (finished) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [finished]);

  // Sable du haut : triangle qui se vide par le haut. Sable du bas : tas qui monte.
  const topLevel = 20 + 52 * ratio; // y du haut de la surface de sable (haut du bulbe = 20, col = 72)
  const topHalf = (y: number) => 34 * ((72 - y) / 52); // demi-largeur du bulbe à la hauteur y
  const w = topHalf(topLevel);
  const bottomHeight = 46 * ratio;
  const pw = 14 + 18 * ratio; // demi-largeur du tas, toujours dans le verre

  return (
    <div className="flex flex-col items-center" role="img" aria-label={finished ? 'Le sablier est écoulé' : 'Sablier en cours'}>
      <svg viewBox="0 0 100 150" width={size * 0.67} height={size} aria-hidden>
        <rect x="10" y="6" width="80" height="10" rx="5" fill="#C98B5B" />
        <rect x="10" y="134" width="80" height="10" rx="5" fill="#C98B5B" />
        <path d="M16 16 H84 Q84 50 54 75 Q84 100 84 134 H16 Q16 100 46 75 Q16 50 16 16 Z" fill="#EEF8FB" stroke="#8CCBC4" strokeWidth="3" />
        {!finished && <path d={`M${50 - w} ${topLevel} H${50 + w} L50 74 Z`} fill="#F2C75C" />}
        {!finished && <line x1="50" y1="74" x2="50" y2={134 - bottomHeight} stroke="#F2C75C" strokeWidth="2" strokeDasharray="2 3" />}
        {bottomHeight > 0 && <path d={`M${50 - pw} 132 Q50 ${132 - bottomHeight * 2} ${50 + pw} 132 Z`} fill="#F2C75C" />}
      </svg>
      <p className="mt-1 text-sm text-encre-700">{finished ? 'Le sable est passé. Prends ton temps.' : 'Le sable coule…'}</p>
    </div>
  );
}
