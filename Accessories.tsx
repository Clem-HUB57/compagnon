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
    case 'chapeau-paille': {
      const r = head.w * 0.62;
      const c = head.w * 0.34;
      return (
        <g>
          <ellipse cx={head.x} cy={head.y + 4} rx={r} ry="10" fill="#E3BD6A" />
          <path d={`M${head.x - c} ${head.y + 4} Q${head.x - c} ${head.y - 30} ${head.x} ${head.y - 30} Q${head.x + c} ${head.y - 30} ${head.x + c} ${head.y + 4} Z`} fill="#EDCB7E" />
          <rect x={head.x - c} y={head.y - 6} width={c * 2} height="8" fill="#E9774F" />
          <path d={`M${head.x - r + 10} ${head.y + 6} H${head.x + r - 10}`} stroke="#C99B45" strokeWidth="1.5" strokeDasharray="4 4" />
        </g>
      );
    }
    case 'casquette': {
      const r = head.w * 0.4;
      return (
        <g>
          <path d={`M${head.x - r} ${head.y + 8} Q${head.x - r} ${head.y - 30} ${head.x} ${head.y - 30} Q${head.x + r} ${head.y - 30} ${head.x + r} ${head.y + 8} Z`} fill="#4C84C0" />
          <path d={`M${head.x + r - 6} ${head.y + 2} Q${head.x + r + 30} ${head.y} ${head.x + r + 34} ${head.y + 10} L${head.x + r - 6} ${head.y + 10} Z`} fill="#355F91" />
          <circle cx={head.x} cy={head.y - 29} r="4" fill="#355F91" />
          <path d={`M${head.x - 10} ${head.y - 14} h20`} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    }
    case 'noeud-papillon': {
      const y = neck.y;
      return (
        <g>
          <path d={`M${neck.x} ${y} L${neck.x - 22} ${y - 12} L${neck.x - 22} ${y + 12} Z`} fill="#8B6FD8" />
          <path d={`M${neck.x} ${y} L${neck.x + 22} ${y - 12} L${neck.x + 22} ${y + 12} Z`} fill="#8B6FD8" />
          <circle cx={neck.x - 14} cy={y - 2} r="2" fill="#fff" opacity="0.7" />
          <circle cx={neck.x + 14} cy={y + 3} r="2" fill="#fff" opacity="0.7" />
          <rect x={neck.x - 6} y={y - 6} width="12" height="12" rx="4" fill="#6A50B8" />
        </g>
      );
    }
    case 'bonnet-pompon': {
      const r = head.w * 0.42;
      return (
        <g>
          <path d={`M${head.x - r} ${head.y + 10} Q${head.x - r} ${head.y - 32} ${head.x} ${head.y - 32} Q${head.x + r} ${head.y - 32} ${head.x + r} ${head.y + 10} Z`} fill="#E25D5D" />
          <path d={`M${head.x - r + 6} ${head.y - 14} H${head.x + r - 6}`} stroke="#FFF4E6" strokeWidth="5" />
          <rect x={head.x - r - 3} y={head.y + 2} width={r * 2 + 6} height="12" rx="6" fill="#FFF4E6" />
          <circle cx={head.x} cy={head.y - 34} r="9" fill="#FFF4E6" />
        </g>
      );
    }
    case 'bandana': {
      const x0 = neck.x - neck.w / 2 + 4;
      const x1 = neck.x + neck.w / 2 - 4;
      return (
        <g>
          <path d={`M${x0} ${neck.y - 6} Q${neck.x} ${neck.y + 2} ${x1} ${neck.y - 6} L${neck.x} ${neck.y + 26} Z`} fill="#3F7FC4" />
          {[[-12, 2], [8, 4], [-2, 14], [14, -2], [-20, -3]].map(([dx, dy], i) => (
            <circle key={i} cx={neck.x + dx} cy={neck.y + dy} r="2.2" fill="#fff" />
          ))}
        </g>
      );
    }
    case 'lunettes-soleil':
      return (
        <g>
          <rect x={eyes.x - 30} y={eyes.y - 10} width="24" height="19" rx="8" fill="#2B2F3A" />
          <rect x={eyes.x + 6} y={eyes.y - 10} width="24" height="19" rx="8" fill="#2B2F3A" />
          <path d={`M${eyes.x - 6} ${eyes.y - 3} H${eyes.x + 6}`} stroke="#2B2F3A" strokeWidth="4" />
          <path d={`M${eyes.x - 25} ${eyes.y - 4} l6 -3 M${eyes.x + 11} ${eyes.y - 4} l6 -3`} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        </g>
      );
    case 'collier-coquillages': {
      const n = 7;
      return (
        <g>
          <path d={`M${neck.x - neck.w / 2 + 6} ${neck.y - 6} Q${neck.x} ${neck.y + 14} ${neck.x + neck.w / 2 - 6} ${neck.y - 6}`} stroke="#8A5A3B" strokeWidth="2" fill="none" />
          {Array.from({ length: n }, (_, i) => {
            const t = (i + 0.5) / n;
            const x = neck.x - neck.w / 2 + 6 + t * (neck.w - 12);
            const y = neck.y - 6 + Math.sin(t * Math.PI) * 10;
            return <path key={i} d={`M${x - 5} ${y} Q${x} ${y - 9} ${x + 5} ${y} Q${x} ${y + 4} ${x - 5} ${y} Z`} fill={i % 2 ? '#FFD3DF' : '#FFF4E6'} stroke="#E3A9B8" strokeWidth="1" />;
          })}
        </g>
      );
    }
    case 'chapeau-magicien': {
      const r = head.w * 0.5;
      return (
        <g>
          <path d={`M${head.x - 26} ${head.y + 2} L${head.x + 6} ${head.y - 62} L${head.x + 28} ${head.y + 2} Z`} fill="#55449E" />
          <ellipse cx={head.x} cy={head.y + 4} rx={r} ry="9" fill="#433682" />
          <path d={`M${head.x - 3} ${head.y - 26} l3 -7 l3 7 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 z`} fill="#FFD66B" />
          <circle cx={head.x + 10} cy={head.y - 8} r="2.5" fill="#FFD66B" />
          <circle cx={head.x - 12} cy={head.y - 6} r="1.8" fill="#FFD66B" />
        </g>
      );
    }
    case 'antennes': {
      const r = head.w * 0.4;
      return (
        <g>
          <path d={`M${head.x - r} ${head.y + 12} Q${head.x} ${head.y - 14} ${head.x + r} ${head.y + 12}`} stroke="#F06C98" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d={`M${head.x - 14} ${head.y - 1} Q${head.x - 22} ${head.y - 26} ${head.x - 30} ${head.y - 36}`} stroke="#2B2F3A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d={`M${head.x + 14} ${head.y - 1} Q${head.x + 22} ${head.y - 26} ${head.x + 30} ${head.y - 36}`} stroke="#2B2F3A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx={head.x - 30} cy={head.y - 37} r="7" fill="#FF8FB1" />
          <circle cx={head.x + 30} cy={head.y - 37} r="7" fill="#FFD66B" />
        </g>
      );
    }
    case 'couronne': {
      const w = head.w * 0.62;
      const x0 = head.x - w / 2;
      const y = head.y + 4;
      return (
        <g>
          <path d={`M${x0} ${y} L${x0} ${y - 24} L${x0 + w * 0.25} ${y - 12} L${head.x} ${y - 30} L${x0 + w * 0.75} ${y - 12} L${x0 + w} ${y - 24} L${x0 + w} ${y} Z`} fill="#F2C744" stroke="#C99A1E" strokeWidth="2" strokeLinejoin="round" />
          <circle cx={head.x} cy={y - 10} r="4.5" fill="#E9774F" />
          <circle cx={x0 + w * 0.2} cy={y - 7} r="3" fill="#6F8FD6" />
          <circle cx={x0 + w * 0.8} cy={y - 7} r="3" fill="#7CC48A" />
        </g>
      );
    }
    case 'cape': {
      const x0 = neck.x - neck.w / 2;
      const x1 = neck.x + neck.w / 2;
      return (
        <g>
          <path d={`M${x0} ${neck.y - 4} Q${x0 - 22} ${neck.y + 30} ${x0 - 16} ${neck.y + 44} L${x0 + 8} ${neck.y + 30} Z`} fill="#D9473F" />
          <path d={`M${x1} ${neck.y - 4} Q${x1 + 22} ${neck.y + 30} ${x1 + 16} ${neck.y + 44} L${x1 - 8} ${neck.y + 30} Z`} fill="#D9473F" />
          <rect x={x0} y={neck.y - 9} width={neck.w} height="12" rx="6" fill="#B8352E" />
          <circle cx={neck.x} cy={neck.y - 3} r="7" fill="#FFD66B" stroke="#C99A1E" strokeWidth="2" />
        </g>
      );
    }
    case 'chapeau-pirate': {
      const r = head.w * 0.6;
      return (
        <g>
          <path d={`M${head.x - r} ${head.y + 4} Q${head.x - r * 0.6} ${head.y - 34} ${head.x} ${head.y - 32} Q${head.x + r * 0.6} ${head.y - 34} ${head.x + r} ${head.y + 4} Q${head.x} ${head.y - 8} ${head.x - r} ${head.y + 4} Z`} fill="#2B2F3A" />
          <path d={`M${head.x - r} ${head.y + 4} Q${head.x} ${head.y - 8} ${head.x + r} ${head.y + 4}`} stroke="#E8C25B" strokeWidth="3" fill="none" />
          <circle cx={head.x} cy={head.y - 18} r="6" fill="#FFF4E6" />
          <path d={`M${head.x - 8} ${head.y - 8} l16 -0 M${head.x - 3} ${head.y - 18} h0.1 M${head.x + 3} ${head.y - 18} h0.1`} stroke="#2B2F3A" strokeWidth="2.5" strokeLinecap="round" />
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
      'couleur-nuit': '#6B78AE',
      'couleur-corail': '#F59A7F',
      'couleur-citron': '#F0DA6A',
      'couleur-foret': '#5FAE7A',
      'couleur-bonbon': '#F5A9C8',
      'couleur-glacier': '#A6D9EA',
      'couleur-galaxie': 'radial-gradient(circle at 30% 30%,#fff 1px,transparent 2px),#8470D1',
      'couleur-or': 'linear-gradient(135deg,#FFF1C7,#E8C25B 50%,#B68E2E)'
    };
    return <span className="block h-12 w-12 rounded-full border-4 border-white shadow" style={{ background: colors[id] ?? '#ddd' }} aria-hidden />;
  }
  if (kind === 'ambiance') {
    const bg: Record<string, string> = {
      'ambiance-jour': 'linear-gradient(#BFE2F5,#EAF6FB)',
      'ambiance-coucher': 'linear-gradient(#F7A98A,#F8DDBE)',
      'ambiance-etoiles': 'radial-gradient(circle at 30% 30%,#fff 1px,transparent 2px),radial-gradient(circle at 70% 60%,#fff 1px,transparent 2px),linear-gradient(#202B52,#3E4C7D)',
      'ambiance-aurore': 'linear-gradient(160deg,#20304F 30%,#4FD1A5 55%,#8B6FD8 75%,#20304F)',
      'ambiance-lucioles': 'radial-gradient(circle at 40% 60%,#FFE27A 2px,transparent 3px),radial-gradient(circle at 70% 40%,#FFE27A 2px,transparent 3px),linear-gradient(#5B5487,#E3A98C)',
      'ambiance-aube': 'linear-gradient(#F6B9C8,#FDE7D3)',
      'ambiance-neige': 'radial-gradient(circle at 30% 40%,#fff 2px,transparent 3px),radial-gradient(circle at 70% 25%,#fff 2px,transparent 3px),radial-gradient(circle at 55% 70%,#fff 2px,transparent 3px),linear-gradient(#BCD3E6,#F4F8FB)',
      'ambiance-bonbon': 'linear-gradient(#F9C6E0,#FDEFF6)',
      'ambiance-galaxie': 'radial-gradient(circle at 70% 35%,#F2B66B 5px,transparent 6px),radial-gradient(circle at 25% 60%,#fff 1px,transparent 2px),linear-gradient(#1A1240,#3B2A73)',
      'ambiance-feu-artifice': 'radial-gradient(circle at 30% 35%,#FF8FB1 3px,transparent 4px),radial-gradient(circle at 70% 30%,#FFD66B 3px,transparent 4px),linear-gradient(#141B3A,#2C3767)'
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
    case 'feu-camp':
      return (
        <g>
          <path d="M14 50 L46 42 M14 42 L46 50" stroke="#8A5A3B" strokeWidth="6" strokeLinecap="round" />
          <path d="M30 14 Q42 30 36 42 Q30 46 24 42 Q18 30 30 14 Z" fill="#F28C38" />
          <path d="M30 26 Q36 34 33 41 Q30 43 27 41 Q24 34 30 26 Z" fill="#FFD66B" />
        </g>
      );
    case 'chateau-sable':
      return (
        <g fill="#E9CF98" stroke="#C9A86A" strokeWidth="2">
          <rect x="12" y="30" width="36" height="22" />
          <rect x="8" y="20" width="14" height="32" />
          <rect x="38" y="20" width="14" height="32" />
          <path d="M30 8 V22" stroke="#8A5A3B" />
          <path d="M30 8 l10 4 l-10 4 z" fill="#E9774F" stroke="none" />
        </g>
      );
    case 'balancoire':
      return (
        <g>
          <path d="M8 10 H52" stroke="#8A5A3B" strokeWidth="6" strokeLinecap="round" />
          <path d="M20 10 V44 M40 10 V44" stroke="#5B6472" strokeWidth="2" />
          <rect x="16" y="43" width="28" height="6" rx="3" fill="#E9774F" />
        </g>
      );
    case 'tresor':
      return (
        <g>
          <rect x="10" y="28" width="40" height="24" rx="3" fill="#A86B3C" />
          <path d="M10 30 Q30 8 50 30 Z" fill="#8A5A3B" />
          <rect x="10" y="28" width="40" height="5" fill="#E8C25B" />
          <rect x="26" y="30" width="8" height="10" rx="2" fill="#E8C25B" />
        </g>
      );
    case 'parasol':
      return (
        <g>
          <path d="M30 22 V54" stroke="#8A5A3B" strokeWidth="3" />
          <path d="M6 26 Q30 0 54 26 Z" fill="#E9774F" />
          <path d="M18 26 Q30 4 42 26" fill="#FFF4E6" />
          <path d="M26 26 Q30 6 34 26" fill="#E9774F" />
        </g>
      );
    case 'mouettes':
      return (
        <g stroke="#3A4250" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M8 28 q7 -8 14 0 q7 -8 14 0" />
          <path d="M30 44 q5 -6 10 0 q5 -6 10 0" />
        </g>
      );
    case 'etoile-mer':
      return <path d="M30 8 L36 24 L53 25 L40 36 L45 52 L30 43 L15 52 L20 36 L7 25 L24 24 Z" fill="#F28C6E" stroke="#D46E52" strokeWidth="2" strokeLinejoin="round" />;
    case 'bouee':
      return (
        <g>
          <circle cx="30" cy="30" r="18" fill="none" stroke="#fff" strokeWidth="10" />
          <circle cx="30" cy="30" r="18" fill="none" stroke="#E25D5D" strokeWidth="10" strokeDasharray="14 14" />
        </g>
      );
    case 'guirlande':
      return (
        <g>
          <path d="M4 16 Q30 40 56 16" stroke="#5B6472" strokeWidth="1.5" fill="none" />
          {[[12, 23, '#FFD66B'], [22, 29, '#FF8FB1'], [32, 30, '#8FD8C4'], [42, 27, '#FFD66B'], [50, 21, '#B9A6F2']].map(([x, y, c], i) => (
            <circle key={i} cx={x as number} cy={(y as number) + 3} r="4" fill={c as string} />
          ))}
        </g>
      );
    default:
      return <circle cx="30" cy="30" r="16" fill="#E8D7BC" />;
  }
}
