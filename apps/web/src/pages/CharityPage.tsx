import { ArrowRight, CircleDollarSign, HeartHandshake, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppProvider";
import { EmptyState, PageHeading, Panel, StatusBadge } from "../components/ui";

export default function CharityPage() {
  const { t } = useApp();
  return (
    <div className="app-page">
      <PageHeading title={t("page.charity.title")} description={t("page.charity.description")} />
      <Panel className="charity-empty-panel">
        <EmptyState
          icon={<HeartHandshake size={26} />}
          title={t("charity.projectsTitle")}
          description={t("charity.projectsCopy")}
        />
      </Panel>

      <section className="transparency-section" aria-labelledby="transparency-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("charity.transparency")}</p>
            <h2 id="transparency-heading">{t("charity.liveData")}</h2>
          </div>
          <StatusBadge status="development" />
        </div>
        <div className="transparency-empty">
          <CircleDollarSign size={22} aria-hidden="true" />
          <p>{t("charity.liveData")}</p>
        </div>
      </section>

      <section className="payment-readiness" aria-labelledby="payment-readiness-heading">
        <div className="section-heading">
          <div><h2 id="payment-readiness-heading">{t("charity.paymentOptions")}</h2><p>{t("charity.noPayments")}</p></div>
          <ShieldCheck size={20} aria-hidden="true" />
        </div>
        <div className="payment-option-grid">
          <article className="payment-option">
            <div><h3>{t("charity.celo")}</h3><p>{t("charity.celoStatus")}</p></div>
            <StatusBadge status="soon" />
          </article>
          <article className="payment-option">
            <div><h3>{t("charity.card")}</h3><p>{t("charity.cardStatus")}</p></div>
            <StatusBadge status="soon" />
          </article>
        </div>
        <p className="privacy-note">{t("charity.security")}</p>
      </section>

      <Panel className="give-guidance">
        <HeartHandshake size={21} aria-hidden="true" />
        <p>{t("charity.aboutPrompt")} <Link to="/about">{t("charity.aboutLink")}</Link>.</p>
        <ArrowRight size={17} aria-hidden="true" />
      </Panel>
    </div>
  );
}