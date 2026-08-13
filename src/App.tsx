import { useEffect, useMemo, useRef, useState } from "react";
import { Character, defaultCharacter, migrateCharacter } from "./data/character";
import { CharacterSheet } from "./components/CharacterSheet";
import { CreationPage, DisciplinesPage, RulesPage, SocietyPage, StatsPage } from "./components/ReferencePages";
import { importWod5Pdf } from "./lib/wod5PdfImport";

type Tab = "home" | "city" | "rules" | "stats" | "disciplines" | "creation" | "society" | "sheet" | "dice" | "templates";
type Die = { value: number; hunger: boolean };

const NAV: { id: Tab; label: string; index: string }[] = [
  { id: "home", label: "Сводка", index: "00" },
  { id: "city", label: "Город", index: "01" },
  { id: "rules", label: "Правила", index: "02" },
  { id: "stats", label: "Параметры", index: "03" },
  { id: "disciplines", label: "Дисциплины", index: "04" },
  { id: "creation", label: "Создание", index: "05" },
  { id: "society", label: "Общество", index: "06" },
  { id: "sheet", label: "Лист", index: "07" },
  { id: "dice", label: "Броски", index: "08" },
  { id: "templates", label: "Шаблоны", index: "09" },
];

const CITY_PHOTOS = [
  { src: "./paris/bir-hakeim-2004.jpg", alt: "Мост Бир-Хакейм и высотки Фрон-де-Сен ночью", label: "Bir-Hakeim / 2004", note: "Мосты связывают берега. И делят владения.", href: "https://commons.wikimedia.org/wiki/File:Paris_Pont_de_Bir-Hakeim_and_Front-de-Seine_at_night_2004.jpg", credit: "Jgremillot · GFDL" },
  { src: "./paris/rue-reaumur-2004.jpg", alt: "Пустая улица Реомюр в Париже ночью", label: "Rue Réaumur / 03:41", note: "После трёх часов город принадлежит тем, кому некуда возвращаться.", href: "https://commons.wikimedia.org/wiki/File:Rue_R%C3%A9aumur,_Paris_12_May_2004_N2.jpg", credit: "edwin.11 · CC BY 2.0" },
  { src: "./paris/saint-lazare-entrance-2004.jpg", alt: "Вход на станцию метро Сен-Лазар в 2004 году", label: "Saint-Lazare / 01.2004", note: "Узел, где пассажир становится следом.", href: "https://commons.wikimedia.org/wiki/File:1513102_69801149d0_o_Paris_M%C3%A9tro_de_Paris_entree_station.jpg", credit: "rucativava · CC BY-SA 2.0" },
  { src: "./paris/saint-lazare-platform-2004.jpg", alt: "Платформа линии 14 на станции Сен-Лазар в 2004 году", label: "Ligne 14 / 10.2004", note: "Новейшая линия уже прячет платформы за стеклом.", href: "https://commons.wikimedia.org/wiki/File:Paris_Metro_St_Lazare.jpg", credit: "FloSch · CC BY-SA 3.0 / GFDL" },
  { src: "./paris/peripherique-2004.jpg", alt: "Автомобили и смог над автомагистралью A6a у Парижа", label: "A6a / 10.2004", note: "Кольцо кажется границей. Город давно перерос её.", href: "https://commons.wikimedia.org/wiki/File:Pollution_paris.jpg", credit: "Céréales Killer · CC BY-SA 3.0" },
  { src: "./paris/cafe-deux-moulins-2004.jpg", alt: "Кафе Deux Moulins на Монмартре в 2004 году", label: "Montmartre / 2004", note: "Кафе, в котором все знают соседа — и никто не знает всего.", href: "https://commons.wikimedia.org/wiki/File:Paris_-_Caf%C3%A9_des_2_Moulins_-_2004.jpg", credit: "France74 · CC BY-SA 3.0" },
  { src: "./paris/montmartre-street-2004.jpg", alt: "Улица на Монмартре в 2004 году", label: "Montmartre / rue", note: "Узкие улицы оставляют мало места для лишнего свидетеля.", href: "https://commons.wikimedia.org/wiki/File:Montmartre_street.jpg", credit: "Julie Kertesz · CC BY 2.0" },
  { src: "./paris/paris-plages-2004.jpg", alt: "Парижский пляж на набережной в 2004 году", label: "Paris Plages / 2004", note: "Летняя толпа — хорошее прикрытие и плохой контроль.", href: "https://commons.wikimedia.org/wiki/File:Paris_Plages_2004_1.jpg", credit: "Thor19 · CC BY-SA 3.0" },
  { src: "./paris/porte-saint-martin-2004.jpg", alt: "Порта Сен-Мартен в Париже в мае 2004 года", label: "Porte Saint-Martin", note: "Арка пережила режимы. Район переживёт ещё один.", href: "https://commons.wikimedia.org/wiki/File:Porte_Saint-Martin,_Paris_May_2004.jpg", credit: "edwin.11 · CC BY 2.0" },
  { src: "./paris/louvre-cour-2004.jpg", alt: "Двор Наполеона у Лувра в 2004 году", label: "Louvre / cour", note: "Самое людное место может оказаться самым безличным.", href: "https://commons.wikimedia.org/wiki/File:Cour_Napol%C3%A9on_from_the_northwest_(300158730).jpg", credit: "edwin.11 · CC BY 2.0" },
];

const TEMPLATES = [
  { code: "PERS", title: "Персонаж", text: "Имя, роль в городе, желание, страх, рычаг давления и три версии правды." },
  { code: "FACT", title: "Фракция", text: "Публичная цель, настоящий интерес, ресурсы, раскол внутри и отношения с соседями." },
  { code: "LOCI", title: "Место", text: "Впечатление, хозяин, правило территории, опасность и деталь, которую запомнят." },
  { code: "RUMR", title: "Слух", text: "Кто рассказал, кому выгодно, что в нём правда и что изменится, если поверить." },
];

function loadCharacter(): Character {
  try {
    const saved = localStorage.getItem("paris-character");
    return saved ? migrateCharacter(JSON.parse(saved)) : defaultCharacter;
  } catch {
    return defaultCharacter;
  }
}

function DiceGlyph({ kind }: { kind: "failure" | "success" | "critical" | "beast" }) {
  if (kind === "failure") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="m18 18-7-7m19 7 7-7M18 30l-7 7m19-7 7 7" /><path d="M15 24h-5m28 0h-5" /></svg>;
  if (kind === "success") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="m24 8 16 16-16 16L8 24Z" /><circle cx="24" cy="24" r="4" /></svg>;
  if (kind === "critical") return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="m17 7 12 17-12 17L5 24Z" /><path d="m31 7 12 17-12 17-12-17Z" /></svg>;
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M11 12c4 3 7 7 8 12l-6 13M24 9c2 5 2 10 0 15l-1 15M37 12c-4 3-7 7-8 12l6 13" /><path d="m9 34 4 3 5-1m21-2-4 3-5-1" /></svg>;
}

function DiceFace({ die }: { die: Die }) {
  const kind = die.hunger && die.value === 1 ? "beast" : die.value === 10 ? "critical" : die.value >= 6 ? "success" : "failure";
  const label = kind === "beast" ? "Знак Зверя" : kind === "critical" ? "Крит" : kind === "success" ? "Успех" : "Провал";
  return <div className={`die ${die.hunger ? "hunger" : "regular"} ${kind}`} role="img" aria-label={`${die.hunger ? "Кость Голода" : "Обычная кость"}: ${label}, выпало ${die.value}`} title={`${label} · ${die.value}`}><DiceGlyph kind={kind} /><small>{label}</small></div>;
}

function interpretDice(dice: Die[], difficulty: number) {
  if (!dice.length) return { title: "Пул готов", text: "Укажи кости и соверши бросок.", success: false };
  const successes = dice.filter((d) => d.value >= 6).length;
  const tens = dice.filter((d) => d.value === 10);
  const critPairs = Math.floor(tens.length / 2);
  const total = successes + critPairs * 2;
  const messy = critPairs > 0 && tens.some((d) => d.hunger);
  const bestial = total < difficulty && dice.some((d) => d.hunger && d.value === 1);
  if (messy) return { title: `Грязный крит · ${total} успехов`, text: "Ты добиваешься своего, но Зверь оставляет след.", success: true };
  if (bestial) return { title: `Звериный провал · ${total} успехов`, text: "Неудача пробуждает Компульсию или иное проявление Зверя.", success: false };
  if (critPairs) return { title: `Критический успех · ${total} успехов`, text: "Пара десяток добавила два дополнительных успеха.", success: true };
  if (total >= difficulty) return { title: `Успех · ${total} против ${difficulty}`, text: "Действие удалось.", success: true };
  return { title: `Провал · ${total} против ${difficulty}`, text: "Цель не достигнута — ситуация меняется.", success: false };
}

export function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [character, setCharacter] = useState<Character>(loadCharacter);
  const [saved, setSaved] = useState(true);
  const [pool, setPool] = useState(6);
  const [hunger, setHunger] = useState(1);
  const [difficulty, setDifficulty] = useState(2);
  const [dice, setDice] = useState<Die[]>([]);
  const [rollSource, setRollSource] = useState("");
  const [rouseResult, setRouseResult] = useState<number | null>(null);
  const [rouseApplied, setRouseApplied] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const wod5PdfImportRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(() => {
      localStorage.setItem("paris-character", JSON.stringify({ ...character, updatedAt: new Date().toISOString() }));
      setSaved(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [character]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [tab]);

  const result = useMemo(() => interpretDice(dice, difficulty), [dice, difficulty]);

  const roll = () => {
    const hungerCount = Math.min(hunger, pool);
    setDice(Array.from({ length: pool }, (_, i) => ({ value: Math.floor(Math.random() * 10) + 1, hunger: i >= pool - hungerCount })));
  };

  const prepareRoll = (source: string, preparedPool: number, preparedHunger: number) => {
    setRollSource(source);
    setPool(preparedPool);
    setHunger(Math.min(preparedHunger, preparedPool));
    setDice([]);
    setTab("dice");
  };

  const rollRouse = () => {
    setRouseResult(Math.floor(Math.random() * 10) + 1);
    setRouseApplied(false);
  };

  const applyRouseHunger = () => {
    if (rouseApplied || rouseResult === null || rouseResult >= 6 || character.hunger >= 5) return;
    const nextHunger = Math.min(5, character.hunger + 1);
    setCharacter((current) => ({ ...current, hunger: nextHunger }));
    setHunger((current) => Math.min(pool, Math.max(current, nextHunger)));
    setRouseApplied(true);
  };

  const exportSheet = () => {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${character.name || "character"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSheet = async (file?: File) => {
    if (!file) return;
    try { setCharacter(migrateCharacter(JSON.parse(await file.text()))); }
    catch { window.alert("Не удалось прочитать лист. Нужен JSON, экспортированный с этого сайта."); }
  };

  const importWod5Sheet = async (file?: File) => {
    if (!file) return;
    try {
      const result = await importWod5Pdf(file);
      setCharacter((current) => migrateCharacter({ ...current, ...result.patch }));
      window.alert(`Импортировано: ${result.imported.join(", ") || "совместимые данные"}.\n\n${result.warning}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Не удалось прочитать PDF WOD5.");
    }
  };

  return (
    <div className="app-shell">
      <div className="noise" />
      <header className="topbar">
        <button className="brand" onClick={() => setTab("home")}>
          <span className="brand-mark">P//N</span>
          <span><strong>PARIS // NUIT</strong><small>chronicle utility · v5</small></span>
        </button>
        <div className="connection"><i /> réseau privé <span>17.10.2004 · 00:42</span></div>
      </header>

      <aside className="sidebar">
        <nav aria-label="Основная навигация">
          {NAV.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}><small>{item.index}</small>{item.label}</button>)}
        </nav>
        <div className="side-note"><span>архив</span><strong>PAR–04</strong><p>Неофициальный помощник хроники. Доступ зарегистрирован.</p></div>
      </aside>

      <main ref={mainRef}>
        {tab === "home" && (
          <section className="page home-page">
            <div className="eyebrow">Сводка ночи / dossier 001</div>
            <div className="hero-grid">
              <div>
                <h1>Париж никогда<br /><em>не спит.</em></h1>
                <p className="lead">Он просто закрывает глаза, чтобы не видеть, кто проходит по его улицам после полуночи.</p>
                <div className="hero-actions"><button className="primary" onClick={() => setTab("sheet")}>Открыть досье</button><button className="secondary" onClick={() => setTab("dice")}>Бросить кости</button></div>
              </div>
              <div className="metro-card">
                <div className="metro-top"><span>RÉSEAU NOCTURNE</span><small>ligne privée</small></div>
                <div className="route"><i /><b /><i /><b /><i className="alert" /></div>
                <div className="stations"><span>ÉLYSÉE</span><span>RIVE DROITE</span><span>INCONNU</span></div>
                <div className="stamp">ACCÈS<br />RESTREINT</div>
              </div>
            </div>
            <div className="summary-grid">
              <article><span className="card-code">DOSSIER ACTIF</span><strong>{character.name}</strong><p>{character.clan} · {character.concept}</p><button onClick={() => setTab("sheet")}>Продолжить заполнение →</button></article>
              <article><span className="card-code">СОСТОЯНИЕ</span><strong>Голод {character.hunger}</strong><p>Человечность {character.humanity} · Могущество крови {character.bloodPotency}</p><button onClick={() => setTab("dice")}>Перейти к броскам →</button></article>
              <article className="signal"><span className="card-code">ВХОДЯЩИЙ СИГНАЛ</span><strong>ПОМЕХИ // НЕТ ДАННЫХ</strong><p>▒▒▒▒▒ ░░▒▒ 01001110 // сигнал не распознан</p><small>канал занят · повторить позже</small></article>
            </div>
            <button className="city-teaser" onClick={() => setTab("city")}><span>01 / ДОСЬЕ ГОРОДА</span><strong>2 161 932 живых. Около 120 признанных мёртвых.</strong><i>Войти в Париж →</i></button>
          </section>
        )}

        {tab === "city" && (
          <section className="page city-page">
            <div className="city-head">
              <div><div className="eyebrow">Полевое досье / Paris, 2004</div><h2>Город между<br /><em>двумя ударами сердца</em></h2></div>
              <p>Париж не сводится к открыткам и бульварам. Двадцать округов живут по разным правилам; за ними — коммуны, государственные службы, частный капитал и старые права, о которых предпочитают не говорить вслух.</p>
            </div>

            <div className="city-numbers" aria-label="Население Парижа и домена">
              <article><small>в черте города</small><strong>2 161 932</strong><span>человека</span></article>
              <article><small>агломерация</small><strong>≈ 10 млн</strong><span>человек</span></article>
              <article className="kindred-number"><small>реестр домена</small><strong>≈ 120</strong><span>признанных Сородичей</span></article>
              <p>Несколько десятков могут существовать вне реестра: гости, беглецы, тонкокровные и незаконные потомки. Точного числа не знает даже двор.</p>
            </div>

            <div className="city-copy city-copy--split">
              <div><span className="chapter-no">01</span><h3>Три слоя города</h3></div>
              <div><p><b>Париж внутри périphérique</b> — престижное ядро: двадцать округов, двор, Элизиумы и старые владения. Но его два миллиона жителей — только часть организма.</p><p><b>Агломерация и Иль-де-Франс</b> — ещё десять миллионов людей, аэропорты, больницы, университеты, склады и места, где можно исчезнуть. Вампирская граница не обязана совпадать с муниципальной.</p></div>
            </div>

            <div className="photo-collage" aria-label="Париж 2004 года в фотографиях">
              {CITY_PHOTOS.map((photo) => <figure key={photo.src}><img src={photo.src} alt={photo.alt} loading="lazy" /><figcaption><strong>{photo.label}</strong><span>{photo.note}</span><a href={photo.href} target="_blank" rel="noreferrer">{photo.credit} ↗</a></figcaption></figure>)}
              <div className="collage-stamp">PARIS<br />OCT. 2004</div>
            </div>

            <div className="city-copy city-copy--split">
              <div><span className="chapter-no">02</span><h3>Ночь меняет расстояния</h3></div>
              <div><p>После полуночи сеть редеет. Метро и RER перестают быть надёжной связью, а Noctilien появится только в 2005 году. Машина, водитель, ночной автобус и безопасный маршрут — не удобства, а необходимость.</p><p>Днём толпа скрывает хищника. Ночью повторяющийся почерк замечают больницы, полиция, камеры и газеты. Париж даёт много добычи, но почти не прощает привычек.</p><a className="source-link" href="https://www.apur.org/fr/economie-emploi/commerce/paris-nuit-etude-exploratoire" target="_blank" rel="noreferrer">APUR · исследование «Paris la nuit», 2004 ↗</a></div>
            </div>

            <section className="technology-card">
              <div className="technology-title"><span>03 / TERMINAL</span><h3>Техника нулевых</h3><p>Информация уже цифровая. Но она ещё не мгновенная.</p></div>
              <div className="technology-grid">
                <article><small>GSM / 101,6%</small><h4>Телефон почти у каждого</h4><p>Звонки, SMS, редкие MMS. В Иль-де-Франсе SIM-карт уже больше, чем жителей, но мобильный оставляет биллинговый след.</p></article>
                <article><small>WEB / 50%</small><h4>Интернет вошёл не ко всем</h4><p>ADSL, домашние компьютеры, форумы, блоги и интернет-кафе. Архивы ещё можно украсть на диске, а человека — отрезать от сети.</p></article>
                <article><small>UMTS / ОЖИДАЕТСЯ</small><h4>3G ещё не наступил</h4><p>На дату досье коммерческий запуск только готовится. Мобильный интернет — это WAP и i-mode, а не постоянное видео из каждого кармана.</p></article>
                <article><small>СЛЕД / ФРАГМЕНТАРНЫЙ</small><h4>Наблюдение требует людей</h4><p>Камеры, банковские операции, проездные и медицинские базы существуют, но плохо соединены. Расследование медленнее — и потому зависит от того, кто имеет доступ.</p></article>
              </div>
              <div className="technology-sources"><a href="https://www.arcep.fr/actualites/actualites-et-communiques/detail/n/huit-millions-de-clients-utilisent-les-services-multimedia-mobile.html" target="_blank" rel="noreferrer">ARCEP · мобильная связь, III квартал 2004 ↗</a><a href="https://en.arcep.fr/news/press-releases/view/n/the-uses-of-information-and-communication-technologies-in-france-2004.html" target="_blank" rel="noreferrer">ARCEP · цифровые технологии во Франции, 2004 ↗</a></div>
            </section>

            <div className="city-manifesto"><span>PARIS // NUIT</span><blockquote>Власть здесь измеряют не площадью домена. Её определяют двери, которые ты способен открыть, и люди, готовые назвать тебя своим.</blockquote><small>неофициальное правило домена</small></div>
          </section>
        )}

        {tab === "rules" && <RulesPage />}

        {tab === "stats" && <StatsPage />}

        {tab === "disciplines" && <DisciplinesPage />}

        {tab === "creation" && <CreationPage onOpenSheet={() => setTab("sheet")} />}

        {tab === "society" && <SocietyPage />}

        {tab === "sheet" && (
          <section className="page">
            <div className="page-head"><div><div className="eyebrow">Личное дело / локальная копия</div><h2>Лист персонажа</h2></div><div className="save-state"><i className={saved ? "ok" : ""} />{saved ? "сохранено локально" : "сохранение…"}</div></div>
            <div className="sheet-toolbar"><button onClick={exportSheet}>Экспорт JSON</button><button onClick={() => importRef.current?.click()}>Импорт JSON</button><button onClick={() => wod5PdfImportRef.current?.click()}>Импорт PDF WOD5</button><a className="external" href="https://wta5.ru/vampire/character-creator" target="_blank" rel="noreferrer">Создать на WOD5 ↗</a><input ref={importRef} type="file" accept="application/json" hidden onChange={(event) => { void importSheet(event.target.files?.[0]); event.target.value = ""; }} /><input ref={wod5PdfImportRef} type="file" accept="application/pdf,.pdf" hidden onChange={(event) => { void importWod5Sheet(event.target.files?.[0]); event.target.value = ""; }} /><button className="danger-link" onClick={() => confirm("Вернуть пустой лист?") && setCharacter(defaultCharacter)}>Сбросить</button></div>
            <CharacterSheet character={character} onChange={setCharacter} onPrepareRoll={prepareRoll} />
          </section>
        )}

        {tab === "dice" && (
          <section className="page dice-page">
            <div className="page-head"><div><div className="eyebrow">Механика V5 / локальный протокол</div><h2>Броски</h2></div><a className="external" href="https://wta5.ru/vampire/rules" target="_blank" rel="noreferrer">Полные правила ↗</a></div>
            <div className="dice-layout">
              <div className="roller panel">
                <span className="panel-label">{rollSource ? `Проверка / ${rollSource}` : "Собрать пул"}</span>
                <div className="number-controls"><label><span>Всего костей</span><input type="number" min="1" max="20" value={pool} onChange={(e) => setPool(Math.max(1, Math.min(20, +e.target.value)))} /></label><label><span>Голод</span><input type="number" min="0" max="5" value={hunger} onChange={(e) => setHunger(Math.max(0, Math.min(5, +e.target.value)))} /></label><label><span>Сложность</span><input type="number" min="1" max="10" value={difficulty} onChange={(e) => setDifficulty(Math.max(1, Math.min(10, +e.target.value)))} /></label></div>
                <button className="roll-button" onClick={roll}><span>БРОСИТЬ</span><small>{pool - Math.min(pool, hunger)} обычных + {Math.min(pool, hunger)} голодных</small></button>
                <div className="dice-tray">{dice.length ? dice.map((die, i) => <DiceFace die={die} key={`${i}-${die.value}`} />) : <p>Результат появится здесь</p>}</div>
                <div className={`result ${result.success ? "success" : ""}`}><small>Результат</small><strong>{result.title}</strong><p>{result.text}</p></div>
              </div>
              <aside className="quick-rules panel">
                <span className="panel-label">Быстрые действия</span>
                <div className={`rouse-check ${rouseResult !== null && rouseResult < 6 ? "failed" : ""}`}>
                  <div><small>Проверка пробуждения</small><strong>{rouseResult ?? "d10"}</strong></div>
                  {rouseResult === null && <p>6–10 — успех. 1–5 — Голод повышается на один.</p>}
                  {rouseResult !== null && <p>{rouseResult >= 6 ? "Кровь откликается. Голод не меняется." : character.hunger >= 5 ? "Провал. Голод уже предельный." : "Провал. Голод может увеличиться."}</p>}
                  <button type="button" onClick={rollRouse}>Бросить одну кость</button>
                  {rouseResult !== null && rouseResult < 6 && character.hunger < 5 && <button type="button" className="apply-hunger" disabled={rouseApplied} onClick={applyRouseHunger}>{rouseApplied ? "Голод применён" : `Применить: Голод ${character.hunger} → ${character.hunger + 1}`}</button>}
                </div>
                <h3>Читаем кости</h3><dl className="dice-key"><div><dt><span className="key-glyph failure"><DiceGlyph kind="failure" /></span>Провал</dt><dd>1–5 не дают успехов</dd></div><div><dt><span className="key-glyph success"><DiceGlyph kind="success" /></span>Успех</dt><dd>6–9 дают один успех</dd></div><div><dt><span className="key-glyph critical"><DiceGlyph kind="critical" /></span>Крит</dt><dd>каждая пара десяток считается четырьмя успехами</dd></div><div><dt><span className="key-glyph beast"><DiceGlyph kind="beast" /></span>Зверь</dt><dd>только красная 1 и только при общем провале</dd></div></dl><div className="rule-note">Красная критическая грань делает крит грязным, только если её десятка вошла в критическую пару. Кости Голода заменяют обычные кости, но не добавляются к пулу.</div><a href="https://wta5.ru/vampire/rules/dice-system" target="_blank" rel="noreferrer">Подробнее о проверках ↗</a>
              </aside>
            </div>
          </section>
        )}

        {tab === "templates" && (
          <section className="page templates-page">
            <div className="page-head"><div><div className="eyebrow">Заготовки хроники / черновой архив</div><h2>Шаблоны</h2></div><span className="muted">4 формуляра</span></div>
            <p className="intro">Короткие структуры, из которых мы позже соберём живой Париж. Они удерживают важное и не заставляют заполнять энциклопедию.</p>
            <div className="template-grid">{TEMPLATES.map((item, i) => <article key={item.code}><div><span>{item.code}–0{i + 1}</span><small>formulaire</small></div><h3>{item.title}</h3><p>{item.text}</p><button onClick={() => navigator.clipboard?.writeText(item.text)}>Копировать основу</button></article>)}</div>
            <div className="incoming"><span>СЛЕДУЮЩИЙ ПАКЕТ</span><p>Домены · Долги · События · Улики</p><small>ожидает наполнения мира</small></div>
          </section>
        )}
      </main>
      <footer>
        <span className="build">PARIS // NUIT · BUILD 0.3</span>
        <a href="https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement" target="_blank" rel="noreferrer"><img src="./dark-pack.webp" alt="Dark Pack" /></a>
        <span className="legal">NOT OFFICIAL WORLD OF DARKNESS MATERIAL · Portions of the materials are the copyrights and trademarks of Paradox Interactive AB, and are used with permission. All rights reserved.</span>
      </footer>
    </div>
  );
}
