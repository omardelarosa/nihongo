interface Props {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onResetOrder: () => void;
  onResetSrs: () => void;
}

export function Nav({ index, total, onPrev, onNext, onShuffle, onResetOrder, onResetSrs }: Props) {
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
        <button type="button" className="danger" onClick={onResetSrs}>Reset SRS</button>
      </section>
    </>
  );
}
