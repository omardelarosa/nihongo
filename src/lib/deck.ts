import type { Card, FilterState, SrsState } from "./types";
import { dueSortKey, isDue } from "./srs";

export function buildDeck(
  all: readonly Card[],
  filters: FilterState,
  srs: SrsState,
  now: number,
): Card[] {
  const sectionSet = new Set(filters.sections);
  const themeSet = new Set(filters.themes);

  let deck = all.filter((c) => {
    if (!sectionSet.has(c.section)) return false;
    if (!themeSet.has(c.theme)) return false;
    if (filters.dueOnly && !isDue(srs[c.kanji], now)) return false;
    return true;
  });

  // Stable sort: due/unstudied first (small key), then by next-due ascending.
  deck = deck
    .map((c, i) => ({ c, i, k: dueSortKey(srs[c.kanji]) }))
    .sort((a, b) => a.k - b.k || a.i - b.i)
    .map((x) => x.c);

  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function uniqueSorted(arr: readonly string[]): string[] {
  return [...new Set(arr)].sort((a, b) => a.localeCompare(b, "en"));
}
