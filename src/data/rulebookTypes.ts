export type BookId = "core" | "memoriam";

export type RuleEntry = {
  id: string;
  title: string;
  summary: string;
  paragraphs: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  tags: string[];
  source: { book: BookId; pages: string };
};

export type RuleSection = {
  id: string;
  title: string;
  intro: string;
  entries: RuleEntry[];
};
