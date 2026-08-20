export const howSteps = [
  {
    n: "1",
    title: "Ustvari dogodek",
    description:
      "Po vnosu osnovnih podatkov in zaključenem nakupu je dostop do administracije pripravljen takoj.",
    mobileDescription: "Po vnosu podatkov in nakupu je administracija pripravljena takoj.",
    imageSrc: "/gallery/ana-marko/photo-1.jpg",
    imageAlt: "Fotografija poročnega dogodka",
  },
  {
    n: "2",
    title: "Pripravi QR kodo",
    description:
      "QR koda je na voljo v formatih SVG in PNG. Po dogovoru lahko pripravimo tudi predlogo za tisk.",
    mobileDescription: "QR koda v formatih SVG in PNG; predlogo za tisk pripravimo po dogovoru.",
    imageSrc: "/gallery/ana-marko/photo-3.jpg",
    imageAlt: "Gostje na dogodku",
  },
  {
    n: "3",
    title: "Gostje skenirajo in dodajo vsebino",
    mobileTitle: "Gostje dodajo vsebino",
    description:
      "Fotografije, kratke videe in glasovna voščila dodajo neposredno v brskalniku. Brez aplikacije in brez uporabniškega računa.",
    mobileDescription: "Fotografije, videe in voščila dodajo v brskalniku. Brez aplikacije in računa.",
    imageSrc: "/gallery/ana-marko/photo-6.jpg",
    imageAlt: "Gost uporablja telefon na dogodku",
  },
  {
    n: "4",
    title: "Vse vsebine na enem mestu",
    mobileTitle: "Vse na enem mestu",
    description:
      "Fotografije in videi so zbrani v skupni galeriji. Organizator lahko upravlja vsebine, zažene Live Slideshow in fotografije prenese v ZIP datoteki.",
    mobileDescription: "Vsebine v skupni galeriji, Live Slideshow in prenos fotografij v ZIP.",
    imageSrc: "/gallery/ana-marko/photo-9.jpg",
    imageAlt: "Skupni spomini z dogodka",
  },
] as const;

export const features = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Digitalni album", description: "Fotografije gostov v pregledni skupni galeriji.", mobile: "Fotografije gostov v skupni galeriji." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Kratki videi", description: "Vključenih je do 20 videov, dolgih največ 60 sekund.", mobile: "Do 20 videov, dolgih največ 60 sekund." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "Prenos v ZIP", description: "Vse fotografije lahko organizator prenese tudi v eni ZIP datoteki.", mobile: "Vse fotografije tudi v eni ZIP datoteki." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Brez aplikacije", description: "Vse poteka neposredno v brskalniku. Brez aplikacije in brez uporabniškega računa.", mobile: "Vse v brskalniku, brez aplikacije in računa." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "QR koda", description: "QR koda dogodka je na voljo v formatih SVG in PNG.", mobile: "QR koda v formatih SVG in PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live Slideshow", description: "Novo dodane fotografije se sproti prikazujejo na projektorju ali TV-zaslonu.", mobile: "Nove fotografije sproti na projektorju ali TV-zaslonu." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Komentarji", description: "Gostje lahko ob fotografijah pustijo sporočila, čestitke in odzive.", mobile: "Sporočila, čestitke in odzivi ob fotografijah." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Iskanje fotografij po obrazu", mobileTitle: "Iskanje po obrazu", description: "Selfi pomaga gostu v nekaj sekundah najti fotografije, na katerih se pojavi.", mobile: "Selfi v nekaj sekundah najde fotografije gosta." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "AI tehnično oceni fotografije ter pomaga prepoznati zamegljene in podvojene posnetke.", mobile: "AI tehnično oceni fotografije ter prepozna zamegljene in podvojene." },
] as const;

export const plans = [
  {
    id: "event",
    name: "Galerija dogodka",
    price: "35 €",
    description: "Vse bistvene funkcije za en dogodek",
    features: [
      "QR galerija brez aplikacije",
      "Neomejeno število gostov",
      "Fotografije in komentarji",
      "Glasovna knjiga gostov",
      "Prenos originalnih fotografij",
      "Do 20 videov, dolgih največ 60 sekund",
      "Administracija dogodka in prenos QR kode",
      "Live Slideshow",
      "ZIP izvoz fotografij",
      "Galerija na voljo 180 dni",
    ],
    featured: true,
  },
] as const;

export const addOns = [
  { name: "AI Best Photos", note: "do 3.000 fotografij", price: "+15 €" },
  { name: "Neomejeno videov", note: "po pravilih razumne uporabe, do 1.000 videov", price: "+15 €" },
] as const;

export const faqs = [
  ["Ali morajo gostje namestiti aplikacijo?", "Ne. Gostje skenirajo QR kodo, galerija pa se odpre neposredno v brskalniku. Aplikacija in registracija nista potrebni."],
  ["Kako dobim QR kodo?", "QR kodo dogodka je mogoče v administraciji prenesti v formatih SVG in PNG. Po dogovoru lahko pripravimo tudi predlogo za tisk."],
  ["Ali lahko prenesem fotografije gostov?", "Da. Posamezno fotografijo prenesete neposredno v galeriji. Po zaključku dogodka ZIP z vsemi fotografijami prejmete na e-pošto, pripravite pa ga lahko tudi sami v administracijskem portalu."],
  ["Kako deluje glasovna knjiga gostov?", "Gost v galeriji izbere glasovno voščilo, dovoli mikrofon in posname do dve minuti. Posnetek lahko pred oddajo posluša in ga po potrebi ponovi. Aplikacija in račun nista potrebna."],
  ["Kako dolgo je galerija na voljo?", "Galerija je na voljo 180 dni po dogodku."],
  ["Ali lahko gostje naložijo videe?", "Da, do 20 videov na dogodek. Posamezen video traja največ 60 sekund in meri največ 500 MB. Videi so vidni v galeriji, ne pa v Live Slideshowu. Dodatek za 15 € odpravi omejitev števila videov (razumna uporaba do 1.000 na dogodek)."],
  ["So fotografije zasebne?", "Galerija ni javno indeksirana in ni zaščitena z geslom, zato povezavo delite le z gosti. Organizator lahko kadar koli skrije celotno galerijo ali posamezno fotografijo."],
  ["Ali fotografije uporabljate za marketing?", "Ne. Fotografij, videov in glasovnih voščil vaših gostov nikoli ne uporabimo za promocijo, oglase ali našo spletno stran in jih ne pošiljamo oglaševalskim ali analitičnim orodjem. Vsebina ostane v vaši galeriji, po 180 dneh pa jo izbrišemo."],
  ["Kaj vključuje AI Best Photos?", "Za 15 € na dogodek dodatek tehnično razvrsti kakovost in zazna dvojnike pri največ 3.000 fotografijah. Večje količine pripravimo po meri."],
] as const;

const LOCALE_DATA = {
  sl: { howSteps, features, plans, addOns, faqs },
  en: { howSteps: howStepsEn, features: featuresEn, plans: plansEn, addOns: addOnsEn, faqs: faqsEn },
  de: { howSteps: howStepsDe, features: featuresDe, plans: plansDe, addOns: addOnsDe, faqs: faqsDe },
  nl: { howSteps: howStepsNl, features: featuresNl, plans: plansNl, addOns: addOnsNl, faqs: faqsNl },
  es: { howSteps: howStepsEs, features: featuresEs, plans: plansEs, addOns: addOnsEs, faqs: faqsEs },
  it: { howSteps: howStepsIt, features: featuresIt, plans: plansIt, addOns: addOnsIt, faqs: faqsIt },
  fr: { howSteps: howStepsFr, features: featuresFr, plans: plansFr, addOns: addOnsFr, faqs: faqsFr },
} as const;

export function landingData(locale: Locale) {
  return LOCALE_DATA[locale] ?? LOCALE_DATA.en;
}

import type { Locale } from "@/lib/i18n/locale";
import { addOnsEn, faqsEn, featuresEn, howStepsEn, plansEn } from "./data-en";
import { addOnsDe, faqsDe, featuresDe, howStepsDe, plansDe } from "./data-de";
import { addOnsNl, faqsNl, featuresNl, howStepsNl, plansNl } from "./data-nl";
import { addOnsEs, faqsEs, featuresEs, howStepsEs, plansEs } from "./data-es";
import { addOnsIt, faqsIt, featuresIt, howStepsIt, plansIt } from "./data-it";
import { addOnsFr, faqsFr, featuresFr, howStepsFr, plansFr } from "./data-fr";
