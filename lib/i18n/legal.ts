import type { Locale } from "./locale";

/**
 * Legal copy lives outside the marketing dictionaries: it changes on its own
 * schedule (a version date, reviewed wording) and is rendered by a single
 * generic template, so keeping all seven languages side by side makes drift
 * obvious at a glance.
 *
 * Two placeholders are expanded at render time by `components/legal/legal-text`:
 * `{email}` becomes the support mailto link and `{privacyPolicy}` becomes an
 * internal link to the localized privacy page.
 */

export type LegalSection = {
  heading: string;
  body?: readonly string[];
  items?: readonly string[];
};

export type LegalDocument = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  version: string;
  intro: string;
  sections: readonly LegalSection[];
  notice?: string;
};

export type LegalCopy = {
  back: string;
  privacyPolicyLabel: string;
  privacy: LegalDocument;
  terms: LegalDocument;
};

const sl: LegalCopy = {
  back: "Nazaj na galerijo",
  privacyPolicyLabel: "Politiki zasebnosti",
  privacy: {
    metaTitle: "Zasebnost",
    metaDescription:
      "Kako Guest Mosaic obdeluje podatke organizatorjev in gostov: nameni, ponudniki obdelave, roki hrambe in vaše pravice.",
    eyebrow: "Pravni dokument",
    title: "Politika zasebnosti",
    version: "Različica: 31. julij 2026",
    intro:
      "Ta politika pojasnjuje obdelavo podatkov v Guest Mosaic. Za vprašanja ali uveljavljanje pravic pišite na {email}.",
    sections: [
      {
        heading: "1. Katere podatke obdelujemo",
        items: [
          "podatke organizatorja in naročila, kot so e-pošta, podatki o dogodku in plačilni status;",
          "fotografije, videe, imena datotek, tehnične metapodatke in izbrano dovoljenje za objavo;",
          "tehnične varnostne podatke, kot so čas zahteve, omejeni identifikatorji seje in podatki, potrebni za preprečevanje zlorab;",
          "če je funkcija posebej vključena in je podano soglasje, selfie ter rezultate iskanja po obrazu.",
        ],
      },
      {
        heading: "2. Namen in pravna podlaga",
        body: [
          "Podatke obdelujemo za izvedbo naročene storitve, varno nalaganje in prikaz vsebine, podporo uporabnikom, preprečevanje zlorab ter izpolnjevanje zakonskih obveznosti. Dovoljenje naložnika določa, ali se vsebina sme prikazati v galeriji. Iskanje po obrazu se izvaja le na podlagi ločenega, izrecnega soglasja.",
        ],
      },
      {
        heading: "3. Ponudniki obdelave",
        body: [
          "Za gostovanje, zbirko podatkov, shrambo slik in obdelavo videov uporabljamo Cloudflare. Plačila obdeluje Stripe; Guest Mosaic ne hrani celotnih podatkov plačilne kartice. Posamezne dodatne funkcije lahko uporabljajo dokumentirane zunanje ponudnike pod pogodbenimi in varnostnimi omejitvami.",
        ],
      },
      {
        heading: "4. Hramba",
        body: [
          "Mediji novega dogodka se praviloma hranijo 180 dni po koncu dogodka. Nato izbrišemo slike iz objektne shrambe, videe iz Cloudflare Stream in povezane zapise. Plačilni, računovodski, varnostni ali revizijski zapisi se lahko hranijo dlje, kadar to zahteva zakon ali upravičen interes. Začasni selfieji in biometrične reference imajo krajše, posebej določene roke.",
        ],
      },
      {
        heading: "5. Kdo vidi vsebino",
        body: [
          "Galerija je dostopna osebam z njeno povezavo. Organizator in pooblaščeno osebje lahko upravljata vsebino. Video uporablja podpisano predvajanje; videi se ne prikazujejo v projekciji. Povezave ne objavljajte javno, če tega ne želite.",
        ],
      },
      {
        heading: "6. Vaše pravice",
        body: [
          "Glede na okoliščine lahko zahtevate dostop, popravek, izbris, omejitev ali ugovor obdelavi ter prenosljivost podatkov. Soglasje lahko prekličete brez vpliva na zakonitost pretekle obdelave. Zahtevek pošljite na {email}; za hitrejšo obravnavo navedite dogodek in datoteko.",
        ],
      },
      {
        heading: "7. Varnost in spremembe",
        body: [
          "Uporabljamo nepredvidljive javne identifikatorje, kratkotrajne upload seje, neposredne podpise za nalaganje, omejevanje zahtevkov ter ločevanje podatkov med organizacijami. Politiko lahko posodobimo; na strani vedno objavimo datum veljavne različice.",
        ],
      },
    ],
    notice:
      "Če ste prepričani, da je bila vaša fotografija ali video objavljen brez dovoljenja, nam pišite. Vsebino lahko med preverjanjem takoj skrijemo.",
  },
  terms: {
    metaTitle: "Pogoji uporabe",
    metaDescription:
      "Pogoji uporabe Guest Mosaic: obseg paketa, pravice do vsebine, objava v galeriji, hramba, razpoložljivost in moderacija.",
    eyebrow: "Pravni dokument",
    title: "Pogoji uporabe",
    version: "Različica: 31. julij 2026",
    intro:
      "Ti pogoji urejajo uporabo Guest Mosaic za organizatorje dogodkov in goste, ki prek povezave ali QR kode nalagajo fotografije in videe.",
    sections: [
      {
        heading: "1. Storitev in paket",
        body: [
          "Osnovni paket velja za en dogodek, vključuje neomejeno število gostov, fotografije ter do 20 videov. Dodatek »Neomejeno videov« stane 15 € in je predmet poštene uporabe do 1.000 videov na dogodek. Posamezen video je lahko dolg največ 60 sekund in velik največ 500 MB. Video je prikazan samo v galeriji in se ne vključuje v projekcijo.",
        ],
      },
      {
        heading: "2. Pravice do vsebine",
        body: [
          "Naložnik potrjuje, da je avtor vsebine ali ima dovoljenje za njeno deljenje ter da vsebina ne krši avtorskih, osebnostnih ali drugih pravic. Prepovedane so nezakonite, nasilne, sovražne, spolno eksplicitne, zlonamerne ali tehnično škodljive vsebine.",
        ],
      },
      {
        heading: "3. Objava v galeriji",
        body: [
          "Naložnik pri nalaganju izbere, ali se sme vsebina pokazati v skupni galeriji. Organizator lahko vsebino skrije ali odstrani. Dostop prek nepredvidljive povezave ni enak javni objavi, vendar povezavo lahko prejmejo tudi druge osebe.",
        ],
      },
      {
        heading: "4. Hramba in izbris",
        body: [
          "Vsebina novega dogodka se praviloma hrani 180 dni po koncu dogodka in se nato izbriše iz aktivne hrambe. Organizator mora želene datoteke pravočasno prenesti. Vsebino lahko odstranimo prej zaradi zahtevka upravičene osebe, kršitve pogojev, varnostnega tveganja ali zakonske obveznosti.",
        ],
      },
      {
        heading: "5. Razpoložljivost",
        body: [
          "Storitev zagotavljamo s skrbnostjo, vendar ne jamčimo neprekinjenega delovanja, uspešnega nalaganja iz vsake naprave ali trajne razpoložljivosti vsebine. Pri videu lahko obdelava traja nekaj minut. Organizator naj pomembne datoteke hrani tudi drugje.",
        ],
      },
      {
        heading: "6. Moderacija in preprečevanje zlorab",
        body: [
          "Uporabljamo kratkotrajne upload seje, omejitve vrste, velikosti, trajanja in števila datotek ter lahko uvedemo dodatno omejevanje prometa. Sumljive ali prepovedane vsebine lahko zavrnemo in v obsegu, ki ga zahteva zakon, ohranimo varnostne zapise.",
        ],
      },
      {
        heading: "7. Kontakt",
        body: [
          "Za vprašanja, prijavo vsebine ali zahtevek za izbris pišite na {email}. Podrobnosti o obdelavi osebnih podatkov so v {privacyPolicy}.",
        ],
      },
    ],
  },
};

const en: LegalCopy = {
  back: "Back to gallery",
  privacyPolicyLabel: "Privacy Policy",
  privacy: {
    metaTitle: "Privacy",
    metaDescription:
      "How Guest Mosaic processes organiser and guest data: purposes, processors, retention periods and your rights.",
    eyebrow: "Legal document",
    title: "Privacy Policy",
    version: "Version: 31 July 2026",
    intro:
      "This policy explains how data is processed in Guest Mosaic. For questions or to exercise your rights, email {email}.",
    sections: [
      {
        heading: "1. Data we process",
        items: [
          "organiser and order details, such as email, event information and payment status;",
          "photos, videos, filenames, technical metadata and the chosen publication permission;",
          "technical security data, such as request time, limited session identifiers and information needed to prevent abuse;",
          "where the feature is expressly enabled and consent is given, a selfie and face-search results.",
        ],
      },
      {
        heading: "2. Purpose and legal basis",
        body: [
          "We process data to provide the ordered service, upload and display content securely, support users, prevent abuse and meet legal obligations. The uploader’s permission determines whether content may appear in the gallery. Face search is performed only with separate, explicit consent.",
        ],
      },
      {
        heading: "3. Processors",
        body: [
          "We use Cloudflare for hosting, database, image storage and video processing. Stripe processes payments; Guest Mosaic does not store full card details. Specific optional features may use documented external providers under contractual and security restrictions.",
        ],
      },
      {
        heading: "4. Retention",
        body: [
          "Media from a new event is generally stored for 180 days after the event ends. We then delete images from object storage, videos from Cloudflare Stream and related records. Payment, accounting, security or audit records may be kept longer where required by law or legitimate interest. Temporary selfies and biometric references have shorter, specifically defined periods.",
        ],
      },
      {
        heading: "5. Who can see the content",
        body: [
          "The gallery is available to people who have its link. The organiser and authorised staff can manage content. Video uses signed playback and does not appear in the live display. Do not publish the link publicly unless you intend to.",
        ],
      },
      {
        heading: "6. Your rights",
        body: [
          "Depending on the circumstances, you may request access, correction, deletion, restriction, objection or data portability. You may withdraw consent without affecting the lawfulness of earlier processing. Send requests to {email} and include the event and file for faster handling.",
        ],
      },
      {
        heading: "7. Security and changes",
        body: [
          "We use unpredictable public identifiers, short-lived upload sessions, direct upload signatures, request limiting and separation between organisations. We may update this policy; the current version date is always published here.",
        ],
      },
    ],
    notice:
      "If you believe your photo or video was published without permission, contact us. We can hide the content immediately while we review it.",
  },
  terms: {
    metaTitle: "Terms of Use",
    metaDescription:
      "Guest Mosaic terms of use: package scope, content rights, gallery publication, retention, availability and moderation.",
    eyebrow: "Legal document",
    title: "Terms of Use",
    version: "Version: 31 July 2026",
    intro:
      "These terms govern the use of Guest Mosaic by event organisers and guests who upload photos and videos through a link or QR code.",
    sections: [
      {
        heading: "1. Service and package",
        body: [
          "The basic package applies to one event and includes unlimited guests, photos and up to 20 videos. The “Unlimited videos” add-on costs €15 and is subject to fair use of up to 1,000 videos per event. A video may be no longer than 60 seconds and no larger than 500 MB. Video appears only in the gallery and is not included in the live display.",
        ],
      },
      {
        heading: "2. Content rights",
        body: [
          "Uploaders confirm that they created the content or have permission to share it, and that it does not infringe copyright, privacy or other rights. Illegal, violent, hateful, sexually explicit, malicious or technically harmful content is prohibited.",
        ],
      },
      {
        heading: "3. Gallery publication",
        body: [
          "During upload, the uploader chooses whether content may appear in the shared gallery. The organiser may hide or remove content. Access through an unpredictable link is not the same as public publication, but the link may still be shared with others.",
        ],
      },
      {
        heading: "4. Retention and deletion",
        body: [
          "Content from a new event is generally stored for 180 days after the event ends and is then removed from active storage. The organiser must download wanted files in time. We may remove content earlier following a valid request, a breach of these terms, a security risk or a legal obligation.",
        ],
      },
      {
        heading: "5. Availability",
        body: [
          "We provide the service with reasonable care but do not guarantee uninterrupted operation, successful uploads from every device or permanent content availability. Video processing may take several minutes. Organisers should also keep important files elsewhere.",
        ],
      },
      {
        heading: "6. Moderation and abuse prevention",
        body: [
          "We use short-lived upload sessions, file type, size, duration and count limits, and may apply additional traffic limits. We may reject suspicious or prohibited content and retain security records where required by law.",
        ],
      },
      {
        heading: "7. Contact",
        body: [
          "For questions, content reports or deletion requests, email {email}. Details about personal data processing are in the {privacyPolicy}.",
        ],
      },
    ],
  },
};

const de: LegalCopy = {
  back: "Zurück zur Galerie",
  privacyPolicyLabel: "Datenschutzerklärung",
  privacy: {
    metaTitle: "Datenschutz",
    metaDescription:
      "Wie Guest Mosaic Daten von Veranstaltern und Gästen verarbeitet: Zwecke, Auftragsverarbeiter, Speicherfristen und Ihre Rechte.",
    eyebrow: "Rechtliches Dokument",
    title: "Datenschutzerklärung",
    version: "Fassung: 31. Juli 2026",
    intro:
      "Diese Erklärung beschreibt, wie Daten in Guest Mosaic verarbeitet werden. Bei Fragen oder zur Ausübung Ihrer Rechte schreiben Sie an {email}.",
    sections: [
      {
        heading: "1. Welche Daten wir verarbeiten",
        items: [
          "Angaben zu Veranstalter und Bestellung, etwa E-Mail-Adresse, Eventdaten und Zahlungsstatus;",
          "Fotos, Videos, Dateinamen, technische Metadaten und die gewählte Freigabe zur Veröffentlichung;",
          "technische Sicherheitsdaten wie Zeitpunkt der Anfrage, eingeschränkte Sitzungskennungen und Angaben, die zur Missbrauchsprävention nötig sind;",
          "sofern die Funktion ausdrücklich aktiviert und eine Einwilligung erteilt ist, ein Selfie sowie die Ergebnisse der Gesichtssuche.",
        ],
      },
      {
        heading: "2. Zweck und Rechtsgrundlage",
        body: [
          "Wir verarbeiten Daten, um die bestellte Leistung zu erbringen, Inhalte sicher hochzuladen und anzuzeigen, Nutzerinnen und Nutzer zu unterstützen, Missbrauch zu verhindern und gesetzliche Pflichten zu erfüllen. Die Freigabe der hochladenden Person bestimmt, ob ein Inhalt in der Galerie erscheinen darf. Die Gesichtssuche erfolgt nur auf Grundlage einer gesonderten, ausdrücklichen Einwilligung.",
        ],
      },
      {
        heading: "3. Auftragsverarbeiter",
        body: [
          "Für Hosting, Datenbank, Bildspeicherung und Videoverarbeitung nutzen wir Cloudflare. Zahlungen wickelt Stripe ab; Guest Mosaic speichert keine vollständigen Kartendaten. Einzelne optionale Funktionen können dokumentierte externe Anbieter unter vertraglichen und sicherheitstechnischen Auflagen einsetzen.",
        ],
      },
      {
        heading: "4. Speicherdauer",
        body: [
          "Medien eines neuen Events werden in der Regel 180 Tage nach Eventende gespeichert. Danach löschen wir Bilder aus dem Objektspeicher, Videos aus Cloudflare Stream und die zugehörigen Datensätze. Zahlungs-, Buchhaltungs-, Sicherheits- oder Prüfunterlagen können länger aufbewahrt werden, soweit Gesetz oder berechtigtes Interesse dies verlangen. Temporäre Selfies und biometrische Referenzen haben kürzere, gesondert festgelegte Fristen.",
        ],
      },
      {
        heading: "5. Wer die Inhalte sehen kann",
        body: [
          "Die Galerie ist für Personen zugänglich, die über ihren Link verfügen. Veranstalter und berechtigte Mitarbeitende können Inhalte verwalten. Videos nutzen eine signierte Wiedergabe und erscheinen nicht in der Live-Projektion. Veröffentlichen Sie den Link nicht öffentlich, wenn Sie das nicht beabsichtigen.",
        ],
      },
      {
        heading: "6. Ihre Rechte",
        body: [
          "Je nach Sachlage können Sie Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch sowie Datenübertragbarkeit verlangen. Sie können eine Einwilligung widerrufen, ohne dass die Rechtmäßigkeit der bisherigen Verarbeitung berührt wird. Senden Sie Anfragen an {email} und nennen Sie zur schnelleren Bearbeitung Event und Datei.",
        ],
      },
      {
        heading: "7. Sicherheit und Änderungen",
        body: [
          "Wir verwenden nicht erratbare öffentliche Kennungen, kurzlebige Upload-Sitzungen, direkte Upload-Signaturen, Anfragebegrenzung und eine Trennung zwischen Organisationen. Wir können diese Erklärung aktualisieren; das Datum der geltenden Fassung wird hier stets veröffentlicht.",
        ],
      },
    ],
    notice:
      "Wenn Sie glauben, dass Ihr Foto oder Video ohne Erlaubnis veröffentlicht wurde, schreiben Sie uns. Wir können den Inhalt für die Dauer der Prüfung sofort ausblenden.",
  },
  terms: {
    metaTitle: "Nutzungsbedingungen",
    metaDescription:
      "Nutzungsbedingungen von Guest Mosaic: Leistungsumfang, Rechte an Inhalten, Veröffentlichung in der Galerie, Speicherdauer, Verfügbarkeit und Moderation.",
    eyebrow: "Rechtliches Dokument",
    title: "Nutzungsbedingungen",
    version: "Fassung: 31. Juli 2026",
    intro:
      "Diese Bedingungen regeln die Nutzung von Guest Mosaic durch Veranstalter und Gäste, die über einen Link oder QR-Code Fotos und Videos hochladen.",
    sections: [
      {
        heading: "1. Leistung und Paket",
        body: [
          "Das Basispaket gilt für ein Event und umfasst unbegrenzt Gäste, Fotos sowie bis zu 20 Videos. Die Option „Unbegrenzt Videos“ kostet 15 € und unterliegt einer Fair-Use-Grenze von bis zu 1.000 Videos pro Event. Ein einzelnes Video darf höchstens 60 Sekunden lang und 500 MB groß sein. Videos erscheinen nur in der Galerie und werden nicht in die Live-Projektion aufgenommen.",
        ],
      },
      {
        heading: "2. Rechte an Inhalten",
        body: [
          "Hochladende Personen bestätigen, dass sie den Inhalt selbst erstellt haben oder zur Weitergabe berechtigt sind und dass der Inhalt keine Urheber-, Persönlichkeits- oder sonstigen Rechte verletzt. Rechtswidrige, gewaltverherrlichende, hasserfüllte, sexuell explizite, schädliche oder technisch gefährliche Inhalte sind untersagt.",
        ],
      },
      {
        heading: "3. Veröffentlichung in der Galerie",
        body: [
          "Beim Hochladen wählt die hochladende Person, ob der Inhalt in der gemeinsamen Galerie erscheinen darf. Der Veranstalter kann Inhalte ausblenden oder entfernen. Der Zugang über einen nicht erratbaren Link ist keine öffentliche Veröffentlichung, der Link kann jedoch an weitere Personen gelangen.",
        ],
      },
      {
        heading: "4. Speicherdauer und Löschung",
        body: [
          "Inhalte eines neuen Events werden in der Regel 180 Tage nach Eventende gespeichert und danach aus dem aktiven Speicher entfernt. Der Veranstalter muss gewünschte Dateien rechtzeitig herunterladen. Wir können Inhalte früher entfernen — auf berechtigte Anfrage, bei Verstoß gegen diese Bedingungen, bei Sicherheitsrisiko oder aufgrund einer gesetzlichen Pflicht.",
        ],
      },
      {
        heading: "5. Verfügbarkeit",
        body: [
          "Wir erbringen die Leistung mit angemessener Sorgfalt, garantieren jedoch keinen unterbrechungsfreien Betrieb, keinen erfolgreichen Upload von jedem Gerät und keine dauerhafte Verfügbarkeit der Inhalte. Die Videoverarbeitung kann einige Minuten dauern. Veranstalter sollten wichtige Dateien zusätzlich anderswo sichern.",
        ],
      },
      {
        heading: "6. Moderation und Missbrauchsprävention",
        body: [
          "Wir setzen kurzlebige Upload-Sitzungen sowie Grenzen für Dateityp, Größe, Dauer und Anzahl ein und können zusätzliche Verkehrsbegrenzungen anwenden. Verdächtige oder unzulässige Inhalte können wir ablehnen und Sicherheitsprotokolle in dem gesetzlich vorgeschriebenen Umfang aufbewahren.",
        ],
      },
      {
        heading: "7. Kontakt",
        body: [
          "Bei Fragen, Meldungen zu Inhalten oder Löschanfragen schreiben Sie an {email}. Einzelheiten zur Verarbeitung personenbezogener Daten finden Sie in der {privacyPolicy}.",
        ],
      },
    ],
  },
};

const nl: LegalCopy = {
  back: "Terug naar de galerij",
  privacyPolicyLabel: "Privacyverklaring",
  privacy: {
    metaTitle: "Privacy",
    metaDescription:
      "Hoe Guest Mosaic gegevens van organisatoren en gasten verwerkt: doeleinden, verwerkers, bewaartermijnen en jouw rechten.",
    eyebrow: "Juridisch document",
    title: "Privacyverklaring",
    version: "Versie: 31 juli 2026",
    intro:
      "Deze verklaring legt uit hoe gegevens in Guest Mosaic worden verwerkt. Voor vragen of om je rechten uit te oefenen, mail naar {email}.",
    sections: [
      {
        heading: "1. Welke gegevens we verwerken",
        items: [
          "gegevens van de organisator en de bestelling, zoals e-mailadres, evenementgegevens en betaalstatus;",
          "foto's, video's, bestandsnamen, technische metagegevens en de gekozen toestemming voor publicatie;",
          "technische beveiligingsgegevens zoals het tijdstip van het verzoek, beperkte sessie-identificatoren en gegevens die nodig zijn om misbruik te voorkomen;",
          "als de functie uitdrukkelijk is ingeschakeld en er toestemming is gegeven, een selfie en de resultaten van het zoeken op gezicht.",
        ],
      },
      {
        heading: "2. Doel en rechtsgrond",
        body: [
          "We verwerken gegevens om de bestelde dienst te leveren, content veilig te uploaden en te tonen, gebruikers te ondersteunen, misbruik te voorkomen en aan wettelijke verplichtingen te voldoen. De toestemming van de uploader bepaalt of content in de galerij mag verschijnen. Zoeken op gezicht gebeurt uitsluitend op basis van afzonderlijke, uitdrukkelijke toestemming.",
        ],
      },
      {
        heading: "3. Verwerkers",
        body: [
          "Voor hosting, database, beeldopslag en videoverwerking gebruiken we Cloudflare. Betalingen worden verwerkt door Stripe; Guest Mosaic bewaart geen volledige kaartgegevens. Afzonderlijke optionele functies kunnen gedocumenteerde externe leveranciers inzetten onder contractuele en beveiligingsvoorwaarden.",
        ],
      },
      {
        heading: "4. Bewaartermijn",
        body: [
          "Media van een nieuw evenement worden doorgaans 180 dagen na afloop van het evenement bewaard. Daarna verwijderen we afbeeldingen uit de objectopslag, video's uit Cloudflare Stream en de bijbehorende records. Betaal-, boekhoud-, beveiligings- of auditgegevens kunnen langer worden bewaard als de wet of een gerechtvaardigd belang dat vereist. Tijdelijke selfies en biometrische referenties hebben kortere, specifiek vastgelegde termijnen.",
        ],
      },
      {
        heading: "5. Wie de content kan zien",
        body: [
          "De galerij is toegankelijk voor mensen die over de link beschikken. De organisator en bevoegde medewerkers kunnen content beheren. Video gebruikt ondertekend afspelen en verschijnt niet in de live weergave. Publiceer de link niet openbaar als je dat niet wilt.",
        ],
      },
      {
        heading: "6. Jouw rechten",
        body: [
          "Afhankelijk van de omstandigheden kun je inzage, correctie, verwijdering, beperking, bezwaar of gegevensoverdraagbaarheid vragen. Je kunt toestemming intrekken zonder dat dit de rechtmatigheid van eerdere verwerking aantast. Stuur verzoeken naar {email} en vermeld het evenement en het bestand voor een snellere afhandeling.",
        ],
      },
      {
        heading: "7. Beveiliging en wijzigingen",
        body: [
          "We gebruiken onvoorspelbare openbare identificatoren, kortlopende uploadsessies, directe uploadhandtekeningen, verzoekbeperking en scheiding tussen organisaties. We kunnen deze verklaring bijwerken; de datum van de geldende versie wordt hier altijd gepubliceerd.",
        ],
      },
    ],
    notice:
      "Denk je dat je foto of video zonder toestemming is gepubliceerd, neem dan contact met ons op. We kunnen de content tijdens de beoordeling direct verbergen.",
  },
  terms: {
    metaTitle: "Gebruiksvoorwaarden",
    metaDescription:
      "Gebruiksvoorwaarden van Guest Mosaic: omvang van het pakket, rechten op content, publicatie in de galerij, bewaring, beschikbaarheid en moderatie.",
    eyebrow: "Juridisch document",
    title: "Gebruiksvoorwaarden",
    version: "Versie: 31 juli 2026",
    intro:
      "Deze voorwaarden regelen het gebruik van Guest Mosaic door organisatoren van evenementen en gasten die via een link of QR-code foto's en video's uploaden.",
    sections: [
      {
        heading: "1. Dienst en pakket",
        body: [
          "Het basispakket geldt voor één evenement en omvat onbeperkt gasten, foto's en maximaal 20 video's. De optie “Onbeperkt video's” kost € 15 en kent een fair-use grens van maximaal 1.000 video's per evenement. Eén video mag maximaal 60 seconden duren en 500 MB groot zijn. Video verschijnt alleen in de galerij en wordt niet opgenomen in de live weergave.",
        ],
      },
      {
        heading: "2. Rechten op content",
        body: [
          "Uploaders bevestigen dat ze de content zelf hebben gemaakt of toestemming hebben om die te delen, en dat de content geen auteursrechten, privacy of andere rechten schendt. Illegale, gewelddadige, haatdragende, seksueel expliciete, kwaadaardige of technisch schadelijke content is verboden.",
        ],
      },
      {
        heading: "3. Publicatie in de galerij",
        body: [
          "Bij het uploaden kiest de uploader of de content in de gedeelde galerij mag verschijnen. De organisator kan content verbergen of verwijderen. Toegang via een onvoorspelbare link staat niet gelijk aan openbare publicatie, maar de link kan wel bij anderen terechtkomen.",
        ],
      },
      {
        heading: "4. Bewaring en verwijdering",
        body: [
          "Content van een nieuw evenement wordt doorgaans 180 dagen na afloop bewaard en daarna uit de actieve opslag verwijderd. De organisator moet gewenste bestanden op tijd downloaden. We kunnen content eerder verwijderen na een gegrond verzoek, bij schending van deze voorwaarden, bij een beveiligingsrisico of op grond van een wettelijke verplichting.",
        ],
      },
      {
        heading: "5. Beschikbaarheid",
        body: [
          "We leveren de dienst met redelijke zorg, maar garanderen geen ononderbroken werking, geen geslaagde upload vanaf elk apparaat en geen permanente beschikbaarheid van content. Videoverwerking kan enkele minuten duren. Organisatoren doen er goed aan belangrijke bestanden ook elders te bewaren.",
        ],
      },
      {
        heading: "6. Moderatie en misbruikpreventie",
        body: [
          "We gebruiken kortlopende uploadsessies, limieten op bestandstype, grootte, duur en aantal, en kunnen aanvullende verkeerslimieten toepassen. Verdachte of verboden content kunnen we weigeren en beveiligingsgegevens bewaren voor zover de wet dat vereist.",
        ],
      },
      {
        heading: "7. Contact",
        body: [
          "Voor vragen, meldingen over content of verwijderverzoeken mail je naar {email}. Details over de verwerking van persoonsgegevens staan in de {privacyPolicy}.",
        ],
      },
    ],
  },
};

const es: LegalCopy = {
  back: "Volver a la galería",
  privacyPolicyLabel: "Política de privacidad",
  privacy: {
    metaTitle: "Privacidad",
    metaDescription:
      "Cómo trata Guest Mosaic los datos de organizadores e invitados: finalidades, encargados del tratamiento, plazos de conservación y tus derechos.",
    eyebrow: "Documento legal",
    title: "Política de privacidad",
    version: "Versión: 31 de julio de 2026",
    intro:
      "Esta política explica cómo se tratan los datos en Guest Mosaic. Para cualquier consulta o para ejercer tus derechos, escribe a {email}.",
    sections: [
      {
        heading: "1. Qué datos tratamos",
        items: [
          "datos del organizador y del pedido, como el correo electrónico, la información del evento y el estado del pago;",
          "fotos, vídeos, nombres de archivo, metadatos técnicos y el permiso de publicación elegido;",
          "datos técnicos de seguridad, como la hora de la solicitud, identificadores de sesión limitados e información necesaria para prevenir abusos;",
          "cuando la función está expresamente activada y se ha dado el consentimiento, un selfi y los resultados de la búsqueda por rostro.",
        ],
      },
      {
        heading: "2. Finalidad y base jurídica",
        body: [
          "Tratamos los datos para prestar el servicio contratado, subir y mostrar el contenido de forma segura, dar soporte a los usuarios, prevenir abusos y cumplir obligaciones legales. El permiso de quien sube el contenido determina si este puede aparecer en la galería. La búsqueda por rostro solo se realiza con un consentimiento separado y explícito.",
        ],
      },
      {
        heading: "3. Encargados del tratamiento",
        body: [
          "Utilizamos Cloudflare para el alojamiento, la base de datos, el almacenamiento de imágenes y el procesamiento de vídeo. Stripe procesa los pagos; Guest Mosaic no almacena los datos completos de la tarjeta. Algunas funciones opcionales pueden recurrir a proveedores externos documentados bajo restricciones contractuales y de seguridad.",
        ],
      },
      {
        heading: "4. Conservación",
        body: [
          "Los archivos de un evento nuevo se conservan por lo general durante 180 días tras el final del evento. Después eliminamos las imágenes del almacenamiento de objetos, los vídeos de Cloudflare Stream y los registros asociados. Los registros de pago, contables, de seguridad o de auditoría pueden conservarse más tiempo cuando lo exijan la ley o un interés legítimo. Los selfis temporales y las referencias biométricas tienen plazos más cortos, definidos específicamente.",
        ],
      },
      {
        heading: "5. Quién puede ver el contenido",
        body: [
          "La galería está disponible para quienes disponen de su enlace. El organizador y el personal autorizado pueden gestionar el contenido. El vídeo usa reproducción firmada y no aparece en la proyección en directo. No publiques el enlace en abierto si no es tu intención.",
        ],
      },
      {
        heading: "6. Tus derechos",
        body: [
          "Según las circunstancias, puedes solicitar acceso, rectificación, supresión, limitación, oposición o portabilidad de los datos. Puedes retirar tu consentimiento sin que ello afecte a la licitud del tratamiento anterior. Envía tu solicitud a {email} e indica el evento y el archivo para agilizar la gestión.",
        ],
      },
      {
        heading: "7. Seguridad y cambios",
        body: [
          "Utilizamos identificadores públicos impredecibles, sesiones de subida de corta duración, firmas directas de subida, limitación de solicitudes y separación entre organizaciones. Podemos actualizar esta política; la fecha de la versión vigente se publica siempre aquí.",
        ],
      },
    ],
    notice:
      "Si crees que tu foto o vídeo se ha publicado sin permiso, escríbenos. Podemos ocultar el contenido de inmediato mientras lo revisamos.",
  },
  terms: {
    metaTitle: "Condiciones de uso",
    metaDescription:
      "Condiciones de uso de Guest Mosaic: alcance del paquete, derechos sobre el contenido, publicación en la galería, conservación, disponibilidad y moderación.",
    eyebrow: "Documento legal",
    title: "Condiciones de uso",
    version: "Versión: 31 de julio de 2026",
    intro:
      "Estas condiciones regulan el uso de Guest Mosaic por parte de los organizadores de eventos y de los invitados que suben fotos y vídeos mediante un enlace o un código QR.",
    sections: [
      {
        heading: "1. Servicio y paquete",
        body: [
          "El paquete básico se aplica a un evento e incluye invitados ilimitados, fotos y hasta 20 vídeos. El complemento «Vídeos ilimitados» cuesta 15 € y está sujeto a un uso razonable de hasta 1.000 vídeos por evento. Un vídeo no puede durar más de 60 segundos ni superar los 500 MB. El vídeo aparece únicamente en la galería y no se incluye en la proyección en directo.",
        ],
      },
      {
        heading: "2. Derechos sobre el contenido",
        body: [
          "Quien sube el contenido confirma que lo ha creado o que tiene permiso para compartirlo y que no infringe derechos de autor, de privacidad ni de otro tipo. Queda prohibido el contenido ilegal, violento, que incite al odio, sexualmente explícito, malicioso o técnicamente dañino.",
        ],
      },
      {
        heading: "3. Publicación en la galería",
        body: [
          "Durante la subida, quien sube el contenido elige si este puede aparecer en la galería compartida. El organizador puede ocultarlo o eliminarlo. El acceso mediante un enlace impredecible no equivale a una publicación pública, pero el enlace puede llegar igualmente a otras personas.",
        ],
      },
      {
        heading: "4. Conservación y eliminación",
        body: [
          "El contenido de un evento nuevo se conserva por lo general 180 días tras el final del evento y después se retira del almacenamiento activo. El organizador debe descargar a tiempo los archivos que desee conservar. Podemos retirar contenido antes tras una solicitud fundada, por incumplimiento de estas condiciones, por riesgo de seguridad o por obligación legal.",
        ],
      },
      {
        heading: "5. Disponibilidad",
        body: [
          "Prestamos el servicio con una diligencia razonable, pero no garantizamos un funcionamiento ininterrumpido, ni que la subida funcione desde cualquier dispositivo, ni la disponibilidad permanente del contenido. El procesamiento de vídeo puede tardar varios minutos. Conviene que el organizador guarde también los archivos importantes en otro sitio.",
        ],
      },
      {
        heading: "6. Moderación y prevención de abusos",
        body: [
          "Utilizamos sesiones de subida de corta duración, límites de tipo, tamaño, duración y número de archivos, y podemos aplicar límites de tráfico adicionales. Podemos rechazar contenido sospechoso o prohibido y conservar registros de seguridad en la medida en que lo exija la ley.",
        ],
      },
      {
        heading: "7. Contacto",
        body: [
          "Para consultas, denuncias de contenido o solicitudes de eliminación, escribe a {email}. Los detalles sobre el tratamiento de datos personales están en la {privacyPolicy}.",
        ],
      },
    ],
  },
};

const it: LegalCopy = {
  back: "Torna alla galleria",
  privacyPolicyLabel: "Informativa sulla privacy",
  privacy: {
    metaTitle: "Privacy",
    metaDescription:
      "Come Guest Mosaic tratta i dati di organizzatori e ospiti: finalità, responsabili del trattamento, tempi di conservazione e i tuoi diritti.",
    eyebrow: "Documento legale",
    title: "Informativa sulla privacy",
    version: "Versione: 31 luglio 2026",
    intro:
      "Questa informativa spiega come vengono trattati i dati in Guest Mosaic. Per domande o per esercitare i tuoi diritti scrivi a {email}.",
    sections: [
      {
        heading: "1. Quali dati trattiamo",
        items: [
          "dati dell'organizzatore e dell'ordine, come e-mail, informazioni sull'evento e stato del pagamento;",
          "foto, video, nomi dei file, metadati tecnici e il permesso di pubblicazione scelto;",
          "dati tecnici di sicurezza, come l'orario della richiesta, identificatori di sessione limitati e informazioni necessarie a prevenire abusi;",
          "se la funzione è espressamente attivata ed è stato prestato il consenso, un selfie e i risultati della ricerca per volto.",
        ],
      },
      {
        heading: "2. Finalità e base giuridica",
        body: [
          "Trattiamo i dati per erogare il servizio ordinato, caricare e mostrare i contenuti in sicurezza, assistere gli utenti, prevenire abusi e adempiere agli obblighi di legge. Il permesso di chi carica determina se un contenuto può comparire nella galleria. La ricerca per volto viene effettuata solo con un consenso separato ed esplicito.",
        ],
      },
      {
        heading: "3. Responsabili del trattamento",
        body: [
          "Per hosting, database, archiviazione delle immagini ed elaborazione dei video utilizziamo Cloudflare. I pagamenti sono gestiti da Stripe; Guest Mosaic non conserva i dati completi della carta. Singole funzioni opzionali possono avvalersi di fornitori esterni documentati, entro vincoli contrattuali e di sicurezza.",
        ],
      },
      {
        heading: "4. Conservazione",
        body: [
          "I contenuti multimediali di un nuovo evento vengono di norma conservati per 180 giorni dopo la fine dell'evento. Successivamente eliminiamo le immagini dall'archivio a oggetti, i video da Cloudflare Stream e i record collegati. I registri di pagamento, contabili, di sicurezza o di audit possono essere conservati più a lungo quando lo richiedono la legge o un legittimo interesse. I selfie temporanei e i riferimenti biometrici hanno termini più brevi, definiti in modo specifico.",
        ],
      },
      {
        heading: "5. Chi può vedere i contenuti",
        body: [
          "La galleria è accessibile a chi dispone del relativo link. L'organizzatore e il personale autorizzato possono gestire i contenuti. I video usano una riproduzione firmata e non compaiono nella proiezione dal vivo. Non pubblicare il link in modo aperto se non è tua intenzione.",
        ],
      },
      {
        heading: "6. I tuoi diritti",
        body: [
          "A seconda delle circostanze puoi chiedere accesso, rettifica, cancellazione, limitazione, opposizione o portabilità dei dati. Puoi revocare il consenso senza pregiudicare la liceità del trattamento precedente. Invia la richiesta a {email} indicando evento e file per una gestione più rapida.",
        ],
      },
      {
        heading: "7. Sicurezza e modifiche",
        body: [
          "Utilizziamo identificatori pubblici imprevedibili, sessioni di caricamento di breve durata, firme dirette per il caricamento, limitazione delle richieste e separazione tra organizzazioni. Possiamo aggiornare questa informativa; la data della versione in vigore è sempre pubblicata qui.",
        ],
      },
    ],
    notice:
      "Se ritieni che la tua foto o il tuo video sia stato pubblicato senza permesso, scrivici. Possiamo nascondere subito il contenuto mentre lo verifichiamo.",
  },
  terms: {
    metaTitle: "Condizioni d'uso",
    metaDescription:
      "Condizioni d'uso di Guest Mosaic: contenuto del pacchetto, diritti sui contenuti, pubblicazione in galleria, conservazione, disponibilità e moderazione.",
    eyebrow: "Documento legale",
    title: "Condizioni d'uso",
    version: "Versione: 31 luglio 2026",
    intro:
      "Queste condizioni regolano l'uso di Guest Mosaic da parte degli organizzatori di eventi e degli ospiti che caricano foto e video tramite un link o un codice QR.",
    sections: [
      {
        heading: "1. Servizio e pacchetto",
        body: [
          "Il pacchetto base vale per un evento e comprende ospiti illimitati, foto e fino a 20 video. L'opzione «Video illimitati» costa 15 € ed è soggetta a un uso corretto fino a 1.000 video per evento. Un singolo video può durare al massimo 60 secondi e pesare al massimo 500 MB. Il video compare solo nella galleria e non viene incluso nella proiezione dal vivo.",
        ],
      },
      {
        heading: "2. Diritti sui contenuti",
        body: [
          "Chi carica conferma di aver creato il contenuto o di avere il permesso di condividerlo e che il contenuto non viola diritti d'autore, diritti della persona o altri diritti. Sono vietati contenuti illeciti, violenti, che incitano all'odio, sessualmente espliciti, malevoli o tecnicamente dannosi.",
        ],
      },
      {
        heading: "3. Pubblicazione nella galleria",
        body: [
          "Durante il caricamento chi carica sceglie se il contenuto può comparire nella galleria condivisa. L'organizzatore può nasconderlo o rimuoverlo. L'accesso tramite un link imprevedibile non equivale a una pubblicazione pubblica, ma il link può comunque arrivare ad altre persone.",
        ],
      },
      {
        heading: "4. Conservazione ed eliminazione",
        body: [
          "I contenuti di un nuovo evento vengono di norma conservati per 180 giorni dopo la fine dell'evento e poi rimossi dall'archivio attivo. L'organizzatore deve scaricare per tempo i file desiderati. Possiamo rimuovere i contenuti prima, a seguito di una richiesta fondata, di una violazione di queste condizioni, di un rischio per la sicurezza o di un obbligo di legge.",
        ],
      },
      {
        heading: "5. Disponibilità",
        body: [
          "Eroghiamo il servizio con ragionevole diligenza, ma non garantiamo un funzionamento ininterrotto, il buon esito del caricamento da ogni dispositivo o la disponibilità permanente dei contenuti. L'elaborazione dei video può richiedere alcuni minuti. È bene che l'organizzatore conservi i file importanti anche altrove.",
        ],
      },
      {
        heading: "6. Moderazione e prevenzione degli abusi",
        body: [
          "Utilizziamo sessioni di caricamento di breve durata, limiti di tipo, dimensione, durata e numero dei file e possiamo applicare ulteriori limitazioni del traffico. Possiamo rifiutare contenuti sospetti o vietati e conservare registri di sicurezza nella misura richiesta dalla legge.",
        ],
      },
      {
        heading: "7. Contatti",
        body: [
          "Per domande, segnalazioni di contenuti o richieste di cancellazione scrivi a {email}. I dettagli sul trattamento dei dati personali sono nell'{privacyPolicy}.",
        ],
      },
    ],
  },
};

const fr: LegalCopy = {
  back: "Retour à la galerie",
  privacyPolicyLabel: "Politique de confidentialité",
  privacy: {
    metaTitle: "Confidentialité",
    metaDescription:
      "Comment Guest Mosaic traite les données des organisateurs et des invités : finalités, sous-traitants, durées de conservation et vos droits.",
    eyebrow: "Document juridique",
    title: "Politique de confidentialité",
    version: "Version : 31 juillet 2026",
    intro:
      "Cette politique explique comment les données sont traitées dans Guest Mosaic. Pour toute question ou pour exercer vos droits, écrivez à {email}.",
    sections: [
      {
        heading: "1. Données que nous traitons",
        items: [
          "les informations de l'organisateur et de la commande, comme l'e-mail, les détails de l'événement et le statut du paiement ;",
          "les photos, vidéos, noms de fichiers, métadonnées techniques et l'autorisation de publication choisie ;",
          "les données techniques de sécurité, comme l'heure de la requête, des identifiants de session limités et les informations nécessaires à la prévention des abus ;",
          "lorsque la fonction est expressément activée et que le consentement est donné, un selfie et les résultats de la recherche par visage.",
        ],
      },
      {
        heading: "2. Finalité et base légale",
        body: [
          "Nous traitons les données pour fournir le service commandé, téléverser et afficher les contenus en toute sécurité, assister les utilisateurs, prévenir les abus et respecter nos obligations légales. L'autorisation de la personne qui téléverse détermine si un contenu peut apparaître dans la galerie. La recherche par visage n'est effectuée qu'avec un consentement distinct et explicite.",
        ],
      },
      {
        heading: "3. Sous-traitants",
        body: [
          "Nous utilisons Cloudflare pour l'hébergement, la base de données, le stockage des images et le traitement des vidéos. Stripe traite les paiements ; Guest Mosaic ne conserve pas les données complètes de carte bancaire. Certaines fonctions optionnelles peuvent faire appel à des prestataires externes documentés, dans un cadre contractuel et de sécurité défini.",
        ],
      },
      {
        heading: "4. Conservation",
        body: [
          "Les médias d'un nouvel événement sont en principe conservés 180 jours après la fin de l'événement. Nous supprimons ensuite les images du stockage objet, les vidéos de Cloudflare Stream et les enregistrements associés. Les données de paiement, comptables, de sécurité ou d'audit peuvent être conservées plus longtemps lorsque la loi ou un intérêt légitime l'exige. Les selfies temporaires et les références biométriques ont des durées plus courtes, définies spécifiquement.",
        ],
      },
      {
        heading: "5. Qui peut voir les contenus",
        body: [
          "La galerie est accessible aux personnes qui disposent de son lien. L'organisateur et le personnel autorisé peuvent gérer les contenus. La vidéo utilise une lecture signée et n'apparaît pas dans la projection en direct. Ne publiez pas le lien publiquement si ce n'est pas votre intention.",
        ],
      },
      {
        heading: "6. Vos droits",
        body: [
          "Selon les circonstances, vous pouvez demander l'accès, la rectification, l'effacement, la limitation, l'opposition ou la portabilité des données. Vous pouvez retirer votre consentement sans que cela affecte la licéité du traitement antérieur. Adressez votre demande à {email} en précisant l'événement et le fichier pour un traitement plus rapide.",
        ],
      },
      {
        heading: "7. Sécurité et modifications",
        body: [
          "Nous utilisons des identifiants publics imprévisibles, des sessions de téléversement de courte durée, des signatures de téléversement direct, une limitation des requêtes et une séparation entre les organisations. Nous pouvons mettre à jour cette politique ; la date de la version en vigueur est toujours publiée ici.",
        ],
      },
    ],
    notice:
      "Si vous estimez que votre photo ou votre vidéo a été publiée sans autorisation, écrivez-nous. Nous pouvons masquer le contenu immédiatement le temps de la vérification.",
  },
  terms: {
    metaTitle: "Conditions d'utilisation",
    metaDescription:
      "Conditions d'utilisation de Guest Mosaic : contenu de l'offre, droits sur les contenus, publication dans la galerie, conservation, disponibilité et modération.",
    eyebrow: "Document juridique",
    title: "Conditions d'utilisation",
    version: "Version : 31 juillet 2026",
    intro:
      "Ces conditions régissent l'utilisation de Guest Mosaic par les organisateurs d'événements et les invités qui téléversent des photos et des vidéos via un lien ou un QR code.",
    sections: [
      {
        heading: "1. Service et offre",
        body: [
          "L'offre de base vaut pour un événement et comprend un nombre illimité d'invités, les photos et jusqu'à 20 vidéos. L'option « Vidéos illimitées » coûte 15 € et est soumise à un usage raisonnable pouvant aller jusqu'à 1 000 vidéos par événement. Une vidéo ne peut dépasser 60 secondes ni 500 Mo. La vidéo n'apparaît que dans la galerie et n'est pas incluse dans la projection en direct.",
        ],
      },
      {
        heading: "2. Droits sur les contenus",
        body: [
          "La personne qui téléverse confirme qu'elle a créé le contenu ou qu'elle est autorisée à le partager, et que ce contenu ne porte atteinte ni au droit d'auteur, ni à la vie privée, ni à d'autres droits. Les contenus illégaux, violents, haineux, sexuellement explicites, malveillants ou techniquement nuisibles sont interdits.",
        ],
      },
      {
        heading: "3. Publication dans la galerie",
        body: [
          "Au moment du téléversement, la personne qui téléverse choisit si le contenu peut apparaître dans la galerie partagée. L'organisateur peut le masquer ou le supprimer. L'accès par un lien imprévisible n'équivaut pas à une publication publique, mais le lien peut néanmoins être transmis à d'autres personnes.",
        ],
      },
      {
        heading: "4. Conservation et suppression",
        body: [
          "Les contenus d'un nouvel événement sont en principe conservés 180 jours après la fin de l'événement, puis retirés du stockage actif. L'organisateur doit télécharger à temps les fichiers souhaités. Nous pouvons retirer un contenu plus tôt à la suite d'une demande fondée, d'un manquement à ces conditions, d'un risque de sécurité ou d'une obligation légale.",
        ],
      },
      {
        heading: "5. Disponibilité",
        body: [
          "Nous fournissons le service avec une diligence raisonnable, mais ne garantissons ni un fonctionnement ininterrompu, ni la réussite du téléversement depuis tous les appareils, ni la disponibilité permanente des contenus. Le traitement des vidéos peut prendre plusieurs minutes. L'organisateur a intérêt à conserver les fichiers importants ailleurs également.",
        ],
      },
      {
        heading: "6. Modération et prévention des abus",
        body: [
          "Nous utilisons des sessions de téléversement de courte durée, des limites de type, de taille, de durée et de nombre de fichiers, et pouvons appliquer des limitations de trafic supplémentaires. Nous pouvons refuser des contenus suspects ou interdits et conserver des journaux de sécurité dans la mesure requise par la loi.",
        ],
      },
      {
        heading: "7. Contact",
        body: [
          "Pour toute question, tout signalement de contenu ou toute demande de suppression, écrivez à {email}. Les détails sur le traitement des données personnelles figurent dans la {privacyPolicy}.",
        ],
      },
    ],
  },
};

const LEGAL_COPY: Record<Locale, LegalCopy> = { sl, en, de, nl, es, it, fr };

/** Version date of both documents, used as the sitemap `lastModified`. */
export const LEGAL_LAST_UPDATED = "2026-07-31";

export function getLegalCopy(locale: Locale): LegalCopy {
  return LEGAL_COPY[locale] ?? en;
}
