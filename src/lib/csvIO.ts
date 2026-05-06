import type { Card, SrsState } from "./types";

const HEADERS = ["Section", "Theme", "Kanji", "On", "Kun", "Meanings", "ExampleUse", "Streak", "Reviews", "Correct", "Incorrect", "LastSeen", "NextDue"];

function escapeCell(val: string | number): string {
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function exportToCsv(cards: readonly Card[], srs: SrsState): void {
  const rows = [HEADERS.join(",")];
  for (const c of cards) {
    const e = srs[c.kanji];
    rows.push(
      [c.section, c.theme, c.kanji, c.on, c.kun, c.meanings, c.example,
        e?.streak ?? 0, e?.reviews ?? 0, e?.correct ?? 0, e?.incorrect ?? 0,
        e?.lastSeen ?? 0, e?.nextDue ?? 0,
      ].map(escapeCell).join(","),
    );
  }
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nihongo-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseLine(line: string): string[] {
  const cells: string[] = [];
  let i = 0;
  while (i <= line.length) {
    if (line[i] === '"') {
      let cell = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { cell += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else cell += line[i++];
      }
      cells.push(cell);
      if (line[i] === ",") i++;
    } else {
      const end = line.indexOf(",", i);
      if (end === -1) { cells.push(line.slice(i)); break; }
      cells.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return cells;
}

export function importFromCsv(text: string): { cards: Card[]; srs: SrsState } {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV has no data rows");

  const cards: Card[] = [];
  const srs: SrsState = {};

  for (let i = 1; i < lines.length; i++) {
    const c = parseLine(lines[i]);
    if (c.length < 7) continue;
    const [section, theme, kanji, on, kun, meanings, example] = c;
    cards.push({ section, theme, kanji, on, kun, meanings, example });

    const reviews = parseInt(c[8] ?? "0", 10);
    const nextDue = parseInt(c[12] ?? "0", 10);
    if (reviews > 0 || nextDue > 0) {
      srs[kanji] = {
        streak: parseInt(c[7] ?? "0", 10),
        reviews,
        correct: parseInt(c[9] ?? "0", 10),
        incorrect: parseInt(c[10] ?? "0", 10),
        lastSeen: parseInt(c[11] ?? "0", 10),
        nextDue,
      };
    }
  }

  if (cards.length === 0) throw new Error("No valid card rows found in CSV");
  return { cards, srs };
}
