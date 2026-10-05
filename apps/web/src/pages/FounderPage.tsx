import { ArrowRight, HeartHandshake, Linkedin, Mail, Sparkles } from "lucide-react";
import portrait from "../../../../docs/brand/berline-britus.jpg";
import { PageHeading, Panel } from "../components/ui";
import { useApp } from "../state/AppProvider";

const founderSkills = [
  { title: "founder.skill.floral", description: "founder.skill.floralDescription" },
  { title: "founder.skill.sewing", description: "founder.skill.sewingDescription" },
  { title: "founder.skill.handmade", description: "founder.skill.handmadeDescription" },
  { title: "founder.skill.household", description: "founder.skill.householdDescription" },
  { title: "founder.skill.soap", description: "founder.skill.soapDescription" },
  { title: "founder.skill.cleaning", description: "founder.skill.cleaningDescription" },
  { title: "founder.skill.community", description: "founder.skill.communityDescription" },
] as const;

const founderStory = [
  "founder.story.1",
  "founder.story.2",
  "founder.story.3",
  "founder.story.4",
  "founder.story.5",
  "founder.story.6",
  "founder.story.7",
  "founder.story.8",
  "founder.story.9",
  "founder.story.10",
  "founder.story.11",
] as const;

const visionValues = [
  "founder.visionFaith",
  "founder.visionCreativity",
  "founder.visionSkills",
  "founder.visionLearning",
  "founder.visionCommunity",
  "founder.visionService",
] as const;

const FOUNDER_EMAIL = "britusberline46@gmail.com";
const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/britus-berline-86329a441";

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
            <a className="button button--primary" href={`mailto:${FOUNDER_EMAIL}`}><Mail size={16} aria-hidden="true" />{t("founder.emailButton")}</a>
            <a className="button button--secondary" href={FOUNDER_LINKEDIN} target="_blank" rel="noopener noreferrer"><Linkedin size={16} aria-hidden="true" />{t("founder.linkedin")}</a>
          </div>
        </Panel>
      </div>

      <section className="founder-section" aria-labelledby="founder-story-heading">
        <div className="section-heading founder-section__heading">
          <div>
            <p className="eyebrow">{t("founder.storyEyebrow")}</p>
            <h2 id="founder-story-heading">{t("founder.storyTitle")}</h2>
          </div>
        </div>
        <Panel className="founder-story-copy">
          {founderStory.map((paragraph) => <p key={paragraph}>{t(paragraph)}</p>)}
        </Panel>
      </section>

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
          {founderSkills.map((skill) => (
            <article key={skill.title} className="skill-card" role="listitem">
              <span className="skill-card__icon" aria-hidden="true"><Sparkles size={18} /></span>
              <h3>{t(skill.title)}</h3>
              <p>{t(skill.description)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="founder-section founder-section--split" aria-labelledby="founder-faith-heading">
        <Panel className="founder-story founder-story--faith">
          <p className="eyebrow">{t("founder.faithEyebrow")}</p>
          <h2 id="founder-faith-heading">{t("founder.faithTitle")}</h2>
          <p>{t("founder.faithCopy")}</p>
        </Panel>

        <Panel className="founder-story founder-story--vision">
          <p className="eyebrow">{t("founder.visionEyebrow")}</p>
          <h2 id="founder-vision-heading">{t("founder.visionTitle")}</h2>
          <p>{t("founder.visionCopy")}</p>
          <ul className="founder-vision-values" aria-label={t("founder.visionTitle")}>
            {visionValues.map((value) => <li key={value}>{t(value)}</li>)}
          </ul>
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
          <a className="founder-contact-email" href={`mailto:${FOUNDER_EMAIL}`}>
            <Mail size={17} aria-hidden="true" />{FOUNDER_EMAIL}
          </a>
          <a className="button button--primary founder-contact-callout" href={`mailto:${FOUNDER_EMAIL}`}>
            {t("founder.emailButton")} <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a className="founder-contact-linkedin" href={FOUNDER_LINKEDIN} target="_blank" rel="noopener noreferrer">
            <Linkedin size={17} aria-hidden="true" />{t("founder.linkedin")}
          </a>
        </div>
      </Panel>
    </div>
  );
}