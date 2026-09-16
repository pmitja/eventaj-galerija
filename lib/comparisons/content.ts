import { withEnglishUS } from "@/lib/i18n/english-regions";
import type { ComparisonId, ComparisonLocale } from './routes';

export type ComparisonContent = {
  headline: string;
  intro: string;
  ours: string;
  theirs: string;
  detailTitle: string;
  detail: string;
  question: string;
  answer: string;
};

// Each alternative has its own decision, explanation and objection, not just a swapped name.
export const comparisonContent: Record<ComparisonLocale, Record<ComparisonId, ComparisonContent>> = withEnglishUS({
  en: {
    whatsapp: {
      headline: 'Keep the conversation in WhatsApp. Bring the wedding photos together.',
      intro: 'Looking for a WhatsApp alternative for wedding photos? Give every guest the same QR code and collect their pictures in a gallery, without asking them to join another group.',
      ours: 'You want one wedding photo gallery, guest uploads without accounts and a live slideshow included for €35.',
      theirs: 'Your guests already use one WhatsApp group and you are happy to collect and save the photos from the conversation yourself.',
      detailTitle: 'Use the group to share the gallery link.',
      detail: 'You can keep WhatsApp for directions, reminders and thank-you messages. Send your Guest Mosaic link in that group and put the matching QR code on the tables. Guests then have one destination for wedding photos, videos and voice wishes, including those who never joined the chat.',
      question: 'Does WhatsApp always reduce photo quality?',
      answer: 'No. WhatsApp offers HD media and document sharing without compression. The practical difference is the collection process: ask guests to choose the right sending option and save their files, or give everyone a dedicated wedding gallery.',
    },
    'google-drive': {
      headline: 'Collect wedding photos without managing a shared folder.',
      intro: 'Google Drive is useful for storing files. Guest Mosaic gives your wedding guests a QR upload page, a shared gallery and a live slideshow without Google sign-in.',
      ours: 'You want guests to scan and upload without folder permissions, and you want to show the photos during your reception.',
      theirs: 'You already organise your files in Google Drive and your guests can sign in and use a shared folder.',
      detailTitle: 'A folder for your archive. A gallery for your guests.',
      detail: 'With a personal shared Drive folder, contributors need a Google account and permission to add files. Those permissions also affect what they can edit or move. Guest Mosaic separates guest uploads from event administration. After the wedding, download the photos you want to keep and store them in your own archive.',
      question: 'Can a QR code turn Google Drive into a wedding upload page?',
      answer: 'A QR code can open a shared Drive folder, but it does not change Google’s sign-in or permission requirements. Guest Mosaic’s QR code opens a purpose-built guest upload flow. It does not automatically sync your gallery to Google Drive.',
    },
    'google-photos': {
      headline: 'A wedding photo album your guests can add to without a Google account.',
      intro: 'Compare Google Photos shared albums with a wedding QR gallery. Guest Mosaic collects photos in the browser and adds voice wishes and a live photo slideshow to your celebration.',
      ours: 'You want contributions from guests without Google accounts and a gallery with a clear event upload window.',
      theirs: 'Your guests already use Google Photos and you want a collaborative album inside your existing photo library.',
      detailTitle: 'Decide how guests will contribute, not just how you will browse.',
      detail: 'Google Photos is an album and photo-library service, unlike a general Drive folder. Link sharing and collaboration control how others join and contribute. With Guest Mosaic, place the QR on your wedding stationery and guests upload directly from their phones. You can keep your Google Photos library for memories you download afterwards.',
      question: 'Is a shared Google Photos album a free wedding photo option?',
      answer: 'It can be, within your Google storage allowance. Guests use Google accounts to contribute. Guest Mosaic costs €35 per event and provides the guest upload page, printable QR code and live photo slideshow together.',
    },
    guestpix: {
      headline: 'Compare two wedding QR galleries. Choose the package you will actually use.',
      intro: 'Considering a GUESTPIX alternative? Both services let guests upload without an app. Compare Guest Mosaic’s €35 event gallery with GUESTPIX Classic on hosting, videos and the reception slideshow.',
      ours: 'You want a €35 package with guest photos, voice wishes and a live photo slideshow, and 180 days is enough to download your memories.',
      theirs: 'You value Classic’s longer hosting period, photo-and-video slideshow and included stationery templates.',
      detailTitle: 'Start with the features you need for your reception.',
      detail: 'App-free uploading is shared by both products. The decision is about the package around it. Guest Mosaic includes voice wishes and photo projection; its base video allowance is 20 short clips. Check GUESTPIX Classic if video projection and a longer hosted gallery are priorities. Compare the current checkout price before choosing.',
      question: 'Is Guest Mosaic cheaper than GUESTPIX?',
      answer: 'Guest Mosaic is €35 per event. We could not verify a numeric GUESTPIX price in the public pricing page we reviewed, so we do not claim a saving. Use the linked Classic pricing page to compare the current amount in your currency.',
    },
    kululu: {
      headline: 'A wedding gallery with a live slideshow. Compare the whole package.',
      intro: 'Guest Mosaic vs Kululu for wedding photo sharing: compare uploads, storage, video projection and the price of one event.',
      ours: 'You want a photo slideshow, voice wishes and a gallery available for 180 days, for one €35 payment.',
      theirs: 'You want photos and videos on the live wall and Plus’s upload allowance and storage period fit your event.',
      detailTitle: 'Check the upload window separately from storage.',
      detail: 'An album being available does not mean guests can upload forever. Set Guest Mosaic’s event end time to cover the period when you want contributions. With Kululu, check the active upload window of your plan as well as its storage period. Download your wedding memories before either provider’s retention ends.',
      question: 'Does Kululu have a free plan?',
      answer: 'Yes. Its pricing page lists a Free plan with limited uploads and storage. The table here compares Plus, a paid package intended for events needing more capacity. Choose based on your expected contributions and check the current promotion before paying.',
    },
    weduploader: {
      headline: 'Your wedding gallery, without connecting your Google Drive.',
      intro: 'Compare WedUploader with Guest Mosaic for collecting wedding guest photos by QR code. The main choice is where your files live and how you want to manage them after the wedding.',
      ours: 'You want event hosting included, setup by email and no Google Drive connection to configure.',
      theirs: 'You want original guest files sent directly to your own Google Drive and will manage that account’s storage.',
      detailTitle: 'Choose who will look after the storage.',
      detail: 'WedUploader connects the organiser’s Google Drive and offers guest uploads without logins. Its Premium package also lists a shared gallery and slideshow. Guest Mosaic hosts the event gallery for 180 days. You download the memories you want to retain, without granting access to a personal cloud drive.',
      question: 'Can Guest Mosaic send files straight to my Google Drive?',
      answer: 'No automatic Google Drive sync is included. You can download your photos and upload them to your own storage. If direct delivery to Drive is the deciding feature, WedUploader is worth considering; check its current Premium price and your available Google storage.',
    },
  },
  de: {
    whatsapp: {
      headline: 'Der Chat bleibt in WhatsApp. Die Hochzeitsfotos kommen zusammen.',
      intro: 'Eine WhatsApp-Alternative für Hochzeitsfotos gesucht? Mit einem QR-Code sammeln eure Gäste ihre Bilder in einer Galerie, ohne einer weiteren Gruppe beizutreten.',
      ours: 'Ihr möchtet Gästefotos ohne Anmeldung sammeln und für 35 € eine Hochzeitsgalerie mit Live-Diashow erhalten.', theirs: 'Alle nutzen schon eine WhatsApp-Gruppe und ihr möchtet die Bilder selbst aus dem Gespräch speichern.',
      detailTitle: 'Teilt den Galerielink einfach in eurer Gruppe.', detail: 'WhatsApp bleibt praktisch für Anfahrt, Erinnerungen und Dankesnachrichten. Schickt dort euren Guest-Mosaic-Link und stellt den passenden QR-Code auf die Tische. So landen Hochzeitsfotos, kurze Videos und Sprachnachrichten an einem Ort. Auch Gäste außerhalb der Gruppe können beitragen.',
      question: 'Verschlechtert WhatsApp immer die Bildqualität?', answer: 'Nein. WhatsApp bietet HD-Medien und unkomprimierten Dokumentversand. Entscheidend ist der Ablauf: Entweder erklärt ihr die passende Versandoption und speichert die Dateien selbst, oder ihr gebt allen eine eigene Hochzeitsgalerie.',
    },
    'google-drive': {
      headline: 'Hochzeitsfotos sammeln, ohne Ordnerfreigaben zu verwalten.', intro: 'Google Drive speichert eure Dateien. Guest Mosaic bietet euren Gästen einen QR-Upload, eine gemeinsame Galerie und eine Live-Diashow ohne Google-Anmeldung.',
      ours: 'Gäste sollen ohne Ordnerberechtigungen hochladen und ihre Fotos beim Fest auf einem Bildschirm sehen.', theirs: 'Ihr organisiert bereits alles in Google Drive und eure Gäste können sich anmelden und einen geteilten Ordner bedienen.',
      detailTitle: 'Ein Ordner fürs Archiv. Eine Galerie für die Gäste.', detail: 'Zum Hochladen in einen privaten freigegebenen Drive-Ordner brauchen Gäste ein Google-Konto und passende Berechtigungen. Diese bestimmen auch, was sie bearbeiten oder verschieben können. Guest Mosaic trennt den Gäste-Upload von der Verwaltung. Nach der Hochzeit ladet ihr eure Bilder herunter und archiviert sie selbst.',
      question: 'Wird Google Drive mit einem QR-Code zur Upload-Galerie?', answer: 'Ein QR-Code kann einen Drive-Ordner öffnen. Er ändert aber weder Anmeldung noch Berechtigungen. Der Guest-Mosaic-Code öffnet einen eigenen Gäste-Upload. Eine automatische Synchronisierung zu Google Drive ist nicht enthalten.',
    },
    'google-photos': {
      headline: 'Ein Hochzeitsalbum, zu dem Gäste ohne Google-Konto beitragen.', intro: 'Vergleicht geteilte Google-Fotos-Alben mit einer QR-Hochzeitsgalerie. Guest Mosaic sammelt Bilder im Browser und ergänzt Sprachnachrichten sowie eine Live-Fotodiashow.',
      ours: 'Auch Gäste ohne Google-Konto sollen beitragen, mit einem von euch festgelegten Upload-Zeitraum.', theirs: 'Eure Gäste nutzen Google Fotos und ihr möchtet ein gemeinsames Album in eurer vorhandenen Mediathek.',
      detailTitle: 'Denkt zuerst daran, wie die Bilder ins Album kommen.', detail: 'Google Fotos ist ein Fotoalbum mit Mediathek, kein allgemeiner Drive-Ordner. Linkfreigabe und Zusammenarbeit bestimmen die Beteiligung. Bei Guest Mosaic druckt ihr den QR-Code auf die Hochzeitspapeterie und Gäste laden vom Handy hoch. Heruntergeladene Erinnerungen könnt ihr später in Google Fotos aufbewahren.',
      question: 'Ist Google Fotos eine kostenlose Möglichkeit für Hochzeitsfotos?', answer: 'Innerhalb eures Google-Speichers kann ein geteiltes Album kostenlos sein. Zum Beitragen brauchen Gäste ein Google-Konto. Guest Mosaic kostet 35 € pro Event und enthält Gäste-Upload, druckbaren QR-Code und Live-Fotodiashow.',
    },
    guestpix: {
      headline: 'Zwei QR-Hochzeitsgalerien. Welches Paket braucht ihr wirklich?', intro: 'Ihr sucht eine GUESTPIX-Alternative? Beide Dienste funktionieren für Gäste ohne App. Vergleicht Guest Mosaic für 35 € mit GUESTPIX Classic bei Hosting, Videos und Diashow.',
      ours: 'Ihr sucht Gästefotos, Sprachnachrichten und Fotodiashow für 35 € und könnt eure Erinnerungen innerhalb von 180 Tagen sichern.', theirs: 'Längeres Hosting, Videos in der Diashow und enthaltene Papeterievorlagen sind euch wichtig.',
      detailTitle: 'Vergleicht die Ausstattung für eure Feier.', detail: 'Der Upload ohne App ist bei beiden vorhanden. Guest Mosaic enthält Sprachwünsche und eine Fotoprojektion; im Basispaket sind 20 kurze Videos enthalten. Prüft GUESTPIX Classic, wenn Videoprojektion und längeres Hosting entscheidend sind. Den aktuellen Kaufpreis solltet ihr direkt vergleichen.',
      question: 'Ist Guest Mosaic günstiger als GUESTPIX?', answer: 'Guest Mosaic kostet 35 € pro Event. Auf der geprüften öffentlichen GUESTPIX-Preisseite ließ sich kein konkreter Betrag bestätigen. Deshalb behaupten wir keine Ersparnis. Prüft den aktuellen Classic-Preis in eurer Währung über die Quellen.',
    },
    kululu: {
      headline: 'Hochzeitsgalerie mit Live-Diashow: Vergleicht das gesamte Paket.', intro: 'Guest Mosaic vs Kululu für Hochzeitsfotos: Vergleicht Uploads, Speicherung, Videoprojektion und den Preis pro Event.',
      ours: 'Ihr möchtet Fotodiashow, Sprachwünsche und 180 Tage Galerie für einmalig 35 €.', theirs: 'Fotos und Videos sollen auf der Live-Fotowand erscheinen und die Plus-Grenzen passen zu eurem Fest.',
      detailTitle: 'Upload-Zeitraum und Speicherung sind zwei verschiedene Dinge.', detail: 'Eine erreichbare Galerie bedeutet nicht, dass Gäste weiter hochladen können. Legt das Veranstaltungsende bei Guest Mosaic passend zu eurem Sammelzeitraum fest. Prüft bei Kululu sowohl den aktiven Zeitraum als auch die Speicherfrist. Sichert eure Bilder vor Ablauf beim jeweiligen Anbieter.',
      question: 'Gibt es Kululu kostenlos?', answer: 'Ja. Die Preisseite nennt einen Free-Tarif mit begrenzten Uploads und begrenzter Speicherung. Unsere Tabelle vergleicht den kostenpflichtigen Plus-Tarif. Wählt nach erwarteten Beiträgen und prüft die aktuelle Aktion vor dem Kauf.',
    },
    weduploader: {
      headline: 'Eure Hochzeitsgalerie, ohne Google Drive zu verbinden.', intro: 'Vergleicht WedUploader und Guest Mosaic zum Sammeln von Gästefotos per QR-Code. Entscheidend ist, wo die Dateien liegen und wer sich nach der Hochzeit darum kümmert.',
      ours: 'Ihr möchtet Hosting inklusive, Einrichtung per E-Mail und keine Verbindung mit eurem Google Drive.', theirs: 'Originale sollen direkt in eurem eigenen Google Drive landen und ihr verwaltet dessen Speicher selbst.',
      detailTitle: 'Entscheidet, wer den Speicher verwaltet.', detail: 'WedUploader verbindet das Google Drive des Veranstalters; Gäste laden ohne Login hoch. Premium führt auch eine gemeinsame Galerie und Diashow auf. Guest Mosaic hostet eure Galerie 180 Tage lang. Ihr ladet Erinnerungen herunter, ohne Zugriff auf eure persönliche Cloud freizugeben.',
      question: 'Überträgt Guest Mosaic Dateien automatisch zu Google Drive?', answer: 'Nein. Ihr könnt Fotos herunterladen und selbst in eure Cloud laden. Wenn die direkte Ablage in Drive entscheidend ist, kommt WedUploader infrage. Prüft den aktuellen Premium-Preis und euren verfügbaren Google-Speicher.',
    },
  },
  nl: {
    whatsapp: {
      headline: 'Het gesprek in WhatsApp. De trouwfoto’s bij elkaar.', intro: 'Een WhatsApp-alternatief voor trouwfoto’s? Geef gasten één QR-code en verzamel hun foto’s in een galerij, zonder nog een groepsgesprek te beginnen.',
      ours: 'Jullie willen foto’s zonder gastaccounts verzamelen en een live diavoorstelling voor €35.', theirs: 'Iedereen gebruikt al dezelfde WhatsApp-groep en jullie slaan de foto’s zelf op uit het gesprek.',
      detailTitle: 'Deel de galerijlink in jullie groep.', detail: 'Gebruik WhatsApp voor de route, herinneringen en bedankjes. Deel daar de Guest Mosaic-link en zet de bijbehorende QR-code op de tafels. Foto’s, korte video’s en gesproken wensen krijgen één bestemming. Ook gasten buiten de groep kunnen bijdragen.',
      question: 'Verlaagt WhatsApp altijd de fotokwaliteit?', answer: 'Nee. WhatsApp biedt HD-media en documenten zonder compressie. Het verschil zit vooral in het verzamelen: leg uit hoe gasten hun bestanden sturen en sla ze zelf op, of geef iedereen een speciale trouwgalerij.',
    },
    'google-drive': {
      headline: 'Verzamel trouwfoto’s zonder gedeelde mappen te beheren.', intro: 'Google Drive bewaart bestanden. Guest Mosaic geeft gasten een QR-upload, een gedeelde galerij en een live diavoorstelling zonder Google-login.',
      ours: 'Gasten moeten direct kunnen uploaden zonder mapmachtigingen en jullie willen de foto’s tijdens het feest tonen.', theirs: 'Jullie werken al met Google Drive en de gasten kunnen inloggen en een gedeelde map gebruiken.',
      detailTitle: 'Een map voor het archief. Een galerij voor de gasten.', detail: 'Voor uploaden naar een persoonlijke gedeelde Drive-map zijn een Google-account en de juiste machtigingen nodig. Die bepalen ook wat iemand kan bewerken of verplaatsen. Guest Mosaic scheidt gastuploads van het beheer. Na de bruiloft downloaden jullie de foto’s voor jullie eigen archief.',
      question: 'Maakt een QR-code van Google Drive een uploadgalerij?', answer: 'Een QR-code kan de map openen, maar verandert de Google-login en machtigingen niet. De QR-code van Guest Mosaic opent een speciale gastupload. Er is geen automatische synchronisatie met Google Drive.',
    },
    'google-photos': {
      headline: 'Een trouwalbum waar gasten zonder Google-account aan bijdragen.', intro: 'Vergelijk gedeelde Google Foto’s-albums met een trouwgalerij via QR-code. Guest Mosaic verzamelt foto’s in de browser, met gesproken wensen en een live fotodiavoorstelling.',
      ours: 'Ook gasten zonder Google-account moeten kunnen bijdragen, binnen jullie gekozen uploadperiode.', theirs: 'Jullie gasten gebruiken Google Foto’s en jullie willen een gezamenlijk album in de bestaande bibliotheek.',
      detailTitle: 'Denk eerst aan het toevoegen van foto’s.', detail: 'Google Foto’s is een fotoalbum en bibliotheek, anders dan een Drive-map. Linkdeling en samenwerken bepalen hoe anderen meedoen. Met Guest Mosaic zetten jullie de QR-code op de trouwkaartjes en uploaden gasten vanaf hun telefoon. Gedownloade herinneringen kunnen daarna naar jullie eigen Google Foto’s.',
      question: 'Is Google Foto’s gratis voor trouwfoto’s?', answer: 'Dat kan binnen jullie beschikbare Google-opslag. Gasten gebruiken een Google-account om bij te dragen. Guest Mosaic kost €35 per evenement, inclusief gastupload, afdrukbare QR-code en live fotodiavoorstelling.',
    },
    guestpix: {
      headline: 'Twee QR-trouwgalerijen. Welk pakket gaan jullie gebruiken?', intro: 'Zoeken jullie een GUESTPIX-alternatief? Bij beide diensten uploaden gasten zonder app. Vergelijk Guest Mosaic van €35 met GUESTPIX Classic op hosting, video’s en diavoorstelling.',
      ours: 'Jullie willen gastfoto’s, gesproken wensen en een fotodiavoorstelling voor €35, met 180 dagen om alles te downloaden.', theirs: 'Langere hosting, video’s in de diavoorstelling en meegeleverde druksjablonen zijn belangrijk.',
      detailTitle: 'Kijk naar wat jullie op het feest nodig hebben.', detail: 'Uploaden zonder app kan bij beide. Guest Mosaic bevat gesproken wensen en fotoprojectie, plus 20 korte video’s in het basispakket. Bekijk GUESTPIX Classic als videoprojectie en langere hosting zwaarder wegen. Vergelijk vóór aankoop de actuele prijs.',
      question: 'Is Guest Mosaic goedkoper dan GUESTPIX?', answer: 'Guest Mosaic kost €35 per evenement. Op de openbare GUESTPIX-prijspagina konden we geen bedrag bevestigen, dus we beloven geen besparing. Bekijk de actuele Classic-prijs in jullie valuta via de bronlink.',
    },
    kululu: {
      headline: 'Een trouwgalerij met live diavoorstelling. Vergelijk het hele pakket.', intro: 'Guest Mosaic vs Kululu voor trouwfoto’s: vergelijk uploads, opslag, videoprojectie en de eenmalige kosten.',
      ours: 'Jullie willen een fotodiavoorstelling, gesproken wensen en 180 dagen galerij voor eenmalig €35.', theirs: 'Jullie willen foto’s én video’s op de live wand en de Plus-limieten passen bij jullie bruiloft.',
      detailTitle: 'Uploadperiode en bewaartermijn zijn verschillend.', detail: 'Een bereikbare galerij betekent niet dat gasten nog kunnen uploaden. Stel bij Guest Mosaic de eindtijd in voor de gewenste verzamelperiode. Controleer bij Kululu zowel de actieve uploadperiode als de opslagduur. Download jullie herinneringen voordat de bewaartermijn afloopt.',
      question: 'Heeft Kululu een gratis pakket?', answer: 'Ja. De prijspagina vermeldt Free met beperkte uploads en opslag. Onze tabel vergelijkt het betaalde Plus-pakket. Kies op basis van verwachte bijdragen en controleer de actuele actie voordat jullie betalen.',
    },
    weduploader: {
      headline: 'Jullie trouwgalerij, zonder Google Drive te koppelen.', intro: 'Vergelijk WedUploader en Guest Mosaic voor trouwfoto’s via QR-code. Het belangrijkste verschil is waar de bestanden terechtkomen en hoe jullie ze bewaren.',
      ours: 'Jullie willen hosting inbegrepen, instellen via e-mail en geen koppeling met Google Drive.', theirs: 'Originele bestanden moeten direct in jullie eigen Google Drive komen en jullie beheren die opslag zelf.',
      detailTitle: 'Kies wie voor de opslag zorgt.', detail: 'WedUploader koppelt de Google Drive van de organisator; gasten uploaden zonder login. Premium vermeldt ook een gedeelde galerij en diavoorstelling. Guest Mosaic host de galerij 180 dagen. Jullie downloaden de herinneringen zonder toegang tot een persoonlijke cloud te geven.',
      question: 'Stuurt Guest Mosaic bestanden automatisch naar Google Drive?', answer: 'Nee. Jullie kunnen foto’s downloaden en zelf naar de eigen opslag uploaden. Is directe levering in Drive doorslaggevend, bekijk dan WedUploader. Controleer de Premium-prijs en de beschikbare Google-opslag.',
    },
  },
  es: {
    whatsapp: {
      headline: 'La conversación en WhatsApp. Las fotos de boda, juntas.', intro: '¿Buscáis una alternativa a WhatsApp para las fotos de boda? Dad a los invitados un QR para reunir sus imágenes en una galería, sin crear otro grupo.',
      ours: 'Queréis recopilar fotos sin cuentas de invitados y tener una proyección en directo por 35 €.', theirs: 'Todos usan el mismo grupo de WhatsApp y os encargaréis de guardar las fotos de la conversación.',
      detailTitle: 'Compartid el enlace de la galería en el grupo.', detail: 'WhatsApp sigue siendo útil para indicaciones, recordatorios y agradecimientos. Enviad allí el enlace de Guest Mosaic y colocad el mismo QR en las mesas. Las fotos, vídeos cortos y mensajes de voz tendrán un destino común, incluso para quienes no estén en el grupo.',
      question: '¿WhatsApp siempre reduce la calidad de las fotos?', answer: 'No. WhatsApp ofrece archivos HD y envío de documentos sin compresión. La diferencia está en cómo recopiláis las fotos: explicar la opción de envío y guardar archivos, o dar a todos una galería de boda.',
    },
    'google-drive': {
      headline: 'Recopilad fotos de boda sin gestionar carpetas compartidas.', intro: 'Google Drive guarda archivos. Guest Mosaic ofrece a los invitados una subida por QR, una galería compartida y proyección de fotos sin iniciar sesión en Google.',
      ours: 'Queréis que los invitados suban fotos sin permisos de carpeta y mostrarlas durante la celebración.', theirs: 'Ya organizáis los archivos en Google Drive y vuestros invitados pueden iniciar sesión y usar una carpeta compartida.',
      detailTitle: 'Una carpeta para el archivo. Una galería para los invitados.', detail: 'Subir a una carpeta personal compartida de Drive requiere cuenta de Google y permisos. Esos permisos también determinan qué se puede editar o mover. Guest Mosaic separa las subidas de invitados de la administración. Después podéis descargar las fotos para vuestro archivo.',
      question: '¿Un QR convierte Google Drive en una galería de subida?', answer: 'El QR puede abrir una carpeta, pero no cambia los requisitos de acceso ni sus permisos. El QR de Guest Mosaic abre un flujo específico para invitados. No incluye sincronización automática con Google Drive.',
    },
    'google-photos': {
      headline: 'Un álbum de boda al que aportar sin cuenta de Google.', intro: 'Comparad los álbumes compartidos de Google Fotos con una galería de boda por QR. Guest Mosaic recibe fotos en el navegador y añade mensajes de voz y proyección en directo.',
      ours: 'Queréis recibir fotos de invitados sin cuenta de Google y definir el plazo de subida del evento.', theirs: 'Los invitados ya usan Google Fotos y preferís un álbum colaborativo en vuestra biblioteca habitual.',
      detailTitle: 'Pensad primero en cómo llegarán las fotos.', detail: 'Google Fotos es un servicio de álbumes y biblioteca, distinto de una carpeta de Drive. Los ajustes del enlace y de colaboración controlan la participación. Con Guest Mosaic, imprimís el QR en las tarjetas y los invitados suben desde el móvil. Luego podéis archivar las descargas en vuestra biblioteca.',
      question: '¿Google Fotos es una opción gratuita para una boda?', answer: 'Puede serlo dentro de vuestro espacio de Google. Los invitados usan cuentas de Google para contribuir. Guest Mosaic cuesta 35 € por evento e incluye subida de invitados, QR imprimible y proyección de fotos en directo.',
    },
    guestpix: {
      headline: 'Dos galerías de boda por QR. Elegid el paquete que vais a usar.', intro: '¿Una alternativa a GUESTPIX? Ambos permiten subir sin app. Comparad Guest Mosaic de 35 € con GUESTPIX Classic en alojamiento, vídeos y proyección.',
      ours: 'Queréis fotos, mensajes de voz y proyección de fotos por 35 €, con 180 días para descargar los recuerdos.', theirs: 'Priorizáis más tiempo de alojamiento, vídeos en la proyección y plantillas de papelería incluidas.',
      detailTitle: 'Comparad lo que necesitáis durante la celebración.', detail: 'La subida sin aplicación está disponible en ambos. Guest Mosaic incluye mensajes de voz y proyección de fotos; el paquete base admite 20 vídeos cortos. Revisad GUESTPIX Classic si la proyección de vídeos y el alojamiento más largo son decisivos. Comprobad su precio actual antes de elegir.',
      question: '¿Guest Mosaic cuesta menos que GUESTPIX?', answer: 'Guest Mosaic cuesta 35 € por evento. No pudimos verificar un importe en la página pública de GUESTPIX, así que no afirmamos un ahorro. Consultad el precio actual de Classic en vuestra divisa mediante la fuente enlazada.',
    },
    kululu: {
      headline: 'Galería de boda con proyección en directo: comparad el paquete completo.', intro: 'Guest Mosaic vs Kululu para compartir fotos de boda: comparad las subidas, el almacenamiento, la proyección de vídeo y el precio por evento.',
      ours: 'Queréis proyección de fotos, mensajes de voz y galería durante 180 días por un pago de 35 €.', theirs: 'Queréis fotos y vídeos en el muro en directo y los límites de Plus encajan con vuestra boda.',
      detailTitle: 'El plazo de subida no es el tiempo de almacenamiento.', detail: 'Que una galería siga accesible no significa que admita nuevas fotos. En Guest Mosaic elegís el cierre del evento para cubrir el periodo de contribuciones. En Kululu revisad tanto la actividad del plan como la conservación. Descargad los recuerdos antes de que venza el plazo.',
      question: '¿Kululu tiene una versión gratuita?', answer: 'Sí. Su página de precios incluye Free con subidas y almacenamiento limitados. Esta tabla compara Plus, de pago. Elegid según las aportaciones previstas y comprobad la promoción vigente antes de pagar.',
    },
    weduploader: {
      headline: 'Vuestra galería de boda, sin conectar Google Drive.', intro: 'Comparad WedUploader y Guest Mosaic para recopilar fotos de invitados por QR. La clave es dónde se guardan los archivos y quién gestiona el espacio después.',
      ours: 'Queréis alojamiento incluido, configuración por correo y no conectar vuestro Google Drive.', theirs: 'Queréis recibir originales directamente en vuestro Google Drive y gestionar ese almacenamiento.',
      detailTitle: 'Elegid quién se ocupa del almacenamiento.', detail: 'WedUploader conecta el Drive del organizador y permite subidas sin login para invitados. Premium también anuncia galería compartida y proyección. Guest Mosaic aloja la galería durante 180 días. Descargáis los recuerdos sin dar acceso a vuestra nube personal.',
      question: '¿Guest Mosaic envía archivos directamente a Google Drive?', answer: 'No incluye sincronización automática. Podéis descargar las fotos y subirlas a vuestro almacenamiento. Si la entrega directa en Drive es esencial, considerad WedUploader y verificad su precio Premium y vuestro espacio disponible.',
    },
  },
  it: {
    whatsapp: {
      headline: 'La conversazione su WhatsApp. Le foto del matrimonio tutte insieme.', intro: 'Cercate un’alternativa a WhatsApp per le foto del matrimonio? Date agli invitati un QR per raccogliere gli scatti in una galleria, senza creare un altro gruppo.',
      ours: 'Volete raccogliere foto senza account ospite e avere uno slideshow dal vivo incluso a 35 €.', theirs: 'Gli invitati usano già lo stesso gruppo WhatsApp e salverete voi le foto dalla conversazione.',
      detailTitle: 'Condividete il link della galleria nel gruppo.', detail: 'Usate WhatsApp per indicazioni, promemoria e ringraziamenti. Inviate il link Guest Mosaic e mettete il QR corrispondente sui tavoli. Foto, brevi video e auguri vocali avranno un’unica destinazione, anche per chi non è nel gruppo.',
      question: 'WhatsApp riduce sempre la qualità delle foto?', answer: 'No. WhatsApp offre media HD e documenti senza compressione. Cambia il modo di raccogliere le foto: spiegare l’opzione di invio corretta e salvare i file, oppure dare a tutti una galleria di matrimonio.',
    },
    'google-drive': {
      headline: 'Raccogliete le foto del matrimonio senza gestire cartelle condivise.', intro: 'Google Drive conserva i file. Guest Mosaic offre agli invitati caricamento via QR, galleria condivisa e slideshow senza accesso a Google.',
      ours: 'Volete caricamenti senza permessi di cartella e mostrare le foto durante il ricevimento.', theirs: 'Organizzate già tutto su Google Drive e gli invitati possono accedere e usare una cartella condivisa.',
      detailTitle: 'Una cartella per l’archivio. Una galleria per gli invitati.', detail: 'Per caricare in una cartella personale condivisa di Drive servono account Google e permessi. Questi determinano anche cosa si può modificare o spostare. Guest Mosaic separa i caricamenti degli invitati dall’amministrazione. Dopo le nozze scaricate le foto e archiviatele dove preferite.',
      question: 'Un QR trasforma Google Drive in una galleria per gli invitati?', answer: 'Il QR può aprire la cartella, ma non modifica accesso e permessi. Il codice Guest Mosaic apre un caricamento pensato per gli invitati. La sincronizzazione automatica con Google Drive non è inclusa.',
    },
    'google-photos': {
      headline: 'Un album di nozze a cui contribuire senza account Google.', intro: 'Confrontate gli album condivisi di Google Foto con una galleria di matrimonio via QR. Guest Mosaic raccoglie foto nel browser, con auguri vocali e slideshow dal vivo.',
      ours: 'Volete contributi anche da chi non ha Google e un periodo di caricamento definito per l’evento.', theirs: 'Gli invitati usano già Google Foto e preferite un album collaborativo nella vostra raccolta.',
      detailTitle: 'Pensate prima a come arriveranno le foto.', detail: 'Google Foto è un servizio di album e raccolta fotografica, diverso da una cartella Drive. Link e collaborazione regolano la partecipazione. Con Guest Mosaic stampate il QR sulle partecipazioni o sui tavoli e gli invitati caricano dal telefono. Potete poi archiviare le foto scaricate nella vostra raccolta.',
      question: 'Google Foto è gratuito per raccogliere le foto di nozze?', answer: 'Può esserlo entro lo spazio Google disponibile. Per contribuire gli invitati usano un account Google. Guest Mosaic costa 35 € per evento, con caricamento ospiti, QR stampabile e slideshow fotografico dal vivo.',
    },
    guestpix: {
      headline: 'Due gallerie di nozze con QR. Quale pacchetto userete davvero?', intro: 'Cercate un’alternativa a GUESTPIX? Entrambi permettono agli invitati di caricare senza app. Confrontate Guest Mosaic da 35 € e GUESTPIX Classic per hosting, video e slideshow.',
      ours: 'Volete foto, auguri vocali e slideshow a 35 €, con 180 giorni per scaricare i ricordi.', theirs: 'Preferite hosting più lungo, video nello slideshow e modelli di cartoncini inclusi.',
      detailTitle: 'Partite dalle funzioni per il ricevimento.', detail: 'Il caricamento senza app è comune a entrambi. Guest Mosaic include auguri vocali e proiezione di foto; il pacchetto base ammette 20 video brevi. Valutate GUESTPIX Classic se proiezione video e hosting più lungo sono prioritari. Confrontate il prezzo attuale prima dell’acquisto.',
      question: 'Guest Mosaic costa meno di GUESTPIX?', answer: 'Guest Mosaic costa 35 € per evento. Non abbiamo potuto verificare un importo nel listino pubblico GUESTPIX, quindi non promettiamo un risparmio. Consultate il prezzo Classic aggiornato nella vostra valuta tramite la fonte.',
    },
    kululu: {
      headline: 'Galleria di nozze e slideshow dal vivo: confrontate tutto il pacchetto.', intro: 'Guest Mosaic vs Kululu per le foto del matrimonio: confrontate caricamenti, archiviazione, proiezione video e prezzo per evento.',
      ours: 'Volete slideshow di foto, auguri vocali e galleria per 180 giorni a 35 € una tantum.', theirs: 'Volete foto e video sulla parete live e i limiti Plus sono adatti al vostro evento.',
      detailTitle: 'Caricamento e conservazione hanno scadenze diverse.', detail: 'Una galleria accessibile non accetta necessariamente altri caricamenti. Impostate la fine dell’evento Guest Mosaic in base al periodo in cui volete ricevere foto. Su Kululu controllate sia la finestra attiva sia l’archiviazione. Scaricate i ricordi prima della scadenza.',
      question: 'Kululu ha un piano gratuito?', answer: 'Sì. Il listino presenta Free con caricamenti e archiviazione limitati. La tabella confronta Plus, a pagamento. Scegliete in base ai contributi previsti e verificate la promozione attuale prima di pagare.',
    },
    weduploader: {
      headline: 'La vostra galleria di nozze, senza collegare Google Drive.', intro: 'Confrontate WedUploader e Guest Mosaic per raccogliere foto tramite QR. La differenza principale è dove finiscono i file e chi gestisce lo spazio dopo le nozze.',
      ours: 'Volete hosting incluso, configurazione via email e nessun collegamento a Google Drive.', theirs: 'Volete gli originali direttamente nel vostro Drive e gestire personalmente lo spazio disponibile.',
      detailTitle: 'Scegliete chi si occuperà dell’archiviazione.', detail: 'WedUploader collega il Drive dell’organizzatore; gli invitati caricano senza login. Premium indica anche galleria condivisa e slideshow. Guest Mosaic ospita la galleria per 180 giorni. Scaricate i ricordi senza concedere accesso al vostro cloud personale.',
      question: 'Guest Mosaic invia i file direttamente a Google Drive?', answer: 'Non è inclusa la sincronizzazione automatica. Potete scaricare le foto e caricarle nel vostro archivio. Se l’invio diretto a Drive è essenziale, valutate WedUploader verificando prezzo Premium e spazio Google disponibile.',
    },
  },
  fr: {
    whatsapp: {
      headline: 'La conversation sur WhatsApp. Les photos du mariage réunies.', intro: 'Vous cherchez une alternative à WhatsApp pour vos photos de mariage ? Donnez aux invités un QR code vers une galerie commune, sans créer un nouveau groupe.',
      ours: 'Vous voulez recevoir des photos sans compte invité et profiter d’un diaporama en direct pour 35 €.', theirs: 'Tout le monde utilise déjà le même groupe WhatsApp et vous enregistrerez les photos de la conversation vous-mêmes.',
      detailTitle: 'Partagez le lien de la galerie dans votre groupe.', detail: 'Gardez WhatsApp pour les indications, rappels et remerciements. Envoyez le lien Guest Mosaic et posez le QR code correspondant sur les tables. Photos, courtes vidéos et messages vocaux auront une destination commune, même pour les invités absents du groupe.',
      question: 'WhatsApp réduit-il toujours la qualité des photos ?', answer: 'Non. WhatsApp propose des médias HD et l’envoi de documents sans compression. La différence tient à la collecte : expliquer le bon mode d’envoi et enregistrer les fichiers, ou proposer une galerie de mariage à tous.',
    },
    'google-drive': {
      headline: 'Récupérez les photos du mariage sans gérer de dossier partagé.', intro: 'Google Drive conserve les fichiers. Guest Mosaic propose un dépôt par QR code, une galerie commune et un diaporama sans connexion Google pour les invités.',
      ours: 'Vous souhaitez des dépôts sans autorisations de dossier et afficher les photos pendant la réception.', theirs: 'Vous classez déjà vos fichiers dans Drive et vos invités savent se connecter et utiliser un dossier partagé.',
      detailTitle: 'Un dossier pour les archives. Une galerie pour les invités.', detail: 'Déposer dans un dossier personnel partagé sur Drive nécessite un compte Google et des autorisations. Celles-ci déterminent aussi ce qui peut être modifié ou déplacé. Guest Mosaic sépare les dépôts des invités de l’administration. Après le mariage, téléchargez les photos pour vos archives.',
      question: 'Un QR code transforme-t-il Google Drive en galerie de dépôt ?', answer: 'Le QR code peut ouvrir le dossier, mais ne change ni la connexion ni les autorisations. Celui de Guest Mosaic ouvre un dépôt conçu pour les invités. La synchronisation automatique avec Google Drive n’est pas incluse.',
    },
    'google-photos': {
      headline: 'Un album de mariage auquel contribuer sans compte Google.', intro: 'Comparez les albums partagés Google Photos avec une galerie de mariage par QR code. Guest Mosaic reçoit les photos dans le navigateur et ajoute messages vocaux et diaporama en direct.',
      ours: 'Vous voulez des contributions sans compte Google et une période de dépôt définie pour votre événement.', theirs: 'Vos invités utilisent Google Photos et vous souhaitez un album collaboratif dans votre photothèque habituelle.',
      detailTitle: 'Pensez d’abord à la manière de recevoir les photos.', detail: 'Google Photos est un service d’albums et de photothèque, distinct d’un dossier Drive. Partage de lien et collaboration règlent la participation. Avec Guest Mosaic, imprimez le QR code sur vos cartes et les invités déposent depuis leur téléphone. Vous pourrez ensuite archiver les téléchargements dans votre photothèque.',
      question: 'Google Photos est-il gratuit pour les photos de mariage ?', answer: 'Cela peut être le cas dans la limite de votre stockage Google. Les invités utilisent un compte Google pour contribuer. Guest Mosaic coûte 35 € par événement, avec dépôt invité, QR code imprimable et diaporama photo en direct.',
    },
    guestpix: {
      headline: 'Deux galeries de mariage par QR code. Quelle formule vous convient ?', intro: 'Vous cherchez une alternative à GUESTPIX ? Les deux services fonctionnent sans application pour les invités. Comparez Guest Mosaic à 35 € et GUESTPIX Classic sur l’hébergement, les vidéos et le diaporama.',
      ours: 'Vous voulez photos, messages vocaux et diaporama photo pour 35 €, avec 180 jours pour télécharger les souvenirs.', theirs: 'Vous privilégiez un hébergement plus long, des vidéos dans le diaporama et des modèles de papeterie inclus.',
      detailTitle: 'Comparez ce que vous utiliserez à la réception.', detail: 'Le dépôt sans application existe chez les deux. Guest Mosaic comprend les messages vocaux et la projection photo ; la formule de base inclut 20 vidéos courtes. Examinez GUESTPIX Classic si la projection vidéo et un hébergement plus long sont prioritaires. Vérifiez son prix actuel avant de choisir.',
      question: 'Guest Mosaic coûte-t-il moins cher que GUESTPIX ?', answer: 'Guest Mosaic coûte 35 € par événement. Nous n’avons pas pu confirmer de montant sur la page tarifaire publique GUESTPIX consultée. Nous ne promettons donc pas d’économie. Vérifiez le tarif Classic actuel dans votre devise via la source.',
    },
    kululu: {
      headline: 'Galerie de mariage et diaporama en direct : comparez toute la formule.', intro: 'Guest Mosaic vs Kululu pour les photos de mariage : comparez les dépôts, le stockage, la projection vidéo et le prix par événement.',
      ours: 'Vous voulez un diaporama photo, des messages vocaux et 180 jours de galerie pour un paiement de 35 €.', theirs: 'Vous souhaitez afficher photos et vidéos sur le mur en direct et les limites Plus conviennent à votre réception.',
      detailTitle: 'Distinguez période de dépôt et durée de conservation.', detail: 'Une galerie accessible n’accepte pas forcément de nouvelles photos. Réglez la fin de votre événement Guest Mosaic selon la période de collecte souhaitée. Chez Kululu, vérifiez la période active et le stockage de la formule. Téléchargez vos souvenirs avant leur échéance.',
      question: 'Kululu propose-t-il une formule gratuite ?', answer: 'Oui. La page tarifaire présente Free avec des dépôts et un stockage limités. Notre tableau compare la formule payante Plus. Choisissez selon les contributions attendues et vérifiez la promotion actuelle avant de payer.',
    },
    weduploader: {
      headline: 'Votre galerie de mariage, sans connecter Google Drive.', intro: 'Comparez WedUploader et Guest Mosaic pour récupérer les photos par QR code. Le choix porte surtout sur l’emplacement des fichiers et leur gestion après le mariage.',
      ours: 'Vous souhaitez un hébergement inclus, une configuration par e-mail et aucune connexion à Google Drive.', theirs: 'Vous voulez les originaux directement dans votre propre Drive et en gérer vous-mêmes le stockage.',
      detailTitle: 'Choisissez qui s’occupera du stockage.', detail: 'WedUploader connecte le Drive de l’organisateur ; les invités déposent sans connexion. Premium annonce aussi une galerie partagée et un diaporama. Guest Mosaic héberge la galerie pendant 180 jours. Vous téléchargez les souvenirs sans donner accès à votre cloud personnel.',
      question: 'Guest Mosaic envoie-t-il les fichiers directement dans Google Drive ?', answer: 'La synchronisation automatique n’est pas incluse. Téléchargez les photos puis importez-les dans votre stockage. Si l’envoi direct vers Drive est essentiel, envisagez WedUploader en vérifiant son tarif Premium et votre espace Google disponible.',
    },
  },
});
