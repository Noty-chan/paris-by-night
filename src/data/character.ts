export type Damage = 0 | 1 | 2;
export type TraitEntry = { id: string; name: string; rating: number; note: string };
export type DisciplineEntry = { id: string; name: string; rating: number; powers: string };

export type ClanProfile = {
  name: string;
  epithet: string;
  disciplines: string[];
  bane: string;
  usualSect: string;
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
  { name: "Бану Хаким", epithet: "судьи и хранители закона крови", disciplines: ["Кровавое чародейство", "Стремительность", "Затемнение"], bane: "Витэ других Сородичей слишком притягательно; правосудие легко превращается в зависимость.", usualSect: "Камарилья" },
  { name: "Бруха", epithet: "мятежники, философы и кулаки революции", disciplines: ["Стремительность", "Могущество", "Присутствие"], bane: "Ярость ближе к поверхности; сопротивляться безумию труднее.", usualSect: "Анархи" },
  { name: "Гангрел", epithet: "выжившие, странники и союзники Зверя", disciplines: ["Анимализм", "Превращение", "Стойкость"], bane: "Безумие оставляет временные звериные черты.", usualSect: "Независимые" },
  { name: "Геката", epithet: "семья смерти, долгов и некромантии", disciplines: ["Прорицание", "Стойкость", "Забвение"], bane: "Поцелуй причиняет жертве мучительную боль вместо экстаза.", usualSect: "Независимые" },
  { name: "Ласомбра", epithet: "безжалостные властители тени", disciplines: ["Доминирование", "Забвение", "Могущество"], bane: "Образ и голос искажаются в отражениях и электронных записях.", usualSect: "Камарилья" },
  { name: "Малкавиан", epithet: "провидцы сломанной перспективы", disciplines: ["Прорицание", "Доминирование", "Затемнение"], bane: "Кровь усиливает внутреннюю травму и нарушения восприятия.", usualSect: "Камарилья" },
  { name: "Министерство", epithet: "искусители, освободители и торговцы верой", disciplines: ["Затемнение", "Присутствие", "Превращение"], bane: "Сверхъестественный и естественный яркий свет особенно мучителен.", usualSect: "Анархи" },
  { name: "Носферату", epithet: "невидимые брокеры информации", disciplines: ["Анимализм", "Затемнение", "Могущество"], bane: "Кровь делает облик отталкивающим и осложняет общение со смертными.", usualSect: "Камарилья" },
  { name: "Равнос", epithet: "странники, плуты и мастера иллюзий", disciplines: ["Анимализм", "Затемнение", "Присутствие"], bane: "Долгое пребывание на одном месте заставляет кровь гореть.", usualSect: "Независимые" },
  { name: "Салюбри", epithet: "редкие целители и преследуемые мученики", disciplines: ["Прорицание", "Доминирование", "Стойкость"], bane: "При использовании сил и питье может открываться третий глаз; кровь особенно желанна другим.", usualSect: "Независимые" },
  { name: "Тореадор", epithet: "одержимые красотой, страстью и признанием", disciplines: ["Прорицание", "Стремительность", "Присутствие"], bane: "Безобразная среда мешает действовать, а совершенство способно зачаровать.", usualSect: "Камарилья" },
  { name: "Тремер", epithet: "расколотые колдуны крови", disciplines: ["Прорицание", "Доминирование", "Кровавое чародейство"], bane: "Кровные узы и внутренняя иерархия работают не так, как прежде.", usualSect: "Камарилья" },
  { name: "Цимисхи", epithet: "владельцы земли, плоти и людей", disciplines: ["Анимализм", "Доминирование", "Превращение"], bane: "Для сна необходима связь с избранным владением или собственностью.", usualSect: "Шабаш / независимые" },
  { name: "Вентру", epithet: "правители, стратеги и голубая кровь", disciplines: ["Доминирование", "Стойкость", "Присутствие"], bane: "Питаться можно только от строго определённого типа смертных.", usualSect: "Камарилья" },
  { name: "Каитиф", epithet: "бесклановые изгои", disciplines: [], bane: "Не имеют кланового наследия и платят больше опыта за Дисциплины.", usualSect: "Любая / вне сект" },
  { name: "Тонкокровный", epithet: "сумеречное поколение", disciplines: ["Алхимия тонкой крови"], bane: "Могущество крови 0; достоинства и недостатки тонкой крови определяют границы возможного.", usualSect: "Вне сект" },
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
  };
}
