import type { Routine, Step } from '../types';

// Routines d'EXEMPLE fournies avec l'application (isDemo = true).
// Toutes sont modifiables dans l'espace parent.

export type StepSeed = [title: string, description: string, helpText: string, easierText: string, xp?: number, tool?: Step['tool']];

export function steps(routineId: string, seeds: StepSeed[]): Step[] {
  return seeds.map(([title, description, helpText, easierText, xp, tool], i) => ({
    id: `${routineId}-e${i + 1}`,
    title,
    description,
    helpText,
    easierText,
    xpReward: xp ?? 10,
    order: i,
    ...(tool ? { tool } : {})
  }));
}

const DEMO_LIST: Routine[] = [
  {
    id: 'preparer-sac',
    title: 'Préparer mon sac',
    description: 'Tout est prêt pour demain, sans course le matin.',
    illustration: 'sac',
    estimatedMinutes: 10,
    category: 'ecole',
    isCustom: false,
    isDemo: true,
    trigger: 'Quand j’ai fini de manger',
    moment: 'soir',
    steps: steps('preparer-sac', [
      ['Pose ton sac à l’endroit habituel', 'Là où tu le prépares tous les soirs.', 'Va chercher ton sac et pose-le par terre, ouvert, devant toi.', 'Touche simplement ton sac. Tu l’as trouvé ? Bravo, c’est le début.'],
      ['Regarde ce dont tu as besoin demain', 'Ton emploi du temps ou ton cahier de textes t’aide.', 'Ouvre ton cahier de textes à la page de demain et lis les matières.', 'Lis seulement la première matière de demain.'],
      ['Mets les cahiers nécessaires dans ton sac', 'Un cahier à la fois.', 'Prends le cahier de la première matière et glisse-le dans le sac.', 'Mets juste un cahier dans le sac. Un seul.'],
      ['Ajoute ta trousse', 'Vérifie qu’il y a un crayon qui écrit.', 'Prends ta trousse, ouvre-la une seconde, puis range-la dans le sac.', 'Prends ta trousse dans ta main.'],
      ['Vérifie ton carnet ou les documents à emporter', 'Un mot à faire signer ? Une autorisation ?', 'Ouvre ton carnet de liaison : s’il y a un papier à donner, mets-le dans le sac.', 'Ouvre juste ton carnet de liaison.'],
      ['Ferme ton sac et place-le au bon endroit', 'Près de la porte, par exemple.', 'Ferme la fermeture éclair, puis porte ton sac jusqu’à sa place.', 'Ferme seulement la fermeture éclair.']
    ])
  },
  {
    id: 'commencer-devoirs',
    title: 'Commencer mes devoirs',
    description: 'Le plus dur, c’est de démarrer. On y va pas à pas.',
    illustration: 'devoirs',
    estimatedMinutes: 10,
    category: 'ecole',
    isCustom: false,
    isDemo: true,
    trigger: 'Quand j’ai fini de goûter',
    moment: 'apres-ecole',
    steps: steps('commencer-devoirs', [
      ['Choisis la matière à commencer', 'Celle qui te paraît la plus facile, c’est très bien.', 'Regarde la liste des devoirs et pose ton doigt sur une matière.', 'Dis à voix haute le nom d’une matière.'],
      ['Sors le cahier', 'Pose-le sur ton bureau.', 'Ouvre ton sac et cherche la couleur du cahier de cette matière.', 'Ouvre seulement ton sac.'],
      ['Ouvre à la bonne page', 'Le cahier de textes t’indique laquelle.', 'Cherche la date ou le numéro de l’exercice, puis ouvre le cahier.', 'Ouvre le cahier, n’importe où pour l’instant.'],
      ['Lis la première consigne', 'Juste la première.', 'Pose ton doigt sous le premier mot et lis la phrase jusqu’au point.', 'Lis seulement les trois premiers mots.'],
      ['Essaie la première question', 'Essayer, c’est déjà gagner, même si ce n’est pas parfait.', 'Écris ce que tu sais, même un seul mot ou un seul chiffre.', 'Prends ton crayon et écris la date ou ton prénom.', 15],
      ['Demande de l’aide si tu bloques', 'Demander de l’aide est une vraie stratégie.', 'Va voir un adulte avec ton cahier et montre-lui ce qui bloque.', 'Dis « je bloque » à quelqu’un. C’est tout.']
    ])
  },
  {
    id: 'ranger-activite',
    title: 'Ranger après une activité',
    description: 'Une petite zone à la fois, et tu décides quand t’arrêter.',
    illustration: 'ranger',
    estimatedMinutes: 10,
    category: 'maison',
    isCustom: false,
    isDemo: true,
    trigger: 'Quand j’ai fini de jouer',
    moment: 'libre',
    steps: steps('ranger-activite', [
      ['Choisis une petite zone', 'Ton bureau, un coin du tapis, une étagère…', 'Montre du doigt un coin de la pièce : c’est ta zone.', 'Choisis juste une zone de la taille d’une serviette.'],
      ['Ramasse les objets au sol', 'Seulement dans ta zone.', 'Commence par le plus gros objet et pose-le sur ton lit ou ton bureau.', 'Ramasse un seul objet.'],
      ['Range les objets à leur place', 'Chaque chose a sa maison.', 'Prends un objet et demande-toi : « où est sa maison ? »', 'Range trois objets, pas plus.'],
      ['Mets à la poubelle ce qui doit l’être', 'Papiers, emballages…', 'Prends les papiers froissés et va jusqu’à la poubelle.', 'Jette un seul papier.'],
      ['Regarde ce qui reste', 'Prends une seconde pour observer.', 'Recule de deux pas et regarde ta zone.', 'Regarde ta zone pendant trois secondes.'],
      ['Décide si tu continues ou si tu t’arrêtes', 'Les deux sont de bons choix.', 'Si tu as encore de l’énergie, choisis une nouvelle petite zone. Sinon, tu as fini !', 'Dis « je continue » ou « j’arrête ».']
    ])
  },
  {
    id: 'vider-lave-vaisselle',
    title: 'Vider le lave-vaisselle',
    description: 'Chaque objet retrouve son placard.',
    illustration: 'vaisselle',
    estimatedMinutes: 8,
    category: 'maison',
    isCustom: false,
    isDemo: true,
    trigger: 'Quand on me dit que la vaisselle est propre',
    moment: 'libre',
    steps: steps('vider-lave-vaisselle', [
      ['Ouvre le lave-vaisselle', 'Attention, ça peut être encore chaud.', 'Tire la porte doucement et attends quelques secondes.', 'Pose juste ta main sur la poignée.'],
      ['Range les couverts', 'Fourchettes, couteaux, cuillères : chacun dans sa case.', 'Prends le panier à couverts et pose-le sur le plan de travail.', 'Range seulement les cuillères.'],
      ['Range les verres et les tasses', 'Un ou deux à la fois.', 'Ouvre le placard des verres avant de commencer.', 'Range un seul verre.'],
      ['Range les assiettes et les bols', 'Empile-les par taille.', 'Prends deux assiettes pareilles et pose-les dans leur placard.', 'Range une seule assiette.'],
      ['Referme le lave-vaisselle', 'Il est prêt pour la suite.', 'Repousse les paniers puis ferme la porte.', 'Repousse juste le panier du bas.']
    ])
  },
  {
    id: 'debarrasser-table',
    title: 'Débarrasser la table',
    description: 'Une table propre en quelques gestes.',
    illustration: 'table',
    estimatedMinutes: 5,
    category: 'maison',
    isCustom: false,
    isDemo: true,
    trigger: 'Quand le repas est fini',
    moment: 'soir',
    steps: steps('debarrasser-table', [
      ['Apporte ton assiette et tes couverts', 'Jusqu’à l’évier ou au lave-vaisselle.', 'Pose tes couverts dans ton assiette, puis porte-la avec deux mains.', 'Prends seulement ton assiette.'],
      ['Ramène ton verre', 'Un aller de plus.', 'Prends ton verre et pose-le à côté de l’évier.', 'Touche ton verre et emporte-le.'],
      ['Range ce qui va au frigo', 'Beurre, fromage, carafe…', 'Demande : « qu’est-ce qui va au frigo ? » et prends un objet.', 'Range un seul objet.'],
      ['Passe l’éponge sur la table', 'Les miettes vont dans ta main.', 'Mouille l’éponge, essore-la, et fais des grands cercles.', 'Passe l’éponge sur ta place seulement.']
    ])
  },
  {
    id: 'linge-sale',
    title: 'Mettre mon linge au sale',
    description: 'Fini les chaussettes sous le lit.',
    illustration: 'linge',
    estimatedMinutes: 3,
    category: 'maison',
    isCustom: false,
    isDemo: true,
    trigger: 'Quand je me mets en pyjama',
    moment: 'soir',
    steps: steps('linge-sale', [
      ['Ramasse les vêtements portés aujourd’hui', 'Dans ta chambre et la salle de bain.', 'Commence par les vêtements que tu viens d’enlever.', 'Ramasse une seule chaussette.'],
      ['Vérifie les poches', 'Mouchoirs, cailloux, trésors…', 'Mets ta main dans chaque poche du pantalon.', 'Vérifie une seule poche.'],
      ['Mets-les dans le panier à linge', 'Tout d’un coup ou en deux fois.', 'Porte la pile jusqu’au panier et lâche-la dedans.', 'Mets un seul vêtement dans le panier.']
    ])
  },
  {
    id: 'nettoyer-toilettes',
    title: 'Nettoyer les toilettes',
    description: 'Une mission de pro, étape par étape.',
    illustration: 'toilettes',
    estimatedMinutes: 8,
    category: 'maison',
    isCustom: false,
    isDemo: true,
    trigger: 'Quand c’est mon jour de mission',
    moment: 'libre',
    steps: steps('nettoyer-toilettes', [
      ['Prépare ton matériel', 'Gants, produit, brosse, chiffon.', 'Mets les gants en premier, puis prends la brosse.', 'Mets un seul gant.'],
      ['Mets le produit dans la cuvette', 'Un tour suffit.', 'Soulève l’abattant et fais un petit tour de produit sous le rebord.', 'Soulève seulement l’abattant.'],
      ['Frotte avec la brosse', 'Tout autour, puis au fond.', 'Fais trois tours avec la brosse, comme une spirale.', 'Fais un seul tour avec la brosse.'],
      ['Essuie le dessus et la chasse d’eau', 'Avec le chiffon.', 'Plie le chiffon en deux et essuie de haut en bas.', 'Essuie seulement le bouton de la chasse d’eau.'],
      ['Tire la chasse et range le matériel', 'Mission accomplie.', 'Tire la chasse, puis remets la brosse à sa place.', 'Tire la chasse d’eau.']
    ])
  }
];

/** Étapes indispensables (version courte des jours difficiles), par position. */
const DEMO_ESSENTIALS: Record<string, number[]> = {
  'preparer-sac': [1, 2, 3, 5],
  'commencer-devoirs': [1, 2, 4],
  'ranger-activite': [1, 2],
  'debarrasser-table': [0, 1],
  'linge-sale': [0, 2]
};

export function markEssentials<T extends { steps: Step[] }>(routine: T, indices: number[] | undefined): T {
  if (!indices) return routine;
  return { ...routine, steps: routine.steps.map((st, i) => (indices.includes(i) ? { ...st, essential: true } : st)) };
}

export const DEMO_ROUTINES: Routine[] = DEMO_LIST.map((r) => markEssentials(r, DEMO_ESSENTIALS[r.id]));
