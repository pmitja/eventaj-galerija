export const howStepsNl = [
  { n: "1", title: "Maak je evenement en reken af", description: "Vul de gegevens van je organisatie en je evenement in en rond de beveiligde betaling af.", mobileDescription: "Vul de evenementgegevens in en rond je aankoop af.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Foto van een bruiloft" },
  { n: "2", title: "Download de QR-code voor je gasten", mobileTitle: "Bereid de QR-code voor", description: "Download de QR-code van je evenement als SVG of PNG en zet hem op je gedrukte of digitale materialen.", mobileDescription: "Download de QR-code als SVG of PNG voor je evenementmaterialen.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Gasten op een evenement" },
  { n: "3", title: "Gasten scannen en uploaden — zonder inloggen", mobileTitle: "Gasten uploaden — zonder inloggen", description: "De galerij werkt in de browser van de telefoon. Gasten openen de link en voegen foto's, korte video's of een spraakbericht toe, zonder app of account.", mobileDescription: "Gasten scannen de QR-code en voegen foto's, video's of een spraakbericht toe, zonder app of inloggen.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Gast met een telefoon op een evenement" },
  { n: "4", title: "Bekijk en download jullie gedeelde herinneringen", mobileTitle: "Beleef jullie gedeelde herinneringen", description: "Foto's en video's komen samen in één galerij. De organisator kan de inhoud beheren, een slideshow starten en een ZIP downloaden.", mobileDescription: "Beheer foto's en video's, start een slideshow of download een ZIP.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Gedeelde herinneringen aan het evenement" },
] as const;

export const featuresNl = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Digitaal album", description: "De foto's van je gasten in één elegante gedeelde galerij.", mobile: "Gastfoto's in één gedeelde galerij." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Korte video's", description: "20 video's van maximaal 60 seconden zitten bij je evenementgalerij inbegrepen.", mobile: "20 video's tot 60 seconden." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "ZIP-download", description: "De organisator kan de foto's uit de galerij als ZIP-bestand downloaden.", mobile: "Download galerijfoto's als ZIP." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Geen app", description: "Gasten doen mee in hun browser — zonder installatie of inloggen.", mobile: "Alles gebeurt in de browser, zonder inloggen." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "Printbare QR-code", mobileTitle: "QR-code", description: "Download de QR-code van het evenement als SVG of PNG en zet hem op je materialen.", mobile: "QR-code als SVG of PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live slideshow", description: "Foto's verschijnen live op een beamer of tv-scherm.", mobile: "Foto's op een beamer of tv." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Reacties", description: "Gasten kunnen berichten en wensen bij foto's plaatsen.", mobile: "Berichten en wensen naast de foto's." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "AI-gezichtszoeken", mobileTitle: "Gezichtszoeken", description: "Met een selfie vinden gasten binnen enkele seconden al hun foto's van het evenement.", mobile: "Gasten vinden hun foto's met een selfie." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "AI beoordeelt de technische kwaliteit en markeert onscherpe en dubbele foto's.", mobile: "AI markeert de beste, onscherpe en dubbele foto's." },
] as const;

export const plansNl = [{
  id: "event", name: "Evenementgalerij", price: "€ 35", description: "Alles wat je nodig hebt voor één evenement",
  features: ["QR-galerij zonder app", "Onbeperkt gasten", "Foto's uploaden en reacties", "Audiogastenboek en originele downloads", "20 video's tot 60 seconden", "Beheerportaal en QR-downloads", "Live slideshow en ZIP-export", "Galerij 180 dagen bewaard"],
  featured: true,
}] as const;

export const addOnsNl = [["AI Best Photos · tot 3.000 foto's", "+€ 15"], ["Onbeperkt video's · fair use", "+€ 15"]] as const;

export const faqsNl = [
  ["Moeten gasten een app installeren?", "Nee. Gasten scannen de QR-code en de galerij opent in hun browser. Ze kunnen foto's toevoegen zonder app of registratie."],
  ["Hoe krijg ik de QR-code?", "Je ontvangt de QR-code van je evenement per e-mail en kunt hem downloaden als SVG of PNG."],
  ["Kan ik de foto's van gasten downloaden?", "Ja. Een losse foto download je rechtstreeks uit de galerij, en in het beheerportaal kun je een ZIP-export van alle foto's klaarzetten."],
  ["Hoe werkt het audiogastenboek?", "Een gast tikt op de optie voor een spraakbericht, geeft toegang tot de microfoon en neemt maximaal twee minuten op. Voor het versturen kan hij terugluisteren en zo nodig opnieuw opnemen. Een app of account is niet nodig."],
  ["Hoe lang blijft de galerij beschikbaar?", "De galerij wordt na het evenement 180 dagen bewaard."],
  ["Kunnen gasten video's uploaden?", "Ja. Het pakket bevat tot 20 video's per evenement. Elke video mag maximaal 60 seconden duren en 500 MB groot zijn. Onbeperkt video's is beschikbaar als uitbreiding van € 15 met fair use."],
  ["Zijn de foto's privé?", "De galerij wordt niet openbaar geïndexeerd en is bereikbaar via een niet te raden link of QR-code. De organisator bepaalt de zichtbaarheid van de galerij en van losse foto's."],
  ["Wat houdt AI Best Photos in?", "Voor € 15 per evenement classificeert de uitbreiding de technische kwaliteit en detecteert duplicaten voor maximaal 3.000 foto's."],
] as const;
