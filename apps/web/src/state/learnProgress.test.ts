import { beforeEach, describe, expect, test } from "vitest";
import { getCourse, getCourseLessons, learnCourses } from "../content/learn";
import { learnUi } from "../content/learnUi";
import { completeLesson, emptyLearnProgress, getCourseProgress, learnProgressKey, readLearnProgress, recordLessonVisit, recordQuizAttempt, scoreQuiz, toggleLessonBookmark, writeLearnProgress } from "./learnProgress";

describe("Learn catalog", () => {
  test("publishes all eight complete courses with translated lessons and quizzes", () => {
    const expected = [
      "christianity-for-beginners",
      "understanding-the-bible",
      "how-to-pray",
      "christian-values",
      "faith-in-daily-life",
      "jesus-christ-and-his-teachings",
      "building-a-strong-christian-family",
      "bible-basics",
    ];
    expect(learnCourses.map((course) => course.slug)).toEqual(expect.arrayContaining(expected));
    expect(learnCourses).toHaveLength(expected.length);

    for (const course of learnCourses) {
      expect(course.modules.length).toBeGreaterThanOrEqual(2);
      expect(course.lessons.length).toBeGreaterThanOrEqual(2);
      expect(getCourse(course.slug)).toBe(course);
      expect(getCourseLessons(course)).toHaveLength(course.lessons.length);
      for (const lesson of course.lessons) {
        expect(lesson.content.length).toBeGreaterThan(0);
        expect(lesson.references.length).toBeGreaterThan(0);
        expect(lesson.quiz.length).toBeGreaterThanOrEqual(2);
        for (const locale of ["en", "fr", "ht"] as const) {
          expect(lesson.title[locale].trim()).not.toBe("");
          expect(lesson.introduction[locale].trim()).not.toBe("");
          expect(lesson.content.every((paragraph) => paragraph[locale].trim())).toBe(true);
          expect(lesson.reflection[locale].trim()).not.toBe("");
          expect(lesson.activity[locale].trim()).not.toBe("");
          expect(lesson.quiz.every((question) => question.prompt[locale].trim() && question.explanation[locale].trim())).toBe(true);
        }
      }
    }
  });

  test("Learn interface controls and empty states are present in every supported locale", () => {
    for (const locale of ["en", "fr", "ht"] as const) {
      const strings = learnUi[locale];
      expect(strings.title.trim()).not.toBe("");
      expect(strings.searchPlaceholder.trim()).not.toBe("");
      expect(strings.markComplete.trim()).not.toBe("");
      expect(strings.quizComplete.trim()).not.toBe("");
      expect(strings.noLearning.trim()).not.toBe("");
      expect(strings.noBookmarks.trim()).not.toBe("");
      expect(strings.levelNames.Beginner.trim()).not.toBe("");
      expect(Object.values(strings.categoryNames).every((label) => label.trim())).toBe(true);
    }
    expect(learnUi.fr.title).not.toBe(learnUi.en.title);
    expect(learnUi.ht.title).not.toBe(learnUi.en.title);
  });
});

describe("Learn progress", () => {
  beforeEach(() => localStorage.clear());

  test("calculates lesson, module, and course completion from completed lesson IDs", () => {
    const course = getCourse("christianity-for-beginners")!;
    const module = course.modules[0];
    const progress = completeLesson(emptyLearnProgress(), module.lessonIds[0]);
    const partial = getCourseProgress(course, progress);
    expect(partial.completedLessons).toBe(1);
    expect(partial.percent).toBe(25);
    expect(partial.completedModules).toBe(0);
    expect(partial.isComplete).toBe(false);

    const moduleProgress = { ...progress, completedLessons: module.lessonIds };
    expect(getCourseProgress(course, moduleProgress).completedModules).toBe(1);
    const complete = getCourseProgress(course, { ...progress, completedLessons: course.lessons.map((lesson) => lesson.id) });
    expect(complete.percent).toBe(100);
    expect(complete.completedModules).toBe(course.modules.length);
    expect(complete.isComplete).toBe(true);
  });

  test("scores selected answers and records real quiz attempts", () => {
    const lesson = getCourse("how-to-pray")!.lessons[0];
    const answers = lesson.quiz.map((question) => question.answer);
    expect(scoreQuiz(lesson.quiz, answers)).toBe(lesson.quiz.length);
    expect(scoreQuiz(lesson.quiz, answers.map(() => -1))).toBe(0);

    const progress = recordQuizAttempt(emptyLearnProgress(), { courseSlug: "how-to-pray", lessonId: lesson.id, score: 1, total: 2, completedAt: "2026-10-04T12:00:00.000Z" });
    expect(progress.quizAttempts[0].score).toBe(1);
    expect(progress.quizAttempts[0].total).toBe(2);
  });

  test("records the current course and most recently visited lesson", () => {
    const progress = recordLessonVisit(emptyLearnProgress(), "how-to-pray", "prayer-start");
    expect(progress.startedCourses).toEqual(["how-to-pray"]);
    expect(progress.recentLessons).toEqual(["prayer-start"]);
    expect(recordLessonVisit(progress, "how-to-pray", "prayer-start")).toBe(progress);
  });

  test("persists lesson completion and bookmarks across reloads", () => {
    const lessonId = getCourse("bible-basics")!.lessons[0].id;
    let progress = completeLesson(emptyLearnProgress(), lessonId);
    progress = toggleLessonBookmark(progress, lessonId);
    writeLearnProgress(progress);

    expect(localStorage.getItem(learnProgressKey)).toContain(lessonId);
    expect(readLearnProgress()).toEqual(progress);
    expect(toggleLessonBookmark(progress, lessonId).bookmarks).toEqual([]);
  });

  test("ignores malformed stored progress without breaking the reader", () => {
    localStorage.setItem(learnProgressKey, "not-json");
    expect(readLearnProgress()).toEqual(emptyLearnProgress());

    localStorage.setItem(learnProgressKey, JSON.stringify({ completedLessons: [42, "valid"], quizAttempts: [{ score: 90, total: 10 }] }));
    expect(readLearnProgress()).toEqual({ startedCourses: [], recentLessons: [], completedLessons: ["valid"], bookmarks: [], quizAttempts: [], completedAtByCourse: {} });
  });
});