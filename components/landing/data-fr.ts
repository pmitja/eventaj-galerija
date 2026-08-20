export const howStepsFr = [
  { n: "1", title: "Créez votre événement", description: "Après la saisie des informations essentielles et le paiement, l'accès à l'administration est disponible immédiatement.", mobileDescription: "Saisissez les informations, réglez, et l'administration est disponible immédiatement.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Photo d'un mariage" },
  { n: "2", title: "Préparez le QR code", description: "Le QR code est disponible en SVG et PNG. Sur demande, nous préparons aussi un modèle pour l'impression.", mobileDescription: "QR code en SVG et PNG ; modèle d'impression sur demande.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Invités lors d'un événement" },
  { n: "3", title: "Vos invités scannent et ajoutent du contenu", mobileTitle: "Les invités ajoutent du contenu", description: "Ils ajoutent photos, courtes vidéos et messages vocaux directement dans le navigateur. Sans application et sans compte.", mobileDescription: "Photos, vidéos et messages vocaux directement dans le navigateur. Sans application ni compte.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Invité utilisant son téléphone lors d'un événement" },
  { n: "4", title: "Tout au même endroit", description: "Les photos et les vidéos sont réunies dans une galerie commune. L'organisateur gère le contenu, lance le Live Slideshow et télécharge les photos dans un ZIP.", mobileDescription: "Contenu dans une galerie commune, Live Slideshow et téléchargement ZIP.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Souvenirs partagés de l'événement" },
] as const;

export const featuresFr = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Album numérique", description: "Les photos de vos invités dans une galerie partagée et claire.", mobile: "Les photos des invités dans une galerie partagée." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Courtes vidéos", description: "Jusqu'à 20 vidéos sont incluses, d'une durée maximale de 60 secondes.", mobile: "Jusqu'à 20 vidéos de 60 secondes maximum." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "Téléchargement ZIP", description: "L'organisateur peut aussi télécharger toutes les photos dans un seul fichier ZIP.", mobile: "Toutes les photos dans un seul fichier ZIP." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Sans application", description: "Tout se passe directement dans le navigateur. Sans application et sans compte utilisateur.", mobile: "Tout dans le navigateur, sans application ni compte." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "QR code", description: "Le QR code de l'événement est disponible aux formats SVG et PNG.", mobile: "QR code aux formats SVG et PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live Slideshow", description: "Les photos qui viennent d'être ajoutées s'affichent au fil de l'événement sur un vidéoprojecteur ou un écran de télévision.", mobile: "Les nouvelles photos, en direct sur un vidéoprojecteur ou une TV." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Commentaires", description: "Vos invités peuvent laisser des messages, des vœux et des réactions à côté des photos.", mobile: "Messages, vœux et réactions à côté des photos." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Recherche de photos par visage", mobileTitle: "Recherche par visage", description: "Un selfie permet à chaque invité de retrouver en quelques secondes les photos où il apparaît.", mobile: "Un selfie retrouve les photos d'un invité en quelques secondes." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "L'IA évalue les photos sur le plan technique et aide à repérer les clichés flous et les doublons.", mobile: "L'IA évalue les photos techniquement et signale les flous et les doublons." },
] as const;

export const plansFr = [{
  id: "event", name: "Galerie d'événement", price: "35 €", description: "Tout ce qu'il faut pour un événement",
  features: ["Galerie QR sans application", "Invités illimités", "Photos et commentaires", "Livre d'or audio", "Téléchargement des photos originales", "Jusqu'à 20 vidéos de 60 secondes maximum", "Administration de l'événement et téléchargement du QR code", "Live Slideshow", "Export ZIP des photos", "Galerie disponible 180 jours"],
  featured: true,
}] as const;

export const addOnsFr = [
  { name: "AI Best Photos", note: "jusqu'à 3 000 photos", price: "+15 €" },
  { name: "Vidéos illimitées", note: "en usage raisonnable, jusqu'à 1 000 vidéos", price: "+15 €" },
] as const;

export const faqsFr = [
  ["Mes invités doivent-ils installer une application ?", "Non. Les invités scannent le QR code et la galerie s'ouvre directement dans le navigateur. Aucune application ni inscription n'est nécessaire."],
  ["Comment est-ce que je reçois le QR code ?", "Le QR code de l’événement se télécharge dans l’espace d’administration en SVG et PNG. Sur demande, nous préparons aussi un modèle prêt à imprimer."],
  ["Puis-je télécharger les photos de mes invités ?", "Oui. Vous téléchargez une photo directement depuis la galerie. À la fin de l'événement, un ZIP avec toutes les photos arrive par e-mail, et vous pouvez aussi le préparer vous-même dans le portail d'administration."],
  ["Comment fonctionne le livre d'or audio ?", "Dans la galerie, l'invité choisit le message vocal, autorise l'accès au micro et enregistre jusqu'à deux minutes. Il peut s'écouter avant d'envoyer et recommencer si besoin. Aucune application ni aucun compte n'est nécessaire."],
  ["Combien de temps la galerie reste-t-elle disponible ?", "La galerie reste disponible pendant 180 jours après l'événement."],
  ["Mes invités peuvent-ils envoyer des vidéos ?", "Oui, jusqu'à 20 vidéos par événement. Chaque vidéo peut durer 60 secondes et peser 500 Mo au maximum. Les vidéos apparaissent dans la galerie, mais pas dans le Live Slideshow. L'option à 15 € supprime la limite de vidéos (usage raisonnable, jusqu'à 1 000 par événement)."],
  ["Les photos sont-elles privées ?", "La galerie n'est pas indexée publiquement et n'est pas protégée par mot de passe : ne partagez donc le lien qu'avec vos invités. L'organisateur peut à tout moment masquer toute la galerie ou une photo."],
  ["Utilisez-vous nos photos à des fins marketing ?", "Non. Nous n'utilisons jamais les photos, vidéos et messages vocaux de vos invités pour la promotion, la publicité ou notre propre site, et nous ne les transmettons pas à des outils publicitaires ou d'analyse. Le contenu reste dans votre galerie et est supprimé après 180 jours."],
  ["Que comprend AI Best Photos ?", "Pour 15 € par événement, l'option classe la qualité technique et détecte les doublons pour un maximum de 3 000 photos."],
] as const;
