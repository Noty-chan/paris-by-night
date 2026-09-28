import { useEffect, useState } from "react";
import type { Character, DisciplineEntry, HumanityAnchor, TraitEntry } from "../data/character";
import {
  ATTRIBUTE_GROUPS,
  CLAN_NAMES,
  DISCIPLINE_NAMES,
  GENERATIONS,
  PREDATOR_TYPES,
  SECT_NAMES,
  SKILL_GROUPS,
} from "../data/character";
import { CORE_CLAN_PROFILES } from "../data/rulebookClans";
import { basicsSection, creationSection } from "../data/rulebookBasics";
import { predatorsSection } from "../data/rulebookPredators";
import { VERIFIED_ADVANTAGE_NAMES, VERIFIED_FLAW_NAMES } from "../data/rulebookTraits";
import { distributionIssues, parseCreationScore, suggestClanDisciplines, updateCreationAttribute, updateCreationSkill } from "../lib/creation";
import "./CharacterCreation.css";

type Props = {
  character: Character;
  onChange: (character: Character) => void;
  onOpenSheet: () => void;
};

const STEPS = ["Личность", "Атрибуты", "Навыки", "Дисциплины и охота", "Преимущества", "Опоры", "Итог"] as const;
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const creationPoints = creationSection.entries.find((entry) => entry.id === "creation-points");
const SKILL_SCHEMES = (creationPoints?.table?.rows ?? []).map(([title, pattern], index) => ({ id: `scheme-${index}`, title, pattern }));
const ruleLink = (section: string, name: string) => `#guide/${section}/search:${encodeURIComponent(name)}`;
const ratingCounts = (values: number[]) => [0, 1, 2, 3, 4, 5].map((score) => `${score}: ${values.filter((value) => value === score).length}`).join(" · ");

function RuleHelp({ entry, section = "creation" }: { entry?: { title: string; summary: string; paragraphs: string[]; source: { pages: string } }; section?: string }) {
  if (!entry) return null;
  return (
    <details className="creation-help">
      <summary>{entry.summary}</summary>
      <p>{entry.paragraphs[0]}</p>
      <a href={ruleLink(section, entry.title)}>Описание в справочнике · с. {entry.source.pages} →</a>
    </details>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="creation-field"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="creation-field"><span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Выбрать…</option>
        {value && !options.includes(value) && <option value={value}>{value} · сохранённый вариант</option>}
        {options.map((option) => <option value={option} key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ScoreField({
  label, value, id, error, draft, onChange, onBlur,
}: {
  label: string; value: number; id: string; error?: string; draft?: string;
  onChange: (raw: string) => void; onBlur: () => void;
}) {
  return (
    <div className="creation-score">
      <label htmlFor={id}>{label}</label>
      <div className="creation-score-controls" role="group" aria-label={`${label}: изменение значения`}>
        <button type="button" aria-label={`${label}: уменьшить на 1`} disabled={value <= 0} onClick={() => onChange(String(Math.max(0, value - 1)))}>−</button>
        <button type="button" className="creation-score-value" aria-label={`${label}: ${value}, увеличить на 1`} disabled={value >= 5} onClick={() => onChange(String(Math.min(5, value + 1)))}>{value}</button>
        <button type="button" className="creation-score-reset" aria-label={`${label}: сбросить на 0`} title="Сбросить на 0" disabled={value === 0 && !error} onClick={() => onChange("0")}>↺</button>
      </div>
      <details className="creation-score-manual"><summary>Ввести число</summary><input id={id} aria-label={label} aria-invalid={Boolean(error)} type="number" inputMode="numeric" min={0} max={5} step={1} value={draft ?? value} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} /></details>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}

function TraitEditor({ title, entries, options, onChange }: { title: string; entries: TraitEntry[]; options: readonly string[]; onChange: (entries: TraitEntry[]) => void }) {
  const update = (id: string, patch: Partial<TraitEntry>) => onChange(entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  return (
    <section className="creation-list">
      <div className="creation-list-head"><h3>{title}</h3><button type="button" onClick={() => onChange([...entries, { id: uid(title), name: "", rating: 0, note: "" }])}>+ Добавить</button></div>
      {entries.map((entry) => {
        const known = options.includes(entry.name);
        const selectValue = known ? entry.name : entry.name ? "__custom__" : "";
        return <div className="creation-trait-row" key={entry.id}>
          <label className="creation-field"><span>Название</span>
            <select value={selectValue} onChange={(event) => update(entry.id, { name: event.target.value === "__custom__" ? (known || !entry.name ? "Другое" : entry.name) : event.target.value })}>
              <option value="">Выбрать…</option>
              {options.map((option) => <option key={option} value={option}>{option}</option>)}
              <option value="__custom__">Своё название…</option>
            </select>
          </label>
          {selectValue === "__custom__" && <TextField label="Своё название" value={entry.name === "Другое" ? "" : entry.name} placeholder="Введите название" onChange={(name) => update(entry.id, { name: name || "Другое" })} />}
          {known && <a className="creation-rule-link" href={ruleLink(title === "Недостатки" ? "flaws" : "advantages", entry.name)}>Описание из книги →</a>}
          <ScoreField label="Точки (0–5)" id={`${entry.id}-rating`} value={entry.rating} onChange={(raw) => { const score = parseCreationScore(raw); if (score !== null) update(entry.id, { rating: score }); }} onBlur={() => {}} />
          <TextField label="Примечание" value={entry.note} placeholder="Уточнение или источник" onChange={(note) => update(entry.id, { note })} />
          <button className="creation-remove" type="button" aria-label={`Удалить ${title}`} onClick={() => onChange(entries.filter((item) => item.id !== entry.id))}>×</button>
        </div>;
      })}
    </section>
  );
}

function AnchorEditor({ entries, onChange }: { entries: HumanityAnchor[]; onChange: (entries: HumanityAnchor[]) => void }) {
  const save = (next: HumanityAnchor[]) => onChange(next);
  const update = (id: string, patch: Partial<HumanityAnchor>) => save(entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  return (
    <div className="creation-anchors">
      <p className="creation-note">В основной книге Опора — живой человек, воплощающий принцип персонажа. Для анциллы возможны особые истории: сверь их отдельно.</p>
      {entries.map((entry, index) => <div className="creation-anchor-row" key={entry.id}>
        <label className="creation-field"><span>Опора {index + 1}</span><textarea rows={2} value={entry.touchstone} placeholder="Человек и его связь с персонажем" onChange={(event) => update(entry.id, { touchstone: event.target.value })} /></label>
        <label className="creation-field"><span>Убеждение {index + 1}</span><textarea rows={2} value={entry.conviction} placeholder="Принцип, который поддерживает эта связь" onChange={(event) => update(entry.id, { conviction: event.target.value })} /></label>
        <button className="creation-remove" type="button" aria-label={`Удалить пару ${index + 1}`} onClick={() => save(entries.filter((item) => item.id !== entry.id))}>×</button>
      </div>)}
      <button className="creation-secondary" type="button" onClick={() => save([...entries, { id: uid("humanity-anchor"), conviction: "", touchstone: "" }])}>+ Добавить пару</button>
    </div>
  );
}

export function CharacterCreation({ character, onChange, onOpenSheet }: Props) {
  const [step, setStep] = useState(() => {
    const match = window.location.hash.match(/^#create\/([0-6])$/);
    return match ? Number(match[1]) : 0;
  });
  const [skillCategory, setSkillCategory] = useState<(typeof SKILL_GROUPS)[number][0]>("Физические");
  const [scheme, setScheme] = useState(() => SKILL_SCHEMES[1]?.id ?? SKILL_SCHEMES[0]?.id ?? "");
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [scoreErrors, setScoreErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const syncStep = () => {
      const match = window.location.hash.match(/^#create\/([0-6])$/);
      if (match) setStep(Number(match[1]));
      else if (window.location.hash === "#create") setStep(0);
    };
    window.addEventListener("hashchange", syncStep);
    return () => window.removeEventListener("hashchange", syncStep);
  }, []);

  useEffect(() => {
    window.history.replaceState(window.history.state, "", `#create/${step}`);
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  const setField = <K extends keyof Character>(key: K, value: Character[K]) => onChange({ ...character, [key]: value });
  const editScore = (key: string, raw: string, save: (score: number) => void) => {
    setScoreDrafts((previous) => ({ ...previous, [key]: raw }));
    const score = parseCreationScore(raw);
    if (score === null) {
      setScoreErrors((previous) => ({ ...previous, [key]: "Введите целое число от 0 до 5; значение листа не изменено." }));
      return;
    }
    setScoreErrors((previous) => { const next = { ...previous }; delete next[key]; return next; });
    save(score);
  };
  const blurScore = (key: string) => {
    setScoreDrafts((previous) => { const next = { ...previous }; delete next[key]; return next; });
  };

  const attributeField = (name: string) => {
    const key = `attribute:${name}`;
    return <ScoreField key={name} label={name} id={key} value={character.attributes[name] ?? 0} draft={scoreDrafts[key]} error={scoreErrors[key]} onChange={(raw) => editScore(key, raw, (score) => onChange(updateCreationAttribute(character, name, score)))} onBlur={() => blurScore(key)} />;
  };
  const skillNames = SKILL_GROUPS.find(([category]) => category === skillCategory)?.[1] ?? [];
  const allSkillValues = SKILL_GROUPS.flatMap(([, names]) => names.map((name) => character.skills[name] ?? 0));
  const allAttributeValues = ATTRIBUTE_GROUPS.flatMap(([, names]) => names.map((name) => character.attributes[name] ?? 0));
  const attributeIssues = distributionIssues(allAttributeValues, "1×4, 3×3, 4×2, 1×1");
  const skillIssues = distributionIssues(allSkillValues, SKILL_SCHEMES.find((item) => item.id === scheme)?.pattern ?? "");
  const reviewItems = [
    !character.name.trim() && "Запиши имя персонажа.",
    !character.concept.trim() && "Запиши концепцию.",
    (!character.clan || character.clan === "Не определён") && "Выбери клан или согласуй бескланового персонажа.",
    attributeIssues.length > 0 && `Характеристики не совпадают с обычной стартовой схемой: ${attributeIssues.join(" ")}`,
    skillIssues.length > 0 && `Навыки не совпадают с выбранной базовой схемой: ${skillIssues.join(" ")}`,
    !character.disciplines.some((entry) => entry.rating > 0) && "Распредели Дисциплины либо согласуй исключение с ведущим.",
    character.disciplines.some((entry) => entry.rating > 0 && !entry.powers.trim()) && "У Дисциплины с точками не записаны силы.",
    (!character.humanityAnchors.length || character.humanityAnchors.some((entry) => !entry.conviction.trim() || !entry.touchstone.trim())) && "Заполни обе части каждой пары: Опору и Убеждение.",
  ].filter((item): item is string => Boolean(item));

  const selectedClan = CORE_CLAN_PROFILES.find((profile) => profile.name === character.clan);
  const selectedPredator = predatorsSection.entries.find((entry) => entry.title === character.predatorType);

  const setAnchors = (humanityAnchors: HumanityAnchor[]) => onChange({
    ...character,
    humanityAnchors,
    convictions: humanityAnchors.map((entry) => entry.conviction).join("\n"),
    touchstones: humanityAnchors.map((entry) => entry.touchstone).join("\n"),
  });

  const requestClanDisciplines = () => {
    if (!selectedClan?.disciplines.length) return;
    if (character.clanBane && character.clanBane !== selectedClan.bane) {
      const accepted = window.confirm("Подстановка кланового изъяна заменит уже записанный текст поля. Продолжить? Названия Дисциплин обновятся при подтверждении.");
      if (!accepted) return;
    }
    onChange(suggestClanDisciplines(character, selectedClan));
  };

  const updateDiscipline = (id: string, patch: Partial<DisciplineEntry>) => setField("disciplines", character.disciplines.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  return (
    <section className="creation-flow" aria-label="Создание персонажа" data-step={step}>
      <header className="creation-header">
        <div><span className="creation-kicker">ПОШАГОВЫЙ РЕЖИМ · ТОТ ЖЕ СОХРАНЁННЫЙ ЛИСТ</span><h1>Создание персонажа</h1></div>
        <p>Заполняй в удобном порядке. Изменения сразу передаются листу; готовые пакеты не применяются автоматически.</p>
      </header>

      <nav className="creation-step-nav" aria-label="Шаги создания">
        {STEPS.map((title, index) => <button type="button" key={title} className={index === step ? "active" : index < step ? "visited" : ""} aria-current={index === step ? "step" : undefined} onClick={() => setStep(index)}><small>0{index + 1}</small><span>{title}</span></button>)}
      </nav>
      <label className="creation-mobile-step">Шаг создания<select aria-label="Шаг создания" value={step} onChange={(event) => setStep(Number(event.target.value))}>{STEPS.map((title, index) => <option key={title} value={index}>{index + 1} / {STEPS.length} · {title}</option>)}</select></label>

      <section className="creation-panel" aria-label="Текущий шаг создания">
        <div className="creation-step-title"><span>ШАГ 0{step + 1} / 07</span><h2>{STEPS[step]}</h2></div>

        {step === 0 && <div className="creation-grid">
          <TextField label="Имя персонажа" value={character.name} onChange={(value) => setField("name", value)} />
          <TextField label="Концепция" value={character.concept} onChange={(value) => setField("concept", value)} placeholder="Кем он был и что стало с ним" />
          <TextField label="Игрок" value={character.player} onChange={(value) => setField("player", value)} />
          <TextField label="Хроника" value={character.chronicle} onChange={(value) => setField("chronicle", value)} />
          <SelectField label="Клан" value={character.clan} options={CLAN_NAMES} onChange={(value) => setField("clan", value)} />
          <TextField label="Сир" value={character.sire} onChange={(value) => setField("sire", value)} />
          <SelectField label="Поколение" value={character.generation} options={GENERATIONS} onChange={(value) => setField("generation", value)} />
          <SelectField label="Секта / положение" value={character.sect} options={SECT_NAMES} onChange={(value) => setField("sect", value)} />
          <TextField label="Амбиция" value={character.ambition} onChange={(value) => setField("ambition", value)} />
          <TextField label="Желание" value={character.desire} onChange={(value) => setField("desire", value)} />
          <RuleHelp entry={creationSection.entries.find((entry) => entry.id === "creation-start")} />
        </div>}

        {step === 1 && <div>
          <p className="creation-note">Обычный старт: 1×4 · 3×3 · 4×2 · 1×1.</p>
          <p className="creation-distribution" role="status">{attributeIssues.length ? attributeIssues.join(" ") : "✓ Распределение соответствует обычному старту."}</p>
          <p className="creation-tap-hint">Тап по цифре: +1 · слева: −1 · ↺: сброс на 0.</p>
          {ATTRIBUTE_GROUPS.map(([group, names]) => <section className="creation-score-group" key={group}><h3>{group}</h3><div className="creation-score-grid">{names.map(attributeField)}</div></section>)}
          <details className="creation-help"><summary>Как распределить характеристики</summary><p>Диапазон редактора — 0–5, но обычная стартовая схема не допускает 0 или 5. Одна характеристика на 4, три на 3, четыре на 2 и одна на 1. Нестандартное создание согласуйте с ведущим.</p><a href="#guide/creation/creation-points">Правила распределения · основная книга, с. 136 →</a></details>
          <p className="creation-counts"><b>Core:</b> {creationPoints?.paragraphs[0]} <br /><b>Сейчас:</b> {ratingCounts(allAttributeValues)}</p>
          <p className="creation-derived">Здоровье: <b>{character.healthMax}</b> · Воля: <b>{character.willpowerMax}</b>. Производные шкалы пересчитаны, существующие отметки урона сохранены.</p>
        </div>}

        {step === 2 && <div>
          <p className="creation-note">Схема только подсказывает стартовый пакет навыков: точки не распределяются автоматически. Числовые значения — 0–5; оставляй свои и нестандартные навыки как есть.</p>
          <label className="creation-field creation-scheme"><span>Схема навыков для подсказки</span><select value={scheme} onChange={(event) => setScheme(event.target.value)}>{SKILL_SCHEMES.map((item) => <option value={item.id} key={item.id}>{item.title} · {item.pattern}</option>)}</select></label>
          <p className="creation-counts"><b>Выбрано:</b> {SKILL_SCHEMES.find((item) => item.id === scheme)?.pattern ?? "схема не задана"} · <b>Сейчас (0–5):</b> {ratingCounts(allSkillValues)}. Сравнение — подсказка, ничего не распределяется.</p>
          <p className="creation-distribution" role="status">{skillIssues.length ? skillIssues.join(" ") : "✓ Базовое распределение навыков совпадает."} Добавки охоты, эпох и опыта сюда не включены.</p>
          <div className="creation-tabs" role="tablist" aria-label="Категория навыков">{SKILL_GROUPS.map(([category]) => <button type="button" role="tab" aria-selected={skillCategory === category} className={skillCategory === category ? "active" : ""} key={category} onClick={() => setSkillCategory(category)}>{category}</button>)}</div>
          <div className="creation-skill-grid">{skillNames.map((name) => {
            const key = `skill:${name}`;
            return <div className="creation-skill-entry" key={name}>
              <ScoreField label={name} id={key} value={character.skills[name] ?? 0} draft={scoreDrafts[key]} error={scoreErrors[key]} onChange={(raw) => editScore(key, raw, (score) => onChange(updateCreationSkill(character, name, score)))} onBlur={() => blurScore(key)} />
              <details className="creation-specialty-edit"><summary>{character.specialties[name] ? `Специализация: ${character.specialties[name]}` : "Добавить специализацию"}</summary><label className="creation-field"><span>{name}</span><input value={character.specialties[name] ?? ""} placeholder="Свободный текст" onChange={(event) => setField("specialties", { ...character.specialties, [name]: event.target.value })} /></label></details>
            </div>;
          })}</div>
          <p className="creation-note">Бесплатные специализации: Ремесло, Исполнение, Академические знания и Естественные науки при получении навыка; есть ещё одна свободная и отдельная специализация стиля охоты. Сверь условия с ведущим.</p>
          <RuleHelp entry={basicsSection.entries.find((entry) => entry.id === "specialties")} section="basics" />
          <RuleHelp entry={creationPoints} />
        </div>}

        {step === 3 && <div className="creation-stack">
          <section className="creation-card">
            <h3>Дисциплины</h3>
            <p className="creation-note">Укажи личный выбор вручную. Смена клана сама ничего не меняет.</p>
            {selectedClan && selectedClan.disciplines.length > 0 && <div className="creation-clan-suggestion"><p><b>{selectedClan.name}:</b> {selectedClan.disciplines.join(" · ")}</p><button type="button" onClick={requestClanDisciplines}>Подставить названия клана</button><details><summary>Изъян клана</summary><p>{selectedClan.bane}</p></details></div>}
            <div className="creation-discipline-list">{character.disciplines.map((entry) => <div className="creation-discipline-row" key={entry.id}>
              <SelectField label="Дисциплина" value={entry.name} options={DISCIPLINE_NAMES} onChange={(name) => updateDiscipline(entry.id, { name })} />
              <ScoreField label="Точки (0–5)" id={`${entry.id}-rating`} value={entry.rating} onChange={(raw) => { const score = parseCreationScore(raw); if (score !== null) updateDiscipline(entry.id, { rating: score }); }} onBlur={() => {}} />
              <button className="creation-remove" type="button" aria-label="Удалить Дисциплину" onClick={() => setField("disciplines", character.disciplines.filter((item) => item.id !== entry.id))}>×</button>
              <label className="creation-field creation-wide"><span>Силы Дисциплины</span><textarea rows={2} value={entry.powers} onChange={(event) => updateDiscipline(entry.id, { powers: event.target.value })} placeholder="Свободная запись" /></label>
            </div>)}</div>
            <button className="creation-secondary" type="button" onClick={() => setField("disciplines", [...character.disciplines, { id: uid("discipline"), name: "", rating: 0, powers: "" }])}>+ Добавить Дисциплину</button>
            <TextField label="Ритуалы / церемонии (свободный текст)" value={character.ritualsCeremonies} onChange={(value) => setField("ritualsCeremonies", value)} />
          </section>
          <section className="creation-card">
            <h3>Стиль охоты</h3>
            <SelectField label="Стиль охоты" value={character.predatorType} options={PREDATOR_TYPES} onChange={(value) => setField("predatorType", value)} />
            {selectedPredator && <details className="creation-predator-summary">
              <summary>{selectedPredator.title} · {selectedPredator.summary}</summary>
              <p>{selectedPredator.paragraphs[0]}</p>
              {selectedPredator.bullets?.map((bullet) => <p className="creation-package" key={bullet}>{bullet}</p>)}
              <a href={ruleLink("predators", selectedPredator.title)}>Полная карточка стиля охоты →</a>
            </details>}
            {!selectedPredator && character.predatorType && <p className="creation-note">Сохранённый вариант «{character.predatorType}» оставлен без изменений; его пакет уточни вручную.</p>}
          </section>
          <RuleHelp entry={creationSection.entries.find((entry) => entry.id === "creation-vampire")} />
        </div>}

        {step === 4 && <div className="creation-stack">
          <p className="creation-note">Справочник помогает выбрать название, но не назначает цены и не применяет пакет охоты. Неизвестные и пользовательские строки сохраняются.</p>
          <TraitEditor title="Преимущества" entries={character.advantages} options={VERIFIED_ADVANTAGE_NAMES} onChange={(entries) => setField("advantages", entries)} />
          <TraitEditor title="Недостатки" entries={character.flaws} options={VERIFIED_FLAW_NAMES} onChange={(entries) => setField("flaws", entries)} />
          <RuleHelp entry={creationSection.entries.find((entry) => entry.id === "creation-vampire")} />
        </div>}

        {step === 5 && <div className="creation-stack">
          <AnchorEditor entries={character.humanityAnchors} onChange={setAnchors} />
          <RuleHelp entry={creationSection.entries.find((entry) => entry.id === "creation-vampire")} />
        </div>}

        {step === 6 && <div className="creation-stack">
          <section className="creation-card creation-review"><h3>Что ещё проверить</h3><p className="creation-note">Сравниваем с базовым стартом. Дополнительные точки и настройки хроники могут объяснять отличия; переходы не заблокированы.</p>{reviewItems.length ? <ul>{reviewItems.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Основные поля заполнены, базовые схемы совпадают. Это не полная проверка правил.</p>}<p>Вручную: пакет охоты, бюджет преимуществ и недостатков, условия выбранных сил, возраст и Океаны Времени.</p></section>
          <div className="creation-summary-grid">
            <section><span>Персонаж</span><b>{character.name || "Без имени"}</b><p>{character.concept || "Концепция не записана"}</p></section>
            <section><span>Клан / поколение</span><b>{character.clan || "Не выбран"} · {character.generation || "—"}</b><p>{selectedClan?.disciplines.join(" · ") || "Клановые Дисциплины сверяются вручную"}</p></section>
            <section><span>Атрибуты и навыки</span><b>Здоровье {character.healthMax} · Воля {character.willpowerMax}</b><p>{Object.values(character.skills).filter((value) => value > 0).length} навыков с точками · схема «{SKILL_SCHEMES.find((item) => item.id === scheme)?.title}» выбрана только как подсказка.</p></section>
            <section><span>Охота</span><b>{character.predatorType || "Стиль не выбран"}</b><p>{selectedPredator?.summary ?? "Пакет охоты не применялся автоматически."}</p></section>
            <section><span>Преимущества / недостатки</span><b>{character.advantages.length} / {character.flaws.length} записей</b><p>Названия и точки можно уточнить на предыдущем шаге.</p></section>
            <section><span>Опоры / убеждения</span><b>{character.humanityAnchors.length} пар</b><p>{character.humanityAnchors.filter((entry) => entry.conviction || entry.touchstone).length} пар с заполненной частью или обеими.</p></section>
          </div>
          <p className="creation-caution">Это обзор заполнения, не проверка готовности RAW. Обычный старт Core имеет отдельные подсказки; создание анциллы по In Memoriam и Океаны Времени проверяются вручную. Пакеты охоты, поколения и эпох не были применены автоматически.</p>
          <button className="creation-open-sheet" type="button" onClick={onOpenSheet}>Открыть полный лист →</button>
        </div>}
      </section>

      <footer className="creation-navigation">
        <button type="button" className="creation-secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>← Назад</button>
        <span>Шаг {step + 1} из {STEPS.length}</span>
        {step < STEPS.length - 1 ? <button type="button" className="creation-primary" onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))}>Дальше →</button> : <button type="button" className="creation-primary" onClick={onOpenSheet}>Открыть лист →</button>}
      </footer>
    </section>
  );
}
