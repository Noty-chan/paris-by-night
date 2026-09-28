import { migrateCharacter } from "../data/character";
import type { Character, ClanProfile } from "../data/character";

/** Parses a score without accepting fractions, blanks, or values outside the sheet range. */
export function parseCreationScore(raw: string, min = 0, max = 5): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : null;
}

/** Compare a base distribution, not XP, predator or historical additions. Zero is unassigned. */
export function distributionIssues(values: number[], pattern: string): string[] {
  const expected = new Map<number, number>();
  for (const match of Array.from(pattern.matchAll(/(\d+)\s*×\s*(\d+)/g))) expected.set(Number(match[2]), Number(match[1]));
  if (!expected.size) return ["Схема не выбрана."];
  const issues: string[] = [];
  for (let rating = 1; rating <= 5; rating++) {
    const wanted = expected.get(rating) ?? 0;
    const actual = values.filter((value) => value === rating).length;
    if (actual < wanted) issues.push(`На ${rating}: ещё ${wanted - actual}.`);
    if (actual > wanted) issues.push(`На ${rating}: лишних ${actual - wanted}.`);
  }
  return issues;
}

export function updateCreationAttribute(character: Character, name: string, value: number): Character {
  if (!Number.isInteger(value) || value < 0 || value > 5) return character;
  return migrateCharacter({ ...character, attributes: { ...character.attributes, [name]: value } });
}

export function updateCreationSkill(character: Character, name: string, value: number): Character {
  if (!Number.isInteger(value) || value < 0 || value > 5) return character;
  return { ...character, skills: { ...character.skills, [name]: value } };
}

/** Explicitly re-labels known/empty slots; custom or unknown discipline entries are never discarded. */
export function suggestClanDisciplines(character: Character, profile: ClanProfile): Character {
  if (!profile.disciplines.length) return character;
  const entries = character.disciplines ?? [];
  const used = new Set<number>();
  const selected = profile.disciplines.map((name, slot) => {
    const matching = entries.findIndex((entry, index) => !used.has(index) && entry.name === name);
    if (matching >= 0) {
      used.add(matching);
      return entries[matching];
    }

    const reusable = entries.findIndex((entry, index) =>
      !used.has(index) && !entry.name && entry.rating === 0 && !entry.powers.trim(),
    );
    if (reusable >= 0) {
      used.add(reusable);
      return { ...entries[reusable], name };
    }

    let id = `clan-suggestion-${profile.name}-${slot + 1}`;
    let suffix = 1;
    while (entries.some((entry) => entry.id === id)) id = `clan-suggestion-${profile.name}-${slot + 1}-${++suffix}`;
    return { id, name, rating: 0, powers: "" };
  });

  return {
    ...character,
    disciplines: [...selected, ...entries.filter((_, index) => !used.has(index))],
    clanBane: profile.bane,
  };
}
