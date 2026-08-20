import type { SolutionPageLocale } from "@/lib/i18n/routes";

export type WeddingConversionCopy = {
  guestViewPill: string;
  guestViewHeading: string;
  guestViewText: string;
  uploadButton: string;
  uploadReady: string;
  uploadLocalOnly: string;
  uploadDemoLink: string;
  offerPill: string;
  offerHeading: string;
  offerText: string;
  offerPrice: string;
  offerPriceNote: string;
  offerItems: readonly string[];
  offerCta: string;
  comparisonPill: string;
  comparisonHeading: string;
  comparisonText: string;
  comparisonFeature: string;
  comparisonProduct: string;
  comparisonAlternative: string;
  comparisonRows: readonly (readonly [string, string, string])[];
  freePill: string;
  freeHeading: string;
  freeText: string;
  freeGoodFor: string;
  freeGoodForText: string;
  paidGoodFor: string;
  paidGoodForText: string;
};

export const weddingConversionCopy: Record<SolutionPageLocale, WeddingConversionCopy> = {
  en: {
    guestViewPill: "What guests see",
    guestViewHeading: "Try the three-tap guest flow before you buy.",
    guestViewText:
      "Add a photo, a video or a voice message below — the real guest card, step for step. Everything stays in your browser and shows up in the demo gallery on this device.",
    uploadButton: "Choose wedding photos",
    uploadReady: "Ready to upload in the real gallery",
    uploadLocalOnly: "Private preview · this file never leaves your device",
    uploadDemoLink: "See it in the demo gallery →",
    offerPill: "Everything included",
    offerHeading: "One complete wedding gallery. €35 once.",
    offerText: "Create the event, download the QR code immediately and use the same link throughout your wedding.",
    offerPrice: "€35",
    offerPriceNote: "per wedding · VAT included · no subscription",
    offerItems: ["Unlimited guests", "Guest uploads without an app or account", "Original photo downloads", "Up to 20 videos of 60 seconds", "Live Slideshow and moderation", "ZIP export and 180-day gallery"],
    offerCta: "Create your wedding gallery",
    comparisonPill: "An honest comparison",
    comparisonHeading: "Guest Mosaic or a free workaround?",
    comparisonText: "WhatsApp and shared folders can work. The difference is how much setup, chasing and organising you want to do yourself.",
    comparisonFeature: "Wedding task",
    comparisonProduct: "Guest Mosaic",
    comparisonAlternative: "Chat or shared folder",
    comparisonRows: [
      ["Guest access", "QR opens in the browser; no guest account", "May require a chat, invitation or provider account"],
      ["Collecting", "One wedding gallery and one QR code", "Photos can remain split across threads and folders"],
      ["Taking photos home", "Original downloads plus one ZIP export", "Depends on the tool and manual organisation"],
      ["During the wedding", "Moderation and Live Slideshow included", "Usually needs a separate display workflow"],
      ["Cost", "€35 once, VAT included", "Can be free, with more setup and follow-up"],
    ],
    freePill: "Free DIY guide",
    freeHeading: "When a free wedding photo setup is enough.",
    freeText: "A free shared folder is a fair choice for a small wedding when every guest already uses the same service and you are happy to configure access, explain the steps and organise files afterwards.",
    freeGoodFor: "Choose DIY when",
    freeGoodForText: "The guest list is small, one person can support access issues and a live gallery is not important.",
    paidGoodFor: "Choose Guest Mosaic when",
    paidGoodForText: "You want one QR code, no guest accounts, a wedding-ready gallery and less chasing after the day.",
  },
  de: {
    guestViewPill: "Was Gäste sehen",
    guestViewHeading: "Probiert den Gäste-Upload vor dem Kauf aus.",
    guestViewText:
      "Fügt unten ein Foto, ein Video oder eine Sprachnachricht hinzu — die echte Gästekarte, Schritt für Schritt. Alles bleibt im Browser und erscheint in der Demo-Galerie auf diesem Gerät.",
    uploadButton: "Hochzeitsfotos auswählen",
    uploadReady: "In der echten Galerie bereit zum Hochladen",
    uploadLocalOnly: "Private Vorschau · die Datei bleibt auf eurem Gerät",
    uploadDemoLink: "In der Demo-Galerie ansehen →",
    offerPill: "Alles inklusive",
    offerHeading: "Eine komplette Hochzeitsgalerie. Einmalig 35 €.",
    offerText: "Event erstellen, QR-Code sofort herunterladen und denselben Link während der ganzen Hochzeit nutzen.",
    offerPrice: "35 €",
    offerPriceNote: "pro Hochzeit · inkl. MwSt. · kein Abo",
    offerItems: ["Unbegrenzt viele Gäste", "Upload ohne App oder Gastkonto", "Originalfotos herunterladen", "Bis zu 20 Videos à 60 Sekunden", "Live-Slideshow und Moderation", "ZIP-Export und Galerie für 180 Tage"],
    offerCta: "Hochzeitsgalerie erstellen",
    comparisonPill: "Ehrlich verglichen",
    comparisonHeading: "Guest Mosaic oder eine kostenlose Lösung?",
    comparisonText: "WhatsApp und geteilte Ordner können funktionieren. Entscheidend ist, wie viel Einrichtung, Nachfragen und Sortieren ihr selbst übernehmen möchtet.",
    comparisonFeature: "Aufgabe",
    comparisonProduct: "Guest Mosaic",
    comparisonAlternative: "Chat oder geteilter Ordner",
    comparisonRows: [["Zugang", "QR öffnet den Browser; kein Gastkonto", "Kann Chat, Einladung oder Konto erfordern"], ["Sammeln", "Eine Galerie und ein QR-Code", "Fotos bleiben eventuell auf mehrere Orte verteilt"], ["Download", "Originale und ein ZIP-Export", "Abhängig vom Dienst und manueller Sortierung"], ["Während der Hochzeit", "Moderation und Live-Slideshow inklusive", "Meist separater Ablauf für die Anzeige"], ["Kosten", "Einmalig 35 € inkl. MwSt.", "Kann kostenlos sein, erfordert aber mehr Arbeit"]],
    freePill: "Kostenloser DIY-Ratgeber",
    freeHeading: "Wann eine kostenlose Lösung ausreicht.",
    freeText: "Ein geteilter Ordner ist für eine kleine Hochzeit fair, wenn alle denselben Dienst nutzen und ihr Zugänge, Erklärungen und die spätere Sortierung selbst übernehmt.",
    freeGoodFor: "DIY passt, wenn",
    freeGoodForText: "Die Gästeliste klein ist, jemand bei Zugangsproblemen hilft und keine Live-Galerie nötig ist.",
    paidGoodFor: "Guest Mosaic passt, wenn",
    paidGoodForText: "Ihr einen QR-Code, keine Gastkonten, eine fertige Hochzeitsgalerie und weniger Nachfragen möchtet.",
  },
  nl: {
    guestViewPill: "Wat gasten zien",
    guestViewHeading: "Probeer de upload voor gasten vóór je koopt.",
    guestViewText:
      "Voeg hieronder een foto, video of spraakbericht toe — de echte gastenkaart, stap voor stap. Alles blijft in je browser en verschijnt in de demogalerij op dit apparaat.",
    uploadButton: "Trouwfoto's kiezen",
    uploadReady: "Klaar om in de echte galerij te uploaden",
    uploadLocalOnly: "Privépreview · dit bestand blijft op je apparaat",
    uploadDemoLink: "Bekijk het in de demogalerij →",
    offerPill: "Alles inbegrepen",
    offerHeading: "Eén complete trouwgalerij. Eenmalig € 35.",
    offerText: "Maak het evenement, download de QR-code direct en gebruik dezelfde link tijdens de hele bruiloft.",
    offerPrice: "€ 35",
    offerPriceNote: "per bruiloft · inclusief btw · geen abonnement",
    offerItems: ["Onbeperkt aantal gasten", "Upload zonder app of gastenaccount", "Originele foto's downloaden", "Maximaal 20 video's van 60 seconden", "Live Slideshow en moderatie", "ZIP-export en galerij voor 180 dagen"],
    offerCta: "Maak je trouwgalerij",
    comparisonPill: "Eerlijk vergeleken",
    comparisonHeading: "Guest Mosaic of een gratis oplossing?",
    comparisonText: "WhatsApp en gedeelde mappen kunnen werken. Het verschil is hoeveel inrichting, najagen en ordenen je zelf wilt doen.",
    comparisonFeature: "Taak",
    comparisonProduct: "Guest Mosaic",
    comparisonAlternative: "Chat of gedeelde map",
    comparisonRows: [["Toegang", "QR opent in de browser; geen gastenaccount", "Kan chat, uitnodiging of account vereisen"], ["Verzamelen", "Eén galerij en één QR-code", "Foto's kunnen verspreid blijven"], ["Download", "Originelen plus één ZIP-export", "Afhankelijk van de dienst en handmatig ordenen"], ["Tijdens de bruiloft", "Moderatie en Live Slideshow inbegrepen", "Meestal een aparte presentatie nodig"], ["Kosten", "Eenmalig € 35 inclusief btw", "Kan gratis zijn, met meer werk"]],
    freePill: "Gratis doe-het-zelfgids",
    freeHeading: "Wanneer een gratis oplossing genoeg is.",
    freeText: "Een gedeelde map is prima voor een kleine bruiloft als iedereen dezelfde dienst gebruikt en je toegang, uitleg en ordening zelf wilt regelen.",
    freeGoodFor: "Kies zelf doen als",
    freeGoodForText: "De gastenlijst klein is, iemand kan helpen en een livegalerij niet belangrijk is.",
    paidGoodFor: "Kies Guest Mosaic als",
    paidGoodForText: "Je één QR-code, geen gastenaccounts, een trouwklare galerij en minder najagen wilt.",
  },
  es: {
    guestViewPill: "Lo que ven los invitados",
    guestViewHeading: "Probad la subida de invitado antes de comprar.",
    guestViewText:
      "Añade abajo una foto, un vídeo o un mensaje de voz: la tarjeta real de invitado, paso a paso. Todo se queda en tu navegador y aparece en la galería demo de este dispositivo.",
    uploadButton: "Elegir fotos de boda",
    uploadReady: "Lista para subir en la galería real",
    uploadLocalOnly: "Vista privada · el archivo no sale de tu dispositivo",
    uploadDemoLink: "Verlo en la galería demo →",
    offerPill: "Todo incluido",
    offerHeading: "Una galería de boda completa. 35 € una vez.",
    offerText: "Cread el evento, descargad el QR al momento y usad el mismo enlace durante toda la boda.",
    offerPrice: "35 €",
    offerPriceNote: "por boda · IVA incluido · sin suscripción",
    offerItems: ["Invitados ilimitados", "Subida sin app ni cuenta", "Descarga de fotos originales", "Hasta 20 vídeos de 60 segundos", "Live Slideshow y moderación", "ZIP y galería durante 180 días"],
    offerCta: "Crear galería de boda",
    comparisonPill: "Comparación honesta",
    comparisonHeading: "¿Guest Mosaic o una opción gratuita?",
    comparisonText: "WhatsApp y las carpetas compartidas pueden funcionar. La diferencia es cuánto queréis configurar, perseguir y ordenar vosotros.",
    comparisonFeature: "Tarea",
    comparisonProduct: "Guest Mosaic",
    comparisonAlternative: "Chat o carpeta compartida",
    comparisonRows: [["Acceso", "El QR abre el navegador; sin cuenta", "Puede exigir chat, invitación o cuenta"], ["Recogida", "Una galería y un QR", "Las fotos pueden quedar dispersas"], ["Descarga", "Originales y un único ZIP", "Depende del servicio y la organización manual"], ["Durante la boda", "Moderación y Live Slideshow incluidos", "Suele requerir otra solución de pantalla"], ["Coste", "35 € una vez, IVA incluido", "Puede ser gratis, con más trabajo"]],
    freePill: "Guía DIY gratuita",
    freeHeading: "Cuándo basta una solución gratuita.",
    freeText: "Una carpeta compartida es razonable para una boda pequeña si todos usan el mismo servicio y queréis gestionar accesos, ayuda y organización.",
    freeGoodFor: "Elegid DIY si",
    freeGoodForText: "Hay pocos invitados, alguien puede ayudar y no necesitáis una galería en directo.",
    paidGoodFor: "Elegid Guest Mosaic si",
    paidGoodForText: "Queréis un QR, ninguna cuenta de invitado, una galería preparada y menos seguimiento después.",
  },
  it: {
    guestViewPill: "Cosa vedono gli ospiti",
    guestViewHeading: "Provate il caricamento prima di acquistare.",
    guestViewText:
      "Aggiungi qui sotto una foto, un video o un messaggio vocale: la vera scheda per gli invitati, passo dopo passo. Tutto resta nel browser e compare nella galleria demo su questo dispositivo.",
    uploadButton: "Scegli foto del matrimonio",
    uploadReady: "Pronta per il caricamento nella galleria reale",
    uploadLocalOnly: "Anteprima privata · il file resta sul dispositivo",
    uploadDemoLink: "Guardalo nella galleria demo →",
    offerPill: "Tutto incluso",
    offerHeading: "Una galleria completa. 35 € una volta.",
    offerText: "Create l'evento, scaricate subito il QR e usate lo stesso link per tutto il matrimonio.",
    offerPrice: "35 €",
    offerPriceNote: "per matrimonio · IVA inclusa · nessun abbonamento",
    offerItems: ["Ospiti illimitati", "Caricamento senza app o account", "Download delle foto originali", "Fino a 20 video di 60 secondi", "Live Slideshow e moderazione", "ZIP e galleria per 180 giorni"],
    offerCta: "Crea la galleria",
    comparisonPill: "Confronto onesto",
    comparisonHeading: "Guest Mosaic o una soluzione gratuita?",
    comparisonText: "WhatsApp e cartelle condivise possono funzionare. La differenza è quanto volete configurare, sollecitare e organizzare da soli.",
    comparisonFeature: "Attività",
    comparisonProduct: "Guest Mosaic",
    comparisonAlternative: "Chat o cartella condivisa",
    comparisonRows: [["Accesso", "Il QR apre il browser; nessun account", "Può richiedere chat, invito o account"], ["Raccolta", "Una galleria e un QR", "Le foto possono restare sparse"], ["Download", "Originali e un unico ZIP", "Dipende dal servizio e dal lavoro manuale"], ["Durante il matrimonio", "Moderazione e Live Slideshow inclusi", "Di solito serve un flusso separato"], ["Costo", "35 € una volta, IVA inclusa", "Può essere gratis, con più lavoro"]],
    freePill: "Guida fai da te gratuita",
    freeHeading: "Quando basta una soluzione gratuita.",
    freeText: "Una cartella condivisa va bene per un matrimonio piccolo se tutti usano lo stesso servizio e volete gestire accessi, assistenza e ordine.",
    freeGoodFor: "Scegliete il fai da te se",
    freeGoodForText: "Gli invitati sono pochi, qualcuno può aiutare e la galleria live non è importante.",
    paidGoodFor: "Scegliete Guest Mosaic se",
    paidGoodForText: "Volete un QR, nessun account ospite, una galleria pronta e meno solleciti dopo l'evento.",
  },
  fr: {
    guestViewPill: "Ce que voient les invités",
    guestViewHeading: "Testez l'envoi invité avant d'acheter.",
    guestViewText:
      "Ajoutez ci-dessous une photo, une vidéo ou un message vocal : la vraie carte invité, étape par étape. Tout reste dans votre navigateur et apparaît dans la galerie démo sur cet appareil.",
    uploadButton: "Choisir des photos du mariage",
    uploadReady: "Prête à être envoyée dans la vraie galerie",
    uploadLocalOnly: "Aperçu privé · le fichier reste sur votre appareil",
    uploadDemoLink: "Voir dans la galerie démo →",
    offerPill: "Tout compris",
    offerHeading: "Une galerie de mariage complète. 35 € une fois.",
    offerText: "Créez l'événement, téléchargez immédiatement le QR et utilisez le même lien pendant tout le mariage.",
    offerPrice: "35 €",
    offerPriceNote: "par mariage · TVA incluse · sans abonnement",
    offerItems: ["Invités illimités", "Envoi sans application ni compte", "Téléchargement des originaux", "Jusqu'à 20 vidéos de 60 secondes", "Live Slideshow et modération", "ZIP et galerie pendant 180 jours"],
    offerCta: "Créer la galerie",
    comparisonPill: "Comparaison honnête",
    comparisonHeading: "Guest Mosaic ou une solution gratuite ?",
    comparisonText: "WhatsApp et les dossiers partagés peuvent fonctionner. La différence tient au temps consacré à configurer, relancer et organiser.",
    comparisonFeature: "Tâche",
    comparisonProduct: "Guest Mosaic",
    comparisonAlternative: "Chat ou dossier partagé",
    comparisonRows: [["Accès", "Le QR ouvre le navigateur ; aucun compte", "Peut nécessiter un chat, une invitation ou un compte"], ["Collecte", "Une galerie et un QR", "Les photos peuvent rester dispersées"], ["Téléchargement", "Originaux et un export ZIP", "Dépend du service et du classement manuel"], ["Pendant le mariage", "Modération et Live Slideshow inclus", "Nécessite souvent un affichage séparé"], ["Coût", "35 € une fois, TVA incluse", "Peut être gratuit, avec plus de travail"]],
    freePill: "Guide gratuit à faire soi-même",
    freeHeading: "Quand une solution gratuite suffit.",
    freeText: "Un dossier partagé convient à un petit mariage si tout le monde utilise le même service et si vous acceptez de gérer accès, aide et classement.",
    freeGoodFor: "Choisissez le DIY si",
    freeGoodForText: "La liste est courte, quelqu'un peut aider et une galerie en direct n'est pas importante.",
    paidGoodFor: "Choisissez Guest Mosaic si",
    paidGoodForText: "Vous voulez un QR, aucun compte invité, une galerie prête et moins de relances après le mariage.",
  },
};
