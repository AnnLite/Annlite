import { Flag, HeartHandshake, ShieldCheck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppProvider";
import { PageHeading, Panel, StatusBadge } from "../components/ui";

export default function CommunityPage() {
  const { t } = useApp();
  return (
    <div className="app-page">
      <PageHeading title={t("page.community.title")} description={t("page.community.description")} action={<StatusBadge status="development" />} />
      <Panel className="community-safety">
        <span className="community-safety__icon" aria-hidden="true"><ShieldCheck size={25} /></span>
        <div>
          <h2>{t("community.requests")}</h2>
          <p>{t("community.safety")}</p>
          <p>{t("community.noFeed")}</p>
        </div>
      </Panel>
      <section className="community-principles" aria-label={t("page.community.title")}>
        <article><HeartHandshake size={20} aria-hidden="true" /><h3>{t("community.careTitle")}</h3><p>{t("community.careCopy")}</p></article>
        <article><Flag size={20} aria-hidden="true" /><h3>{t("community.reportingTitle")}</h3><p>{t("community.reportingCopy")}</p></article>
        <article><UsersRound size={20} aria-hidden="true" /><h3>{t("community.moderationTitle")}</h3><p>{t("community.moderationCopy")}</p></article>
      </section>
      <p className="inline-note">{t("community.journalPrompt")} <Link to="/pray">{t("community.journalLink")}</Link>.</p>
    </div>
  );
}