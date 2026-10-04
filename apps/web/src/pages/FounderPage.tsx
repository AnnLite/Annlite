import { Mail } from "lucide-react";
import portrait from "../../../../docs/brand/berline-britus.jpg";
import { useApp } from "../state/AppProvider";
import { LinkButton, PageHeading, Panel } from "../components/ui";

export default function FounderPage() {
  const { t } = useApp();
  return (
    <div className="app-page">
      <PageHeading title={t("page.founder.title")} description={t("page.founder.description")} />
      <div className="founder-page-layout">
        <figure className="founder-portrait founder-portrait--page">
          <img src={portrait} alt="Berline Britus, founder of AnnLite" />
          <figcaption><strong>Berline Britus</strong><span>{t("about.founder")}</span><small>{t("about.photoCredit")}</small></figcaption>
        </figure>
        <Panel className="founder-facts">
          <p className="eyebrow">AnnLite</p>
          <h2>{t("about.founder")}</h2>
          <p>{t("about.founderCopy")}</p>
          <LinkButton to="/contact" variant="secondary"><Mail size={16} />{t("nav.contact")}</LinkButton>
        </Panel>
      </div>
    </div>
  );
}