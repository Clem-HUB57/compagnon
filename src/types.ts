// Modèle de données de Compagnon.
// Toutes les données restent sur l'appareil (IndexedDB). Aucune donnée sensible.

export type RoutineCategory = 'ecole' | 'maison' | 'perso';

export type IllustrationKey =
  | 'sac'
  | 'devoirs'
  | 'ranger'
  | 'vaisselle'
  | 'table'
  | 'linge'
  | 'toilettes'
  | 'etoile';

/** Niveau d'aide d'une routine : l'aide est retirée progressivement (estompage). */
export type AidLevel = 'guide' | 'condense' | 'autonome';

export interface Step {
  id: string;
  title: string;
  description: string;
  /** Consigne « Montre-moi comment commencer ». */
  helpText: string;
  /** Version plus petite et concrète de l'étape (« Rends cette étape plus facile »). */
  easierText: string;
  /** XP gagnés (bornés entre XP_MIN et XP_MAX). */
  xpReward: number;
  order: number;
}

export interface Routine {
  id: string;
  title: string;
  description: string;
  illustration: IllustrationKey;
  estimatedMinutes: number;
  steps: Step[];
  category: RoutineCategory;
  isCustom: boolean;
  /** Vrai pour les routines d'exemple fournies avec l'application. */
  isDemo: boolean;
  /** Déclencheur du plan « Quand…, alors… » (ex. « Quand je rentre de l'école »). */
  trigger: string;
}

export type SessionStatus = 'en_cours' | 'en_pause' | 'terminee' | 'mise_de_cote';
export type Mood = 'facile' | 'moyen' | 'difficile';

export interface Session {
  id: string;
  routineId: string;
  /** Titre de la routine au moment de la session (pour l'historique). */
  routineTitle: string;
  startedAt: string;
  completedAt: string | null;
  completedStepIds: string[];
  status: SessionStatus;
  aidLevel: AidLevel;
  xpEarned: number;
  helpUsed: number;
  pauses: number;
  bonusAwarded: boolean;
  totalSteps: number;
  mood?: Mood;
}

export type CosmeticKind = 'couleur' | 'accessoire' | 'decor' | 'ambiance';
export type CosmeticSource = 'depart' | 'niveau' | 'trouvaille';

export interface Cosmetic {
  id: string;
  name: string;
  kind: CosmeticKind;
  source: CosmeticSource;
  /** Niveau minimal pour être proposé au choix (source « niveau »). */
  minLevel: number;
}

export type FindingEvent = 'reprise' | 'aide' | 'decouverte' | 'autonomie';

export interface RoutineStats {
  completions: number;
  aidLevel: AidLevel;
  completionsAtLevel: number;
  /** Nombre de réussites au moment où l'enfant a dit « pas maintenant » à une offre. */
  declinedAt: number | null;
  /** Offre de passage au niveau suivant en attente de réponse. */
  pendingOffer: AidLevel | null;
  lastCompletedAt: string | null;
}

export interface PendingChoice {
  id: string;
  level: number;
  options: string[];
}

export interface Badge {
  id: string;
  routineId: string;
  title: string;
  earnedAt: string;
}

export interface Equipped {
  color: string;
  accessory: string | null;
  ambiance: string;
  decor: string[];
}

export interface Progression {
  totalXp: number;
  level: number;
  unlockedCosmetics: string[];
  worldStage: number;
  equipped: Equipped;
  pendingChoices: PendingChoice[];
  routineStats: Record<string, RoutineStats>;
  eventCounts: Record<FindingEvent, number>;
  badges: Badge[];
  /** Paliers de trouvailles déjà récompensés (ex. « aide:3 »). */
  rewardedMilestones: string[];
  /** Objets débloqués pas encore vus (pastille « nouveau »). */
  unseen: string[];
}

export type CompanionId = 'moki' | 'tika' | 'boulon' | 'lyra';

export interface Profile {
  childName: string;
  companionId: CompanionId;
  companionName: string;
  createdAt: string;
}

export interface DisplayPreferences {
  textSize: 'normal' | 'grand';
}

export interface Preferences {
  soundEnabled: boolean;
  /** 'systeme' suit le réglage de l'appareil. */
  reducedMotion: 'systeme' | 'oui' | 'non';
  voiceEnabled: boolean;
  autoRead: boolean;
  displayPreferences: DisplayPreferences;
}

export interface AppState {
  schemaVersion: number;
  profile: Profile | null;
  routines: Routine[];
  sessions: Session[];
  progression: Progression;
  preferences: Preferences;
  createdAt: string;
}

/** Ce qui s'est passé lors d'une action, pour que l'interface puisse réagir. */
export interface ActionEvents {
  xpGained: number;
  levelUp: { from: number; to: number } | null;
  worldStageChanged: { from: number; to: number } | null;
  sessionCompleted: boolean;
  findings: { cosmeticId: string; reason: FindingEvent }[];
  badge: Badge | null;
  offer: AidLevel | null;
}
