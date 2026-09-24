import { useEffect, useRef, useState } from "react";

type DomainRecord = Record<string, string>;

const KEY = "paris-domain";
const FIELDS = [
  ["name", "Название / прозвище", "Как это место называют ночью"],
  ["limits", "Границы", "Улицы, станции, ориентиры, спорные края"],
  ["hunting", "Право охоты", "Кому можно кормиться и на каких условиях"],
  ["people", "Люди и ресурсы", "Контакты, безопасные места, транспорт, услуги"],
  ["claims", "Соседи, долги и притязания", "Кто может потребовать доступ, услугу или уступку"],
  ["problems", "Споры и угрозы", "Что держит домен в напряжении прямо сейчас"],
  ["notes", "Заметки владельцев", "Решения игроков, договорённости и незакрытые вопросы"],
] as const;

const EMPTY: DomainRecord = Object.fromEntries(FIELDS.map(([key]) => [key, key === "name" ? "Новый домен" : ""]));

function loadDomain(): DomainRecord {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<DomainRecord> | null;
    if (!parsed) return { ...EMPTY };
    const saved: DomainRecord = { ...EMPTY };
    FIELDS.forEach(([key]) => { if (typeof parsed[key] === "string") saved[key] = parsed[key]!; });
    return saved;
  } catch { return { ...EMPTY }; }
}

export function DomainPage() {
  const [domain, setDomain] = useState<DomainRecord>(loadDomain);
  const [saved, setSaved] = useState(true);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify(domain));
      setSaved(true);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [domain]);

  const exportDomain = () => {
    const blob = new Blob([JSON.stringify(domain, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(domain.name || "domain").toLowerCase().replace(/[^a-zа-яё0-9]+/gi, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDomain = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as Partial<DomainRecord>;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid");
      setDomain({ ...EMPTY, ...Object.fromEntries(FIELDS.map(([key]) => [key, typeof parsed[key] === "string" ? parsed[key] : EMPTY[key]])) });
    } catch { window.alert("Не удалось прочитать файл домена. Нужен JSON, экспортированный с этого сайта."); }
  };

  return <section className="page domain-page">
    <header className="domain-hero"><div><div className="eyebrow">Территория / совместное управление</div><h2>Домен<br /><em>не достаётся бесплатно</em></h2></div><p>Игроки договариваются о границах и правах, отмечают долги и решают, что делать со спорными местами. Это рабочая доска, не автоматическое подтверждение владения.</p></header>
    <div className="domain-toolbar"><span className="local-badge"><i />{saved ? "сохранено в этом браузере" : "сохранение…"}</span><div><button type="button" onClick={exportDomain}>Экспорт JSON</button><button type="button" onClick={() => importRef.current?.click()}>Импорт JSON</button><input ref={importRef} type="file" accept="application/json" hidden onChange={(event) => { void importDomain(event.target.files?.[0]); event.target.value = ""; }} /></div></div>
    <div className="domain-local-warning"><span>ВАЖНО / ЛОКАЛЬНОЕ ХРАНЕНИЕ</span><p>Правки видны только на устройстве и в браузере, где их внесли. Чтобы передать общий актуальный домен остальным, экспортируйте JSON и отправьте файл; получатели импортируют его у себя.</p></div>
    <div className="domain-fields">{FIELDS.map(([key, label, hint], index) => <label className={key === "notes" ? "wide" : ""} key={key}><span><i>{String(index + 1).padStart(2, "0")}</i>{label}</span><small>{hint}</small>{key === "name" ? <input value={domain[key]} onChange={(event) => setDomain((current) => ({ ...current, [key]: event.target.value }))} /> : <textarea value={domain[key]} rows={key === "notes" ? 5 : 4} onChange={(event) => setDomain((current) => ({ ...current, [key]: event.target.value }))} placeholder="Пока не заполнено" />}</label>)}</div>
    <div className="domain-signoff"><span>PARIS // NUIT · DOSSIER DOM-01</span><p>Территория существует не на карте, а в признанных правах, надёжных людях и способности удержать обещанное.</p></div>
  </section>;
}
