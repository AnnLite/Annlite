import type { Locale } from "../i18n";

export type Reflection = {
  id: string;
  verseId: string;
  reference: string;
  category: "reflections.category.faith" | "reflections.category.practice" | "reflections.category.hope";
  publishedOn: string;
  title: Record<Locale, string>;
  body: Record<Locale, string>;
};

export const reflections: Reflection[] = [
  {
    id: "steady-good",
    verseId: "galatians-6-9",
    reference: "Galatians 6:9",
    category: "reflections.category.practice",
    publishedOn: "2026-10-04",
    title: {
      en: "The quiet work of doing good",
      fr: "La fidélité dans les gestes simples",
      ht: "Bonte nan ti jès chak jou",
    },
    body: {
      en: "Not every act of care is noticed, and not every good effort brings an immediate result. This passage invites patience without making a promise about timing. Choose one small, honest act of care today because it serves someone, not because it earns recognition.",
      fr: "Tous les gestes de soin ne sont pas remarqués, et tout effort juste ne porte pas un résultat immédiat. Ce passage invite à la patience sans promettre de délai. Choisissez aujourd’hui un petit geste sincère parce qu’il aide quelqu’un, non pour recevoir de la reconnaissance.",
      ht: "Se pa tout jès swen moun remake, epi se pa tout bon efò ki bay rezilta tousuit. Pasaj sa a envite nou pran pasyans san li pa pwomèt yon dat. Chwazi yon ti jès sensè jodi a paske li ede yon moun, pa pou chèche lwanj.",
    },
  },
  {
    id: "room-to-breathe",
    verseId: "psalm-23-1",
    reference: "Psalm 23:1",
    category: "reflections.category.hope",
    publishedOn: "2026-10-04",
    title: {
      en: "Making room to breathe",
      fr: "Faire une place au calme",
      ht: "Fè plas pou pran souf",
    },
    body: {
      en: "A shepherd stays attentive to what a flock needs. The image offers companionship, not a guarantee that life will be free of difficulty. Pause for a breath, name one thing weighing on you, and consider who might walk beside you today.",
      fr: "Un berger reste attentif aux besoins du troupeau. Cette image évoque une présence, pas la garantie d’une vie sans difficulté. Faites une pause, nommez ce qui vous pèse et demandez-vous qui pourrait marcher à vos côtés aujourd’hui.",
      ht: "Yon gadò mouton veye sa twoupo a bezwen. Imaj sa a pale de prezans, li pa pwomèt lavi san difikilte. Pran yon ti souf, nonmen yon bagay k ap peze sou ou, epi reflechi sou kiyès ki ka mache bò kote w jodi a.",
    },
  },
  {
    id: "justice-and-mercy",
    verseId: "micah-6-8",
    reference: "Micah 6:8",
    category: "reflections.category.faith",
    publishedOn: "2026-10-04",
    title: {
      en: "Justice with gentleness",
      fr: "La justice avec douceur",
      ht: "Jistis avèk dousè",
    },
    body: {
      en: "Justice, mercy, and humility belong together. We can seek what is fair while listening carefully to the people affected, and offer kindness without ignoring harm. Ask what one decision today could make more room for dignity and honesty.",
      fr: "Justice, bonté et humilité vont ensemble. Nous pouvons chercher ce qui est juste en écoutant les personnes concernées, et faire preuve de bonté sans minimiser le tort subi. Quelle décision pourrait aujourd’hui laisser plus de place à la dignité et à la vérité ?",
      ht: "Jistis, mizèrikòd, ak imilite mache ansanm. Nou ka chèche sa ki jis pandan n ap koute moun ki konsène yo, epi aji avèk bonte san nou pa inyore mal ki fèt. Ki desizyon jodi a ki ka bay plis plas pou diyite ak verite ?",
    },
  },
];
