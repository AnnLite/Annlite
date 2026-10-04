import type { Locale } from "../i18n";
import type { LearnCategory } from "./learn";

export type LearnStrings = {
  eyebrow: string;
  title: string;
  introduction: string;
  searchLabel: string;
  searchPlaceholder: string;
  clearSearch: string;
  filtersLabel: string;
  all: string;
  featured: string;
  featuredCopy: string;
  categories: string;
  paths: string;
  pathsCopy: string;
  beginner: string;
  beginnerCopy: string;
  lessons: string;
  daily: string;
  dailyCopy: string;
  recommended: string;
  results: string;
  noResults: string;
  openCourse: string;
  startCourse: string;
  continueCourse: string;
  myLearning: string;
  bookmarks: string;
  overview: string;
  progress: string;
  courseProgress: string;
  module: string;
  lesson: string;
  completed: string;
  markComplete: string;
  bookmark: string;
  bookmarked: string;
  previous: string;
  next: string;
  position: string;
  references: string;
  keyPoints: string;
  reflection: string;
  activity: string;
  quiz: string;
  checkAnswer: string;
  chooseAnswer: string;
  correct: string;
  incorrect: string;
  explanation: string;
  nextQuestion: string;
  quizComplete: string;
  score: string;
  retry: string;
  finishQuiz: string;
  noLearning: string;
  noBookmarks: string;
  activeCourses: string;
  completedCourses: string;
  recentLessons: string;
  quizScores: string;
  completedModules: string;
  completionDate: string;
  courseCompleted: string;
  lessonCount: string;
  moduleCount: string;
  duration: string;
  searchTab: string;
  courseNavigation: string;
  lessonNavigation: string;
  categoryNames: Record<LearnCategory, string>;
  levelNames: Record<"Beginner" | "Intermediate" | "Advanced", string>;
};

const en: LearnStrings = {
  eyebrow: "ANNLITE LEARNING CENTER", title: "Learn at your own pace", introduction: "Explore Scripture, Christian practice, and thoughtful ways to live out faith. Each lesson includes references, reflection, a practical step, and a short knowledge check.",
  searchLabel: "Search courses and lessons", searchPlaceholder: "Try prayer, forgiveness, John 3:16…", clearSearch: "Clear search", filtersLabel: "Filter courses by category", all: "All",
  featured: "Featured courses", featuredCopy: "Clear starting points for learning, with room to explore at your own pace.", categories: "Explore by category", paths: "Learning paths", pathsCopy: "Follow a theme across related courses, or choose any lesson that meets you where you are.", beginner: "Start with the basics", beginnerCopy: "New to Christian learning? Begin with these gentle introductions.", lessons: "Featured lessons", daily: "A lesson for today", dailyCopy: "A simple next step, ready when you are.", recommended: "Recommended", results: "Search results", noResults: "No matching courses or lessons. Try another word or category.",
  openCourse: "View course", startCourse: "Start course", continueCourse: "Continue course", myLearning: "My Learning", bookmarks: "My Bookmarks", overview: "Course overview", progress: "Progress", courseProgress: "Course progress", module: "Module", lesson: "Lesson", completed: "Completed", markComplete: "Mark lesson as complete", bookmark: "Bookmark lesson", bookmarked: "Lesson bookmarked", previous: "Previous lesson", next: "Next lesson", position: "Lesson {current} of {total}", references: "Bible references", keyPoints: "Key points", reflection: "Take a moment to reflect", activity: "Put it into practice", quiz: "Knowledge check", checkAnswer: "Check answer", chooseAnswer: "Choose an answer before checking.", correct: "Correct", incorrect: "Not quite", explanation: "Why this answer", nextQuestion: "Next question", quizComplete: "Quiz complete", score: "Score: {score}/{total} ({percent}%)", retry: "Retry quiz", finishQuiz: "See results", noLearning: "Your learning progress will appear here after you complete a lesson.", noBookmarks: "Lessons you bookmark will be gathered here for easy return.", activeCourses: "In progress", completedCourses: "Completed courses", recentLessons: "Recently studied", quizScores: "Quiz results", completedModules: "Modules completed", completionDate: "Completed on {date}", courseCompleted: "Course completed", lessonCount: "{count} lessons", moduleCount: "{count} modules", duration: "About {minutes} minutes", searchTab: "Browse", courseNavigation: "Course navigation", lessonNavigation: "Lesson navigation", categoryNames: { Bible: "Bible", Prayer: "Prayer", Faith: "Faith", "Christian Life": "Christian Life", Family: "Family", Children: "Children", Leadership: "Leadership", Service: "Service" }, levelNames: { Beginner: "Beginner", Intermediate: "Intermediate", Advanced: "Advanced" },
};

const fr: LearnStrings = {
  eyebrow: "CENTRE D’APPRENTISSAGE ANNLITE", title: "Apprendre à votre rythme", introduction: "Explorez les Écritures, la pratique chrétienne et des façons réfléchies de vivre la foi. Chaque leçon propose des références, une réflexion, une mise en pratique et un court questionnaire.",
  searchLabel: "Rechercher des cours et des leçons", searchPlaceholder: "Essayez prière, pardon, Jean 3:16…", clearSearch: "Effacer la recherche", filtersLabel: "Filtrer les cours par thème", all: "Tout",
  featured: "Cours à découvrir", featuredCopy: "Des points de départ clairs pour apprendre et explorer à votre rythme.", categories: "Explorer par thème", paths: "Parcours d’apprentissage", pathsCopy: "Suivez un thème à travers plusieurs cours ou choisissez une leçon selon vos besoins.", beginner: "Commencer par les bases", beginnerCopy: "Vous débutez dans l’apprentissage chrétien ? Découvrez ces introductions accessibles.", lessons: "Leçons à découvrir", daily: "Une leçon pour aujourd’hui", dailyCopy: "Une prochaine étape, quand vous serez prêt.", recommended: "Recommandé", results: "Résultats de recherche", noResults: "Aucun cours ou leçon ne correspond. Essayez un autre mot ou thème.",
  openCourse: "Voir le cours", startCourse: "Commencer le cours", continueCourse: "Continuer le cours", myLearning: "Mon apprentissage", bookmarks: "Mes favoris", overview: "Présentation du cours", progress: "Progression", courseProgress: "Progression du cours", module: "Module", lesson: "Leçon", completed: "Terminé", markComplete: "Marquer la leçon comme terminée", bookmark: "Ajouter la leçon aux favoris", bookmarked: "Leçon ajoutée aux favoris", previous: "Leçon précédente", next: "Leçon suivante", position: "Leçon {current} sur {total}", references: "Références bibliques", keyPoints: "Points clés", reflection: "Un temps de réflexion", activity: "Mise en pratique", quiz: "Vérification des connaissances", checkAnswer: "Vérifier la réponse", chooseAnswer: "Choisissez une réponse avant de vérifier.", correct: "Bonne réponse", incorrect: "Pas tout à fait", explanation: "Explication", nextQuestion: "Question suivante", quizComplete: "Questionnaire terminé", score: "Résultat : {score}/{total} ({percent} %)", retry: "Recommencer", finishQuiz: "Voir le résultat", noLearning: "Votre progression apparaîtra ici après la première leçon terminée.", noBookmarks: "Les leçons ajoutées aux favoris apparaîtront ici.", activeCourses: "En cours", completedCourses: "Cours terminés", recentLessons: "Leçons récentes", quizScores: "Résultats des questionnaires", completedModules: "Modules terminés", completionDate: "Terminé le {date}", courseCompleted: "Cours terminé", lessonCount: "{count} leçons", moduleCount: "{count} modules", duration: "Environ {minutes} minutes", searchTab: "Explorer", courseNavigation: "Navigation du cours", lessonNavigation: "Navigation de la leçon", categoryNames: { Bible: "Bible", Prayer: "Prière", Faith: "Foi", "Christian Life": "Vie chrétienne", Family: "Famille", Children: "Enfants", Leadership: "Leadership", Service: "Service" }, levelNames: { Beginner: "Débutant", Intermediate: "Intermédiaire", Advanced: "Avancé" },
};

const ht: LearnStrings = {
  eyebrow: "SANT APRANTISAJ ANNLITE", title: "Aprann nan ritm pa w", introduction: "Eksplore Ekriti yo, pratik kretyen, ak fason pou viv lafwa avèk refleksyon. Chak leson gen referans, refleksyon, yon aktivite pratik, ak yon ti tès konesans.",
  searchLabel: "Chèche kou ak leson", searchPlaceholder: "Eseye lapriyè, padon, Jan 3:16…", clearSearch: "Efase rechèch la", filtersLabel: "Filtre kou yo dapre kategori", all: "Tout",
  featured: "Kou pou dekouvri", featuredCopy: "Bon kote pou kòmanse aprann epi eksplore nan ritm pa w.", categories: "Eksplore dapre kategori", paths: "Chemen aprantisaj", pathsCopy: "Swiv yon tèm nan plizyè kou, oswa chwazi nenpòt leson ki itil pou ou kounye a.", beginner: "Kòmanse ak baz yo", beginnerCopy: "Ou fèk kòmanse aprann sou Krisyanis? Dekouvri entwodiksyon sa yo.", lessons: "Leson pou dekouvri", daily: "Yon leson pou jodi a", dailyCopy: "Yon pwochen etap ki pare lè ou pare.", recommended: "Nou rekòmande", results: "Rezilta rechèch", noResults: "Pa gen kou oswa leson ki koresponn. Eseye yon lòt mo oswa kategori.",
  openCourse: "Gade kou a", startCourse: "Kòmanse kou a", continueCourse: "Kontinye kou a", myLearning: "Aprantisaj mwen", bookmarks: "Leson mwen make", overview: "Apèsi sou kou a", progress: "Pwogrè", courseProgress: "Pwogrè kou a", module: "Modil", lesson: "Leson", completed: "Fini", markComplete: "Make leson an kòm fini", bookmark: "Make leson an pou pita", bookmarked: "Ou make leson an", previous: "Leson anvan an", next: "Pwochen leson an", position: "Leson {current} sou {total}", references: "Referans nan Labib", keyPoints: "Pwen enpòtan", reflection: "Pran yon ti moman pou reflechi", activity: "Eseye sa nan lavi w", quiz: "Ti tès konesans", checkAnswer: "Verifye repons lan", chooseAnswer: "Chwazi yon repons anvan ou verifye.", correct: "Bon repons", incorrect: "Se pa sa nèt", explanation: "Eksplikasyon", nextQuestion: "Pwochen kesyon", quizComplete: "Tès la fini", score: "Nòt: {score}/{total} ({percent}%)", retry: "Eseye ankò", finishQuiz: "Gade rezilta a", noLearning: "Pwogrè ou ap parèt la apre ou fin yon leson.", noBookmarks: "Leson ou make yo ap parèt la pou w ka jwenn yo fasil.", activeCourses: "Kou w ap fè", completedCourses: "Kou ki fini", recentLessons: "Leson resan", quizScores: "Rezilta tès yo", completedModules: "Modil ki fini", completionDate: "Fini nan dat {date}", courseCompleted: "Kou a fini", lessonCount: "{count} leson", moduleCount: "{count} modil", duration: "Anviwon {minutes} minit", searchTab: "Eksplore", courseNavigation: "Navigasyon kou a", lessonNavigation: "Navigasyon leson an", categoryNames: { Bible: "Labib", Prayer: "Lapriyè", Faith: "Lafwa", "Christian Life": "Lavi kretyen", Family: "Fanmi", Children: "Timoun", Leadership: "Lidèchip", Service: "Sèvis" }, levelNames: { Beginner: "Debitan", Intermediate: "Mwayen", Advanced: "Avanse" },
};

export const learnUi: Record<Locale, LearnStrings> = { en, fr, ht };