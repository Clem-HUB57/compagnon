import type { CompanionId } from '../types';

export interface CompanionInfo {
  id: CompanionId;
  defaultName: string;
  species: string;
  description: string;
}

// Quatre créatures originales, inventées pour Compagnon.
export const COMPANIONS: CompanionInfo[] = [
  { id: 'moki', defaultName: 'Moki', species: 'Une boule toute douce', description: 'Moelleux, curieux et un peu farceur.' },
  { id: 'tika', defaultName: 'Tika', species: 'Un petit dino des îles', description: 'Courageux, il adore explorer.' },
  { id: 'boulon', defaultName: 'Boulon', species: 'Un robot bâtisseur', description: 'Il construit tout, une pièce à la fois.' },
  { id: 'lyra', defaultName: 'Lyra', species: 'Une renarde des étoiles', description: 'Elle brille un peu plus à chaque mission.' }
];

export function getCompanion(id: CompanionId): CompanionInfo {
  return COMPANIONS.find((c) => c.id === id) ?? COMPANIONS[0];
}
