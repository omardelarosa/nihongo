import type { FilterState, SrsState } from "./types";

const SRS_KEY = "nihongo:srs:v1";
const FILTER_KEY = "nihongo:filters:v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadSrs(): SrsState {
  return safeParse<SrsState>(localStorage.getItem(SRS_KEY), {});
}

export function saveSrs(state: SrsState): void {
  localStorage.setItem(SRS_KEY, JSON.stringify(state));
}

export function loadFilters(fallback: FilterState): FilterState {
  return safeParse<FilterState>(localStorage.getItem(FILTER_KEY), fallback);
}

export function saveFilters(state: FilterState): void {
  localStorage.setItem(FILTER_KEY, JSON.stringify(state));
}

export function resetSrs(): void {
  localStorage.removeItem(SRS_KEY);
}
