import Image from "next/image";
import type { Locale } from "@/lib/i18n/locale";

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
      "Gostje ob vsaki fotografiji pustijo sporočilo ali čestitko in dodajo srček. Vsi utrinki in besede ostanejo zbrani na enem mestu — tudi po dogodku.",
    mobileDescription: "Gostje ob fotografijah pustijo sporočila, čestitke in srčke — vse na enem mestu.",
    checks: ["Sporočila ob vsaki fotografiji", "Srčki za najljubše utrinke", "Zbrano na enem mestu"],
    imageSrc: "/marketing/screenshots/comments-desktop.png",
    imageAlt: "Galerija dogodka z odprtim oknom komentarjev",
  },
  {
    pill: "Brez prijave",
    title: "Pridruži se v nekaj sekundah",
    description:
      "Gost skenira QR kodo, vpiše ime ali vzdevek in že sodeluje. Brez aplikacije, brez računa, brez gesla — sodelovanje je preprosto za vse generacije.",
    mobileDescription: "Skeniraj QR, vpiši ime in sodeluj. Brez aplikacije, računa ali gesla.",
    checks: ["Brez namestitve aplikacije", "Brez registracije in gesla", "Deluje na vsakem telefonu"],
    imageSrc: "/marketing/screenshots/identity-gate.png",
    imageAlt: "Okno za vpis imena gosta v galeriji dogodka",
    flip: true,
    tint: true,
  },
  {
    pill: "Dostava",
    title: "Vse prejmete na e-pošto",
    description:
      "Po nakupu na e-pošto prejmete QR kodo in povezave do galerije ter prikaza v živo. Ko se dogodek zaključi, vam pošljemo še ZIP z vsemi fotografijami.",
    mobileDescription: "Po nakupu prejmete QR in povezave, po dogodku pa ZIP z vsemi fotografijami.",
    checks: ["QR koda in povezave takoj po nakupu", "Prikaz v živo z enim klikom", "ZIP vseh fotografij po dogodku"],
    imageSrc: "/marketing/screenshots/email-qr.png",
    imageAlt: "E-poštno sporočilo z QR kodo dogodka",
  },
];

const rowsEn: ShowcaseRow[] = [
  { pill: "Guest participation", title: "Comments, likes and wishes", description: "Guests leave a message or wish alongside each photo and add a heart. Every moment and word stays together in one place after the event.", mobileDescription: "Guests add messages, wishes and hearts alongside photos — all in one place.", checks: ["Messages alongside every photo", "Hearts for favourite moments", "Everything together in one place"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Event gallery with the comments panel open" },
  { pill: "No sign-in", title: "Join in seconds", description: "A guest scans the QR code, enters a name or nickname and joins in. No app, account or password — simple for every generation.", mobileDescription: "Scan the QR, enter your name and join in. No app, account or password.", checks: ["No app installation", "No registration or password", "Works on every phone"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Guest name entry in an event gallery", flip: true, tint: true },
  { pill: "Delivery", title: "Everything arrives by email", description: "After purchase, you receive the QR code and links to the gallery and live display. When the event ends, we also send a ZIP with all photos.", mobileDescription: "Receive the QR and links after purchase, then a ZIP with all photos after the event.", checks: ["QR code and links immediately after purchase", "Live display in one click", "ZIP with all photos after the event"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "Email containing an event QR code" },
];

const rowsDe: ShowcaseRow[] = [
  { pill: "Beteiligung der Gäste", title: "Kommentare, Likes und Glückwünsche", description: "Ihre Gäste hinterlassen zu jedem Foto eine Nachricht oder einen Glückwunsch und vergeben ein Herz. Jeder Moment und jedes Wort bleibt nach dem Event an einem Ort zusammen.", mobileDescription: "Gäste ergänzen Fotos um Nachrichten, Glückwünsche und Herzen — alles an einem Ort.", checks: ["Nachrichten zu jedem Foto", "Herzen für die schönsten Momente", "Alles an einem Ort gesammelt"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Event-Galerie mit geöffnetem Kommentarbereich" },
  { pill: "Ohne Anmeldung", title: "In Sekunden dabei", description: "Ein Gast scannt den QR-Code, gibt einen Namen oder Spitznamen ein und macht mit. Keine App, kein Konto, kein Passwort — einfach für jede Generation.", mobileDescription: "QR scannen, Namen eingeben und mitmachen. Keine App, kein Konto, kein Passwort.", checks: ["Keine App-Installation", "Keine Registrierung und kein Passwort", "Funktioniert auf jedem Smartphone"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Eingabe des Gästenamens in einer Event-Galerie", flip: true, tint: true },
  { pill: "Zustellung", title: "Alles kommt per E-Mail", description: "Nach dem Kauf erhalten Sie den QR-Code sowie Links zur Galerie und zur Live-Anzeige. Ist das Event vorbei, senden wir zusätzlich ein ZIP mit allen Fotos.", mobileDescription: "Nach dem Kauf QR-Code und Links, nach dem Event ein ZIP mit allen Fotos.", checks: ["QR-Code und Links sofort nach dem Kauf", "Live-Anzeige mit einem Klick", "ZIP mit allen Fotos nach dem Event"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "E-Mail mit dem QR-Code des Events" },
];
const rowsNl: ShowcaseRow[] = [
  { pill: "Deelname van gasten", title: "Reacties, likes en wensen", description: "Gasten laten bij elke foto een bericht of wens achter en geven een hartje. Elk moment en elk woord blijft na afloop op één plek bewaard.", mobileDescription: "Gasten voegen berichten, wensen en hartjes toe bij de foto's — allemaal op één plek.", checks: ["Berichten bij elke foto", "Hartjes voor favoriete momenten", "Alles samen op één plek"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Evenementgalerij met het reactiepaneel open" },
  { pill: "Zonder inloggen", title: "In enkele seconden meedoen", description: "Een gast scant de QR-code, vult een naam of bijnaam in en doet mee. Geen app, account of wachtwoord — eenvoudig voor elke generatie.", mobileDescription: "Scan de QR, vul je naam in en doe mee. Geen app, account of wachtwoord.", checks: ["Geen app installeren", "Geen registratie of wachtwoord", "Werkt op elke telefoon"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Invoer van de gastnaam in een evenementgalerij", flip: true, tint: true },
  { pill: "Bezorging", title: "Alles komt per e-mail", description: "Na je aankoop ontvang je de QR-code en links naar de galerij en het live scherm. Als het evenement voorbij is, sturen we ook een ZIP met alle foto's.", mobileDescription: "Na je aankoop de QR en links, na het evenement een ZIP met alle foto's.", checks: ["QR-code en links direct na aankoop", "Live scherm met één klik", "ZIP met alle foto's na afloop"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "E-mail met de QR-code van het evenement" },
];
const rowsEs: ShowcaseRow[] = [
  { pill: "Participación de los invitados", title: "Comentarios, me gusta y felicitaciones", description: "Tus invitados dejan un mensaje o una felicitación junto a cada foto y añaden un corazón. Cada momento y cada palabra quedan reunidos en un solo lugar, también después del evento.", mobileDescription: "Los invitados añaden mensajes, felicitaciones y corazones junto a las fotos, todo en un lugar.", checks: ["Mensajes junto a cada foto", "Corazones para los momentos favoritos", "Todo reunido en un solo lugar"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Galería del evento con el panel de comentarios abierto" },
  { pill: "Sin registro", title: "Únete en segundos", description: "El invitado escanea el código QR, escribe un nombre o apodo y ya participa. Sin aplicación, sin cuenta y sin contraseña: sencillo para todas las generaciones.", mobileDescription: "Escanea el QR, escribe tu nombre y participa. Sin aplicación, cuenta ni contraseña.", checks: ["Sin instalar aplicaciones", "Sin registro ni contraseña", "Funciona en cualquier móvil"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Campo para escribir el nombre del invitado en la galería", flip: true, tint: true },
  { pill: "Entrega", title: "Todo llega por correo electrónico", description: "Tras la compra recibes el código QR y los enlaces a la galería y a la proyección en directo. Cuando acaba el evento, te enviamos además un ZIP con todas las fotos.", mobileDescription: "Tras la compra, el QR y los enlaces; después del evento, un ZIP con todas las fotos.", checks: ["Código QR y enlaces justo después de la compra", "Proyección en directo con un clic", "ZIP con todas las fotos tras el evento"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "Correo electrónico con el código QR del evento" },
];
const rowsIt: ShowcaseRow[] = [
  { pill: "Partecipazione degli ospiti", title: "Commenti, mi piace e auguri", description: "I tuoi ospiti lasciano un messaggio o un augurio accanto a ogni foto e aggiungono un cuore. Ogni momento e ogni parola restano raccolti in un unico posto, anche dopo l'evento.", mobileDescription: "Gli ospiti aggiungono messaggi, auguri e cuori accanto alle foto, tutto in un unico posto.", checks: ["Messaggi accanto a ogni foto", "Cuori per i momenti preferiti", "Tutto raccolto in un unico posto"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Galleria dell'evento con il pannello dei commenti aperto" },
  { pill: "Senza accesso", title: "Partecipa in pochi secondi", description: "L'ospite scansiona il codice QR, inserisce un nome o un soprannome e partecipa subito. Nessuna app, nessun account, nessuna password: semplice per ogni generazione.", mobileDescription: "Scansiona il QR, inserisci il nome e partecipa. Senza app, account o password.", checks: ["Nessuna app da installare", "Nessuna registrazione né password", "Funziona su qualsiasi smartphone"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Inserimento del nome dell'ospite nella galleria dell'evento", flip: true, tint: true },
  { pill: "Consegna", title: "Ricevi tutto via e-mail", description: "Dopo l'acquisto ricevi il codice QR e i link alla galleria e alla proiezione dal vivo. Al termine dell'evento ti inviamo anche uno ZIP con tutte le foto.", mobileDescription: "Dopo l'acquisto QR e link, dopo l'evento uno ZIP con tutte le foto.", checks: ["Codice QR e link subito dopo l'acquisto", "Proiezione dal vivo con un clic", "ZIP con tutte le foto dopo l'evento"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "E-mail con il codice QR dell'evento" },
];
const rowsFr: ShowcaseRow[] = [
  { pill: "Participation des invités", title: "Commentaires, j'aime et vœux", description: "Vos invités laissent un message ou un vœu à côté de chaque photo et ajoutent un cœur. Chaque moment et chaque mot restent rassemblés au même endroit, même après l'événement.", mobileDescription: "Vos invités ajoutent messages, vœux et cœurs à côté des photos — le tout au même endroit.", checks: ["Des messages à côté de chaque photo", "Des cœurs pour les moments préférés", "Tout rassemblé au même endroit"], imageSrc: "/marketing/screenshots/comments-desktop.png", imageAlt: "Galerie de l'événement avec le panneau de commentaires ouvert" },
  { pill: "Sans inscription", title: "Rejoignez en quelques secondes", description: "L'invité scanne le QR code, saisit un nom ou un pseudo et participe. Ni application, ni compte, ni mot de passe — simple pour toutes les générations.", mobileDescription: "Scannez le QR code, saisissez votre nom et participez. Sans application, compte ni mot de passe.", checks: ["Aucune application à installer", "Ni inscription ni mot de passe", "Fonctionne sur tous les téléphones"], imageSrc: "/marketing/screenshots/identity-gate.png", imageAlt: "Saisie du nom de l'invité dans une galerie d'événement", flip: true, tint: true },
  { pill: "Livraison", title: "Tout arrive par e-mail", description: "Après l'achat, vous recevez le QR code ainsi que les liens vers la galerie et l'affichage en direct. À la fin de l'événement, nous envoyons aussi un ZIP avec toutes les photos.", mobileDescription: "Après l'achat, le QR code et les liens ; après l'événement, un ZIP avec toutes les photos.", checks: ["QR code et liens juste après l'achat", "Affichage en direct en un clic", "ZIP de toutes les photos après l'événement"], imageSrc: "/marketing/screenshots/email-qr.png", imageAlt: "E-mail contenant le QR code de l'événement" },
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
            <div className={`showcase-visual-wrap ${row.tint ? "showcase-visual-wrap--tint" : ""}`}>
              <div className="showcase-visual">
                <Image src={row.imageSrc} alt={row.imageAlt} fill sizes="(max-width: 900px) 100vw, 620px" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
