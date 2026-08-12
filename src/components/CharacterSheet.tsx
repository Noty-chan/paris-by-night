import { useEffect, useState } from "react";
import {
  ATTRIBUTE_GROUPS,
  ADVANTAGE_NAMES,
  CLAN_NAMES,
  CLAN_PROFILES,
  Character,
  Damage,
  DISCIPLINE_NAMES,
  DisciplineEntry,
  FLAW_NAMES,
  GENERATIONS,
  PREDATOR_TYPES,
  RESONANCES,
  SECT_NAMES,
  SKILL_GROUPS,
  TraitEntry,
} from "../data/character";

type Props = {
  character: Character;
  onChange: (character: Character) => void;
  onPrepareRoll: (source: string, pool: number, hunger: number) => void;
};

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const SHEET_SECTIONS = [
  ["identity", "00", "Личность"],
  ["attributes", "01", "Атрибуты"],
  ["skills", "02", "Навыки"],
  ["blood", "03", "Кровь"],
  ["disciplines", "04", "Дисциплины"],
  ["advantages", "05", "Преимущества"],
  ["humanity", "06", "Человечность"],
  ["story", "07", "История"],
  ["wod5", "08", "PDF WOD5"],
] as const;

function Dots({ value, max = 5, onChange }: { value: number; max?: number; onChange: (n: number) => void }) {
  return (
    <div className="dots" role="group" aria-label={`Значение ${value} из ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <button
          type="button"
          className={i < value ? "dot active" : "dot"}
          key={i}
          onClick={() => onChange(i + 1 === value ? Math.max(0, value - 1) : i + 1)}
          aria-label={`${i + 1}`}
        />
      ))}
    </div>
  );
}

function Field({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className="field">
      <span>{label}{hint && <i className="field-help" title={hint}>?</i>}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ChoiceField({ label, value, options, onChange, hint }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void; hint?: string }) {
  const selectedValue = options.includes(value) ? value : value && options.includes("Другое / домашняя версия") ? "Другое / домашняя версия" : "";
  return (
    <label className="field choice-field">
      <span>{label}{hint && <i className="field-help" title={hint}>?</i>}</span>
      <select value={selectedValue} onChange={(event) => onChange(event.target.value)}>
        <option value="">Выбрать…</option>
        {options.map((option) => <option value={option} key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function TextBox({ label, value, onChange, wide }: { label: string; value: string; onChange: (v: string) => void; wide?: boolean }) {
  return (
    <label className={wide ? "wide" : ""}>
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SectionTitle({ index, title, hint, id, status }: { index: string; title: string; hint?: string; id: string; status?: "ok" | "warn" }) {
  return (
    <div className="rule-title" id={id}>
      <span>{index}</span><h3>{title}</h3>{status && <b className={`section-status ${status}`}>{status === "ok" ? "готово" : "проверить"}</b>}{hint && <small>{hint}</small>}
    </div>
  );
}

function DamageTrack({ label, damage, onChange }: { label: string; damage: Damage[]; onChange: (damage: Damage[]) => void }) {
  const superficial = damage.filter((cell) => cell === 1).length;
  const aggravated = damage.filter((cell) => cell === 2).length;
  const cycle = (index: number) => onChange(damage.map((cell, i) => i === index ? ((cell + 1) % 3) as Damage : cell));
  return (
    <div className="damage-track">
      <div className="damage-head"><span>{label}</span><small><b>/</b> {superficial} · <b>×</b> {aggravated}</small></div>
      <div className="damage-cells">
        {damage.map((cell, index) => (
          <button type="button" key={index} className={`damage-${cell}`} onClick={() => cycle(index)} aria-label={`${label}, ячейка ${index + 1}: ${cell === 0 ? "чисто" : cell === 1 ? "поверхностный урон" : "тяжёлый урон"}`}>
            {cell === 1 ? "/" : cell === 2 ? "×" : ""}
          </button>
        ))}
      </div>
      <p>Нажатие: чисто → поверхностный → тяжёлый</p>
    </div>
  );
}

function resizeDamage(damage: Damage[], max: number): Damage[] {
  return Array.from({ length: max }, (_, index) => damage[index] ?? 0);
}

function TraitList({ title, entries, options, onChange }: { title: string; entries: TraitEntry[]; options: readonly string[]; onChange: (entries: TraitEntry[]) => void }) {
  const update = (id: string, patch: Partial<TraitEntry>) => onChange(entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  return (
    <div className="trait-list">
      <div className="subhead"><h4>{title}</h4><button type="button" onClick={() => onChange([...entries, { id: uid("trait"), name: "", rating: 0, note: "" }])}>+ добавить</button></div>
      {entries.map((entry) => (
        <div className="trait-row" key={entry.id}>
          <select className="compact-select" aria-label={`${title}: название`} value={options.includes(entry.name) ? entry.name : entry.name ? "Другое" : ""} onChange={(event) => update(entry.id, { name: event.target.value })}><option value="">Выбрать…</option>{options.map((name) => <option value={name} key={name}>{name}</option>)}</select>
          <Dots value={entry.rating} onChange={(rating) => update(entry.id, { rating })} />
          <input aria-label={`${title}: уточнение`} placeholder="Уточнение или источник" value={entry.note} onChange={(event) => update(entry.id, { note: event.target.value })} />
          <button type="button" className="remove-row" onClick={() => onChange(entries.filter((item) => item.id !== entry.id))} aria-label="Удалить">×</button>
        </div>
      ))}
    </div>
  );
}

function DisciplineList({ entries, onChange }: { entries: DisciplineEntry[]; onChange: (entries: DisciplineEntry[]) => void }) {
  const update = (id: string, patch: Partial<DisciplineEntry>) => onChange(entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  return (
    <div className="discipline-list">
      {entries.map((entry) => (
        <div className="discipline-row" key={entry.id}>
          <div className="discipline-main">
            <select className="compact-select" aria-label="Название дисциплины" value={DISCIPLINE_NAMES.includes(entry.name) ? entry.name : ""} onChange={(event) => update(entry.id, { name: event.target.value })}><option value="">Выбрать дисциплину…</option>{DISCIPLINE_NAMES.map((name) => <option value={name} key={name}>{name}</option>)}</select>
            <Dots value={entry.rating} onChange={(rating) => update(entry.id, { rating })} />
            <button type="button" className="remove-row" onClick={() => onChange(entries.filter((item) => item.id !== entry.id))} aria-label="Удалить дисциплину">×</button>
          </div>
          <textarea aria-label="Силы дисциплины" placeholder="Изученные силы, амальгамы, ритуалы…" value={entry.powers} onChange={(event) => update(entry.id, { powers: event.target.value })} />
        </div>
      ))}
      <button type="button" className="add-row" onClick={() => onChange([...entries, { id: uid("discipline"), name: "", rating: 0, powers: "" }])}>+ добавить дисциплину</button>
    </div>
  );
}

function Wod5Compatibility({ fields, onChange }: { fields: Record<string, string>; onChange: (fields: Record<string, string>) => void }) {
  const [query, setQuery] = useState("");
  const entries = Object.entries(fields).filter(([name]) => name.toLowerCase().includes(query.toLowerCase()));
  if (!Object.keys(fields).length) return <div className="wod5-compat empty"><strong>PDF WOD5 ещё не импортирован</strong><p>Кнопка «Импорт PDF WOD5» наверху листа прочитает заполняемый PDF из конструктора и сохранит все его поля локально.</p></div>;
  return (
    <details className="wod5-compat">
      <summary><span>Совместимые данные</span><strong>{Object.keys(fields).length} / 413 полей сохранены</strong><small>основные поля редактируются выше; здесь — полный архив PDF</small></summary>
      <div className="wod5-compat-body"><p>Все значения из исходного PDF сохранены в листе, включая отдельные точки, клетки и поля, которых нет в удобной версии. Их можно найти и исправить здесь; для обычной игры пользуйся разделами листа выше.</p><input aria-label="Поиск поля PDF WOD5" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти поле: dot211, bane, features…" /><div className="wod5-field-grid">{entries.map(([name, value]) => <label key={name}><span>{name}</span>{value.includes("\n") || value.length > 90 ? <textarea value={value} onChange={(event) => onChange({ ...fields, [name]: event.target.value })} /> : <input value={value} onChange={(event) => onChange({ ...fields, [name]: event.target.value })} />}</label>)}</div></div>
    </details>
  );
}

export function CharacterSheet({ character, onChange, onPrepareRoll }: Props) {
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("identity");
  const set = <K extends keyof Character>(key: K, value: Character[K]) => onChange({ ...character, [key]: value });
  const baseHealth = (character.attributes.Выносливость ?? 1) + 3;
  const baseWillpower = (character.attributes.Самообладание ?? 1) + (character.attributes.Упорство ?? 1);
  const selectedPool = (selectedAttribute ? character.attributes[selectedAttribute] : 0) + (selectedSkill ? character.skills[selectedSkill] : 0);
  const setHealthMax = (max: number) => onChange({ ...character, healthMax: max, healthDamage: resizeDamage(character.healthDamage, max) });
  const setWillpowerMax = (max: number) => onChange({ ...character, willpowerMax: max, willpowerDamage: resizeDamage(character.willpowerDamage, max) });
  const clanProfile = CLAN_PROFILES.find((clan) => clan.name === character.clan);
  const attributeCounts = [1, 2, 3, 4].map((rating) => Object.values(character.attributes).filter((value) => value === rating).length);
  const attributesValid = attributeCounts.join("/") === "1/4/3/1";
  const skillCounts = [1, 2, 3, 4].map((rating) => Object.values(character.skills).filter((value) => value === rating).length);
  const skillPattern = skillCounts.join("/");
  const skillsValid = ["3/3/3/1", "7/5/3/0", "10/8/1/0"].includes(skillPattern);
  const disciplineTotal = character.disciplines.reduce((sum, item) => sum + item.rating, 0);
  const expectedDisciplineTotal = character.predatorType ? 4 : 3;
  const advantagesTotal = character.advantages.reduce((sum, item) => sum + item.rating, 0);
  const flawsTotal = character.flaws.reduce((sum, item) => sum + item.rating, 0);
  const identityValid = Boolean(character.name && character.name !== "Без имени" && character.concept && character.clan !== "Не определён" && character.predatorType);
  const bloodValid = character.healthMax === baseHealth && character.willpowerMax === baseWillpower;
  const humanityValid = Boolean(character.convictions.trim() && character.touchstones.trim());
  const audit = [
    { label: "Личность", ok: identityValid, text: identityValid ? "концепция, клан и охота выбраны" : "укажи имя, концепцию, клан и тип хищника" },
    { label: "Атрибуты", ok: attributesValid, text: attributesValid ? "схема 4 / 3×3 / 4×2 / 1" : `сейчас уровни 1/2/3/4: ${attributeCounts.join(" / ")}; нужно 1 / 4 / 3 / 1` },
    { label: "Навыки", ok: skillsValid, text: skillsValid ? "одна из стартовых схем соблюдена" : "выбери схему: специалист, баланс или мастер на все руки" },
    { label: "Дисциплины", ok: disciplineTotal === expectedDisciplineTotal, text: `сейчас ${disciplineTotal}; ${character.predatorType ? "с типом хищника обычно нужно 4" : "до выбора типа хищника нужно 3"}` },
    { label: "Преимущества", ok: advantagesTotal === 7 && flawsTotal >= 2, text: `${advantagesTotal}/7 достоинств · ${flawsTotal}/2+ недостатков` },
    { label: "Производные", ok: bloodValid, text: bloodValid ? "здоровье и воля рассчитаны" : `здоровье ${baseHealth}, воля ${baseWillpower}: нажми «применить»` },
    { label: "Человечность", ok: humanityValid, text: humanityValid ? "убеждения и опоры связаны" : "добавь хотя бы одно убеждение и связанную с ним опору" },
  ];
  const auditReady = audit.filter((item) => item.ok).length;

  const applyClanFoundation = () => {
    if (!clanProfile) return;
    const existing = new Map(character.disciplines.map((entry) => [entry.name, entry]));
    const clanDisciplines = clanProfile.disciplines.map((name, index) => existing.get(name) ?? { id: uid(`clan-${index}`), name, rating: 0, powers: "" });
    const extraDisciplines = character.disciplines.filter((entry) => entry.name && !clanProfile.disciplines.includes(entry.name));
    const disciplines = clanProfile.disciplines.length ? [...clanDisciplines, ...extraDisciplines] : character.disciplines;
    onChange({ ...character, sect: clanProfile.usualSect, clanBane: clanProfile.bane, disciplines });
  };

  useEffect(() => {
    const scrollRoot = document.querySelector("main");
    if (!scrollRoot) return;
    const updateSection = () => {
      const marker = scrollRoot.getBoundingClientRect().top + 150;
      let current: string = SHEET_SECTIONS[0][0];
      SHEET_SECTIONS.forEach(([id]) => {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= marker) current = id;
      });
      setActiveSection(current);
    };
    updateSection();
    scrollRoot.addEventListener("scroll", updateSection, { passive: true });
    return () => scrollRoot.removeEventListener("scroll", updateSection);
  }, []);

  useEffect(() => {
    const goToSection = (index: number) => {
      const safeIndex = Math.max(0, Math.min(SHEET_SECTIONS.length - 1, index));
      const id = SHEET_SECTIONS[safeIndex][0];
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
      setActiveSection(id);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target?.tagName ?? "") || event.ctrlKey || event.metaKey || event.altKey) return;
      const currentIndex = SHEET_SECTIONS.findIndex(([id]) => id === activeSection);
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToSection(currentIndex + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSection(currentIndex - 1);
      } else if (/^[1-8]$/.test(event.key)) {
        event.preventDefault();
        goToSection(Number(event.key) - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSection]);

  return (
    <div className="paper sheet full-sheet">
      <nav className="sheet-index" aria-label="Разделы листа">
        {SHEET_SECTIONS.map(([id, index, label]) => (
          <a href={`#${id}`} key={id} className={activeSection === id ? "active" : ""} onClick={() => setActiveSection(id)}>
            <small>{index}</small><span>{label}</span>
          </a>
        ))}
        <span className="sheet-key-hint"><kbd>←</kbd><kbd>→</kbd><b>разделы</b><kbd>1–8</kbd></span>
      </nav>

      <details className={`sheet-audit ${auditReady === audit.length ? "complete" : ""}`} open={auditReady < 3}>
        <summary><span>Проверка создания</span><strong>{auditReady}/{audit.length}</strong><small>{auditReady === audit.length ? "основа листа готова" : "это подсказки, не запреты"}</small></summary>
        <div>{audit.map((item) => <p className={item.ok ? "ok" : "warn"} key={item.label}><i>{item.ok ? "✓" : "!"}</i><b>{item.label}</b><span>{item.text}</span></p>)}</div>
      </details>

      <SectionTitle index="00" title="Личность" hint="Кто ты этой ночью" id="identity" status={identityValid ? "ok" : "warn"} />
      <div className="sheet-id">
        <Field label="Имя" hint="Имя, которым персонажа знают в хронике." value={character.name} onChange={(value) => set("name", value)} />
        <Field label="Концепция" hint="Короткая формула: кем был, чего хочет и чем опасен." value={character.concept} onChange={(value) => set("concept", value)} />
        <Field label="Игрок" value={character.player} onChange={(value) => set("player", value)} />
        <Field label="Хроника" value={character.chronicle} onChange={(value) => set("chronicle", value)} />
        <ChoiceField label="Клан" hint="Кровное наследие: три Дисциплины, проклятие и принуждение." value={character.clan} options={CLAN_NAMES} onChange={(value) => set("clan", value)} />
        <ChoiceField label="Секта" hint="Политическая принадлежность — это выбор, а не свойство клана." value={character.sect} options={SECT_NAMES} onChange={(value) => set("sect", value)} />
        <Field label="Сир" value={character.sire} onChange={(value) => set("sire", value)} />
        <ChoiceField label="Поколение" hint="Обычный птенец или неонат — 12–13 поколение." value={character.generation} options={GENERATIONS} onChange={(value) => set("generation", value)} />
        <ChoiceField label="Тип хищника" hint="Устойчивая привычка охоты; даёт специализацию, Дисциплину и особенности." value={character.predatorType} options={PREDATOR_TYPES} onChange={(value) => set("predatorType", value)} />
      </div>
      {clanProfile && <div className="clan-helper"><div><small>Каноническая основа</small><strong>{clanProfile.name} · {clanProfile.epithet}</strong><p>{clanProfile.disciplines.join(" · ")}<br />Обычная принадлежность: {clanProfile.usualSect}</p></div><button type="button" onClick={applyClanFoundation}>Подставить основу</button><span>Заполнит названия Дисциплин, проклятие и обычную секту. Точки и парижские отклонения остаются за вами.</span></div>}
      <div className="sheet-text-grid identity-drives">
        <TextBox label="Амбиция" value={character.ambition} onChange={(value) => set("ambition", value)} />
        <TextBox label="Желание" value={character.desire} onChange={(value) => set("desire", value)} />
      </div>

      <SectionTitle index="01" title="Атрибуты" hint="1×4 · 3×3 · 4×2 · 1×1" id="attributes" status={attributesValid ? "ok" : "warn"} />
      <div className="attribute-grid">
        {ATTRIBUTE_GROUPS.map(([group, attrs]) => <div key={group}><h4>{group}</h4>{attrs.map((attr) => <div className="stat" key={attr}><button type="button" className={`trait-select ${selectedAttribute === attr ? "selected" : ""}`} onClick={() => setSelectedAttribute(selectedAttribute === attr ? null : attr)}>{attr}</button><Dots value={character.attributes[attr]} onChange={(value) => set("attributes", { ...character.attributes, [attr]: value })} /></div>)}</div>)}
      </div>

      <SectionTitle index="02" title="Навыки" hint="Выбери одну из трёх стартовых схем" id="skills" status={skillsValid ? "ok" : "warn"} />
      <div className="skill-columns">
        {SKILL_GROUPS.map(([group, skills]) => (
          <div className="skill-group" key={group}>
            <h4>{group}</h4>
            {skills.map((skill) => (
              <div className="skill-row" key={skill}>
                <div className="stat"><button type="button" className={`trait-select ${selectedSkill === skill ? "selected" : ""}`} onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}>{skill}</button><Dots value={character.skills[skill]} onChange={(value) => set("skills", { ...character.skills, [skill]: value })} /></div>
                <input aria-label={`Специализация: ${skill}`} placeholder="специализация" value={character.specialties[skill]} onChange={(event) => set("specialties", { ...character.specialties, [skill]: event.target.value })} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <SectionTitle index="03" title="Кровь и состояние" hint="Зверь ведёт свой счёт" id="blood" status={bloodValid ? "ok" : "warn"} />
      <div className="blood-grid">
        <div className="blood-rating"><span>Голод</span><Dots value={character.hunger} onChange={(value) => set("hunger", value)} /></div>
        <div className="blood-rating"><span>Могущество крови</span><Dots value={character.bloodPotency} max={10} onChange={(value) => set("bloodPotency", value)} /></div>
        <div className="blood-rating humanity-rating"><span>Человечность</span><Dots value={character.humanity} max={10} onChange={(value) => set("humanity", value)} /></div>
        <div className="blood-rating stains-rating"><span>Пятна</span><Dots value={character.stains} max={Math.max(1, 10 - character.humanity)} onChange={(value) => set("stains", value)} /></div>
      </div>
      <div className="vitals-grid">
        <div>
          <div className="derived"><span>Здоровье: Выносливость + 3 = {baseHealth}</span><button type="button" onClick={() => setHealthMax(baseHealth)}>применить</button><input type="number" min="1" max="15" value={character.healthMax} onChange={(event) => setHealthMax(Math.max(1, Math.min(15, Number(event.target.value))))} /></div>
          <DamageTrack label="Здоровье" damage={character.healthDamage} onChange={(value) => set("healthDamage", value)} />
        </div>
        <div>
          <div className="derived"><span>Воля: Самообладание + Упорство = {baseWillpower}</span><button type="button" onClick={() => setWillpowerMax(baseWillpower)}>применить</button><input type="number" min="1" max="15" value={character.willpowerMax} onChange={(event) => setWillpowerMax(Math.max(1, Math.min(15, Number(event.target.value))))} /></div>
          <DamageTrack label="Воля" damage={character.willpowerDamage} onChange={(value) => set("willpowerDamage", value)} />
        </div>
      </div>
      <div className="sheet-text-grid blood-notes">
        <ChoiceField label="Предпочтительный резонанс" value={character.resonance} options={RESONANCES} onChange={(value) => set("resonance", value)} hint="Эмоциональный вкус крови, который поддерживает развитие Дисциплин." />
        <TextBox label="Дискразия" value={character.dyscrasia} onChange={(value) => set("dyscrasia", value)} />
        <TextBox label="Клановое проклятие и тяжесть" value={character.clanBane} onChange={(value) => set("clanBane", value)} wide />
      </div>

      <SectionTitle index="04" title="Дисциплины" hint="3 точки клана + 1 от типа хищника" id="disciplines" status={disciplineTotal === expectedDisciplineTotal ? "ok" : "warn"} />
      <DisciplineList entries={character.disciplines} onChange={(value) => set("disciplines", value)} />

      <SectionTitle index="05" title="Преимущества" hint="7 достоинств · минимум 2 недостатка" id="advantages" status={advantagesTotal === 7 && flawsTotal >= 2 ? "ok" : "warn"} />
      <div className="traits-grid">
        <TraitList title="Преимущества и предания" entries={character.advantages} options={ADVANTAGE_NAMES} onChange={(value) => set("advantages", value)} />
        <TraitList title="Недостатки" entries={character.flaws} options={FLAW_NAMES} onChange={(value) => set("flaws", value)} />
      </div>

      <SectionTitle index="06" title="Человечность и связи" hint="То, ради чего ещё стоит просыпаться" id="humanity" status={humanityValid ? "ok" : "warn"} />
      <div className="sheet-text-grid">
        <TextBox label="Убеждения" value={character.convictions} onChange={(value) => set("convictions", value)} />
        <TextBox label="Опоры" value={character.touchstones} onChange={(value) => set("touchstones", value)} />
        <TextBox label="Котерия и отношения" value={character.coterie} onChange={(value) => set("coterie", value)} />
        <TextBox label="Убежище и домен" value={character.haven} onChange={(value) => set("haven", value)} />
      </div>

      <SectionTitle index="07" title="История и имущество" hint="Всё, что может стать уликой" id="story" />
      <div className="sheet-text-grid long-notes">
        <TextBox label="Внешность и приметы" value={character.appearance} onChange={(value) => set("appearance", value)} />
        <TextBox label="Снаряжение и имущество" value={character.equipment} onChange={(value) => set("equipment", value)} />
        <TextBox label="История" value={character.history} onChange={(value) => set("history", value)} wide />
        <TextBox label="Заметки" value={character.notes} onChange={(value) => set("notes", value)} wide />
      </div>
      <div className="experience-row">
        <label><span>Получено опыта</span><input type="number" min="0" value={character.experienceTotal} onChange={(event) => set("experienceTotal", Math.max(0, Number(event.target.value)))} /></label>
        <label><span>Потрачено</span><input type="number" min="0" value={character.experienceSpent} onChange={(event) => set("experienceSpent", Math.max(0, Number(event.target.value)))} /></label>
        <strong>Доступно: {Math.max(0, character.experienceTotal - character.experienceSpent)} XP</strong>
      </div>
      <SectionTitle index="08" title="Совместимость PDF WOD5" hint="Все поля исходного PDF остаются в локальной копии" id="wod5" />
      <Wod5Compatibility fields={character.wod5Pdf.fields} onChange={(fields) => set("wod5Pdf", { fields })} />
      {(selectedAttribute || selectedSkill) && (
        <div className="sheet-roll-dock" role="region" aria-label="Подготовка броска">
          <div className="roll-formula">
            <small>Быстрый бросок</small>
            <strong>{selectedAttribute ?? "атрибут"} <i>+</i> {selectedSkill ?? "навык"}</strong>
          </div>
          <div className="roll-pool"><span>Пул</span><b>{selectedAttribute && selectedSkill ? selectedPool : "—"}</b><small>Голод {character.hunger}</small></div>
          <button type="button" className="clear-roll" onClick={() => { setSelectedAttribute(null); setSelectedSkill(null); }}>сбросить</button>
          <button type="button" className="prepare-roll" disabled={!selectedAttribute || !selectedSkill} onClick={() => selectedAttribute && selectedSkill && onPrepareRoll(`${selectedAttribute} + ${selectedSkill}`, selectedPool, character.hunger)}>К броску →</button>
        </div>
      )}
    </div>
  );
}
