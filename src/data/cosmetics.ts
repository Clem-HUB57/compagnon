import type { Cosmetic, FindingEvent } from '../types';

// Catalogue des objets à gagner. Aucun objet ne s'achète, aucun n'expire,
// aucun n'est tiré au sort.

export const COSMETICS: Cosmetic[] = [
  // Départ
  { id: 'couleur-origine', name: 'Couleur d’origine', kind: 'couleur', source: 'depart', minLevel: 1 },
  { id: 'ambiance-jour', name: 'Grand jour', kind: 'ambiance', source: 'depart', minLevel: 1 },

  // Choix de niveau
  { id: 'echarpe', name: 'Écharpe rayée', kind: 'accessoire', source: 'niveau', minLevel: 2 },
  { id: 'couleur-menthe', name: 'Menthe', kind: 'couleur', source: 'niveau', minLevel: 2 },
  { id: 'lanterne', name: 'Lanterne', kind: 'decor', source: 'niveau', minLevel: 2 },
  { id: 'bonnet-aviateur', name: 'Bonnet d’aviateur', kind: 'accessoire', source: 'niveau', minLevel: 3 },
  { id: 'couleur-lavande', name: 'Lavande', kind: 'couleur', source: 'niveau', minLevel: 3 },
  { id: 'fleurs', name: 'Massif de fleurs', kind: 'decor', source: 'niveau', minLevel: 3 },
  { id: 'casque-chantier', name: 'Casque de chantier', kind: 'accessoire', source: 'niveau', minLevel: 4 },
  { id: 'ambiance-coucher', name: 'Coucher de soleil', kind: 'ambiance', source: 'niveau', minLevel: 4 },
  { id: 'hamac', name: 'Hamac', kind: 'decor', source: 'niveau', minLevel: 4 },
  { id: 'casque-audio', name: 'Casque audio', kind: 'accessoire', source: 'niveau', minLevel: 5 },
  { id: 'couleur-ocean', name: 'Océan', kind: 'couleur', source: 'niveau', minLevel: 5 },
  { id: 'cerf-volant', name: 'Cerf-volant', kind: 'decor', source: 'niveau', minLevel: 5 },
  { id: 'ambiance-etoiles', name: 'Nuit étoilée', kind: 'ambiance', source: 'niveau', minLevel: 6 },
  { id: 'potager', name: 'Petit potager', kind: 'decor', source: 'niveau', minLevel: 6 },
  { id: 'couleur-miel', name: 'Miel', kind: 'couleur', source: 'niveau', minLevel: 6 },

  // Trouvailles (bouteille sur la plage) : récompensent des stratégies, pas la vitesse
  { id: 'lunettes', name: 'Lunettes rondes', kind: 'accessoire', source: 'trouvaille', minLevel: 1 },
  { id: 'longue-vue', name: 'Longue-vue', kind: 'decor', source: 'trouvaille', minLevel: 1 },
  { id: 'couronne-fleurs', name: 'Couronne de fleurs', kind: 'accessoire', source: 'trouvaille', minLevel: 1 },
  { id: 'ambiance-lucioles', name: 'Soir de lucioles', kind: 'ambiance', source: 'trouvaille', minLevel: 1 },
  { id: 'noeud', name: 'Nœud', kind: 'accessoire', source: 'trouvaille', minLevel: 1 },
  { id: 'ambiance-aurore', name: 'Aurore', kind: 'ambiance', source: 'trouvaille', minLevel: 1 },
  { id: 'couleur-nuit', name: 'Nuit', kind: 'couleur', source: 'trouvaille', minLevel: 1 }
];

export const STARTING_COSMETICS = COSMETICS.filter((c) => c.source === 'depart').map((c) => c.id);

export function getCosmetic(id: string): Cosmetic | undefined {
  return COSMETICS.find((c) => c.id === id);
}

export const FINDING_REASONS: Record<FindingEvent, string> = {
  reprise: 'Pour avoir repris après une pause.',
  aide: 'Pour avoir demandé de l’aide, puis terminé ta mission.',
  decouverte: 'Pour avoir essayé une nouvelle routine.',
  autonomie: 'Pour avoir fait une routine en autonomie.'
};

/** Les trouvailles arrivent à ces étapes (1re fois, 3e fois, 6e fois…). */
export const FINDING_MILESTONES = [1, 3, 6, 10, 15];
