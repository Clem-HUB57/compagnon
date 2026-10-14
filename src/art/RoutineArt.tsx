import type { IllustrationKey } from '../types';

const BG: Record<IllustrationKey, string> = {
  sac: '#FDE6DC',
  devoirs: '#E6EEFB',
  ranger: '#E5F2DA',
  vaisselle: '#DDF0EE',
  table: '#FBEFD9',
  linge: '#EFE8FB',
  toilettes: '#DDF0EE',
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
