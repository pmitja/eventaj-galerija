export const howStepsEs = [
  { n: "1", title: "Crea tu evento", description: "Tras introducir los datos básicos y completar la compra, el acceso a la administración está listo al instante.", mobileDescription: "Introduce los datos, completa la compra y accede a la administración al instante.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Foto de una boda" },
  { n: "2", title: "Prepara el código QR", description: "El código QR está disponible en SVG y PNG. Bajo petición también preparamos una plantilla para imprimir.", mobileDescription: "Código QR en SVG y PNG; plantilla de impresión bajo petición.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Invitados en un evento" },
  { n: "3", title: "Los invitados escanean y añaden contenido", mobileTitle: "Los invitados añaden contenido", description: "Añaden fotos, vídeos cortos y mensajes de voz directamente desde el navegador. Sin aplicación y sin cuenta.", mobileDescription: "Fotos, vídeos y mensajes de voz desde el navegador. Sin aplicación y sin cuenta.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Invitado usando el móvil en un evento" },
  { n: "4", title: "Todo en un solo lugar", description: "Las fotos y los vídeos se reúnen en una galería compartida. El organizador puede gestionar el contenido, lanzar el Live Slideshow y descargar las fotos en un ZIP.", mobileDescription: "Contenido en una galería compartida, Live Slideshow y descarga en ZIP.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Recuerdos compartidos del evento" },
] as const;

export const featuresEs = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Álbum digital", description: "Las fotos de tus invitados en una galería compartida y ordenada.", mobile: "Fotos de los invitados en una galería compartida." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Vídeos cortos", description: "Se incluyen hasta 20 vídeos de 60 segundos como máximo.", mobile: "Hasta 20 vídeos de 60 segundos como máximo." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "Descarga en ZIP", description: "El organizador también puede descargar todas las fotos en un único archivo ZIP.", mobile: "Todas las fotos en un único archivo ZIP." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Sin aplicación", description: "Todo ocurre directamente en el navegador. Sin aplicación y sin cuenta de usuario.", mobile: "Todo en el navegador, sin aplicación ni cuenta." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "Código QR", description: "El código QR del evento está disponible en los formatos SVG y PNG.", mobile: "Código QR en los formatos SVG y PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live Slideshow", description: "Las fotos recién añadidas van apareciendo en un proyector o una pantalla de televisión.", mobile: "Las fotos nuevas, al momento en un proyector o una tele." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Comentarios", description: "Los invitados pueden dejar mensajes, felicitaciones y reacciones junto a las fotos.", mobile: "Mensajes, felicitaciones y reacciones junto a las fotos." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Búsqueda de fotos por rostro", mobileTitle: "Búsqueda por rostro", description: "Con un selfi, cada invitado encuentra en segundos las fotos en las que aparece.", mobile: "Con un selfi, cada invitado encuentra sus fotos en segundos." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "La IA evalúa las fotos técnicamente y ayuda a identificar las tomas borrosas y duplicadas.", mobile: "La IA evalúa las fotos técnicamente y señala borrosas y duplicadas." },
] as const;

export const plansEs = [{
  id: "event", name: "Galería del evento", price: "35 €", description: "Todo lo que necesitas para un evento",
  features: ["Galería QR sin aplicación", "Invitados ilimitados", "Fotos y comentarios", "Libro de visitas de audio", "Descarga de las fotos originales", "Hasta 20 vídeos de 60 segundos como máximo", "Administración del evento y descarga del código QR", "Live Slideshow", "Exportación de fotos en ZIP", "Galería disponible 180 días"],
  featured: true,
}] as const;

export const addOnsEs = [
  { name: "AI Best Photos", note: "hasta 3.000 fotos", price: "+15 €" },
  { name: "Vídeos ilimitados", note: "con uso razonable, hasta 1.000 vídeos", price: "+15 €" },
] as const;

export const faqsEs = [
  ["¿Los invitados tienen que instalar una aplicación?", "No. Los invitados escanean el código QR y la galería se abre directamente en el navegador. No hacen falta aplicación ni registro."],
  ["¿Cómo consigo el código QR?", "El código QR del evento se descarga en el portal de administración en SVG y PNG. Si lo necesitas, también preparamos una plantilla para imprimir."],
  ["¿Puedo descargar las fotos de los invitados?", "Sí. Puedes descargar una foto concreta directamente desde la galería. Cuando el evento termina, recibes por correo un ZIP con todas las fotos, y también puedes prepararlo tú en el portal de administración."],
  ["¿Cómo funciona el libro de visitas de audio?", "El invitado elige en la galería la opción de mensaje de voz, permite el acceso al micrófono y graba hasta dos minutos. Puede escucharlo antes de enviarlo y repetirlo si quiere. No hacen falta aplicación ni cuenta."],
  ["¿Cuánto tiempo está disponible la galería?", "La galería está disponible durante 180 días después del evento."],
  ["¿Los invitados pueden subir vídeos?", "Sí, hasta 20 vídeos por evento. Cada vídeo puede durar 60 segundos y pesar 500 MB como máximo. Los vídeos se ven en la galería, pero no en el Live Slideshow. El complemento de 15 € elimina el límite de vídeos (uso razonable, hasta 1.000 por evento)."],
  ["¿Las fotos son privadas?", "La galería no se indexa públicamente y no está protegida con contraseña, así que comparte el enlace solo con tus invitados. El organizador puede ocultar la galería entera o una foto concreta en cualquier momento."],
  ["¿Usáis nuestras fotos para marketing?", "No. Nunca usamos las fotos, los vídeos ni los mensajes de voz de tus invitados para promoción, publicidad ni nuestra propia web, y no los enviamos a herramientas de publicidad o analítica. El contenido se queda en tu galería y se elimina a los 180 días."],
  ["¿Qué incluye AI Best Photos?", "Por 15 € por evento, el complemento clasifica la calidad técnica y detecta duplicados en hasta 3.000 fotos."],
] as const;
