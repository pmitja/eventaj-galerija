import Image from "next/image";
import type { Locale } from "@/lib/i18n/locale";
import { localizedMarketingScreenshot } from "@/lib/i18n/marketing-assets";

type ShowcaseRow = {
  pill: string;
  title: string;
  mobileTitle?: string;
  description: string;
  mobileDescription?: string;
  checks?: string[];
  imageSrc: string;
  imageAlt: string;
  /** true = screenshot on the left, copy on the right */
  flip?: boolean;
  /** soft tinted panel behind the screenshot (for the identity card) */
  tint?: boolean;
};

const rowsSl: ShowcaseRow[] = [
  {
    pill: "Sodelovanje gostov",
    title: "Komentarji, všečki in voščila",
    description:
      "Gostje lahko ob fotografijah pustijo sporočilo, čestitko ali srček. Tako fotografije in odzivi ostanejo skupaj tudi po dogodku.",
    mobileDescription: "Gostje ob fotografijah pustijo sporočilo, čestitko ali srček — vse ostane skupaj.",
    checks: ["Sporočila ob fotografijah", "Srčki za najljubše utrinke", "Vse zbrano na enem mestu"],
    imageSrc: "/marketing/screenshots/comments-desktop.png",
    imageAlt: "Galerija dogodka z odprtim oknom komentarjev",
  },
  {
    pill: "Brez prijave",
    title: "Sodelovanje v nekaj sekundah",
    description:
      "Gost skenira QR kodo, vpiše ime ali vzdevek in začne sodelovati. Brez aplikacije, računa ali gesla.",
    mobileDescription: "Gost skenira QR kodo, vpiše ime in začne sodelovati. Brez aplikacije, računa ali gesla.",
    checks: ["Brez namestitve aplikacije", "Brez registracije in gesla", "Deluje v mobilnem brskalniku"],
    imageSrc: "/marketing/screenshots/identity-gate.png",
    imageAlt: "Okno za vpis imena gosta v galeriji dogodka",
    flip: true,
    tint: true,
  },
  {
    pill: "Dostava",
    title: "Vse povezave na enem mestu",
    description:
      "Po nakupu na e-pošto prispejo QR koda ter povezavi do galerije in prikaza v živo. Po zaključku dogodka je na voljo tudi ZIP izvoz fotografij.",
    mobileDescription: "Po nakupu prispejo QR koda in povezavi, po dogodku pa ZIP izvoz fotografij.",
    checks: ["QR koda in povezavi takoj po nakupu", "Prikaz v živo z enim klikom", "ZIP izvoz fotografij po dogodku"],
    imageSrc: "/marketing/screenshots/email-qr.png",
    imageAlt: "E-poštno sporočilo z QR kodo dogodka",
  },
];

const rowsEn: ShowcaseRow[] = [
  { pill: "Guest participation", title: "Comments, likes and wishes", description: "Guests can leave a message, a wish or a heart alongside your photos. That way the photos and the responses stay together after the event too.", mobileDescription: "Guests leave a message, a wish or a heart alongside photos — it all stays together.", checks: ["Messages alongside photos", "Hearts for favourite moments", "Everything gathered in one place"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Event gallery with the comments panel open" },
  { pill: "No sign-in", title: "Joining takes seconds", description: "A guest scans the QR code, enters a name or nickname and starts taking part. No app, account or password.", mobileDescription: "A guest scans the QR code, enters a name and starts taking part. No app, account or password.", checks: ["No app installation", "No registration or password", "Works in a mobile browser"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Guest name entry in an event gallery", flip: true, tint: true },
  { pill: "Delivery", title: "All your links in one place", description: "After purchase, the QR code and links to the gallery and the live display arrive by email. Once the event ends, a ZIP export of the photos is available too.", mobileDescription: "The QR code and links arrive after purchase, and a ZIP export of the photos after the event.", checks: ["QR code and links right after purchase", "Live display in one click", "ZIP export of the photos after the event"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "Email containing an event QR code" },
];

const rowsDe: ShowcaseRow[] = [
  { pill: "Beteiligung der Gäste", title: "Kommentare, Likes und Glückwünsche", description: "Ihre Gäste können zu den Fotos eine Nachricht, einen Glückwunsch oder ein Herz hinterlassen. So bleiben Fotos und Reaktionen auch nach dem Event zusammen.", mobileDescription: "Gäste hinterlassen zu den Fotos eine Nachricht, einen Glückwunsch oder ein Herz — alles bleibt zusammen.", checks: ["Nachrichten zu den Fotos", "Herzen für die schönsten Momente", "Alles an einem Ort gesammelt"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Event-Galerie mit geöffnetem Kommentarbereich" },
  { pill: "Ohne Anmeldung", title: "In Sekunden dabei", description: "Ein Gast scannt den QR-Code, gibt einen Namen oder Spitznamen ein und macht mit. Keine App, kein Konto, kein Passwort.", mobileDescription: "Ein Gast scannt den QR-Code, gibt einen Namen ein und macht mit. Keine App, kein Konto, kein Passwort.", checks: ["Keine App-Installation", "Keine Registrierung und kein Passwort", "Funktioniert im mobilen Browser"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Eingabe des Gästenamens in einer Event-Galerie", flip: true, tint: true },
  { pill: "Zustellung", title: "Alle Links an einem Ort", description: "Nach dem Kauf kommen der QR-Code sowie die Links zur Galerie und zur Live-Anzeige per E-Mail. Nach dem Ende des Events steht zusätzlich ein ZIP-Export der Fotos bereit.", mobileDescription: "Nach dem Kauf QR-Code und Links, nach dem Event ein ZIP-Export der Fotos.", checks: ["QR-Code und Links sofort nach dem Kauf", "Live-Anzeige mit einem Klick", "ZIP-Export der Fotos nach dem Event"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "E-Mail mit dem QR-Code des Events" },
];
const rowsNl: ShowcaseRow[] = [
  { pill: "Deelname van gasten", title: "Reacties, likes en wensen", description: "Gasten kunnen bij de foto's een bericht, een wens of een hartje achterlaten. Zo blijven de foto's en de reacties ook na afloop bij elkaar.", mobileDescription: "Gasten laten bij de foto's een bericht, een wens of een hartje achter — alles blijft bij elkaar.", checks: ["Berichten bij de foto's", "Hartjes voor favoriete momenten", "Alles op één plek verzameld"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Evenementgalerij met het reactiepaneel open" },
  { pill: "Zonder inloggen", title: "In enkele seconden meedoen", description: "Een gast scant de QR-code, vult een naam of bijnaam in en doet mee. Geen app, account of wachtwoord.", mobileDescription: "Een gast scant de QR-code, vult een naam in en doet mee. Geen app, account of wachtwoord.", checks: ["Geen app installeren", "Geen registratie of wachtwoord", "Werkt in de mobiele browser"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Invoer van de gastnaam in een evenementgalerij", flip: true, tint: true },
  { pill: "Bezorging", title: "Alle links op één plek", description: "Na de aankoop komen de QR-code en de links naar de galerij en het live scherm per e-mail binnen. Na afloop van het evenement is er ook een ZIP-export van de foto's.", mobileDescription: "Na de aankoop de QR-code en links, na het evenement een ZIP-export van de foto's.", checks: ["QR-code en links direct na aankoop", "Live scherm met één klik", "ZIP-export van de foto's na afloop"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "E-mail met de QR-code van het evenement" },
];
const rowsEs: ShowcaseRow[] = [
  { pill: "Participación de los invitados", title: "Comentarios, me gusta y felicitaciones", description: "Los invitados pueden dejar un mensaje, una felicitación o un corazón junto a las fotos. Así las fotos y las reacciones siguen juntas también después del evento.", mobileDescription: "Los invitados dejan un mensaje, una felicitación o un corazón junto a las fotos: todo queda junto.", checks: ["Mensajes junto a las fotos", "Corazones para los momentos favoritos", "Todo reunido en un solo lugar"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Galería del evento con el panel de comentarios abierto" },
  { pill: "Sin registro", title: "Participar en unos segundos", description: "El invitado escanea el código QR, escribe un nombre o apodo y empieza a participar. Sin aplicación, cuenta ni contraseña.", mobileDescription: "El invitado escanea el QR, escribe un nombre y empieza a participar. Sin aplicación, cuenta ni contraseña.", checks: ["Sin instalar aplicaciones", "Sin registro ni contraseña", "Funciona en el navegador del móvil"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Campo para escribir el nombre del invitado en la galería", flip: true, tint: true },
  { pill: "Entrega", title: "Todos los enlaces en un solo lugar", description: "Tras la compra llegan por correo el código QR y los enlaces a la galería y a la proyección en directo. Cuando el evento termina, también hay una exportación en ZIP de las fotos.", mobileDescription: "Tras la compra, el QR y los enlaces; después del evento, una exportación en ZIP de las fotos.", checks: ["Código QR y enlaces justo después de la compra", "Proyección en directo con un clic", "Exportación en ZIP de las fotos tras el evento"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "Correo electrónico con el código QR del evento" },
];
const rowsIt: ShowcaseRow[] = [
  { pill: "Partecipazione degli ospiti", title: "Commenti, mi piace e auguri", description: "Gli ospiti possono lasciare accanto alle foto un messaggio, un augurio o un cuore. Così le foto e le reazioni restano insieme anche dopo l'evento.", mobileDescription: "Gli ospiti lasciano accanto alle foto un messaggio, un augurio o un cuore: resta tutto insieme.", checks: ["Messaggi accanto alle foto", "Cuori per i momenti preferiti", "Tutto raccolto in un unico posto"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Galleria dell'evento con il pannello dei commenti aperto" },
  { pill: "Senza accesso", title: "Partecipare in pochi secondi", description: "L'ospite scansiona il codice QR, inserisce un nome o un soprannome e inizia a partecipare. Senza app, account o password.", mobileDescription: "L'ospite scansiona il QR, inserisce un nome e inizia a partecipare. Senza app, account o password.", checks: ["Nessuna app da installare", "Nessuna registrazione né password", "Funziona nel browser dello smartphone"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Inserimento del nome dell'ospite nella galleria dell'evento", flip: true, tint: true },
  { pill: "Consegna", title: "Tutti i link in un unico posto", description: "Dopo l'acquisto arrivano via e-mail il codice QR e i link alla galleria e alla proiezione dal vivo. Al termine dell'evento è disponibile anche un'esportazione ZIP delle foto.", mobileDescription: "Dopo l'acquisto il QR e i link, dopo l'evento un'esportazione ZIP delle foto.", checks: ["Codice QR e link subito dopo l'acquisto", "Proiezione dal vivo con un clic", "Esportazione ZIP delle foto dopo l'evento"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "E-mail con il codice QR dell'evento" },
];
const rowsFr: ShowcaseRow[] = [
  { pill: "Participation des invités", title: "Commentaires, j'aime et vœux", description: "Vos invités peuvent laisser un message, un vœu ou un cœur à côté des photos. Ainsi, les photos et les réactions restent ensemble, même après l'événement.", mobileDescription: "Vos invités laissent un message, un vœu ou un cœur à côté des photos — tout reste ensemble.", checks: ["Des messages à côté des photos", "Des cœurs pour les moments préférés", "Tout rassemblé au même endroit"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Galerie de l'événement avec le panneau de commentaires ouvert" },
  { pill: "Sans inscription", title: "Participer en quelques secondes", description: "L'invité scanne le QR code, saisit un nom ou un pseudo et commence à participer. Sans application, compte ni mot de passe.", mobileDescription: "L'invité scanne le QR code, saisit un nom et participe. Sans application, compte ni mot de passe.", checks: ["Aucune application à installer", "Ni inscription ni mot de passe", "Fonctionne dans le navigateur mobile"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Saisie du nom de l'invité dans une galerie d'événement", flip: true, tint: true },
  { pill: "Livraison", title: "Tous les liens au même endroit", description: "Après l'achat, le QR code et les liens vers la galerie et l'affichage en direct arrivent par e-mail. À la fin de l'événement, un export ZIP des photos est également disponible.", mobileDescription: "Après l'achat, le QR code et les liens ; après l'événement, un export ZIP des photos.", checks: ["QR code et liens juste après l'achat", "Affichage en direct en un clic", "Export ZIP des photos après l'événement"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "E-mail contenant le QR code de l'événement" },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12.5 4 4 10-10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SHOWCASE_ROWS: Record<Locale, ShowcaseRow[]> = {
  sl: rowsSl, en: rowsEn, de: rowsDe, nl: rowsNl, es: rowsEs, it: rowsIt, fr: rowsFr,
};

export function Showcase({ locale = "sl" }: { locale?: Locale }) {
  const rows = SHOWCASE_ROWS[locale] ?? rowsEn;
  return (
    <section className="showcase section-muted" id="funkcije-podrobno">
      <div className="shell">
        {rows.map((row) => (
          <article className={`showcase-row ${row.flip ? "showcase-row--flip" : ""}`} key={row.title}>
            <div className="showcase-copy">
              <div className="section-pill">{row.pill}</div>
              <h2 className="desktop-only">{row.title}</h2>
              <h2 className="mobile-only">{row.mobileTitle ?? row.title}</h2>
              <p className="desktop-only">{row.description}</p>
              <p className="mobile-only">{row.mobileDescription ?? row.description}</p>
              {row.checks ? (
                <ul className="showcase-checks">
                  {row.checks.map((check) => (
                    <li key={check}>
                      <span className="showcase-check" aria-hidden="true"><CheckIcon /></span>
                      {check}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className={`showcase-visual-wrap ${row.tint ? "showcase-visual-wrap--tint" : ""} ${row.imageSrc.endsWith("/email-qr.png") ? "showcase-visual-wrap--portrait" : ""} ${locale !== "sl" && row.tint ? "showcase-visual-wrap--identity-localized" : ""} ${locale !== "sl" && !row.tint ? "showcase-visual-wrap--trim-scrollbar" : ""}`}>
              <div className="showcase-visual">
                <Image src={localizedMarketingScreenshot(locale, row.imageSrc)} alt={row.imageAlt} fill sizes="(max-width: 900px) 100vw, 620px" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
