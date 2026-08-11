export type Damage = 0 | 1 | 2;
export type TraitEntry = { id: string; name: string; rating: number; note: string };
export type DisciplineEntry = { id: string; name: string; rating: number; powers: string };

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
};

export const ATTRIBUTE_GROUPS = [
  ["Физические", ["Сила", "Ловкость", "Выносливость"]],
  ["Социальные", ["Обаяние", "Манипуляция", "Самообладание"]],
  ["Ментальные", ["Интеллект", "Смекалка", "Решительность"]],
] as const;

export const SKILL_GROUPS = [
  ["Физические", ["Атлетика", "Драка", "Ремесло", "Вождение", "Огнестрел", "Воровство", "Ближний бой", "Скрытность", "Выживание"]],
  ["Социальные", ["Приручение", "Этикет", "Проницательность", "Запугивание", "Лидерство", "Выступление", "Убеждение", "Знание улиц", "Хитрость"]],
  ["Ментальные", ["Образование", "Бдительность", "Финансы", "Расследование", "Медицина", "Оккультизм", "Политика", "Наука", "Технологии"]],
] as const;

export const DISCIPLINE_NAMES = [
  "Анимализм", "Алхимия тонкой крови", "Власть над тенью", "Доминирование",
  "Забвение", "Затемнение", "Изменчивость", "Кровавое чародейство",
  "Могущество", "Превращение", "Присутствие", "Прорицание",
  "Стойкость", "Стремительность",
];

const attributes = Object.fromEntries(ATTRIBUTE_GROUPS.flatMap(([, names]) => names.map((name) => [name, 1])));
const skills = Object.fromEntries(SKILL_GROUPS.flatMap(([, names]) => names.map((name) => [name, 0])));
const specialties = Object.fromEntries(SKILL_GROUPS.flatMap(([, names]) => names.map((name) => [name, ""])));

export const defaultCharacter: Character = {
  id: "paris-blank-01",
  version: 2,
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
};

export function migrateCharacter(raw: Partial<Character>): Character {
  const oldSkills = raw.skills ?? {};
  const skillAliases: Record<string, string> = {
    Уличное_чутьё: "Знание улиц",
    Технология: "Технологии",
  };
  const migratedSkills = { ...skills };
  Object.entries(oldSkills).forEach(([name, value]) => {
    migratedSkills[skillAliases[name] ?? name] = value;
  });
  const healthMax = raw.healthMax ?? (typeof (raw as Record<string, unknown>).health === "number" ? Number((raw as Record<string, unknown>).health) : 4);
  const willpowerMax = raw.willpowerMax ?? (typeof (raw as Record<string, unknown>).willpower === "number" ? Number((raw as Record<string, unknown>).willpower) : 2);
  return {
    ...defaultCharacter,
    ...raw,
    version: 2,
    attributes: { ...attributes, ...(raw.attributes ?? {}) },
    skills: migratedSkills,
    specialties: { ...specialties, ...(raw.specialties ?? {}) },
    healthMax,
    willpowerMax,
    healthDamage: Array.from({ length: healthMax }, (_, i) => raw.healthDamage?.[i] ?? 0),
    willpowerDamage: Array.from({ length: willpowerMax }, (_, i) => raw.willpowerDamage?.[i] ?? 0),
    disciplines: raw.disciplines ?? defaultCharacter.disciplines,
    advantages: raw.advantages ?? defaultCharacter.advantages,
    flaws: raw.flaws ?? defaultCharacter.flaws,
  };
}
