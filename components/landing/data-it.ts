export const howStepsIt = [
  { n: "1", title: "Crea il tuo evento", description: "Dopo l'inserimento dei dati essenziali e il completamento dell'acquisto, l'accesso all'amministrazione è pronto subito.", mobileDescription: "Inserisci i dati, completa l'acquisto e accedi subito all'amministrazione.", imageSrc: "/gallery/ana-marko/photo-1.jpg", imageAlt: "Foto di un matrimonio" },
  { n: "2", title: "Prepara il codice QR", description: "Il codice QR è disponibile in SVG e PNG. Su richiesta prepariamo anche un modello per la stampa.", mobileDescription: "Codice QR in SVG e PNG; modello per la stampa su richiesta.", imageSrc: "/gallery/ana-marko/photo-3.jpg", imageAlt: "Ospiti a un evento" },
  { n: "3", title: "Gli ospiti scansionano e aggiungono contenuti", mobileTitle: "Gli ospiti aggiungono contenuti", description: "Aggiungono foto, brevi video e messaggi vocali direttamente dal browser. Senza app e senza account.", mobileDescription: "Foto, video e messaggi vocali direttamente dal browser. Senza app e senza account.", imageSrc: "/gallery/ana-marko/photo-6.jpg", imageAlt: "Ospite che usa lo smartphone a un evento" },
  { n: "4", title: "Tutto in un unico posto", description: "Foto e video si raccolgono in un'unica galleria condivisa. L'organizzatore può gestire i contenuti, avviare il Live Slideshow e scaricare le foto in un file ZIP.", mobileDescription: "Contenuti in un'unica galleria, Live Slideshow e download in ZIP.", imageSrc: "/gallery/ana-marko/photo-9.jpg", imageAlt: "Ricordi condivisi dell'evento" },
] as const;

export const featuresIt = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Album digitale", description: "Le foto dei tuoi ospiti in un'unica galleria condivisa e ordinata.", mobile: "Le foto degli ospiti in un'unica galleria condivisa." },
  { glyph: "▷", icon: "/marketing/icons/video-posnetki.svg", title: "Brevi video", description: "Sono inclusi fino a 20 video della durata massima di 60 secondi.", mobile: "Fino a 20 video di massimo 60 secondi." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "Download ZIP", description: "L'organizzatore può scaricare tutte le foto anche in un unico file ZIP.", mobile: "Tutte le foto in un unico file ZIP." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Nessuna app", description: "Tutto avviene direttamente nel browser. Senza app e senza account.", mobile: "Tutto nel browser, senza app né account." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "Codice QR", description: "Il codice QR dell'evento è disponibile nei formati SVG e PNG.", mobile: "Codice QR nei formati SVG e PNG." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live Slideshow", description: "Le foto appena aggiunte compaiono via via su un proiettore o uno schermo TV.", mobile: "Le foto nuove, subito su proiettore o TV." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Commenti", description: "Gli ospiti possono lasciare messaggi, auguri e reazioni accanto alle foto.", mobile: "Messaggi, auguri e reazioni accanto alle foto." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "Ricerca foto per volto", mobileTitle: "Ricerca per volto", description: "Con un selfie ogni ospite trova in pochi secondi le foto in cui compare.", mobile: "Con un selfie ogni ospite trova le sue foto in pochi secondi." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "L'IA valuta le foto dal punto di vista tecnico e aiuta a individuare gli scatti sfocati e duplicati.", mobile: "L'IA valuta le foto tecnicamente e segnala sfocate e duplicate." },
] as const;

export const plansIt = [{
  id: "event", name: "Galleria dell'evento", price: "35 €", description: "Tutto ciò che serve per un evento",
  features: ["Galleria QR senza app", "Ospiti illimitati", "Foto e commenti", "Guestbook audio", "Download delle foto originali", "Fino a 20 video, lunghi al massimo 60 secondi", "Amministrazione dell'evento e download del codice QR", "Live Slideshow", "Esportazione delle foto in ZIP", "Galleria disponibile per 180 giorni"],
  featured: true,
}] as const;

export const addOnsIt = [
  { name: "AI Best Photos", note: "fino a 3.000 foto", price: "+15 €" },
  { name: "Video illimitati", note: "con uso corretto, fino a 1.000 video", price: "+15 €" },
] as const;

export const faqsIt = [
  ["Gli ospiti devono installare un'app?", "No. Gli ospiti scansionano il codice QR e la galleria si apre direttamente nel browser. Non servono app né registrazione."],
  ["Come ricevo il codice QR?", "Il codice QR dell’evento si scarica nel portale di amministrazione in SVG e PNG. Su richiesta prepariamo anche un modello per la stampa."],
  ["Posso scaricare le foto degli ospiti?", "Sì. Puoi scaricare una singola foto direttamente dalla galleria. Al termine dell'evento ricevi via e-mail uno ZIP con tutte le foto e puoi prepararlo anche tu nel portale di amministrazione."],
  ["Come funziona il guestbook audio?", "Nella galleria l'ospite sceglie il messaggio vocale, consente l'accesso al microfono e registra fino a due minuti. Può riascoltarlo prima di inviarlo e rifarlo se vuole. Non servono app né account."],
  ["Per quanto tempo è disponibile la galleria?", "La galleria è disponibile per 180 giorni dopo l'evento."],
  ["Gli ospiti possono caricare video?", "Sì, fino a 20 video per evento. Ogni video può durare al massimo 60 secondi e pesare al massimo 500 MB. I video si vedono nella galleria, ma non nel Live Slideshow. L'estensione da 15 € elimina il limite di video (uso corretto, fino a 1.000 per evento)."],
  ["Le foto sono private?", "La galleria non è indicizzata pubblicamente e non è protetta da password, quindi condividi il link solo con i tuoi ospiti. L'organizzatore può nascondere in qualsiasi momento l'intera galleria o una singola foto."],
  ["Usate le nostre foto per il marketing?", "No. Non usiamo mai le foto, i video e i messaggi vocali dei tuoi ospiti per promozione, pubblicità o il nostro sito, e non li inviamo a strumenti pubblicitari o di analisi. I contenuti restano nella tua galleria e vengono eliminati dopo 180 giorni."],
  ["Che cosa include AI Best Photos?", "Per 15 € a evento, l'estensione classifica la qualità tecnica e rileva i duplicati per un massimo di 3.000 foto."],
] as const;
