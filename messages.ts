// Messages bienveillants : on valorise l'effort, la stratégie et la reprise.
// Jamais de jugement sur la vitesse ou la quantité.

export const STEP_MESSAGES = [
  'Une étape de plus !',
  'C’est fait. Tu avances pas à pas.',
  'Bien joué d’avoir commencé.',
  'Encore un petit pas.',
  'Tu as trouvé comment faire.',
  'Ça avance !'
];

export const STEP_AFTER_HELP_MESSAGES = [
  'Demander de l’aide, c’est une vraie stratégie.',
  'Tu as trouvé une façon de commencer.',
  'Une étape plus petite, et c’est fait !'
];

export const END_MESSAGES = [
  'Tu as avancé étape par étape !',
  'Tu as trouvé une façon de commencer.',
  'Mission accomplie, à ton rythme.',
  'Tu as tenu jusqu’au bout de ta quête.',
  'Chaque étape compte, et tu les as faites.'
];

export const END_AFTER_PAUSE_MESSAGES = [
  'Tu as fait une pause, puis tu as repris. C’est une super stratégie.',
  'Reprendre après une pause, ça compte beaucoup.'
];

export const GREETINGS = [
  'Ça me fait plaisir de te voir !',
  'On part pour une petite quête ?',
  'On regarde ce qu’on fait ensemble ?',
  'Ton île t’attendait tranquillement.'
];

export const PAUSE_MESSAGES = [
  'Prends le temps qu’il te faut.',
  'Une pause, c’est permis. Tout ce que tu as fait reste fait.'
];

export function pick<T>(list: T[], seed?: number): T {
  const i = seed === undefined ? Math.floor(Math.random() * list.length) : Math.abs(seed) % list.length;
  return list[i];
}
