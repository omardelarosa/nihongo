import { useEffect, useMemo, useState } from "react";
import { KANJI_DATA } from "./data";
import { Filters } from "./components/Filters";
import { Flashcard } from "./components/Flashcard";
import { GradeButtons } from "./components/GradeButtons";
import { Nav } from "./components/Nav";
import { buildDeck, shuffle, uniqueSorted } from "./lib/deck";
import { grade, isDue } from "./lib/srs";
import { loadFilters, loadSrs, resetSrs as clearSrsStorage, saveFilters, saveSrs } from "./lib/storage";
import type { Card, FilterState, SrsState } from "./lib/types";

const ALL_SECTIONS: string[] = uniqueSorted(KANJI_DATA.map((c) => c.section));

const ALL_THEMES: { theme: string; section: string }[] = (() => {
  const seen = new Map<string, string>();
  for (const c of KANJI_DATA) if (!seen.has(c.theme)) seen.set(c.theme, c.section);
  return Array.from(seen, ([theme, section]) => ({ theme, section })).sort(
    (a, b) => a.section.localeCompare(b.section) || a.theme.localeCompare(b.theme),
  );
})();

const ALL_THEME_NAMES: string[] = ALL_THEMES.map((t) => t.theme);

const DEFAULT_FILTERS: FilterState = {
  sections: ALL_SECTIONS,
  themes: ALL_THEME_NAMES,
  dueOnly: false,
};

// Migrate persisted state. The previous schema used "empty array = all"; the new
// schema is literal, so blank arrays from older saves get rehydrated to "all".
function loadInitialFilters(): FilterState {
  const stored = loadFilters(DEFAULT_FILTERS);
  return {
    sections: stored.sections.length ? stored.sections : ALL_SECTIONS,
    themes: stored.themes.length ? stored.themes : ALL_THEME_NAMES,
    dueOnly: !!stored.dueOnly,
  };
}

export function App() {
  const [srs, setSrs] = useState<SrsState>(loadSrs);
  const [filters, setFilters] = useState<FilterState>(loadInitialFilters);
  const [deck, setDeck] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const inScope = useMemo(() => {
    const ss = new Set(filters.sections);
    const ts = new Set(filters.themes);
    return KANJI_DATA.filter((c) => ss.has(c.section) && ts.has(c.theme));
  }, [filters.sections, filters.themes]);

  const dueCount = useMemo(
    () => inScope.reduce((n, c) => n + (isDue(srs[c.kanji], now) ? 1 : 0), 0),
    [inScope, srs, now],
  );

  // Rebuild deck when filters change (not on every grade — that would shuffle the user's position).
  useEffect(() => {
    setDeck(buildDeck(KANJI_DATA, filters, srs, Date.now()));
    setIndex(0);
    setFlipped(false);
    saveFilters(filters);
    // Intentionally exclude srs from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    saveSrs(srs);
  }, [srs]);

  // Refresh "now" every minute so the "in 2h" / "due now" labels stay accurate.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const card = deck[index] ?? null;

  function flip() {
    if (!card) return;
    setFlipped((f) => !f);
  }

  function go(delta: number) {
    if (deck.length === 0) return;
    setIndex((i) => (i + delta + deck.length) % deck.length);
    setFlipped(false);
  }

  function onGrade(result: "correct" | "incorrect") {
    if (!card) return;
    const next = grade(srs[card.kanji], result);
    setSrs({ ...srs, [card.kanji]: next });
    if (deck.length > 0) setIndex((i) => (i + 1) % deck.length);
    setFlipped(false);
  }

  function onShuffle() {
    if (deck.length === 0) return;
    setDeck(shuffle(deck));
    setIndex(0);
    setFlipped(false);
  }

  function onResetOrder() {
    setDeck(buildDeck(KANJI_DATA, filters, srs, Date.now()));
    setIndex(0);
    setFlipped(false);
  }

  function onResetSrs() {
    if (confirm("Reset all SRS progress? This cannot be undone.")) {
      setSrs({});
      clearSrsStorage();
    }
  }

  // Global keyboard shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.matches("select, input, textarea, button")) return;
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === " ") {
        e.preventDefault();
        flip();
      } else if (e.key.toLowerCase() === "s") onShuffle();
      else if (flipped && (e.key === "1" || e.key.toLowerCase() === "j")) onGrade("incorrect");
      else if (flipped && (e.key === "2" || e.key.toLowerCase() === "k")) onGrade("correct");
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck, index, flipped, srs]);

  return (
    <>
      <header>
        <h1>
          日本語 <span className="muted">Flashcards</span>
        </h1>
      </header>
      <main>
        <Filters
          allSections={ALL_SECTIONS}
          allThemes={ALL_THEMES}
          filters={filters}
          onChange={setFilters}
          dueCount={dueCount}
          totalInScope={inScope.length}
        />

        <Flashcard
          card={card}
          flipped={flipped}
          onFlip={flip}
          srsEntry={card ? srs[card.kanji] : undefined}
          now={now}
        />

        <GradeButtons enabled={!!card && flipped} onGrade={onGrade} />

        <Nav
          index={index}
          total={deck.length}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          onShuffle={onShuffle}
          onResetOrder={onResetOrder}
          onResetSrs={onResetSrs}
        />

        <p className="kbd-hint">
          <kbd>←</kbd>/<kbd>→</kbd> nav · <kbd>Space</kbd> flip · <kbd>1</kbd>/<kbd>2</kbd>{" "}
          (or <kbd>J</kbd>/<kbd>K</kbd>) grade · <kbd>S</kbd> shuffle
        </p>
      </main>
    </>
  );
}
