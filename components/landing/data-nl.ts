export const howStepsNl = [
  { n: "1", title: "Maak je evenement", description: "Na het invullen van de basisgegevens en het afronden van de aankoop is de beheeromgeving meteen klaar.", mobileDescription: "Gegevens invullen, aankoop afronden, beheeromgeving meteen klaar.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Foto van een bruiloft" },
  { n: "2", title: "Bereid de QR-code voor", description: "De QR-code is beschikbaar als SVG en PNG. Op verzoek maken we ook een printsjabloon.", mobileDescription: "QR-code als SVG en PNG; printsjabloon op verzoek.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Gasten op een evenement" },
  { n: "3", title: "Gasten scannen en voegen content toe", mobileTitle: "Gasten voegen content toe", description: "Foto's, korte video's en spraakberichten voegen ze direct in de browser toe. Zonder app en zonder account.", mobileDescription: "Foto's, video's en spraakberichten direct in de browser. Zonder app en zonder account.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Gast met een telefoon op een evenement" },
  { n: "4", title: "Alles op één plek", description: "Foto's en video's komen samen in één gedeelde galerij. De organisator beheert de content, start de Live Slideshow en downloadt foto's als ZIP.", mobileDescription: "Content in één gedeelde galerij, Live Slideshow en ZIP-download.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Gedeelde herinneringen aan het evenement" },
] as const;

export const featuresNl = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Digitaal album", description: "De foto's van je gasten in één overzichtelijke gedeelde galerij.", mobile: "Gastfoto's in één gedeelde galerij." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Korte video's", description: "Inbegrepen zijn maximaal 20 video's van hoogstens 60 seconden.", mobile: "Tot 20 video's van hoogstens 60 seconden." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "ZIP-download", description: "Alle foto's kan de organisator ook in één ZIP-bestand downloaden.", mobile: "Alle foto's in één ZIP-bestand." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Geen app", description: "Alles verloopt rechtstreeks in de browser. Zonder app en zonder account.", mobile: "Alles in de browser, zonder app of account." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "QR-code", description: "De QR-code van het evenement is beschikbaar in de formaten SVG en PNG.", mobile: "QR-code in de formaten SVG en PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live Slideshow", description: "Nieuw toegevoegde foto's verschijnen doorlopend op een beamer of tv-scherm.", mobile: "Nieuwe foto's doorlopend op beamer of tv." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Reacties", description: "Gasten kunnen bij de foto's berichten, felicitaties en reacties achterlaten.", mobile: "Berichten, felicitaties en reacties bij de foto's." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Foto's zoeken op gezicht", mobileTitle: "Zoeken op gezicht", description: "Met een selfie vindt een gast in enkele seconden de foto's waarop die staat.", mobile: "Een selfie vindt in seconden de foto's van een gast." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "AI beoordeelt foto's technisch en helpt onscherpe en dubbele opnames te herkennen.", mobile: "AI beoordeelt foto's technisch en markeert onscherpe en dubbele." },
] as const;

export const plansNl = [{
  id: "event", name: "Evenementgalerij", price: "€ 35", description: "Alles wat je nodig hebt voor één evenement",
  features: ["QR-galerij zonder app", "Onbeperkt aantal gasten", "Foto's en reacties", "Audiogastenboek", "Originele foto's downloaden", "Tot 20 video's van maximaal 60 seconden", "Evenementbeheer en QR-code downloaden", "Live Slideshow", "ZIP-export van foto's", "Galerij 180 dagen beschikbaar"],
  featured: true,
}] as const;

export const addOnsNl = [
  { name: "AI Best Photos", note: "tot 3.000 foto's", price: "+€ 15" },
  { name: "Onbeperkt video's", note: "met fair use, tot 1.000 video's", price: "+€ 15" },
] as const;

export const faqsNl = [
  ["Moeten gasten een app installeren?", "Nee. Gasten scannen de QR-code en de galerij opent direct in de browser. Een app of registratie is niet nodig."],
  ["Hoe krijg ik de QR-code?", "De QR-code van je evenement download je in het beheerportaal als SVG en PNG. Op verzoek maken we ook een drukklaar sjabloon."],
  ["Kan ik de foto's van gasten downloaden?", "Ja. Een losse foto download je rechtstreeks uit de galerij. Na afloop van het evenement komt een ZIP met alle foto's per e-mail binnen, en je kunt er ook zelf een klaarzetten in het beheerportaal."],
  ["Hoe werkt het audiogastenboek?", "Een gast kiest in de galerij de optie voor een spraakbericht, geeft toegang tot de microfoon en neemt maximaal twee minuten op. Voor het versturen kan de opname worden teruggeluisterd en zo nodig opnieuw gemaakt. Een app of account is niet nodig."],
  ["Hoe lang blijft de galerij beschikbaar?", "De galerij is na het evenement 180 dagen beschikbaar."],
  ["Kunnen gasten video's uploaden?", "Ja, tot 20 video's per evenement. Eén video duurt maximaal 60 seconden en is maximaal 500 MB. Video's staan in de galerij, maar niet in de Live Slideshow. De uitbreiding van € 15 haalt de limiet weg (fair use, tot 1.000 per evenement)."],
  ["Zijn de foto's privé?", "De evenementgalerij wordt niet openbaar geïndexeerd en is alleen bereikbaar via een niet te raden link of de QR-code. Ze is niet met een wachtwoord beveiligd, dus deel de link alleen met je gasten. De organisator kan de hele galerij of een losse foto altijd verbergen."],
  ["Wat houdt AI Best Photos in?", "Voor € 15 per evenement classificeert de uitbreiding de technische kwaliteit en detecteert duplicaten voor maximaal 3.000 foto's."],
] as const;
