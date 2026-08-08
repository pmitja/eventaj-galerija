import type { Locale } from "@/lib/i18n/locale";

export const DEMO_EVENT_SLUG = "ana-in-marko";
export const DEMO_EVENT_NAME = "Ana & Marko";

export const demoEventPhotos = [
  {
    id: "demo-1",
    src: "/gallery/ana-marko/photo-1.jpg",
    alt: "Ana in Marko na sprehodu po obredu",
    comments: [
      { id: "demo-comment-1", guestId: "demo-barbara", displayName: "Barbara", body: "Kako čudovit trenutek! Vidva kar žarita.", createdAt: "2026-07-12T18:42:00.000Z" },
      { id: "demo-comment-2", guestId: "demo-luka", displayName: "Luka", body: "Najlepši dan z najboljšo družbo.", createdAt: "2026-07-12T18:47:00.000Z" },
    ],
  },
  {
    id: "demo-2",
    src: "/gallery/ana-marko/photo-2.jpg",
    alt: "Poročna prstana na rokah mladoporočencev",
    comments: [
      { id: "demo-comment-3", guestId: "demo-maja", displayName: "Maja", body: "Prstana sta res čudovita.", createdAt: "2026-07-12T19:03:00.000Z" },
    ],
  },
  {
    id: "demo-3",
    src: "/gallery/ana-marko/photo-3.jpg",
    alt: "Gostje se smejijo med poročno večerjo",
    comments: [
      { id: "demo-comment-4", guestId: "demo-rok", displayName: "Rok", body: "Najboljša družba in najboljši večer!", createdAt: "2026-07-12T20:16:00.000Z" },
    ],
  },
  { id: "demo-4", src: "/gallery/ana-marko/photo-4.jpg", alt: "Nazdravljanje s penino", comments: [] },
  {
    id: "demo-5",
    src: "/gallery/ana-marko/photo-5.jpg",
    alt: "Ana in Marko plešeta",
    comments: [
      { id: "demo-comment-5", guestId: "demo-nina", displayName: "Nina", body: "Ta ples je bil tako lep.", createdAt: "2026-07-12T21:31:00.000Z" },
    ],
  },
  { id: "demo-6", src: "/gallery/ana-marko/photo-6.jpg", alt: "Cvetlični aranžma na poročni mizi", comments: [] },
  { id: "demo-7", src: "/gallery/ana-marko/photo-7.jpg", alt: "Prijatelji se fotografirajo na poroki", comments: [] },
  { id: "demo-8", src: "/gallery/ana-marko/photo-8.jpg", alt: "Poročna torta s cvetjem", comments: [] },
  {
    id: "demo-9",
    src: "/gallery/ana-marko/photo-9.jpg",
    alt: "Gostje plešejo pod lučkami",
    comments: [
      { id: "demo-comment-6", guestId: "demo-tine", displayName: "Tine", body: "Kakšna energija na plesišču!", createdAt: "2026-07-12T23:08:00.000Z" },
    ],
  },
] as const;

const DEMO_COMMENT_BODIES: Record<Locale, Readonly<Record<string, string>>> = {
  sl: {},
  en: {
    "demo-comment-1": "What a beautiful moment! You two are glowing.",
    "demo-comment-2": "The best day with the best company.",
    "demo-comment-3": "The rings are absolutely beautiful.",
    "demo-comment-4": "The best company and the best evening!",
    "demo-comment-5": "That dance was so beautiful.",
    "demo-comment-6": "What energy on the dance floor!",
  },
  de: {
    "demo-comment-1": "Was für ein wunderschöner Moment! Ihr beide strahlt.",
    "demo-comment-2": "Der schönste Tag mit der besten Gesellschaft.",
    "demo-comment-3": "Die Ringe sind wirklich wunderschön.",
    "demo-comment-4": "Die beste Gesellschaft und der schönste Abend!",
    "demo-comment-5": "Dieser Tanz war so schön.",
    "demo-comment-6": "Was für eine Stimmung auf der Tanzfläche!",
  },
  nl: {
    "demo-comment-1": "Wat een prachtig moment! Jullie stralen.",
    "demo-comment-2": "De mooiste dag met het beste gezelschap.",
    "demo-comment-3": "De ringen zijn echt prachtig.",
    "demo-comment-4": "Het beste gezelschap en de mooiste avond!",
    "demo-comment-5": "Die dans was zo mooi.",
    "demo-comment-6": "Wat een energie op de dansvloer!",
  },
  es: {
    "demo-comment-1": "¡Qué momento tan bonito! Los dos estáis radiantes.",
    "demo-comment-2": "El mejor día con la mejor compañía.",
    "demo-comment-3": "Los anillos son realmente preciosos.",
    "demo-comment-4": "¡La mejor compañía y la mejor velada!",
    "demo-comment-5": "Ese baile fue precioso.",
    "demo-comment-6": "¡Qué energía en la pista de baile!",
  },
  it: {
    "demo-comment-1": "Che momento meraviglioso! Siete radiosi.",
    "demo-comment-2": "Il giorno più bello con la compagnia migliore.",
    "demo-comment-3": "Gli anelli sono davvero bellissimi.",
    "demo-comment-4": "La compagnia migliore e la serata più bella!",
    "demo-comment-5": "Quel ballo è stato bellissimo.",
    "demo-comment-6": "Che energia sulla pista da ballo!",
  },
  fr: {
    "demo-comment-1": "Quel magnifique moment ! Vous rayonnez tous les deux.",
    "demo-comment-2": "La plus belle journée avec la meilleure compagnie.",
    "demo-comment-3": "Les alliances sont vraiment magnifiques.",
    "demo-comment-4": "La meilleure compagnie et la plus belle soirée !",
    "demo-comment-5": "Cette danse était si belle.",
    "demo-comment-6": "Quelle ambiance sur la piste de danse !",
  },
};

export function demoEventPhotosFor(locale: Locale) {
  const translatedBodies = DEMO_COMMENT_BODIES[locale];
  return demoEventPhotos.map((photo) => ({
    ...photo,
    comments: photo.comments.map((comment) => ({
      ...comment,
      body: translatedBodies[comment.id] ?? comment.body,
    })),
  }));
}
