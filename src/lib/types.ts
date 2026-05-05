export interface Card {
  section: string;
  theme: string;
  kanji: string;
  on: string;
  kun: string;
  meanings: string;
  example: string;
}

export interface SrsEntry {
  streak: number;
  reviews: number;
  correct: number;
  incorrect: number;
  lastSeen: number;
  nextDue: number;
}

export type SrsState = Record<string, SrsEntry>;

export interface FilterState {
  sections: string[];
  themes: string[];
  dueOnly: boolean;
}
