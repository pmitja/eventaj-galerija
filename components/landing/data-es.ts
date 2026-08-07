export const howStepsEs = [
  { n: "1", title: "Crea tu evento y págalo", description: "Introduce los datos de tu organización y de tu evento y completa la compra segura.", mobileDescription: "Introduce los datos del evento y completa la compra.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Foto de una boda" },
  { n: "2", title: "Descarga el código QR para tus invitados", mobileTitle: "Prepara el código QR", description: "Descarga el código QR de tu evento en SVG o PNG y añádelo a tus materiales impresos o digitales.", mobileDescription: "Descarga el código QR en SVG o PNG para los materiales del evento.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Invitados en un evento" },
  { n: "3", title: "Los invitados escanean y suben — sin registrarse", mobileTitle: "Los invitados suben — sin registrarse", description: "La galería funciona en el navegador del móvil. Los invitados abren el enlace y añaden fotos, vídeos cortos o un mensaje de voz sin aplicación ni cuenta.", mobileDescription: "Los invitados escanean el QR y añaden fotos, vídeos o un mensaje de voz sin aplicación ni registro.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Invitado usando el móvil en un evento" },
  { n: "4", title: "Revisa y descarga vuestros recuerdos compartidos", mobileTitle: "Revive vuestros recuerdos", description: "Las fotos y los vídeos se reúnen en una sola galería. El organizador puede gestionar el contenido, lanzar un slideshow y descargar un ZIP.", mobileDescription: "Gestiona fotos y vídeos, lanza un slideshow o descarga un ZIP.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Recuerdos compartidos del evento" },
] as const;

export const featuresEs = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Álbum digital", description: "Las fotos de tus invitados en una elegante galería compartida.", mobile: "Fotos de los invitados en una galería compartida." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Vídeos cortos", description: "Tu galería del evento incluye 20 vídeos de hasta 60 segundos.", mobile: "20 vídeos de hasta 60 segundos." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "Descarga en ZIP", description: "El organizador puede descargar las fotos de la galería en un archivo ZIP.", mobile: "Descarga las fotos de la galería en ZIP." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Sin aplicación", description: "Los invitados participan desde el navegador, sin instalar nada ni registrarse.", mobile: "Todo ocurre en el navegador, sin registro." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "Código QR imprimible", mobileTitle: "Código QR", description: "Descarga el código QR del evento en SVG o PNG y añádelo a tus materiales.", mobile: "Código QR en formato SVG o PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Slideshow en directo", description: "Las fotos aparecen en directo en un proyector o una pantalla de televisión.", mobile: "Fotos en un proyector o una tele." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Comentarios", description: "Los invitados pueden añadir mensajes y felicitaciones a las fotos.", mobile: "Mensajes y felicitaciones junto a las fotos." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Búsqueda facial con IA", mobileTitle: "Búsqueda facial", description: "Con un selfi, los invitados encuentran en segundos todas sus fotos del evento.", mobile: "Los invitados encuentran sus fotos con un selfi." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "La IA evalúa la calidad técnica y señala las fotos borrosas y duplicadas.", mobile: "La IA señala las mejores, las borrosas y las duplicadas." },
] as const;

export const plansEs = [{
  id: "event", name: "Galería del evento", price: "35 €", description: "Todo lo que necesitas para un evento",
  features: ["Galería QR sin aplicación", "Invitados ilimitados", "Subida de fotos y comentarios", "Libro de visitas de audio y descargas originales", "20 vídeos de hasta 60 segundos", "Portal de administración y descargas del QR", "Slideshow en directo y exportación en ZIP", "Galería conservada 180 días"],
  featured: true,
}] as const;

export const addOnsEs = [["AI Best Photos · hasta 3.000 fotos", "+15 €"], ["Vídeos ilimitados · uso razonable", "+15 €"]] as const;

export const faqsEs = [
  ["¿Los invitados tienen que instalar una aplicación?", "No. Los invitados escanean el código QR y la galería se abre en su navegador. Pueden añadir fotos sin aplicación ni registro."],
  ["¿Cómo consigo el código QR?", "Recibes el código QR de tu evento por correo electrónico y puedes descargarlo en SVG o PNG."],
  ["¿Puedo descargar las fotos de los invitados?", "Sí. Puedes descargar una foto concreta directamente desde la galería y preparar una exportación en ZIP de todas las fotos en el portal de administración."],
  ["¿Cómo funciona el libro de visitas de audio?", "El invitado toca la opción de mensaje de voz, permite el acceso al micrófono y graba hasta dos minutos. Puede escucharlo antes de enviarlo y volver a grabarlo si quiere. No hace falta aplicación ni cuenta."],
  ["¿Cuánto tiempo está disponible la galería?", "La galería se conserva durante 180 días después del evento."],
  ["¿Los invitados pueden subir vídeos?", "Sí. El paquete incluye hasta 20 vídeos por evento. Cada vídeo puede durar hasta 60 segundos y pesar hasta 500 MB. Los vídeos ilimitados están disponibles como complemento de 15 € con política de uso razonable."],
  ["¿Las fotos son privadas?", "La galería no se indexa públicamente y se accede a ella mediante un enlace impredecible o un código QR. El organizador controla la visibilidad de la galería y de cada foto."],
  ["¿Qué incluye AI Best Photos?", "Por 15 € por evento, el complemento clasifica la calidad técnica y detecta duplicados en hasta 3.000 fotos."],
] as const;
