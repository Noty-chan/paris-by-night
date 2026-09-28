import { useEffect, useState } from "react";
import { basicsSection, creationSection } from "../data/rulebookBasics";
import { clansSection } from "../data/rulebookClans";
import { disciplineSection, VERIFIED_DISCIPLINE_NAMES } from "../data/rulebookDisciplines";
import { advantagesSection, flawsSection } from "../data/rulebookTraits";
import { predatorsSection } from "../data/rulebookPredators";
import { memoriamSection } from "../data/rulebookMemoriam";

const sections = [basicsSection, creationSection, clansSection, disciplineSection, advantagesSection, flawsSection, predatorsSection, memoriamSection];
export function RulebookPage() {
  const [active, setActive] = useState("basics");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [showBack, setShowBack] = useState(false);
  useEffect(() => {
    const main = document.querySelector("main");
    const onScroll = () => setShowBack((main?.scrollTop ?? 0) > 600);
    main?.addEventListener("scroll", onScroll); onScroll();
    return () => main?.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const sync = () => {
      const [, section, entry] = location.hash.slice(1).split("/");
      const targetSection = sections.find((item) => item.id === section);
      if (targetSection) { setActive(section); setQuery(""); setCategory(""); setPage(0); }
      if (entry?.startsWith("search:")) { try { setQuery(decodeURIComponent(entry.slice(7))); } catch { setQuery(""); } return; }
      if (entry && targetSection) setPage(Math.max(0, Math.floor(targetSection.entries.findIndex((item) => item.id === entry) / pageSize)));
      if (entry) window.setTimeout(() => { const target = document.getElementById(entry); if (target instanceof HTMLDetailsElement) target.open = true; target?.scrollIntoView({ block: "start" }); }, 50);
    };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const selected = sections.find((item) => item.id === active) ?? sections[0];
  const needle = query.trim().toLocaleLowerCase("ru").replaceAll("ё", "е");
  const visible = needle ? sections : [selected];
  const matches = visible.flatMap((section) => section.entries
    .filter((entry) => (!needle || JSON.stringify(entry).toLocaleLowerCase("ru").replaceAll("ё", "е").includes(needle)) && (!category || entry.tags.includes(category)))
    .map((entry) => ({ section, entry })));
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const currentPage = Math.min(page, pages - 1);
  const shown = matches.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const categories = selected.id === "disciplines" ? VERIFIED_DISCIPLINE_NAMES : [];
  const turnPage = (next: number) => { setPage(next); document.querySelector(".rulebook-controls")?.scrollIntoView({ block: "start", behavior: "smooth" }); };
  return <div className="page rulebook-page">
    <div className="page-head"><div><div className="eyebrow">Проверено по книгам / V5</div><h2>Справочник</h2></div><span>Основная книга + In Memoriam</span></div>
    <details className="rulebook-scope"><summary>Механика по двум книгам · источники и границы</summary><p>Краткий пересказ выбранных правил, не замена книгам. На каждой карточке указана печатная страница. Домашние правила и перенос метаплота в Париж 2004 года обсуждаем отдельно. Материалы дополнительных книг, которых у нас нет, не выдаём за проверенные. Лирические вставки и длинные примеры остаются в книгах.</p></details>
    <div className="rulebook-controls"><label>Найти правило<input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); setCategory(""); }} placeholder="Голод, ритуал, Богатство…" /></label><label className="rulebook-mobile-section">Раздел<select value={active} onChange={(event) => { location.hash = `guide/${event.target.value}`; }}>{sections.map((section) => <option key={section.id} value={section.id}>{section.title} · {section.entries.length}</option>)}</select></label><nav aria-label="Разделы справочника">{sections.map((section) => <a key={section.id} className={section.id === active ? "active" : ""} href={`#guide/${section.id}`}>{section.title}<small>{section.entries.length}</small></a>)}</nav>{!needle && categories.length > 0 && <label>Дисциплина / практика<select value={category} onChange={(event) => { setCategory(event.target.value); setPage(0); }}><option value="">Все дисциплины</option>{categories.map((name) => <option key={name}>{name}</option>)}</select></label>}</div>
    {selected.id === "creation" && !needle && <a className="rulebook-create-link" href="#create">Открыть пошаговое создание →</a>}
    <div className="rulebook-pagination" aria-label="Страницы справочника"><span>{matches.length ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, matches.length)} из ${matches.length}` : "Нет карточек"}</span><button type="button" disabled={currentPage === 0} onClick={() => turnPage(currentPage - 1)}>← Назад</button><span>{currentPage + 1} / {pages}</span><button type="button" disabled={currentPage >= pages - 1} onClick={() => turnPage(currentPage + 1)}>Далее →</button></div>
    {visible.map((section) => {
      const entries = shown.filter((item) => item.section.id === section.id).map((item) => item.entry);
      if (!entries.length) return null;
      return <section key={section.id} className="rulebook-section"><h3>{section.title}</h3><p>{section.intro}</p>{entries.map((entry) => <details key={entry.id} id={entry.id} className="rulebook-card" open={needle ? true : undefined}><summary><span><em className="rulebook-tags">{entry.tags.filter((tag) => tag !== "дисциплина" && tag !== "общие правила").slice(0, 3).join(" · ").replace("уровень-", "уровень ")}</em><strong>{entry.title}</strong><span>{entry.summary}</span></span><small>{entry.source.book === "core" ? "Основная книга" : "In Memoriam"} · с. {entry.source.pages}</small></summary><div className="rulebook-content">{entry.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{entry.bullets && <ul>{entry.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>}{entry.table && <div className="rulebook-table"><table><thead><tr>{entry.table.headers.map((header, index) => <th key={index}>{header}</th>)}</tr></thead><tbody>{entry.table.rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column}>{cell}</td>)}</tr>)}</tbody></table></div>}<a href={`#guide/${section.id}/${entry.id}`}>Ссылка на карточку</a></div></details>)}</section>;
    })}
    {matches.length > pageSize && <div className="rulebook-pagination"><button type="button" disabled={currentPage === 0} onClick={() => turnPage(currentPage - 1)}>← Назад</button><span>{currentPage + 1} / {pages}</span><button type="button" disabled={currentPage >= pages - 1} onClick={() => turnPage(currentPage + 1)}>Далее →</button></div>}
    {needle && !sections.some((section) => section.entries.some((entry) => JSON.stringify(entry).toLocaleLowerCase("ru").replaceAll("ё", "е").includes(needle))) && <p role="status">Ничего не найдено. Попробуй другое название или очисти поиск.</p>}
    {showBack && <button type="button" className="rulebook-back" onClick={() => document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" })}>↑ К разделам и поиску</button>}
  </div>;
}
