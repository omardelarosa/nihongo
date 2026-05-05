interface Props {
  enabled: boolean;
  onGrade: (result: "correct" | "incorrect") => void;
}

export function GradeButtons({ enabled, onGrade }: Props) {
  return (
    <section className="grade" aria-label="Grade">
      <button
        type="button"
        className="grade-btn miss"
        disabled={!enabled}
        onClick={() => onGrade("incorrect")}
        title="Mark as incorrect (1)"
      >
        Missed ✗
      </button>
      <button
        type="button"
        className="grade-btn hit"
        disabled={!enabled}
        onClick={() => onGrade("correct")}
        title="Mark as correct (2)"
      >
        Got it ✓
      </button>
    </section>
  );
}
