"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Check, Download, LoaderCircle, LockKeyhole, Mail, ScanFace, ShieldCheck, Sparkles, TriangleAlert, Video } from "lucide-react";
import { format } from "date-fns";
import { de as deDate, enGB, es as esDate, fr as frDate, it as itDate, nl as nlDate, sl } from "date-fns/locale";
import { Alert, Separator } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, RequiredMark } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { checkoutFormSchemaFor, type CheckoutFormValues } from "@/lib/validation/checkout";
import { useLocale } from "@/components/i18n/locale-provider";
import type { Locale } from "@/lib/i18n/locale";
import { privacyPath, termsPath } from "@/lib/i18n/routes";
import { brandName } from "@/lib/seo";

const CHECKOUT_COPY = {
  sl: {
    date: "Datum", chooseDate: "Izberi datum", required: "označuje obvezno polje",
    paymentError: "Plačila ni mogoče začeti.", deliveryTitle: "Kam pošljemo dostop?",
    deliveryDescription: "Na ta naslov pošljemo QR kodo in neposredno povezavo do dogodka. Po zaključku dogodka sledi še povezava za prenos fotografij, ki velja 24 ur.",
    organisation: "Organizacija", organisationPlaceholder: "npr. Studio Sever", fullName: "Ime in priimek",
    namePlaceholder: "npr. Nina Novak", email: "E-pošta", emailPlaceholder: "ime@podjetje.si",
    afterPayment: "Takoj po plačilu", afterPaymentNote: "QR koda in neposredna povezava do dogodka.",
    afterEvent: "Po zaključku dogodka", afterEventNote: "Povezava za prenos ZIP-a vseh fotografij, ki velja 24 ur.",
    eventDetails: "Podatki o dogodku", eventDescription: "Vnesi osnovne podatke in določi, kdaj bo galerija aktivna.",
    eventName: "Naziv dogodka", eventPlaceholder: "npr. Poroka Ane in Marka", location: "Lokacija", optional: "neobvezno",
    locationPlaceholder: "npr. Vila Bled", start: "Začetek", end: "Konec",
    time: "Čas", startDateLabel: "Izberi datum začetka", endDateLabel: "Izberi datum konca",
    startTimeLabel: "Čas začetka", endTimeLabel: "Čas konca", comments: "Omogoči komentarje gostov",
    commentsNote: "Gostje bodo lahko komentirali fotografije v galeriji.", summary: "Povzetek naročila",
    once: "Enkratno plačilo, brez naročnine.", oneEvent: "1 dogodek · 180 dni dostopa", unlimitedGuests: "Neomejeno gostov",
    qrGallery: "QR koda in foto galerija", qrEmail: "QR takoj po e-pošti", videos: "20 videov do 60 sekund",
    zip: "ZIP po zaključku dogodka", aiNote: "Razvrščanje kakovosti in zaznavanje dvojnikov do 3.000 fotografij.", face: "Iskanje fotografij po obrazu",
    faceNote: "Gostje s selfijem najdejo svoje fotografije.", unlimitedVideos: "Neomejeno videov",
    videoNote: "Do 60 sekund in 500 MB na video.", videoRules: "Veljajo pravila razumne uporabe: največ 1.000 videov na dogodek.", total: "Skupaj", tax: "Cena vključuje DDV.",
    consentPrefix: "Strinjam se s", terms: "Pogoji uporabe", consentMiddle: "in potrjujem, da sem prebral/-a",
    privacy: "Politiko zasebnosti", opening: "Odpiram varno plačilo …", continue: "Nadaljuj na plačilo",
    secure: "Plačilo varno obdela Stripe. Kartičnih podatkov ne hranimo.",
  },
  en: {
    date: "Date", chooseDate: "Choose a date", required: "marks a required field",
    paymentError: "Payment cannot be started.", deliveryTitle: "Where should we send your access details?",
    deliveryDescription: "We’ll send the QR code and a direct event link to this address. After the event, we’ll also send a photo download link valid for 24 hours.",
    organisation: "Organisation", organisationPlaceholder: "e.g. North Studio", fullName: "Full name",
    namePlaceholder: "e.g. Nina Novak", email: "Email", emailPlaceholder: "name@company.com",
    afterPayment: "Immediately after payment", afterPaymentNote: "QR code and a direct event link.",
    afterEvent: "After the event", afterEventNote: "A link to download a ZIP of all photos, valid for 24 hours.",
    eventDetails: "Event details", eventDescription: "Enter the event details and choose when the gallery will be active.",
    eventName: "Event name", eventPlaceholder: "e.g. Anna and Mark's wedding", location: "Location", optional: "optional",
    locationPlaceholder: "e.g. Bled Castle", start: "Start", end: "End",
    time: "Time", startDateLabel: "Choose the start date", endDateLabel: "Choose the end date",
    startTimeLabel: "Start time", endTimeLabel: "End time", comments: "Enable guest comments",
    commentsNote: "Guests will be able to comment on photos in the gallery.", summary: "Order summary",
    once: "One-off payment, no subscription.", oneEvent: "1 event · 180 days of access", unlimitedGuests: "Unlimited guests",
    qrGallery: "QR code and photo gallery", qrEmail: "QR sent immediately by email", videos: "20 videos up to 60 seconds",
    zip: "ZIP after the event", aiNote: "Quality ranking and duplicate detection for up to 3,000 photos.", face: "Photo search by face",
    faceNote: "Guests use a selfie to find their photos.", unlimitedVideos: "Unlimited videos",
    videoNote: "Up to 60 seconds and 500 MB per video.", videoRules: "Reasonable-use rules apply: up to 1,000 videos per event.", total: "Total", tax: "VAT included.",
    consentPrefix: "I agree to the", terms: "Terms of Use", consentMiddle: "and confirm that I have read the",
    privacy: "Privacy Policy", opening: "Opening secure payment …", continue: "Continue to payment",
    secure: "Payment is securely processed by Stripe. We do not store card details.",
  },
  de: {
    date: "Datum", chooseDate: "Datum wählen", required: "kennzeichnet ein Pflichtfeld",
    paymentError: "Die Zahlung kann nicht gestartet werden.", deliveryTitle: "Wohin dürfen wir Ihre Zugangsdaten senden?",
    deliveryDescription: "An diese Adresse senden wir den QR-Code und einen direkten Link zum Event. Nach dem Event erhalten Sie außerdem einen 24 Stunden gültigen Link zum Herunterladen der Fotos.",
    organisation: "Organisation", organisationPlaceholder: "z. B. Studio Nord", fullName: "Vor- und Nachname",
    namePlaceholder: "z. B. Nina Neumann", email: "E-Mail", emailPlaceholder: "name@firma.de",
    afterPayment: "Sofort nach der Zahlung", afterPaymentNote: "QR-Code und ein direkter Link zum Event.",
    afterEvent: "Nach dem Event", afterEventNote: "Ein Link zum Herunterladen des ZIP mit allen Fotos, der 24 Stunden gültig ist.",
    eventDetails: "Event-Daten", eventDescription: "Geben Sie die Eckdaten ein und legen Sie fest, wann die Galerie aktiv ist.",
    eventName: "Name des Events", eventPlaceholder: "z. B. Hochzeit von Anna und Mark", location: "Ort", optional: "optional",
    locationPlaceholder: "z. B. Schloss Bled", start: "Beginn", end: "Ende",
    time: "Uhrzeit", startDateLabel: "Startdatum wählen", endDateLabel: "Enddatum wählen",
    startTimeLabel: "Startzeit", endTimeLabel: "Endzeit", comments: "Kommentare der Gäste erlauben",
    commentsNote: "Ihre Gäste können Fotos in der Galerie kommentieren.", summary: "Bestellübersicht",
    once: "Einmalige Zahlung, kein Abo.", oneEvent: "1 Event · 180 Tage Zugriff", unlimitedGuests: "Unbegrenzt Gäste",
    qrGallery: "QR-Code und Fotogalerie", qrEmail: "QR-Code sofort per E-Mail", videos: "20 Videos bis zu 60 Sekunden",
    zip: "ZIP nach dem Event", aiNote: "Qualitätsbewertung und Duplikaterkennung für bis zu 3.000 Fotos.", face: "Fotosuche per Gesicht",
    faceNote: "Gäste finden ihre Fotos per Selfie.", unlimitedVideos: "Unbegrenzt Videos",
    videoNote: "Bis zu 60 Sekunden und 500 MB pro Video.", videoRules: "Es gelten Regeln zur angemessenen Nutzung: maximal 1.000 Videos pro Event.", total: "Gesamt", tax: "Inkl. MwSt.",
    consentPrefix: "Ich stimme den", terms: "Nutzungsbedingungen", consentMiddle: "zu und bestätige, dass ich die",
    privacy: "Datenschutzerklärung", opening: "Sichere Zahlung wird geöffnet …", continue: "Weiter zur Zahlung",
    secure: "Die Zahlung wird sicher von Stripe abgewickelt. Wir speichern keine Kartendaten.",
  },
  nl: {
    date: "Datum", chooseDate: "Kies een datum", required: "geeft een verplicht veld aan",
    paymentError: "De betaling kan niet worden gestart.", deliveryTitle: "Waar sturen we je toegangsgegevens naartoe?",
    deliveryDescription: "Naar dit adres sturen we de QR-code en een directe link naar het evenement. Na het evenement ontvang je ook een link om de foto's te downloaden, die 24 uur geldig is.",
    organisation: "Organisatie", organisationPlaceholder: "bijv. Studio Noord", fullName: "Volledige naam",
    namePlaceholder: "bijv. Nina de Vries", email: "E-mail", emailPlaceholder: "naam@bedrijf.nl",
    afterPayment: "Direct na de betaling", afterPaymentNote: "QR-code en een directe link naar het evenement.",
    afterEvent: "Na het evenement", afterEventNote: "Een link om een ZIP met alle foto's te downloaden, die 24 uur geldig is.",
    eventDetails: "Evenementgegevens", eventDescription: "Vul de basisgegevens in en bepaal wanneer de galerij actief is.",
    eventName: "Naam van het evenement", eventPlaceholder: "bijv. Bruiloft van Anna en Mark", location: "Locatie", optional: "optioneel",
    locationPlaceholder: "bijv. Kasteel Bled", start: "Begin", end: "Einde",
    time: "Tijd", startDateLabel: "Kies de begindatum", endDateLabel: "Kies de einddatum",
    startTimeLabel: "Begintijd", endTimeLabel: "Eindtijd", comments: "Reacties van gasten inschakelen",
    commentsNote: "Gasten kunnen reageren op foto's in de galerij.", summary: "Overzicht van je bestelling",
    once: "Eenmalige betaling, geen abonnement.", oneEvent: "1 evenement · 180 dagen toegang", unlimitedGuests: "Onbeperkt gasten",
    qrGallery: "QR-code en fotogalerij", qrEmail: "QR-code direct per e-mail", videos: "20 video's tot 60 seconden",
    zip: "ZIP na het evenement", aiNote: "Kwaliteitsbeoordeling en detectie van dubbele foto's voor maximaal 3.000 foto's.", face: "Foto's zoeken op gezicht",
    faceNote: "Gasten vinden hun foto's met een selfie.", unlimitedVideos: "Onbeperkt video's",
    videoNote: "Tot 60 seconden en 500 MB per video.", videoRules: "Er gelden regels voor redelijk gebruik: maximaal 1.000 video's per evenement.", total: "Totaal", tax: "Inclusief btw.",
    consentPrefix: "Ik ga akkoord met de", terms: "Gebruiksvoorwaarden", consentMiddle: "en bevestig dat ik het",
    privacy: "Privacybeleid", opening: "Beveiligde betaling wordt geopend …", continue: "Doorgaan naar betaling",
    secure: "De betaling wordt veilig verwerkt door Stripe. Wij bewaren geen kaartgegevens.",
  },
  es: {
    date: "Fecha", chooseDate: "Elige una fecha", required: "indica un campo obligatorio",
    paymentError: "No se puede iniciar el pago.", deliveryTitle: "¿Dónde te enviamos los datos de acceso?",
    deliveryDescription: "A esta dirección enviaremos el código QR y un enlace directo al evento. Después del evento, también recibirás un enlace para descargar las fotos, válido durante 24 horas.",
    organisation: "Organización", organisationPlaceholder: "p. ej. Estudio Norte", fullName: "Nombre y apellidos",
    namePlaceholder: "p. ej. Nina Navarro", email: "Correo electrónico", emailPlaceholder: "nombre@empresa.es",
    afterPayment: "Justo después del pago", afterPaymentNote: "Código QR y enlace directo al evento.",
    afterEvent: "Al terminar el evento", afterEventNote: "Un enlace para descargar un ZIP con todas las fotos, válido durante 24 horas.",
    eventDetails: "Datos del evento", eventDescription: "Introduce los datos básicos y decide cuándo estará activa la galería.",
    eventName: "Nombre del evento", eventPlaceholder: "p. ej. Boda de Anna y Mark", location: "Lugar", optional: "opcional",
    locationPlaceholder: "p. ej. Castillo de Bled", start: "Inicio", end: "Fin",
    time: "Hora", startDateLabel: "Elige la fecha de inicio", endDateLabel: "Elige la fecha de fin",
    startTimeLabel: "Hora de inicio", endTimeLabel: "Hora de fin", comments: "Permitir comentarios de los invitados",
    commentsNote: "Tus invitados podrán comentar las fotos de la galería.", summary: "Resumen del pedido",
    once: "Pago único, sin suscripción.", oneEvent: "1 evento · 180 días de acceso", unlimitedGuests: "Invitados ilimitados",
    qrGallery: "Código QR y galería de fotos", qrEmail: "QR al instante por correo", videos: "20 vídeos de hasta 60 segundos",
    zip: "ZIP al terminar el evento", aiNote: "Clasificación de calidad y detección de duplicados para hasta 3.000 fotos.", face: "Búsqueda de fotos por rostro",
    faceNote: "Los invitados encuentran sus fotos con un selfi.", unlimitedVideos: "Vídeos ilimitados",
    videoNote: "Hasta 60 segundos y 500 MB por vídeo.", videoRules: "Se aplican normas de uso razonable: un máximo de 1.000 vídeos por evento.", total: "Total", tax: "IVA incluido.",
    consentPrefix: "Acepto las", terms: "Condiciones de uso", consentMiddle: "y confirmo que he leído la",
    privacy: "Política de privacidad", opening: "Abriendo el pago seguro …", continue: "Continuar al pago",
    secure: "Stripe procesa el pago de forma segura. No guardamos los datos de la tarjeta.",
  },
  it: {
    date: "Data", chooseDate: "Scegli una data", required: "indica un campo obbligatorio",
    paymentError: "Non è possibile avviare il pagamento.", deliveryTitle: "Dove inviamo i dati di accesso?",
    deliveryDescription: "A questo indirizzo invieremo il codice QR e un link diretto all'evento. Dopo l'evento riceverai anche un link per scaricare le foto, valido per 24 ore.",
    organisation: "Organizzazione", organisationPlaceholder: "es. Studio Nord", fullName: "Nome e cognome",
    namePlaceholder: "es. Nina Rossi", email: "E-mail", emailPlaceholder: "nome@azienda.it",
    afterPayment: "Subito dopo il pagamento", afterPaymentNote: "Codice QR e link diretto all'evento.",
    afterEvent: "Al termine dell'evento", afterEventNote: "Un link per scaricare lo ZIP con tutte le foto, valido per 24 ore.",
    eventDetails: "Dati dell'evento", eventDescription: "Inserisci i dati principali e scegli quando la galleria sarà attiva.",
    eventName: "Nome dell'evento", eventPlaceholder: "es. Matrimonio di Anna e Mark", location: "Luogo", optional: "facoltativo",
    locationPlaceholder: "es. Castello di Bled", start: "Inizio", end: "Fine",
    time: "Ora", startDateLabel: "Scegli la data di inizio", endDateLabel: "Scegli la data di fine",
    startTimeLabel: "Ora di inizio", endTimeLabel: "Ora di fine", comments: "Abilita i commenti degli ospiti",
    commentsNote: "I tuoi ospiti potranno commentare le foto nella galleria.", summary: "Riepilogo dell'ordine",
    once: "Pagamento unico, senza abbonamento.", oneEvent: "1 evento · 180 giorni di accesso", unlimitedGuests: "Ospiti illimitati",
    qrGallery: "Codice QR e galleria fotografica", qrEmail: "QR subito via e-mail", videos: "20 video fino a 60 secondi",
    zip: "ZIP al termine dell'evento", aiNote: "Classificazione della qualità e rilevamento dei duplicati fino a 3.000 foto.", face: "Ricerca foto per volto",
    faceNote: "Gli ospiti trovano le loro foto con un selfie.", unlimitedVideos: "Video illimitati",
    videoNote: "Fino a 60 secondi e 500 MB per video.", videoRules: "Si applicano regole di utilizzo ragionevole: massimo 1.000 video per evento.", total: "Totale", tax: "IVA inclusa.",
    consentPrefix: "Accetto le", terms: "Condizioni d'uso", consentMiddle: "e confermo di aver letto l'",
    privacy: "Informativa sulla privacy", opening: "Apertura del pagamento sicuro …", continue: "Continua al pagamento",
    secure: "Il pagamento è gestito in modo sicuro da Stripe. Non conserviamo i dati della carta.",
  },
  fr: {
    date: "Date", chooseDate: "Choisir une date", required: "indique un champ obligatoire",
    paymentError: "Le paiement ne peut pas être lancé.", deliveryTitle: "Où devons-nous envoyer vos informations d’accès ?",
    deliveryDescription: "Nous enverrons le QR code et un lien direct vers l’événement à cette adresse. Après l’événement, vous recevrez également un lien valable 24 heures pour télécharger les photos.",
    organisation: "Organisation", organisationPlaceholder: "p. ex. Studio Nord", fullName: "Nom et prénom",
    namePlaceholder: "p. ex. Nina Dupont", email: "E-mail", emailPlaceholder: "nom@entreprise.fr",
    afterPayment: "Juste après le paiement", afterPaymentNote: "QR code et lien direct vers l'événement.",
    afterEvent: "Après l'événement", afterEventNote: "Un lien valable 24 heures pour télécharger un ZIP de toutes les photos.",
    eventDetails: "Informations sur l'événement", eventDescription: "Renseignez les informations principales et choisissez quand la galerie sera active.",
    eventName: "Nom de l'événement", eventPlaceholder: "p. ex. Mariage d'Anna et Mark", location: "Lieu", optional: "facultatif",
    locationPlaceholder: "p. ex. Château de Bled", start: "Début", end: "Fin",
    time: "Heure", startDateLabel: "Choisir la date de début", endDateLabel: "Choisir la date de fin",
    startTimeLabel: "Heure de début", endTimeLabel: "Heure de fin", comments: "Activer les commentaires des invités",
    commentsNote: "Vos invités pourront commenter les photos de la galerie.", summary: "Récapitulatif de la commande",
    once: "Paiement unique, sans abonnement.", oneEvent: "1 événement · 180 jours d’accès", unlimitedGuests: "Invités illimités",
    qrGallery: "QR code et galerie photo", qrEmail: "QR code aussitôt par e-mail", videos: "20 vidéos jusqu'à 60 secondes",
    zip: "ZIP après l'événement", aiNote: "Classement par qualité et détection des doublons pour un maximum de 3 000 photos.", face: "Recherche de photos par visage",
    faceNote: "Vos invités retrouvent leurs photos avec un selfie.", unlimitedVideos: "Vidéos illimitées",
    videoNote: "Jusqu'à 60 secondes et 500 Mo par vidéo.", videoRules: "Des règles d’utilisation raisonnable s’appliquent : 1 000 vidéos maximum par événement.", total: "Total", tax: "TVA incluse.",
    consentPrefix: "J'accepte les", terms: "Conditions d'utilisation", consentMiddle: "et je confirme avoir lu la",
    privacy: "Politique de confidentialité", opening: "Ouverture du paiement sécurisé …", continue: "Continuer vers le paiement",
    secure: "Le paiement est traité en toute sécurité par Stripe. Nous ne conservons aucune donnée bancaire.",
  },
} as const;

function dateFromValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day, 12) : undefined;
}

function valueFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DATE_FNS_LOCALES = { sl, en: enGB, de: deDate, nl: nlDate, es: esDate, it: itDate, fr: frDate };

const includedItem = "flex items-center gap-2";
const includedIcon = "size-[15px] flex-none text-[#16a34a]";
const addonRow = "grid cursor-pointer grid-cols-[22px_minmax(0,1fr)_auto] items-start gap-[11px]";
const addonTitle = "flex items-center gap-1.5 text-[14px] text-plum-strong";
const addonIcon = "size-[15px] flex-none text-brand";
const addonNote = "text-[12px]/[1.4] text-[#806672]";
const addonPrice = "pt-px text-[14px] whitespace-nowrap";
// `!` je nujen, ker globalni `a { color: … }` iz globals.css ni v Tailwind plasti in bi sicer premagal utility.
const legalLink = "font-[750] text-[#9d174d]! underline! underline-offset-2";

function DatePickerField({ id, label, value, onChange, error, disabledBefore, locale, dateLabel, chooseDate }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabledBefore?: Date;
  locale: Locale;
  dateLabel: string;
  chooseDate: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = dateFromValue(value);
  const dateLocale = DATE_FNS_LOCALES[locale] ?? enGB;
  return <Field>
    <FieldLabel htmlFor={id}>{dateLabel}<RequiredMark /></FieldLabel>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" className="w-full justify-start whitespace-nowrap px-2.5 text-[14px] font-[650] sm:px-3" aria-label={label} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}>
          <CalendarDays className="size-[18px] flex-none text-[#9d3d68]" aria-hidden="true" />
          <span>{selected ? format(selected, "d MMM yyyy", { locale: dateLocale }) : chooseDate}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(valueFromDate(date));
            setOpen(false);
          }}
          disabled={disabledBefore ? { before: disabledBefore } : undefined}
          autoFocus
          locale={dateLocale}
        />
      </PopoverContent>
    </Popover>
    {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
  </Field>;
}

function SectionHeading({ step, title, description }: { step: string; title: string; description: string }) {
  return <CardHeader className="grid-cols-[34px_1fr] items-start sm:grid-cols-[38px_1fr]">
    <span className="grid size-[34px] place-items-center rounded-[10px] bg-brand-soft text-[14px] font-[850] text-brand-hover" aria-hidden="true">{step}</span>
    <div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </div>
  </CardHeader>;
}

export function CheckoutForm({ videoUploadsEnabled = false }: { videoUploadsEnabled?: boolean }) {
  const locale = useLocale();
  const copy = CHECKOUT_COPY[locale];
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchemaFor(locale)),
    mode: "onBlur",
    defaultValues: {
      organizationName: "",
      ownerName: "",
      ownerEmail: "",
      eventName: "",
      eventLocation: "",
      startDate: "",
      startTime: "16:00",
      endDate: "",
      endTime: "23:59",
      commentsEnabled: true,
      aiBestPhotos: false,
      faceCollections: false,
      videoUnlimited: false,
      termsAccepted: false,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const [aiBestPhotos, faceCollections, videoUnlimited, startDate] = useWatch({ control: form.control, name: ["aiBestPhotos", "faceCollections", "videoUnlimited", "startDate"] });
  const totalEuros = 35 + (aiBestPhotos ? 15 : 0) + (faceCollections ? 5 : 0) + (videoUnlimited ? 15 : 0);

  async function submit(data: CheckoutFormValues) {
    setServerError(null);
    try {
      const response = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          organizationName: data.organizationName,
          ownerName: data.ownerName,
          ownerEmail: data.ownerEmail,
          eventName: data.eventName,
          eventLocation: data.eventLocation,
          startsAt: new Date(`${data.startDate}T${data.startTime}:00`).toISOString(),
          endsAt: new Date(`${data.endDate}T${data.endTime}:00`).toISOString(),
          timezone: "Europe/Ljubljana",
          commentsEnabled: data.commentsEnabled,
          aiBestPhotos: data.aiBestPhotos,
          faceCollections: data.faceCollections,
          videoUnlimited: data.videoUnlimited,
          termsAccepted: data.termsAccepted,
        }),
      });
      const body = await response.json().catch(() => null) as { checkout?: { url: string }; detail?: string; title?: string } | null;
      if (!response.ok || !body?.checkout?.url) throw new Error(body?.detail ?? body?.title ?? copy.paymentError);
      window.location.assign(body.checkout.url);
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : copy.paymentError);
    }
  }

  return <form className="grid" onSubmit={form.handleSubmit(submit)} noValidate>
    <p className="m-0 mb-2.5 text-[12.5px] text-plum-muted sm:text-right"><span className="font-extrabold text-brand-hover" aria-hidden="true">*</span> {copy.required}</p>
    <div className="grid items-start gap-4 sm:gap-6 min-[961px]:grid-cols-[minmax(0,1fr)_350px]">
      <div className="grid min-w-0 gap-4 sm:gap-5">
        <Card>
          <SectionHeading step="1" title={copy.deliveryTitle} description={copy.deliveryDescription} />
          <CardContent className="grid gap-[18px] sm:grid-cols-[repeat(2,minmax(0,1fr))]">
            <Field>
              <FieldLabel htmlFor="organizationName">{copy.organisation}<RequiredMark /></FieldLabel>
              <Input id="organizationName" required autoComplete="organization" placeholder={copy.organisationPlaceholder} aria-invalid={Boolean(errors.organizationName)} aria-describedby={errors.organizationName ? "organizationName-error" : undefined} {...form.register("organizationName")} />
              {errors.organizationName ? <FieldError id="organizationName-error">{errors.organizationName.message}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="ownerName">{copy.fullName}<RequiredMark /></FieldLabel>
              <Input id="ownerName" required autoComplete="name" placeholder={copy.namePlaceholder} aria-invalid={Boolean(errors.ownerName)} aria-describedby={errors.ownerName ? "ownerName-error" : undefined} {...form.register("ownerName")} />
              {errors.ownerName ? <FieldError id="ownerName-error">{errors.ownerName.message}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="ownerEmail">{copy.email}<RequiredMark /></FieldLabel>
              <Input id="ownerEmail" type="email" required inputMode="email" autoComplete="email" placeholder={copy.emailPlaceholder} aria-invalid={Boolean(errors.ownerEmail)} aria-describedby={errors.ownerEmail ? "ownerEmail-error" : undefined} {...form.register("ownerEmail")} />
              {errors.ownerEmail ? <FieldError id="ownerEmail-error">{errors.ownerEmail.message}</FieldError> : null}
            </Field>
            <div className="flex min-h-[70px] items-start gap-[11px] rounded-[14px] border border-[#eee0e6] bg-[#fffbfd] p-3.5">
              <Mail className="mt-px size-5 flex-none text-brand" aria-hidden="true" />
              <span className="grid gap-[3px]"><strong className="text-[13.5px] text-plum-strong">{copy.afterPayment}</strong><small className="text-[12px]/[1.45] text-plum-muted">{copy.afterPaymentNote}</small></span>
            </div>
            <div className="flex min-h-[70px] items-start gap-[11px] rounded-[14px] border border-[#eee0e6] bg-[#fffbfd] p-3.5">
              <Download className="mt-px size-5 flex-none text-brand" aria-hidden="true" />
              <span className="grid gap-[3px]"><strong className="text-[13.5px] text-plum-strong">{copy.afterEvent}</strong><small className="text-[12px]/[1.45] text-plum-muted">{copy.afterEventNote}</small></span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <SectionHeading step="2" title={copy.eventDetails} description={copy.eventDescription} />
          <CardContent className="grid gap-[22px]">
            <div className="grid gap-[18px] sm:grid-cols-[repeat(2,minmax(0,1fr))]">
              <Field className="sm:col-span-full">
                <FieldLabel htmlFor="eventName">{copy.eventName}<RequiredMark /></FieldLabel>
                <Input id="eventName" required placeholder={copy.eventPlaceholder} aria-invalid={Boolean(errors.eventName)} aria-describedby={errors.eventName ? "eventName-error" : undefined} {...form.register("eventName")} />
                {errors.eventName ? <FieldError id="eventName-error">{errors.eventName.message}</FieldError> : null}
              </Field>
              <Field className="sm:col-span-full">
                <FieldLabel htmlFor="eventLocation">{copy.location} <span className="text-[12px] font-semibold text-[#8a707c]">({copy.optional})</span></FieldLabel>
                <Input id="eventLocation" placeholder={copy.locationPlaceholder} autoComplete="off" aria-invalid={Boolean(errors.eventLocation)} {...form.register("eventLocation")} />
                {errors.eventLocation ? <FieldError>{errors.eventLocation.message}</FieldError> : null}
              </Field>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
              <div className="grid min-w-0 gap-3.5 rounded-2xl border border-[#eee0e6] bg-[#fffbfd] p-3.5 sm:p-4">
                <div className="flex items-baseline justify-between gap-2"><span className="text-[14px] font-[850] text-plum">{copy.start}</span><small className="hidden text-[11px] text-[#8a707c] sm:block">Europe/Ljubljana</small></div>
                <div className="grid items-start gap-2.5 min-[381px]:grid-cols-[minmax(0,1fr)_102px] sm:grid-cols-[minmax(0,1fr)_108px]">
                  <Controller control={form.control} name="startDate" render={({ field }) => <DatePickerField id="startDate" label={copy.startDateLabel} value={field.value} onChange={(value) => {
                    field.onChange(value);
                    if (!form.getValues("endDate")) form.setValue("endDate", value, { shouldValidate: true });
                  }} error={errors.startDate?.message} disabledBefore={new Date(new Date().setHours(0, 0, 0, 0))} locale={locale} dateLabel={copy.date} chooseDate={copy.chooseDate} />} />
                  <Field>
                    <FieldLabel htmlFor="startTime">{copy.time}<RequiredMark /></FieldLabel>
                    <Input id="startTime" type="time" required aria-label={copy.startTimeLabel} aria-invalid={Boolean(errors.startTime)} {...form.register("startTime")} />
                    {errors.startTime ? <FieldError>{errors.startTime.message}</FieldError> : null}
                  </Field>
                </div>
              </div>
              <div className="grid min-w-0 gap-3.5 rounded-2xl border border-[#eee0e6] bg-[#fffbfd] p-3.5 sm:p-4">
                <div className="flex items-baseline justify-between gap-2"><span className="text-[14px] font-[850] text-plum">{copy.end}</span></div>
                <div className="grid items-start gap-2.5 min-[381px]:grid-cols-[minmax(0,1fr)_102px] sm:grid-cols-[minmax(0,1fr)_108px]">
                  <Controller control={form.control} name="endDate" render={({ field }) => <DatePickerField id="endDate" label={copy.endDateLabel} value={field.value} onChange={field.onChange} error={errors.endDate?.message} disabledBefore={dateFromValue(startDate)} locale={locale} dateLabel={copy.date} chooseDate={copy.chooseDate} />} />
                  <Field>
                    <FieldLabel htmlFor="endTime">{copy.time}<RequiredMark /></FieldLabel>
                    <Input id="endTime" type="time" required aria-label={copy.endTimeLabel} aria-invalid={Boolean(errors.endTime)} {...form.register("endTime")} />
                    {errors.endTime ? <FieldError>{errors.endTime.message}</FieldError> : null}
                  </Field>
                </div>
              </div>
            </div>

            <Controller control={form.control} name="commentsEnabled" render={({ field }) => <label className="flex cursor-pointer items-start gap-3 border-t border-[#f0e3e8] pt-[18px]" htmlFor="commentsEnabled">
              <Checkbox id="commentsEnabled" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              <span className="grid gap-[3px]"><strong className="text-[14px] text-plum-strong">{copy.comments}</strong><small className="text-[12.5px]/[1.45] text-plum-muted">{copy.commentsNote}</small></span>
            </label>} />
          </CardContent>
        </Card>
      </div>

      <aside className="static min-[961px]:sticky min-[961px]:top-6" aria-label={copy.summary}>
        <Card className="shadow-[0_18px_48px_rgba(79,18,47,.09)]">
          <CardHeader>
            <CardTitle>{copy.summary}</CardTitle>
            <CardDescription>{copy.once}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-[18px]">
            <div className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3">
              <div className="grid size-[42px] place-items-center rounded-xl bg-brand-soft text-brand-hover"><CalendarDays className="size-5" aria-hidden="true" /></div>
              <div className="grid gap-0.5"><strong className="text-[14px]">{brandName(locale)}</strong><span className="text-[12px] text-[#806672]">{copy.oneEvent}</span></div>
              <b className="text-[18px] whitespace-nowrap">35 €</b>
            </div>
            <ul className="m-0 -mt-1 grid list-none gap-2 p-0 text-[12.5px] text-[#68495a]">
              <li className={includedItem}><Check className={includedIcon} strokeWidth={3} aria-hidden="true" /> {copy.unlimitedGuests}</li>
              <li className={includedItem}><Check className={includedIcon} strokeWidth={3} aria-hidden="true" /> {copy.qrGallery}</li>
              <li className={includedItem}><Check className={includedIcon} strokeWidth={3} aria-hidden="true" /> {copy.qrEmail}</li>
              {videoUploadsEnabled ? <li className={includedItem}><Check className={includedIcon} strokeWidth={3} aria-hidden="true" /> {copy.videos}</li> : null}
              <li className={includedItem}><Check className={includedIcon} strokeWidth={3} aria-hidden="true" /> {copy.zip}</li>
            </ul>
            <Separator />
            <Controller control={form.control} name="aiBestPhotos" render={({ field }) => <label className={addonRow} htmlFor="aiBestPhotos">
              <Checkbox id="aiBestPhotos" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              <span className="grid gap-1"><strong className={addonTitle}><Sparkles className={addonIcon} aria-hidden="true" /> AI Best Photos</strong><small className={addonNote}>{copy.aiNote}</small></span>
              <b className={addonPrice}>+15 €</b>
            </label>} />
            <Controller control={form.control} name="faceCollections" render={({ field }) => <label className={addonRow} htmlFor="faceCollections">
              <Checkbox id="faceCollections" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              <span className="grid gap-1"><strong className={addonTitle}><ScanFace className={addonIcon} aria-hidden="true" /> {copy.face}</strong><small className={addonNote}>{copy.faceNote}</small></span>
              <b className={addonPrice}>+5 €</b>
            </label>} />
            {videoUploadsEnabled ? <Controller control={form.control} name="videoUnlimited" render={({ field }) => <div className="grid gap-1">
              <label className={addonRow} htmlFor="videoUnlimited">
                <Checkbox id="videoUnlimited" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                <span className="grid gap-1"><strong className={addonTitle}><Video className={addonIcon} aria-hidden="true" /> {copy.unlimitedVideos}</strong><small className={addonNote}>{copy.videoNote}</small></span>
                <b className={addonPrice}>+15 €</b>
              </label>
              <Link className="ml-[33px] text-[12px]/[1.4] font-[700] text-brand-hover! underline underline-offset-2" href={termsPath(locale)} target="_blank">{copy.videoRules}</Link>
            </div>} /> : null}
            <Separator />
            <div className="flex items-baseline justify-between"><span className="text-[14px] font-bold text-[#68495a]">{copy.total}</span><strong className="text-[30px]/none tracking-[-.03em]">{totalEuros} €</strong></div>
            <span className="-mt-3 text-right text-[11.5px] text-[#8a707c]">{copy.tax}</span>
            <Controller control={form.control} name="termsAccepted" render={({ field }) => <div>
              <label className="flex cursor-pointer items-start gap-2.5 text-[12px]/[1.5] text-[#68495a]" htmlFor="termsAccepted">
                <Checkbox id="termsAccepted" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} aria-invalid={Boolean(errors.termsAccepted)} />
                <span>{copy.consentPrefix} <Link className={legalLink} href={termsPath(locale)} target="_blank">{copy.terms}</Link> {copy.consentMiddle} <Link className={legalLink} href={privacyPath(locale)} target="_blank">{copy.privacy}</Link>.</span>
              </label>
              {errors.termsAccepted ? <FieldError>{errors.termsAccepted.message}</FieldError> : null}
            </div>} />
            {serverError ? <Alert role="alert"><TriangleAlert className="size-[18px] flex-none" aria-hidden="true" /><span>{serverError}</span></Alert> : null}
            <Button className="min-h-[54px] w-full text-[16px]" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="size-[18px] animate-spin motion-reduce:[animation-duration:1.6s]" aria-hidden="true" /> : <LockKeyhole className="size-[18px]" aria-hidden="true" />}
              {isSubmitting ? copy.opening : copy.continue}
            </Button>
            <div className="flex items-start justify-center gap-[7px] text-left text-[11.5px]/[1.45] text-[#806672]"><ShieldCheck className="size-4 flex-none text-[#16a34a]" aria-hidden="true" /><span>{copy.secure}</span></div>
          </CardContent>
        </Card>
      </aside>
    </div>
  </form>;
}
