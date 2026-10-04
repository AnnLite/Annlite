import type { LearnCourse, LearnQuestion } from "../content/learn";

export type QuizAttempt = {
  courseSlug: string;
  lessonId: string;
  score: number;
  total: number;
  completedAt: string;
};

export type LearnProgress = {
  startedCourses: string[];
  recentLessons: string[];
  completedLessons: string[];
  bookmarks: string[];
  quizAttempts: QuizAttempt[];
  completedAtByCourse: Record<string, string>;
};

export type CourseProgress = {
  completedLessons: number;
  totalLessons: number;
  percent: number;
  completedModules: number;
  totalModules: number;
  isComplete: boolean;
};

export const learnProgressKey = "annlite.learn.progress.v1";

export function emptyLearnProgress(): LearnProgress {
  return { startedCourses: [], recentLessons: [], completedLessons: [], bookmarks: [], quizAttempts: [], completedAtByCourse: {} };
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readLearnProgress(storage = getStorage()): LearnProgress {
  if (!storage) return emptyLearnProgress();
  try {
    const value: unknown = JSON.parse(storage.getItem(learnProgressKey) ?? "null");
    if (!isRecord(value)) return emptyLearnProgress();
    const attempts = Array.isArray(value.quizAttempts) ? value.quizAttempts.filter((attempt): attempt is QuizAttempt =>
      isRecord(attempt) && typeof attempt.courseSlug === "string" && typeof attempt.lessonId === "string" &&
      Number.isInteger(attempt.score) && Number.isInteger(attempt.total) && Number(attempt.total) > 0 &&
      Number(attempt.score) >= 0 && Number(attempt.score) <= Number(attempt.total) && typeof attempt.completedAt === "string",
    ).slice(0, 500) : [];
    const completedAtByCourse: Record<string, string> = {};
    if (isRecord(value.completedAtByCourse)) {
      for (const [slug, date] of Object.entries(value.completedAtByCourse)) {
        if (typeof date === "string") completedAtByCourse[slug] = date;
      }
    }
    return {
      startedCourses: Array.isArray(value.startedCourses) ? value.startedCourses.filter((slug): slug is string => typeof slug === "string") : [],
      recentLessons: Array.isArray(value.recentLessons) ? value.recentLessons.filter((id): id is string => typeof id === "string").slice(0, 50) : [],
      completedLessons: Array.isArray(value.completedLessons) ? value.completedLessons.filter((id): id is string => typeof id === "string") : [],
      bookmarks: Array.isArray(value.bookmarks) ? value.bookmarks.filter((id): id is string => typeof id === "string") : [],
      quizAttempts: attempts,
      completedAtByCourse,
    };
  } catch {
    return emptyLearnProgress();
  }
}

export function writeLearnProgress(progress: LearnProgress, storage = getStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(learnProgressKey, JSON.stringify(progress));
  } catch {
    // Storage quota or privacy settings should not interrupt a learning session.
  }
}

export function getCourseProgress(course: LearnCourse, progress: LearnProgress): CourseProgress {
  const complete = new Set(progress.completedLessons);
  const totalLessons = course.lessons.length;
  const completedLessons = course.lessons.filter((item) => complete.has(item.id)).length;
  const completedModules = course.modules.filter((module) => module.lessonIds.length > 0 && module.lessonIds.every((id) => complete.has(id))).length;
  return {
    completedLessons,
    totalLessons,
    percent: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
    completedModules,
    totalModules: course.modules.length,
    isComplete: totalLessons > 0 && completedLessons === totalLessons,
  };
}

export function scoreQuiz(questions: LearnQuestion[], answers: number[]): number {
  return questions.reduce((score, item, index) => score + (answers[index] === item.answer ? 1 : 0), 0);
}

export function completeLesson(progress: LearnProgress, lessonId: string): LearnProgress {
  return progress.completedLessons.includes(lessonId)
    ? progress
    : { ...progress, completedLessons: [...progress.completedLessons, lessonId] };
}

export function recordLessonVisit(progress: LearnProgress, courseSlug: string, lessonId: string): LearnProgress {
  if (progress.startedCourses.includes(courseSlug) && progress.recentLessons[0] === lessonId) return progress;
  return {
    ...progress,
    startedCourses: progress.startedCourses.includes(courseSlug) ? progress.startedCourses : [...progress.startedCourses, courseSlug],
    recentLessons: [lessonId, ...progress.recentLessons.filter((id) => id !== lessonId)].slice(0, 50),
  };
}

export function toggleLessonBookmark(progress: LearnProgress, lessonId: string): LearnProgress {
  return {
    ...progress,
    bookmarks: progress.bookmarks.includes(lessonId)
      ? progress.bookmarks.filter((id) => id !== lessonId)
      : [lessonId, ...progress.bookmarks],
  };
}

export function recordQuizAttempt(progress: LearnProgress, attempt: QuizAttempt): LearnProgress {
  const quizAttempts = [attempt, ...progress.quizAttempts].slice(0, 500);
  return { ...progress, quizAttempts };
}

export function recordCourseCompletion(progress: LearnProgress, courseSlug: string, completedAt: string): LearnProgress {
  return { ...progress, completedAtByCourse: { ...progress.completedAtByCourse, [courseSlug]: completedAt } };
}