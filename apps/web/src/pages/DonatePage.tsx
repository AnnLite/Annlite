import { ArrowUpRight, HeartHandshake, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppProvider";
import { PageHeading, Panel, StatusBadge } from "../components/ui";

const CELOHT_URL = "https://app.celoht.com/";

export default function DonatePage() {
  const { t } = useApp();

  return (
    <div className="app-page">
      <PageHeading title={t("page.donate.title")} description={t("page.donate.description")} />
      <Panel className="donation-provider">
        <span className="donation-provider__icon" aria-hidden="true"><HeartHandshake size={23} /></span>
        <div className="donation-provider__copy">
          <div className="donation-provider__heading"><h2>{t("donate.celoTitle")}</h2><StatusBadge status="available" /></div>
          <p>{t("donate.celoCopy")}</p>
          <p className="privacy-note"><ShieldCheck size={15} aria-hidden="true" />{t("donate.externalNotice")}</p>
          <a className="button button--primary donate-external" href={CELOHT_URL} target="_blank" rel="noopener noreferrer">
            {t("donate.celoButton")}<ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </Panel>

      <Panel className="donation-provider donation-provider--disabled">
        <div className="donation-provider__copy">
          <div className="donation-provider__heading"><h2>{t("donate.cardTitle")}</h2><StatusBadge status="soon" /></div>
          <p>{t("donate.cardCopy")}</p>
          <button className="button button--secondary" type="button" disabled>{t("charity.card")}</button>
        </div>
      </Panel>

      <p className="transparency-note"><ShieldCheck size={17} aria-hidden="true" />{t("donate.transparency")}</p>
      <p className="donation-footer-link"><Link to="/charity">{t("nav.charity")}</Link></p>
    </div>
  );
}