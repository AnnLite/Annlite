import { useState } from "react";
import { Bookmark, Headphones, MessageCircle, Share2, Square } from "lucide-react";
import { Link } from "react-router-dom";
import type { ScripturePassage } from "../content/catalog";
import { scriptureSource } from "../content/catalog";
import { useApp } from "../state/AppProvider";

export function VerseCard({ passage, compact = false }: { passage: ScripturePassage; compact?: boolean }) {
  const { t, bookmarks, toggleBookmark } = useApp();
  const [speaking, setSpeaking] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const isSaved = bookmarks.includes(passage.id);

  const listen = () => {
    if (!("speechSynthesis" in window)) {
      setAnnouncement(t("home.englishAudioUnavailable"));
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(`${passage.text} ${passage.reference}`);
    utterance.lang = "en-US";
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const share = async () => {
    const text = `“${passage.text}” — ${passage.reference} (${scriptureSource})`;
    try {
      if (navigator.share) await navigator.share({ title: passage.reference, text });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setAnnouncement(t("home.copied"));
      } else setAnnouncement(text);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setAnnouncement(t("home.shareUnavailable"));
    }
  };

  return (
    <article className={`verse-card${compact ? " verse-card--compact" : ""}`}>
      <div className="verse-card__topline">
        <span className="eyebrow">{t("home.verse")}</span>
        <span className="verse-source">{t("home.translation")}</span>
      </div>
      <blockquote className="verse-card__text">“{passage.text}”</blockquote>
      <p className="verse-card__reference">{passage.reference}</p>
      <div className="verse-actions" aria-label={t("home.verseActions")}>
        <button className="text-action" type="button" onClick={listen} aria-label={speaking ? t("home.stopAudio") : t("home.listen")}>
          {speaking ? <Square size={16} /> : <Headphones size={17} />}
          <span>{speaking ? t("home.stopAudio") : t("home.listen")}</span>
        </button>
        <button className="text-action" type="button" onClick={share} aria-label={t("home.share")}>
          <Share2 size={16} /><span>{t("home.share")}</span>
        </button>
        <button
          className={`text-action${isSaved ? " text-action--saved" : ""}`}
          type="button"
          onClick={() => toggleBookmark(passage.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? t("bible.unbookmark") : t("bible.bookmark")}
        >
          <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
          <span>{isSaved ? t("common.saved") : t("common.save")}</span>
        </button>
        <Link className="text-action" to={`/pray?reflection=${passage.id}`}>
          <MessageCircle size={16} /><span>{t("home.reflectOn")}</span>
        </Link>
      </div>
      <span className="visually-hidden" role="status" aria-live="polite">{announcement}</span>
    </article>
  );
}