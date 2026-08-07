export const howStepsFr = [
  { n: "1", title: "Créez votre événement et réglez", description: "Renseignez les informations de votre organisation et de votre événement, puis finalisez l'achat sécurisé.", mobileDescription: "Renseignez les informations de l'événement et finalisez l'achat.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Photo d'un mariage" },
  { n: "2", title: "Téléchargez le QR code pour vos invités", mobileTitle: "Préparez le QR code", description: "Téléchargez le QR code de votre événement en SVG ou PNG et ajoutez-le à vos supports imprimés ou numériques.", mobileDescription: "Téléchargez le QR code en SVG ou PNG pour vos supports.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Invités lors d'un événement" },
  { n: "3", title: "Vos invités scannent et envoient — sans inscription", mobileTitle: "Vos invités envoient — sans inscription", description: "La galerie fonctionne dans le navigateur du téléphone. Vos invités ouvrent le lien et ajoutent des photos, de courtes vidéos ou un message vocal, sans application ni compte.", mobileDescription: "Vos invités scannent le QR code et ajoutent photos, vidéos ou message vocal, sans application ni inscription.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Invité utilisant son téléphone lors d'un événement" },
  { n: "4", title: "Parcourez et téléchargez vos souvenirs partagés", mobileTitle: "Revivez vos souvenirs partagés", description: "Photos et vidéos se rassemblent dans une seule galerie. L'organisateur peut gérer le contenu, lancer un diaporama et télécharger un ZIP.", mobileDescription: "Gérez photos et vidéos, lancez un diaporama ou téléchargez un ZIP.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Souvenirs partagés de l'événement" },
] as const;

export const featuresFr = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Album numérique", description: "Les photos de vos invités dans une élégante galerie partagée.", mobile: "Les photos des invités dans une galerie partagée." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Courtes vidéos", description: "20 vidéos de 60 secondes maximum sont incluses dans votre galerie d'événement.", mobile: "20 vidéos jusqu'à 60 secondes." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "Téléchargement ZIP", description: "L'organisateur peut télécharger les photos de la galerie dans un fichier ZIP.", mobile: "Téléchargez les photos de la galerie en ZIP." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Sans application", description: "Vos invités participent depuis leur navigateur, sans installation ni inscription.", mobile: "Tout se passe dans le navigateur, sans inscription." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "QR code imprimable", mobileTitle: "QR code", description: "Téléchargez le QR code de l'événement en SVG ou PNG et ajoutez-le à vos supports.", mobile: "QR code au format SVG ou PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Diaporama en direct", description: "Les photos s'affichent en direct sur un vidéoprojecteur ou un écran de télévision.", mobile: "Les photos sur un vidéoprojecteur ou une TV." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Commentaires", description: "Vos invités peuvent ajouter des messages et des vœux aux photos.", mobile: "Messages et vœux à côté des photos." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Recherche de visage par IA", mobileTitle: "Recherche de visage", description: "Avec un selfie, vos invités retrouvent en quelques secondes toutes leurs photos de l'événement.", mobile: "Vos invités retrouvent leurs photos avec un selfie." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "L'IA évalue la qualité technique et signale les photos floues et les doublons.", mobile: "L'IA signale les meilleures, les floues et les doublons." },
] as const;

export const plansFr = [{
  id: "event", name: "Galerie d'événement", price: "35 €", description: "Tout ce qu'il faut pour un événement",
  features: ["Galerie QR sans application", "Invités illimités", "Envoi de photos et commentaires", "Livre d'or audio et téléchargement des originaux", "20 vidéos jusqu'à 60 secondes", "Portail d'administration et téléchargement du QR", "Diaporama en direct et export ZIP", "Galerie conservée 180 jours"],
  featured: true,
}] as const;

export const addOnsFr = [["AI Best Photos · jusqu'à 3 000 photos", "+15 €"], ["Vidéos illimitées · usage raisonnable", "+15 €"]] as const;

export const faqsFr = [
  ["Mes invités doivent-ils installer une application ?", "Non. Vos invités scannent le QR code et la galerie s'ouvre dans leur navigateur. Ils peuvent ajouter des photos sans application ni inscription."],
  ["Comment est-ce que je reçois le QR code ?", "Vous recevez le QR code de votre événement par e-mail et pouvez le télécharger en SVG ou PNG."],
  ["Puis-je télécharger les photos de mes invités ?", "Oui. Vous téléchargez une photo directement depuis la galerie, et vous pouvez préparer un export ZIP de toutes les photos dans le portail d'administration."],
  ["Comment fonctionne le livre d'or audio ?", "L'invité appuie sur l'option message vocal, autorise l'accès au micro et enregistre jusqu'à deux minutes. Il peut s'écouter avant d'envoyer et recommencer si besoin. Aucune application ni aucun compte n'est nécessaire."],
  ["Combien de temps la galerie reste-t-elle disponible ?", "La galerie est conservée pendant 180 jours après l'événement."],
  ["Mes invités peuvent-ils envoyer des vidéos ?", "Oui. L'offre comprend jusqu'à 20 vidéos par événement. Chaque vidéo peut durer jusqu'à 60 secondes et peser jusqu'à 500 Mo. Les vidéos illimitées sont proposées en option à 15 €, dans le cadre d'un usage raisonnable."],
  ["Les photos sont-elles privées ?", "La galerie n'est pas indexée publiquement et reste accessible via un lien imprévisible ou un QR code. L'organisateur contrôle la visibilité de la galerie et de chaque photo."],
  ["Que comprend AI Best Photos ?", "Pour 15 € par événement, l'option classe la qualité technique et détecte les doublons pour un maximum de 3 000 photos."],
] as const;
