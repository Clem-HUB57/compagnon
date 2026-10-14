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
  { id: 'chapeau-paille', name: 'Chapeau de paille', kind: 'accessoire', source: 'niveau', minLevel: 7 },
  { id: 'couleur-corail', name: 'Corail', kind: 'couleur', source: 'niveau', minLevel: 7 },
  { id: 'feu-camp', name: 'Feu de camp', kind: 'decor', source: 'niveau', minLevel: 7 },
  { id: 'casquette', name: 'Casquette', kind: 'accessoire', source: 'niveau', minLevel: 8 },
  { id: 'ambiance-aube', name: 'Aube rose', kind: 'ambiance', source: 'niveau', minLevel: 8 },
  { id: 'chateau-sable', name: 'Château de sable', kind: 'decor', source: 'niveau', minLevel: 8 },
  { id: 'noeud-papillon', name: 'Nœud papillon', kind: 'accessoire', source: 'niveau', minLevel: 9 },
  { id: 'couleur-citron', name: 'Citron', kind: 'couleur', source: 'niveau', minLevel: 9 },
  { id: 'balancoire', name: 'Balançoire', kind: 'decor', source: 'niveau', minLevel: 9 },
  { id: 'bonnet-pompon', name: 'Bonnet à pompon', kind: 'accessoire', source: 'niveau', minLevel: 10 },
  { id: 'ambiance-neige', name: 'Neige douce', kind: 'ambiance', source: 'niveau', minLevel: 10 },
  { id: 'tresor', name: 'Coffre au trésor', kind: 'decor', source: 'niveau', minLevel: 10 },
  { id: 'bandana', name: 'Bandana', kind: 'accessoire', source: 'niveau', minLevel: 11 },
  { id: 'couleur-foret', name: 'Forêt', kind: 'couleur', source: 'niveau', minLevel: 11 },
  { id: 'parasol', name: 'Parasol', kind: 'decor', source: 'niveau', minLevel: 11 },
  { id: 'lunettes-soleil', name: 'Lunettes de soleil', kind: 'accessoire', source: 'niveau', minLevel: 12 },
  { id: 'mouettes', name: 'Mouettes', kind: 'decor', source: 'niveau', minLevel: 12 },
  { id: 'couleur-bonbon', name: 'Bonbon', kind: 'couleur', source: 'niveau', minLevel: 13 },
  { id: 'ambiance-bonbon', name: 'Ciel bonbon', kind: 'ambiance', source: 'niveau', minLevel: 13 },
  { id: 'collier-coquillages', name: 'Collier de coquillages', kind: 'accessoire', source: 'niveau', minLevel: 14 },
  { id: 'etoile-mer', name: 'Étoile de mer', kind: 'decor', source: 'niveau', minLevel: 14 },
  { id: 'chapeau-magicien', name: 'Chapeau de magicien', kind: 'accessoire', source: 'niveau', minLevel: 15 },
  { id: 'couleur-glacier', name: 'Glacier', kind: 'couleur', source: 'niveau', minLevel: 15 },
  { id: 'bouee', name: 'Bouée', kind: 'decor', source: 'niveau', minLevel: 16 },
  { id: 'antennes', name: 'Serre-tête antennes', kind: 'accessoire', source: 'niveau', minLevel: 16 },
  { id: 'ambiance-galaxie', name: 'Galaxie', kind: 'ambiance', source: 'niveau', minLevel: 18 },
  { id: 'couleur-galaxie', name: 'Cosmos', kind: 'couleur', source: 'niveau', minLevel: 18 },
  { id: 'couronne', name: 'Couronne', kind: 'accessoire', source: 'niveau', minLevel: 20 },
  { id: 'cape', name: 'Cape de héros', kind: 'accessoire', source: 'niveau', minLevel: 22 },
  { id: 'guirlande', name: 'Guirlande lumineuse', kind: 'decor', source: 'niveau', minLevel: 24 },
  { id: 'couleur-or', name: 'Or', kind: 'couleur', source: 'niveau', minLevel: 26 },
  { id: 'chapeau-pirate', name: 'Chapeau de pirate', kind: 'accessoire', source: 'niveau', minLevel: 28 },
  { id: 'ambiance-feu-artifice', name: 'Feu d’artifice', kind: 'ambiance', source: 'niveau', minLevel: 30 },

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
  autonomie: 'Pour avoir fait une routine en autonomie.',
  calme: 'Pour avoir pris soin de toi dans ton coin calme.'
};

/** Les trouvailles arrivent à ces étapes (1re fois, 3e fois, 6e fois…). */
export const FINDING_MILESTONES = [1, 3, 6, 10, 15];
