# ADR-013: Domensko določena lokalizacija ene aplikacije

Status: sprejeto 2026-08-03

## Kontekst

Eventaj Galerija mora ohraniti obstoječo slovensko izkušnjo na
`galerija.eventaj.si`, mednarodno znamko Guest Mosaic pa ponuditi na
`guestmosaic.com`. Podvajanje aplikacije, baze ali workerjev bi povečalo možnost
odmikov v poslovnih pravilih, varnosti in popravkih.

Jezik ni samo predstavitvena nastavitev. Asinhrona QR in arhivska e-pošta,
Stripe povratne povezave ter QR kode morajo uporabiti isti jezik in domeno kot
prvotno naročilo, tudi ko se opravilo izvede pozneje brez HTTP zahteve.

## Odločitev

- Obe domeni kažeta na isti Next.js/OpenNext Worker in uporabljata iste D1, R2
  ter Queue vire.
- Javne marketinške, pravne in checkout poti so lokalizirane. Slovenska domena
  uporablja npr. `/naroci`, `/za-dogodke/poroke`, `/pogoji-uporabe` in
  `/zasebnost`; angleška uporablja `/order`, `/for-events/weddings`,
  `/terms-of-use` in `/privacy`. Stabilne tehnične poti (API, QR, javni dogodki
  in projekcije) ostanejo jezikovno nevtralne. Jezik se določi iz strogo
  dovoljenega hostnamea, ne iz poljubnega `Host` oziroma `Origin` URL-ja, ki bi
  ga odjemalec poslal v telesu zahteve.
- Zahteva na poti napačnega jezika se trajno preusmeri na lokalizirano pot iste
  domene. Jezikovni preklopnik preslika tudi segment poti in slug namenske
  marketinške strani.
- Nove SEO rešitvene strani uporabljajo stabilen interni ID strani in izrecen
  zemljevid lokaliziranih javnih poti. Tako ima lahko ista vsebinska stran v
  vsakem aktivnem trgu naraven slug (npr. angleški, nemški in nizozemski), ne da
  bi canonical, hreflang, sitemap ali jezikovni preklopnik ugibali ekvivalenco.
  Hreflang vsebuje samo dejansko objavljene in vsebinsko enakovredne različice;
  manjkajoč prevod se ne preslika na domačo stran ali drug jezik.
- Obstoječi URL-ji tipov dogodkov ostanejo nespremenjeni. Njihova morebitna
  poznejša lokalizacija zahteva ločeno migracijo z enostopenjskimi 301
  preusmeritvami ter sočasno posodobitev internih povezav, canonicalov,
  hreflanga in sitemapa.
- `PUBLIC_APP_URL` ostane kanonični slovenski izvor zaradi povratne
  združljivosti. `PUBLIC_APP_URL_EN` je zaradi povratne združljivosti ime
  spremenljivke za mednarodni izvor `https://guestmosaic.com`; angleščina je na
  korenu, `de`, `nl`, `es`, `it` in `fr` pa pod jezikovnimi predponami.
- Stara `gallery.eventaj.si` in njen `www` hostname ostaneta vezana na Worker ter
  se trajno preusmerita na isto pot na `guestmosaic.com`, da stare povezave in
  QR kode ostanejo veljavne.
- Neznani host varno uporabi `sl`.
- Locale se ob checkoutu določi na strežniku in trajno shrani na
  `checkout_orders` ter provisioniranem `events`. Obstoječe vrstice dobijo
  `sl`.
- Slovenski checkout uporablja Eventaj Stripe račun, vsi drugi jeziki pa ločen
  Guest Mosaic Stripe račun. Oba računa kličeta isti webhook endpoint na svoji
  kanonični domeni; hostname določi podpisni ključ in račun za ponovno
  pridobitev Checkout Session.
- Stripe, QR, e-pošta, ZIP povezave, datumi in SEO uporabljajo shranjeni oziroma
  zahtevi pripadajoči locale. Slovenska transakcijska e-pošta uporablja Eventaj
  Resend račun, vsi drugi jeziki pa ločen Guest Mosaic Resend račun.
- Administratorski vmesnik v prvem rezu ostane slovenski. Angleška struktura in
  dejstva ponudbe so vir resnice za mednarodni marketing, vendar je besedilo za
  vsak trg izvirno prilagojeno in ni dobesedni prevod. Nova lokalizirana SEO
  stran se objavi šele, ko ima njen kritični tok (marketing, naročilo, plačilo,
  uspeh, e-pošta, galerija in napake) enakovredno lokalizacijo.
- Uporabniško vneseni naziv, lokacija, komentar in sporočilo se ne prevajajo
  samodejno.

## Posledice

Poslovna logika, podatki in mediji ostanejo enotni. Vsaka nova javna funkcija
mora dodati prevode za trge, v katerih je objavljena, ter teste za obe domeni in
aktivne jezikovne predpone. Piškotki so namenoma omejeni na posamezno domeno,
zato se anonimna gostujoča seja med domenama ne prenaša.

Migracija je aditivna in povratno združljiva: starejša aplikacija dodatni polji
ignorira, novi aplikaciji pa privzeta vrednost `sl` ohrani dosedanje vedenje.
