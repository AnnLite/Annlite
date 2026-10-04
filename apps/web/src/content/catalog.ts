export type ScripturePassage = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  reference: string;
  text: string;
};

export const scriptureSource = "World English Bible (WEB), public domain";

export const scripture: ScripturePassage[] = [
  {
    id: "psalm-23-1",
    book: "Psalms",
    chapter: 23,
    verse: 1,
    reference: "Psalm 23:1",
    text: "Yahweh is my shepherd: I shall lack nothing.",
  },
  {
    id: "micah-6-8",
    book: "Micah",
    chapter: 6,
    verse: 8,
    reference: "Micah 6:8",
    text: "He has shown you, O man, what is good. What does Yahweh require of you, but to act justly, to love mercy, and to walk humbly with your God?",
  },
  {
    id: "matthew-11-28",
    book: "Matthew",
    chapter: 11,
    verse: 28,
    reference: "Matthew 11:28",
    text: "Come to me, all you who labor and are heavily burdened, and I will give you rest.",
  },
  {
    id: "romans-12-12",
    book: "Romans",
    chapter: 12,
    verse: 12,
    reference: "Romans 12:12",
    text: "rejoicing in hope; enduring in troubles; continuing steadfastly in prayer;",
  },
  {
    id: "galatians-6-9",
    book: "Galatians",
    chapter: 6,
    verse: 9,
    reference: "Galatians 6:9",
    text: "Let us not be weary in doing good, for we will reap in due season, if we don't give up.",
  },
];

export const quiz = [
  { id: "q1", answer: "quiz.q1a", reference: "Micah 6:8", correct: "quiz.q1a" },
  { id: "q2", answer: "quiz.q2a", reference: "Psalm 23:1", correct: "quiz.q2a" },
  { id: "q3", answer: "quiz.q3a", reference: "Matthew 11:28", correct: "quiz.q3a" },
] as const;

export const learningTopics = [
  "learn.bibleBasics", "learn.faith", "learn.prayer", "learn.jesus", "learn.spirit",
  "learn.life", "learn.relationships", "learn.purpose", "learn.forgiveness", "learn.leadership",
  "learn.stewardship", "learn.service", "learn.youth", "learn.family",
] as const;