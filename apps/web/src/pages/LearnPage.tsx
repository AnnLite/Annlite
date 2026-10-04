import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, Check, ChevronRight, CircleCheck, Compass, Heart, Search, Sparkles } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getCourse, getCourseLessons, getLesson, learnCategories, learnCourses, type LearnCategory, type LearnCourse, type LearnLesson } from "../content/learn";
import { learnUi, type LearnStrings } from "../content/learnUi";
import type { Locale } from "../i18n";
import { completeLesson, getCourseProgress, readLearnProgress, recordCourseCompletion, recordLessonVisit, recordQuizAttempt, scoreQuiz, toggleLessonBookmark, writeLearnProgress, type LearnProgress } from "../state/learnProgress";
import { useApp } from "../state/AppProvider";

function format(value: string, vars: Record<string, string | number> = {}) {
  return Object.entries(vars).reduce((result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)), value);
}

function searchable(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function courseForLesson(lessonId: string) {
  const course = learnCourses.find((item) => item.lessons.some((lesson) => lesson.id === lessonId));
  const lesson = course?.lessons.find((item) => item.id === lessonId);
  return course && lesson ? { course, lesson } : undefined;
}

function matchesCourse(course: LearnCourse, query: string, locale: Locale) {
  if (!query.trim()) return true;
  const words = [course.title[locale], course.description[locale], course.category, learnUi[locale].categoryNames[course.category]];
  for (const item of course.lessons) {
    words.push(item.title[locale], item.introduction[locale], item.reflection[locale], item.activity[locale], ...item.references);
    words.push(...item.content.map((part) => part[locale]), ...item.keyPoints.map((point) => point[locale]));
  }
  const haystack = searchable(words.join(" "));
  return searchable(query).trim().split(/\s+/).every((word) => haystack.includes(word));
}

function ProgressBar({ course, progress, locale }: { course: LearnCourse; progress: LearnProgress; locale: Locale }) {
  const ui = learnUi[locale];
  const summary = getCourseProgress(course, progress);
  return (
    <div className="learn-progress" role="group" aria-label={`${ui.courseProgress}: ${summary.percent}%`}>
      <div className="progress-track" role="progressbar" aria-label={ui.courseProgress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.percent}>
        <span className="progress-track__fill" style={{ width: `${summary.percent}%` }} />
      </div>
      <span>{summary.percent}%</span>
    </div>
  );
}

function CourseCard({ course, progress, locale, featured = false }: { course: LearnCourse; progress: LearnProgress; locale: Locale; featured?: boolean }) {
  const ui = learnUi[locale];
  const summary = getCourseProgress(course, progress);
  const started = progress.startedCourses.includes(course.slug) || summary.completedLessons > 0;
  const Icon = course.category === "Prayer" ? Heart : course.category === "Faith" ? Sparkles : BookOpen;
  return (
    <article className={`learn-course-card${featured ? " learn-course-card--featured" : ""}`}>
      <Link className="learn-course-card__cover" to={`/learn/${course.slug}`} aria-label={`${ui.openCourse}: ${course.title[locale]}`}>
        <span className="learn-course-card__icon" aria-hidden="true"><Icon size={23} /></span>
        <span className="learn-course-card__level">{ui.levelNames[course.level]}</span>
      </Link>
      <div className="learn-course-card__body">
        <p className="learn-course-card__category">{ui.categoryNames[course.category]}</p>
        <h3><Link to={`/learn/${course.slug}`}>{course.title[locale]}</Link></h3>
        <p className="learn-course-card__description">{course.description[locale]}</p>
        <div className="learn-course-card__meta">
          <span>{format(ui.moduleCount, { count: course.modules.length })}</span>
          <span>{format(ui.lessonCount, { count: course.lessons.length })}</span>
        </div>
        {(summary.completedLessons > 0 || progress.startedCourses.includes(course.slug)) && <ProgressBar course={course} progress={progress} locale={locale} />}
        <Link className="learn-course-card__action" to={`/learn/${course.slug}`}>
          {started ? ui.continueCourse : ui.openCourse}<ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function LessonLink({ course, lesson, progress, locale }: { course: LearnCourse; lesson: LearnLesson; progress: LearnProgress; locale: Locale }) {
  const ui = learnUi[locale];
  const done = progress.completedLessons.includes(lesson.id);
  return (
    <Link className={`learn-lesson-link${done ? " is-complete" : ""}`} to={`/learn/${course.slug}/${lesson.slug}`}>
      <span className="learn-lesson-link__icon" aria-hidden="true">{done ? <Check size={17} /> : <BookOpen size={17} />}</span>
      <span className="learn-lesson-link__title">{lesson.title[locale]}</span>
      {done && <span className="learn-lesson-link__status">{ui.completed}</span>}
      <ChevronRight size={17} aria-hidden="true" />
    </Link>
  );
}

function Quiz({ course, lesson, locale, strings, setProgress, nextUrl }: {
  course: LearnCourse;
  lesson: LearnLesson;
  locale: Locale;
  strings: Pick<LearnStrings, "quiz" | "quizComplete" | "score" | "retry" | "continueCourse" | "position" | "correct" | "incorrect" | "explanation" | "chooseAnswer" | "checkAnswer" | "nextQuestion" | "finishQuiz">;
  setProgress: Dispatch<SetStateAction<LearnProgress>>;
  nextUrl: string;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => lesson.quiz.map(() => -1));
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const question = lesson.quiz[questionIndex];
  const answer = answers[questionIndex] ?? -1;
  const isCorrect = answer === question.answer;

  useEffect(() => {
    setQuestionIndex(0);
    setAnswers(lesson.quiz.map(() => -1));
    setChecked(false);
    setResult(null);
  }, [lesson.id, lesson.quiz]);

  function advance() {
    if (questionIndex < lesson.quiz.length - 1) {
      setQuestionIndex((index) => index + 1);
      setChecked(false);
      return;
    }
    const score = scoreQuiz(lesson.quiz, answers);
    setResult(score);
    setProgress((current) => recordQuizAttempt(current, {
      courseSlug: course.slug,
      lessonId: lesson.id,
      score,
      total: lesson.quiz.length,
      completedAt: new Date().toISOString(),
    }));
  }

  if (result !== null) {
    const percent = Math.round((result / lesson.quiz.length) * 100);
    return (
      <section className="learn-quiz learn-quiz--result" aria-labelledby="learn-quiz-title">
        <div className="learn-quiz__result-icon" aria-hidden="true"><CircleCheck size={25} /></div>
        <div><p className="eyebrow">{strings.quizComplete}</p><h2 id="learn-quiz-title">{format(strings.score, { score: result, total: lesson.quiz.length, percent })}</h2></div>
        <div className="learn-quiz__result-actions">
          <button className="button button--secondary" type="button" onClick={() => { setAnswers(lesson.quiz.map(() => -1)); setQuestionIndex(0); setChecked(false); setResult(null); }}>{strings.retry}</button>
          <Link className="button button--primary" to={nextUrl}>{strings.continueCourse}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="learn-quiz" aria-labelledby="learn-quiz-title">
      <div className="learn-quiz__topline"><span className="eyebrow">{strings.quiz}</span><span>{format(strings.position, { current: questionIndex + 1, total: lesson.quiz.length })}</span></div>
      <h2 id="learn-quiz-title">{question.prompt[locale]}</h2>
      <fieldset className="learn-quiz__answers" disabled={checked}>
        <legend className="visually-hidden">{question.prompt[locale]}</legend>
        {question.options.map((option, index) => (
          <label className={`learn-quiz__option${answer === index ? " is-selected" : ""}`} key={`${questionIndex}-${index}`}>
            <input type="radio" name={`quiz-${lesson.id}-${questionIndex}`} value={index} checked={answer === index} onChange={() => setAnswers((current) => current.map((value, position) => position === questionIndex ? index : value))} />
            <span>{option[locale]}</span>
          </label>
        ))}
      </fieldset>
      {checked && <div className={`learn-quiz__feedback${isCorrect ? " is-correct" : " is-incorrect"}`} role="status">
        <strong>{isCorrect ? strings.correct : strings.incorrect}</strong><span>{strings.explanation}: {question.explanation[locale]}</span>
      </div>}
      {answer < 0 && !checked && <p className="learn-quiz__hint" aria-live="polite">{strings.chooseAnswer}</p>}
      <div className="learn-quiz__actions">
        {!checked ? <button className="button button--primary" type="button" disabled={answer < 0} onClick={() => setChecked(true)}>{strings.checkAnswer}</button> : <button className="button button--primary" type="button" onClick={advance}>{questionIndex === lesson.quiz.length - 1 ? strings.finishQuiz : strings.nextQuestion}<ArrowRight size={17} aria-hidden="true" /></button>}
      </div>
    </section>
  );
}

export default function LearnPage() {
  const { locale } = useApp();
  const ui = learnUi[locale];
  const { "*": route = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [progress, setProgress] = useState<LearnProgress>(readLearnProgress);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const categoryFilter = searchParams.get("category") ?? "all";
  const view = searchParams.get("view") ?? "browse";
  const [courseSlug, lessonSlug] = route.split("/").filter(Boolean);

  useEffect(() => writeLearnProgress(progress), [progress]);
  useEffect(() => setQuery(searchParams.get("q") ?? ""), [searchParams]);

  const course = courseSlug ? getCourse(courseSlug) : undefined;
  const lessonItem = course && lessonSlug ? getLesson(course, lessonSlug) : undefined;
  const orderedLessons = course ? getCourseLessons(course) : [];
  useEffect(() => {
    if (course && lessonItem) setProgress((current) => recordLessonVisit(current, course.slug, lessonItem.id));
  }, [course, lessonItem]);
  const matchingCourses = useMemo(() => learnCourses.filter((item) => {
    const categoryMatches = categoryFilter === "all" || item.category === categoryFilter;
    return categoryMatches && matchesCourse(item, query, locale);
  }), [categoryFilter, locale, query]);
  const searchedLessons = useMemo(() => query.trim() ? learnCourses.flatMap((item) => item.lessons
    .filter((lesson) => (categoryFilter === "all" || item.category === categoryFilter) && matchesCourse({ ...item, lessons: [lesson] }, query, locale))
    .map((lesson) => ({ course: item, lesson }))) : [], [categoryFilter, locale, query]);

  if (courseSlug && !course) {
    return <div className="app-page learn-page"><div className="learn-empty"><BookOpen size={28} aria-hidden="true" /><h1>{ui.noResults}</h1><Link className="button button--primary" to="/learn">{ui.searchTab}</Link></div></div>;
  }
  if (course && lessonSlug && !lessonItem) {
    return <div className="app-page learn-page"><div className="learn-empty"><BookOpen size={28} aria-hidden="true" /><h1>{ui.noResults}</h1><Link className="button button--primary" to={`/learn/${course.slug}`}>{ui.overview}</Link></div></div>;
  }
  if (course && lessonItem) {
    return <LessonView course={course} lesson={lessonItem} orderedLessons={orderedLessons} progress={progress} setProgress={setProgress} locale={locale} />;
  }
  if (course) {
    return <CourseView course={course} progress={progress} setProgress={setProgress} locale={locale} />;
  }

  if (view === "learning") return <MyLearning progress={progress} locale={locale} />;
  if (view === "bookmarks") return <MyBookmarks progress={progress} locale={locale} />;

  const updateQuery = (value: string) => {
    setQuery(value);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value.trim()) next.set("q", value);
      else next.delete("q");
      return next;
    }, { replace: true });
  };
  const updateCategory = (value: string) => setSearchParams((current) => {
    const next = new URLSearchParams(current);
    if (value === "all") next.delete("category");
    else next.set("category", value);
    return next;
  }, { replace: true });
  const todayIndex = Math.floor(new Date().setHours(0, 0, 0, 0) / 86_400_000) % learnCourses.length;
  const dailyCourse = learnCourses[todayIndex];
  const dailyLesson = getCourseLessons(dailyCourse).find((item) => !progress.completedLessons.includes(item.id)) ?? dailyCourse.lessons[0];
  const hasSearch = Boolean(query.trim()) || categoryFilter !== "all";
  const pathGroups = [
    { title: ui.beginner, icon: Compass, courses: learnCourses.filter((item) => item.level === "Beginner").slice(0, 3) },
    { title: ui.categories, icon: BookOpen, courses: learnCourses.filter((item) => item.category === "Bible") },
    { title: ui.daily, icon: Heart, courses: learnCourses.filter((item) => ["Prayer", "Faith", "Christian Life", "Family"].includes(item.category)) },
  ];

  return (
    <div className="app-page learn-page">
      <header className="learn-hero">
        <div className="learn-hero__copy">
          <p className="eyebrow">{ui.eyebrow}</p>
          <h1>{ui.title}</h1>
          <p>{ui.introduction}</p>
          <div className="learn-hero__actions">
            <a className="button button--primary" href="#learn-courses"><BookOpen size={18} aria-hidden="true" />{ui.searchTab}</a>
            <Link className="button button--secondary" to="/learn?view=learning">{ui.myLearning}</Link>
            <Link className="button button--secondary" to="/learn?view=bookmarks"><Bookmark size={17} aria-hidden="true" />{ui.bookmarks}</Link>
          </div>
        </div>
        <div className="learn-hero__art" aria-hidden="true"><span className="learn-hero__sun" /><BookOpen size={76} strokeWidth={1.2} /><span className="learn-hero__art-label">ANNLITE · LEARN</span></div>
      </header>

      <section className="learn-search-section" aria-label={ui.searchLabel}>
        <label className="learn-search">
          <Search size={20} aria-hidden="true" />
          <span className="visually-hidden">{ui.searchLabel}</span>
          <input type="search" value={query} onChange={(event) => updateQuery(event.target.value)} placeholder={ui.searchPlaceholder} />
          {query && <button type="button" className="learn-search__clear" aria-label={ui.clearSearch} onClick={() => updateQuery("")}>×</button>}
        </label>
        <div className="learn-filter-row" role="group" aria-label={ui.filtersLabel}>
          {(["all", ...learnCategories] as ("all" | LearnCategory)[]).map((category) => {
            const label = category === "all" ? ui.all : ui.categoryNames[category];
            return <button key={category} className={`learn-filter${categoryFilter === category ? " is-selected" : ""}`} type="button" aria-pressed={categoryFilter === category} onClick={() => updateCategory(category)}>{label}</button>;
          })}
        </div>
      </section>

      {hasSearch ? <section className="learn-results" id="learn-courses" aria-live="polite">
        <header className="learn-section-heading"><h2>{ui.results}</h2><span>{matchingCourses.length} · {searchedLessons.length}</span></header>
        {matchingCourses.length || searchedLessons.length ? <>
          {matchingCourses.length > 0 && <div className="learn-course-grid">{matchingCourses.map((item) => <CourseCard key={item.id} course={item} progress={progress} locale={locale} />)}</div>}
          {searchedLessons.length > 0 && <div className="learn-search-lessons">{searchedLessons.map(({ course: item, lesson }) => <LessonLink key={lesson.id} course={item} lesson={lesson} progress={progress} locale={locale} />)}</div>}
        </> : <div className="learn-empty"><Search size={24} aria-hidden="true" /><p>{ui.noResults}</p></div>}
      </section> : <>
        <section className="learn-section" id="learn-courses">
          <header className="learn-section-heading"><div><p className="eyebrow">{ui.recommended}</p><h2>{ui.featured}</h2><p>{ui.featuredCopy}</p></div><Link to="/learn?view=learning">{ui.myLearning}<ArrowRight size={16} aria-hidden="true" /></Link></header>
          <div className="learn-course-grid learn-course-grid--featured">{learnCourses.slice(0, 3).map((item) => <CourseCard key={item.id} course={item} progress={progress} locale={locale} featured />)}</div>
        </section>
        <section className="learn-section">
          <header className="learn-section-heading"><div><p className="eyebrow">{ui.eyebrow}</p><h2>{ui.categories}</h2></div></header>
          <div className="learn-category-grid">{learnCategories.map((category) => <button className="learn-category" key={category} type="button" onClick={() => { updateCategory(category); document.getElementById("learn-courses")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><span>{ui.categoryNames[category]}</span><span>{learnCourses.filter((item) => item.category === category).length}</span><ArrowRight size={16} aria-hidden="true" /></button>)}</div>
        </section>
        <section className="learn-section">
          <header className="learn-section-heading"><div><p className="eyebrow">{ui.recommended}</p><h2>{ui.paths}</h2><p>{ui.pathsCopy}</p></div></header>
          <div className="learn-path-grid">{pathGroups.map((group) => {
            const Icon = group.icon;
            const first = group.courses[0];
            return <article className="learn-path" key={group.title}><span className="learn-path__icon" aria-hidden="true"><Icon size={20} /></span><h3>{group.title}</h3><p>{group.courses.map((item) => item.title[locale]).join(" · ")}</p>{first && <Link to={`/learn/${first.slug}`}>{ui.openCourse}<ArrowRight size={16} aria-hidden="true" /></Link>}</article>;
          })}</div>
        </section>
        <section className="learn-section">
          <header className="learn-section-heading"><div><p className="eyebrow">{ui.beginner}</p><h2>{ui.beginner}</h2><p>{ui.beginnerCopy}</p></div></header>
          <div className="learn-course-grid">{learnCourses.filter((item) => item.level === "Beginner").map((item) => <CourseCard key={item.id} course={item} progress={progress} locale={locale} />)}</div>
        </section>
        <section className="learn-section">
          <header className="learn-section-heading"><div><p className="eyebrow">{ui.recommended}</p><h2>{ui.lessons}</h2></div></header>
          <div className="learn-search-lessons">{learnCourses.slice(0, 4).map((item) => <LessonLink key={item.lessons[0].id} course={item} lesson={item.lessons[0]} progress={progress} locale={locale} />)}</div>
        </section>
        <section className="learn-daily">
          <div className="learn-daily__icon" aria-hidden="true"><Sparkles size={23} /></div>
          <div><p className="eyebrow">{ui.daily}</p><h2>{dailyLesson.title[locale]}</h2><p>{ui.dailyCopy}</p><span>{dailyCourse.title[locale]} · {dailyLesson.references.join(" · ")}</span></div>
          <Link className="button button--primary" to={`/learn/${dailyCourse.slug}/${dailyLesson.slug}`}>{ui.recommended}<ArrowRight size={17} aria-hidden="true" /></Link>
        </section>
      </>}
    </div>
  );
}

function CourseView({ course, progress, setProgress, locale }: { course: LearnCourse; progress: LearnProgress; setProgress: Dispatch<SetStateAction<LearnProgress>>; locale: Locale }) {
  const ui = learnUi[locale];
  const summary = getCourseProgress(course, progress);
  const nextLesson = getCourseLessons(course).find((item) => !progress.completedLessons.includes(item.id)) ?? course.lessons[0];
  const completionDate = progress.completedAtByCourse[course.slug];
  const markCourseLesson = (lesson: LearnLesson) => setProgress((current) => {
    const updated = completeLesson(current, lesson.id);
    const updatedSummary = getCourseProgress(course, updated);
    return updatedSummary.isComplete && !updated.completedAtByCourse[course.slug]
      ? recordCourseCompletion(updated, course.slug, new Date().toISOString())
      : updated;
  });
  return (
    <div className="app-page learn-page">
      <nav className="learn-breadcrumbs" aria-label={ui.courseNavigation}><Link to="/learn"><ArrowLeft size={16} aria-hidden="true" />{ui.searchTab}</Link><ChevronRight size={15} aria-hidden="true" /><span>{course.title[locale]}</span></nav>
      <header className="learn-course-hero"><div><p className="eyebrow">{ui.categoryNames[course.category]} · {ui.levelNames[course.level]}</p><h1>{course.title[locale]}</h1><p>{course.description[locale]}</p><div className="learn-course-hero__meta"><span>{format(ui.moduleCount, { count: course.modules.length })}</span><span>{format(ui.lessonCount, { count: course.lessons.length })}</span></div><Link className="button button--primary" to={`/learn/${course.slug}/${nextLesson.slug}`}>{summary.completedLessons ? ui.continueCourse : ui.startCourse}<ArrowRight size={17} aria-hidden="true" /></Link></div><div className="learn-course-hero__art" aria-hidden="true"><BookOpen size={56} strokeWidth={1.2} /></div></header>
      <section className="learn-course-progress"><div className="learn-section-heading"><div><p className="eyebrow">{ui.progress}</p><h2>{ui.courseProgress}</h2></div><strong>{summary.completedLessons}/{summary.totalLessons}</strong></div><ProgressBar course={course} progress={progress} locale={locale} /></section>
      {summary.isComplete && <section className="learn-completion" aria-live="polite"><CircleCheck size={24} aria-hidden="true" /><div><h2>{ui.courseCompleted}</h2><p>{summary.percent}% · {format(ui.completedModules, { count: summary.completedModules })}: {summary.completedModules}/{summary.totalModules}</p>{completionDate && <p>{format(ui.completionDate, { date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(completionDate)) })}</p>}</div></section>}
      <div className="learn-modules">{course.modules.map((module, index) => {
        const moduleLessons = module.lessonIds.map((id) => course.lessons.find((item) => item.id === id)).filter((item): item is LearnLesson => Boolean(item));
        const done = moduleLessons.length > 0 && moduleLessons.every((item) => progress.completedLessons.includes(item.id));
        return <section className="learn-module" key={module.id}><header><span className="learn-module__number">{done ? <Check size={18} aria-hidden="true" /> : String(index + 1).padStart(2, "0")}</span><div><p className="eyebrow">{ui.module} {index + 1}</p><h2>{module.title[locale]}</h2></div></header><div>{moduleLessons.map((item) => <div key={item.id} className="learn-module__lesson-row"><LessonLink course={course} lesson={item} progress={progress} locale={locale} />{!progress.completedLessons.includes(item.id) && <button type="button" className="learn-complete-quick" onClick={() => markCourseLesson(item)} aria-label={`${ui.markComplete}: ${item.title[locale]}`}><Check size={17} aria-hidden="true" /></button>}</div>)}</div></section>;
      })}</div>
      <section className="learn-course-score"><h2>{ui.quizScores}</h2>{progress.quizAttempts.filter((attempt) => attempt.courseSlug === course.slug).length ? progress.quizAttempts.filter((attempt) => attempt.courseSlug === course.slug).slice(0, 4).map((attempt, index) => {
        const item = course.lessons.find((lesson) => lesson.id === attempt.lessonId);
        return <p key={`${attempt.completedAt}-${index}`}>{item?.title[locale]} · {attempt.score}/{attempt.total} ({Math.round(attempt.score / attempt.total * 100)}%)</p>;
      }) : <p>{ui.noLearning}</p>}</section>
    </div>
  );
}

function LessonView({ course, lesson, orderedLessons, progress, setProgress, locale }: { course: LearnCourse; lesson: LearnLesson; orderedLessons: LearnLesson[]; progress: LearnProgress; setProgress: Dispatch<SetStateAction<LearnProgress>>; locale: Locale }) {
  const ui = learnUi[locale];
  const index = orderedLessons.findIndex((item) => item.id === lesson.id);
  const previous = orderedLessons[index - 1];
  const next = orderedLessons[index + 1];
  const module = course.modules.find((item) => item.lessonIds.includes(lesson.id));
  const isComplete = progress.completedLessons.includes(lesson.id);
  const isBookmarked = progress.bookmarks.includes(lesson.id);
  const lessonUrl = (item: LearnLesson) => `/learn/${course.slug}/${item.slug}`;
  const nextUrl = next ? lessonUrl(next) : `/learn/${course.slug}`;
  const strings = {
    quiz: ui.quiz, quizComplete: ui.quizComplete, score: ui.score, retry: ui.retry, continueCourse: ui.continueCourse,
    position: ui.position, correct: ui.correct, incorrect: ui.incorrect, explanation: ui.explanation, chooseAnswer: ui.chooseAnswer,
    checkAnswer: ui.checkAnswer, nextQuestion: ui.nextQuestion, finishQuiz: ui.finishQuiz,
  };
  function markComplete() {
    setProgress((current) => {
      const updated = completeLesson(current, lesson.id);
      const summary = getCourseProgress(course, updated);
      return summary.isComplete && !updated.completedAtByCourse[course.slug]
        ? recordCourseCompletion(updated, course.slug, new Date().toISOString())
        : updated;
    });
  }
  return (
    <div className="app-page learn-page learn-page--lesson">
      <nav className="learn-breadcrumbs" aria-label={ui.lessonNavigation}><Link to={`/learn/${course.slug}`}><ArrowLeft size={16} aria-hidden="true" />{course.title[locale]}</Link><ChevronRight size={15} aria-hidden="true" /><span>{module?.title[locale]}</span></nav>
      <div className="learn-reading-layout">
        <aside className="learn-reading-sidebar"><p className="eyebrow">{course.title[locale]}</p><ProgressBar course={course} progress={progress} locale={locale} /><ol>{orderedLessons.map((item, itemIndex) => <li key={item.id} className={item.id === lesson.id ? "is-current" : ""}><Link to={lessonUrl(item)} aria-current={item.id === lesson.id ? "step" : undefined}><span>{progress.completedLessons.includes(item.id) ? <Check size={14} aria-label={ui.completed} /> : itemIndex + 1}</span>{item.title[locale]}</Link></li>)}</ol></aside>
        <article className="learn-reading">
          <div className="learn-reading__position"><span>{module?.title[locale]}</span><span>{format(ui.position, { current: index + 1, total: orderedLessons.length })}</span></div>
          <ProgressBar course={course} progress={progress} locale={locale} />
          <header className="learn-reading__heading"><p className="eyebrow">{ui.lesson} {index + 1}</p><h1>{lesson.title[locale]}</h1><p>{lesson.introduction[locale]}</p></header>
          <div className="learn-reading__content">{lesson.content.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph[locale]}</p>)}</div>
          <section className="learn-reading__references"><h2>{ui.references}</h2><ul>{lesson.references.map((reference) => <li key={reference}><Link to={`/bible?query=${encodeURIComponent(reference)}`}>{reference}<ArrowRight size={14} aria-hidden="true" /></Link></li>)}</ul></section>
          <section className="learn-reading__keypoints"><h2>{ui.keyPoints}</h2><ul>{lesson.keyPoints.map((point, pointIndex) => <li key={pointIndex}>{point[locale]}</li>)}</ul></section>
          <section className="learn-reading__reflection"><h2>{ui.reflection}</h2><p>{lesson.reflection[locale]}</p></section>
          <section className="learn-reading__activity"><h2>{ui.activity}</h2><p>{lesson.activity[locale]}</p></section>
          <Quiz key={lesson.id} course={course} lesson={lesson} locale={locale} strings={strings} setProgress={setProgress} nextUrl={nextUrl} />
          <div className="learn-reading__actions">
            <button className="button button--secondary" type="button" aria-pressed={isBookmarked} onClick={() => setProgress((current) => toggleLessonBookmark(current, lesson.id))}><Bookmark size={17} aria-hidden="true" fill={isBookmarked ? "currentColor" : "none"} />{isBookmarked ? ui.bookmarked : ui.bookmark}</button>
            <button className={`button ${isComplete ? "button--secondary" : "button--primary"}`} type="button" disabled={isComplete} onClick={markComplete}>{isComplete ? <Check size={17} aria-hidden="true" /> : <CircleCheck size={17} aria-hidden="true" />}{isComplete ? ui.completed : ui.markComplete}</button>
          </div>
          <nav className="learn-lesson-pagination" aria-label={ui.lessonNavigation}>
            {previous ? <Link className="button button--secondary" to={lessonUrl(previous)}><ArrowLeft size={17} aria-hidden="true" />{ui.previous}<span>{previous.title[locale]}</span></Link> : <Link className="button button--secondary" to={`/learn/${course.slug}`}><ArrowLeft size={17} aria-hidden="true" />{ui.overview}</Link>}
            {next ? <Link className="button button--primary" to={lessonUrl(next)}>{ui.next}<span>{next.title[locale]}</span><ArrowRight size={17} aria-hidden="true" /></Link> : <Link className="button button--primary" to={`/learn/${course.slug}`}>{ui.courseCompleted}<ArrowRight size={17} aria-hidden="true" /></Link>}
          </nav>
        </article>
      </div>
    </div>
  );
}

function MyLearning({ progress, locale }: { progress: LearnProgress; locale: Locale }) {
  const ui = learnUi[locale];
  const active = learnCourses.filter((course) => (progress.startedCourses.includes(course.slug) || getCourseProgress(course, progress).completedLessons > 0) && !getCourseProgress(course, progress).isComplete);
  const complete = learnCourses.filter((course) => getCourseProgress(course, progress).isComplete);
  const recent = progress.recentLessons.slice(0, 6).map(courseForLesson).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return (
    <div className="app-page learn-page">
      <header className="learn-view-heading"><p className="eyebrow">{ui.eyebrow}</p><h1>{ui.myLearning}</h1><p>{ui.introduction}</p><Link to="/learn"><ArrowLeft size={16} aria-hidden="true" />{ui.searchTab}</Link></header>
      <nav className="learn-view-tabs" aria-label={ui.myLearning}><Link to="/learn?view=learning" aria-current="page">{ui.myLearning}</Link><Link to="/learn?view=bookmarks">{ui.bookmarks}</Link></nav>
      {!active.length && !complete.length ? <div className="learn-empty"><BookOpen size={27} aria-hidden="true" /><p>{ui.noLearning}</p><Link className="button button--primary" to="/learn">{ui.searchTab}</Link></div> : <>
        {active.length > 0 && <section className="learn-section"><header className="learn-section-heading"><h2>{ui.activeCourses}</h2></header><div className="learn-course-grid">{active.map((course) => <CourseCard key={course.id} course={course} progress={progress} locale={locale} />)}</div></section>}
        {complete.length > 0 && <section className="learn-section"><header className="learn-section-heading"><h2>{ui.completedCourses}</h2></header><div className="learn-course-grid">{complete.map((course) => <CourseCard key={course.id} course={course} progress={progress} locale={locale} />)}</div></section>}
      </>}
      {recent.length > 0 && <section className="learn-section"><header className="learn-section-heading"><h2>{ui.recentLessons}</h2></header><div className="learn-search-lessons">{recent.map(({ course, lesson }) => <LessonLink key={lesson.id} course={course} lesson={lesson} progress={progress} locale={locale} />)}</div></section>}
      {progress.quizAttempts.length > 0 && <section className="learn-course-score"><h2>{ui.quizScores}</h2>{progress.quizAttempts.slice(0, 10).map((attempt, index) => {
        const item = courseForLesson(attempt.lessonId);
        return <p key={`${attempt.completedAt}-${index}`}>{item?.lesson.title[locale]} · {attempt.score}/{attempt.total} ({Math.round(attempt.score / attempt.total * 100)}%)</p>;
      })}</section>}
    </div>
  );
}

function MyBookmarks({ progress, locale }: { progress: LearnProgress; locale: Locale }) {
  const ui = learnUi[locale];
  const bookmarked = progress.bookmarks.map(courseForLesson).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return (
    <div className="app-page learn-page">
      <header className="learn-view-heading"><p className="eyebrow">{ui.eyebrow}</p><h1>{ui.bookmarks}</h1><p>{ui.noBookmarks}</p><Link to="/learn"><ArrowLeft size={16} aria-hidden="true" />{ui.searchTab}</Link></header>
      <nav className="learn-view-tabs" aria-label={ui.myLearning}><Link to="/learn?view=learning">{ui.myLearning}</Link><Link to="/learn?view=bookmarks" aria-current="page">{ui.bookmarks}</Link></nav>
      {bookmarked.length ? <div className="learn-search-lessons">{bookmarked.map(({ course, lesson }) => <LessonLink key={lesson.id} course={course} lesson={lesson} progress={progress} locale={locale} />)}</div> : <div className="learn-empty"><Bookmark size={25} aria-hidden="true" /><p>{ui.noBookmarks}</p></div>}
    </div>
  );
}