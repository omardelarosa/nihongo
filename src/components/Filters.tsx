import { useMemo } from "react";
import type { FilterState } from "../lib/types";
import { MultiSelect, type MultiSelectOption } from "./MultiSelect";

interface ThemeOption {
  theme: string;
  section: string;
}

interface Props {
  allSections: string[];
  allThemes: ThemeOption[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
  dueCount: number;
  totalInScope: number;
}

export function Filters({
  allSections,
  allThemes,
  filters,
  onChange,
  dueCount,
  totalInScope,
}: Props) {
  const sectionOptions = useMemo<MultiSelectOption[]>(
    () =>
      allSections.map((s) => ({
        value: s,
        label: `Section ${s}`,
        shortLabel: s,
      })),
    [allSections],
  );

  const themeOptions = useMemo<MultiSelectOption[]>(
    () =>
      allThemes.map(({ theme, section }) => ({
        value: theme,
        label: (
          <>
            <span className="badge">{section}</span> {theme}
          </>
        ),
        shortLabel: theme,
      })),
    [allThemes],
  );

  return (
    <section className="controls" aria-label="Filters">
      <MultiSelect
        label="Sections"
        options={sectionOptions}
        selected={filters.sections}
        onChange={(sections) => onChange({ ...filters, sections })}
      />
      <MultiSelect
        label="Themes"
        options={themeOptions}
        selected={filters.themes}
        onChange={(themes) => onChange({ ...filters, themes })}
        inlineSummaryLimit={2}
      />
      <label className="check due-only">
        <input
          type="checkbox"
          checked={filters.dueOnly}
          onChange={(e) => onChange({ ...filters, dueOnly: e.currentTarget.checked })}
        />
        <span>Due only</span>
      </label>
      <span className="scope-count">
        {dueCount} due / {totalInScope} in scope
      </span>
    </section>
  );
}
