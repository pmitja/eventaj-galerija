export const events = [
  {
    name: "Poroka Ane & Marka",
    date: "18. jul. 2026",
    location: "Vila Široko, Šoštanj",
    status: "Pripravljen",
    statusTone: "prepared",
    photos: "0",
    guests: "12",
    progress: 92,
    accent: "rose",
  },
  {
    name: "Poletni piknik ekipe",
    date: "24. jul. 2026",
    location: "Posestvo Pule, Trebelno",
    status: "Osnutek",
    statusTone: "draft",
    photos: "0",
    guests: "—",
    progress: 58,
    accent: "amber",
  },
  {
    name: "50 let podjetja Lumen",
    date: "3. jul. 2026",
    location: "Cankarjev dom, Ljubljana",
    status: "Zaključen",
    statusTone: "ended",
    photos: "847",
    guests: "219",
    progress: 100,
    accent: "violet",
  },
] as const;

export const activity = [
  {
    title: "Naloženih je bilo 24 novih fotografij",
    detail: "50 let podjetja Lumen",
    time: "pred 12 min",
    icon: "image",
    tone: "rose",
  },
  {
    title: "Galerija je pripravljena za pregled",
    detail: "Obdelava vseh datotek je končana",
    time: "pred 28 min",
    icon: "check",
    tone: "green",
  },
  {
    title: "Dogodek je bil pripravljen",
    detail: "Poroka Ane & Marka",
    time: "včeraj ob 16:42",
    icon: "calendar",
    tone: "blue",
  },
] as const;

export const chartData = [18, 26, 21, 38, 34, 49, 43, 67, 59, 74, 82, 71, 94, 78];
