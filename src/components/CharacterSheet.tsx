import { useEffect, useState } from "react";
import {
  ATTRIBUTE_GROUPS,
  Character,
  Damage,
  DISCIPLINE_NAMES,
  DisciplineEntry,
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
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

function SectionTitle({ index, title, hint, id }: { index: string; title: string; hint?: string; id: string }) {
  return (
    <div className="rule-title" id={id}>
      <span>{index}</span><h3>{title}</h3>{hint && <small>{hint}</small>}
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

function TraitList({ title, entries, onChange }: { title: string; entries: TraitEntry[]; onChange: (entries: TraitEntry[]) => void }) {
  const update = (id: string, patch: Partial<TraitEntry>) => onChange(entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  return (
    <div className="trait-list">
      <div className="subhead"><h4>{title}</h4><button type="button" onClick={() => onChange([...entries, { id: uid("trait"), name: "", rating: 0, note: "" }])}>+ добавить</button></div>
      {entries.map((entry) => (
        <div className="trait-row" key={entry.id}>
          <input aria-label={`${title}: название`} placeholder="Название" value={entry.name} onChange={(event) => update(entry.id, { name: event.target.value })} />
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
      <datalist id="discipline-names">{DISCIPLINE_NAMES.map((name) => <option value={name} key={name} />)}</datalist>
      {entries.map((entry) => (
        <div className="discipline-row" key={entry.id}>
          <div className="discipline-main">
            <input list="discipline-names" aria-label="Название дисциплины" placeholder="Дисциплина" value={entry.name} onChange={(event) => update(entry.id, { name: event.target.value })} />
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

export function CharacterSheet({ character, onChange, onPrepareRoll }: Props) {
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("identity");
  const set = <K extends keyof Character>(key: K, value: Character[K]) => onChange({ ...character, [key]: value });
  const baseHealth = (character.attributes.Выносливость ?? 1) + 3;
  const baseWillpower = (character.attributes.Самообладание ?? 1) + (character.attributes.Решительность ?? 1);
  const selectedPool = (selectedAttribute ? character.attributes[selectedAttribute] : 0) + (selectedSkill ? character.skills[selectedSkill] : 0);
  const setHealthMax = (max: number) => onChange({ ...character, healthMax: max, healthDamage: resizeDamage(character.healthDamage, max) });
  const setWillpowerMax = (max: number) => onChange({ ...character, willpowerMax: max, willpowerDamage: resizeDamage(character.willpowerDamage, max) });

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

  return (
    <div className="paper sheet full-sheet">
      <nav className="sheet-index" aria-label="Разделы листа">
        {SHEET_SECTIONS.map(([id, index, label]) => (
          <a href={`#${id}`} key={id} className={activeSection === id ? "active" : ""} onClick={() => setActiveSection(id)}>
            <small>{index}</small><span>{label}</span>
          </a>
        ))}
      </nav>

      <SectionTitle index="00" title="Личность" hint="Кто ты этой ночью" id="identity" />
      <div className="sheet-id">
        <Field label="Имя" value={character.name} onChange={(value) => set("name", value)} />
        <Field label="Концепция" value={character.concept} onChange={(value) => set("concept", value)} />
        <Field label="Игрок" value={character.player} onChange={(value) => set("player", value)} />
        <Field label="Хроника" value={character.chronicle} onChange={(value) => set("chronicle", value)} />
        <Field label="Клан" value={character.clan} onChange={(value) => set("clan", value)} />
        <Field label="Секта" value={character.sect} onChange={(value) => set("sect", value)} />
        <Field label="Сир" value={character.sire} onChange={(value) => set("sire", value)} />
        <Field label="Поколение" value={character.generation} onChange={(value) => set("generation", value)} />
        <Field label="Тип хищника" value={character.predatorType} onChange={(value) => set("predatorType", value)} />
      </div>
      <div className="sheet-text-grid identity-drives">
        <TextBox label="Амбиция" value={character.ambition} onChange={(value) => set("ambition", value)} />
        <TextBox label="Желание" value={character.desire} onChange={(value) => set("desire", value)} />
      </div>

      <SectionTitle index="01" title="Атрибуты" hint="От 1 до 5" id="attributes" />
      <div className="attribute-grid">
        {ATTRIBUTE_GROUPS.map(([group, attrs]) => <div key={group}><h4>{group}</h4>{attrs.map((attr) => <div className="stat" key={attr}><button type="button" className={`trait-select ${selectedAttribute === attr ? "selected" : ""}`} onClick={() => setSelectedAttribute(selectedAttribute === attr ? null : attr)}>{attr}</button><Dots value={character.attributes[attr]} onChange={(value) => set("attributes", { ...character.attributes, [attr]: value })} /></div>)}</div>)}
      </div>

      <SectionTitle index="02" title="Навыки" hint="Специализация даёт дополнительную кость" id="skills" />
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

      <SectionTitle index="03" title="Кровь и состояние" hint="Зверь ведёт свой счёт" id="blood" />
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
          <div className="derived"><span>Воля: Самообладание + Решительность = {baseWillpower}</span><button type="button" onClick={() => setWillpowerMax(baseWillpower)}>применить</button><input type="number" min="1" max="15" value={character.willpowerMax} onChange={(event) => setWillpowerMax(Math.max(1, Math.min(15, Number(event.target.value))))} /></div>
          <DamageTrack label="Воля" damage={character.willpowerDamage} onChange={(value) => set("willpowerDamage", value)} />
        </div>
      </div>
      <div className="sheet-text-grid blood-notes">
        <TextBox label="Предпочтительный резонанс" value={character.resonance} onChange={(value) => set("resonance", value)} />
        <TextBox label="Дискразия" value={character.dyscrasia} onChange={(value) => set("dyscrasia", value)} />
        <TextBox label="Клановое проклятие и тяжесть" value={character.clanBane} onChange={(value) => set("clanBane", value)} wide />
      </div>

      <SectionTitle index="04" title="Дисциплины" hint="Силы, ритуалы и амальгамы" id="disciplines" />
      <DisciplineList entries={character.disciplines} onChange={(value) => set("disciplines", value)} />

      <SectionTitle index="05" title="Преимущества" hint="Связи, ресурсы и осложнения" id="advantages" />
      <div className="traits-grid">
        <TraitList title="Преимущества и предания" entries={character.advantages} onChange={(value) => set("advantages", value)} />
        <TraitList title="Недостатки" entries={character.flaws} onChange={(value) => set("flaws", value)} />
      </div>

      <SectionTitle index="06" title="Человечность и связи" hint="То, ради чего ещё стоит просыпаться" id="humanity" />
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
