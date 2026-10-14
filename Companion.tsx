// Les quatre compagnons, dessinés en SVG (créatures originales).
import type { CompanionId } from '../types';
import { Accessory } from './Accessories';

export type Expression = 'content' | 'joie' | 'calme' | 'reflechit' | 'bravo';

interface Palette {
  main: string;
  dark: string;
  light: string;
}

const SPECIES: Record<CompanionId, Palette> = {
  moki: { main: '#F6B5A4', dark: '#E08A76', light: '#FFE4DA' },
  tika: { main: '#7CC48A', dark: '#4F9A63', light: '#DDF1CD' },
  boulon: { main: '#F2C75C', dark: '#CF9A2E', light: '#FFF2C9' },
  lyra: { main: '#A9A3E8', dark: '#7A72C8', light: '#EEECFF' }
};

const VARIANTS: Record<string, Palette> = {
  'couleur-menthe': { main: '#8FD8C4', dark: '#4FA892', light: '#DFF7F0' },
  'couleur-lavande': { main: '#C6B4EE', dark: '#9279D1', light: '#F2ECFD' },
  'couleur-ocean': { main: '#83B8EA', dark: '#4C84C0', light: '#DFECFA' },
  'couleur-miel': { main: '#F4C171', dark: '#D08E36', light: '#FDEDCD' },
  'couleur-nuit': { main: '#6B78AE', dark: '#434D84', light: '#D3D8F1' },
  'couleur-corail': { main: '#F59A7F', dark: '#D46E52', light: '#FFE0D6' },
  'couleur-citron': { main: '#F0DA6A', dark: '#C9AE36', light: '#FFF7C9' },
  'couleur-foret': { main: '#5FAE7A', dark: '#3E8257', light: '#D6EFD9' },
  'couleur-bonbon': { main: '#F5A9C8', dark: '#DB7AA2', light: '#FFE6F0' },
  'couleur-glacier': { main: '#A6D9EA', dark: '#6CB0C9', light: '#E9F7FB' },
  'couleur-galaxie': { main: '#8470D1', dark: '#55449E', light: '#DED6F8' },
  'couleur-or': { main: '#E8C25B', dark: '#B68E2E', light: '#FFF1C7' }
};

export function paletteFor(id: CompanionId, color: string): Palette {
  return VARIANTS[color] ?? SPECIES[id];
}

/** Points d'accroche des accessoires pour chaque espèce. */
export interface Anchors {
  head: { x: number; y: number; w: number };
  neck: { x: number; y: number; w: number };
  eyes: { x: number; y: number };
}

export const ANCHORS: Record<CompanionId, Anchors> = {
  moki: { head: { x: 100, y: 58, w: 96 }, neck: { x: 100, y: 150, w: 112 }, eyes: { x: 100, y: 110 } },
  tika: { head: { x: 100, y: 50, w: 100 }, neck: { x: 100, y: 130, w: 84 }, eyes: { x: 100, y: 92 } },
  boulon: { head: { x: 100, y: 46, w: 108 }, neck: { x: 100, y: 136, w: 72 }, eyes: { x: 100, y: 84 } },
  lyra: { head: { x: 100, y: 60, w: 92 }, neck: { x: 100, y: 138, w: 74 }, eyes: { x: 100, y: 100 } }
};

const INK = '#2B2F3A';

function Face({ x, y, expression, eye = INK, cheeks = true }: { x: number; y: number; expression: Expression; eye?: string; cheeks?: boolean }) {
  const dx = 17;
  const eyes = [-dx, dx].map((o) => {
    const ex = x + o;
    switch (expression) {
      case 'joie':
        return <path key={o} d={`M${ex - 7} ${y + 2} Q${ex} ${y - 8} ${ex + 7} ${y + 2}`} stroke={eye} strokeWidth="3.6" fill="none" strokeLinecap="round" />;
      case 'calme':
        return <path key={o} d={`M${ex - 7} ${y - 1} Q${ex} ${y + 6} ${ex + 7} ${y - 1}`} stroke={eye} strokeWidth="3.4" fill="none" strokeLinecap="round" />;
      case 'reflechit':
        return (
          <g key={o}>
            <ellipse cx={ex + 2} cy={y - 2} rx="6" ry="7.5" fill={eye} />
            <circle cx={ex + 4} cy={y - 6} r="2" fill="#fff" />
          </g>
        );
      case 'bravo':
        return (
          <g key={o}>
            <ellipse cx={ex} cy={y} rx="7.5" ry="9" fill={eye} />
            <circle cx={ex - 2.5} cy={y - 3.5} r="2.6" fill="#fff" />
            <circle cx={ex + 2.5} cy={y + 3} r="1.3" fill="#fff" />
          </g>
        );
      default:
        return (
          <g key={o}>
            <ellipse cx={ex} cy={y} rx="6" ry="8" fill={eye} />
            <circle cx={ex - 2} cy={y - 3} r="2.2" fill="#fff" />
          </g>
        );
    }
  });
  const my = y + 17;
  let mouth;
  switch (expression) {
    case 'joie':
    case 'bravo': {
      const w = expression === 'bravo' ? 11 : 9;
      mouth = (
        <g>
          <path d={`M${x - w} ${my - 2} Q${x} ${my + w + 4} ${x + w} ${my - 2} Z`} fill={eye === INK ? '#5A2E3A' : eye} />
          {eye === INK && <ellipse cx={x} cy={my + w / 2 + 1} rx={w / 2} ry="2.6" fill="#FF8FA3" />}
        </g>
      );
      break;
    }
    case 'calme':
      mouth = <path d={`M${x - 5} ${my} Q${x} ${my + 4} ${x + 5} ${my}`} stroke={eye} strokeWidth="3" fill="none" strokeLinecap="round" />;
      break;
    case 'reflechit':
      mouth = <circle cx={x + 5} cy={my + 1} r="3.2" stroke={eye} strokeWidth="2.8" fill="none" />;
      break;
    default:
      mouth = <path d={`M${x - 7} ${my} Q${x} ${my + 7} ${x + 7} ${my}`} stroke={eye} strokeWidth="3.2" fill="none" strokeLinecap="round" />;
  }
  return (
    <g>
      {cheeks && (
        <>
          <ellipse cx={x - 29} cy={y + 11} rx="7" ry="4.2" fill="#FF8FA3" opacity="0.45" />
          <ellipse cx={x + 29} cy={y + 11} rx="7" ry="4.2" fill="#FF8FA3" opacity="0.45" />
        </>
      )}
      {eyes}
      {mouth}
    </g>
  );
}

function Moki({ p, expression }: { p: Palette; expression: Expression }) {
  const armsUp = expression === 'bravo';
  return (
    <g>
      <ellipse cx="70" cy="64" rx="13" ry="19" fill={p.main} transform="rotate(-24 70 64)" />
      <ellipse cx="130" cy="64" rx="13" ry="19" fill={p.main} transform="rotate(24 130 64)" />
      <ellipse cx="71" cy="67" rx="6" ry="10" fill={p.light} transform="rotate(-24 71 67)" />
      <ellipse cx="129" cy="67" rx="6" ry="10" fill={p.light} transform="rotate(24 129 67)" />
      <ellipse cx={armsUp ? 42 : 38} cy={armsUp ? 96 : 130} rx="9" ry="12" fill={p.dark} transform={armsUp ? 'rotate(30 42 96)' : undefined} />
      <ellipse cx={armsUp ? 158 : 162} cy={armsUp ? 96 : 130} rx="9" ry="12" fill={p.dark} transform={armsUp ? 'rotate(-30 158 96)' : undefined} />
      <path d="M100 54 C142 54 166 90 166 128 C166 160 138 174 100 174 C62 174 34 160 34 128 C34 90 58 54 100 54 Z" fill={p.main} />
      <ellipse cx="100" cy="146" rx="42" ry="24" fill={p.light} opacity="0.75" />
      <ellipse cx="70" cy="84" rx="13" ry="7" fill="#fff" opacity="0.45" transform="rotate(-32 70 84)" />
      <ellipse cx="78" cy="174" rx="14" ry="6" fill={p.dark} />
      <ellipse cx="122" cy="174" rx="14" ry="6" fill={p.dark} />
    </g>
  );
}

function Tika({ p, expression }: { p: Palette; expression: Expression }) {
  const armsUp = expression === 'bravo';
  return (
    <g>
      <path d="M134 150 Q176 152 188 124 Q180 162 134 170 Z" fill={p.main} />
      <ellipse cx="82" cy="52" rx="9" ry="15" fill={p.dark} transform="rotate(-28 82 52)" />
      <ellipse cx="100" cy="45" rx="9" ry="16" fill={p.dark} />
      <ellipse cx="118" cy="52" rx="9" ry="15" fill={p.dark} transform="rotate(28 118 52)" />
      <ellipse cx="100" cy="150" rx="40" ry="28" fill={p.main} />
      <ellipse cx="100" cy="156" rx="25" ry="18" fill={p.light} />
      <ellipse cx={armsUp ? 64 : 66} cy={armsUp ? 122 : 146} rx="8" ry="12" fill={p.dark} transform={armsUp ? 'rotate(35 64 122)' : 'rotate(20 66 146)'} />
      <ellipse cx={armsUp ? 136 : 134} cy={armsUp ? 122 : 146} rx="8" ry="12" fill={p.dark} transform={armsUp ? 'rotate(-35 136 122)' : 'rotate(-20 134 146)'} />
      <ellipse cx="100" cy="94" rx="55" ry="45" fill={p.main} />
      <circle cx="66" cy="74" r="5" fill={p.light} opacity="0.6" />
      <circle cx="134" cy="72" r="4" fill={p.light} opacity="0.6" />
      <circle cx="140" cy="84" r="3" fill={p.light} opacity="0.6" />
      <ellipse cx="80" cy="176" rx="14" ry="6" fill={p.dark} />
      <ellipse cx="120" cy="176" rx="14" ry="6" fill={p.dark} />
    </g>
  );
}

function Boulon({ p, expression }: { p: Palette; expression: Expression }) {
  const armsUp = expression === 'bravo';
  return (
    <g>
      <line x1="100" y1="46" x2="100" y2="26" stroke={p.dark} strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="22" r="7" fill="#F28C6B" />
      <circle cx="98" cy="20" r="2" fill="#fff" opacity="0.7" />
      <path d={armsUp ? 'M70 146 L50 118' : 'M70 148 L52 164'} stroke={p.dark} strokeWidth="9" strokeLinecap="round" />
      <path d={armsUp ? 'M130 146 L150 118' : 'M130 148 L148 164'} stroke={p.dark} strokeWidth="9" strokeLinecap="round" />
      <rect x="68" y="132" width="64" height="40" rx="12" fill={p.main} />
      <circle cx="100" cy="152" r="9" fill={p.light} />
      <path d="M96 152 h8 M100 148 v8" stroke={p.dark} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="74" y="168" width="20" height="10" rx="4" fill={p.dark} />
      <rect x="106" y="168" width="20" height="10" rx="4" fill={p.dark} />
      <rect x="46" y="44" width="108" height="88" rx="26" fill={p.main} />
      <circle cx="46" cy="88" r="9" fill={p.dark} />
      <circle cx="154" cy="88" r="9" fill={p.dark} />
      <rect x="60" y="58" width="80" height="60" rx="16" fill="#26314A" />
      <rect x="64" y="61" width="26" height="7" rx="3.5" fill="#fff" opacity="0.12" />
    </g>
  );
}

function Lyra({ p }: { p: Palette }) {
  return (
    <g>
      <path d="M128 160 C178 162 190 112 162 92 C172 124 152 142 124 142 Z" fill={p.main} />
      <circle cx="163" cy="98" r="11" fill={p.light} />
      <path d="M163 89 L165.5 95.5 L172 98 L165.5 100.5 L163 107 L160.5 100.5 L154 98 L160.5 95.5 Z" fill="#FFD66B" />
      <ellipse cx="100" cy="154" rx="34" ry="25" fill={p.main} />
      <path d="M82 134 Q100 164 118 134 Q100 144 82 134 Z" fill={p.light} />
      <path d="M56 86 L64 32 Q68 26 75 33 L98 66 Z" fill={p.main} />
      <path d="M144 86 L136 32 Q132 26 125 33 L102 66 Z" fill={p.main} />
      <path d="M66 74 L69 44 L86 66 Z" fill={p.light} />
      <path d="M134 74 L131 44 L114 66 Z" fill={p.light} />
      <ellipse cx="100" cy="102" rx="51" ry="44" fill={p.main} />
      <ellipse cx="100" cy="120" rx="28" ry="19" fill={p.light} />
      <path d="M100 64 L102.5 70.5 L109 73 L102.5 75.5 L100 82 L97.5 75.5 L91 73 L97.5 70.5 Z" fill="#FFD66B" />
      <ellipse cx="88" cy="177" rx="11" ry="5" fill={p.dark} />
      <ellipse cx="112" cy="177" rx="11" ry="5" fill={p.dark} />
    </g>
  );
}

export interface CompanionProps {
  id: CompanionId;
  color?: string;
  accessory?: string | null;
  expression?: Expression;
  size?: number;
  className?: string;
  title?: string;
}

export function Companion({ id, color = 'couleur-origine', accessory = null, expression = 'content', size = 160, className, title }: CompanionProps) {
  const p = paletteFor(id, color);
  const a = ANCHORS[id];
  const isRobot = id === 'boulon';
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <ellipse cx="100" cy="184" rx="52" ry="7" fill="#1F2633" opacity="0.08" />
      {id === 'moki' && <Moki p={p} expression={expression} />}
      {id === 'tika' && <Tika p={p} expression={expression} />}
      {id === 'boulon' && <Boulon p={p} expression={expression} />}
      {id === 'lyra' && <Lyra p={p} />}
      <Face x={a.eyes.x} y={a.eyes.y} expression={expression} eye={isRobot ? '#8FF1E2' : INK} cheeks={!isRobot} />
      {accessory && <Accessory id={accessory} anchors={a} />}
    </svg>
  );
}
