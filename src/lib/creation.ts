import { migrateCharacter } from "../data/character";
import type { Character, ClanProfile } from "../data/character";

/** Parses a score without accepting fractions, blanks, or values outside the sheet range. */
export function parseCreationScore(raw: string, min = 0, max = 5): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : null;
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
