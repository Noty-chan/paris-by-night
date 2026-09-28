import { useState } from "react";
import { CLAN_PROFILES } from "../data/character";

type FactionGroup = "kindred" | "city" | "hunt";

const GROUPS: { id: FactionGroup; number: string; label: string; subtitle: string }[] = [
  { id: "kindred", number: "01", label: "Сородичи", subtitle: "секты, кланы и власть ночи" },
  { id: "city", number: "02", label: "Люди и город", subtitle: "институты, деньги и знание" },
  { id: "hunt", number: "03", label: "Охота", subtitle: "те, кто ищет чудовищ" },
];

const KINDRED = [
  { title: "Камарилья", tag: "СЕКТА / V5", text: "Сеть доменов и княжеских дворов, для которых Маскарад — основа порядка. В описании современного Парижа для V5 город — старый оплот Камарильи под властью Франсуа Вийона, с жёстким и репрессивным двором.", note: "Это ориентир для позднего периода, не готовый ответ о балансе осени 2004-го. В нашей хронике отдельно решаем, кто держит рычаги и насколько князь контролирует город.", href: "https://renegadegamestudios.com/pdf-vampire-the-masquerade-camarilla/", source: "Camarilla · V5, глава о Париже ↗", tone: "red" },
  { title: "Анархи", tag: "ДВИЖЕНИЕ / V5", text: "Не единая организация, а движение и множество местных союзов. Противостоят старой иерархии, но собственные бароны, правила и долги у них тоже появляются.", note: "Присутствие и устройство парижских групп в 2004-м определяем для этой хроники.", href: "https://renegadegamestudios.com/pdf-vampire-the-masquerade-anarch/", source: "Anarch · официальный каталог V5 ↗", tone: "ochre" },
  { title: "Шабаш", tag: "СЕКТА / V5", text: "Воинственная секта, которая ставит вампирскую природу и войну с древними выше обычных правил Маскарада. Это не синоним любого жестокого или непокорного Сородича.", note: "Канон не требует, чтобы Шабаш владел Парижем или обязательно появился в хронике.", href: "https://renegadegamestudios.com/pdf-vampire-the-masquerade/", source: "Vampire: The Masquerade · V5 ↗", tone: "red" },
  { title: "Вне сект и Аширра", tag: "НЕЗАВИСИМОСТЬ ≠ НЕЙТРАЛИТЕТ", text: "Кланы, семьи и отдельные Сородичи могут держаться вне Камарильи, Анархов и Шабаша. Аширра — отдельная транснациональная секта со своей историей и устройством, а не общее название всех независимых вампиров.", note: "Клан сам по себе не диктует политическую сторону. Личные связи и долги важнее ярлыка.", href: "https://renegadegamestudios.com/pdf-vampire-the-masquerade/", source: "Vampire: The Masquerade · V5 ↗", tone: "ochre" },
];

const CITY = [
  { title: "Городские институты", tag: "ПУБЛИЧНАЯ СТОРОНА", text: "Префектура, полиция, суды, транспорт, больницы, университеты и пресса — не одна фракция. У каждого учреждения свои полномочия, процедуры и человеческие интересы.", note: "Здесь важны конкретные люди, доступ и бумажный след — не единый всевидящий аппарат.", href: "https://www.paris.fr/", source: "Город Париж · официальный сайт ↗", tone: "ochre" },
  { title: "DGSE и государственная аналитика", tag: "ИНСТИТУТ / ФРАНЦИЯ", text: "Французская внешняя разведка — реальная государственная служба, а не готовая организация охотников на вампиров. V5 описывает позднюю эпоху, когда часть государственных структур участвует в охоте на Сородичей; без нашей оговорки это нельзя переносить на французскую службу осенью 2004-го.", note: "В хронике ведомства могут осложнять жизнь наблюдением и расследованиями, не будучи сверхъестественно всесильными.", href: "https://www.dgse.gouv.fr/", source: "DGSE · официальный сайт ↗", tone: "red" },
  { title: "Арканум", tag: "ОБЩЕСТВО ИССЛЕДОВАТЕЛЕЙ", text: "Тайное общество исследователей сверхъестественного из прежних редакций World of Darkness. Его основная сила — архивы, наблюдения и осторожный обмен знаниями; отдельные участники могут перейти к охоте, но это не делает всех арканистов боевым орденом.", note: "Наличие парижского Дома Собраний и его состав — пока открытый вопрос нашей хроники, а не установленный факт V5.", href: "https://whitewolf.fandom.com/wiki/Arcanum_(WOD)", source: "Арканум · справка по прежним редакциям ↗", tone: "ochre" },
];

const HUNT = [
  { title: "Общество Святого Леопольда", tag: "ЦЕРКОВНАЯ СЕТЬ / V5", text: "Старая и тщательно скрытая организация охотников, связанная с католической церковью. В современном V5 каноне она оказывается среди сил, противостоящих Сородичам, но действует через людей, веру, расследования и подготовку — не как единая армия на каждом углу.", note: "Для 2004 года берём существование организации как основу; конкретные местные ячейки и их ресурсы задаём отдельно.", href: "https://d1vzi28wh99zvq.cloudfront.net/pdf_previews/298799-sample.pdf", source: "Camarilla · V5, Society of St. Leopold ↗", tone: "red" },
  { title: "Орден Святой Жанны", tag: "НАСЛЕДИЕ ПРЕЖНИХ РЕДАКЦИЙ", text: "В старом лоре — подразделение Общества Святого Леопольда, а не автоматически самостоятельная третья церковь или отдельная армия. Это название можно использовать как особую линию внутри организации, если оно подходит нашей версии.", note: "Точный статус и присутствие в Париже 2004 года не установлены каноном V5.", href: "https://whitewolf.fandom.com/wiki/Order_of_St._Joan", source: "Order of St. Joan · справка по прежним редакциям ↗", tone: "ochre" },
  { title: "Охотники-одиночки и ячейки", tag: "ЛЮДИ, НЕ МАШИНА", text: "Самостоятельные охотники и маленькие группы могут действовать без общего штаба: заметить повторяющуюся аномалию, найти свидетеля, испортить укрытие или дождаться ошибки Сородича.", note: "У них нет гарантированного знания о вампирах. Опасность растёт из подготовки, точности и накопленных улик.", href: "https://renegadegamestudios.com/vampire-the-masquerade-5th-edition-roleplaying-game-bundle/", source: "V5 · официальные материалы игры ↗", tone: "red" },
  { title: "Вторая инквизиция", tag: "ПОЗДНИЙ МЕТАПЛОТ V5", text: "Название для более поздней эпохи V5: взаимосвязанных государственных и церковных сил, которые охотятся на вампиров. В хронике, начавшейся осенью 2004 года, это не готовая действующая над Парижем структура.", note: "Можно показывать отдельные человеческие предвестники; не следует заранее выдавать их за уже сложившийся аппарат.", href: "https://renegadegamestudios.com/pdf-vampire-the-masquerade/", source: "Vampire: The Masquerade · V5 ↗", tone: "muted" },
];

const CARDS: Record<FactionGroup, typeof KINDRED> = { kindred: KINDRED, city: CITY, hunt: HUNT };

export function FactionsPage() {
  const [group, setGroup] = useState<FactionGroup>("kindred");
  const active = GROUPS.find((item) => item.id === group)!;

  return <section className="page factions-page">
    <header className="factions-hero"><div><div className="eyebrow">Силы города / канон и хроника</div><h2>Кто держит<br /><em>эту ночь</em></h2></div><p>Три слоя влияния. Канон V5 задаёт опорные точки; присутствие конкретных организаций и их сила в Париже 2004 года — отдельное решение хроники.</p></header>
    <div className="faction-time-note"><span>ПАРИЖ · ОСЕНЬ 2004</span><p>Позднейшие события V5 здесь отмечены как позднейшие. Пустое место — не тайна, которую мы уже решили за мастера.</p></div>
    <nav className="faction-category-tabs" aria-label="Категории фракций">{GROUPS.map((item) => <button key={item.id} type="button" className={group === item.id ? "active" : ""} onClick={() => setGroup(item.id)}><small>{item.number}</small><span><b>{item.label}</b><i>{item.subtitle}</i></span><em>{CARDS[item.id].length.toString().padStart(2, "0")}</em></button>)}</nav>
    <div className="faction-group-head"><span>{active.number} / DOSSIER</span><h3>{active.label}</h3><p>{active.subtitle}</p></div>
    <div className="faction-card-grid">{CARDS[group].map((card, index) => <article className={`faction-card ${card.tone}`} key={card.title}><header><small>{String(index + 1).padStart(2, "0")} · {card.tag}</small><i>{group === "hunt" ? "VIGIL" : group === "kindred" ? "NOCTURNE" : "CIVITAS"}</i></header><h4>{card.title}</h4><p>{card.text}</p><blockquote>{card.note}</blockquote><a href={card.href} target="_blank" rel="noreferrer">{card.source}</a></article>)}</div>

    {group === "kindred" && <details className="faction-clans"><summary><span>КЛАНЫ / ОСНОВНАЯ КНИГА</span><strong>Кровная линия — ещё не политический выбор</strong><i>РАСКРЫТЬ +</i></summary><div>{CLAN_PROFILES.map((clan, index) => <article key={clan.name}><small>{String(index + 1).padStart(2, "0")} / секта выбирается отдельно</small><h4><a href={clan.referenceUrl}>{clan.name} →</a></h4><p>{clan.epithet}</p><span>{clan.disciplines.length ? clan.disciplines.join(" · ") : "без клановых Дисциплин"}</span></article>)}</div><p>Другие кланы дополнений остаются возможными в хронике, но их полный каталог не проверен по предоставленным книгам.</p></details>}

    <footer className="faction-sources"><span>ИСТОЧНИКИ И ГРАНИЦЫ КАНОНА</span><a href="https://renegadegamestudios.com/pdf-vampire-the-masquerade/" target="_blank" rel="noreferrer">Vampire: The Masquerade V5 ↗</a><a href="https://d1vzi28wh99zvq.cloudfront.net/pdf_previews/380057-sample.pdf" target="_blank" rel="noreferrer">Paris by Night · авторское дополнение, более поздний метаплот ↗</a><small>Paris by Night — материал Storytellers Vault; используем как дополнительное чтение, не как замену базовому канону и не как хронику 2004 года.</small></footer>
  </section>;
}
