// L'île du compagnon : elle évolue par paliers et selon les objets gagnés.

interface IslandProps {
  stage: number;
  ambiance: string;
  decor: string[];
  animate?: boolean;
  className?: string;
  /** Élément à mettre en valeur (apparition animée), ex. « stage-2 » ou « lanterne ». */
  highlight?: string | null;
}

const SKIES: Record<string, { top: string; bottom: string; sea: string; seaLine: string; night: boolean }> = {
  'ambiance-jour': { top: '#BFE2F5', bottom: '#EEF8FB', sea: '#7CC6CF', seaLine: '#A8DDE2', night: false },
  'ambiance-coucher': { top: '#F4A588', bottom: '#F9E3C6', sea: '#7FB3C9', seaLine: '#F6C8A8', night: false },
  'ambiance-etoiles': { top: '#1E2850', bottom: '#3E4C7D', sea: '#2F4C74', seaLine: '#4C6C98', night: true },
  'ambiance-aurore': { top: '#182844', bottom: '#2E4468', sea: '#28476A', seaLine: '#4FD1A5', night: true },
  'ambiance-lucioles': { top: '#4E4880', bottom: '#E0A88E', sea: '#5A7FA0', seaLine: '#8EA9C4', night: false },
  'ambiance-aube': { top: '#F6B9C8', bottom: '#FDE7D3', sea: '#86C1D0', seaLine: '#F7CDBF', night: false },
  'ambiance-neige': { top: '#BCD3E6', bottom: '#F4F8FB', sea: '#8FB8CC', seaLine: '#C6DCE7', night: false },
  'ambiance-bonbon': { top: '#F9C6E0', bottom: '#FDEFF6', sea: '#9FD6E0', seaLine: '#F8D3E6', night: false },
  'ambiance-galaxie': { top: '#1A1240', bottom: '#3B2A73', sea: '#2B2F6B', seaLine: '#6A5AC9', night: true },
  'ambiance-feu-artifice': { top: '#141B3A', bottom: '#2C3767', sea: '#24365E', seaLine: '#4B5F94', night: true }
};

const STARRY = ['ambiance-etoiles', 'ambiance-aurore', 'ambiance-galaxie', 'ambiance-feu-artifice'];

function Pop({ show, children, delay = 0 }: { show: boolean; children: React.ReactNode; delay?: number }) {
  return (
    <g className={show ? 'island-pop' : undefined} style={show ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </g>
  );
}

export function Island({ stage, ambiance, decor, animate = true, className, highlight = null }: IslandProps) {
  const sky = SKIES[ambiance] ?? SKIES['ambiance-jour'];
  const has = (d: string) => decor.includes(d);
  const hl = (key: string) => highlight === key;
  const glow = sky.night ? 1 : 0.55;
  return (
    <svg viewBox="0 0 400 260" className={className} role="img" aria-label="Ton île">
      <defs>
        <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
        <radialGradient id="halo">
          <stop offset="0" stopColor="#FFE38A" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFE38A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill="url(#ciel)" />

      {/* Ciel */}
      {ambiance === 'ambiance-jour' && (
        <g>
          <circle cx="336" cy="48" r="22" fill="#FFE39A" />
          <g fill="#fff" opacity="0.9" className={animate ? 'nuage' : undefined}>
            <ellipse cx="80" cy="50" rx="30" ry="11" />
            <ellipse cx="100" cy="42" rx="20" ry="11" />
            <ellipse cx="236" cy="72" rx="24" ry="8" />
          </g>
        </g>
      )}
      {ambiance === 'ambiance-coucher' && <circle cx="320" cy="150" r="30" fill="#FF9F6E" opacity="0.9" />}
      {STARRY.includes(ambiance) && (
        <g fill="#fff">
          {[
            [40, 30], [90, 60], [140, 24], [200, 50], [250, 22], [300, 64], [360, 34], [70, 100], [330, 110], [180, 90]
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.2} opacity="0.9" />
          ))}
          {(ambiance === 'ambiance-etoiles' || ambiance === 'ambiance-aurore') && <path d="M346 40 a16 16 0 1 0 14 24 a12 12 0 1 1 -14 -24 Z" fill="#FFF3C4" />}
        </g>
      )}
      {ambiance === 'ambiance-aube' && (
        <g>
          <circle cx="70" cy="168" r="26" fill="#FFB38A" opacity="0.9" />
          <ellipse cx="250" cy="60" rx="40" ry="9" fill="#fff" opacity="0.6" />
        </g>
      )}
      {ambiance === 'ambiance-bonbon' && (
        <g className={animate ? 'nuage' : undefined}>
          {[[80, 50, '#fff'], [230, 70, '#FFD3E6'], [320, 40, '#E6DBFF']].map(([x, y, c], i) => (
            <g key={i} fill={c as string}>
              <ellipse cx={x as number} cy={y as number} rx="28" ry="10" />
              <ellipse cx={(x as number) + 16} cy={(y as number) - 7} rx="16" ry="10" />
            </g>
          ))}
        </g>
      )}
      {ambiance === 'ambiance-galaxie' && (
        <g>
          <circle cx="320" cy="58" r="16" fill="#F2B66B" />
          <ellipse cx="320" cy="58" rx="28" ry="6" fill="none" stroke="#FFE0A8" strokeWidth="3" transform="rotate(-18 320 58)" />
          <circle cx="90" cy="70" r="7" fill="#8FD8C4" />
          <path d="M0 120 Q120 40 400 90" stroke="#B9A6F2" strokeWidth="18" opacity="0.15" fill="none" />
        </g>
      )}
      {ambiance === 'ambiance-feu-artifice' && (
        <g strokeLinecap="round" strokeWidth="3">
          {[[90, 60, '#FF8FB1'], [250, 40, '#FFD66B'], [340, 96, '#8FD8C4']].map(([x, y, c], i) => (
            <g key={i} stroke={c as string} className={animate ? 'luciole' : undefined} style={{ animationDelay: `${i * 0.9}s` }}>
              {Array.from({ length: 10 }, (_, k) => {
                const a = (k / 10) * Math.PI * 2;
                return <path key={k} d={`M${(x as number) + Math.cos(a) * 8} ${(y as number) + Math.sin(a) * 8} L${(x as number) + Math.cos(a) * 20} ${(y as number) + Math.sin(a) * 20}`} />;
              })}
            </g>
          ))}
        </g>
      )}
      {ambiance === 'ambiance-neige' && (
        <g fill="#fff" className={animate ? 'nuage' : undefined}>
          {[[30, 40], [80, 90], [130, 30], [170, 120], [220, 60], [260, 110], [300, 30], [350, 80], [380, 140], [110, 150]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 2.5 : 3.5} opacity="0.9" />
          ))}
        </g>
      )}

      {/* Arc-en-ciel (palier 11) */}
      {stage >= 11 && (
        <Pop show={hl('stage-11')}>
          <g fill="none" opacity="0.55" strokeWidth="7">
            {['#E25D5D', '#F28C38', '#F2C744', '#6CA64A', '#4C84C0', '#8B6FD8'].map((c, i) => (
              <path key={c} d={`M${30 + i * 7} 190 A${170 - i * 7} ${150 - i * 7} 0 0 1 ${370 - i * 7} 190`} stroke={c} />
            ))}
          </g>
        </Pop>
      )}

      {/* Montgolfière (palier 7) */}
      {stage >= 7 && (
        <Pop show={hl('stage-7')}>
          <g className={animate ? 'flotte' : undefined}>
            <ellipse cx="128" cy="40" rx="18" ry="22" fill="#E9774F" />
            <path d="M128 18 Q118 40 128 62 Q138 40 128 18" fill="#FFD66B" />
            <path d="M116 56 L122 70 M140 56 L134 70" stroke="#8A5A3B" strokeWidth="1.5" />
            <rect x="121" y="70" width="14" height="10" rx="2" fill="#A86B3C" />
          </g>
        </Pop>
      )}

      {/* Mouettes */}
      {has('mouettes') && (
        <Pop show={hl('mouettes')}>
          <g stroke={sky.night ? '#E6E9F5' : '#3A4250'} strokeWidth="2.5" fill="none" strokeLinecap="round" className={animate ? 'nuage' : undefined}>
            <path d="M206 36 q6 -7 12 0 q6 -7 12 0" />
            <path d="M234 24 q4 -5 8 0 q4 -5 8 0" />
            <path d="M284 92 q5 -6 10 0 q5 -6 10 0" />
          </g>
        </Pop>
      )}
      {ambiance === 'ambiance-aurore' && (
        <g opacity="0.45">
          <path d="M0 70 Q100 20 200 60 T400 40 V90 Q300 110 200 90 T0 110 Z" fill="#4FD1A5" />
          <path d="M0 100 Q120 60 220 96 T400 80 V112 Q300 130 200 116 T0 130 Z" fill="#8B6FD8" />
        </g>
      )}

      {/* Mer */}
      <rect y="176" width="400" height="84" fill={sky.sea} />
      <g stroke={sky.seaLine} strokeWidth="3" strokeLinecap="round" fill="none" className={animate ? 'vagues' : undefined}>
        <path d="M20 206 q10 -6 20 0 t20 0" />
        <path d="M330 236 q10 -6 20 0 t20 0" />
        <path d="M70 244 q10 -6 20 0 t20 0" />
        <path d="M352 196 q8 -5 16 0 t16 0" />
      </g>

      {/* Îlot voisin et pont (palier 5) */}
      {stage >= 5 && (
        <Pop show={hl('stage-5')}>
          <path d="M300 196 Q318 186 336 196" stroke="#8A5A3B" strokeWidth="4" fill="none" />
          <path d="M300 200 Q318 190 336 200" stroke="#C98B5B" strokeWidth="6" strokeDasharray="5 3" fill="none" />
          <ellipse cx="366" cy="202" rx="34" ry="12" fill="#F2DDAE" />
          <ellipse cx="366" cy="196" rx="28" ry="9" fill="#A9D18B" />
          <path d="M368 194 Q366 168 372 150" stroke="#8A5A3B" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M372 150 q-22 -2 -30 10 M372 150 q22 -4 28 10 M372 150 q-8 -16 -24 -14 M372 150 q10 -16 24 -12" stroke="#6CA64A" strokeWidth="6" fill="none" strokeLinecap="round" />
        </Pop>
      )}

      {/* Observatoire sur l'îlot (palier 9) */}
      {stage >= 9 && (
        <Pop show={hl('stage-9')}>
          <rect x="336" y="178" width="20" height="14" fill="#E8E2D6" />
          <path d="M334 180 A12 12 0 0 1 358 180 Z" fill="#F7F3EA" stroke="#B9B1A3" strokeWidth="1.5" />
          <rect x="344" y="168" width="4" height="10" fill="#5B6472" transform="rotate(30 346 173)" />
          <rect x="342" y="184" width="6" height="8" rx="2" fill="#7A4C2F" />
        </Pop>
      )}

      {/* Phare sur son rocher (palier 6) */}
      {stage >= 6 && (
        <Pop show={hl('stage-6')}>
          {sky.night && <path d="M26 144 L150 118 L150 166 Z" fill="#FFE38A" opacity="0.25" />}
          <ellipse cx="26" cy="216" rx="24" ry="8" fill="#8C8C9A" />
          <ellipse cx="22" cy="212" rx="14" ry="5" fill="#A3A3B0" />
          <path d="M16 212 L19 152 L33 152 L36 212 Z" fill="#FFF4E6" />
          <path d="M17 194 L35 194 L35.6 204 L16.4 204 Z M18 170 L34 170 L34.5 180 L17.5 180 Z" fill="#E25D5D" />
          <rect x="17" y="140" width="18" height="13" rx="2" fill={sky.night ? '#FFE07A' : '#FFF3C4'} stroke="#5B6472" strokeWidth="2" />
          <path d="M14 141 L26 128 L38 141 Z" fill="#E25D5D" />
        </Pop>
      )}

      {/* Île principale */}
      <ellipse cx="180" cy="198" rx="146" ry="30" fill="#E9CF98" />
      <ellipse cx="180" cy="190" rx="140" ry="28" fill="#F2DDAE" />
      <ellipse cx="180" cy="180" rx="122" ry="22" fill="#A9D18B" />
      <ellipse cx="160" cy="176" rx="70" ry="10" fill="#B9DC9C" />
      {ambiance === 'ambiance-neige' && <ellipse cx="176" cy="176" rx="112" ry="15" fill="#FFFFFF" opacity="0.75" />}
      <ellipse cx="66" cy="198" rx="10" ry="5" fill="#C9B48A" />
      <ellipse cx="292" cy="200" rx="7" ry="4" fill="#C9B48A" />

      {/* Ponton et barque (palier 4) */}
      {stage >= 4 && (
        <Pop show={hl('stage-4')}>
          <rect x="262" y="198" width="62" height="9" rx="2" fill="#C98B5B" />
          {[270, 288, 306].map((x) => (
            <rect key={x} x={x} y="204" width="5" height="18" fill="#8A5A3B" />
          ))}
          <path d="M318 226 h40 l-8 10 h-24 z" fill="#E9774F" />
          <rect x="326" y="222" width="24" height="5" rx="2" fill="#B8532F" />
        </Pop>
      )}

      {/* Voilier (palier 8) */}
      {stage >= 8 && (
        <Pop show={hl('stage-8')}>
          <g className={animate ? 'flotte' : undefined}>
            <path d="M40 246 h44 l-8 9 h-28 z" fill="#4C84C0" />
            <path d="M61 246 V214" stroke="#8A5A3B" strokeWidth="2.5" />
            <path d="M63 216 L80 242 L63 242 Z" fill="#FFF4E6" />
            <path d="M59 220 L46 242 L59 242 Z" fill="#FFD66B" />
          </g>
        </Pop>
      )}

      {/* Baleine amie (palier 10) */}
      {stage >= 10 && (
        <Pop show={hl('stage-10')}>
          <path d="M206 252 Q214 234 238 236 Q256 238 260 250 Z" fill="#5C7FB8" />
          <path d="M258 248 l10 -10 l2 8 l8 -4 l-6 10 z" fill="#5C7FB8" />
          <circle cx="222" cy="244" r="2" fill="#1F2633" />
          <path d="M232 234 q-2 -8 -8 -12 M232 234 q2 -9 8 -12 M232 234 v-12" stroke="#BFE6F5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </Pop>
      )}

      {/* Coffre au trésor */}
      {has('tresor') && (
        <Pop show={hl('tresor')}>
          <rect x="70" y="200" width="20" height="12" rx="2" fill="#A86B3C" />
          <path d="M70 201 Q80 191 90 201 Z" fill="#8A5A3B" />
          <rect x="70" y="200" width="20" height="2.5" fill="#E8C25B" />
          <rect x="78" y="201" width="4" height="5" rx="1" fill="#E8C25B" />
        </Pop>
      )}

      {/* Château de sable */}
      {has('chateau-sable') && (
        <Pop show={hl('chateau-sable')}>
          <g fill="#E3C487" stroke="#C9A86A" strokeWidth="1">
            <rect x="104" y="206" width="20" height="10" />
            <rect x="101" y="200" width="7" height="16" />
            <rect x="120" y="200" width="7" height="16" />
          </g>
          <path d="M114 196 v10" stroke="#8A5A3B" strokeWidth="1.2" />
          <path d="M114 196 l6 2.5 l-6 2.5 z" fill="#E9774F" />
        </Pop>
      )}

      {/* Étoile de mer */}
      {has('etoile-mer') && (
        <Pop show={hl('etoile-mer')}>
          <path d="M242 204 L244 209 L249.5 209.3 L245.3 212.6 L246.8 218 L242 215 L237.2 218 L238.7 212.6 L234.5 209.3 L240 209 Z" fill="#F28C6E" />
        </Pop>
      )}

      {/* Feu de camp */}
      {has('feu-camp') && (
        <Pop show={hl('feu-camp')}>
          <circle cx="206" cy="196" r="16" fill="url(#halo)" opacity={glow} />
          <path d="M196 206 L216 201 M196 201 L216 206" stroke="#8A5A3B" strokeWidth="4" strokeLinecap="round" />
          <path d="M206 186 Q213 195 210 201 Q206 204 202 201 Q199 195 206 186 Z" fill="#F28C38" className={animate ? 'luciole' : undefined} />
          <path d="M206 193 Q209 197 207.5 201 Q206 202 204.5 201 Q203 197 206 193 Z" fill="#FFD66B" />
        </Pop>
      )}

      {/* Bouée */}
      {has('bouee') && stage >= 4 && (
        <Pop show={hl('bouee')}>
          <circle cx="296" cy="192" r="6" fill="none" stroke="#fff" strokeWidth="4" />
          <circle cx="296" cy="192" r="6" fill="none" stroke="#E25D5D" strokeWidth="4" strokeDasharray="4.7 4.7" />
        </Pop>
      )}

      {/* Longue-vue */}
      {has('longue-vue') && (
        <Pop show={hl('longue-vue')}>
          <rect x="44" y="150" width="30" height="8" rx="3" fill="#C98B5B" transform="rotate(-22 59 154)" />
          <path d="M60 158 L52 182 M60 158 L68 182 M60 158 V182" stroke="#8A5A3B" strokeWidth="3" />
        </Pop>
      )}

      {/* Fanions (palier 1) */}
      {stage >= 1 && (
        <Pop show={hl('stage-1')}>
          <line x1="86" y1="126" x2="86" y2="180" stroke="#8A5A3B" strokeWidth="4" strokeLinecap="round" />
          <path d="M86 130 Q112 146 140 132" stroke="#5B6472" strokeWidth="1.5" fill="none" />
          {[
            [94, '#E9774F'], [106, '#FFD66B'], [118, '#6F8FD6'], [130, '#FF8FB1']
          ].map(([x, c], i) => (
            <path key={i} d={`M${(x as number) - 5} ${134 + (i === 0 || i === 3 ? 0 : 4)} l10 0 l-5 11 z`} fill={c as string} />
          ))}
        </Pop>
      )}

      {/* Refuge : tente puis cabane (palier 3) */}
      {stage < 3 ? (
        <g>
          <path d="M130 178 L162 122 L194 178 Z" fill="#E9774F" />
          <path d="M162 122 L194 178 L180 178 Z" fill="#B8532F" opacity="0.35" />
          <path d="M152 178 L162 146 L172 178 Z" fill="#5A2E3A" opacity="0.75" />
          <line x1="162" y1="122" x2="162" y2="114" stroke="#8A5A3B" strokeWidth="3" />
          <path d="M162 114 l10 4 l-10 4 z" fill="#FFD66B" />
        </g>
      ) : (
        <Pop show={hl('stage-3')}>
          <rect x="182" y="96" width="10" height="24" fill="#8A5A3B" />
          <rect x="132" y="128" width="62" height="50" rx="4" fill="#D69C6A" />
          {[138, 150, 162].map((y) => (
            <line key={y} x1="132" x2="194" y1={y} y2={y} stroke="#B97E4E" strokeWidth="2" />
          ))}
          <path d="M124 132 L163 98 L202 132 Z" fill="#8A5A3B" />
          <rect x="155" y="150" width="16" height="28" rx="7" fill="#7A4C2F" />
          <circle cx="146" cy="146" r="7" fill={sky.night ? '#FFE07A' : '#CFEAF6'} stroke="#7A4C2F" strokeWidth="3" />
          <circle cx="181" cy="146" r="7" fill={sky.night ? '#FFE07A' : '#CFEAF6'} stroke="#7A4C2F" strokeWidth="3" />
        </Pop>
      )}

      {/* Lanterne */}
      {has('lanterne') && (
        <Pop show={hl('lanterne')}>
          <circle cx="208" cy="148" r="16" fill="url(#halo)" opacity={glow} />
          <line x1="208" y1="152" x2="208" y2="180" stroke="#8A5A3B" strokeWidth="3" />
          <rect x="202" y="140" width="12" height="14" rx="3" fill="#FFD66B" stroke="#8A5A3B" strokeWidth="2" />
        </Pop>
      )}

      {/* Arbre magique (palier 2) */}
      {stage >= 2 && (
        <Pop show={hl('stage-2')}>
          <path d="M244 180 Q240 150 246 120" stroke="#8A5A3B" strokeWidth="10" fill="none" strokeLinecap="round" />
          <circle cx="232" cy="112" r="22" fill="#6CA64A" />
          <circle cx="258" cy="104" r="24" fill="#7DB858" />
          <circle cx="246" cy="88" r="20" fill="#8CCB6E" />
          {[
            [228, 108], [254, 96], [262, 116], [242, 84]
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill="url(#halo)" opacity={glow} />
              <circle cx={x} cy={y} r="3.5" fill="#FFD66B" />
            </g>
          ))}
        </Pop>
      )}

      {/* Balançoire, accrochée à l'arbre */}
      {has('balancoire') && stage >= 2 && (
        <Pop show={hl('balancoire')}>
          <path d="M255 122 V160 M268 122 V160" stroke="#5B6472" strokeWidth="1.5" />
          <rect x="251" y="159" width="21" height="4" rx="2" fill="#E9774F" />
        </Pop>
      )}

      {/* Parasol */}
      {has('parasol') && (
        <Pop show={hl('parasol')}>
          <path d="M226 170 V196" stroke="#8A5A3B" strokeWidth="2.5" />
          <path d="M210 172 Q226 154 242 172 Z" fill="#E9774F" />
          <path d="M218 172 Q226 156 234 172 Z" fill="#FFF4E6" />
        </Pop>
      )}

      {/* Guirlande lumineuse */}
      {has('guirlande') && (
        <Pop show={hl('guirlande')}>
          <path d={stage >= 3 ? 'M192 104 Q212 126 232 114' : 'M162 120 Q196 134 232 114'} stroke="#5B6472" strokeWidth="1.2" fill="none" />
          {(stage >= 3 ? [[198, 112], [206, 117], [214, 119], [222, 118], [229, 115]] : [[172, 125], [184, 129], [196, 130], [208, 127], [220, 121]]).map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y + 2} r="6" fill="url(#halo)" opacity={glow} />
              <circle cx={x} cy={y + 2} r="2.5" fill={['#FFD66B', '#FF8FB1', '#8FD8C4', '#FFD66B', '#B9A6F2'][i]} />
            </g>
          ))}
        </Pop>
      )}

      {/* Hamac */}
      {has('hamac') && (
        <Pop show={hl('hamac')}>
          <line x1="276" y1="150" x2="276" y2="182" stroke="#8A5A3B" strokeWidth="4" strokeLinecap="round" />
          <line x1="312" y1="150" x2="312" y2="186" stroke="#8A5A3B" strokeWidth="4" strokeLinecap="round" />
          <path d="M276 156 Q294 178 312 156" stroke="#E9774F" strokeWidth="6" fill="none" strokeLinecap="round" />
        </Pop>
      )}

      {/* Fleurs */}
      {has('fleurs') && (
        <Pop show={hl('fleurs')}>
          {[
            [104, 186, '#FF8FB1'], [114, 190, '#FFD66B'], [96, 192, '#B9A6F2'], [222, 190, '#FF8FB1'], [232, 186, '#FFD66B']
          ].map(([x, y, c], i) => (
            <g key={i}>
              <line x1={x as number} y1={(y as number) + 2} x2={x as number} y2={(y as number) + 8} stroke="#4A7A31" strokeWidth="2" />
              <circle cx={x as number} cy={y as number} r="4" fill={c as string} />
            </g>
          ))}
        </Pop>
      )}

      {/* Potager */}
      {has('potager') && (
        <Pop show={hl('potager')}>
          <ellipse cx="166" cy="196" rx="24" ry="5" fill="#9C6B45" />
          <path d="M154 194 q-4 -8 2 -10 M166 193 q-3 -10 4 -11 M178 194 q-1 -8 5 -9" stroke="#4A7A31" strokeWidth="3" fill="none" strokeLinecap="round" />
        </Pop>
      )}

      {/* Cerf-volant */}
      {has('cerf-volant') && (
        <Pop show={hl('cerf-volant')}>
          <g className={animate ? 'flotte' : undefined}>
            <path d="M60 40 L74 56 L60 74 L46 56 Z" fill="#E9774F" />
            <path d="M60 40 V74 M46 56 H74" stroke="#fff" strokeWidth="2" />
          </g>
          <path d="M60 74 Q70 120 90 128" stroke="#5B6472" strokeWidth="1.2" fill="none" />
        </Pop>
      )}

      {/* Lucioles */}
      {ambiance === 'ambiance-lucioles' && (
        <g>
          {[
            [70, 140], [120, 110], [210, 120], [290, 130], [330, 160], [150, 150], [260, 70]
          ].map(([x, y], i) => (
            <g key={i} className={animate ? 'luciole' : undefined} style={{ animationDelay: `${i * 0.7}s` }}>
              <circle cx={x} cy={y} r="7" fill="url(#halo)" />
              <circle cx={x} cy={y} r="2" fill="#FFF3A8" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
