import type { Metadata } from "next";
import Link from "next/link";
import { Check, Download, Mail, MonitorPlay, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fulfillCheckout } from "@/lib/repositories/checkout";
import { checkoutSessionIdSchema } from "@/lib/validation/checkout";
import { checkoutEyebrowClass, checkoutHeadingClass, checkoutHeadingTextClass, checkoutHeadingTitleClass, checkoutPageClass, checkoutShellClass } from "@/components/checkout/checkout-styles";
import { CheckoutBrandBar } from "@/components/checkout/checkout-brand-bar";
import { getRequestLocale } from "@/lib/i18n/server";
import { checkoutSuccessPath, orderPath } from "@/lib/i18n/routes";
import { withLocalePrefix } from "@/lib/i18n/locale";
import { brandName } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

const successLink =
  "flex min-h-[50px] items-center justify-center gap-2 rounded-[14px] px-[18px] py-3 text-[15px] font-bold no-underline";
const nextStep = "flex items-start gap-2.5 rounded-[14px] border border-[#eee0e6] bg-[#fffbfd] p-3.5";
const nextStepIcon = "size-[19px] flex-none text-brand";
const nextStepNote = "text-[12px]/[1.45] text-plum-muted";

/** 0 meta, 1-2 eyebrow, 3-4 naslov, 5-6 uvod, 7 CTA, 8 live show, 9-10 e-pošta,
 *  11-12 po dogodku, 13-14 številka dogodka, 15 brez računa, 16 ponovni poskus. */
const COPY = {
  sl: ["Status naročila", "Plačilo uspešno", "Plačilo v obdelavi", "Plačilo je potrjeno.", "Zaključujemo pripravo galerije.", "Zdaj dodaj podatke dogodka. Zasebno povezavo za nastavitev smo poslali tudi po e-pošti.", "Stripe še potrjuje plačilo. Stran čez nekaj trenutkov osveži.", "Nastavi svoj dogodek", "Odpri prikaz v živo", "Preveri e-pošto", "Prejmeš QR kodo in neposredno povezavo. Poglej tudi med vsiljeno pošto.", "Po dogodku", "Pošljemo ti novo sporočilo z 24-urno povezavo do ZIP-a fotografij.", "Številka dogodka", "Če kaj ne deluje, nam pošlji to številko in ti pomagamo.", "Računa nismo ustvarili in prijava ni potrebna. To stran lahko varno zapreš.", "Preveri znova"],
  en: ["Order status", "Payment successful", "Payment processing", "Your payment is confirmed.", "We are finishing your gallery.", "Add your event details now. We also sent this private setup link by email.", "Stripe is still confirming the payment. Refresh this page in a few moments.", "Set up your event", "Open live display", "Check your email", "You will receive the QR code and a direct link. Check your spam folder too.", "After the event", "We will send another email with a 24-hour link to the photo ZIP.", "Event number", "If anything goes wrong, send us this number and we will help.", "We did not create an account and no sign-in is required. You can safely close this page.", "Check again"],
  de: ["Bestellstatus", "Zahlung erfolgreich", "Zahlung wird verarbeitet", "Deine Zahlung ist bestätigt.", "Wir bereiten deine Galerie vor.", "Ergänze jetzt die Eventdaten. Den privaten Einrichtungslink haben wir dir auch per E-Mail geschickt.", "Stripe bestätigt die Zahlung noch. Lade die Seite in einem Moment neu.", "Event einrichten", "Live-Anzeige öffnen", "E-Mails prüfen", "Du erhältst den QR-Code und einen Direktlink. Sieh auch im Spam-Ordner nach.", "Nach dem Event", "Wir senden dir eine weitere E-Mail mit einem 24-Stunden-Link zur Foto-ZIP.", "Eventnummer", "Falls etwas nicht klappt, schick uns diese Nummer und wir helfen dir.", "Wir haben kein Konto angelegt, eine Anmeldung ist nicht nötig. Du kannst diese Seite schließen.", "Erneut prüfen"],
  nl: ["Bestelstatus", "Betaling geslaagd", "Betaling wordt verwerkt", "Je betaling is bevestigd.", "We maken je galerij klaar.", "Voeg nu de evenementgegevens toe. De persoonlijke instellink hebben we ook per e-mail gestuurd.", "Stripe bevestigt de betaling nog. Ververs deze pagina over een moment.", "Stel je evenement in", "Live weergave openen", "Check je e-mail", "Je ontvangt de QR-code en een directe link. Kijk ook in je spammap.", "Na het evenement", "We sturen je nog een e-mail met een 24-uurslink naar de foto-ZIP.", "Evenementnummer", "Als er iets misgaat, stuur ons dit nummer en we helpen je.", "We hebben geen account aangemaakt en inloggen is niet nodig. Je kunt deze pagina veilig sluiten.", "Opnieuw controleren"],
  es: ["Estado del pedido", "Pago realizado", "Pago en proceso", "Tu pago está confirmado.", "Estamos preparando tu galería.", "Añade ahora los datos del evento. También te hemos enviado el enlace privado de configuración por correo.", "Stripe aún está confirmando el pago. Actualiza esta página en unos instantes.", "Configura tu evento", "Abrir pantalla en directo", "Revisa tu correo", "Recibirás el código QR y un enlace directo. Mira también en la carpeta de spam.", "Después del evento", "Te enviaremos otro correo con un enlace de 24 horas al ZIP de las fotos.", "Número del evento", "Si algo falla, envíanos este número y te ayudamos.", "No hemos creado ninguna cuenta y no hace falta iniciar sesión. Puedes cerrar esta página.", "Comprobar de nuevo"],
  it: ["Stato dell’ordine", "Pagamento riuscito", "Pagamento in elaborazione", "Il pagamento è confermato.", "Stiamo preparando la tua galleria.", "Aggiungi ora i dati dell’evento. Ti abbiamo inviato il link privato di configurazione anche via email.", "Stripe sta ancora confermando il pagamento. Aggiorna la pagina tra qualche istante.", "Configura il tuo evento", "Apri la visualizzazione live", "Controlla l’email", "Riceverai il codice QR e un link diretto. Controlla anche la posta indesiderata.", "Dopo l’evento", "Ti invieremo un’altra email con un link valido 24 ore al file ZIP delle foto.", "Numero dell’evento", "Se qualcosa non funziona, inviaci questo numero e ti aiutiamo.", "Non abbiamo creato alcun account e non serve accedere. Puoi chiudere questa pagina.", "Controlla di nuovo"],
  fr: ["Statut de la commande", "Paiement réussi", "Paiement en cours", "Votre paiement est confirmé.", "Nous préparons votre galerie.", "Ajoutez maintenant les informations de l’événement. Nous avons aussi envoyé le lien privé de configuration par e-mail.", "Stripe confirme encore le paiement. Actualisez cette page dans un instant.", "Configurez votre événement", "Ouvrir l’affichage en direct", "Vérifiez vos e-mails", "Vous recevrez le QR code et un lien direct. Pensez à regarder dans les spams.", "Après l’événement", "Nous enverrons un autre e-mail avec un lien valable 24 h vers le ZIP des photos.", "Numéro de l’événement", "Si quelque chose ne fonctionne pas, envoyez-nous ce numéro et nous vous aiderons.", "Nous n’avons créé aucun compte et aucune connexion n’est nécessaire. Vous pouvez fermer cette page.", "Vérifier à nouveau"],
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: `${COPY[locale][0]} | ${brandName(locale)}`, robots: { index: false, follow: false, nocache: true } };
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const locale = await getRequestLocale();
  const copy = COPY[locale];
  const parsed = checkoutSessionIdSchema.safeParse((await searchParams).session_id);
  let eventId: string | null = null;
  let managementToken: string | null = null;
  if (parsed.success) {
    try { const order = await fulfillCheckout(parsed.data, locale); eventId = order.provisioned_event_id; managementToken = order.managementToken ?? null; } catch { eventId = null; }
  }
  const ready = Boolean(eventId && managementToken);
  const galleryUrl = managementToken ? withLocalePrefix(locale, `/manage/${encodeURIComponent(managementToken)}`) : null;
  const liveshowUrl = null;
  if (ready && galleryUrl) redirect(galleryUrl);

  return <main className={checkoutPageClass}><div className={checkoutShellClass}>
    <CheckoutBrandBar locale={locale} />
    <header className={checkoutHeadingClass}>
      <p className={checkoutEyebrowClass}>{ready ? copy[1] : copy[2]}</p>
      <h1 className={checkoutHeadingTitleClass}>{ready ? copy[3] : copy[4]}</h1>
      <span className={checkoutHeadingTextClass}>{ready ? copy[5] : copy[6]}</span>
    </header>
    {ready ? <Card className="mx-auto mt-8 max-w-[650px] text-center shadow-[0_18px_48px_rgba(79,18,47,.09)]"><CardContent>
      <div className="mx-auto mb-[18px] grid size-[58px] place-items-center rounded-full bg-[#dcfce7] text-[#15803d]"><Check className="size-7" aria-hidden="true" /></div>
      {galleryUrl ? <div className="mb-5 grid gap-2.5">
        <a className={cn(successLink, "bg-brand text-white! shadow-[0_1px_2px_rgba(225,29,72,.3)]")} href={galleryUrl}><QrCode className="size-[18px] flex-none" aria-hidden="true" />{copy[7]}</a>
        {liveshowUrl ? <a className={cn(successLink, "border border-[#eccdd9] bg-[#fffbfd] text-[#9d174d]!")} href={liveshowUrl}><MonitorPlay className="size-[18px] flex-none" aria-hidden="true" />{copy[8]}</a> : null}
      </div> : null}
      <div className="my-[22px] grid gap-3 text-left sm:grid-cols-2">
        <div className={nextStep}><Mail className={nextStepIcon} aria-hidden="true" /><span className="grid gap-[3px]"><strong className="text-[13.5px]">{copy[9]}</strong><small className={nextStepNote}>{copy[10]}</small></span></div>
        <div className={nextStep}><Download className={nextStepIcon} aria-hidden="true" /><span className="grid gap-[3px]"><strong className="text-[13.5px]">{copy[11]}</strong><small className={nextStepNote}>{copy[12]}</small></span></div>
      </div>
      {eventId ? <p className="m-0 mb-[18px] rounded-[14px] border border-dashed border-[#eccdd9] bg-[#fffbfd] px-4 py-3 text-[13px]/[1.5] text-plum-muted"><strong className="block text-[12px] font-bold tracking-[.04em] text-[#4f122f] uppercase">{copy[13]}</strong><code className="text-[14px] break-all text-[#9d174d]">{eventId}</code>{copy[14]}</p> : null}
      <p className="m-0 text-[13px]/[1.55] text-plum-muted">{copy[15]}</p>
    </CardContent></Card> : <Link className="mx-auto mt-6 grid min-h-[54px] w-full max-w-[420px] place-items-center rounded-xl bg-brand text-[16px] font-[750] text-white! no-underline hover:bg-brand-hover" href={parsed.success ? `${checkoutSuccessPath(locale)}?session_id=${encodeURIComponent(parsed.data)}` : orderPath(locale)}>{copy[16]}</Link>}
  </div></main>;
}
