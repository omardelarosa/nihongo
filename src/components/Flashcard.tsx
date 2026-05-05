import type { KeyboardEvent } from "react";
import type { Card, SrsEntry } from "../lib/types";
import { formatNextDue } from "../lib/srs";

interface Props {
  card: Card | null;
  flipped: boolean;
  onFlip: () => void;
  srsEntry: SrsEntry | undefined;
  now: number;
}

export function Flashcard({ card, flipped, onFlip, srsEntry, now }: Props) {
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      onFlip();
    }
  };

  return (
    <section className="card-area" aria-live="polite">
      <div
        className={`card${flipped ? " flipped" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Flashcard. Click or press space to flip."
        onClick={onFlip}
        onKeyDown={handleKey}
      >
        <div className="card-inner">
          <div className="card-face card-front">
            <div className="kanji">{card?.kanji ?? "—"}</div>
            <div className="hint">click / space to flip</div>
          </div>
          <div className="card-face card-back">
            <div className="row">
              <span className="label">On'yomi 音読み</span>
              <span className="reading on">{card?.on || "—"}</span>
            </div>
            <div className="row">
              <span className="label">Kun'yomi 訓読み</span>
              <span className="reading kun">{card?.kun || "—"}</span>
            </div>
            <div className="row">
              <span className="label">Meaning</span>
              <span>{card?.meanings || "—"}</span>
            </div>
            <div className="row">
              <span className="label">Example</span>
              <span>{card?.example && card.example !== "—" ? card.example : "—"}</span>
            </div>
            <div className="row sub">
              <span className="label">Theme</span>
              <span>{card ? `Section ${card.section} · ${card.theme}` : ""}</span>
            </div>
            <div className="row sub">
              <span className="label">SRS</span>
              <span>
                streak {srsEntry?.streak ?? 0} · {srsEntry?.correct ?? 0}✓ / {srsEntry?.incorrect ?? 0}✗ · {formatNextDue(srsEntry, now)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
