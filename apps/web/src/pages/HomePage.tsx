import { ArrowDownRight, ArrowRight, BookOpen, Check, Heart, Leaf, MoonStar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import portrait from "../../../../docs/brand/berline-britus.jpg";
import { scripture } from "../content/catalog";
import { localeTags } from "../i18n";
import { useApp, type JourneyStep } from "../state/AppProvider";
import { LinkButton, ProgressBar, SectionHeading } from "../components/ui";
import { VerseCard } from "../components/VerseCard";

const journey: { id: JourneyStep; key: "home.readVerse" | "home.reading" | "home.prayer" | "home.reflect" | "home.kindness"; icon: typeof BookOpen }[] = [
  { id: "verse", key: "home.readVerse", icon: BookOpen },
  { id: "reading", key: "home.reading", icon: BookOpen },
  { id: "prayer", key: "home.prayer", icon: MoonStar },
  { id: "reflection", key: "home.reflect", icon: Sparkles },
  { id: "kindness", key: "home.kindness", icon: Heart },
];

function verseForToday() {
  const day = new Date();
  const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
  const seed = [...key].reduce((total, character) => total + character.charCodeAt(0), 0);
  return scripture[seed % scripture.length];
}

export default function HomePage() {
  const { t, locale, progress, toggleStep } = useApp();
  const today = new Intl.DateTimeFormat(localeTags[locale], { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const passage = verseForToday();
  const complete = progress.complete.length;

  return (
    <div className="app-page home-page">
      <section className="home-intro">
        <div className="home-intro__copy">
          <p className="eyebrow">{today} <span aria-hidden="true">·</span> {t("home.eyebrow")}</p>
          <h1>{t("home.title")}</h1>
          <p className="home-intro__text">{t("home.intro")}</p>
          <div className="home-intro__actions">
            <LinkButton to="/bible">{t("home.read")}<ArrowRight size={17} aria-hidden="true" /></LinkButton>
            <LinkButton to="/pray" variant="secondary">{t("home.pray")}<ArrowDownRight size={17} aria-hidden="true" /></LinkButton>
          </div>
        </div>
        <Link to="/founder" className="founder-feature" aria-label={t("home.meetFounder")}>
          <img src={portrait} alt="Berline Britus, founder of AnnLite" />
          <span className="founder-feature__copy">
            <span className="eyebrow">{t("home.founderTitle")}</span>
            <strong>Berline Britus</strong>
            <span>{t("home.meetFounder")} <ArrowRight size={14} aria-hidden="true" /></span>
          </span>
        </Link>
      </section>

      <div className="home-columns">
        <div className="home-primary-column">
          <section className="journey-section" aria-labelledby="journey-heading">
            <SectionHeading
              title={t("home.journey")}
              description={t("home.journeyHint")}
              action={<span className="journey-count">{t("home.progress", { done: complete, total: journey.length })}</span>}
            />
            <ProgressBar value={Math.round((complete / journey.length) * 100)} label={t("home.journey")} />
            <div className="journey-list">
              {journey.map((step, index) => {
                const Icon = step.icon;
                const checked = progress.complete.includes(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`journey-step${checked ? " is-complete" : ""}`}
                    aria-pressed={checked}
                    onClick={() => toggleStep(step.id)}
                  >
                    <span className="journey-step__number" aria-hidden="true">{checked ? <Check size={15} /> : `0${index + 1}`}</span>
                    <span className="journey-step__icon" aria-hidden="true"><Icon size={17} /></span>
                    <span className="journey-step__label">{t(step.key)}</span>
                    <span className="journey-step__action" aria-hidden="true">{checked ? <Check size={17} /> : <ArrowRight size={16} />}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section id="daily-verse" className="daily-verse-section" aria-label={t("home.verse")}>
            <VerseCard passage={passage} />
          </section>

          <section className="growth-section">
            <SectionHeading title={t("home.growth")} description={t("home.growthHint")} />
            <div className="growth-grid">
              <Link to="/learn" className="growth-link growth-link--learn">
                <span className="growth-link__icon"><BookOpen size={20} /></span>
                <span><strong>{t("nav.learn")}</strong><small>{t("common.underDevelopment")}</small></span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/discover" className="growth-link growth-link--discover">
                <span className="growth-link__icon"><Sparkles size={20} /></span>
                <span><strong>{t("nav.discover")}</strong><small>{t("common.available")}</small></span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link to="/charity" className="growth-link growth-link--serve">
                <span className="growth-link__icon"><Leaf size={20} /></span>
                <span><strong>{t("nav.charity")}</strong><small>{t("common.underDevelopment")}</small></span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>

        <aside className="home-aside" aria-label={t("home.pray")}>
          <section className="quiet-moment">
            <span className="quiet-moment__icon" aria-hidden="true"><MoonStar size={21} /></span>
            <p className="eyebrow">{t("nav.pray")}</p>
            <h2>{t("page.pray.title")}</h2>
            <p>{t("page.pray.description")}</p>
            <Link to="/pray" className="inline-link">{t("home.pray")}<ArrowRight size={16} aria-hidden="true" /></Link>
          </section>
          <section className="gentle-note">
            <span className="gentle-note__mark" aria-hidden="true">“</span>
            <p>{t("home.founderCopy")}</p>
            <span className="gentle-note__name">AnnLite</span>
          </section>
        </aside>
      </div>
    </div>
  );
}