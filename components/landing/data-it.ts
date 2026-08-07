export const howStepsIt = [
  { n: "1", title: "Crea il tuo evento e paga", description: "Inserisci i dati della tua organizzazione e del tuo evento e completa l'acquisto sicuro.", mobileDescription: "Inserisci i dati dell'evento e completa l'acquisto.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Foto di un matrimonio" },
  { n: "2", title: "Scarica il codice QR per gli ospiti", mobileTitle: "Prepara il codice QR", description: "Scarica il codice QR del tuo evento in SVG o PNG e aggiungilo ai tuoi materiali stampati o digitali.", mobileDescription: "Scarica il codice QR in SVG o PNG per i materiali dell'evento.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Ospiti a un evento" },
  { n: "3", title: "Gli ospiti scansionano e caricano — senza accedere", mobileTitle: "Gli ospiti caricano — senza accedere", description: "La galleria funziona nel browser dello smartphone. Gli ospiti aprono il link e aggiungono foto, brevi video o un messaggio vocale, senza app e senza account.", mobileDescription: "Gli ospiti scansionano il QR e aggiungono foto, video o un messaggio vocale, senza app né accesso.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Ospite che usa lo smartphone a un evento" },
  { n: "4", title: "Rivedi e scarica i vostri ricordi condivisi", mobileTitle: "Rivivi i vostri ricordi", description: "Foto e video si raccolgono in un'unica galleria. L'organizzatore può gestire i contenuti, avviare uno slideshow e scaricare uno ZIP.", mobileDescription: "Gestisci foto e video, avvia uno slideshow o scarica uno ZIP.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Ricordi condivisi dell'evento" },
] as const;

export const featuresIt = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Album digitale", description: "Le foto dei tuoi ospiti in un'unica elegante galleria condivisa.", mobile: "Le foto degli ospiti in un'unica galleria condivisa." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Brevi video", description: "La tua galleria dell'evento include 20 video fino a 60 secondi.", mobile: "20 video fino a 60 secondi." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "Download ZIP", description: "L'organizzatore può scaricare le foto della galleria in un file ZIP.", mobile: "Scarica le foto della galleria in ZIP." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Nessuna app", description: "Gli ospiti partecipano dal browser, senza installare nulla e senza accedere.", mobile: "Tutto avviene nel browser, senza accesso." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "Codice QR stampabile", mobileTitle: "Codice QR", description: "Scarica il codice QR dell'evento in SVG o PNG e aggiungilo ai tuoi materiali.", mobile: "Codice QR in formato SVG o PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Slideshow dal vivo", description: "Le foto appaiono dal vivo su un proiettore o uno schermo TV.", mobile: "Foto su proiettore o TV." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Commenti", description: "Gli ospiti possono aggiungere messaggi e auguri alle foto.", mobile: "Messaggi e auguri accanto alle foto." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Ricerca dei volti con IA", mobileTitle: "Ricerca dei volti", description: "Con un selfie gli ospiti trovano in pochi secondi tutte le loro foto dell'evento.", mobile: "Gli ospiti trovano le loro foto con un selfie." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "L'IA valuta la qualità tecnica e segnala le foto sfocate e duplicate.", mobile: "L'IA segnala le migliori, le sfocate e le duplicate." },
] as const;

export const plansIt = [{
  id: "event", name: "Galleria dell'evento", price: "35 €", description: "Tutto ciò che serve per un evento",
  features: ["Galleria QR senza app", "Ospiti illimitati", "Caricamento di foto e commenti", "Guestbook audio e download degli originali", "20 video fino a 60 secondi", "Portale di amministrazione e download del QR", "Slideshow dal vivo ed esportazione ZIP", "Galleria conservata per 180 giorni"],
  featured: true,
}] as const;

export const addOnsIt = [["AI Best Photos · fino a 3.000 foto", "+15 €"], ["Video illimitati · fair use", "+15 €"]] as const;

export const faqsIt = [
  ["Gli ospiti devono installare un'app?", "No. Gli ospiti scansionano il codice QR e la galleria si apre nel loro browser. Possono aggiungere foto senza app e senza registrazione."],
  ["Come ricevo il codice QR?", "Ricevi il codice QR del tuo evento via e-mail e puoi scaricarlo in SVG o PNG."],
  ["Posso scaricare le foto degli ospiti?", "Sì. Puoi scaricare una singola foto direttamente dalla galleria e preparare un'esportazione ZIP di tutte le foto nel portale di amministrazione."],
  ["Come funziona il guestbook audio?", "L'ospite tocca l'opzione del messaggio vocale, consente l'accesso al microfono e registra fino a due minuti. Può riascoltarlo prima di inviarlo e rifarlo se vuole. Non servono app né account."],
  ["Per quanto tempo è disponibile la galleria?", "La galleria viene conservata per 180 giorni dopo l'evento."],
  ["Gli ospiti possono caricare video?", "Sì. Il pacchetto include fino a 20 video per evento. Ogni video può durare fino a 60 secondi e pesare fino a 500 MB. I video illimitati sono disponibili come estensione da 15 € con politica di fair use."],
  ["Le foto sono private?", "La galleria non è indicizzata pubblicamente ed è accessibile tramite un link imprevedibile o un codice QR. L'organizzatore controlla la visibilità della galleria e delle singole foto."],
  ["Che cosa include AI Best Photos?", "Per 15 € a evento, l'estensione classifica la qualità tecnica e rileva i duplicati per un massimo di 3.000 foto."],
] as const;
