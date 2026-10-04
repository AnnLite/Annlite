import { Heart, HandHeart, ShieldCheck, Sparkles } from "lucide-react";
import portrait from "../../../../docs/brand/berline-britus.jpg";
import { useApp } from "../state/AppProvider";
import { PageHeading, Panel } from "../components/ui";

const values = [
  { key: "about.valueFaith", icon: Sparkles },
  { key: "about.valueTruth", icon: ShieldCheck },
  { key: "about.valueService", icon: HandHeart },
  { key: "about.valueCompassion", icon: Heart },
  { key: "about.valueTransparency", icon: ShieldCheck },
  { key: "about.valueRespect", icon: Sparkles },
] as const;

export function AboutPage() {
  const { t } = useApp();
  return (
    <div className="app-page">
      <PageHeading title={t("page.about.title")} description={t("page.about.description")} />
      <div className="about-grid">
        <Panel className="about-mission">
          <p className="eyebrow">AnnLite</p>
          <h2>{t("about.mission")}</h2>
          <p>{t("about.missionCopy")}</p>
          <blockquote className="ethical-statement">{t("about.ethicalStatement")}</blockquote>
        </Panel>
        <figure className="founder-portrait">
          <img src={portrait} alt="Berline Britus, founder of AnnLite" loading="lazy" />
          <figcaption><strong>Berline Britus</strong><span>{t("about.founder")}</span><small>{t("about.photoCredit")}</small></figcaption>
        </figure>
      </div>
      <section className="values-section" aria-labelledby="values-title">
        <div className="section-heading"><div><h2 id="values-title">{t("about.values")}</h2></div></div>
        <div className="values-list">
          {values.map(({ key, icon: Icon }) => <span className="value-chip" key={key}><Icon size={16} aria-hidden="true" />{t(key)}</span>)}
        </div>
      </section>
      <Panel className="founder-facts">
        <h2>{t("about.founder")}</h2>
        <p>{t("about.founderCopy")}</p>
      </Panel>
    </div>
  );
}