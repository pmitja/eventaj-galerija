# ADR-013: Domensko določena lokalizacija ene aplikacije

Status: sprejeto 2026-08-03

## Kontekst

Eventaj Galerija mora ohraniti obstoječo slovensko izkušnjo na
`galerija.eventaj.si` in isto funkcionalnost ponuditi v angleščini na drugi
domeni. Podvajanje aplikacije, baze ali workerjev bi povečalo možnost odmikov v
poslovnih pravilih, varnosti in popravkih.

Jezik ni samo predstavitvena nastavitev. Asinhrona QR in arhivska e-pošta,
Stripe povratne povezave ter QR kode morajo uporabiti isti jezik in domeno kot
prvotno naročilo, tudi ko se opravilo izvede pozneje brez HTTP zahteve.

## Odločitev

- Obe domeni kažeta na isti Next.js/OpenNext Worker in uporabljata iste D1, R2
  ter Queue vire.
- Zunanje poti ostanejo enake. Jezik se določi iz strogo dovoljenega hostnamea,
  ne iz poljubnega `Host` oziroma `Origin` URL-ja, ki bi ga odjemalec poslal v
  telesu zahteve.
- `PUBLIC_APP_URL` ostane kanonični slovenski izvor zaradi povratne
  združljivosti. `PUBLIC_APP_URL_EN` je angleški izvor.
- Podprta locale sta `sl` in `en`; neznani host varno uporabi `sl`.
- Locale se ob checkoutu določi na strežniku in trajno shrani na
  `checkout_orders` ter provisioniranem `events`. Obstoječe vrstice dobijo
  `sl`.
- Stripe, QR, e-pošta, ZIP povezave, datumi in SEO uporabljajo shranjeni oziroma
  zahtevi pripadajoči locale.
- Administratorski vmesnik v prvem rezu ostane slovenski. Javni marketing,
  checkout, gostujoča galerija, projekcija in transakcijska e-pošta so
  dvojezični.
- Uporabniško vneseni naziv, lokacija, komentar in sporočilo se ne prevajajo
  samodejno.

## Posledice

Poslovna logika, podatki in mediji ostanejo enotni. Vsaka nova javna funkcija
mora dodati oba prevoda ter teste za obe domeni. Piškotki so namenoma omejeni na
posamezno domeno, zato se anonimna gostujoča seja med domenama ne prenaša.

Migracija je aditivna in povratno združljiva: starejša aplikacija dodatni polji
ignorira, novi aplikaciji pa privzeta vrednost `sl` ohrani dosedanje vedenje.

