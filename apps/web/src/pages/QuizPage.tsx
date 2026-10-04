import { useState } from "react";
import { ArrowRight, BookOpenCheck, Check, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { quiz } from "../content/catalog";
import { useApp } from "../state/AppProvider";
import { PageHeading, ProgressBar } from "../components/ui";

export default function QuizPage() {
  const { t, locale } = useApp();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = quiz[index];
  const answers = [`quiz.${question.id}a`, `quiz.${question.id}b`, `quiz.${question.id}c`, `quiz.${question.id}d`] as const;

  const checkAnswer = () => {
    if (!selected || checked) return;
    setChecked(true);
    if (selected === question.correct) setCorrect((count) => count + 1);
  };

  const next = () => {
    if (index === quiz.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setSelected("");
    setChecked(false);
  };

  const restart = () => {
    setIndex(0);
    setSelected("");
    setChecked(false);
    setCorrect(0);
    setFinished(false);
  };

  return (
    <div className="app-page quiz-page">
      <PageHeading title={t("page.quiz.title")} description={t("page.quiz.description")} />
      {locale !== "en" && <p className="content-language-note">{t("common.englishContent")}</p>}
      {finished ? (
        <section className="quiz-complete" aria-live="polite">
          <span className="quiz-complete__icon" aria-hidden="true"><Check size={26} /></span>
          <p className="eyebrow">{t("page.quiz.title")}</p>
          <h2>{t("quiz.complete")}</h2>
          <p>{t("quiz.score", { correct, total: quiz.length })}</p>
          <button className="button button--secondary" type="button" onClick={restart}><RotateCcw size={16} />{t("quiz.again")}</button>
        </section>
      ) : (
        <section className="quiz-panel" aria-labelledby="quiz-question">
          <div className="quiz-panel__topline">
            <span>{t("quiz.question", { current: index + 1, total: quiz.length })}</span>
            <span>{question.reference}</span>
          </div>
          <ProgressBar value={((index + (checked ? 1 : 0)) / quiz.length) * 100} label={t("page.quiz.title")} />
          <fieldset className="quiz-options">
            <legend id="quiz-question">{t(`quiz.${question.id}` as "quiz.q1")}</legend>
            {answers.map((key) => (
              <label className={`quiz-option${selected === key ? " is-selected" : ""}${checked && key === question.correct ? " is-correct" : ""}`} key={key}>
                <input type="radio" name={`question-${question.id}`} value={key} checked={selected === key} onChange={() => setSelected(key)} disabled={checked} />
                <span>{t(key as "quiz.q1a")}</span>
                {checked && key === question.correct && <Check size={17} aria-hidden="true" />}
              </label>
            ))}
          </fieldset>
          {checked && <p className={`quiz-feedback${selected === question.correct ? " is-correct" : ""}`} role="status">{selected === question.correct ? t("quiz.correct") : t("quiz.tryAgain")}</p>}
          <div className="quiz-panel__footer">
            <Link to={`/bible?query=${encodeURIComponent(question.reference)}`} className="inline-link"><BookOpenCheck size={16} />{question.reference}</Link>
            {!checked ? (
              <button className="button button--primary" type="button" onClick={checkAnswer} disabled={!selected}>{t("quiz.check")}</button>
            ) : (
              <button className="button button--primary" type="button" onClick={next}>{index === quiz.length - 1 ? t("quiz.finish") : t("quiz.next")}<ArrowRight size={16} /></button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}