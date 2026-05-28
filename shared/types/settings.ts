import type { Difficulty } from './problem';

export interface UserSettings {
  githubPat?: string;
  githubRepo?: string;
  githubBranch: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  syncOnSolve: boolean;
  theme: 'light' | 'dark' | 'system';
  solutionFormat: 'markdown' | 'code-only';
  solutionPath: string;
}

export interface SyncPayload {
  problemId: number;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  language: string;
  solution: string;
  solvedAt: string;
  url: string;
  githubPath?: string;
}
