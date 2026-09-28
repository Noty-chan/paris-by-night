import { CORE_CLAN_PROFILES } from "./rulebookClans";
import { VERIFIED_DISCIPLINE_NAMES } from "./rulebookDisciplines";
import { VERIFIED_PREDATOR_NAMES } from "./rulebookPredators";
import { VERIFIED_ADVANTAGE_NAMES, VERIFIED_FLAW_NAMES } from "./rulebookTraits";
export type Damage = 0 | 1 | 2;
export type TraitEntry = { id: string; name: string; rating: number; note: string };
export type DisciplineEntry = { id: string; name: string; rating: number; powers: string };
export type HumanityAnchor = { id: string; conviction: string; touchstone: string };
export type Wod5PdfState = { fields: Record<string, string> };

export type ClanProfile = {
  name: string;
  epithet: string;
  disciplines: string[];
  bane: string;
  usualSect: string;
  referenceUrl: string;
};

export type Character = {
  id: string;
  version: number;
  updatedAt: string;
  name: string;
  concept: string;
  player: string;
  chronicle: string;
  clan: string;
  sire: string;
  generation: string;
  sect: string;
  predatorType: string;
  ambition: string;
  desire: string;
  attributes: Record<string, number>;
  skills: Record<string, number>;
  specialties: Record<string, string>;
  disciplines: DisciplineEntry[];
  ritualsCeremonies: string;
  humanityAnchors: HumanityAnchor[];
  advantages: TraitEntry[];
  flaws: TraitEntry[];
  hunger: number;
  humanity: number;
  stains: number;
  healthMax: number;
  healthDamage: Damage[];
  willpowerMax: number;
  willpowerDamage: Damage[];
  bloodPotency: number;
  resonance: string;
  dyscrasia: string;
  clanBane: string;
  convictions: string;
  touchstones: string;
  coterie: string;
  haven: string;
  equipment: string;
  appearance: string;
  history: string;
  notes: string;
  experienceTotal: number;
  experienceSpent: number;
  wod5Pdf: Wod5PdfState;
};

export const ATTRIBUTE_GROUPS = [
  ["Физические", ["Сила", "Ловкость", "Выносливость"]],
  ["Социальные", ["Харизма", "Манипулирование", "Самообладание"]],
  ["Ментальные", ["Интеллект", "Смекалка", "Упорство"]],
] as const;

export const SKILL_GROUPS = [
  ["Физические", ["Атлетика", "Драка", "Ремесло", "Вождение", "Стрельба", "Воровство", "Фехтование", "Скрытность", "Выживание"]],
  ["Социальные", ["Обращение с животными", "Этикет", "Проницательность", "Запугивание", "Лидерство", "Исполнение", "Убеждение", "Знание улиц", "Хитрость"]],
  ["Ментальные", ["Академические знания", "Бдительность", "Финансы", "Расследование", "Медицина", "Оккультизм", "Политика", "Естественные науки", "Технологии"]],
] as const;

export const DISCIPLINE_NAMES: readonly string[] = VERIFIED_DISCIPLINE_NAMES;

export const CLAN_PROFILES: ClanProfile[] = CORE_CLAN_PROFILES;

export const CLAN_NAMES = ["Не определён", ...CLAN_PROFILES.map((clan) => clan.name), "Другое / домашняя версия"];
export const SECT_NAMES = ["Камарилья", "Анархи", "Шабаш", "Автархи", "Независимые", "Вне сект", "Не определено", "Другое / домашняя версия"];
export const PREDATOR_TYPES = [...VERIFIED_PREDATOR_NAMES, "Другое / домашняя версия"];
export const RESONANCES = ["Сангвинический", "Холерический", "Меланхолический", "Флегматический", "Животный", "Пустой", "Не определён"];
export const GENERATIONS = ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "Неизвестно"];
export const ADVANTAGE_NAMES = [...VERIFIED_ADVANTAGE_NAMES, "Другое"];
export const FLAW_NAMES = [...VERIFIED_FLAW_NAMES, "Другое"];

const attributes = Object.fromEntries(ATTRIBUTE_GROUPS.flatMap(([, names]) => names.map((name) => [name, 1])));
const skills = Object.fromEntries(SKILL_GROUPS.flatMap(([, names]) => names.map((name) => [name, 0])));
const specialties = Object.fromEntries(SKILL_GROUPS.flatMap(([, names]) => names.map((name) => [name, ""])));

export const healthFromAttributes = (values: Record<string, number>) => (values["Выносливость"] ?? 1) + 3;
export const willpowerFromAttributes = (values: Record<string, number>) => (values["Самообладание"] ?? 1) + (values["Упорство"] ?? 1);

export const defaultCharacter: Character = {
  id: "paris-blank-01",
  version: 3,
  updatedAt: "2004-10-17T00:42:00+02:00",
  name: "Без имени",
  concept: "Ночной свидетель",
  player: "",
  chronicle: "Paris // Nuit",
  clan: "Не определён",
  sire: "",
  generation: "13",
  sect: "",
  predatorType: "",
  ambition: "",
  desire: "",
  attributes,
  skills,
  specialties,
  disciplines: [
    { id: "discipline-1", name: "", rating: 0, powers: "" },
    { id: "discipline-2", name: "", rating: 0, powers: "" },
    { id: "discipline-3", name: "", rating: 0, powers: "" },
  ],
  ritualsCeremonies: "",
  humanityAnchors: [{ id: "humanity-anchor-1", conviction: "", touchstone: "" }],
  advantages: [{ id: "advantage-1", name: "", rating: 0, note: "" }],
  flaws: [{ id: "flaw-1", name: "", rating: 0, note: "" }],
  hunger: 1,
  humanity: 7,
  stains: 0,
  healthMax: 4,
  healthDamage: [0, 0, 0, 0],
  willpowerMax: 2,
  willpowerDamage: [0, 0],
  bloodPotency: 1,
  resonance: "",
  dyscrasia: "",
  clanBane: "",
  convictions: "",
  touchstones: "",
  coterie: "",
  haven: "",
  equipment: "",
  appearance: "",
  history: "",
  notes: "",
  experienceTotal: 0,
  experienceSpent: 0,
  wod5Pdf: { fields: {} },
};

export function migrateCharacter(raw: Partial<Character>): Character {
  const attributeAliases: Record<string, string> = {
    Обаяние: "Харизма",
    Манипуляция: "Манипулирование",
    Решительность: "Упорство",
  };
  const oldSkills = raw.skills ?? {};
  const skillAliases: Record<string, string> = {
    Уличное_чутьё: "Знание улиц",
    Технология: "Технологии",
    Огнестрел: "Стрельба",
    "Ближний бой": "Фехтование",
    Приручение: "Обращение с животными",
    Выступление: "Исполнение",
    Образование: "Академические знания",
    Наука: "Естественные науки",
  };
  const migratedAttributes = { ...attributes };
  Object.entries(raw.attributes ?? {}).forEach(([name, value]) => {
    migratedAttributes[attributeAliases[name] ?? name] = value;
  });
  const migratedSkills = { ...skills };
  Object.entries(oldSkills).forEach(([name, value]) => {
    migratedSkills[skillAliases[name] ?? name] = value;
  });
  const migratedSpecialties = { ...specialties };
  Object.entries(raw.specialties ?? {}).forEach(([name, value]) => {
    migratedSpecialties[skillAliases[name] ?? name] = value;
  });
  const healthMax = healthFromAttributes(migratedAttributes);
  const willpowerMax = willpowerFromAttributes(migratedAttributes);
  const legacyConvictions = raw.convictions ?? "";
  const legacyTouchstones = raw.touchstones ?? "";
  const existingAnchors = raw.humanityAnchors ?? [];
  const anchorsConvictions = existingAnchors.map((anchor) => anchor.conviction).join("\n");
  const anchorsTouchstones = existingAnchors.map((anchor) => anchor.touchstone).join("\n");
  const hasUnmigratedBondText = legacyConvictions !== anchorsConvictions || legacyTouchstones !== anchorsTouchstones;
  const splitLines = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const convictionLines = splitLines(legacyConvictions);
  const touchstoneLines = splitLines(legacyTouchstones);
  const humanityAnchors = hasUnmigratedBondText
    ? Array.from({ length: Math.max(convictionLines.length, touchstoneLines.length, 1) }, (_, index) => ({
      id: `humanity-anchor-${index + 1}`,
      conviction: convictionLines[index] ?? "",
      touchstone: touchstoneLines[index] ?? "",
    }))
    : existingAnchors.length ? existingAnchors : defaultCharacter.humanityAnchors;
  const convictions = humanityAnchors.map((anchor) => anchor.conviction).join("\n");
  const touchstones = humanityAnchors.map((anchor) => anchor.touchstone).join("\n");
  return {
    ...defaultCharacter,
    ...raw,
    version: 3,
    attributes: migratedAttributes,
    skills: migratedSkills,
    specialties: migratedSpecialties,
    humanityAnchors,
    convictions,
    touchstones,
    healthMax,
    willpowerMax,
    healthDamage: Array.from({ length: healthMax }, (_, i) => raw.healthDamage?.[i] ?? 0),
    willpowerDamage: Array.from({ length: willpowerMax }, (_, i) => raw.willpowerDamage?.[i] ?? 0),
    disciplines: raw.disciplines ?? defaultCharacter.disciplines,
    advantages: raw.advantages ?? defaultCharacter.advantages,
    flaws: raw.flaws ?? defaultCharacter.flaws,
    wod5Pdf: raw.wod5Pdf ?? defaultCharacter.wod5Pdf,
  };
}
