import { ArrowLeft, Award, Check, Gift, Lock, Repeat } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CosmeticThumb } from '../art/Accessories';
import { Companion } from '../art/Companion';
import { Island } from '../art/Island';
import { Album } from '../components/Album';
import { MyCompanion } from '../components/shared';
import { Button, IconButton, Screen, Sheet } from '../components/ui';
import { COMPANIONS } from '../data/companions';
import { COSMETICS, getCosmetic } from '../data/cosmetics';
import { useReducedMotion } from '../lib/hooks';
import { playSound } from '../lib/sound';
import { chooseReward, equip, markSeen, setProfile } from '../logic/engine';
import { WORLD_STAGE_LEVELS, WORLD_STAGE_NAMES } from '../logic/progression';
import { useApp, type CabaneTab } from '../store/useApp';
import type { Cosmetic, CosmeticKind } from '../types';

const TABS: { id: CabaneTab; label: string }[] = [
  { id: 'compagnon', label: 'Compagnon' },
  { id: 'ile', label: 'Mon île' },
  { id: 'carnet', label: 'Carnet' },
  { id: 'album', label: 'Album' }
];

export function Cabane({ initialTab = 'compagnon' }: { initialTab?: CabaneTab }) {
  const data = useApp((s) => s.data);
  const update = useApp((s) => s.update);
  const navigate = useApp((s) => s.navigate);
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<CabaneTab>(initialTab);
  const [switching, setSwitching] = useState(false);
  const p = data.progression;
  const profile = data.profile!;
  const [unseenAtOpen] = useState(() => new Set(p.unseen));

  useEffect(() => {
    if (p.unseen.length) update((s) => markSeen(s));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const owned = (c: Cosmetic) => p.unlockedCosmetics.includes(c.id);
  const isEquipped = (c: Cosmetic) =>
    (c.kind === 'couleur' && p.equipped.color === c.id) ||
    (c.kind === 'accessoire' && p.equipped.accessory === c.id) ||
    (c.kind === 'ambiance' && p.equipped.ambiance === c.id) ||
    (c.kind === 'decor' && p.equipped.decor.includes(c.id));

  const grid = (kind: CosmeticKind) => {
    const all = COSMETICS.filter((c) => c.kind === kind);
    const items = all.filter(owned);
    const locked = all.filter((c) => !owned(c));
    const nextLevel = locked.filter((c) => c.source === 'niveau').sort((x, y) => x.minLevel - y.minLevel)[0];
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((c) => {
          const on = isEquipped(c);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              aria-label={`${c.name}${on ? ' (choisi)' : ''}`}
              onClick={() => update((s) => equip(s, c.id, kind))}
              className={`relative flex min-h-[112px] flex-col items-center justify-center gap-1 rounded-3xl border-2 p-2 text-center text-xs font-medium transition ${on ? 'border-lagon-500 bg-lagon-100' : 'border-sable-300 bg-white hover:border-lagon-300'}`}
            >
              {kind === 'accessoire' ? (
                <Companion id={profile.companionId} accessory={c.id} color={p.equipped.color} size={64} />
              ) : kind === 'couleur' ? (
                <Companion id={profile.companionId} color={c.id} size={64} />
              ) : (
                <CosmeticThumb id={c.id} kind={c.kind} />
              )}
              <span className="text-encre-900">{c.name}</span>
              {on && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-lagon-700 text-white">
                  <Check size={14} aria-hidden />
                </span>
              )}
              {unseenAtOpen.has(c.id) && <span className="absolute left-2 top-2 rounded-full bg-corail-500 px-2 py-0.5 text-[10px] font-semibold text-white">nouveau</span>}
            </button>
          );
        })}
        {locked.length > 0 && (
          <div className="flex min-h-[112px] flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-sable-300 bg-sable-50 p-2 text-center text-xs font-medium text-encre-500">
            <Lock size={20} aria-hidden />
            <span>{locked.length} à découvrir</span>
            {nextLevel && <span>Prochain au niveau {nextLevel.minLevel}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <Screen>
      <header className="flex items-center gap-2">
        <IconButton label="Retour à mon île" onClick={() => navigate({ name: 'accueil' })}>
          <ArrowLeft aria-hidden />
        </IconButton>
        <h1 className="titre">Ma cabane</h1>
      </header>

      {p.pendingChoices.map((choice) => (
        <section key={choice.id} className="carte mt-4 p-5">
          <p className="flex items-center gap-2 font-semibold">
            <Gift className="text-corail-500" aria-hidden /> Choisis ton cadeau du niveau {choice.level}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {choice.options.map((id) => {
              const c = getCosmetic(id)!;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    update((s) => chooseReward(s, choice.id, id));
                    playSound('trouvaille', data.preferences.soundEnabled);
                  }}
                  className="flex flex-col items-center gap-1 rounded-3xl border-2 border-sable-300 bg-sable-50 p-2 text-sm font-medium transition hover:border-lagon-500"
                >
                  <span className="flex h-16 items-center justify-center">
                    {c.kind === 'accessoire' ? (
                      <Companion id={profile.companionId} accessory={c.id} color={p.equipped.color} size={64} />
                    ) : c.kind === 'couleur' ? (
                      <Companion id={profile.companionId} color={c.id} size={64} />
                    ) : (
                      <CosmeticThumb id={c.id} kind={c.kind} />
                    )}
                  </span>
                  {c.name}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="mt-4 flex gap-2 rounded-3xl bg-sable-200 p-1.5" role="tablist" aria-label="Sections de la cabane">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`min-h-[44px] flex-1 rounded-2xl px-1 text-[15px] font-semibold transition ${tab === t.id ? 'bg-white shadow-carte' : 'text-encre-700 hover:bg-sable-300/60'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'compagnon' && (
        <div className="mt-4 flex animate-apparait flex-col gap-5" role="tabpanel">
          <div className="flex flex-col items-center">
            <MyCompanion size={170} expression="joie" />
            <p className="text-xl font-semibold">{profile.companionName}</p>
          </div>
          <section>
            <h2 className="mb-2 font-semibold">Couleurs</h2>
            {grid('couleur')}
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Accessoires</h2>
            {p.equipped.accessory && (
              <Button variant="fantome" size="petit" className="mb-2" onClick={() => update((s) => equip(s, s.progression.equipped.accessory, 'accessoire'))}>
                Enlever l’accessoire
              </Button>
            )}
            {grid('accessoire')}
          </section>
          <Button variant="doux" icon={<Repeat aria-hidden />} onClick={() => setSwitching(true)}>
            Changer de compagnon
          </Button>
        </div>
      )}

      {tab === 'ile' && (
        <div className="mt-4 flex animate-apparait flex-col gap-5" role="tabpanel">
          <div className="overflow-hidden rounded-4xl shadow-carte">
            <Island stage={p.worldStage} ambiance={p.equipped.ambiance} decor={p.equipped.decor} animate={!reduced} className="block w-full" />
          </div>
          <section>
            <h2 className="mb-2 font-semibold">Décorations</h2>
            <p className="mb-2 text-sm text-encre-700">Touche une décoration pour la montrer ou la cacher.</p>
            {grid('decor')}
          </section>
          <section>
            <h2 className="mb-2 font-semibold">Ambiances</h2>
            {grid('ambiance')}
          </section>
        </div>
      )}

      {tab === 'carnet' && (
        <div className="mt-4 flex animate-apparait flex-col gap-4" role="tabpanel">
          <section className="carte p-5">
            <h2 className="font-semibold">Carnet d’explorateur de {profile.childName || profile.companionName}</h2>
            <p className="mt-1 text-encre-700">
              Niveau {p.level} · {p.totalXp} XP au total
            </p>
            <ol className="mt-4 flex flex-col gap-2" aria-label="Évolution de l'île">
              {WORLD_STAGE_NAMES.map((name, i) => (
                <li key={name} className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${i <= p.worldStage ? 'bg-mousse-100' : 'bg-sable-100 text-encre-500'}`}>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i <= p.worldStage ? 'bg-mousse-500 text-white' : 'bg-sable-300'}`}>
                    {i <= p.worldStage ? <Check size={14} aria-hidden /> : WORLD_STAGE_LEVELS[i]}
                  </span>
                  <span className="flex-1">{name}</span>
                  <span className="text-xs">niveau {WORLD_STAGE_LEVELS[i]}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="carte p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <Award className="text-corail-500" aria-hidden /> Écussons d’autonomie
            </h2>
            {p.badges.length === 0 ? (
              <p className="mt-2 text-sm text-encre-700">Quand tu feras une routine en mode autonome, tu gagneras ton premier écusson.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {p.badges.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 rounded-2xl bg-corail-100 px-3 py-2">
                    <Award className="text-corail-700" aria-hidden /> {b.title}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="carte p-5">
            <h2 className="font-semibold">Mes quêtes</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {data.routines.map((r) => {
                const n = p.routineStats[r.id]?.completions ?? 0;
                return (
                  <li key={r.id} className="flex items-center justify-between gap-2 border-b border-sable-200 pb-2 last:border-0">
                    <span>{r.title}</span>
                    <span className="text-sm font-semibold text-lagon-900">{n > 0 ? `${n} fois` : '–'}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}

      {tab === 'album' && (
        <div className="mt-4 flex animate-apparait flex-col gap-4" role="tabpanel">
          <Album />
        </div>
      )}

      <Sheet open={switching} onClose={() => setSwitching(false)} title="Changer de compagnon">
        <p className="mb-3 text-sm text-encre-700">Tout ce que tu as gagné reste à toi : couleurs, accessoires et île.</p>
        <div className="grid grid-cols-2 gap-3">
          {COMPANIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={profile.companionId === c.id}
              onClick={() => {
                const keepName = profile.companionName !== COMPANIONS.find((x) => x.id === profile.companionId)?.defaultName;
                update((s) => setProfile(s, profile.childName, c.id, keepName ? profile.companionName : c.defaultName));
                setSwitching(false);
              }}
              className={`flex flex-col items-center rounded-3xl border-4 bg-white p-2 ${profile.companionId === c.id ? 'border-lagon-500' : 'border-transparent'}`}
            >
              <Companion id={c.id} size={96} color={p.equipped.color} accessory={p.equipped.accessory} />
              <span className="font-semibold">{c.defaultName}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </Screen>
  );
}
