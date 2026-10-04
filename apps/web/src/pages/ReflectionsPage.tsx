import { ArrowRight, BookOpen, Feather } from "lucide-react";
import { Link } from "react-router-dom";
import { reflections } from "../content/reflections";
import { useApp } from "../state/AppProvider";
import { PageHeading, Panel } from "../components/ui";

export default function ReflectionsPage() {
  const { t, locale } = useApp();

  return (
    <div className="app-page">
      <PageHeading title={t("page.reflections.title")} description={t("page.reflections.description")} />
      <div className="reflection-list">
        {reflections.map((reflection) => (
          <Panel className="reflection-entry" key={reflection.id}>
            <div className="reflection-entry__meta">
              <span className="reflection-entry__category"><Feather size={14} aria-hidden="true" />{t(reflection.category)}</span>
              <time dateTime={reflection.publishedOn}>{new Intl.DateTimeFormat(locale === "en" ? "en" : locale === "fr" ? "fr-FR" : "ht-HT", { dateStyle: "long" }).format(new Date(`${reflection.publishedOn}T12:00:00`))}</time>
            </div>
            <h2>{reflection.title[locale]}</h2>
            <p>{reflection.body[locale]}</p>
            <p className="reflection-entry__source">{t("reflections.original")} · {reflection.reference}</p>
            <div className="reflection-entry__actions">
              <Link className="text-action" to={`/bible?query=${encodeURIComponent(reflection.reference)}`}><BookOpen size={16} />{t("reflections.readPassage")}</Link>
              <Link className="inline-link" to={`/pray?reflection=${reflection.verseId}`}>{t("reflections.writePrivately")}<ArrowRight size={15} /></Link>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}