export type EventUseCase = {
  slug: string;
  navTitle: string;
  navDescription: string;
  group: "Zasebni dogodki" | "Poslovni dogodki";
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
      ["Ali Eventaj Galerija nadomesti poročnega fotografa?", "Ne. Profesionalni fotograf poskrbi za ključne posnetke, galerija pa zbere spontane trenutke iz perspektive gostov."],
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
      "Od družinskega srečanja do baby showerja: Eventaj Galerija zbere fotografije vseh povabljenih brez zapletenih map, aplikacij ali naknadnega pošiljanja.",
    highlights: [
      "Deluje za majhna druženja in večja slavja",
      "Zasebna, neindeksirana povezava do galerije",
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

export function getEventUseCase(slug: string) {
  return eventUseCases.find((item) => item.slug === slug);
}
