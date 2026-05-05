import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const csvPath = path.join(root, "data/japanese_kanji_by_section.csv");
const outPath = path.join(root, "src/data.ts");

const text = fs.readFileSync(csvPath, "utf8");
const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.length > 0);
const [, ...rows] = lines;

const cards = rows.map((line) => {
  const p = line.split(",").map((s) => s.trim());
  return {
    section: p[0],
    theme: p[1],
    kanji: p[2],
    on: p[3],
    kun: p[4],
    meanings: p[5],
    example: p[6],
  };
});

const banner = `// Generated from data/japanese_kanji_by_section.csv by scripts/build-data.mjs.\n// Do not edit by hand — run \`npm run build:data\` to regenerate.\n`;
const body = `import type { Card } from "./lib/types";\n\nexport const KANJI_DATA: readonly Card[] = ${JSON.stringify(cards, null, 2)};\n`;

fs.writeFileSync(outPath, banner + body);
console.log(`wrote ${path.relative(root, outPath)} with ${cards.length} cards`);
