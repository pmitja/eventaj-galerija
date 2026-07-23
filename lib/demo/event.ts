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
