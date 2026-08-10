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
      "Gostje skenirajo QR kodo in brez aplikacije dodajo fotografije, ki jih fotograf morda ni ujel. Vidva pa po poroki vse spomine preneseta na enem mestu.",
    highlights: [
      "QR koda za vabila, menije in namizne kartice",
      "Preprosto nalaganje brez registracije gostov",
      "Live slideshow za sprotno dogajanje na platnu",
      "Skupen ZIP vseh fotografij po dogodku",
    ],
    scenarios: ["civilni obred", "poročno slavje", "dekliščina ali fantovščina", "obletnica poroke"],
    faq: [
      ["Ali Galerija Eventaj nadomesti poročnega fotografa?", "Ne. Profesionalni fotograf poskrbi za ključne posnetke, galerija pa zbere spontane trenutke iz perspektive gostov."],
      ["Kam lahko postaviva QR kodo?", "Na vabila, dobrodošlico, namizne kartice, meni ali zaslon. Največ fotografij praviloma zberete, če je koda vidna na več mestih."],
    ],
  },
  {
    slug: "rojstni-dnevi",
    navTitle: "Rojstni dnevi",
    navDescription: "Od prve svečke do okroglih jubilejev.",
    group: "Zasebni dogodki",
    eyebrow: "QR galerija za rojstne dneve",
    title: "Naj praznovanje ostane v spominu vseh.",
    description:
      "Namesto lovljenja fotografij po skupinskih klepetih gostom ponudite eno QR kodo. Vsak doda svoje najljubše utrinke, vi pa prejmete celotno zgodbo praznovanja.",
    highlights: [
      "Ena povezava za vse generacije gostov",
      "Brez aplikacije, gesel in uporabniških računov",
      "Komentarji in voščila ob fotografijah",
      "Galerija za ogled med praznovanjem in po njem",
    ],
    scenarios: ["otroški rojstni dan", "18. rojstni dan", "okrogli jubilej", "zabava presenečenja"],
    faq: [
      ["Je uporaba dovolj preprosta tudi za starejše goste?", "Da. Gost odpre kamero, skenira QR kodo in fotografije izbere neposredno v brskalniku."],
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
      "Od družinskega srečanja do baby showerja: Galerija Eventaj zbere fotografije vseh povabljenih brez zapletenih map, aplikacij ali naknadnega pošiljanja.",
    highlights: [
      "Deluje za majhna druženja in večja slavja",
      "Neindeksirana povezava, dosegljiva samo prek QR kode",
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
      "Udeleženci s telefonom sproti soustvarjajo galerijo. Fotografije aktivnosti, zmag in zakulisja so takoj zbrane za interno objavo ali povzetek dogodka.",
    highlights: [
      "Hiter dostop za vse sodelavce prek ene QR kode",
      "Live slideshow za zaključek ali večerno druženje",
      "Administratorski nadzor nad objavljenimi fotografijami",
      "ZIP za interno komunikacijo in arhiv",
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
    title: "Vsebina udeležencev, zbrana brez lovljenja po kanalih.",
    description:
      "Na predstavitvi, otvoritvi ali pop-up dogodku udeleženci prek QR kode oddajo svoje fotografije. Organizator dobi urejen vir pristnih utrinkov za povzetek in interno rabo.",
    highlights: [
      "Brez nameščanja aplikacije za obiskovalce",
      "QR koda na akreditacijah, mizah ali zaslonih",
      "Nadzor vidnosti za primeren javni prikaz",
      "Centralen prenos gradiva po dogodku",
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
      "QR kodo postavite ob odru, na stojnici ali akreditaciji. Obiskovalci prispevajo fotografije predavanj, mreženja in dogajanja, vsebina pa se zbira v eni nadzorovani galeriji.",
    highlights: [
      "Ena vstopna točka za različne dele dogodka",
      "Live slideshow za oder, avlo ali sejemsko stojnico",
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
  { slug: "poroke", navTitle: "Weddings", navDescription: "Every spontaneous moment from your day.", group: "Private events", eyebrow: "QR gallery for weddings", title: "Every guest's wedding photos in one gallery.", description: "Guests scan a QR code and add the moments your photographer may have missed — with no app. After the wedding, download every memory in one place.", highlights: ["QR code for invitations, menus and table cards", "Simple uploads without guest registration", "Live slideshow throughout the celebration", "One ZIP with all photos after the event"], scenarios: ["civil ceremony", "wedding reception", "hen or stag party", "wedding anniversary"], faq: [["Does Guest Mosaic replace a wedding photographer?", "No. A professional photographer captures the essential moments; the gallery collects spontaneous memories from your guests' perspective."], ["Where can we place the QR code?", "On invitations, welcome signs, table cards, menus or screens. You will usually collect more photos when the code is visible in several places."]] },
  { slug: "rojstni-dnevi", navTitle: "Birthdays", navDescription: "From the first candle to milestone celebrations.", group: "Private events", eyebrow: "QR gallery for birthdays", title: "Keep the whole celebration in everyone's memories.", description: "Give guests one QR code instead of chasing photos through group chats. Everyone adds their favourite moments and you receive the full story of the celebration.", highlights: ["One link for every generation", "No app, passwords or user accounts", "Comments and wishes alongside photos", "A gallery during and after the celebration"], scenarios: ["children's birthday", "18th birthday", "milestone birthday", "surprise party"], faq: [["Is it simple enough for older guests?", "Yes. A guest opens their camera, scans the QR code and selects photos directly in the browser."], ["Can guests add photos the next day?", "Yes. The QR code and link remain available while the gallery is active."]] },
  { slug: "praznovanja", navTitle: "Celebrations", navDescription: "Anniversaries, baby showers and get-togethers.", group: "Private events", eyebrow: "QR gallery for celebrations", title: "Every celebration deserves a shared album.", description: "From a family reunion to a baby shower, Guest Mosaic collects everyone's photos without complicated folders, apps or follow-up messages.", highlights: ["Works for intimate gatherings and large celebrations", "Non-indexed link, reachable only via the QR code", "Control over each photo's visibility", "Every memory ready for one download"], scenarios: ["baby shower", "anniversary", "family reunion", "graduation"], faq: [["Which celebrations is the gallery suitable for?", "Almost any event where several guests take photos: anniversaries, family reunions, baby showers, graduations and other celebrations."], ["Is the gallery public?", "No. It is not indexed by default and is only available through an unpredictable link or QR code."]] },
  { slug: "team-building", navTitle: "Team buildings", navDescription: "Your team's shared story, captured live.", group: "Corporate events", eyebrow: "QR gallery for team buildings", title: "Let your team capture the best moments of the day.", description: "Participants build the gallery together on their phones. Photos of activities, wins and behind-the-scenes moments are collected instantly for internal sharing.", highlights: ["Fast access for everyone through one QR code", "Live slideshow for the finale or evening social", "Admin control over visible photos", "ZIP for internal communication and archiving"], scenarios: ["sports activities", "workshops", "team trips", "company parties"], faq: [["Can we show the gallery on a screen during the event?", "Yes. Open the live slideshow on a computer connected to a TV or projector."], ["Who controls which photos are visible?", "The organiser can review the gallery and manage individual photo visibility in the admin portal."]] },
  { slug: "poslovni-dogodki", navTitle: "Corporate events", navDescription: "Meetings, launches and presentations.", group: "Corporate events", eyebrow: "QR gallery for corporate events", title: "Participant content collected without chasing channels.", description: "At a launch, opening or pop-up, participants submit photos through a QR code. The organiser gets an organised stream of genuine moments for recaps and internal use.", highlights: ["No app installation for visitors", "QR code on badges, tables or screens", "Visibility controls for an appropriate public display", "Central download after the event"], scenarios: ["product launch", "opening", "pop-up event", "business meeting"], faq: [["Can the QR code be added to existing event materials?", "Yes. Download it as SVG or PNG and add it to badges, posters, screens or printed materials."], ["Can we moderate content before it appears?", "Yes. The organiser manages gallery and individual photo visibility in the admin portal."]] },
  { slug: "konference-in-sejmi", navTitle: "Conferences and fairs", navDescription: "More perspectives on the programme, people and atmosphere.", group: "Corporate events", eyebrow: "QR gallery for conferences and fairs", title: "The event atmosphere through your participants' eyes.", description: "Place the QR code near the stage, at a stand or on badges. Visitors contribute photos of talks, networking and the venue to one controlled gallery.", highlights: ["One entry point for different parts of the event", "Live slideshow for the stage, lobby or stand", "Admin review and photo controls", "Organised archive for the event recap"], scenarios: ["conference", "trade fair", "congress", "networking event"], faq: [["Where is the QR code most effective at a conference?", "On badges, the programme, opening and closing slides, entrances and networking areas."], ["Does it work for a multi-day event?", "Yes. Set the event dates when ordering and use the same link throughout the programme."]] },
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
