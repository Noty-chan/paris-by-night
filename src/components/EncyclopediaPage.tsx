import { useMemo, useState } from "react";
import { EMPTY_PERSON_SECTION, FACTION_ENTRIES, FactionEntry, KNOWLEDGE_LABELS, PEDIA_ENTRIES, PEDIA_KIND_LABELS, PediaKind, ZONE_ENTRIES, DistrictEntry } from "../data/pedia";

const KINDS: PediaKind[] = ["district", "faction", "person"];

function RatingDots({ value }: { value: number }) {
  return <span className="pedia-rating" aria-label={`${value} из 5`}>{Array.from({ length: 5 }, (_, index) => <i className={index < value ? "filled" : ""} key={index} />)}</span>;
}

function PersonSection() {
  return <section className="pedia-empty"><div className="pedia-empty-copy"><span>РАЗДЕЛ ПОДГОТОВЛЕН / 0 ЗАПИСЕЙ</span><h3>{EMPTY_PERSON_SECTION.title}</h3><p>{EMPTY_PERSON_SECTION.text}</p></div><div className="pedia-field-grid">{EMPTY_PERSON_SECTION.fields.map((field, index) => <article key={field.title}><small>ПОЛЕ 0{index + 1}</small><strong>{field.title}</strong><p>{field.text}</p></article>)}</div></section>;
}

function ZoneDossier({ zone }: { zone: DistrictEntry }) {
  return <article className="district-dossier" id={`entry-${zone.id}`}>
    <header className="district-dossier-head"><div><span>ПАСПОРТ ЗОНЫ / PAR–LOC</span><h3>{zone.title}</h3><p>{zone.kicker}</p></div><div className="knowledge-stamp">{KNOWLEDGE_LABELS[zone.state]}</div></header>
    <div className="district-editorial"><div className="district-copy">{zone.introduction.map((p) => <p key={p}>{p}</p>)}</div><div className="district-visuals"><figure className="district-photo district-photo--main"><img src={zone.image} alt={zone.imageAlt} /></figure><figure className="district-photo district-photo--secondary"><img src={zone.secondImage} alt={zone.secondImageAlt} /></figure><div className="district-map" aria-hidden="true"><i /><i /><i /><b>{zone.title.toUpperCase()}</b><span>RÉSEAU / 2004</span></div></div></div>
    <div className="district-bottom"><div className="district-notes">{zone.notes.map((note) => <section className={note.tone === "rumor" ? "rumor" : ""} key={note.label}><small>{note.label}</small><p>{note.text}</p></section>)}</div><aside className="district-profile"><div><span>ПРОФИЛЬ ТЕРРИТОРИИ</span><small>не бонусы по умолчанию</small></div><dl>{zone.metrics.map((m) => <div key={m.key} title={m.hint}><dt>{m.label}<small>{m.original}</small></dt><dd><RatingDots value={m.value} /></dd></div>)}</dl></aside></div>
    <section className="night-rules"><div><span>ПРАВИЛА НОЧИ</span><small>свойства места, которые меняют решения</small></div><ol>{zone.nightRules.map((rule) => <li key={rule}>{rule}</li>)}</ol></section>
  </article>;
}

function FactionDossier({ faction }: { faction: FactionEntry }) {
  return <article className="faction-dossier" id={`entry-${faction.id}`}><header><div><span>ВИДИМАЯ СИЛА / PAR–POL</span><h3>{faction.title}</h3><p>{faction.kicker}</p></div><div className="knowledge-stamp">{KNOWLEDGE_LABELS[faction.state]}</div></header><blockquote>{faction.claim}</blockquote><div className="faction-columns"><section><small>ЧТО ВИДНО</small><p>{faction.summary}</p></section><section><small>РЕСУРСЫ</small><ul>{faction.resources.map((r) => <li key={r}>{r}</li>)}</ul></section><section><small>ПРЕДЛОЖЕНИЕ</small><p>{faction.offer}</p></section><section className="faction-price"><small>ЦЕНА</small><p>{faction.price}</p></section></div><footer><span>ЗОНЫ ПРИСУТСТВИЯ</span>{faction.zones.map((z) => <i key={z}>{z}</i>)}</footer></article>;
}

export function EncyclopediaPage() {
  const [kind, setKind] = useState<PediaKind>("district");
  const [query, setQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState(ZONE_ENTRIES[0].id);
  const [selectedFaction, setSelectedFaction] = useState(FACTION_ENTRIES[0].id);
  const entries = useMemo(() => { const q = query.trim().toLocaleLowerCase("ru"); return PEDIA_ENTRIES.filter((e) => e.kind === kind && (!q || `${e.title} ${e.summary} ${e.tags.join(" ")}`.toLocaleLowerCase("ru").includes(q))); }, [kind, query]);
  const zone = ZONE_ENTRIES.find((item) => item.id === selectedZone) ?? ZONE_ENTRIES[0];
  const faction = FACTION_ENTRIES.find((item) => item.id === selectedFaction) ?? FACTION_ENTRIES[0];
  const select = (id: string) => { if (kind === "district") setSelectedZone(id); else if (kind === "faction") setSelectedFaction(id); requestAnimationFrame(() => document.getElementById(`entry-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })); };

  return <section className="page pedia-page">
    <header className="pedia-hero"><div><div className="eyebrow">Игровая энциклопедия / открытая часть архива</div><h2>Архив<br /><em>ночного Парижа</em></h2></div><p>Не полная истина о городе, а то, с чем персонаж способен действовать: места, репутации, слухи и сведения, добытые во время хроники.</p></header>
    <div className="pedia-access-note"><span>ПРАВИЛО ДОСТУПА</span><p>Мастерские тайны здесь не хранятся. Запись может быть общедоступной, слухом или открытым в игре фактом — и меняться вместе с положением сил.</p></div>
    <div className="pedia-toolbar"><div className="pedia-kind-tabs" role="tablist" aria-label="Разделы архива">{KINDS.map((item) => <button className={kind === item ? "active" : ""} key={item} onClick={() => { setKind(item); setQuery(""); }}><small>0{KINDS.indexOf(item) + 1}</small>{PEDIA_KIND_LABELS[item]}<i>{item === "district" ? ZONE_ENTRIES.length : item === "faction" ? FACTION_ENTRIES.length : 0}</i></button>)}</div><label className="pedia-search"><span>Поиск в доступном</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="место, ресурс, слух…" /></label></div>
    {kind === "person" ? <PersonSection /> : <><div className="pedia-index">{entries.length ? entries.map((entry) => <button className={(kind === "district" ? selectedZone : selectedFaction) === entry.id ? "selected" : ""} key={entry.id} onClick={() => select(entry.id)}><div><span>{KNOWLEDGE_LABELS[entry.state]}</span><small>{entry.kicker}</small></div><h3>{entry.title}</h3><p>{entry.summary}</p><footer>{entry.tags.map((tag) => <i key={tag}>{tag}</i>)}</footer></button>) : <p className="pedia-no-results">В доступной части архива совпадений нет.</p>}</div>{kind === "district" ? <ZoneDossier zone={zone} /> : <FactionDossier faction={faction} />}</>}
  </section>;
}
