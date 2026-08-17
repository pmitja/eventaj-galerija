import type { Metadata } from "next";
import { Download, MonitorPlay, QrCode } from "lucide-react";
import { notFound } from "next/navigation";
import { EventSetupForm } from "@/components/checkout/event-setup-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { checkoutPageClass, checkoutShellClass } from "@/components/checkout/checkout-styles";
import { findManagedEvent } from "@/lib/repositories/checkout";
import { managementTokenSchema } from "@/lib/validation/checkout";
import { getRequestLocale } from "@/lib/i18n/server";
import { withLocalePrefix } from "@/lib/i18n/locale";

export const metadata: Metadata = { title: "Manage event", robots: { index: false, follow: false, nocache: true } };

const COPY = {
  sl: ["Nastavi svoj dogodek", "Plačilo je potrjeno. Dodaj tri podatke in pripravi QR kodo.", "Vse, kar potrebuješ, je ob vsakem obisku na tej strani.", "Galerija in QR", "Prenesi vse fotografije", "ZIP bo tukaj na voljo po dogodku, povezavo pa prejmeš tudi po e-pošti.", "Prenesi QR za tisk"],
  en: ["Set up your event", "Your payment is confirmed. Add three details to create your QR code.", "Everything you need is available here whenever you return.", "Gallery and QR", "Download all photos", "The ZIP will appear here after the event and will also arrive by email.", "Download QR for printing"],
  de: ["Event einrichten", "Deine Zahlung ist bestätigt. Ergänze drei Angaben, um den QR-Code zu erstellen.", "Hier findest du bei jedem Besuch alles für dein Event.", "Galerie und QR", "Alle Fotos herunterladen", "Die ZIP-Datei erscheint nach dem Event hier und wird auch per E-Mail gesendet.", "QR-Code zum Drucken herunterladen"],
  nl: ["Stel je evenement in", "Je betaling is bevestigd. Voeg drie gegevens toe om de QR-code te maken.", "Alles wat je nodig hebt, staat hier wanneer je terugkomt.", "Galerij en QR", "Alle foto's downloaden", "Het ZIP-bestand verschijnt hier na het evenement en wordt ook per e-mail verzonden.", "QR-code voor afdrukken downloaden"],
  es: ["Configura tu evento", "Tu pago está confirmado. Añade tres datos para crear el código QR.", "Todo lo que necesitas estará aquí cuando vuelvas.", "Galería y QR", "Descargar todas las fotos", "El ZIP aparecerá aquí después del evento y también llegará por correo.", "Descargar QR para imprimir"],
  it: ["Configura il tuo evento", "Il pagamento è confermato. Aggiungi tre dati per creare il codice QR.", "Qui troverai tutto ciò che serve ogni volta che torni.", "Galleria e QR", "Scarica tutte le foto", "Il file ZIP apparirà qui dopo l’evento e arriverà anche via email.", "Scarica il QR per la stampa"],
  fr: ["Configurez votre événement", "Votre paiement est confirmé. Ajoutez trois informations pour créer le QR.", "Tout ce dont vous avez besoin restera disponible ici.", "Galerie et QR", "Télécharger toutes les photos", "Le ZIP apparaîtra ici après l’événement et sera également envoyé par e-mail.", "Télécharger le QR à imprimer"],
} as const;

export default async function ManageEventPage({ params }: { params: Promise<{ token: string }> }) {
  const locale = await getRequestLocale(); const copy = COPY[locale];
  const parsed = managementTokenSchema.safeParse((await params).token); if (!parsed.success) notFound();
  const event = await findManagedEvent(parsed.data); if (!event) notFound();
  const ready = Boolean(event.setupCompletedAt);
  const gallery = withLocalePrefix(locale, `/t/${encodeURIComponent(event.publicCode)}`);
  const liveshow = event.slideshowToken ? withLocalePrefix(locale, `/display/${encodeURIComponent(event.slideshowToken)}`) : null;
  const qrImage = `/qr/${encodeURIComponent(event.publicCode)}.png`;
  return <main className={checkoutPageClass}><div className={checkoutShellClass}>
    <Card className="mx-auto max-w-[680px] shadow-[0_18px_48px_rgba(79,18,47,.09)]"><CardHeader><CardTitle>{ready ? event.name : copy[0]}</CardTitle><CardDescription>{ready ? copy[2] : copy[1]}</CardDescription></CardHeader><CardContent>
      {!ready ? <EventSetupForm token={parsed.data} defaults={{ name: "", location: "", date: "", timezone: event.timezone }} /> : <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 grid justify-items-center gap-3 rounded-2xl bg-[#fffbfd] p-5"><img className="h-auto w-full max-w-[260px]" src={qrImage} width={260} height={260} alt="QR code" /><a className="font-bold text-brand! underline" href={`${qrImage}?download=1`}>{copy[6]}</a></div>
        <a className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-brand px-4 font-bold text-white!" href={gallery}><QrCode className="size-5" />{copy[3]}</a>
        {liveshow ? <a className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-[#eccdd9] px-4 font-bold text-brand!" href={liveshow}><MonitorPlay className="size-5" />Live Show</a> : null}
        {event.exportStatus === "ready" ? <a className="sm:col-span-2 flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-[#eccdd9] px-4 font-bold text-brand!" href={`/api/v1/manage/${encodeURIComponent(parsed.data)}/download`}><Download className="size-5" />{copy[4]}</a> : <div className="sm:col-span-2 flex items-center gap-3 rounded-xl bg-[#fffbfd] p-4 text-sm text-plum-muted"><Download className="size-5" /><span><strong className="block text-plum">{copy[4]}</strong>{copy[5]}</span></div>}
      </div>}
    </CardContent></Card>
  </div></main>;
}
