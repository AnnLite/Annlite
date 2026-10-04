import { useEffect, useState } from "react";
import { Download, Laptop, Moon, ShieldCheck, Sun, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { localeNames, type Locale } from "../i18n";
import { scripture } from "../content/catalog";
import { useApp } from "../state/AppProvider";
import { readLearnProgress } from "../state/learnProgress";
import { PageHeading, Panel } from "../components/ui";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function ProfilePage() {
  const {
    t, locale, setLocale, theme, setTheme, bookmarks, entries, notes,
    progress, history, clearLocalData,
  } = useApp();
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const exportData = () => {
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      storage: "This export contains data stored locally in this browser.",
      bookmarks,
      notes,
      entries,
      history,
      progress,
      learning: readLearnProgress(),
      preferences: { locale, theme },
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "annlite-private-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteData = () => {
    if (window.confirm(t("profile.confirmClear"))) {
      clearLocalData();
      setNotice(t("profile.cleared"));
    }
  };

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="app-page">
      <PageHeading title={t("page.profile.title")} description={t("page.profile.description")} />
      <Panel className="privacy-card">
        <ShieldCheck size={22} aria-hidden="true" />
        <div><h2>{t("profile.localOnly")}</h2><p>{t("profile.noAccountSync")}</p></div>
      </Panel>

      <div className="profile-grid">
        <Panel className="settings-panel">
          <h2>{t("profile.preferences")}</h2>
          <label className="settings-row" htmlFor="profile-language">
            <span>{t("profile.language")}</span>
            <select id="profile-language" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
              {Object.entries(localeNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <div className="settings-row">
            <span>{t("profile.theme")}</span>
            <button className="button button--secondary" type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-pressed={theme === "dark"}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}{theme === "dark" ? t("top.light") : t("top.dark")}
            </button>
          </div>
          <div className="settings-row install-row">
            <span><Laptop size={18} aria-hidden="true" />{t("profile.installHint")}</span>
            {installPrompt ? <button className="button button--secondary" type="button" onClick={installApp}>{t("profile.install")}</button> : <p>{t("profile.installUnavailable")}</p>}
          </div>
        </Panel>

        <Panel className="local-data-panel">
          <h2>{t("profile.savedSpace")}</h2>
          <p className="muted-copy">{bookmarks.length} · {t("profile.savedVerses")}</p>
          {bookmarks.length === 0 ? <p>{t("profile.noSavedVerses")}</p> : (
            <ul className="saved-verse-list">
              {bookmarks.map((id) => {
                const passage = scripture.find((item) => item.id === id);
                return passage ? <li key={id}><Link to={`/bible?query=${encodeURIComponent(passage.reference)}`}>{passage.reference}</Link></li> : null;
              })}
            </ul>
          )}
          <p className="muted-copy">{entries.length} · {t("profile.prayers")}</p>
          <p className="muted-copy">{Object.keys(notes).length} · {t("profile.personalNotes")}</p>
        </Panel>
      </div>

      <section className="data-controls" aria-labelledby="data-controls-heading">
        <div><h2 id="data-controls-heading">{t("profile.dataHeading")}</h2><p>{t("profile.dataCopy")}</p></div>
        <div className="data-controls__actions">
          <button className="button button--secondary" type="button" onClick={exportData}><Download size={16} />{t("profile.export")}</button>
          <button className="button button--danger" type="button" onClick={deleteData}><Trash2 size={16} />{t("profile.clear")}</button>
        </div>
        <p className="form-status" role="status" aria-live="polite">{notice}</p>
      </section>
    </div>
  );
}