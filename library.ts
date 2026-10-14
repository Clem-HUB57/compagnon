import type { IllustrationKey, Moment, RoutineCategory } from '../types';
import type { StepSeed } from './routines';

// Bibliothèque de modèles de routines, à ajouter depuis l'espace parent.
// Chaque modèle reste entièrement modifiable une fois ajouté.

export interface RoutineTemplate {
  templateId: string;
  group: 'Le matin' | 'Le soir' | 'L’école' | 'La maison' | 'Mes émotions';
  title: string;
  description: string;
  illustration: IllustrationKey;
  estimatedMinutes: number;
  category: RoutineCategory;
  moment: Moment;
  trigger: string;
  steps: StepSeed[];
  /** Positions des étapes indispensables (version courte). */
  essentials?: number[];
}

export const LIBRARY: RoutineTemplate[] = [
  // ------------------------------------------------------------ Le matin
  {
    templateId: 'modele-habiller',
    essentials: [2, 3, 4],
    group: 'Le matin',
    title: 'M’habiller',
    description: 'Des vêtements à l’endroit, dans l’ordre.',
    illustration: 'vetements',
    estimatedMinutes: 8,
    category: 'soin',
    moment: 'matin',
    trigger: 'Quand je sors du lit',
    steps: [
      ['Va chercher tes vêtements', 'Ceux préparés la veille, ou dans ton armoire.', 'Ouvre ton armoire ou va à la chaise où tu les as posés.', 'Touche simplement tes vêtements.'],
      ['Enlève ton pyjama', 'Pose-le sur ton lit.', 'Commence par le haut du pyjama.', 'Enlève juste le haut du pyjama.'],
      ['Mets tes sous-vêtements et tes chaussettes', 'Assieds-toi si c’est plus facile.', 'Assieds-toi sur le lit, puis enfile une chaussette.', 'Mets une seule chaussette.'],
      ['Mets ton pantalon ou ta jupe', 'L’étiquette va derrière.', 'Cherche l’étiquette : elle doit être dans ton dos.', 'Mets une seule jambe.'],
      ['Mets ton haut', 'T-shirt, pull ou sweat.', 'Passe d’abord la tête, puis les bras.', 'Passe juste la tête.'],
      ['Range ton pyjama', 'Sous ton oreiller ou plié sur le lit.', 'Plie-le en deux et pose-le sous ton oreiller.', 'Prends ton pyjama dans tes mains.']
    ]
  },
  {
    templateId: 'modele-petit-dejeuner',
    essentials: [1, 2],
    group: 'Le matin',
    title: 'Prendre mon petit-déjeuner',
    description: 'De l’énergie pour la journée.',
    illustration: 'dejeuner',
    estimatedMinutes: 15,
    category: 'soin',
    moment: 'matin',
    trigger: 'Quand je suis habillé',
    steps: [
      ['Assieds-toi à table', 'À ta place habituelle.', 'Tire ta chaise et assieds-toi.', 'Va jusqu’à la table.'],
      ['Sers-toi ou prends ce qui est prêt', 'Bol, tartines, fruit…', 'Prends ton bol et mets-le devant toi.', 'Prends juste ton bol.'],
      ['Mange tranquillement', 'Pas besoin de te dépêcher.', 'Commence par une bouchée.', 'Prends une seule bouchée.', 15],
      ['Débarrasse ta place', 'Bol et couverts dans l’évier.', 'Prends ton bol avec deux mains et porte-le à l’évier.', 'Apporte juste ta cuillère.']
    ]
  },
  {
    templateId: 'modele-dents-matin',
    essentials: [0, 1, 2],
    group: 'Le matin',
    title: 'Me brosser les dents',
    description: 'Deux minutes pour des dents toutes propres.',
    illustration: 'dents',
    estimatedMinutes: 4,
    category: 'soin',
    moment: 'matin',
    trigger: 'Quand j’ai fini de manger',
    steps: [
      ['Mets du dentifrice sur ta brosse', 'Une petite noisette suffit.', 'Prends ta brosse, puis appuie doucement sur le tube.', 'Prends ta brosse dans ta main.'],
      ['Brosse les dents du haut', 'Petits cercles, devant et derrière.', 'Commence par les dents du fond, à droite.', 'Brosse trois dents seulement.'],
      ['Brosse les dents du bas', 'Sans oublier le fond.', 'Passe de l’autre côté, toujours en petits cercles.', 'Brosse trois dents du bas.'],
      ['Rince et range ta brosse', 'Le gobelet, puis le verre à dents.', 'Rince ta bouche, puis la brosse sous l’eau.', 'Rince juste ta bouche.']
    ]
  },

  // ------------------------------------------------------------ Le soir
  {
    templateId: 'modele-douche',
    essentials: [2, 3, 4],
    group: 'Le soir',
    title: 'Prendre ma douche',
    description: 'Propre de la tête aux pieds.',
    illustration: 'douche',
    estimatedMinutes: 15,
    category: 'soin',
    moment: 'soir',
    trigger: 'Quand on me dit que c’est l’heure de la douche',
    steps: [
      ['Prépare ta serviette et ton pyjama', 'À portée de main.', 'Pose la serviette sur le crochet et le pyjama sur le tabouret.', 'Va chercher ta serviette.'],
      ['Déshabille-toi et mets le linge au sale', 'Directement dans le panier.', 'Enlève un vêtement et lâche-le dans le panier.', 'Enlève tes chaussettes.'],
      ['Lave-toi avec le savon', 'Du haut vers le bas.', 'Mets un peu de savon dans ta main et commence par les bras.', 'Mouille-toi sous l’eau.', 15],
      ['Rince-toi bien', 'Plus de mousse nulle part.', 'Passe sous l’eau en tournant doucement.', 'Rince tes bras.'],
      ['Sèche-toi et mets ton pyjama', 'Bien au chaud.', 'Enroule-toi dans la serviette, puis frotte doucement.', 'Enroule-toi dans ta serviette.']
    ]
  },
  {
    templateId: 'modele-vetements-demain',
    essentials: [1, 3],
    group: 'Le soir',
    title: 'Préparer mes vêtements',
    description: 'Le matin, tout est déjà prêt.',
    illustration: 'vetements',
    estimatedMinutes: 5,
    category: 'soin',
    moment: 'soir',
    trigger: 'Quand j’ai mis mon pyjama',
    steps: [
      ['Regarde le temps qu’il fera demain', 'Ou demande à un adulte.', 'Demande : « il fera chaud ou froid demain ? »', 'Pose juste la question à un adulte.'],
      ['Choisis ton haut et ton bas', 'Ce que tu aimes, adapté à la météo.', 'Ouvre ton armoire et sors un haut.', 'Sors juste un haut.'],
      ['Ajoute sous-vêtements et chaussettes', 'Une paire, pas plus.', 'Ouvre ton tiroir et prends une paire de chaussettes.', 'Prends une seule chaussette.'],
      ['Pose tout au même endroit', 'Sur ta chaise, par exemple.', 'Empile les vêtements dans l’ordre où tu les mettras.', 'Pose un seul vêtement sur la chaise.']
    ]
  },
  {
    templateId: 'modele-coucher',
    essentials: [0, 4],
    group: 'Le soir',
    title: 'Me préparer pour dormir',
    description: 'Un coucher calme, étape par étape.',
    illustration: 'lit',
    estimatedMinutes: 10,
    category: 'soin',
    moment: 'soir',
    trigger: 'Quand on me dit que c’est l’heure d’aller au lit',
    steps: [
      ['Brosse-toi les dents', 'Deux minutes.', 'Va à la salle de bain et prends ta brosse.', 'Prends ta brosse à dents.'],
      ['Va aux toilettes', 'Pour ne pas te relever.', 'Passe par les toilettes avant d’aller dans ta chambre.', 'Va jusqu’à la porte des toilettes.'],
      ['Pose les écrans', 'Ils dorment aussi.', 'Pose la tablette ou le téléphone à son endroit de nuit.', 'Éteins juste l’écran.'],
      ['Choisis un moment calme', 'Lecture, histoire ou câlin.', 'Choisis un livre ou demande une histoire.', 'Prends un livre dans tes mains.'],
      ['Installe-toi dans ton lit', 'Bonne nuit !', 'Glisse-toi sous la couette et pose ta tête sur l’oreiller.', 'Assieds-toi sur ton lit.']
    ]
  },

  // ------------------------------------------------------------ L'école
  {
    templateId: 'modele-lecon',
    essentials: [0, 1, 3],
    group: 'L’école',
    title: 'Apprendre une leçon',
    description: 'Lire, cacher, redire.',
    illustration: 'livre',
    estimatedMinutes: 15,
    category: 'ecole',
    moment: 'apres-ecole',
    trigger: 'Quand j’ai fini de goûter',
    steps: [
      ['Ouvre ton cahier à la leçon', 'Le cahier de textes te dit laquelle.', 'Cherche le titre de la leçon dans ton cahier.', 'Ouvre juste le bon cahier.'],
      ['Lis la leçon une fois en entier', 'À voix haute si tu veux.', 'Pose ton doigt sous la première ligne et lis.', 'Lis seulement le titre.'],
      ['Lis la première partie deux fois', 'Un paragraphe, pas plus.', 'Relis le premier paragraphe, puis encore une fois.', 'Relis une seule phrase.'],
      ['Cache et redis ce que tu as retenu', 'Avec une feuille sur la leçon.', 'Pose une feuille sur la leçon et dis ce dont tu te souviens.', 'Dis juste un mot important.', 15],
      ['Vérifie et recommence avec la suite', 'Paragraphe par paragraphe.', 'Enlève la feuille et compare avec ce que tu as dit.', 'Regarde la leçon et compare un seul mot.'],
      ['Récite à quelqu’un', 'Un adulte, un frère, une sœur ou ton compagnon !', 'Va voir quelqu’un et dis : « tu m’écoutes ? »', 'Récite juste la première phrase.']
    ]
  },
  {
    templateId: 'modele-controle',
    group: 'L’école',
    title: 'Réviser un contrôle',
    description: 'Un peu chaque jour, c’est plus facile.',
    illustration: 'livre',
    estimatedMinutes: 20,
    category: 'ecole',
    moment: 'apres-ecole',
    trigger: 'Quand j’ai fini de goûter',
    steps: [
      ['Regarde ce qui tombe au contrôle', 'Sur le cahier de textes ou l’agenda.', 'Ouvre ton cahier de textes à la date du contrôle.', 'Trouve juste la date du contrôle.'],
      ['Choisis une seule partie pour aujourd’hui', 'Pas tout d’un coup.', 'Pose ton doigt sur la première partie à revoir.', 'Choisis juste un titre.'],
      ['Relis cette partie', 'Lentement.', 'Lis la partie, puis souligne avec ton doigt les mots importants.', 'Lis la première phrase.'],
      ['Fais un exercice ou réponds à une question', 'Sans regarder la leçon.', 'Prends un exercice déjà fait en classe et refais-le.', 'Écris juste la consigne.', 15],
      ['Note ce qui reste à revoir', 'Pour la prochaine fois.', 'Écris sur un papier le titre de la partie suivante.', 'Écris un seul mot.']
    ]
  },
  {
    templateId: 'modele-poesie',
    group: 'L’école',
    title: 'Apprendre une poésie',
    description: 'Vers par vers, comme une chanson.',
    illustration: 'livre',
    estimatedMinutes: 15,
    category: 'ecole',
    moment: 'apres-ecole',
    trigger: 'Quand j’ai fini de goûter',
    steps: [
      ['Lis la poésie en entier', 'Pour l’entendre une fois.', 'Lis-la à voix haute, doucement.', 'Lis juste le titre et l’auteur.'],
      ['Apprends les deux premiers vers', 'Répète-les trois fois.', 'Lis le premier vers, ferme les yeux et répète-le.', 'Répète juste le premier vers.', 15],
      ['Ajoute les deux vers suivants', 'Et redis depuis le début.', 'Lis les vers 3 et 4, puis recommence depuis le début.', 'Ajoute un seul vers.'],
      ['Récite sans regarder', 'Retourne la feuille.', 'Retourne la feuille et dis tout ce que tu sais.', 'Récite juste le premier vers sans regarder.'],
      ['Récite à quelqu’un', 'Avec le ton, si tu veux.', 'Va voir quelqu’un et dis : « tu veux entendre ma poésie ? »', 'Dis juste le titre à quelqu’un.']
    ]
  },

  // ------------------------------------------------------------ La maison
  {
    templateId: 'modele-animal',
    essentials: [0, 1, 2],
    group: 'La maison',
    title: 'Nourrir mon animal',
    description: 'Il compte sur toi.',
    illustration: 'animal',
    estimatedMinutes: 5,
    category: 'maison',
    moment: 'matin',
    trigger: 'Quand je descends le matin',
    steps: [
      ['Prends sa gamelle', 'Vide-la si besoin.', 'Va jusqu’à sa gamelle et prends-la.', 'Va jusqu’à la gamelle.'],
      ['Mets la bonne quantité de nourriture', 'La dose habituelle.', 'Prends la mesurette et remplis-la une fois.', 'Ouvre juste le sac de nourriture.'],
      ['Change l’eau', 'De l’eau fraîche.', 'Vide le bol d’eau dans l’évier et remplis-le.', 'Vide juste le bol d’eau.'],
      ['Range la nourriture', 'Fermée, à sa place.', 'Ferme bien le sac et range-le dans son placard.', 'Ferme juste le sac.']
    ]
  },
  {
    templateId: 'modele-mettre-table',
    essentials: [1, 2, 3],
    group: 'La maison',
    title: 'Mettre la table',
    description: 'Tout le monde a sa place.',
    illustration: 'table',
    estimatedMinutes: 5,
    category: 'maison',
    moment: 'soir',
    trigger: 'Quand on me dit que le repas est presque prêt',
    steps: [
      ['Compte combien vous êtes', 'Une place par personne.', 'Dis le prénom de chaque personne qui mange.', 'Dis juste ton prénom et celui d’un adulte.'],
      ['Pose les assiettes', 'Une devant chaque chaise.', 'Prends la pile d’assiettes et fais le tour de la table.', 'Pose une seule assiette.'],
      ['Ajoute les verres', 'En haut à droite de l’assiette.', 'Prends deux verres à la fois.', 'Pose un seul verre.'],
      ['Ajoute les couverts', 'Fourchette à gauche, couteau à droite.', 'Prends une fourchette et un couteau pour chaque place.', 'Pose une seule fourchette.'],
      ['Ajoute ce qui manque', 'Carafe d’eau, pain, serviettes.', 'Demande : « qu’est-ce qui manque encore ? »', 'Apporte juste la carafe d’eau.']
    ]
  },

  // ------------------------------------------------------------ Mes émotions (s'entraîner au calme)
  {
    templateId: 'modele-respirer',
    group: 'Mes émotions',
    title: 'M’entraîner à respirer',
    description: 'On s’entraîne quand tout va bien, pour savoir le faire quand c’est difficile.',
    illustration: 'respirer',
    estimatedMinutes: 4,
    category: 'soin',
    moment: 'libre',
    trigger: 'Quand je rentre et que tout est calme',
    steps: [
      ['Installe-toi confortablement', 'Sur une chaise ou sur ton lit, comme tu préfères.', 'Pose tes pieds bien à plat ou allonge-toi sur ton lit.', 'Assieds-toi, c’est tout.'],
      ['Respire avec ton compagnon', 'Une minute, au rythme de ton compagnon.', 'Touche le bouton de l’exercice et suis ton compagnon.', 'Fais juste trois grandes respirations.', 15, 'respirer'],
      ['Remarque ce qui a changé', 'Dans ton corps, dans ta tête.', 'Pose une main sur ton ventre : est-ce qu’il bouge plus doucement ?', 'Dis juste un mot sur comment tu te sens.']
    ]
  },
  {
    templateId: 'modele-plan-tempete',
    group: 'Mes émotions',
    title: 'Préparer mon plan tempête',
    description: 'À faire avec un adulte, à un moment calme.',
    illustration: 'respirer',
    estimatedMinutes: 10,
    category: 'soin',
    moment: 'libre',
    trigger: 'Quand on a un moment tranquille ensemble',
    steps: [
      ['Pense à une fois où c’était difficile', 'Une grosse colère, une grande tristesse…', 'Raconte à l’adulte ce qui s’était passé, en quelques mots.', 'Dis juste : « je me souviens d’une fois… »'],
      ['Repère ce que ton corps ressent', 'Cœur qui bat vite, poings serrés, ventre noué…', 'Montre avec ta main où tu sens l’émotion dans ton corps.', 'Montre juste un endroit de ton corps.'],
      ['Choisis ton outil et écris ton plan', 'Quand je sens…, alors je…', 'Touche le bouton pour ouvrir ton plan tempête.', 'Choisis juste un outil.', 15, 'plan'],
      ['Montre ton plan à un adulte', 'Il pourra te le rappeler gentiment.', 'Lis ton plan à voix haute à l’adulte.', 'Montre l’écran à l’adulte.']
    ]
  },
  {
    templateId: 'modele-cinq-sens',
    group: 'Mes émotions',
    title: 'M’entraîner au jeu des 5 sens',
    description: 'Pour revenir dans l’instant présent.',
    illustration: 'respirer',
    estimatedMinutes: 5,
    category: 'soin',
    moment: 'libre',
    trigger: 'Quand je rentre et que tout est calme',
    steps: [
      ['Arrête-toi un instant', 'Pose ce que tu as dans les mains.', 'Pose tes affaires et reste immobile trois secondes.', 'Pose juste ce que tu tiens.'],
      ['Fais le jeu des 5 sens', 'Voir, entendre, toucher, sentir, penser.', 'Touche le bouton de l’exercice et suis les étapes.', 'Trouve juste une chose que tu vois.', 15, 'cinq-sens'],
      ['Raconte ce que tu as remarqué', 'À quelqu’un ou dans ta tête.', 'Dis une chose que tu n’avais pas remarquée avant.', 'Dis juste un mot.']
    ]
  }
];

export const LIBRARY_GROUPS = ['Le matin', 'Le soir', 'L’école', 'La maison', 'Mes émotions'] as const;
