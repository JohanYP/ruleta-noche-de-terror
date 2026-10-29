export interface RouletteCard {
  id: string;
  number: number;
  formatted: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function formatNum(n: number): string {
  return n.toString().padStart(4, '0');
}

export function getRarity(n: number): 'common' | 'rare' | 'epic' | 'legendary' {
  if (n % 100 === 0 || n === 666 || n === 1000 || n === 2000) return 'legendary';
  if (n % 25 === 0) return 'epic';
  if (n % 5 === 0) return 'rare';
  return 'common';
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
