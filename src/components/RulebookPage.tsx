import { useEffect, useState } from "react";
import { basicsSection, creationSection } from "../data/rulebookBasics";
import { clansSection } from "../data/rulebookClans";
import { disciplineSection } from "../data/rulebookDisciplines";
import { advantagesSection, flawsSection } from "../data/rulebookTraits";
import { predatorsSection } from "../data/rulebookPredators";
import { memoriamSection } from "../data/rulebookMemoriam";

const sections = [basicsSection, creationSection, clansSection, disciplineSection, advantagesSection, flawsSection, predatorsSection, memoriamSection];
export function RulebookPage() {
  const [active, setActive] = useState("basics");
  const [query, setQuery] = useState("");
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
      if (sections.some((item) => item.id === section)) { setActive(section); setQuery(""); }
      if (entry?.startsWith("search:")) { try { setQuery(decodeURIComponent(entry.slice(7))); } catch { setQuery(""); } return; }
      if (entry) window.setTimeout(() => { const target = document.getElementById(entry); if (target instanceof HTMLDetailsElement) target.open = true; target?.scrollIntoView({ block: "start" }); }, 50);
    };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const selected = sections.find((item) => item.id === active) ?? sections[0];
  const needle = query.trim().toLocaleLowerCase("ru").replaceAll("ё", "е");
  const visible = needle ? sections : [selected];
  return <div className="page rulebook-page">
    <div className="page-head"><div><div className="eyebrow">Проверено по книгам / V5</div><h2>Справочник</h2></div><span>Основная книга + In Memoriam</span></div>
    <p className="rulebook-scope">Краткий пересказ выбранных правил, не замена книгам. На каждой карточке указана печатная страница. Правила хроники обсуждаем отдельно: поздний метаплот V5 не переносится автоматически в наш Париж 2004 года. Материалы дополнительных книг, которых у нас нет, не выдаём за проверенные.</p>
    <div className="rulebook-controls"><label>Найти правило<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Голод, ритуал, Богатство…" /></label><nav aria-label="Разделы справочника">{sections.map((section) => <a key={section.id} className={section.id === active ? "active" : ""} href={`#guide/${section.id}`}>{section.title}<small>{section.entries.length}</small></a>)}</nav></div>
    {visible.map((section) => {
      const entries = section.entries.filter((entry) => !needle || JSON.stringify(entry).toLocaleLowerCase("ru").replaceAll("ё", "е").includes(needle));
      if (!entries.length) return null;
      return <section key={section.id} className="rulebook-section"><h3>{section.title}</h3><p>{section.intro}</p>{entries.map((entry) => <details key={entry.id} id={entry.id} className="rulebook-card" open={needle ? true : undefined}><summary><span><em className="rulebook-tags">{entry.tags.filter((tag) => tag !== "дисциплина" && tag !== "общие правила").slice(0, 3).join(" · ").replace("уровень-", "уровень ")}</em><strong>{entry.title}</strong><span>{entry.summary}</span></span><small>{entry.source.book === "core" ? "Основная книга" : "In Memoriam"} · с. {entry.source.pages}</small></summary><div className="rulebook-content">{entry.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{entry.bullets && <ul>{entry.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>}{entry.table && <div className="rulebook-table"><table><thead><tr>{entry.table.headers.map((header, index) => <th key={index}>{header}</th>)}</tr></thead><tbody>{entry.table.rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column}>{cell}</td>)}</tr>)}</tbody></table></div>}<a href={`#guide/${section.id}/${entry.id}`}>Ссылка на карточку</a></div></details>)}</section>;
    })}
    {needle && !sections.some((section) => section.entries.some((entry) => JSON.stringify(entry).toLocaleLowerCase("ru").replaceAll("ё", "е").includes(needle))) && <p role="status">Ничего не найдено. Попробуй другое название или очисти поиск.</p>}
    {showBack && <button type="button" className="rulebook-back" onClick={() => document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" })}>↑ К разделам и поиску</button>}
  </div>;
}
