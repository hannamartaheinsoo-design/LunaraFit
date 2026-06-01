import { ExerciseTemplate } from '../types';
import { getCategoryDbIds } from './exercises';

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function scoreExercise(exercise: ExerciseTemplate, query: string): number {
  const q = normalize(query);
  const name = normalize(exercise.name);
  const words = name.split(/\s+/);

  // Exact full match
  if (name === q) return 100;
  // Starts with full query
  if (name.startsWith(q)) return 90;
  // Contains full query
  if (name.includes(q)) return 75;
  // Any word starts with query
  if (words.some(w => w.startsWith(q))) return 80;
  // Any word contains query
  if (words.some(w => w.includes(q))) return 60;

  // Fuzzy: check each word with levenshtein
  if (q.length >= 3) {
    for (const word of words) {
      const slice = word.slice(0, Math.min(word.length, q.length + 1));
      const dist = levenshtein(q, slice);
      if (dist === 1) return 55;
      if (dist === 2 && q.length >= 4) return 35;
    }
  }

  return 0;
}

export function searchExercises(
  query: string,
  exercises: ExerciseTemplate[],
  recentIds: string[],
  categoryFilter: string = 'all',
): ExerciseTemplate[] {
  // Apply category filter (supports grouped categories like 'cardio-all')
  const dbIds = getCategoryDbIds(categoryFilter);
  let pool = dbIds === null
    ? exercises
    : exercises.filter(e => dbIds.includes(e.category));

  const q = query.trim();

  if (!q) {
    // No query: recent first, then by popularity
    return [...pool].sort((a, b) => {
      const aR = recentIds.indexOf(a.id);
      const bR = recentIds.indexOf(b.id);
      if (aR !== -1 && bR !== -1) return aR - bR;
      if (aR !== -1) return -1;
      if (bR !== -1) return 1;
      return b.popularity - a.popularity;
    });
  }

  // Score everything
  const scored = pool
    .map(ex => ({ ex, score: scoreExercise(ex, q) }))
    .filter(s => s.score > 0)
    .sort((a, b) => {
      // Primary: score
      if (b.score !== a.score) return b.score - a.score;
      // Secondary: recently used
      const aR = recentIds.indexOf(a.ex.id);
      const bR = recentIds.indexOf(b.ex.id);
      if (aR !== -1 && bR !== -1) return aR - bR;
      if (aR !== -1) return -1;
      if (bR !== -1) return 1;
      // Tertiary: popularity
      return b.ex.popularity - a.ex.popularity;
    });

  return scored.map(s => s.ex);
}
