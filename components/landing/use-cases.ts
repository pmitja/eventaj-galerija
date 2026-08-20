import type { Locale } from "@/lib/i18n/locale";
import { eventUseCaseGroupsDe, eventUseCasesDe } from "./use-cases-de";
import { eventUseCaseGroupsNl, eventUseCasesNl } from "./use-cases-nl";
import { eventUseCaseGroupsEs, eventUseCasesEs } from "./use-cases-es";
import { eventUseCaseGroupsIt, eventUseCasesIt } from "./use-cases-it";
import { eventUseCaseGroupsFr, eventUseCasesFr } from "./use-cases-fr";

export type EventUseCase = {
  slug: string;
  navTitle: string;
  navDescription: string;
  group: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Overrides the generic benefits pill from the dictionary for this use case. */
  benefitsPill?: string;
  highlights: readonly string[];
  scenarios: readonly string[];
  faq: readonly (readonly [string, string])[];
};

export const eventUseCases = [
  {
    slug: "poroke",
    navTitle: "Poroke",
    navDescription: "Vsi spontani trenutki vajinega dne.",
    group: "Zasebni dogodki",
    eyebrow: "QR galerija za poroke",
    title: "Poročne fotografije vseh gostov v eni galeriji.",
    description:
      "Gostje prek QR kode dodajo spontane fotografije, kratke videe in voščila, ki dopolnijo zgodbo vajinega dne. Po poroki so vsi spomini zbrani na enem mestu.",
    benefitsPill: "Narejeno za poroko",
    highlights: [
      "QR koda za vabila, menije in namizne kartice",
      "Nalaganje brez aplikacije in registracije",
      "Live Slideshow za prikaz fotografij na platnu",
      "ZIP vseh fotografij po dogodku",
    ],
    scenarios: ["civilni obred", "poročno slavje", "dekliščina ali fantovščina", "obletnica poroke"],
    faq: [
      ["Ali Galerija Eventaj nadomesti poročnega fotografa?", "Ne. Profesionalni fotograf poskrbi za ključne trenutke, QR galerija pa zbere spontane utrinke in vsebine gostov."],
      ["Kam lahko postaviva QR kodo?", "Na vabila, dobrodošlico, namizne kartice, meni ali zaslon. Največ fotografij praviloma zberete, če je koda vidna na več mestih."],
    ],
  },
  {
    slug: "rojstni-dnevi",
    navTitle: "Rojstni dnevi",
    navDescription: "Od prve svečke do okroglih jubilejev.",
    group: "Zasebni dogodki",
    eyebrow: "QR galerija za rojstne dneve",
    title: "Vsi utrinki praznovanja. V eni galeriji.",
    description:
      "Ena QR koda zbere fotografije, kratke videe in voščila vseh gostov. Brez iskanja po skupinskih klepetih in naknadnega pošiljanja.",
    benefitsPill: "Narejeno za praznovanje",
    highlights: [
      "Ena povezava za vse generacije gostov",
      "Brez aplikacije, gesel in uporabniških računov",
      "Komentarji in voščila ob fotografijah",
      "Galerija za ogled med praznovanjem in po njem",
    ],
    scenarios: ["otroški rojstni dan", "18. rojstni dan", "okrogli jubilej", "zabava presenečenja"],
    faq: [
      ["Je uporaba dovolj preprosta tudi za starejše goste?", "Da. Gost odpre kamero, skenira QR kodo in vsebino doda neposredno v brskalniku. Aplikacija ali registracija nista potrebni."],
      ["Ali lahko fotografije dodamo tudi dan po praznovanju?", "Da. QR koda oziroma povezava ostane na voljo v času aktivne galerije, zato lahko gostje utrinke dodajo tudi pozneje."],
    ],
  },
  {
    slug: "praznovanja",
    navTitle: "Praznovanja",
    navDescription: "Obletnice, baby showerji in druženja.",
    group: "Zasebni dogodki",
    eyebrow: "QR galerija za praznovanja",
    title: "Vsako praznovanje si zasluži skupen album.",
    description:
      "Od obletnic in družinskih srečanj do baby showerjev. QR galerija zbere fotografije, kratke videe in voščila vseh gostov na enem mestu.",
    benefitsPill: "Narejeno za praznovanja",
    highlights: [
      "Deluje za majhna druženja in večja slavja",
      "Galerija, dostopna prek neposredne povezave ali QR kode",
      "Nadzor nad vidnostjo posameznih fotografij",
      "Vsi spomini pripravljeni za enoten prenos",
    ],
    scenarios: ["baby shower", "obletnica", "družinsko srečanje", "matura ali zaključek šolanja"],
    faq: [
      ["Za katere vrste praznovanj je galerija primerna?", "Za praktično vsak dogodek, kjer več gostov fotografira: obletnice, družinska srečanja, baby showerje, mature in druga slavja."],
      ["Ali je galerija javna?", "Ne. Privzeto ni indeksirana in je dosegljiva samo prek nepredvidljive povezave oziroma QR kode."],
    ],
  },
  {
    slug: "team-building",
    navTitle: "Team buildingi",
    navDescription: "Skupna zgodba ekipe, ujeta sproti.",
    group: "Poslovni dogodki",
    eyebrow: "QR galerija za team buildinge",
    title: "Naj ekipa sama ujame najboljše trenutke dneva.",
    description:
      "Udeleženci sproti soustvarjajo skupno galerijo. Fotografije aktivnosti, ekipnih trenutkov in zakulisja so zbrane za interno komunikacijo ali povzetek dogodka.",
    benefitsPill: "Narejeno za ekipe",
    highlights: [
      "Hiter dostop prek ene QR kode",
      "Live Slideshow za zaključek ali večerno druženje",
      "Administratorski nadzor nad objavljenimi fotografijami",
      "ZIP izvoz za interno komunikacijo in arhiv",
    ],
    scenarios: ["športne aktivnosti", "delavnice", "izleti ekipe", "novoletne zabave"],
    faq: [
      ["Ali lahko galerijo prikažemo na zaslonu med dogodkom?", "Da. Live slideshow lahko odprete na računalniku, priključenem na TV ali projektor."],
      ["Kdo nadzira, katere fotografije so vidne?", "Organizator ima v administraciji pregled nad galerijo in lahko upravlja vidnost posameznih fotografij."],
    ],
  },
  {
    slug: "poslovni-dogodki",
    navTitle: "Poslovni dogodki",
    navDescription: "Srečanja, otvoritve in predstavitve.",
    group: "Poslovni dogodki",
    eyebrow: "QR galerija za poslovne dogodke",
    title: "Vsi pogledi na dogodek. Na enem mestu.",
    description:
      "Udeleženci prek QR kode prispevajo fotografije, kratke videe in odzive. Organizator dobi urejeno zbirko vsebin za interno komunikacijo, povzetek dogodka ali nadaljnjo uporabo.",
    benefitsPill: "Narejeno za poslovne dogodke",
    highlights: [
      "Dostop brez aplikacije za vse udeležence",
      "QR koda na akreditacijah, mizah ali zaslonih",
      "Nadzor nad vidnostjo posameznih fotografij",
      "Enoten izvoz vsebin po dogodku",
    ],
    scenarios: ["predstavitev produkta", "otvoritev", "pop-up dogodek", "poslovno srečanje"],
    faq: [
      ["Ali lahko QR kodo vključimo v obstoječe materiale dogodka?", "Da. Kodo lahko prenesete v SVG ali PNG obliki in jo dodate na akreditacije, plakate, zaslone ali tiskovine."],
      ["Ali lahko vsebino pred prikazom nadzorujemo?", "Da. Organizator upravlja vidnost galerije in posameznih fotografij v administraciji."],
    ],
  },
  {
    slug: "konference-in-sejmi",
    navTitle: "Konference in sejmi",
    navDescription: "Več pogledov na program, ljudi in utrip.",
    group: "Poslovni dogodki",
    eyebrow: "QR galerija za konference in sejme",
    title: "Utrip dogodka skozi oči udeležencev.",
    description:
      "QR koda na akreditaciji, stojnici ali zaslonu poveže vsebine udeležencev v eni galeriji. Fotografije predavanj, mreženja in dogajanja ostanejo zbrane tudi po zaključku dogodka.",
    benefitsPill: "Narejeno za konference in sejme",
    highlights: [
      "Ena vstopna točka za različne dele dogodka",
      "Live Slideshow za oder, avlo ali sejemsko stojnico",
      "Administracija za pregled in nadzor fotografij",
      "Urejen arhiv za povzetek dogodka",
    ],
    scenarios: ["konferenca", "sejem", "kongres", "mreženjski dogodek"],
    faq: [
      ["Kje je QR koda na konferenci najbolj učinkovita?", "Na akreditacijah, programu, uvodnem in zaključnem slajdu, ob vhodu ter na mestih za mreženje."],
      ["Ali je rešitev primerna tudi za večdnevni dogodek?", "Da. Termin dogodka se nastavi ob naročilu, povezava pa lahko spremlja program skozi celotno dogajanje."],
    ],
  },
] as const satisfies readonly EventUseCase[];

export const eventUseCaseGroups = ["Zasebni dogodki", "Poslovni dogodki"] as const;

const eventUseCasesEn = [
  { slug: "poroke", navTitle: "Weddings", navDescription: "Every spontaneous moment from your day.", group: "Private events", eyebrow: "QR gallery for weddings", title: "Collect the wedding photos your photographer didn't take.", description: "Guests scan a QR code to add the spontaneous photos, short videos and messages that complete the story of your day. After the wedding, every memory is gathered in one place.", benefitsPill: "Made for your wedding", highlights: ["QR code for invitations, menus and table cards", "Uploads without an app or registration", "Live Slideshow on the big screen", "A ZIP of all photos after the event"], scenarios: ["civil ceremony", "wedding reception", "hen or stag party", "wedding anniversary"], faq: [["Does Guest Mosaic replace a wedding photographer?", "No. A professional photographer captures the key moments; the QR gallery collects the spontaneous moments and contributions from your guests."], ["Where can we place the QR code?", "On invitations, welcome signs, table cards, menus or screens. You will usually collect more photos when the code is visible in several places."]] },
  { slug: "rojstni-dnevi", navTitle: "Birthdays", navDescription: "From the first candle to milestone celebrations.", group: "Private events", eyebrow: "QR gallery for birthdays", title: "Every moment of the celebration. In one gallery.", description: "One QR code collects photos, short videos and wishes from every guest. No digging through group chats, no chasing people afterwards.", benefitsPill: "Made for the celebration", highlights: ["One link for every generation", "No app, passwords or user accounts", "Comments and wishes alongside photos", "A gallery during and after the celebration"], scenarios: ["children's birthday", "18th birthday", "milestone birthday", "surprise party"], faq: [["Is it simple enough for older guests?", "Yes. A guest opens their camera, scans the QR code and adds their content directly in the browser. No app and no registration."], ["Can guests add photos the next day?", "Yes. The QR code and link remain available while the gallery is active."]] },
  { slug: "praznovanja", navTitle: "Celebrations", navDescription: "Anniversaries, baby showers and get-togethers.", group: "Private events", eyebrow: "QR gallery for celebrations", title: "Every celebration deserves a shared album.", description: "From anniversaries and family reunions to baby showers. The QR gallery collects photos, short videos and wishes from every guest in one place.", benefitsPill: "Made for celebrations", highlights: ["Works for intimate gatherings and large celebrations", "Gallery reachable through a direct link or the QR code", "Control over each photo's visibility", "Every memory ready for one download"], scenarios: ["baby shower", "anniversary", "family reunion", "graduation"], faq: [["Which celebrations is the gallery suitable for?", "Almost any event where several guests take photos: anniversaries, family reunions, baby showers, graduations and other celebrations."], ["Is the gallery public?", "No. It is not indexed by default and is only available through an unpredictable link or QR code."]] },
  { slug: "team-building", navTitle: "Team buildings", navDescription: "Your team's shared story, captured live.", group: "Corporate events", eyebrow: "QR gallery for team buildings", title: "Let your team capture the best moments of the day.", description: "Participants build the shared gallery as the day goes on. Photos of activities, team moments and behind-the-scenes are collected for internal communication or the event recap.", benefitsPill: "Made for teams", highlights: ["Fast access through one QR code", "Live Slideshow for the finale or evening social", "Admin control over published photos", "ZIP export for internal communication and archiving"], scenarios: ["sports activities", "workshops", "team trips", "company parties"], faq: [["Can we show the gallery on a screen during the event?", "Yes. Open the live slideshow on a computer connected to a TV or projector."], ["Who controls which photos are visible?", "The organiser can review the gallery and manage individual photo visibility in the admin portal."]] },
  { slug: "poslovni-dogodki", navTitle: "Corporate events", navDescription: "Meetings, launches and presentations.", group: "Corporate events", eyebrow: "QR gallery for corporate events", title: "Every view of the event. In one place.", description: "Participants contribute photos, short videos and reactions through a QR code. The organiser gets an organised collection for internal communication, the event recap or later use.", benefitsPill: "Made for corporate events", highlights: ["Access without an app for every participant", "QR code on badges, tables or screens", "Control over each photo's visibility", "One export of all content after the event"], scenarios: ["product launch", "opening", "pop-up event", "business meeting"], faq: [["Can the QR code be added to existing event materials?", "Yes. Download it as SVG or PNG and add it to badges, posters, screens or printed materials."], ["Can we moderate content before it appears?", "Yes. The organiser manages gallery and individual photo visibility in the admin portal."]] },
  { slug: "konference-in-sejmi", navTitle: "Conferences and fairs", navDescription: "More perspectives on the programme, people and atmosphere.", group: "Corporate events", eyebrow: "QR gallery for conferences and fairs", title: "The event atmosphere through your participants' eyes.", description: "A QR code on badges, at a stand or on screen brings participants' content together in one gallery. Photos of talks, networking and the venue stay collected after the event too.", benefitsPill: "Made for conferences and fairs", highlights: ["One entry point for different parts of the event", "Live Slideshow for the stage, lobby or stand", "Admin review and photo controls", "Organised archive for the event recap"], scenarios: ["conference", "trade fair", "congress", "networking event"], faq: [["Where is the QR code most effective at a conference?", "On badges, the programme, opening and closing slides, entrances and networking areas."], ["Does it work for a multi-day event?", "Yes. Set the event dates when ordering and use the same link throughout the programme."]] },
] as const satisfies readonly EventUseCase[];

export const eventUseCaseGroupsEn = ["Private events", "Corporate events"] as const;

const USE_CASES_BY_LOCALE: Record<Locale, readonly EventUseCase[]> = {
  sl: eventUseCases,
  en: eventUseCasesEn,
  de: eventUseCasesDe,
  nl: eventUseCasesNl,
  es: eventUseCasesEs,
  it: eventUseCasesIt,
  fr: eventUseCasesFr,
};

const USE_CASE_GROUPS_BY_LOCALE: Record<Locale, readonly string[]> = {
  sl: eventUseCaseGroups,
  en: eventUseCaseGroupsEn,
  de: eventUseCaseGroupsDe,
  nl: eventUseCaseGroupsNl,
  es: eventUseCaseGroupsEs,
  it: eventUseCaseGroupsIt,
  fr: eventUseCaseGroupsFr,
};

export function eventUseCasesFor(locale: Locale): readonly EventUseCase[] {
  return USE_CASES_BY_LOCALE[locale] ?? eventUseCasesEn;
}

export function eventUseCaseGroupsFor(locale: Locale): readonly string[] {
  return USE_CASE_GROUPS_BY_LOCALE[locale] ?? eventUseCaseGroupsEn;
}

export function getEventUseCase(slug: string, locale: Locale = "sl") {
  return eventUseCasesFor(locale).find((item) => item.slug === slug);
}
