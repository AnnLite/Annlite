import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { localeTags, t, type Locale, type MessageKey } from "../i18n";
import { learnProgressKey } from "./learnProgress";

export type Theme = "light" | "dark";
export type JourneyStep = "verse" | "reading" | "prayer" | "reflection" | "kindness";
export type JournalEntry = { id: string; category: string; text: string; createdAt: string };
type DailyProgress = { date: string; complete: JourneyStep[] };

type AppState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  progress: DailyProgress;
  toggleStep: (step: JourneyStep) => void;
  completeStep: (step: JourneyStep) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  history: string[];
  openVerse: (id: string) => void;
  notes: Record<string, string>;
  saveNote: (id: string, value: string) => void;
  entries: JournalEntry[];
  addEntry: (category: string, text: string) => void;
  removeEntry: (id: string) => void;
  clearLocalData: () => void;
};

const Store = createContext<AppState | null>(null);

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useStored<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStored(key, initial));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable in private browsing; the app remains usable for this session.
    }
  }, [key, value]);
  return [value, setValue];
}

export function localDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AppProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useStored<Locale>("annlite.locale", "en");
  const [theme, setTheme] = useStored<Theme>("annlite.theme", "light");
  const today = localDayKey();
  const [progress, setProgress] = useStored<DailyProgress>("annlite.daily", { date: today, complete: [] });
  const [bookmarks, setBookmarks] = useStored<string[]>("annlite.bookmarks", []);
  const [history, setHistory] = useStored<string[]>("annlite.history", []);
  const [notes, setNotes] = useStored<Record<string, string>>("annlite.notes", {});
  const [entries, setEntries] = useStored<JournalEntry[]>("annlite.journal", []);
  const translate = useCallback<AppState["t"]>((key, vars) => t(locale, key, vars), [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = localeTags[locale];
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#101d1b" : "#164d45");
  }, [locale, theme]);

  useEffect(() => {
    if (progress.date !== today) setProgress({ date: today, complete: [] });
  }, [progress.date, setProgress, today]);

  const toggleStep = (step: JourneyStep) => {
    setProgress((current) => {
      const complete = current.date === today ? current.complete : [];
      return {
        date: today,
        complete: complete.includes(step) ? complete.filter((item) => item !== step) : [...complete, step],
      };
    });
  };

  const completeStep = (step: JourneyStep) => {
    setProgress((current) => {
      const complete = current.date === today ? current.complete : [];
      return complete.includes(step) ? current : { date: today, complete: [...complete, step] };
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((current) => current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]);
  };

  const openVerse = (id: string) => {
    setHistory((current) => [id, ...current.filter((item) => item !== id)].slice(0, 12));
    completeStep("reading");
  };

  const saveNote = (id: string, value: string) => {
    setNotes((current) => {
      const next = { ...current };
      if (value.trim()) next[id] = value;
      else delete next[id];
      return next;
    });
  };

  const addEntry = (category: string, text: string) => {
    setEntries((current) => [{ id: crypto.randomUUID(), category, text, createdAt: new Date().toISOString() }, ...current]);
  };

  const removeEntry = (id: string) => setEntries((current) => current.filter((entry) => entry.id !== id));

  const clearLocalData = () => {
    try {
      localStorage.removeItem(learnProgressKey);
    } catch {
      // Storage may be unavailable in private browsing.
    }
    setProgress({ date: today, complete: [] });
    setBookmarks([]);
    setHistory([]);
    setNotes({});
    setEntries([]);
  };

  const value: AppState = {
    locale, setLocale, theme, setTheme,
    t: translate,
    progress, toggleStep, completeStep, bookmarks, toggleBookmark, history, openVerse,
    notes, saveNote, entries, addEntry, removeEntry, clearLocalData,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export function useApp(): AppState {
  const value = useContext(Store);
  if (!value) throw new Error("useApp must be used within AppProvider");
  return value;
}