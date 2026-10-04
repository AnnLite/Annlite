import { ArrowUpRight, BookOpen, Headphones, HeartHandshake, Lightbulb, MoonStar, Puzzle, Sparkles, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppProvider";
import { PageHeading, StatusBadge } from "../components/ui";

const items = [
  { key: "discover.wisdom", icon: Lightbulb, to: "/bible", status: "available" as const, action: "discover.openBible" },
  { key: "discover.quiz", icon: Puzzle, to: "/quiz", status: "available" as const, action: "discover.openQuiz" },
  { key: "discover.audio", icon: Headphones, status: "soon" as const },
  { key: "discover.stories", icon: BookOpen, status: "development" as const },
  { key: "discover.video", icon: Video, status: "soon" as const },
  { key: "discover.kindness", icon: HeartHandshake, to: "/charity", status: "development" as const },
  { key: "discover.resources", icon: Sparkles, to: "/learn", status: "development" as const },
  { key: "discover.openPrayer", icon: MoonStar, to: "/pray", status: "available" as const, action: "discover.openPrayer" },
  { key: "nav.reflections", icon: Sparkles, to: "/reflections", status: "available" as const },
];

export default function DiscoverPage() {
  const { t } = useApp();

  return (
    <div className="app-page">
      <PageHeading title={t("page.discover.title")} description={t("page.discover.description")} />
      <div className="discover-grid">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <span className="discover-item__icon" aria-hidden="true"><Icon size={22} /></span>
              <span className="discover-item__body"><strong>{t(item.key as "discover.wisdom")}</strong><StatusBadge status={item.status} /></span>
              {item.to && <ArrowUpRight className="discover-item__arrow" size={18} aria-hidden="true" />}
              {item.action && <span className="visually-hidden">{t(item.action as "discover.openBible")}</span>}
            </>
          );
          return item.to ? (
            <Link className="discover-item" to={item.to} key={item.key}>{content}</Link>
          ) : (
            <article className="discover-item discover-item--inactive" key={item.key}>{content}</article>
          );
        })}
      </div>
      <p className="no-scroll-note"><Sparkles size={16} aria-hidden="true" />{t("page.discover.description")}</p>
    </div>
  );
}