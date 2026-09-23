import { withEnglishUS } from "@/lib/i18n/english-regions";
import type { Metadata } from "next";
import { CalendarDays, Download, MapPin, MonitorPlay, QrCode } from "lucide-react";
import { notFound } from "next/navigation";
import { EventSetupForm } from "@/components/checkout/event-setup-form";
import { CheckoutHeader } from "@/components/site/order-page";
import { findManagedEvent } from "@/lib/repositories/checkout";
import { managementTokenSchema } from "@/lib/validation/checkout";
import { getRequestLocale } from "@/lib/i18n/server";
import { withLocalePrefix } from "@/lib/i18n/locale";
import { brandName } from "@/lib/seo";

const COPY = withEnglishUS({
  sl: ["Nastavi svoj dogodek", "Plačilo je potrjeno. Dodaj tri podatke in pripravi QR kodo.", "Vse, kar potrebuješ, je ob vsakem obisku na tej strani.", "Galerija in QR", "Prenesi vse fotografije", "ZIP bo tukaj na voljo po dogodku, povezavo pa prejmeš tudi po e-pošti.", "Prenesi QR za tisk", "Plačilo potrjeno", "Tvoj dogodek", "Podatki dogodka", "Vzame manj kot minuto.", "QR koda in povezave", "Natisni QR kodo ali jo pokaži gostom na zaslonu.", "Nazaj na stran", "Upravljanje dogodka"],
  en: ["Set up your event", "Your payment is confirmed. Add three details to create your QR code.", "Everything you need is available here whenever you return.", "Gallery and QR", "Download all photos", "The ZIP will appear here after the event and will also arrive by email.", "Download QR for printing", "Payment confirmed", "Your event", "Event details", "It takes less than a minute.", "QR code and links", "Print the QR code or show it to guests on a screen.", "Back to site", "Manage event"],
  de: ["Event einrichten", "Deine Zahlung ist bestätigt. Ergänze drei Angaben, um den QR-Code zu erstellen.", "Hier findest du bei jedem Besuch alles für dein Event.", "Galerie und QR", "Alle Fotos herunterladen", "Die ZIP-Datei erscheint nach dem Event hier und wird auch per E-Mail gesendet.", "QR-Code zum Drucken herunterladen", "Zahlung bestätigt", "Dein Event", "Eventdaten", "Dauert weniger als eine Minute.", "QR-Code und Links", "Drucke den QR-Code oder zeige ihn deinen Gästen auf einem Bildschirm.", "Zurück zur Website", "Event verwalten"],
  nl: ["Stel je evenement in", "Je betaling is bevestigd. Voeg drie gegevens toe om de QR-code te maken.", "Alles wat je nodig hebt, staat hier wanneer je terugkomt.", "Galerij en QR", "Alle foto's downloaden", "Het ZIP-bestand verschijnt hier na het evenement en wordt ook per e-mail verzonden.", "QR-code voor afdrukken downloaden", "Betaling bevestigd", "Je evenement", "Evenementgegevens", "Het duurt minder dan een minuut.", "QR-code en links", "Print de QR-code of toon hem aan je gasten op een scherm.", "Terug naar de site", "Evenement beheren"],
  es: ["Configura tu evento", "Tu pago está confirmado. Añade tres datos para crear el código QR.", "Todo lo que necesitas estará aquí cuando vuelvas.", "Galería y QR", "Descargar todas las fotos", "El ZIP aparecerá aquí después del evento y también llegará por correo.", "Descargar QR para imprimir", "Pago confirmado", "Tu evento", "Datos del evento", "Se tarda menos de un minuto.", "Código QR y enlaces", "Imprime el código QR o muéstralo a tus invitados en una pantalla.", "Volver al sitio", "Gestionar el evento"],
  it: ["Configura il tuo evento", "Il pagamento è confermato. Aggiungi tre dati per creare il codice QR.", "Qui troverai tutto ciò che serve ogni volta che torni.", "Galleria e QR", "Scarica tutte le foto", "Il file ZIP apparirà qui dopo l’evento e arriverà anche via email.", "Scarica il QR per la stampa", "Pagamento confermato", "Il tuo evento", "Dati dell’evento", "Richiede meno di un minuto.", "Codice QR e link", "Stampa il codice QR o mostralo agli ospiti su uno schermo.", "Torna al sito", "Gestisci l’evento"],
  fr: ["Configurez votre événement", "Votre paiement est confirmé. Ajoutez trois informations pour créer le QR.", "Tout ce dont vous avez besoin restera disponible ici.", "Galerie et QR", "Télécharger toutes les photos", "Le ZIP apparaîtra ici après l’événement et sera également envoyé par e-mail.", "Télécharger le QR à imprimer", "Paiement confirmé", "Votre événement", "Informations sur l’événement", "Cela prend moins d’une minute.", "QR code et liens", "Imprimez le QR code ou affichez-le à vos invités sur un écran.", "Retour au site", "Gérer l’événement"],
} as const);

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: `${COPY[locale][14]} | ${brandName(locale)}`, robots: { index: false, follow: false, nocache: true } };
}

const metaChipClass = "inline-flex items-center gap-1.5 rounded-full border border-gm-line bg-gm-paper px-3 py-1.5 text-[13px] font-semibold text-gm-muted";

function formatEventDate(startsAt: string | null, timezone: string, locale: string): string | null {
  if (!startsAt) return null;
  const value = Date.parse(startsAt);
  if (Number.isNaN(value)) return null;
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: timezone }).format(value);
  } catch { return null; }
}

export default async function ManageEventPage({ params }: { params: Promise<{ token: string }> }) {
  const locale = await getRequestLocale(); const copy = COPY[locale];
  const parsed = managementTokenSchema.safeParse((await params).token); if (!parsed.success) notFound();
  const event = await findManagedEvent(parsed.data); if (!event) notFound();
  const ready = Boolean(event.setupCompletedAt);
  const gallery = withLocalePrefix(locale, `/t/${encodeURIComponent(event.publicCode)}`);
  const liveshow = event.slideshowToken ? withLocalePrefix(locale, `/display/${encodeURIComponent(event.slideshowToken)}`) : null;
  const qrImage = `/qr/${encodeURIComponent(event.publicCode)}.png`;
  const eventDate = ready ? formatEventDate(event.startsAt, event.timezone, locale) : null;
  const primaryLink = "flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-gm-accent px-5 text-[16px] font-semibold text-white! shadow-[0_10px_24px_rgba(168,69,58,.28)] hover:bg-gm-accent-dark hover:text-white!";
  const secondaryLink = "flex min-h-[56px] items-center justify-center gap-2 rounded-full border border-gm-line-strong bg-gm-paper px-5 text-[16px] font-semibold text-gm-ink! hover:border-gm-ink";
  return <div className="gm"><CheckoutHeader locale={locale} /><main id="main" className="px-[clamp(16px,4vw,48px)] pt-[clamp(40px,5vw,72px)] pb-[clamp(72px,9vw,120px)]"><div className="mx-auto max-w-[760px]">
    <header className="mb-8 flex animate-gm-up flex-col items-center gap-4 text-center">
      <p className="text-[12px] font-semibold tracking-[.16em] text-gm-accent uppercase">{ready ? copy[8] : copy[7]}</p>
      <h1 className="font-serif text-[clamp(36px,5vw,60px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance">{ready ? event.name : copy[0]}</h1>
      <span className="max-w-[560px] text-[18px] leading-[1.55] text-gm-muted">{ready ? copy[2] : copy[1]}</span>
      {ready && (eventDate || event.location) ? <div className="flex flex-wrap items-center justify-center gap-2">
        {eventDate ? <span className={metaChipClass}><CalendarDays className="size-[15px] text-gm-accent" aria-hidden="true" />{eventDate}</span> : null}
        {event.location ? <span className={metaChipClass}><MapPin className="size-[15px] text-gm-accent" aria-hidden="true" />{event.location}</span> : null}
      </div> : null}
    </header>
    <section className="mx-auto flex max-w-[680px] flex-col gap-[22px] rounded-[26px] border border-gm-line bg-gm-paper p-[clamp(20px,3vw,32px)] shadow-[0_30px_60px_rgba(40,30,20,.08)]">
      <div className="flex flex-col gap-1">
        <h2 className="text-[20px] font-semibold">{ready ? copy[11] : copy[9]}</h2>
        <p className="text-[15px] leading-[1.5] text-gm-muted">{ready ? copy[12] : copy[10]}</p>
      </div>
      {!ready ? <EventSetupForm token={parsed.data} defaults={{ name: "", location: "", date: "", timezone: event.timezone }} /> : <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid justify-items-center gap-3 rounded-[20px] border border-gm-line bg-white p-5 sm:col-span-2"><img className="h-auto w-full max-w-[260px]" src={qrImage} width={260} height={260} alt="QR code" /><a className="font-semibold text-gm-accent! underline! underline-offset-[3px]" href={`${qrImage}?download=1`}>{copy[6]}</a></div>
        <a className={primaryLink} href={gallery}><QrCode className="size-5" aria-hidden="true" />{copy[3]}</a>
        {liveshow ? <a className={secondaryLink} href={liveshow}><MonitorPlay className="size-5" aria-hidden="true" />Live Show</a> : null}
        {event.exportStatus === "ready" ? <a className={`${secondaryLink} sm:col-span-2`} href={`/api/v1/manage/${encodeURIComponent(parsed.data)}/download`}><Download className="size-5" aria-hidden="true" />{copy[4]}</a> : <div className="flex items-center gap-3 rounded-2xl bg-gm-bg p-4 text-[14px] text-gm-muted sm:col-span-2"><Download className="size-5 flex-none" aria-hidden="true" /><span><strong className="block text-gm-ink">{copy[4]}</strong>{copy[5]}</span></div>}
      </div>}
    </section>
  </div></main></div>;
}
