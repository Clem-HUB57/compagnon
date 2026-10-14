// Règles de progression. Les XP ne diminuent jamais.

export const XP_MIN = 5;
export const XP_MAX = 30;
export const COMPLETION_BONUS = 20;

/** XP cumulés nécessaires pour atteindre chaque niveau (index 0 = niveau 1). */
export const LEVEL_THRESHOLDS = [0, 50, 130, 240, 380, 560, 780, 1040, 1340, 1680, 2060, 2480];

export function thresholdFor(level: number): number {
  if (level <= 1) return 0;
  if (level <= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level - 1];
  // Au-delà du tableau : +450 XP par niveau.
  const last = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return last + (level - LEVEL_THRESHOLDS.length) * 450;
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
 * Paliers du monde :
 * 0 petit refuge · 1 décoration · 2 arbre magique · 3 refuge amélioré · 4 ponton et barque · 5 îlot voisin et pont
 */
export const WORLD_STAGE_LEVELS = [1, 2, 3, 4, 5, 7];
export const WORLD_STAGE_NAMES = [
  'Un petit refuge',
  'Des fanions sur l’île',
  'Un arbre magique',
  'Une vraie cabane',
  'Un ponton et une barque',
  'Un îlot voisin'
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
