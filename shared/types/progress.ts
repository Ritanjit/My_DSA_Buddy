export interface DailyProgress {
  date: string;
  problemsSolved: number;
  timeSpent: number;
  problemIds: number[];
}

export interface UserStats {
  totalSolved: number;
  currentStreak: number;
  longestStreak: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  byTopic: Record<string, number>;
  byCompany: Record<string, number>;
  lastSolvedAt?: string;
}
