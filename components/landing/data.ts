export const howSteps = [
  {
    n: "1",
    title: "Nastavitev v 2 minutah",
    description:
      "Vnesite ime dogodka, datum in barve. Vaša zasebna spletna galerija je takoj pripravljena — brez tehničnega znanja.",
    mobileDescription:
      "Vnesite ime dogodka, datum in barve. Vaša zasebna galerija je takoj pripravljena.",
    placeholder: "posnetek: obrazec za ustvarjanje dogodka",
  },
  {
    n: "2",
    title: "Natisnite QR kartice ali postavite NFC stojala",
    mobileTitle: "QR kartice ali NFC stojala",
    description:
      "Izberite eno od elegantnih predlog za tisk ali najemite naša NFC stojala — gostje samo prislonijo telefon.",
    mobileDescription:
      "Izberite elegantno predlogo za tisk ali najemite NFC stojala — gostje samo prislonijo telefon.",
    placeholder: "posnetek: QR kartica / NFC stojalo",
  },
  {
    n: "3",
    title: "Gostje skenirajo in naložijo — brez prijave",
    mobileTitle: "Gostje naložijo — brez prijave",
    description:
      "Deluje na vsakem telefonu, brez aplikacije in brez registracije. Tudi babica bo zmogla.",
    mobileDescription:
      "Deluje na vsakem telefonu, brez aplikacije in registracije. Tudi babica bo zmogla.",
    placeholder: "posnetek: gost skenira QR na mizi",
  },
  {
    n: "4",
    title: "Podoživite dogodek že naslednji dan",
    mobileTitle: "Podoživite dogodek naslednji dan",
    description:
      "Vsi trenutki na enem mestu. Prenesite vse fotografije v ZIP ali pustite AI, da izbere najboljše.",
    mobileDescription:
      "Vsi trenutki na enem mestu. Prenesite ZIP ali pustite AI, da izbere najboljše.",
    placeholder: "posnetek: galerija po dogodku",
  },
] as const;

export const features = [
  { glyph: "▣", title: "Digitalni album", description: "Vse fotografije in videi gostov v elegantni skupni galeriji.", mobile: "Vse fotografije in videi gostov v skupni galeriji." },
  { glyph: "⤓", title: "Prenos v ZIP", description: "Z enim klikom prenesite vse posnetke v polni ločljivosti.", mobile: "Vsi posnetki v polni ločljivosti z enim klikom." },
  { glyph: "◎", title: "Brez aplikacije", description: "Gostje sodelujejo v brskalniku — brez namestitev in prijav.", mobile: "Vse poteka v brskalniku, brez prijav." },
  { glyph: "▦", title: "QR kode za tisk", mobileTitle: "QR kode", description: "Prenesi QR kodo dogodka v SVG ali PNG obliki.", mobile: "QR kode dogodka v SVG ali PNG obliki." },
  { glyph: "◉", title: "NFC stojala", description: "Gostje samo prislonijo telefon — še hitreje kot QR.", mobile: "Gostje samo prislonijo telefon." },
  { glyph: "▶", title: "Live foto zid", description: "Fotografije v živo na projektorju ali TV zaslonu.", mobile: "Fotografije v živo na projektorju ali TV." },
  { glyph: "✎", title: "Besedila in čestitke", description: "Gostje lahko fotografijam dodajo sporočila in voščila.", mobile: "Sporočila in voščila ob fotografijah." },
  { glyph: "◆", title: "Zasebno in varno", description: "Galerija je dostopna samo vašim gostom, vi odločate o vidnosti.", mobile: "Dostop samo za vaše goste." },
] as const;

export const testimonials = [
  { quote: "»Fotograf ne more biti povsod — gostje pa so. Dobili sva na stotine iskrenih trenutkov, ki bi jih sicer nikoli ne videla.«", initials: "AK", name: "Ana K.", event: "Poroka, Bled" },
  { quote: "»Postavitev je vzela dve minuti, NFC stojala pa so bila hit večera. Tudi starejši gostje so brez težav naložili fotografije.«", initials: "MZ", name: "Marko Z.", event: "Abraham, Maribor" },
  { quote: "»Live slideshow na platnu je popolnoma spremenil vzdušje konference. Udeleženci so sami polnili galerijo ves dan.«", initials: "NP", name: "Nina P.", event: "Poslovni dogodek, Ljubljana" },
] as const;

export const comparison = [
  ["Brez aplikacije in registracije", "✓", "✓"],
  ["Podpora v slovenščini", "✓", "✕"],
  ["NFC stojala z najemom", "✓", "✕"],
  ["AI izbor najboljših fotografij", "✓", "✕"],
  ["Integracija s photo boothom", "✓", "✕"],
  ["Live slideshow v realnem času", "✓", "doplačilo"],
] as const;

export const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "19 €",
    description: "Za manjša praznovanja",
    features: ["QR galerija", "NFC podpora", "Upload fotografij in videov", "Javna galerija", "Administracijski portal"],
  },
  {
    id: "advanced",
    name: "Advanced",
    price: "39 €",
    description: "Za poroke in večje dogodke",
    lead: "Vse iz paketa Basic +",
    features: ["AI Best Photos", "Samodejno označevanje zamegljenih", "Prenos samo najboljših fotografij"],
    featured: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "99 €",
    description: "Popolna izkušnja brez kompromisov",
    lead: "Vse iz paketa Advanced +",
    features: ["AI Face Collections", "Live Slideshow"],
  },
] as const;

export const addOns = [
  ["AI Face Collections", "+15 €"],
  ["Live Slideshow", "+40 €"],
  ["Podaljšana hramba galerije", "+10 €"],
  ["Prenos vseh fotografij v ZIP", "+5 €"],
  ["Dodatni administratorji", "+10 €"],
] as const;

export const faqs = [
  ["Ali morajo gostje namestiti aplikacijo?", "Ne. Gostje skenirajo QR kodo ali prislonijo telefon na NFC stojalo in galerija se odpre v brskalniku. Brez namestitev, brez registracije."],
  ["Ali lahko prenesem vse fotografije gostov?", "Da. V administracijskem portalu z enim klikom prenesete vse fotografije in videe v ZIP datoteki, v polni ločljivosti."],
  ["Kako dolgo je galerija na voljo?", "Galerija je aktivna 3 mesece po dogodku. S paketom »Podaljšana hramba« jo lahko podaljšate za 12 mesecev."],
  ["So fotografije zasebne?", "Da. Galerija je dostopna samo prek vaše QR kode oziroma povezave. Kot organizator lahko kadar koli skrijete ali izbrišete posamezne posnetke."],
  ["Kaj če dogodek traja več dni?", "Ni težav — ena galerija lahko pokriva celoten dogodek, ne glede na trajanje. Fotografije se samodejno razvrstijo po dnevih."],
  ["Že imamo fotografa — ali to sploh potrebujemo?", "Fotograf ujame uradne trenutke, gostje pa vse ostalo: priprave, mize, zabavo do jutranjih ur. Njegove fotografije lahko kasneje dodate v isto galerijo."],
] as const;
