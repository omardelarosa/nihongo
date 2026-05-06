import { useRef } from "react";

interface Props {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onResetOrder: () => void;
  onResetSrs: () => void;
  onExportCsv: () => void;
  onImportCsv: (file: File) => void;
}

export function Nav({ index, total, onPrev, onNext, onShuffle, onResetOrder, onResetSrs, onExportCsv, onImportCsv }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImportCsv(file);
      e.target.value = "";
    }
  }

  return (
    <>
      <section className="nav" aria-label="Navigation">
        <button type="button" onClick={onPrev} disabled={total === 0}>‹ Prev</button>
        <div className="counter">{total === 0 ? "0 / 0" : `${index + 1} / ${total}`}</div>
        <button type="button" onClick={onNext} disabled={total === 0}>Next ›</button>
      </section>
      <section className="nav-actions">
        <button type="button" onClick={onShuffle} disabled={total === 0}>Shuffle</button>
        <button type="button" onClick={onResetOrder} disabled={total === 0}>Reset order</button>
        <button type="button" onClick={onExportCsv}>Export CSV</button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button type="button" onClick={() => fileRef.current?.click()}>Import CSV</button>
        <button type="button" className="danger" onClick={onResetSrs}>Reset SRS</button>
      </section>
    </>
  );
}
