import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookMarked, Minus, Plus, Search, TextSearch } from "lucide-react";
import { scripture } from "../content/catalog";
import { useApp } from "../state/AppProvider";
import { EmptyState, PageHeading, Panel, StatusBadge } from "../components/ui";

export default function BiblePage() {
  const { t, locale, bookmarks, toggleBookmark, history, openVerse, notes, saveNote } = useApp();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [book, setBook] = useState("all");
  const [chapter, setChapter] = useState("all");
  const [selectedId, setSelectedId] = useState(scripture[0].id);
  const [fontSize, setFontSize] = useState(27);
  const [focusMode, setFocusMode] = useState(false);

  const books = [...new Set(scripture.map((passage) => passage.book))];
  const chapters = [...new Set(scripture.filter((passage) => book === "all" || passage.book === book).map((passage) => passage.chapter))];
  const visiblePassages = scripture.filter((passage) => {
    const matchesBook = book === "all" || passage.book === book;
    const matchesChapter = chapter === "all" || String(passage.chapter) === chapter;
    const text = `${passage.reference} ${passage.text}`.toLocaleLowerCase();
    return matchesBook && matchesChapter && text.includes(query.trim().toLocaleLowerCase());
  });
  const selected = visiblePassages.find((passage) => passage.id === selectedId) ?? visiblePassages[0];

  const selectPassage = (id: string) => {
    setSelectedId(id);
    openVerse(id);
  };

  const setBookFilter = (value: string) => {
    setBook(value);
    setChapter("all");
  };

  return (
    <div className={`app-page${focusMode ? " app-page--reading-focus" : ""}`}>
      <PageHeading
        eyebrow={t("bible.translation")}
        title={t("page.bible.title")}
        description={t("page.bible.description")}
        action={<StatusBadge status="available" />}
      />

      {locale !== "en" && <p className="content-language-note" role="note">{t("common.englishContent")}</p>}

      <div className="bible-layout">
        <section className="bible-browser" aria-label={t("bible.search")}>
          <Panel className="bible-filters">
            <label className="field-label" htmlFor="bible-search">{t("bible.search")}</label>
            <div className="search-field">
              <Search size={17} aria-hidden="true" />
              <input
                id="bible-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("bible.searchHint")}
              />
            </div>
            <div className="filter-row">
              <label>
                <span className="field-label">{t("bible.book")}</span>
                <select value={book} onChange={(event) => setBookFilter(event.target.value)}>
                  <option value="all">{t("bible.allBooks", { count: books.length })}</option>
                  {books.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
              <label>
                <span className="field-label">{t("bible.chapter")}</span>
                <select value={chapter} onChange={(event) => setChapter(event.target.value)}>
                  <option value="all">{t("bible.allChapters")}</option>
                  {chapters.map((number) => <option key={number} value={number}>{number}</option>)}
                </select>
              </label>
            </div>
            <p className="helper-text">{t("bible.webLabel")}. {t("bible.excerptNote", { count: scripture.length })}</p>
          </Panel>

          {visiblePassages.length === 0 ? (
            <EmptyState icon={<TextSearch size={23} />} title={t("bible.noResults")} description={t("bible.searchHint")} />
          ) : (
            <div className="passage-list" aria-label={t("bible.book")}>
              {visiblePassages.map((passage) => (
                <button
                  className={`passage-result${selected?.id === passage.id ? " is-selected" : ""}`}
                  type="button"
                  key={passage.id}
                  onClick={() => selectPassage(passage.id)}
                  aria-current={selected?.id === passage.id ? "true" : undefined}
                >
                  <span className="passage-result__reference">{passage.reference}</span>
                  <span className="passage-result__text">{passage.text}</span>
                </button>
              ))}
            </div>
          )}

          <section className="reading-history" aria-labelledby="history-heading">
            <h2 id="history-heading">{t("bible.history")}</h2>
            {history.length === 0 ? <p className="muted-copy">{t("bible.emptyHistory")}</p> : (
              <ul>
                {history.map((id) => {
                  const passage = scripture.find((item) => item.id === id);
                  return passage ? <li key={id}><button type="button" onClick={() => selectPassage(id)}>{passage.reference}</button></li> : null;
                })}
              </ul>
            )}
          </section>
        </section>

        <section className={`reader-panel${focusMode ? " reader-panel--focus" : ""}`} aria-label={t("page.bible.title")}>
          {!selected ? <EmptyState icon={<BookMarked size={23} />} title={t("bible.noResults")} description={t("bible.searchHint")} /> : (
            <>
              <div className="reader-toolbar">
                <span className="translation-label">{t("bible.webLabel")}</span>
                <div className="reader-toolbar__actions">
                  <button className="icon-button" type="button" aria-label={t("bible.fontDown")} onClick={() => setFontSize((size) => Math.max(20, size - 2))} disabled={fontSize <= 20}><Minus size={16} /></button>
                  <button className="icon-button" type="button" aria-label={t("bible.fontUp")} onClick={() => setFontSize((size) => Math.min(38, size + 2))} disabled={fontSize >= 38}><Plus size={16} /></button>
                  <button className="icon-button reader-focus-toggle" type="button" aria-label={t("bible.focus")} aria-pressed={focusMode} onClick={() => setFocusMode((current) => !current)}><TextSearch size={17} /></button>
                </div>
              </div>
              <article className="reader-text" aria-live="polite">
                <p className="reader-book">{selected.book} <span>{selected.chapter}</span></p>
                <blockquote style={{ fontSize: `${fontSize}px` }}>
                  <sup>{selected.verse}</sup> {selected.text}
                </blockquote>
                <p className="reader-reference">{selected.reference}</p>
              </article>
              <div className="reader-bookmark-row">
                <button
                  className={`button ${bookmarks.includes(selected.id) ? "button--secondary" : "button--quiet"}`}
                  type="button"
                  aria-pressed={bookmarks.includes(selected.id)}
                  onClick={() => toggleBookmark(selected.id)}
                >
                  <BookMarked size={17} />{bookmarks.includes(selected.id) ? t("common.saved") : t("bible.bookmark")}
                </button>
                <span>{t("bible.note")}</span>
              </div>
              <label className="note-field" htmlFor="verse-note">
                <span className="field-label">{t("bible.note")}</span>
                <textarea
                  id="verse-note"
                  rows={3}
                  value={notes[selected.id] ?? ""}
                  onChange={(event) => saveNote(selected.id, event.target.value)}
                  placeholder={t("bible.notePlaceholder")}
                />
              </label>
              <p className="privacy-note">{t("profile.localOnly")}</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}