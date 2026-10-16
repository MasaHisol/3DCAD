// Learner progress, kept in this browser / desktop profile only.
const KEY = "3dcad.learn.v1";

export interface Progress {
  /** Lessons whose steps were all completed. */
  done: Record<string, string>;
  /** Best quiz score per lesson: [correct, total]. */
  quiz: Record<string, [number, number]>;
  /** Exercises whose requirements were all met. */
  exercises: Record<string, string>;
  /** Last lesson opened. */
  last?: string;
}

const empty = (): Progress => ({ done: {}, quiz: {}, exercises: {} });

export function loadProgress(): Progress {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return empty();
    return { ...empty(), ...(JSON.parse(s) as Partial<Progress>) };
  } catch {
    return empty();
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable: progress is just not remembered */
  }
}

export function updateProgress(fn: (p: Progress) => void): Progress {
  const p = loadProgress();
  fn(p);
  saveProgress(p);
  return p;
}

export function resetProgress() {
  saveProgress(empty());
}

export const today = () => new Date().toISOString().slice(0, 10);
