// Contenu du coin calme : outils de régulation, météo intérieure, idées pour le plan tempête.
// L'app ne devine jamais l'émotion de l'enfant : c'est lui qui choisit, s'il le souhaite.

export type ToolId = 'respirer' | 'bouger' | 'presser' | 'cinq-sens' | 'coin' | 'eau';
export type Weather = 'soleil' | 'nuages' | 'orage' | 'tempete';

export interface CalmTool {
  id: ToolId;
  name: string;
  short: string;
  /** Étapes guidées (sauf « respirer », qui a son propre guide). */
  steps: string[];
}

export const CALM_TOOLS: CalmTool[] = [
  { id: 'respirer', name: 'Respirer avec mon compagnon', short: 'Respirer', steps: [] },
  {
    id: 'bouger',
    name: 'Bouger pour vider l’énergie',
    short: 'Bouger',
    steps: ['Secoue tes mains très fort, 10 fois.', 'Fais 10 petits sauts sur place.', 'Étire tes bras vers le ciel, le plus haut possible.', 'Pose tes mains sur ton ventre et souffle doucement.']
  },
  {
    id: 'presser',
    name: 'Presser un squishy ou un coussin',
    short: 'Presser',
    steps: ['Prends un squishy, une balle toute douce ou un coussin.', 'Presse-le très fort en comptant jusqu’à 5.', 'Relâche tout doucement.', 'Recommence encore deux fois.']
  },
  {
    id: 'cinq-sens',
    name: 'Le jeu des 5 sens',
    short: '5 sens',
    steps: ['Trouve 5 choses que tu vois.', 'Écoute : trouve 4 bruits que tu entends.', 'Touche 3 choses autour de toi.', 'Trouve 2 odeurs.', 'Pense à 1 chose qui te fait du bien.']
  },
  {
    id: 'coin',
    name: 'Aller dans mon coin calme',
    short: 'Mon coin',
    steps: ['Va dans ton endroit calme : ta chambre, un coussin, sous une couverture…', 'Reste le temps qu’il te faut. Reviens quand tu veux.']
  },
  {
    id: 'eau',
    name: 'Boire un verre d’eau',
    short: 'De l’eau',
    steps: ['Va te chercher un verre d’eau.', 'Bois-le doucement, gorgée par gorgée.']
  }
];

export function getTool(id: ToolId): CalmTool {
  return CALM_TOOLS.find((t) => t.id === id) ?? CALM_TOOLS[0];
}

export const WEATHERS: { id: Weather; label: string; hint: string }[] = [
  { id: 'soleil', label: 'Soleil', hint: 'Ça va bien' },
  { id: 'nuages', label: 'Nuages', hint: 'Un peu triste, pas d’énergie' },
  { id: 'orage', label: 'Orage', hint: 'De la colère ou de l’inquiétude' },
  { id: 'tempete', label: 'Tempête', hint: 'Très en colère ou très triste' }
];

/** Outils proposés en premier selon la météo choisie (3 maximum, pour ne pas surcharger). */
export const SUGGESTED_TOOLS: Record<Weather | 'aucune', ToolId[]> = {
  soleil: ['respirer', 'cinq-sens', 'bouger'],
  nuages: ['respirer', 'cinq-sens', 'eau'],
  orage: ['respirer', 'bouger', 'presser'],
  tempete: ['coin', 'presser', 'respirer'],
  aucune: ['respirer', 'bouger', 'presser']
};

export const WEATHER_MESSAGES: Record<Weather, string> = {
  soleil: 'Super ! C’est le meilleur moment pour t’entraîner : les outils marchent mieux quand on les connaît bien.',
  nuages: 'Merci de me le dire. On prend un moment pour toi ?',
  orage: 'Merci de me le dire. Ça arrive à tout le monde. On essaie un outil ?',
  tempete: 'Merci de me le dire. On traverse ça ensemble. Choisis ce qui t’aide.'
};

export const FEELING_IDEAS = ['je sens la colère monter', 'je suis très triste', 'je m’inquiète beaucoup', 'tout est trop en même temps', 'je n’arrive pas à me calmer'];

/** Nombre d'entraînements récompensés par jour (pour que l'outil reste un outil, pas une course aux XP). */
export const CALM_XP = 15;
export const CALM_XP_PER_DAY = 2;
