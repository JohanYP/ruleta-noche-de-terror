import { MAX_NUMBER, MIN_NUMBER, NUMBER_DIGITS } from '../config/roulette';

export interface RouletteCard {
  number: number;
  formatted: string;
}

export function formatNum(n: number): string {
  return n.toString().padStart(NUMBER_DIGITS, '0');
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomTicketNumber(): number {
  return getRandomInt(MIN_NUMBER, MAX_NUMBER);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
