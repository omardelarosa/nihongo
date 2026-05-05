import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface MultiSelectOption {
  value: string;
  label: ReactNode;
  // The compact value used when summarizing the selection in the closed button. Defaults to `value`.
  shortLabel?: string;
}

interface Props {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  // How many items to list inline in the summary before collapsing to "N selected".
  inlineSummaryLimit?: number;
}

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  inlineSummaryLimit = 3,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const total = options.length;
  const count = selected.length;
  const allSelected = count === total && total > 0;

  let summary: string;
  if (total === 0) summary = "—";
  else if (allSelected) summary = `All (${total})`;
  else if (count === 0) summary = "None";
  else if (count <= inlineSummaryLimit) {
    summary = options
      .filter((o) => selected.includes(o.value))
      .map((o) => o.shortLabel ?? o.value)
      .join(", ");
  } else summary = `${count} selected`;

  return (
    <div className={`ms${open ? " open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="ms-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ms-label">{label}</span>
        <span className="ms-summary">{summary}</span>
        <span className="ms-caret" aria-hidden>▾</span>
      </button>
      {open && (
        <div className="ms-panel" role="listbox" aria-multiselectable="true">
          <div className="ms-list">
            {options.map((o) => {
              const isSelected = selected.includes(o.value);
              return (
                <label key={o.value} className="ms-item">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onChange(toggle(selected, o.value))}
                  />
                  <span>{o.label}</span>
                </label>
              );
            })}
          </div>
          <div className="ms-actions">
            <button type="button" className="link" onClick={() => onChange(options.map((o) => o.value))}>
              All
            </button>
            <button type="button" className="link" onClick={() => onChange([])}>
              None
            </button>
            <span className="ms-count">{count}/{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
