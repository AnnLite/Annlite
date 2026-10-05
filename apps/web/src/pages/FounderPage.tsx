import { ArrowRight, BriefcaseBusiness, HeartHandshake, Mail, Sparkles } from "lucide-react";
import portrait from "../../../../docs/brand/berline-britus.jpg";
import { LinkButton, PageHeading, Panel } from "../components/ui";
import { useApp } from "../state/AppProvider";

const founderSkills = [
  "founder.skill.floral",
  "founder.skill.sewing",
  "founder.skill.handmade",
  "founder.skill.household",
  "founder.skill.soap",
  "founder.skill.cleaning",
  "founder.skill.community",
] as const;

export default function FounderPage() {
  const { t } = useApp();

  return (
    <div className="app-page founder-page">
      <PageHeading eyebrow="AnnLite" title="Berline Britus" description={t("page.founder.description")} />

      <div className="founder-hero">
        <figure className="founder-portrait founder-portrait--page">
          <img src={portrait} alt="Berline Britus, founder of AnnLite" loading="lazy" />
          <figcaption>
            <strong>Berline Britus</strong>
            <span>{t("founder.role")}</span>
            <small>{t("founder.origin")}</small>
          </figcaption>
        </figure>

        <Panel className="founder-intro">
          <p className="eyebrow">{t("founder.heroEyebrow")}</p>
          <h2>{t("founder.heroName")}</h2>
          <p>{t("founder.heroCopy")}</p>
          <div className="founder-hero__actions">
            <LinkButton to="/contact" variant="primary"><Mail size={16} aria-hidden="true" />{t("founder.contactButton")}</LinkButton>
            <a className="button button--secondary" href="mailto:britusberline46@gmail.com">{t("founder.emailShort")}</a>
          </div>
        </Panel>
      </div>

      <section className="founder-section" aria-labelledby="founder-bio-heading">
        <div className="section-heading founder-section__heading">
          <div>
            <p className="eyebrow">{t("founder.bioEyebrow")}</p>
            <h2 id="founder-bio-heading">{t("founder.bioTitle")}</h2>
          </div>
        </div>
        <Panel className="founder-bio-panel">
          <p>{t("founder.bio")}</p>
        </Panel>
      </section>

      <section className="founder-section" aria-labelledby="founder-skills-heading">
        <div className="section-heading founder-section__heading">
          <div>
            <p className="eyebrow">{t("founder.skillsEyebrow")}</p>
            <h2 id="founder-skills-heading">{t("founder.skillsTitle")}</h2>
          </div>
        </div>
        <div className="skills-grid" role="list" aria-label={t("founder.skillsTitle")}>
          {founderSkills.map((skillKey) => (
            <article key={skillKey} className="skill-card" role="listitem">
              <span className="skill-card__icon" aria-hidden="true"><Sparkles size={18} /></span>
              <h3>{t(skillKey)}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="founder-section founder-section--split" aria-labelledby="founder-faith-heading">
        <Panel className="founder-story">
          <p className="eyebrow">{t("founder.faithEyebrow")}</p>
          <h2 id="founder-faith-heading">{t("founder.faithTitle")}</h2>
          <p>{t("founder.faithCopy")}</p>
        </Panel>

        <Panel className="founder-story founder-story--vision">
          <p className="eyebrow">{t("founder.visionEyebrow")}</p>
          <h2 id="founder-vision-heading">{t("founder.visionTitle")}</h2>
          <p>{t("founder.visionCopy")}</p>
        </Panel>
      </section>

      <Panel className="founder-contact-panel" aria-labelledby="founder-contact-heading">
        <div className="founder-contact-panel__header">
          <span className="founder-contact-panel__icon" aria-hidden="true"><HeartHandshake size={20} /></span>
          <div>
            <p className="eyebrow">{t("founder.contactEyebrow")}</p>
            <h2 id="founder-contact-heading">{t("founder.contactTitle")}</h2>
          </div>
        </div>
        <div className="founder-contact-panel__body">
          <div>
            <p className="founder-contact-name">Berline Britus</p>
            <p className="founder-contact-role">{t("founder.role")}</p>
          </div>
          <a className="founder-contact-email" href="mailto:britusberline46@gmail.com" aria-label="Email Berline Britus">
            <Mail size={17} aria-hidden="true" />britusberline46@gmail.com
          </a>
          <a className="button button--primary founder-contact-callout" href="mailto:britusberline46@gmail.com">
            {t("founder.emailButton")} <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </Panel>
    </div>
  );
}