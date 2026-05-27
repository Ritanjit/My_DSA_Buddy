export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'unsolved' | 'attempted' | 'solved';

export interface Problem {
  id: number;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  companies: string[];
  status: ProblemStatus;
  solvedAt?: string;
  timeSpent?: number;
  language?: string;
  solution?: string;
  notes?: string;
  url: string;
  githubPath?: string;
  frequency?: number;
}
