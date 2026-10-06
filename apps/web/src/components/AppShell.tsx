import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen, Compass, Heart, Home, Menu, Moon, Sun, UserRound, UsersRound, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import logo from "../../../../docs/brand/annlite-logo-192.png";
import { localeNames, type Locale, type MessageKey } from "../i18n";
import { useApp } from "../state/AppProvider";

type NavigationItem = { to: string; key: MessageKey; icon: LucideIcon; end?: boolean };

const navigation: NavigationItem[] = [
  { to: "/", key: "nav.home", icon: Home, end: true },
  { to: "/bible", key: "nav.bible", icon: BookOpen },
  { to: "/reflections", key: "nav.reflections", icon: BookOpen },
  { to: "/learn", key: "nav.learn", icon: BookOpen },
  { to: "/pray", key: "nav.pray", icon: Heart },
  { to: "/discover", key: "nav.discover", icon: Compass },
  { to: "/community", key: "nav.community", icon: UsersRound },
  { to: "/charity", key: "nav.charity", icon: Heart },
  { to: "/about", key: "nav.about", icon: UserRound },
] as const;

const quickNavigation: NavigationItem[] = [navigation[0], navigation[1], navigation[3], navigation[4], { to: "/profile", key: "nav.profile", icon: UserRound }];

export function AppShell() {
  const { t, locale, setLocale, theme, setTheme } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    const updateOnline = () => setOffline(!navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const navLink = (item: NavigationItem, mobile = false) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end ?? false}
        className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}${mobile && item.to === "/pray" ? " nav-link--central" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        <Icon size={mobile ? 20 : 16} strokeWidth={1.8} aria-hidden="true" />
        <span>{t(item.key)}</span>
      </NavLink>
    );
  };

  return (
    <>
      <a className="skip-link" href="#main-content">{t("app.skip")}</a>
      <div className="trust-banner" aria-live="polite">
        <span className="trust-banner__label">{t("site.trustLabel")}</span>
        <span>{t("site.trustMessage")}</span>
      </div>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to="/" aria-label={t("site.brandHome")}>
            <img src={logo} alt="" width="38" height="38" />
            <span>AnnLite</span>
          </Link>

          <nav className="desktop-nav" aria-label={t("nav.main")}>
            {navigation.map((item) => navLink(item))}
          </nav>

          <div className="header-actions">
            <label className="visually-hidden" htmlFor="language-select">{t("top.language")}</label>
            <select
              id="language-select"
              className="language-select"
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
              aria-label={t("top.language")}
            >
              {Object.entries(localeNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button
              className="icon-button theme-toggle"
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? t("top.light") : t("top.dark")}
              aria-pressed={theme === "dark"}
              title={t("top.theme")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link className="icon-button account-link" to="/profile" aria-label={t("top.account")}>
              <UserRound size={18} />
            </Link>
            <Link className="button button--primary header-give" to="/donate">
              <Heart size={16} aria-hidden="true" />{t("top.give")}
            </Link>
            <button
              className="icon-button menu-toggle"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.menu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <nav id="mobile-menu" className="mobile-menu" aria-label={t("nav.main")} hidden={!menuOpen}>
            {navigation.map((item) => navLink(item))}
            <Link className="button button--primary" to="/donate" onClick={() => setMenuOpen(false)}>
              <Heart size={16} aria-hidden="true" />{t("top.give")}
            </Link>
        </nav>
      </header>

      {offline && <div className="offline-banner" role="status">{t("app.offline")}</div>}

      <main id="main-content" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <Link className="brand brand--footer" to="/">
          <img src={logo} alt="" width="30" height="30" />
          <span>AnnLite</span>
        </Link>
        <p>{t("site.tagline")}</p>
        <nav aria-label={t("site.footerNavigation")}>
          <Link to="/about">{t("nav.about")}</Link>
          <Link to="/founder">{t("page.founder.title")}</Link>
          <Link to="/reflections">{t("nav.reflections")}</Link>
          <Link to="/charity">{t("nav.charity")}</Link>
          <Link to="/donate">{t("top.give")}</Link>
          <Link to="/community">{t("nav.community")}</Link>
          <Link to="/contact">{t("nav.contact")}</Link>
          <Link to="/privacy">{t("nav.privacy")}</Link>
          <Link to="/terms">{t("nav.terms")}</Link>
        </nav>
      </footer>

      <nav className="mobile-bottom-nav" aria-label={t("nav.mobile")}>
        {quickNavigation.map((item) => navLink(item, true))}
      </nav>
    </>
  );
}