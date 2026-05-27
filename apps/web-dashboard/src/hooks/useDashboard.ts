import { useState, useEffect } from 'react';
import type { UserStats, DailyProgress } from '@shared/types/progress';
import type { Problem } from '@shared/types/problem';

interface ProgressData {
  stats: UserStats;
  progress: DailyProgress[];
}

const defaultStats: UserStats = {
  totalSolved: 0,
  currentStreak: 0,
  longestStreak: 0,
  byDifficulty: { easy: 0, medium: 0, hard: 0 },
  byTopic: {},
  byCompany: {},
};

export function useProgress() {
  const [data, setData] = useState<ProgressData>({ stats: defaultStats, progress: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/progress')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: ProgressData) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { ...data, loading, error };
}

export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/problems')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: Problem[]) => setProblems(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { problems, loading, error };
}
