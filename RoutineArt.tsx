import type { IllustrationKey } from '../types';

const BG: Record<IllustrationKey, string> = {
  sac: '#FDE6DC',
  devoirs: '#E6EEFB',
  ranger: '#E5F2DA',
  vaisselle: '#DDF0EE',
  table: '#FBEFD9',
  linge: '#EFE8FB',
  toilettes: '#DDF0EE',
  vetements: '#FDE6DC',
  dejeuner: '#FBEFD9',
  dents: '#E6EEFB',
  douche: '#DDF0EE',
  lit: '#E9E6FB',
  livre: '#E5F2DA',
  animal: '#FBEFD9',
  respirer: '#DDF0EE',
  etoile: '#FFF4D6'
};

export const ILLUSTRATIONS: { key: IllustrationKey; label: string }[] = [
  { key: 'sac', label: 'Sac' },
  { key: 'devoirs', label: 'Cahier' },
  { key: 'ranger', label: 'Rangement' },
  { key: 'vaisselle', label: 'Vaisselle' },
  { key: 'table', label: 'Table' },
  { key: 'linge', label: 'Linge' },
  { key: 'toilettes', label: 'Salle de bain' },
  { key: 'vetements', label: 'Vêtements' },
  { key: 'dejeuner', label: 'Petit-déjeuner' },
  { key: 'dents', label: 'Brosse à dents' },
  { key: 'douche', label: 'Douche' },
  { key: 'lit', label: 'Coucher' },
  { key: 'livre', label: 'Leçon' },
  { key: 'animal', label: 'Animal' },
  { key: 'respirer', label: 'Calme' },
  { key: 'etoile', label: 'Étoile' }
];

function Art({ k }: { k: IllustrationKey }) {
  switch (k) {
    case 'sac':
      return (
        <g>
          <path d="M44 38 Q44 24 60 24 Q76 24 76 38" stroke="#B8532F" strokeWidth="6" fill="none" />
          <rect x="30" y="36" width="60" height="62" rx="16" fill="#E9774F" />
          <rect x="38" y="64" width="44" height="26" rx="8" fill="#F6A98A" />
          <rect x="54" y="60" width="12" height="8" rx="3" fill="#FFD66B" />
          <rect x="34" y="42" width="52" height="10" rx="5" fill="#fff" opacity="0.25" />
        </g>
      );
    case 'devoirs':
      return (
        <g>
          <rect x="26" y="30" width="58" height="68" rx="8" fill="#6F8FD6" />
          <rect x="32" y="30" width="52" height="68" rx="6" fill="#AFC6EE" />
          <path d="M42 50 H74 M42 62 H74 M42 74 H64" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <g transform="rotate(35 86 60)">
            <rect x="80" y="28" width="12" height="54" rx="3" fill="#FFD66B" />
            <path d="M80 82 L86 94 L92 82 Z" fill="#F3D9B1" />
            <rect x="80" y="28" width="12" height="8" rx="3" fill="#FF8FB1" />
          </g>
        </g>
      );
    case 'ranger':
      return (
        <g>
          <circle cx="44" cy="40" r="12" fill="#FF8FB1" />
          <rect x="62" y="28" width="22" height="22" rx="5" fill="#6F8FD6" transform="rotate(12 73 39)" />
          <path d="M26 56 H94 L88 96 H32 Z" fill="#6CA64A" />
          <rect x="22" y="52" width="76" height="12" rx="5" fill="#8CCB6E" />
          <rect x="52" y="72" width="16" height="6" rx="3" fill="#4A7A31" />
        </g>
      );
    case 'vaisselle':
      return (
        <g>
          <ellipse cx="60" cy="88" rx="36" ry="9" fill="#8CCBC4" />
          <ellipse cx="60" cy="78" rx="34" ry="9" fill="#fff" stroke="#8CCBC4" strokeWidth="3" />
          <ellipse cx="60" cy="68" rx="32" ry="9" fill="#fff" stroke="#8CCBC4" strokeWidth="3" />
          <path d="M70 26 h22 l-3 30 h-16 z" fill="#CFEAF6" stroke="#6F8FD6" strokeWidth="3" />
          <circle cx="36" cy="36" r="5" fill="#fff" stroke="#8CCBC4" strokeWidth="2" />
          <circle cx="46" cy="26" r="3" fill="#fff" stroke="#8CCBC4" strokeWidth="2" />
        </g>
      );
    case 'table':
      return (
        <g>
          <rect x="18" y="58" width="84" height="10" rx="4" fill="#C98B5B" />
          <rect x="26" y="68" width="8" height="32" rx="3" fill="#8A5A3B" />
          <rect x="86" y="68" width="8" height="32" rx="3" fill="#8A5A3B" />
          <ellipse cx="60" cy="52" rx="22" ry="7" fill="#fff" stroke="#E8D7BC" strokeWidth="3" />
          <path d="M30 34 V52 M90 34 V52" stroke="#5B6472" strokeWidth="4" strokeLinecap="round" />
          <path d="M26 34 V42 M34 34 V42" stroke="#5B6472" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 'linge':
      return (
        <g>
          <path d="M28 50 H92 L84 98 H36 Z" fill="#C6B4EE" />
          <path d="M36 62 H84 M38 74 H82 M40 86 H80" stroke="#9279D1" strokeWidth="3" />
          <path d="M40 50 Q44 30 60 36 Q70 24 82 40 L84 50 Z" fill="#83B8EA" />
          <path d="M52 44 l8 -10 l6 8" stroke="#FF8FB1" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'toilettes':
      return (
        <g>
          <rect x="62" y="26" width="28" height="34" rx="6" fill="#fff" stroke="#8CCBC4" strokeWidth="3" />
          <path d="M30 60 H88 Q88 86 60 90 Q32 86 30 60 Z" fill="#fff" stroke="#8CCBC4" strokeWidth="3" />
          <rect x="48" y="88" width="24" height="12" rx="3" fill="#fff" stroke="#8CCBC4" strokeWidth="3" />
          <path d="M28 30 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" fill="#FFD66B" />
          <path d="M44 22 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" fill="#FFD66B" />
        </g>
      );
    case 'vetements':
      return (
        <g>
          <path d="M42 28 L30 34 L22 50 L34 56 L38 48 V96 H82 V48 L86 56 L98 50 L90 34 L78 28 Q70 38 60 38 Q50 38 42 28 Z" fill="#E9774F" />
          <path d="M42 28 Q50 38 60 38 Q70 38 78 28" stroke="#B8532F" strokeWidth="3" fill="none" />
          <circle cx="60" cy="66" r="9" fill="#FFD66B" />
        </g>
      );
    case 'dejeuner':
      return (
        <g>
          <path d="M24 58 H96 Q94 92 60 94 Q26 92 24 58 Z" fill="#F6A98A" />
          <ellipse cx="60" cy="58" rx="36" ry="8" fill="#FFF1C4" />
          <circle cx="50" cy="56" r="4" fill="#F2C75C" />
          <circle cx="64" cy="58" r="4" fill="#F2C75C" />
          <circle cx="74" cy="55" r="3" fill="#F2C75C" />
          <rect x="78" y="24" width="8" height="40" rx="4" fill="#8CCBC4" transform="rotate(25 82 44)" />
        </g>
      );
    case 'dents':
      return (
        <g>
          <rect x="24" y="66" width="72" height="14" rx="7" fill="#6F8FD6" transform="rotate(-25 60 73)" />
          <rect x="66" y="36" width="24" height="18" rx="5" fill="#fff" stroke="#AFC6EE" strokeWidth="3" transform="rotate(-25 78 45)" />
          <path d="M70 34 q4 -10 10 -4 q6 -8 10 2" stroke="#8CCBC4" strokeWidth="5" fill="none" strokeLinecap="round" transform="rotate(-25 80 30)" />
          <circle cx="36" cy="36" r="6" fill="#fff" stroke="#AFC6EE" strokeWidth="2" />
          <circle cx="48" cy="26" r="4" fill="#fff" stroke="#AFC6EE" strokeWidth="2" />
        </g>
      );
    case 'douche':
      return (
        <g>
          <path d="M32 24 H66 Q80 24 80 38" stroke="#5B6472" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M64 38 H96 L90 48 H70 Z" fill="#8CCBC4" />
          {[68, 76, 84, 92].map((x, i) => (
            <path key={x} d={`M${x - 2} ${58 + (i % 2) * 8} q3 6 0 9 q-3 -3 0 -9`} fill="#83B8EA" />
          ))}
          <path d="M66 80 q4 8 0 12 q-4 -4 0 -12 M86 84 q4 8 0 12 q-4 -4 0 -12" fill="#83B8EA" />
          <ellipse cx="38" cy="90" rx="14" ry="8" fill="#FFD66B" />
        </g>
      );
    case 'lit':
      return (
        <g>
          <rect x="18" y="62" width="84" height="22" rx="6" fill="#9279D1" />
          <rect x="22" y="56" width="30" height="16" rx="7" fill="#fff" />
          <rect x="18" y="44" width="8" height="54" rx="3" fill="#7A5033" />
          <rect x="94" y="64" width="8" height="34" rx="3" fill="#7A5033" />
          <path d="M84 22 a12 12 0 1 0 10 18 a9 9 0 1 1 -10 -18 Z" fill="#FFD66B" />
          <circle cx="64" cy="30" r="2" fill="#F2C75C" />
          <circle cx="50" cy="40" r="1.6" fill="#F2C75C" />
        </g>
      );
    case 'livre':
      return (
        <g>
          <path d="M60 36 Q42 26 22 30 V88 Q42 84 60 94 Z" fill="#8CCB6E" />
          <path d="M60 36 Q78 26 98 30 V88 Q78 84 60 94 Z" fill="#A9D18B" />
          <path d="M30 44 Q42 42 52 46 M30 56 Q42 54 52 58 M68 46 Q78 42 90 44 M68 58 Q78 54 90 56" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M60 36 V94" stroke="#4A7A31" strokeWidth="3" />
        </g>
      );
    case 'animal':
      return (
        <g>
          <path d="M24 70 H96 L88 94 H32 Z" fill="#E9774F" />
          <ellipse cx="60" cy="70" rx="36" ry="7" fill="#C98B5B" />
          <circle cx="60" cy="40" r="9" fill="#8A5A3B" />
          <circle cx="44" cy="30" r="5" fill="#8A5A3B" />
          <circle cx="54" cy="22" r="5" fill="#8A5A3B" />
          <circle cx="66" cy="22" r="5" fill="#8A5A3B" />
          <circle cx="76" cy="30" r="5" fill="#8A5A3B" />
        </g>
      );
    case 'respirer':
      return (
        <g>
          <circle cx="60" cy="62" r="34" fill="#8CCBC4" opacity="0.35" />
          <circle cx="60" cy="62" r="22" fill="#8CCBC4" opacity="0.6" />
          <path d="M30 40 q12 -8 24 0 t24 0" stroke="#3F8F8C" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M42 86 q10 -6 20 0 t20 0" stroke="#3F8F8C" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M60 52 q-8 10 0 20 q8 -10 0 -20" fill="#6CA64A" />
        </g>
      );
    default:
      return <path d="M60 22 L71 48 L99 50 L77 68 L84 96 L60 81 L36 96 L43 68 L21 50 L49 48 Z" fill="#FFD66B" stroke="#F2A33A" strokeWidth="3" strokeLinejoin="round" />;
  }
}

export function RoutineArt({ illustration, size = 88, className }: { illustration: IllustrationKey; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden>
      <rect width="120" height="120" rx="32" fill={BG[illustration] ?? BG.etoile} />
      <Art k={illustration} />
    </svg>
  );
}
