import type { SrsEntry, SrsState } from "./types";

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

// Leitner-style intervals indexed by streak (consecutive correct).
// streak 0 means the card just lapsed or is brand new — review soon.
const INTERVALS = [10 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];

export function intervalForStreak(streak: number): number {
  const i = Math.max(0, Math.min(streak, INTERVALS.length - 1));
  return INTERVALS[i];
}

export function emptyEntry(now = Date.now()): SrsEntry {
  return {
    streak: 0,
    reviews: 0,
    correct: 0,
    incorrect: 0,
    lastSeen: 0,
    nextDue: now,
  };
}

export function grade(
  entry: SrsEntry | undefined,
  result: "correct" | "incorrect",
  now = Date.now()
): SrsEntry {
  const base = entry ?? emptyEntry(now);
  if (result === "correct") {
    const streak = base.streak + 1;
    return {
      ...base,
      streak,
      reviews: base.reviews + 1,
      correct: base.correct + 1,
      lastSeen: now,
      nextDue: now + intervalForStreak(streak),
    };
  }
  return {
    ...base,
    streak: 0,
    reviews: base.reviews + 1,
    incorrect: base.incorrect + 1,
    lastSeen: now,
    nextDue: now + intervalForStreak(0),
  };
}

export function isDue(entry: SrsEntry | undefined, now = Date.now()): boolean {
  if (!entry) return true;
  return entry.nextDue <= now;
}

export function dueSortKey(entry: SrsEntry | undefined): number {
  // Smaller = higher priority. Unstudied cards sort to 0 (just before "due now").
  if (!entry) return 0;
  return entry.nextDue;
}

export function formatNextDue(entry: SrsEntry | undefined, now = Date.now()): string {
  if (!entry) return "new";
  const delta = entry.nextDue - now;
  if (delta <= 0) return "due now";
  const days = Math.floor(delta / DAY);
  if (days >= 1) return `in ${days}d`;
  const hours = Math.floor(delta / (60 * MIN));
  if (hours >= 1) return `in ${hours}h`;
  const mins = Math.max(1, Math.floor(delta / MIN));
  return `in ${mins}m`;
}

export function dueCount(state: SrsState, kanjiPool: readonly string[], now = Date.now()): number {
  let n = 0;
  for (const k of kanjiPool) {
    if (isDue(state[k], now)) n++;
  }
  return n;
}
