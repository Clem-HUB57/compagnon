// Préparation rapide des routines par le parent : démarrage express et saisie en liste.
import { DEMO_ROUTINES } from '../data/routines';
import { LIBRARY } from '../data/library';
import type { AppState, IllustrationKey, Moment, Routine, RoutineCategory } from '../types';
import { addFromLibrary, deleteRoutine, makeId, newStep } from './engine';

export interface ExpressChoice {
  id: string;
  label: string;
  group: 'Le matin' | 'L’école' | 'La maison' | 'Le soir';
  /** Routine d'exemple (id) ou modèle de la bibliothèque (templateId). */
  demo?: string;
  template?: string;
}

export const EXPRESS_CHOICES: ExpressChoice[] = [
  { id: 'habiller', label: 'S’habiller le matin', group: 'Le matin', template: 'modele-habiller' },
  { id: 'petit-dejeuner', label: 'Le petit-déjeuner', group: 'Le matin', template: 'modele-petit-dejeuner' },
  { id: 'dents', label: 'Se brosser les dents', group: 'Le matin', template: 'modele-dents-matin' },
  { id: 'sac', label: 'Préparer le sac', group: 'L’école', demo: 'preparer-sac' },
  { id: 'devoirs', label: 'Se mettre aux devoirs', group: 'L’école', demo: 'commencer-devoirs' },
  { id: 'lecon', label: 'Apprendre une leçon', group: 'L’école', template: 'modele-lecon' },
  { id: 'ranger', label: 'Ranger après avoir joué', group: 'La maison', demo: 'ranger-activite' },
  { id: 'vaisselle', label: 'Vider le lave-vaisselle', group: 'La maison', demo: 'vider-lave-vaisselle' },
  { id: 'mettre-table', label: 'Mettre la table', group: 'La maison', template: 'modele-mettre-table' },
  { id: 'debarrasser', label: 'Débarrasser la table', group: 'La maison', demo: 'debarrasser-table' },
  { id: 'linge', label: 'Le linge sale', group: 'La maison', demo: 'linge-sale' },
  { id: 'toilettes', label: 'Nettoyer les toilettes', group: 'La maison', demo: 'nettoyer-toilettes' },
  { id: 'animal', label: 'S’occuper de l’animal', group: 'La maison', template: 'modele-animal' },
  { id: 'douche', label: 'La douche', group: 'Le soir', template: 'modele-douche' },
  { id: 'vetements', label: 'Préparer ses vêtements', group: 'Le soir', template: 'modele-vetements-demain' },
  { id: 'coucher', label: 'Se préparer pour dormir', group: 'Le soir', template: 'modele-coucher' }
];

export const EXPRESS_GROUPS = ['Le matin', 'L’école', 'La maison', 'Le soir'] as const;
export const EXPRESS_RECOMMENDED_MAX = 3;

function hasChoice(state: AppState, c: ExpressChoice): boolean {
  return c.demo ? state.routines.some((r) => r.id === c.demo) : state.routines.some((r) => r.templateId === c.template);
}

/**
 * Prépare les routines choisies. Si `keepOthers` est faux, les routines d'exemple
 * non choisies sont retirées (les routines créées par le parent sont toujours gardées).
 */
export function expressSetup(state: AppState, choiceIds: string[], keepOthers: boolean): AppState {
  const chosen = EXPRESS_CHOICES.filter((c) => choiceIds.includes(c.id));
  let s = state;
  for (const c of chosen) {
    if (hasChoice(s, c)) continue;
    if (c.demo) {
      const demo = DEMO_ROUTINES.find((r) => r.id === c.demo);
      if (demo) s = { ...s, routines: [...s.routines, structuredClone(demo)] };
    } else {
      const t = LIBRARY.find((x) => x.templateId === c.template);
      if (t) s = addFromLibrary(s, t).state;
    }
  }
  if (!keepOthers) {
    const keepDemo = new Set(chosen.map((c) => c.demo).filter(Boolean));
    for (const r of s.routines.filter((x) => x.isDemo && !keepDemo.has(x.id))) s = deleteRoutine(s, r.id);
  }
  return s;
}

const KEYWORDS: [RegExp, IllustrationKey][] = [
  [/sac|cartable|trousse/i, 'sac'],
  [/devoir|cahier|exercice|écri|ecri/i, 'devoirs'],
  [/leçon|lecon|lire|lecture|livre|poésie|poesie|réviser|reviser/i, 'livre'],
  [/vaisselle|assiette/i, 'vaisselle'],
  [/table/i, 'table'],
  [/linge|panier|machine/i, 'linge'],
  [/toilette|wc|salle de bain|lavabo/i, 'toilettes'],
  [/habill|vêtement|vetement|pyjama|chaussure/i, 'vetements'],
  [/déjeuner|dejeuner|goûter|gouter|repas|manger/i, 'dejeuner'],
  [/dent/i, 'dents'],
  [/douche|bain/i, 'douche'],
  [/coucher|dormir|lit\b|nuit/i, 'lit'],
  [/chat|chien|animal|poisson|lapin|hamster/i, 'animal'],
  [/calme|respir|colère|colere|émotion|emotion/i, 'respirer'],
  [/rang|chambre|jouet|lego|bureau/i, 'ranger']
];

/** Choisit une illustration d'après le titre. */
export function guessIllustration(title: string): IllustrationKey {
  return KEYWORDS.find(([re]) => re.test(title))?.[1] ?? 'etoile';
}

function guessCategory(il: IllustrationKey): RoutineCategory {
  if (['sac', 'devoirs', 'livre'].includes(il)) return 'ecole';
  if (['dents', 'douche', 'vetements', 'lit', 'dejeuner'].includes(il)) return 'soin';
  if (['vaisselle', 'table', 'linge', 'toilettes', 'ranger', 'animal'].includes(il)) return 'maison';
  return 'perso';
}

/** Une étape par ligne ; puces, numéros et lignes vides sont ignorés. */
export function parseStepLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-•*·–—]|\d+[.)]|[a-z][.)])\s*/i, '').trim())
    .filter(Boolean)
    .map((l) => (l.length > 80 ? l.slice(0, 80).trimEnd() : l))
    .map((l) => l.charAt(0).toUpperCase() + l.slice(1))
    .slice(0, 12);
}

/** Crée une routine complète à partir d'un titre, d'un moment et d'une liste d'étapes. */
export function quickRoutine(opts: { title: string; moment: Moment; lines: string[]; trigger?: string }): Routine {
  const illustration = guessIllustration(opts.title);
  const steps = opts.lines.map((title, i) => ({ ...newStep(i), title }));
  return {
    id: makeId('routine'),
    title: opts.title.trim() || 'Ma routine',
    description: '',
    illustration,
    estimatedMinutes: Math.max(2, Math.min(30, steps.length * 2)),
    category: guessCategory(illustration),
    isCustom: true,
    isDemo: false,
    trigger: opts.trigger ?? '',
    moment: opts.moment,
    steps
  };
}
