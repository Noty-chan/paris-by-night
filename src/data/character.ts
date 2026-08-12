export type Damage = 0 | 1 | 2;
export type TraitEntry = { id: string; name: string; rating: number; note: string };
export type DisciplineEntry = { id: string; name: string; rating: number; powers: string };
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

export const DISCIPLINE_NAMES = [
  "Анимализм", "Алхимия тонкой крови", "Доминирование",
  "Забвение", "Затемнение", "Кровавое чародейство",
  "Могущество", "Превращение", "Присутствие", "Прорицание",
  "Стойкость", "Стремительность",
];

export const CLAN_PROFILES: ClanProfile[] = [
  { name: "Бану Хаким", epithet: "судьи, убийцы и хранители закона крови", disciplines: ["Кровавое чародейство", "Стремительность", "Затемнение"], bane: "Витэ других Сородичей слишком притягательно; правосудие легко превращается в зависимость.", usualSect: "Камарилья", referenceUrl: "https://wta5.ru/vampire/clans/banu-haqim" },
  { name: "Бруха", epithet: "бунтари, мятежники и революционеры", disciplines: ["Стремительность", "Могущество", "Присутствие"], bane: "Ярость ближе к поверхности; сопротивляться безумию труднее.", usualSect: "Анархи", referenceUrl: "https://wta5.ru/vampire/clans/brujah" },
  { name: "Гангрел", epithet: "дикие и свободные, ближе к Зверю, чем к человеку", disciplines: ["Анимализм", "Стойкость", "Превращение"], bane: "Безумие оставляет временные звериные черты.", usualSect: "Независимые", referenceUrl: "https://wta5.ru/vampire/clans/gangrel" },
  { name: "Геката", epithet: "семья мертвецов, некроманты и повелители призраков", disciplines: ["Прорицание", "Стойкость", "Забвение"], bane: "Поцелуй причиняет жертве мучительную боль вместо экстаза.", usualSect: "Независимые", referenceUrl: "https://wta5.ru/vampire/clans/hecata" },
  { name: "Ласомбра", epithet: "повелители теней и власти во мраке", disciplines: ["Доминирование", "Забвение", "Могущество"], bane: "Образ и голос искажаются в отражениях и электронных записях.", usualSect: "Камарилья", referenceUrl: "https://wta5.ru/vampire/clans/lasombra" },
  { name: "Малкавиан", epithet: "провидцы и оракулы разбитых зеркал", disciplines: ["Прорицание", "Доминирование", "Затемнение"], bane: "Кровь усиливает внутреннюю травму и нарушения восприятия.", usualSect: "Камарилья", referenceUrl: "https://wta5.ru/vampire/clans/malkavian" },
  { name: "Министерство", epithet: "змеи, искусители и жрецы тёмных богов", disciplines: ["Затемнение", "Присутствие", "Превращение"], bane: "Сверхъестественный и естественный яркий свет особенно мучителен.", usualSect: "Анархи", referenceUrl: "https://wta5.ru/vampire/clans/ministry" },
  { name: "Носферату", epithet: "изгои и хранители секретов, которые знают всё", disciplines: ["Анимализм", "Затемнение", "Могущество"], bane: "Кровь делает облик отталкивающим и осложняет общение со смертными.", usualSect: "Камарилья", referenceUrl: "https://wta5.ru/vampire/clans/nosferatu" },
  { name: "Равнос", epithet: "бродяги, обманщики и мастера иллюзий", disciplines: ["Анимализм", "Затемнение", "Присутствие"], bane: "Долгое пребывание на одном месте заставляет кровь гореть.", usualSect: "Независимые", referenceUrl: "https://wta5.ru/vampire/clans/ravnos" },
  { name: "Салюбри", epithet: "целители, мученики и преследуемые праведники", disciplines: ["Прорицание", "Доминирование", "Стойкость"], bane: "При использовании сил и питье может открываться третий глаз; кровь особенно желанна другим.", usualSect: "Независимые", referenceUrl: "https://wta5.ru/vampire/clans/salubri" },
  { name: "Тореадор", epithet: "художники, эстеты и хищники в шёлке", disciplines: ["Прорицание", "Стремительность", "Присутствие"], bane: "Безобразная среда мешает действовать, а совершенство способно зачаровать.", usualSect: "Камарилья", referenceUrl: "https://wta5.ru/vampire/clans/toreador" },
  { name: "Тремер", epithet: "маги крови, узурпаторы бессмертия", disciplines: ["Прорицание", "Кровавое чародейство", "Доминирование"], bane: "Кровные узы и внутренняя иерархия работают не так, как прежде.", usualSect: "Камарилья", referenceUrl: "https://wta5.ru/vampire/clans/tremere" },
  { name: "Цимисхи", epithet: "повелители плоти, людей и территорий", disciplines: ["Анимализм", "Доминирование", "Превращение"], bane: "Для сна необходима связь с избранным владением или собственностью.", usualSect: "Шабаш / независимые", referenceUrl: "https://wta5.ru/vampire/clans/tzimisce" },
  { name: "Вентру", epithet: "правители, стратеги и голубая кровь", disciplines: ["Доминирование", "Стойкость", "Присутствие"], bane: "Питаться можно только от строго определённого типа смертных.", usualSect: "Камарилья", referenceUrl: "https://wta5.ru/vampire/clans/ventrue" },
  { name: "Каитиф", epithet: "безклановые, отверженные и бесхозные", disciplines: [], bane: "Не имеют кланового наследия и платят больше опыта за Дисциплины.", usualSect: "Любая / вне сект", referenceUrl: "https://wta5.ru/vampire/clans/caitiff" },
  { name: "Тонкокровный", epithet: "на грани жизни и смерти, нарушающие все правила", disciplines: ["Алхимия тонкой крови"], bane: "Могущество крови 0; достоинства и недостатки тонкой крови определяют границы возможного.", usualSect: "Вне сект", referenceUrl: "https://wta5.ru/vampire/clans/thin-blooded" },
];

export const CLAN_NAMES = ["Не определён", ...CLAN_PROFILES.map((clan) => clan.name), "Другое / домашняя версия"];
export const SECT_NAMES = ["Камарилья", "Анархи", "Независимые", "Шабаш", "Аширра", "Вне сект", "Не определено", "Другое / домашняя версия"];
export const PREDATOR_TYPES = [
  "Уличный кот", "Сирена", "Песочный человек", "Мешочник", "Фермер", "Гробокопатель",
  "Мясник", "Консенсуалист", "Королева сцены", "Кровосос", "Осирис", "Другое / домашняя версия",
];
export const RESONANCES = ["Сангвинический", "Холерический", "Меланхолический", "Флегматический", "Животный", "Пустой", "Не определён"];
export const GENERATIONS = ["9", "10", "11", "12", "13", "14", "15", "16", "Неизвестно"];
export const ADVANTAGE_NAMES = ["Союзники", "Контакты", "Стадо", "Убежище", "Ресурсы", "Влияние", "Маска", "Домен", "Известность", "Внешность", "Статус", "Свита", "Предание", "Другое"];
export const FLAW_NAMES = ["Враг", "Тёмная тайна", "Преследователь", "Зависимость", "Ограничение добычи", "Явный хищник", "Плохая репутация", "Без ресурсов", "Другое"];

const attributes = Object.fromEntries(ATTRIBUTE_GROUPS.flatMap(([, names]) => names.map((name) => [name, 1])));
const skills = Object.fromEntries(SKILL_GROUPS.flatMap(([, names]) => names.map((name) => [name, 0])));
const specialties = Object.fromEntries(SKILL_GROUPS.flatMap(([, names]) => names.map((name) => [name, ""])));

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
  const healthMax = raw.healthMax ?? (typeof (raw as Record<string, unknown>).health === "number" ? Number((raw as Record<string, unknown>).health) : 4);
  const willpowerMax = raw.willpowerMax ?? (typeof (raw as Record<string, unknown>).willpower === "number" ? Number((raw as Record<string, unknown>).willpower) : 2);
  return {
    ...defaultCharacter,
    ...raw,
    version: 3,
    attributes: migratedAttributes,
    skills: migratedSkills,
    specialties: migratedSpecialties,
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
