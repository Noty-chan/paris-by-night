import { useState } from "react";
import { CLAN_PROFILES } from "../data/character";

const FULL_RULES = "https://wta5.ru/vampire/rules";
const CREATION_RULES = "https://wta5.ru/vampire/character-creation";

const QUICK_RULES = [
  { code: "POOL", title: "Собери пул", text: "Обычно Атрибут + Навык. Рассказчик назначает сложность или противник бросает встречный пул." },
  { code: "6+", title: "Посчитай успехи", text: "Каждая кость с результатом 6–9 даёт один успех. Если успехов не меньше сложности — действие удалось." },
  { code: "10×2", title: "Критическая пара", text: "Две десятки считаются четырьмя успехами. Непарная десятка остаётся одним обычным успехом." },
  { code: "WP", title: "Потрать Волю", text: "Можно перебросить до трёх обычных костей. Кости Голода перебрасывать Волей нельзя." },
  { code: "H", title: "Замени кости Голодом", text: "Число красных костей равно Голоду, но они заменяют обычные и не увеличивают размер пула." },
  { code: "R", title: "Проверь пробуждение", text: "Брось одну d10: 6–10 — Голод не меняется; 1–5 — Голод повышается на один." },
];

const COMMON_POOLS = [
  ["Заметить опасность", "Смекалка + Бдительность"],
  ["Инициатива при необходимости", "Самообладание + Бдительность"],
  ["Ударить без оружия", "Сила + Драка"],
  ["Оружие ближнего боя", "Сила + Фехтование"],
  ["Выстрелить", "Ловкость + Стрельба"],
  ["Скрыться", "Ловкость + Скрытность"],
  ["Убедить искренне", "Харизма + Убеждение"],
  ["Солгать или продавить", "Манипулирование + Хитрость"],
  ["Понять мотив", "Смекалка + Проницательность"],
  ["Исследовать улику", "Интеллект + Расследование"],
];

const CREATION_STEPS = [
  ["01", "Концепция", "Сформулируй персонажа одним предложением: кем он был, чего хочет сейчас и что делает его опасным."],
  ["02", "Клан", "Выбери наследие крови. Оно даёт три клановые Дисциплины, проклятие и принуждение, но не диктует характер."],
  ["03", "Атрибуты", "Все начинают с 1. Итоговая схема: один атрибут 4, три — 3, четыре — 2 и один остаётся 1."],
  ["04", "Навыки", "Выбери специалиста, сбалансированную схему или мастера на все руки. Не смешивай схемы случайно."],
  ["05", "Тип хищника", "Реши, как персонаж обычно охотится. Это источник сцен, связей и проблем, а не только пакет бонусов."],
  ["06", "Дисциплины", "Распредели 2 точки в одну клановую Дисциплину и 1 в другую. Тип хищника обычно добавит ещё одну."],
  ["07", "Преимущества", "Возьми 7 точек преимуществ и минимум 2 точки недостатков, не считая добавок типа хищника."],
  ["08", "Человечность", "Старт обычно 7. Запиши 1–3 убеждения и свяжи их с живыми смертными Опорами."],
  ["09", "Производные", "Здоровье = Выносливость + 3. Воля = Самообладание + Упорство."],
  ["10", "Связи", "Поставь на карту сира, Опоры, союзников, врагов, владельца домена и хотя бы один долг."],
];

const PREDATORS = [
  ["Уличный кот", "силой отнимает кровь"], ["Сирена", "охотится через желание"], ["Песочный человек", "пьёт у спящих"],
  ["Мешочник", "добывает медицинскую кровь"], ["Фермер", "питается животными"], ["Гробокопатель", "ищет больных и недавно умерших"],
  ["Мясник", "держит близких как постоянный источник"], ["Консенсуалист", "просит согласия"], ["Королева сцены", "владеет своей субкультурой"],
  ["Кровосос", "охотится на Сородичей"], ["Осирис", "кормится от последователей"],
];

const SECTS = [
  { code: "IVORY", name: "Камарилья", tag: "Башня", text: "Элитарная секта, считающая Маскарад условием выживания. Домен обычно устроен как феодальный двор: Князь, Примоген, Шериф, Гарпии, Элизиум и система долгов.", rule: "Безопасность через иерархию. Свобода предоставляется тем, кто уже доказал полезность." },
  { code: "MOVEMENT", name: "Анархи", tag: "Движение", text: "Не единое государство, а множество баронств, коммун и личных союзов. Отвергают власть старейшин, но далеко не всегда отказываются от собственных иерархий.", rule: "Свобода имеет цену: территорию и уважение приходится защищать лично." },
  { code: "SWORD", name: "Шабаш", tag: "Меч Каина", text: "Апокалиптическая военная секта, ставящая вампирскую природу выше человечности. В стандартной V5 чаще выступает угрозой, чем домом персонажей игроков.", rule: "Война с древними важнее Маскарада, личной жизни и чужих потерь." },
  { code: "OUTSIDE", name: "Независимые", tag: "Вне башен", text: "Кланы, семьи и одиночки, которые торгуют со всеми, избегают общей власти или строят собственные структуры. Независимость не означает отсутствие обязательств.", rule: "Нет общей защиты — зато меньше чужих законов." },
];

export function RulesPage() {
  return (
    <section className="page reference-page rules-page">
      <div className="reference-hero"><div><div className="eyebrow">Настольный протокол / V5</div><h2>Правила,<br /><em>которые понадобятся</em></h2></div><p>Не замена книге, а экран ведущего для обычной сцены: собрать пул, прочитать Голод, пережить конфликт и понять цену решения.</p></div>
      <div className="quick-rule-grid">{QUICK_RULES.map((rule) => <article key={rule.code}><span>{rule.code}</span><h3>{rule.title}</h3><p>{rule.text}</p></article>)}</div>

      <div className="reference-split">
        <section className="reference-panel"><div className="panel-heading"><span>01</span><h3>Чтение броска</h3></div><dl className="rule-lines"><div><dt>Обычный успех</dt><dd>6–9 на d10</dd></div><div><dt>Крит</dt><dd>пара десяток = 4 успеха</dd></div><div><dt>Грязный крит</dt><dd>критическая пара включает 10 на кости Голода</dd></div><div><dt>Звериный провал</dt><dd>провал броска и 1 на кости Голода</dd></div><div><dt>Сложность</dt><dd>сколько успехов требуется</dd></div></dl></section>
        <section className="reference-panel hunger-reference"><div className="panel-heading"><span>02</span><h3>Голод</h3></div><p>Голод идёт от 0 до 5. Ноль обычно достигается только ценой смерти жертвы. При Голоде 5 намеренно рисковать новой проверкой пробуждения уже нельзя.</p><div className="hunger-scale">{[0,1,2,3,4,5].map((n) => <i key={n} className={n > 0 ? "filled" : ""}>{n}</i>)}</div><small>Красные кости не добавляются к пулу — они заменяют обычные.</small></section>
      </div>

      <section className="pool-table"><div className="panel-heading"><span>03</span><h3>Частые пулы</h3><small>Рассказчик может менять сочетание по ситуации</small></div>{COMMON_POOLS.map(([task, pool]) => <div key={task}><span>{task}</span><strong>{pool}</strong></div>)}</section>

      <div className="reference-split compact-reference">
        <section className="reference-panel"><div className="panel-heading"><span>04</span><h3>Урон и восстановление</h3></div><p><b>Поверхностный</b> урон вампиры обычно делят пополам с округлением вверх. Он отмечается косой чертой. <b>Тяжёлый</b> отмечается крестом; огонь и солнце особенно опасны.</p><p>Заполненная шкала означает тяжёлое состояние. Лечение вампира обычно требует проверки пробуждения.</p></section>
        <section className="reference-panel"><div className="panel-heading"><span>05</span><h3>Три правила хроники</h3></div><ol><li>Бросаем только когда интересны и успех, и провал.</li><li>Провал меняет ситуацию, а не останавливает историю.</li><li>Нарушение Маскарада создаёт свидетелей, записи и политический долг.</li></ol></section>
      </div>
      <div className="source-ribbon"><span>Нужна редкая ситуация?</span><a href={FULL_RULES} target="_blank" rel="noreferrer">Открыть полный справочник WOD5 ↗</a></div>
    </section>
  );
}

export function CreationPage({ onOpenSheet }: { onOpenSheet: () => void }) {
  return (
    <section className="page reference-page creation-page">
      <div className="reference-hero"><div><div className="eyebrow">Создание персонажа / пошагово</div><h2>Сначала человек.<br /><em>Потом чудовище.</em></h2></div><p>Хороший лист отвечает на три вопроса: чего персонаж хочет, чем он готов за это заплатить и кто пострадает раньше него.</p></div>
      <div className="creation-actions"><button className="primary" onClick={onOpenSheet}>Открыть лист</button><a href={CREATION_RULES} target="_blank" rel="noreferrer">Полное руководство WOD5 ↗</a><span>Автопроверка в листе сверяет стартовые схемы, но позволяет домашние исключения.</span></div>

      <div className="creation-steps">{CREATION_STEPS.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>

      <section className="build-patterns"><div className="panel-heading"><span>DATA</span><h3>Стартовые схемы</h3></div><div className="pattern-grid"><article><small>Атрибуты</small><strong>4 / 3·3 / 4·2 / 1</strong><p>Один выдающийся, три сильных, четыре развитых и одна явная слабость.</p></article><article><small>Навыки · специалист</small><strong>1·4 / 3·3 / 3·2 / 3·1</strong><p>Сильная профессия и заметные пробелы.</p></article><article><small>Навыки · баланс</small><strong>3·3 / 5·2 / 7·1</strong><p>Надёжный универсальный персонаж.</p></article><article><small>Навыки · широкий профиль</small><strong>1·3 / 8·2 / 10·1</strong><p>Почти всегда найдётся подходящий навык.</p></article></div></section>

      <section className="predator-reference"><div className="panel-heading"><span>HUNT</span><h3>Как ты добываешь кровь?</h3><small>Тип хищника — обещание будущих сцен</small></div><div>{PREDATORS.map(([name, description]) => <article key={name}><strong>{name}</strong><span>{description}</span></article>)}</div></section>

      <div className="creation-final"><span>Перед первой ночью</span><ul><li>Согласуй личную цель, врага и причину держаться рядом с остальными героями.</li><li>Свяжи каждое Убеждение с конкретной живой Опорой.</li><li>Назови одну вещь, которую персонаж никогда не отдаст добровольно.</li><li>Реши, кто уже имеет на него право или компромат.</li></ul></div>
    </section>
  );
}

export function SocietyPage() {
  const [filter, setFilter] = useState("Все");
  const visibleClans = filter === "Все" ? CLAN_PROFILES : CLAN_PROFILES.filter((clan) => clan.usualSect.includes(filter));
  return (
    <section className="page reference-page society-page">
      <div className="reference-hero"><div><div className="eyebrow">Ночное общество / каноническая основа</div><h2>Кровь — наследство.<br /><em>Секта — выбор.</em></h2></div><p>Мы используем V5 как язык правил, но играем в 2004 году. Поэтому дальнейшие события метаплота и положение каждого клана в Париже утверждаем отдельно.</p></div>
      <div className="timeline-warning"><span>PARIS // 2004</span><p>Ни одна подпись «обычная секта» не является приказом персонажу. Это точка отсчёта, которую местная политика может полностью перевернуть.</p></div>

      <div className="sect-grid">{SECTS.map((sect) => <article key={sect.code}><div><small>{sect.code}</small><span>{sect.tag}</span></div><h3>{sect.name}</h3><p>{sect.text}</p><blockquote>{sect.rule}</blockquote></article>)}</div>

      <section className="court-reference"><div className="panel-heading"><span>COURT</span><h3>Кто есть кто при дворе</h3></div><div><article><strong>Князь</strong><span>объявляет законы и признаёт право на домен</span></article><article><strong>Сенешаль</strong><span>управляет двором и заменяет Князя</span></article><article><strong>Примоген</strong><span>представляет клан или политический блок</span></article><article><strong>Шериф</strong><span>расследует нарушения и приводит приговоры в исполнение</span></article><article><strong>Гарпия</strong><span>ведёт репутацию, долги и общественную цену поступков</span></article><article><strong>Хранитель Элизиума</strong><span>обеспечивает нейтральность места встреч</span></article></div></section>

      <section className="clan-catalogue"><div className="clan-catalogue-head"><div><span>CLANS / 16</span><h3>Кланы и бесклановые</h3></div><div className="clan-filters">{["Все", "Камарилья", "Анархи", "Независимые", "Шабаш"].map((name) => <button type="button" className={filter === name ? "active" : ""} onClick={() => setFilter(name)} key={name}>{name}</button>)}</div></div><div className="clan-grid">{visibleClans.map((clan, index) => <article key={clan.name}><div><span>{String(index + 1).padStart(2, "0")}</span><small>{clan.usualSect}</small></div><h4>{clan.name}</h4><p>{clan.epithet}</p><dl><dt>Дисциплины</dt><dd>{clan.disciplines.length ? clan.disciplines.join(" · ") : "свободный выбор"}</dd><dt>Проклятие</dt><dd>{clan.bane}</dd></dl><div className="clan-local"><span>Париж</span><b>статус уточняется</b></div></article>)}</div></section>

      <div className="society-principles"><div className="panel-heading"><span>LEX</span><h3>Слова, которые надо знать</h3></div><dl><div><dt>Маскарад</dt><dd>скрывать существование вампиров от человечества</dd></div><div><dt>Домен</dt><dd>территория и право охоты, признанные властью</dd></div><div><dt>Элизиум</dt><dd>место встреч, где насилие запрещено</dd></div><div><dt>Долг</dt><dd>социальная валюта, переживающая деньги и поколения</dd></div><div><dt>Становление</dt><dd>превращение смертного в вампира</dd></div><div><dt>Окончательная смерть</dt><dd>уничтожение, после которого не будет пробуждения</dd></div></dl></div>
      <div className="source-ribbon"><span>Каноническая отправная точка</span><a href="https://wta5.ru/vampire/lore/clans-overview" target="_blank" rel="noreferrer">Кланы V5 на WOD5 ↗</a><a href="https://wta5.ru/vampire/lore/camarilla" target="_blank" rel="noreferrer">Камарилья на WOD5 ↗</a></div>
    </section>
  );
}
