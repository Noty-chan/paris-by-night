const KUMU_URL = "https://kumu.io/SuhoiKaktus/%D0%BD%D0%BE%D1%87%D0%BD%D0%B0%D1%8F-%D1%80%D0%B5%D0%B2%D0%B8%D0%B7%D0%B8%D1%8F#svyazi-sharlotta";

const NOTES = [
  { code: "PERSON", title: "Имя / лицо", text: "Кто здесь действует?", className: "note-person" },
  { code: "PLACE", title: "Место", text: "Где пересекаются интересы?", className: "note-place" },
  { code: "DEBT", title: "Долг / услуга", text: "Что связывает стороны?", className: "note-debt" },
  { code: "TRACE", title: "След / улика", text: "Что можно проверить?", className: "note-trace" },
  { code: "THREAT", title: "Угроза", text: "Что изменит баланс?", className: "note-threat" },
];

export function RelationsPage() {
  return <section className="page relations-page">
    <header className="relations-hero"><div><div className="eyebrow">Доска расследования / связи</div><h2>Нити, которые<br /><em>пока не натянуты</em></h2></div><div><p>Место под карту лиц, групп, долгов, мест и улик. Сейчас на ней нет утверждений о том, кто с кем связан.</p><a href={KUMU_URL} target="_blank" rel="noreferrer">Исходная карта в Kumu ↗</a></div></header>
    <div className="relations-alert"><span>МАКЕТ · НЕ КАНОН</span><p>Шпагат и карточки ниже — только визуальная заглушка. Связи не проставлены и не подразумеваются.</p></div>
    <div className="corkboard" aria-label="Пустая доска отношений">
      <svg className="cork-threads" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path d="M160 128 C300 170 310 230 475 270" /><path d="M830 145 C690 170 650 220 475 270" /><path d="M205 445 C325 400 350 330 475 270" /><path d="M805 435 C660 400 635 330 475 270" /><path d="M475 270 C500 365 510 400 525 500" /></svg>
      <div className="board-center"><span>PAR–04</span><strong>НЕТ<br />СВЯЗЕЙ</strong><small>ДОБАВИТЬ ПОСЛЕ<br />ОБСУЖДЕНИЯ</small></div>
      {NOTES.map((note) => <article className={`board-note ${note.className}`} key={note.code}><span>{note.code}</span><strong>{note.title}</strong><p>{note.text}</p><i>· · ·</i></article>)}
      <span className="board-edge-label">DOSSIER RELATIONNEL / 2004</span>
    </div>
    <div className="relations-legend"><span><i className="legend-red" /> возможная связь</span><span><i className="legend-cream" /> источник / подтверждение</span><span><i className="legend-muted" /> версия или слух</span><p>Когда начнём наполнять доску, цвет нити будет обозначать тип связи, а не степень доверия к персонажу.</p></div>
  </section>;
}
