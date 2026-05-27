import type { Difficulty } from '../types/problem';

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: '#5db872',
  Medium: '#d4a017',
  Hard: '#c64545',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard',
};

export const DIFFICULTY_ORDER: Difficulty[] = ['Easy', 'Medium', 'Hard'];
