import type { Character, DisciplineEntry, TraitEntry } from "../data/character";

type PdfField = { value?: unknown };
type PdfFields = Record<string, PdfField[] | undefined>;

export type Wod5PdfImport = {
  patch: Partial<Character>;
  imported: string[];
  warning: string;
};

const ATTRIBUTE_NAMES = ["Сила", "Ловкость", "Выносливость", "Харизма", "Манипулирование", "Самообладание", "Интеллект", "Смекалка", "Упорство"];
const SKILL_NAMES = [
  "Атлетика", "Вождение", "Воровство", "Выживание", "Драка", "Ремесло", "Скрытность", "Стрельба", "Фехтование",
  "Запугивание", "Исполнение", "Лидерство", "Обращение с животными", "Проницательность", "Убеждение", "Знание улиц", "Хитрость", "Этикет",
  "Академические знания", "Естественные науки", "Медицина", "Бдительность", "Оккультизм", "Политика", "Расследование", "Технологии", "Финансы",
];
const DISCIPLINE_DOT_STARTS = [181, 191, 201, 186, 196, 206];

const textAliases: Record<string, string> = {
  "Бродячий Кот": "Уличный кот",
  "Песочный Человек": "Песочный человек",
  "Королева Сцены": "Королева сцены",
  "Кровопийца": "Кровосос",
  "Уличное чутьё": "Знание улиц",
  "Гуманитарные науки": "Академические знания",
  "Наблюдательность": "Бдительность",
  "Техника": "Технологии",
  "Обаяние": "Харизма",
  "Манипуляция": "Манипулирование",
  "Ясновидение": "Прорицание",
  "Величие": "Присутствие",
  "Мощь": "Могущество",
  "Сокрытие": "Затемнение",
  "Метаморфозы": "Превращение",
  "Магия Крови": "Кровавое чародейство",
  "Кровавое Колдовство": "Кровавое чародейство",
  "Министри": "Министерство",
  "Холерик": "Холерический",
  "Сангвиник": "Сангвинический",
  "Флегматик": "Флегматический",
  "Меланхолик": "Меланхолический",
};

function clean(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

// The compatibility archive is deliberately lossless: line breaks and the
// exact checkbox values are useful when somebody compares it with the source.
function raw(value: unknown) {
  return String(value ?? "");
}

function canonical(value: unknown) {
  const normalized = clean(value);
  return textAliases[normalized] ?? normalized;
}

function checked(fields: PdfFields, name: string) {
  const value = clean(fields[name]?.[0]?.value).toLowerCase();
  return Boolean(value && value !== "off" && value !== "false" && value !== "0");
}

function rating(fields: PdfFields, start: number) {
  return Array.from({ length: 5 }, (_, index) => checked(fields, `dot${start + index}`) ? 1 : 0).reduce<number>((sum, value) => sum + value, 0);
}

function getText(fields: PdfFields, name: string) {
  return clean(fields[name]?.[0]?.value);
}

function parseConvictionsAndTouchstones(value: string) {
  const convictions = value.match(/Принципы:\s*([\s\S]*?)(?=Опоры:|$)/i)?.[1]?.trim() ?? "";
  const touchstones = value.match(/Опоры:\s*([\s\S]*)$/i)?.[1]?.trim() ?? "";
  return { convictions, touchstones };
}

async function loadPdfRuntime() {
  const [{ getDocument, GlobalWorkerOptions }, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  GlobalWorkerOptions.workerSrc = worker.default;
  return getDocument;
}

export async function importWod5Pdf(file: File): Promise<Wod5PdfImport> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Нужен PDF-файл из конструктора WOD5.");
  const getDocument = await loadPdfRuntime();
  const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const fields = (await pdf.getFieldObjects()) as PdfFields | null;
  if (!fields?.clan || !fields?.predator) throw new Error("Не удалось узнать этот PDF. Поддерживается лист, экспортированный из конструктора WOD5.");

  const patch: Partial<Character> = {};
  const imported: string[] = [];
  patch.wod5Pdf = { fields: Object.fromEntries(Object.entries(fields).map(([name, values]) => [name, raw(values?.[0]?.value)])) };
  const applyText = (field: string, target: keyof Character, transform = canonical) => {
    const value = transform(getText(fields, field));
    if (value) { (patch as Record<string, unknown>)[target] = value; imported.push(String(target)); }
  };

  applyText("name", "name", clean);
  applyText("concept", "concept", clean);
  applyText("chronicle", "chronicle", clean);
  applyText("sire", "sire", clean);
  applyText("ambition", "ambition", clean);
  applyText("desire", "desire", clean);
  applyText("clan", "clan");
  applyText("predator", "predatorType");
  applyText("resonance", "resonance");
  applyText("bane", "clanBane", clean);
  applyText("appearance", "appearance", clean);
  applyText("history", "history", clean);
  applyText("notes", "notes", clean);

  const generation = getText(fields, "generation").match(/\d{1,2}/)?.[0];
  if (generation) { patch.generation = generation; imported.push("generation"); }

  const attributes = Object.fromEntries(ATTRIBUTE_NAMES.map((name, index) => [name, rating(fields, index * 5 + 1)]));
  if (Object.values(attributes).some(Boolean)) {
    patch.attributes = attributes;
    patch.healthMax = (attributes["Выносливость"] ?? 1) + 3;
    patch.willpowerMax = (attributes["Самообладание"] ?? 1) + (attributes["Упорство"] ?? 1);
    imported.push("attributes");
  }

  const skills = Object.fromEntries(SKILL_NAMES.map((name, index) => [name, rating(fields, 46 + index * 5)]));
  if (Object.values(skills).some(Boolean)) { patch.skills = skills; imported.push("skills"); }
  const specialties = Object.fromEntries(SKILL_NAMES.map((name, index) => [name, getText(fields, `skills${index + 1}`)]));
  if (Object.values(specialties).some(Boolean)) { patch.specialties = specialties; imported.push("specialties"); }

  const disciplines: DisciplineEntry[] = DISCIPLINE_DOT_STARTS.map((start, index) => {
    const name = canonical(getText(fields, `disciplinename${index + 1}`));
    const powers = Array.from({ length: 5 }, (_, powerIndex) => getText(fields, `disciplines${index * 5 + powerIndex + 1}`)).filter(Boolean).join("\n");
    return name ? { id: `wod5-discipline-${index + 1}`, name, rating: rating(fields, start), powers } : null;
  }).filter((item): item is DisciplineEntry => item !== null);
  if (disciplines.length) { patch.disciplines = disciplines; imported.push("disciplines"); }

  const advantages: TraitEntry[] = Array.from({ length: 11 }, (_, index) => {
    const name = getText(fields, `advantages${index + 1}`);
    return name ? { id: `wod5-trait-${index + 1}`, name, rating: rating(fields, 221 + index * 5), note: "Импортировано из PDF WOD5" } : null;
  }).filter((item): item is TraitEntry => item !== null);
  if (advantages.length) { patch.advantages = advantages; imported.push("advantages"); }

  const bonds = parseConvictionsAndTouchstones(getText(fields, "T&C"));
  if (bonds.convictions) { patch.convictions = bonds.convictions; imported.push("convictions"); }
  if (bonds.touchstones) { patch.touchstones = bonds.touchstones; imported.push("touchstones"); }

  const bloodPotency = rating(fields, 211);
  if (bloodPotency) { patch.bloodPotency = bloodPotency; imported.push("bloodPotency"); }

  return {
    patch,
    imported,
    warning: `Все ${Object.keys(fields).length} поля PDF сохранены в совместимых данных листа. Отметки урона, Воли и разделение строк «Преимущества и недостатки» проверь вручную в нашем листе.`,
  };
}
