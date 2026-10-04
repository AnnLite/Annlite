import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { PageHeading } from "./components/ui";
import { AppShell } from "./components/AppShell";
import { localeTags, type MessageKey } from "./i18n";
import { AppProvider, useApp } from "./state/AppProvider";

const HomePage = lazy(() => import("./pages/HomePage"));
const BiblePage = lazy(() => import("./pages/BiblePage"));
const LearnPage = lazy(() => import("./pages/LearnPage"));
const PrayerPage = lazy(() => import("./pages/PrayerPage"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const CharityPage = lazy(() => import("./pages/CharityPage"));
const AboutPage = lazy(() => import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const pageTitles: Record<string, MessageKey> = {
  "/": "home.title",
  "/bible": "page.bible.title",
  "/learn": "page.learn.title",
  "/pray": "page.pray.title",
  "/discover": "page.discover.title",
  "/quiz": "page.quiz.title",
  "/community": "page.community.title",
  "/charity": "page.charity.title",
  "/about": "page.about.title",
  "/profile": "page.profile.title",
};

const pageDescriptions: Record<string, MessageKey> = {
  "/": "home.intro",
  "/bible": "page.bible.description",
  "/learn": "page.learn.description",
  "/pray": "page.pray.description",
  "/discover": "page.discover.description",
  "/quiz": "page.quiz.description",
  "/community": "page.community.description",
  "/charity": "page.charity.description",
  "/about": "page.about.description",
  "/profile": "page.profile.description",
};

const siteUrl = "https://annlite.github.io/Annlite";

function RouteMetadata() {
  const { pathname } = useLocation();
  const { locale, t } = useApp();

  useEffect(() => {
    const title = t(pageTitles[pathname] ?? "page.notFound.title");
    const description = t(pageDescriptions[pathname] ?? "page.notFound.description");
    document.title = `${title} · AnnLite`;
    document.documentElement.lang = localeTags[locale];
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", `${title} · AnnLite`);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", `${title} · AnnLite`);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${siteUrl}${pathname === "/" ? "/" : pathname}`);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [locale, pathname, t]);

  return null;
}

function SiteRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RouteMetadata />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="bible" element={<BiblePage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="pray" element={<PrayerPage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="quiz" element={<QuizPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="charity" element={<CharityPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function RouteLoading() {
  const { t } = useApp();
  return <div className="route-loading" role="status"><PageHeading title={t("app.loading")} /></div>;
}

export default function App() {
  return <AppProvider><SiteRoutes /></AppProvider>;
}