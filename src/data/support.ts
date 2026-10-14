// Accompagnement des parents : conseils de la semaine et pistes à explorer en France.
// Informations générales vérifiées le 14 octobre 2026. Elles ne remplacent pas l'avis d'un professionnel.

export const SUPPORT_CHECKED_ON = '14 octobre 2026';

export const WEEKLY_TIPS: { tip: string; say?: string }[] = [
  { tip: 'Rappelez le plan, pas la tâche.', say: '« C’est quoi ton plan quand tu as fini de goûter ? »' },
  { tip: 'Choisissez une seule bataille cette semaine, et lâchez les autres.' },
  { tip: 'Félicitez l’effort et la stratégie, pas la vitesse.', say: '« Tu as trouvé comment commencer. »' },
  { tip: 'Après une crise, attendez le calme pour en reparler, sans reproche.', say: '« Qu’est-ce qui t’aurait aidé tout à l’heure ? »' },
  { tip: 'Notez trois petites réussites de votre enfant, même minuscules, et dites-les-lui.' },
  { tip: 'Préparez la veille ce qui peut l’être : vêtements, sac, petit-déjeuner.' },
  { tip: 'Accordez-vous 15 minutes rien qu’à vous, sans culpabilité. Un parent reposé aide mieux.' },
  { tip: 'Proposez une version plus petite quand ça bloque.', say: '« Tu veux juste commencer par sortir ton cahier ? »' },
  { tip: 'Regardez l’île ensemble en fin de semaine, sans faire de bilan chiffré.', say: '« Regarde tout ce que tu as fait pousser. »' },
  { tip: 'Un jour sans n’efface pas les progrès. Une habitude met souvent plusieurs semaines à s’installer.' }
];

export function weeklyTip(now = new Date()) {
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000));
  return WEEKLY_TIPS[week % WEEKLY_TIPS.length];
}

export interface SupportItem {
  title: string;
  text: string;
  link?: { label: string; url: string };
}

export interface SupportSection {
  id: string;
  title: string;
  intro: string;
  items: SupportItem[];
}

export const SUPPORT_SECTIONS: SupportSection[] = [
  {
    id: 'sante',
    title: 'Faire le point avec un professionnel de santé',
    intro: 'Le médecin traitant ou le pédiatre est le premier interlocuteur, même sans diagnostic.',
    items: [
      {
        title: 'Le diagnostic',
        text: 'Aujourd’hui, le diagnostic de TDAH et le premier traitement médicamenteux relèvent d’un pédiatre, d’un pédopsychiatre ou d’un neuropédiatre. Selon les recommandations de la Haute Autorité de santé, les interventions non médicamenteuses (information des parents et de l’enfant, accompagnement scolaire) viennent en premier ; le médicament s’ajoute si besoin.',
        link: { label: 'Les recommandations HAS, résumées par Santé mentale', url: 'https://www.santementale.fr/2024/09/des-recos-pour-ameliorer-le-diagnostic-et-la-prise-en-charge-du-tdah-chez-lenfant-et-ladolescent/' }
      },
      {
        title: 'Les plateformes de coordination et d’orientation (PCO, 7-12 ans)',
        text: 'Pour un enfant de 7 à 12 ans chez qui on suspecte un trouble du neurodéveloppement (dont le TDAH), le médecin peut adresser la famille à une PCO. Exemple en Savoie : bilans et séances de psychomotricité, d’ergothérapie et de psychologie financés pendant un an renouvelable, sans frais pour les parents. Demandez à votre médecin la plateforme de votre département.',
        link: { label: 'Exemple : plaquette de la PCO 7-12 ans de Savoie (PDF)', url: 'https://annuaire.autismeinfoservice.fr/files/uploads/fiche/dyn/plaquette-pco-7---12-ans.pdf' }
      },
      {
        title: 'Mon soutien psy',
        text: 'Dès 3 ans, jusqu’à 12 séances par an chez un psychologue partenaire, à 50 € la séance, remboursées à 60 % par l’Assurance Maladie si un médecin vous oriente.',
        link: { label: 'Mon soutien psy, info.gouv.fr', url: 'https://www.info.gouv.fr/index.php/actualite/mon-soutien-psy-12-seances-remboursees-par-an' }
      }
    ]
  },
  {
    id: 'parents',
    title: 'Être accompagné comme parent',
    intro: 'Comprendre le TDAH et apprendre des façons de faire change souvent beaucoup le quotidien.',
    items: [
      {
        title: 'Les programmes d’entraînement aux habiletés parentales',
        text: 'Des séances, en groupe ou en individuel, pour apprendre des stratégies concrètes (consignes, encouragements, gestion des crises). Le plus connu en France est le programme Barkley, proposé par certains hôpitaux, centres médico-psychologiques et professionnels libéraux. Demandez à votre pédiatre ou à votre CMP s’il en existe un près de chez vous.',
        link: { label: 'Présentation de la formation Barkley, CHRU de Strasbourg (PDF)', url: 'https://formation.chru-strasbourg.fr/wp-content/uploads/sites/2/2022/08/fp-2026_implanter-le-programme-barkley_medecins-pediatres-.pdf' }
      },
      {
        title: 'HyperSupers TDAH France',
        text: 'L’association nationale de familles : groupes de parole, antennes locales tenues par des bénévoles, livrets « Le TDAH au quotidien » et « Le TDAH et l’école ».',
        link: { label: 'tdah-france.fr', url: 'https://www.tdah-france.fr' }
      },
      {
        title: 'Allô Parents en crise',
        text: 'Ligne d’écoute gratuite et anonyme, avec des psychologues et des travailleurs sociaux : 0 805 382 300, du lundi au vendredi de 10 h à 13 h et de 14 h à 17 h. Pour la scolarité, les conflits, l’épuisement, les écrans…',
        link: { label: 'Allô Parents en crise, caf.fr', url: 'https://caf.fr/allocataires/vies-de-famille/articles/allo-parents-en-crise-un-numero-vert-pour-soutenir-les-parents-en-difficulte' }
      }
    ]
  },
  {
    id: 'ecole',
    title: 'À l’école',
    intro: 'Parler tôt avec l’enseignant évite bien des malentendus.',
    items: [
      {
        title: 'Le plan d’accompagnement personnalisé (PAP)',
        text: 'Des aménagements pédagogiques pour les troubles des apprentissages, sans passer par la MDPH. La famille peut le demander à tout moment ; le médecin de l’Éducation nationale donne son avis. Demandez à l’école si votre enfant peut en bénéficier.',
        link: { label: 'Le PAP, Éduscol', url: 'https://eduscol.education.gouv.fr/1214/mettre-en-oeuvre-un-plan-d-accompagnement-personnalise' }
      },
      {
        title: 'Le projet personnalisé de scolarisation (PPS)',
        text: 'Si les aménagements ne suffisent pas et qu’une situation de handicap est reconnue par la MDPH : matériel adapté, aide humaine (AESH), accompagnement médico-social.',
        link: { label: 'PAP ou PPS, Éduscol', url: 'https://eduscol.education.gouv.fr/1214/mettre-en-oeuvre-un-plan-d-accompagnement-personnalise' }
      },
      {
        title: 'Des ressources pour les enseignants',
        text: 'Le site de l’association HyperSupers propose des fiches pour expliquer le TDAH en classe.',
        link: { label: 'tdahecole.fr', url: 'https://www.tdahecole.fr' }
      }
    ]
  },
  {
    id: 'droits',
    title: 'Les droits et aides',
    intro: 'Selon les besoins de l’enfant, la MDPH de votre département peut être sollicitée.',
    items: [
      {
        title: 'La MDPH et l’AEEH',
        text: 'L’allocation d’éducation de l’enfant handicapé (AEEH) peut être attribuée selon le taux d’incapacité reconnu et les besoins de l’enfant. Le dossier (formulaire cerfa et certificat médical récent) se dépose à la MDPH. Les montants sont revalorisés chaque année.',
        link: { label: 'L’AEEH expliquée, Handicap.fr', url: 'https://informations.handicap.fr/a-allocation-education-enfant-handicape-475.php' }
      }
    ]
  },
  {
    id: 'soi',
    title: 'Prendre soin de vous',
    intro: 'L’épuisement des parents d’enfants avec TDAH est fréquent. Ce n’est ni un échec, ni une faiblesse.',
    items: [
      {
        title: 'Se faire relayer',
        text: 'Grands-parents, amis, autre parent : confier l’enfant quelques heures, même rarement, permet de souffler. En parler à votre médecin si la fatigue s’installe.'
      },
      {
        title: 'Si vous êtes à bout',
        text: 'Le 3114, numéro national de prévention du suicide, répond 24 h/24, gratuitement, aux personnes en détresse et à leurs proches. En cas d’urgence, appelez le 15 ou le 112.',
        link: { label: 'Le 3114, sante.fr', url: 'https://www.sante.fr/le-numero-national-de-prevention-du-suicide-0' }
      }
    ]
  }
];
