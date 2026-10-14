// Règles de progression. Les XP ne diminuent jamais.

export const XP_MIN = 5;
export const XP_MAX = 30;
export const COMPLETION_BONUS = 20;

/** Niveau à partir duquel la progression devient régulière (+1 200 XP par niveau). */
export const MAX_DESIGNED_LEVEL = 30;

/**
 * XP cumulés nécessaires pour atteindre chaque niveau (index 0 = niveau 1).
 * Les premiers niveaux arrivent vite (récompenses rapprochées), puis l'écart grandit
 * doucement : environ 3 à 4 mois d'usage régulier pour atteindre le niveau 30.
 */
export const LEVEL_THRESHOLDS: number[] = (() => {
  const t = [0, 50, 130, 240, 380, 560, 780, 1040, 1340, 1680, 2060, 2480];
  let step = 460;
  while (t.length < MAX_DESIGNED_LEVEL) {
    t.push(t[t.length - 1] + step);
    step += 40;
  }
  return t;
})();

export function thresholdFor(level: number): number {
  if (level <= 1) return 0;
  if (level <= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level - 1];
  // Au-delà du tableau : +1 200 XP par niveau.
  const last = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return last + (level - LEVEL_THRESHOLDS.length) * 1200;
}

export function levelForXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= thresholdFor(level + 1)) level++;
  return level;
}

export function levelProgress(totalXp: number): { level: number; current: number; needed: number; ratio: number } {
  const level = levelForXp(totalXp);
  const start = thresholdFor(level);
  const end = thresholdFor(level + 1);
  const current = totalXp - start;
  const needed = end - start;
  return { level, current, needed, ratio: Math.min(1, current / needed) };
}

/**
 * Paliers du monde : l'archipel s'agrandit jusqu'au niveau 30.
 */
export const WORLD_STAGE_LEVELS = [1, 2, 3, 4, 5, 7, 9, 12, 15, 19, 24, 30];
export const WORLD_STAGE_NAMES = [
  'Un petit refuge',
  'Des fanions sur l’île',
  'Un arbre magique',
  'Une vraie cabane',
  'Un ponton et une barque',
  'Un îlot voisin',
  'Un phare sur le rocher',
  'Une montgolfière',
  'Un voilier',
  'Un observatoire',
  'Une baleine amie',
  'Un arc-en-ciel sur l’archipel'
];

export function worldStageForLevel(level: number): number {
  let stage = 0;
  WORLD_STAGE_LEVELS.forEach((lvl, i) => {
    if (level >= lvl) stage = i;
  });
  return stage;
}

export function clampXp(xp: number): number {
  if (!Number.isFinite(xp)) return 10;
  return Math.max(XP_MIN, Math.min(XP_MAX, Math.round(xp)));
}
