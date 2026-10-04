import { useState, type FormEvent } from "react";
import { Heart, LockKeyhole, MoonStar, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { scripture } from "../content/catalog";
import { useApp, type JourneyStep } from "../state/AppProvider";
import { localeTags, type MessageKey } from "../i18n";
import { PageHeading, Panel } from "../components/ui";

const categories = [
  "pray.faith", "pray.family", "pray.health", "pray.school", "pray.work",
  "pray.relationships", "pray.community", "pray.haiti", "pray.world", "pray.gratitude",
] as const;

export default function PrayerPage() {
  const { t, locale, entries, addEntry, removeEntry, completeStep } = useApp();
  const [searchParams] = useSearchParams();
  const reflectionPassage = scripture.find((passage) => passage.id === searchParams.get("reflection"));
  const [category, setCategory] = useState<string>("pray.faith");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");

  const saveEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    addEntry(category, text);
    completeStep(category === "pray.gratitude" ? "reflection" : "prayer" as JourneyStep);
    setDraft("");
    setNotice(t("pray.savedTitle"));
  };

  return (
    <div className="app-page">
      <PageHeading title={t("page.pray.title")} description={t("page.pray.description")} />

      <div className="prayer-layout">
        <Panel className="guided-prayer">
          <span className="quiet-moment__icon" aria-hidden="true"><MoonStar size={22} /></span>
          <p className="eyebrow">{t("pray.guideLabel")}</p>
          <h2>{t("pray.guidedTitle")}</h2>
          {locale !== "en" && <p className="content-language-note">{t("common.englishContent")}</p>}
          <blockquote>{t("pray.guidedText")}</blockquote>
        </Panel>

        <Panel className="journal-form-panel">
          <div className="journal-heading">
            <span className="journal-heading__icon" aria-hidden="true"><Heart size={20} /></span>
            <div>
              <h2>{t("pray.journalTitle")}</h2>
              <p>{t("pray.journalHint")}</p>
            </div>
          </div>
          <form onSubmit={saveEntry}>
            {reflectionPassage && (
              <aside className="reflection-context">
                <span className="eyebrow">{reflectionPassage.reference}</span>
                <p>“{reflectionPassage.text}”</p>
                <span>{t("home.translation")}</span>
              </aside>
            )}
            <label className="field-label" htmlFor="prayer-category">{t("pray.category")}</label>
            <select id="prayer-category" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item} value={item}>{t(item as MessageKey)}</option>)}
            </select>
            <label className="field-label" htmlFor="prayer-entry">{t("pray.entryLabel")}</label>
            <textarea id="prayer-entry" rows={6} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t("pray.placeholder")} maxLength={5000} />
            <div className="form-footer">
              <span className="privacy-note"><LockKeyhole size={14} aria-hidden="true" />{t("profile.localOnly")}</span>
              <button className="button button--primary" type="submit" disabled={!draft.trim()}>{t("pray.saveEntry")}</button>
            </div>
            <p className="form-status" role="status" aria-live="polite">{notice}</p>
          </form>
        </Panel>
      </div>

      <section className="journal-section" aria-labelledby="journal-list-title">
        <div className="section-heading">
          <div><h2 id="journal-list-title">{t("pray.savedTitle")}</h2><p>{t("pray.journalHint")}</p></div>
          <span className="count-note">{entries.length}</span>
        </div>
        {entries.length === 0 ? (
          <p className="quiet-empty">{t("pray.empty")}</p>
        ) : (
          <ul className="journal-list">
            {entries.map((entry) => (
              <li className="journal-entry" key={entry.id}>
                <div className="journal-entry__meta">
                  <span>{t(entry.category as MessageKey)}</span>
                  <time dateTime={entry.createdAt}>{new Intl.DateTimeFormat(localeTags[locale], { dateStyle: "medium" }).format(new Date(entry.createdAt))}</time>
                </div>
                <p>{entry.text}</p>
                <button className="icon-button journal-entry__remove" type="button" aria-label={`${t("pray.deleteEntry")}: ${t(entry.category as MessageKey)}`} onClick={() => removeEntry(entry.id)}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}