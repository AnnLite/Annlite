import { BookOpen, Heart, Lightbulb, UsersRound } from "lucide-react";
import { learningTopics } from "../content/catalog";
import { useApp } from "../state/AppProvider";
import { PageHeading, Panel, SectionHeading, StatusBadge } from "../components/ui";

const topicIcons = [BookOpen, Lightbulb, Heart, BookOpen, UsersRound, Heart, UsersRound, Lightbulb, Heart, UsersRound, Lightbulb, Heart, UsersRound, Heart];

export default function LearnPage() {
  const { t } = useApp();

  return (
    <div className="app-page">
      <PageHeading title={t("page.learn.title")} description={t("page.learn.description")} />
      <Panel className="course-preview">
        <div className="course-preview__icon" aria-hidden="true"><BookOpen size={24} /></div>
        <div className="course-preview__body">
          <StatusBadge status="development" />
          <h2>{t("learn.featureTitle")}</h2>
          <p>{t("learn.featureCopy")}</p>
          <span className="example-label">{t("learn.sampleOutline")}</span>
          <h3>{t("learn.course")}</h3>
          <ul className="course-meta" aria-label={t("learn.sampleOutline")}>
            <li>{t("learn.beginner")}</li>
            <li>{t("learn.lessons")}</li>
            <li>{t("learn.duration")}</li>
          </ul>
        </div>
      </Panel>

      <section className="topic-section">
        <SectionHeading title={t("learn.topics")} description={t("page.learn.description")} />
        <div className="topic-grid">
          {learningTopics.map((key, index) => {
            const Icon = topicIcons[index];
            return (
              <article className="topic-item" key={key}>
                <span className="topic-item__icon" aria-hidden="true"><Icon size={18} /></span>
                <span className="topic-item__name">{t(key)}</span>
                <StatusBadge status="soon" />
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}