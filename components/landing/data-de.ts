export const howStepsDe = [
  { n: "1", title: "Event erstellen und bezahlen", description: "Geben Sie die Daten Ihrer Organisation und Ihres Events ein und schließen Sie den sicheren Kauf ab.", mobileDescription: "Event-Daten eingeben und Kauf abschließen.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Foto einer Hochzeit" },
  { n: "2", title: "QR-Code für die Gäste herunterladen", mobileTitle: "QR-Code vorbereiten", description: "Laden Sie den QR-Code Ihres Events als SVG oder PNG herunter und ergänzen Sie damit Ihre gedruckten oder digitalen Materialien.", mobileDescription: "QR-Code als SVG oder PNG für Ihre Event-Materialien herunterladen.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Gäste auf einem Event" },
  { n: "3", title: "Gäste scannen und laden hoch — ohne Anmeldung", mobileTitle: "Gäste laden hoch — ohne Anmeldung", description: "Die Galerie läuft im Browser des Smartphones. Ihre Gäste öffnen den Link und fügen Fotos, kurze Videos oder eine Sprachnachricht hinzu — ohne App und ohne Konto.", mobileDescription: "Gäste scannen den QR-Code und fügen Fotos, Videos oder eine Sprachnachricht hinzu — ohne App und ohne Anmeldung.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Gast mit dem Smartphone auf einem Event" },
  { n: "4", title: "Gemeinsame Erinnerungen ansehen und herunterladen", mobileTitle: "Gemeinsame Erinnerungen erleben", description: "Fotos und Videos sammeln sich in einer Galerie. Der Organisator kann die Inhalte verwalten, eine Slideshow starten und ein ZIP herunterladen.", mobileDescription: "Fotos und Videos verwalten, Slideshow starten oder ZIP herunterladen.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Gemeinsame Erinnerungen an das Event" },
] as const;

export const featuresDe = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Digitales Album", description: "Die Fotos Ihrer Gäste in einer eleganten gemeinsamen Galerie.", mobile: "Gästefotos in einer gemeinsamen Galerie." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Kurze Videos", description: "20 Videos von bis zu 60 Sekunden sind in Ihrer Event-Galerie enthalten.", mobile: "20 Videos bis zu 60 Sekunden." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "ZIP-Download", description: "Der Organisator kann die Fotos der Galerie als ZIP-Datei herunterladen.", mobile: "Galeriefotos als ZIP herunterladen." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Keine App", description: "Ihre Gäste machen im Browser mit — ohne Installation und ohne Anmeldung.", mobile: "Alles läuft im Browser, ganz ohne Anmeldung." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "Druckfertiger QR-Code", mobileTitle: "QR-Code", description: "Laden Sie den QR-Code des Events als SVG oder PNG herunter und ergänzen Sie damit Ihre Materialien.", mobile: "QR-Code als SVG oder PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live-Slideshow", description: "Fotos erscheinen live auf dem Beamer oder Fernseher.", mobile: "Fotos auf Beamer oder TV." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Kommentare", description: "Gäste können Nachrichten und Glückwünsche zu Fotos hinzufügen.", mobile: "Nachrichten und Glückwünsche neben den Fotos." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "KI-Gesichtssuche", mobileTitle: "Gesichtssuche", description: "Mit einem Selfie finden Ihre Gäste in Sekunden alle Fotos, auf denen sie zu sehen sind.", mobile: "Gäste finden ihre Fotos per Selfie." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "Die KI bewertet die technische Qualität und markiert unscharfe und doppelte Fotos.", mobile: "KI markiert die besten, unscharfen und doppelten Fotos." },
] as const;

export const plansDe = [{
  id: "event", name: "Event-Galerie", price: "35 €", description: "Alles, was Sie für ein Event brauchen",
  features: ["QR-Galerie ohne App", "Unbegrenzt Gäste", "Foto-Uploads und Kommentare", "Audio-Gästebuch und Original-Downloads", "20 Videos bis zu 60 Sekunden", "Admin-Portal und QR-Downloads", "Live-Slideshow und ZIP-Export", "180 Tage Speicherung der Galerie"],
  featured: true,
}] as const;

export const addOnsDe = [["AI Best Photos · bis zu 3.000 Fotos", "+15 €"], ["Unbegrenzt Videos · Fair Use", "+15 €"]] as const;

export const faqsDe = [
  ["Müssen meine Gäste eine App installieren?", "Nein. Ihre Gäste scannen den QR-Code und die Galerie öffnet sich im Browser. Fotos lassen sich ohne App und ohne Registrierung hinzufügen."],
  ["Wie bekomme ich den QR-Code?", "Sie erhalten den QR-Code Ihres Events per E-Mail und können ihn als SVG oder PNG herunterladen."],
  ["Kann ich die Fotos meiner Gäste herunterladen?", "Ja. Einzelne Fotos laden Sie direkt aus der Galerie herunter, und im Admin-Portal können Sie einen ZIP-Export aller Fotos vorbereiten."],
  ["Wie funktioniert das Audio-Gästebuch?", "Ein Gast tippt auf die Sprachnachricht, erlaubt den Zugriff aufs Mikrofon und nimmt bis zu zwei Minuten auf. Vor dem Senden kann er sich die Aufnahme anhören und sie bei Bedarf wiederholen. Eine App oder ein Konto ist nicht nötig."],
  ["Wie lange ist die Galerie verfügbar?", "Die Galerie wird nach dem Event 180 Tage lang gespeichert."],
  ["Können Gäste Videos hochladen?", "Ja. Das Paket umfasst bis zu 20 Videos pro Event. Jedes Video darf bis zu 60 Sekunden lang und 500 MB groß sein. Unbegrenzt Videos gibt es als Erweiterung für 15 € nach Fair-Use-Prinzip."],
  ["Sind die Fotos privat?", "Die Galerie wird nicht öffentlich indexiert und ist nur über einen nicht erratbaren Link oder QR-Code erreichbar. Der Organisator steuert die Sichtbarkeit der Galerie und einzelner Fotos."],
  ["Was umfasst AI Best Photos?", "Für 15 € pro Event klassifiziert die Erweiterung die technische Qualität und erkennt Duplikate bei bis zu 3.000 Fotos."],
] as const;
