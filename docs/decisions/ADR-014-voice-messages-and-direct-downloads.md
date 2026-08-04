# ADR-014: Glasovna voščila in neposredni prenosi originalov

Status: sprejeto  
Datum: 2026-08-04

## Kontekst

Gostje želijo poleg fotografij in videov brez aplikacije posneti kratko glasovno
voščilo. Javni lightbox hkrati potrebuje prenos posamezne originalne fotografije.
Oba toka morata ohraniti zasebni R2 bucket, kratkotrajne javne poverilnice,
dogodkovno omejitev in politiko hrambe.

## Odločitev

- Glasovna voščila so ločena domena v tabeli `voice_messages`; niso nova vrsta
  `media_files`, ker nimajo slikovnih variant, AI-kakovosti, slideshowa ali
  video processinga.
- Brskalnik snema največ 120 sekund z `MediaRecorder`. Podprti so WebM/Opus,
  MP4/AAC in Ogg/Opus, največja datoteka pa je 5 MB.
- Audio se naloži neposredno v zasebni R2 s podpisanim `PUT`. Strežnik pred
  objavo preveri velikost, Content-Type in začetni podpis vsebine.
- Gost pred oddajo izbere, ali je posnetek viden v javnem audio guestbooku.
  V obeh primerih se zapišeta soglasji za upload in morebitno objavo.
- Predvajanje javnih voščil in prenos originalne fotografije uporabljata
  kratkotrajni podpisani `GET`; Next.js ne prenaša velikih teles datotek.
- Posamezen download je dovoljen samo za sliko, ki je trenutno vidna v javni
  galeriji, ima soglasje in je prestala isti kakovostni gate kot lightbox.

## Povratna združljivost

Migracija je aditivna. Stare različice aplikacije novo tabelo prezrejo, obstoječi
foto/video zapisi in izvozi pa ostanejo nespremenjeni. Novi R2 ključi uporabljajo
ločeno predpono `voice-messages/{eventId}/`, ki jo retention worker odstrani skupaj
z dogodkom.

## Posledice

Audio guestbook potrebuje lastna loading, empty, error/retry, permission-denied,
recording, preview, upload in success stanja. Transkripcija, sestavljeni audio
izvoz in moderacijski workflow niso del tega reza.
