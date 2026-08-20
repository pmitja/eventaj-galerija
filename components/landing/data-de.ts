export const howStepsDe = [
  { n: "1", title: "Event erstellen", description: "Nach Eingabe der wichtigsten Daten und abgeschlossenem Kauf steht der Zugang zur Verwaltung sofort bereit.", mobileDescription: "Daten eingeben, Kauf abschließen, Verwaltung sofort bereit.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Foto einer Hochzeit" },
  { n: "2", title: "QR-Code vorbereiten", description: "Der QR-Code steht als SVG und PNG bereit. Auf Wunsch bereiten wir auch eine Druckvorlage vor.", mobileDescription: "QR-Code als SVG und PNG; Druckvorlage auf Wunsch.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Gäste auf einem Event" },
  { n: "3", title: "Gäste scannen und fügen Inhalte hinzu", mobileTitle: "Gäste fügen Inhalte hinzu", description: "Fotos, kurze Videos und Sprachnachrichten fügen sie direkt im Browser hinzu. Ohne App und ohne Benutzerkonto.", mobileDescription: "Fotos, Videos und Sprachnachrichten direkt im Browser. Ohne App und ohne Konto.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Gast mit dem Smartphone auf einem Event" },
  { n: "4", title: "Alles an einem Ort", description: "Fotos und Videos sammeln sich in einer gemeinsamen Galerie. Der Organisator verwaltet die Inhalte, startet die Live Slideshow und lädt Fotos als ZIP herunter.", mobileDescription: "Inhalte in einer gemeinsamen Galerie, Live Slideshow und ZIP-Download.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Gemeinsame Erinnerungen an das Event" },
] as const;

export const featuresDe = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Digitales Album", description: "Die Fotos Ihrer Gäste in einer übersichtlichen gemeinsamen Galerie.", mobile: "Gästefotos in einer gemeinsamen Galerie." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Kurze Videos", description: "Enthalten sind bis zu 20 Videos von höchstens 60 Sekunden Länge.", mobile: "Bis zu 20 Videos, höchstens 60 Sekunden." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "ZIP-Download", description: "Alle Fotos kann der Organisator auch in einer einzigen ZIP-Datei herunterladen.", mobile: "Alle Fotos in einer einzigen ZIP-Datei." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Keine App", description: "Alles läuft direkt im Browser. Ohne App und ohne Benutzerkonto.", mobile: "Alles im Browser, ohne App und ohne Konto." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "QR-Code", description: "Der QR-Code des Events steht in den Formaten SVG und PNG bereit.", mobile: "QR-Code in den Formaten SVG und PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live Slideshow", description: "Neu hinzugefügte Fotos erscheinen laufend auf dem Beamer oder TV-Bildschirm.", mobile: "Neue Fotos laufend auf Beamer oder TV." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Kommentare", description: "Gäste können bei den Fotos Nachrichten, Glückwünsche und Reaktionen hinterlassen.", mobile: "Nachrichten, Glückwünsche und Reaktionen bei den Fotos." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Fotosuche per Gesicht", mobileTitle: "Fotosuche", description: "Ein Selfie hilft dem Gast, in Sekunden die eigenen Fotos vom Event zu finden.", mobile: "Ein Selfie findet in Sekunden die Fotos des Gastes." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "Die KI bewertet Fotos technisch und hilft, unscharfe und doppelte Aufnahmen zu erkennen.", mobile: "Die KI bewertet Fotos technisch und markiert unscharfe und doppelte." },
] as const;

export const plansDe = [{
  id: "event", name: "Event-Galerie", price: "35 €", description: "Alles, was Sie für ein Event brauchen",
  features: ["QR-Galerie ohne App", "Unbegrenzt viele Gäste", "Fotos und Kommentare", "Audio-Gästebuch", "Download der Originalfotos", "Bis zu 20 Videos, je maximal 60 Sekunden", "Event-Verwaltung und QR-Code-Download", "Live Slideshow", "ZIP-Export der Fotos", "Galerie 180 Tage verfügbar"],
  featured: true,
}] as const;

export const addOnsDe = [
  { name: "AI Best Photos", note: "bis zu 3.000 Fotos", price: "+15 €" },
  { name: "Unbegrenzt Videos", note: "nach Fair-Use-Regel, bis zu 1.000 Videos", price: "+15 €" },
] as const;

export const faqsDe = [
  ["Müssen meine Gäste eine App installieren?", "Nein. Gäste scannen den QR-Code, die Galerie öffnet sich direkt im Browser. App und Registrierung sind nicht nötig."],
  ["Wie bekomme ich den QR-Code?", "Den QR-Code des Events können Sie im Administrationsbereich als SVG und PNG herunterladen. Auf Wunsch bereiten wir auch eine Druckvorlage vor."],
  ["Kann ich die Fotos meiner Gäste herunterladen?", "Ja. Einzelne Fotos laden Sie direkt aus der Galerie herunter. Nach dem Ende des Events kommt ein ZIP mit allen Fotos per E-Mail, und Sie können es jederzeit auch selbst im Admin-Portal erstellen."],
  ["Wie funktioniert das Audio-Gästebuch?", "Ein Gast wählt in der Galerie die Sprachnachricht, erlaubt den Zugriff aufs Mikrofon und nimmt bis zu zwei Minuten auf. Vor dem Senden lässt sich die Aufnahme anhören und bei Bedarf wiederholen. App und Konto sind nicht nötig."],
  ["Wie lange ist die Galerie verfügbar?", "Die Galerie ist nach dem Event 180 Tage verfügbar."],
  ["Können Gäste Videos hochladen?", "Ja, bis zu 20 Videos pro Event. Ein Video darf höchstens 60 Sekunden lang und 500 MB groß sein. Videos erscheinen in der Galerie, nicht aber in der Live Slideshow. Die Erweiterung für 15 € hebt die Videobegrenzung auf (faire Nutzung, bis zu 1.000 pro Event)."],
  ["Sind die Fotos privat?", "Die Galerie wird nicht öffentlich indexiert und ist nicht passwortgeschützt, teilen Sie den Link also nur mit Ihren Gästen. Der Organisator kann die gesamte Galerie oder einzelne Fotos jederzeit ausblenden."],
  ["Nutzen Sie unsere Fotos für Marketing?", "Nein. Fotos, Videos und Sprachnachrichten Ihrer Gäste verwenden wir nie für Promotion, Werbung oder unsere eigene Website und übermitteln sie nicht an Werbe- oder Analysetools. Die Inhalte bleiben in Ihrer Galerie und werden nach 180 Tagen gelöscht."],
  ["Was umfasst AI Best Photos?", "Für 15 € pro Event klassifiziert die Erweiterung die technische Qualität und erkennt Duplikate bei bis zu 3.000 Fotos."],
] as const;
