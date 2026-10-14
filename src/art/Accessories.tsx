import type { Anchors } from './Companion';

// Accessoires dessinés autour des points d'accroche de chaque compagnon.
export function Accessory({ id, anchors }: { id: string; anchors: Anchors }) {
  const { head, neck, eyes } = anchors;
  switch (id) {
    case 'echarpe': {
      const x0 = neck.x - neck.w / 2;
      return (
        <g>
          <rect x={neck.x + neck.w / 5} y={neck.y} width="15" height="30" rx="6" fill="#D9643D" transform={`rotate(12 ${neck.x + neck.w / 5} ${neck.y})`} />
          <rect x={x0} y={neck.y - 8} width={neck.w} height="16" rx="8" fill="#E9774F" />
          {[0.18, 0.42, 0.66].map((f) => (
            <rect key={f} x={x0 + neck.w * f} y={neck.y - 8} width="7" height="16" fill="#FFF4E6" opacity="0.7" />
          ))}
        </g>
      );
    }
    case 'bonnet-aviateur': {
      const r = head.w * 0.42;
      return (
        <g>
          <path d={`M${head.x - r} ${head.y + 14} Q${head.x - r} ${head.y - 34} ${head.x} ${head.y - 34} Q${head.x + r} ${head.y - 34} ${head.x + r} ${head.y + 14} Z`} fill="#8B5E3C" />
          <ellipse cx={head.x - r + 2} cy={head.y + 18} rx="9" ry="14" fill="#7A5033" />
          <ellipse cx={head.x + r - 2} cy={head.y + 18} rx="9" ry="14" fill="#7A5033" />
          <rect x={head.x - r} y={head.y - 14} width={r * 2} height="7" rx="3.5" fill="#5B4A3A" />
          <circle cx={head.x - 12} cy={head.y - 11} r="9" fill="#BFE6F5" stroke="#5B4A3A" strokeWidth="3" />
          <circle cx={head.x + 12} cy={head.y - 11} r="9" fill="#BFE6F5" stroke="#5B4A3A" strokeWidth="3" />
          <circle cx={head.x - 15} cy={head.y - 14} r="2.5" fill="#fff" />
          <circle cx={head.x + 9} cy={head.y - 14} r="2.5" fill="#fff" />
        </g>
      );
    }
    case 'casque-chantier': {
      const r = head.w * 0.4;
      return (
        <g>
          <path d={`M${head.x - r} ${head.y + 6} Q${head.x - r} ${head.y - 36} ${head.x} ${head.y - 36} Q${head.x + r} ${head.y - 36} ${head.x + r} ${head.y + 6} Z`} fill="#F5C542" />
          <rect x={head.x - r - 12} y={head.y + 2} width={r * 2 + 24} height="10" rx="5" fill="#E2AE25" />
          <rect x={head.x - 5} y={head.y - 34} width="10" height="36" rx="5" fill="#E2AE25" />
          <ellipse cx={head.x - r / 2} cy={head.y - 18} rx="6" ry="9" fill="#fff" opacity="0.35" />
        </g>
      );
    }
    case 'couronne-fleurs': {
      const colors = ['#FF8FB1', '#FFD66B', '#FFFFFF', '#FF8FB1', '#FFD66B'];
      const r = head.w * 0.42;
      return (
        <g>
          <path d={`M${head.x - r} ${head.y + 8} Q${head.x} ${head.y - 14} ${head.x + r} ${head.y + 8}`} stroke="#6CA64A" strokeWidth="5" fill="none" strokeLinecap="round" />
          {colors.map((c, i) => {
            const t = i / (colors.length - 1);
            const fx = head.x - r + t * r * 2;
            const fy = head.y + 8 - Math.sin(t * Math.PI) * 11;
            return (
              <g key={i}>
                {[0, 72, 144, 216, 288].map((ang) => (
                  <circle key={ang} cx={fx + Math.cos((ang * Math.PI) / 180) * 5} cy={fy + Math.sin((ang * Math.PI) / 180) * 5} r="4" fill={c} />
                ))}
                <circle cx={fx} cy={fy} r="3" fill="#F2A33A" />
              </g>
            );
          })}
        </g>
      );
    }
    case 'casque-audio': {
      const r = head.w * 0.5;
      return (
        <g>
          <path d={`M${head.x - r + 4} ${head.y + 34} Q${head.x - r} ${head.y - 30} ${head.x} ${head.y - 30} Q${head.x + r} ${head.y - 30} ${head.x + r - 4} ${head.y + 34}`} stroke="#3A4250" strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x={head.x - r - 8} y={head.y + 22} width="18" height="30" rx="9" fill="#E9774F" />
          <rect x={head.x + r - 10} y={head.y + 22} width="18" height="30" rx="9" fill="#E9774F" />
        </g>
      );
    }
    case 'lunettes':
      return (
        <g>
          <circle cx={eyes.x - 17} cy={eyes.y} r="12.5" fill="#fff" opacity="0.18" stroke="#3A4250" strokeWidth="3" />
          <circle cx={eyes.x + 17} cy={eyes.y} r="12.5" fill="#fff" opacity="0.18" stroke="#3A4250" strokeWidth="3" />
          <path d={`M${eyes.x - 5} ${eyes.y - 1} Q${eyes.x} ${eyes.y - 5} ${eyes.x + 5} ${eyes.y - 1}`} stroke="#3A4250" strokeWidth="3" fill="none" />
        </g>
      );
    case 'noeud': {
      const bx = head.x + head.w * 0.28;
      const by = head.y + 4;
      return (
        <g>
          <path d={`M${bx} ${by} L${bx - 18} ${by - 11} L${bx - 18} ${by + 11} Z`} fill="#FF8FB1" />
          <path d={`M${bx} ${by} L${bx + 18} ${by - 11} L${bx + 18} ${by + 11} Z`} fill="#FF8FB1" />
          <circle cx={bx} cy={by} r="6" fill="#F06C98" />
        </g>
      );
    }
    default:
      return null;
  }
}

/** Petite vignette d'un objet pour la cabane (couleurs, décors, ambiances). */
export function CosmeticThumb({ id, kind }: { id: string; kind: string }) {
  if (kind === 'couleur') {
    const colors: Record<string, string> = {
      'couleur-origine': 'conic-gradient(#F6B5A4 0 25%, #7CC48A 0 50%, #F2C75C 0 75%, #A9A3E8 0)',
      'couleur-menthe': '#8FD8C4',
      'couleur-lavande': '#C6B4EE',
      'couleur-ocean': '#83B8EA',
      'couleur-miel': '#F4C171',
      'couleur-nuit': '#6B78AE'
    };
    return <span className="block h-12 w-12 rounded-full border-4 border-white shadow" style={{ background: colors[id] ?? '#ddd' }} aria-hidden />;
  }
  if (kind === 'ambiance') {
    const bg: Record<string, string> = {
      'ambiance-jour': 'linear-gradient(#BFE2F5,#EAF6FB)',
      'ambiance-coucher': 'linear-gradient(#F7A98A,#F8DDBE)',
      'ambiance-etoiles': 'radial-gradient(circle at 30% 30%,#fff 1px,transparent 2px),radial-gradient(circle at 70% 60%,#fff 1px,transparent 2px),linear-gradient(#202B52,#3E4C7D)',
      'ambiance-aurore': 'linear-gradient(160deg,#20304F 30%,#4FD1A5 55%,#8B6FD8 75%,#20304F)',
      'ambiance-lucioles': 'radial-gradient(circle at 40% 60%,#FFE27A 2px,transparent 3px),radial-gradient(circle at 70% 40%,#FFE27A 2px,transparent 3px),linear-gradient(#5B5487,#E3A98C)'
    };
    return <span className="block h-12 w-16 rounded-xl border-4 border-white shadow" style={{ background: bg[id] ?? '#ddd' }} aria-hidden />;
  }
  return (
    <svg viewBox="0 0 60 60" width="56" height="56" aria-hidden>
      <DecorIcon id={id} />
    </svg>
  );
}

function DecorIcon({ id }: { id: string }) {
  switch (id) {
    case 'lanterne':
      return (
        <g>
          <circle cx="30" cy="30" r="18" fill="#FFE59A" opacity="0.5" />
          <rect x="21" y="20" width="18" height="22" rx="5" fill="#FFD66B" stroke="#8A5A3B" strokeWidth="3" />
          <path d="M24 20 Q30 10 36 20" stroke="#8A5A3B" strokeWidth="3" fill="none" />
        </g>
      );
    case 'fleurs':
      return (
        <g>
          <path d="M18 48 V34 M30 48 V28 M42 48 V34" stroke="#6CA64A" strokeWidth="3" />
          <circle cx="18" cy="32" r="6" fill="#FF8FB1" />
          <circle cx="30" cy="26" r="7" fill="#FFD66B" />
          <circle cx="42" cy="32" r="6" fill="#B9A6F2" />
        </g>
      );
    case 'hamac':
      return (
        <g>
          <path d="M10 18 V50 M50 18 V50" stroke="#8A5A3B" strokeWidth="4" strokeLinecap="round" />
          <path d="M10 24 Q30 46 50 24" stroke="#E9774F" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'cerf-volant':
      return (
        <g>
          <path d="M30 6 L44 22 L30 40 L16 22 Z" fill="#E9774F" />
          <path d="M30 6 V40 M16 22 H44" stroke="#fff" strokeWidth="2" />
          <path d="M30 40 Q34 46 28 50 Q24 54 30 58" stroke="#5B6472" strokeWidth="2" fill="none" />
        </g>
      );
    case 'longue-vue':
      return (
        <g>
          <rect x="10" y="18" width="34" height="10" rx="4" fill="#C98B5B" transform="rotate(-20 27 23)" />
          <path d="M28 30 L20 52 M28 30 L36 52 M28 30 V52" stroke="#8A5A3B" strokeWidth="3" />
        </g>
      );
    case 'potager':
      return (
        <g>
          <ellipse cx="30" cy="46" rx="24" ry="8" fill="#9C6B45" />
          <path d="M18 42 Q14 32 20 30 M30 40 Q26 28 33 26 M42 42 Q40 32 46 32" stroke="#6CA64A" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return <circle cx="30" cy="30" r="16" fill="#E8D7BC" />;
  }
}
