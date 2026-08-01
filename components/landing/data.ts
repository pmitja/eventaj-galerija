export const howSteps = [
  {
    n: "1",
    title: "Ustvarite in plačajte dogodek",
    description:
      "Vnesite podatke organizacije in dogodka ter varno zaključite nakup. Nato se prijavite v administracijo svoje galerije.",
    mobileDescription: "Vnesite podatke dogodka, zaključite nakup in se prijavite v administracijo.",
    imageSrc: "/gallery/ana-marko/photo-1.jpg",
    imageAlt: "Fotografija poročnega dogodka",
  },
  {
    n: "2",
    title: "Prenesite QR kodo za goste",
    mobileTitle: "Pripravite QR kodo",
    description:
      "QR kodo dogodka prenesete kot SVG ali PNG. Po dogovoru vam lahko ročno pripravimo tudi predlogo za tisk.",
    mobileDescription: "Prenesite QR kodo kot SVG ali PNG; predlogo za tisk lahko po dogovoru pripravimo ročno.",
    imageSrc: "/gallery/ana-marko/photo-3.jpg",
    imageAlt: "Gostje na dogodku",
  },
  {
    n: "3",
    title: "Gostje skenirajo in naložijo — brez prijave",
    mobileTitle: "Gostje naložijo — brez prijave",
    description:
      "Galerija deluje v brskalniku na telefonu. Gostje odprejo povezavo ter dodajo fotografije ali kratke videe brez aplikacije in uporabniškega računa.",
    mobileDescription: "Gostje skenirajo QR ter dodajo fotografije ali videe brez aplikacije in prijave.",
    imageSrc: "/gallery/ana-marko/photo-6.jpg",
    imageAlt: "Gost uporablja telefon na dogodku",
  },
  {
    n: "4",
    title: "Preglejte in prenesite skupne spomine",
    mobileTitle: "Podoživite skupne spomine",
    description:
      "Fotografije in videi so zbrani v eni galeriji. Organizator upravlja vse vsebine, fotografije prikaže kot slideshow in jih prenese v ZIP.",
    mobileDescription: "Upravljajte fotografije in videe, zaženite foto slideshow ali prenesite fotografije v ZIP.",
    imageSrc: "/gallery/ana-marko/photo-9.jpg",
    imageAlt: "Skupni spomini z dogodka",
  },
] as const;

export const features = [
  { glyph: "▣", icon: "/marketing/icons/digitalni-album.png", title: "Digitalni album", description: "Fotografije gostov v elegantni skupni galeriji.", mobile: "Fotografije gostov v skupni galeriji." },
  { glyph: "⤓", icon: "/marketing/icons/prenos-zip.png", title: "Prenos v ZIP", description: "Organizator lahko fotografije iz galerije prenese v ZIP datoteki.", mobile: "Prenos fotografij iz galerije v ZIP." },
  { glyph: "◎", icon: "/marketing/icons/brez-aplikacije.png", title: "Brez aplikacije", description: "Gostje sodelujejo v brskalniku — brez namestitve in prijave.", mobile: "Vse poteka v brskalniku, brez prijave." },
  { glyph: "▦", icon: "/marketing/icons/qr-koda.png", title: "QR koda za tisk", mobileTitle: "QR koda", description: "Prenesite QR kodo dogodka v SVG ali PNG obliki; predlogo lahko pripravimo ročno.", mobile: "QR koda v SVG ali PNG obliki." },
  { glyph: "▶", icon: "/marketing/icons/live-slideshow.png", title: "Live slideshow", description: "Fotografije se sproti prikazujejo na projektorju ali TV zaslonu.", mobile: "Fotografije na projektorju ali TV." },
  { glyph: "✎", icon: "/marketing/icons/komentarji.png", title: "Komentarji", description: "Gostje lahko fotografijam dodajo sporočila in voščila.", mobile: "Sporočila in voščila ob fotografijah." },
  { glyph: "◉", icon: "/marketing/icons/ai-iskanje-po-obrazu.png", title: "AI iskanje po obrazu", mobileTitle: "Iskanje po obrazu", description: "Gostje s selfijem v nekaj sekundah najdejo vse svoje fotografije z dogodka.", mobile: "Gostje s selfijem najdejo svoje fotografije." },
  { glyph: "✦", icon: "/marketing/icons/ai-best-photos.png", title: "AI Best Photos", description: "Umetna inteligenca oceni kakovost posnetkov ter označi zamegljene in podvojene fotografije.", mobile: "AI označi najboljše, zamegljene in podvojene." },
] as const;

export const plans = [
  {
    id: "event",
    name: "Galerija dogodka",
    price: "35 €",
    description: "Vse bistvene funkcije za en dogodek",
    features: [
      "QR galerija brez aplikacije",
      "Neomejeno število gostov",
      "Nalaganje fotografij in komentarji",
      "20 videov do 60 sekund",
      "Administracijski portal in QR prenosi",
      "Live slideshow in ZIP izvoz",
      "180-dnevna hramba galerije",
    ],
    featured: true,
  },
] as const;

export const addOns = [
  ["AI Best Photos · do 3.000 fotografij", "+15 €"],
  ["Neomejeno videov · fair-use", "+15 €"],
] as const;

export const faqs = [
  ["Ali morajo gostje namestiti aplikacijo?", "Ne. Gostje skenirajo QR kodo in galerija se odpre v brskalniku. Fotografije lahko dodajo brez aplikacije in brez registracije."],
  ["Kako dobim QR kodo?", "QR kodo dogodka lahko v administraciji prenesete kot SVG ali PNG. Po dogovoru vam lahko ročno pripravimo tudi predlogo za tisk."],
  ["Ali lahko prenesem fotografije gostov?", "Da. V administracijskem portalu lahko pripravite ZIP izvoz fotografij iz galerije."],
  ["Kako dolgo je galerija na voljo?", "Galerija je po dogodku shranjena 180 dni."],
  ["Ali lahko gostje naložijo videe?", "Da. Paket vključuje do 20 videov na dogodek. Posamezen video je lahko dolg največ 60 sekund in velik največ 500 MB. Videi so prikazani v galeriji, ne pa v Live Slideshowu. Neomejeno število videov je na voljo kot dodatek za 15 € po fair-use politiki."],
  ["So fotografije zasebne?", "Galerija ni javno indeksirana in je dostopna prek nepredvidljive povezave oziroma QR kode. Organizator lahko upravlja vidnost galerije in posameznih fotografij."],
  ["Kaj vključuje AI Best Photos?", "Za 15 € na dogodek dodatek tehnično razvrsti kakovost in zazna dvojnike pri največ 3.000 fotografijah. Večje količine pripravimo po meri."],
] as const;
