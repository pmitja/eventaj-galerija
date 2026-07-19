# ADR-007: Dogodkovno omejena anonimna identiteta in engagement projekcije

- Status: accepted
- Datum: 2026-07-18

## Kontekst

Gost mora brez registracije ohraniti isto identiteto pri vseh prispevkih z iste naprave. Projekcija potrebuje leaderboard in kratka motivacijska obvestila, vendar sme šteti samo fotografije, ki prestanejo efektivni kakovostni gate iz ADR-006.

## Odločitev

- Brskalnik za vsak dogodek hrani verzioniran zapis `guestId`, `displayName` in `showOnLiveScreen` v `localStorage`.
- `guestId` je kriptografsko naključen javni identifikator s predpono `guest_`; ni račun, prijavna seja ali identiteta med dogodki.
- Strežnik hrani trenutno prikazno ime v tabeli `event_guests`. Prispevki se na gosta vežejo prek `upload_sessions.guest_id`, zato sprememba imena retroaktivno spremeni prikaz brez prepisovanja medijev.
- Normalizirano prikazno ime je znotraj dogodka unikatno. Konflikt vrne `409` in neštevilske predloge, končno izbiro pa vedno potrdi gost.
- Slideshow polling odgovor vsebuje playlisto in majhen engagement posnetek. Agregati uporabljajo `guest_id`, prikaz pa trenutno ime iz `event_guests`.
- Dogodki dosežkov se zapisujejo idempotentno ob uspešni tehnični analizi. Štejejo samo efektivne kategorije `best` in `good`; zavrnjene, podvojene, zamegljene, nekakovostne in neanalizirane fotografije se ne štejejo.
- Polling ostaja za adapterjem iz ADR-005. UI dogodke razvrsti v kratko čakalno vrsto in nikoli ne blokira predvajanja fotografij.

## Varnost in zasebnost

- Identiteta ne vsebuje e-pošte, telefona, gesla ali podatka za sledenje med dogodki.
- Vsi strežniški read/write dostopi identiteto omejijo z `event_id`; javni dostop uporablja nepredvidljiv slug oziroma slideshow token.
- Anonimna izbira shrani `displayName = null` in `showOnLiveScreen = false`.
- `localStorage` ni avtentikacijski mehanizem. Naključni ID je le psevdonimen ključ za nizko-tvegano atribucijo; občutljive operacije ga ne smejo obravnavati kot dokaz identitete.

## Povratna združljivost

Migracija je razširitvena. `upload_sessions.guest_id` je nullable, zato stare seje in obstoječi mediji ostanejo veljavni. Obstoječe kakovostne fotografije dobijo `quality_accepted_at = uploaded_at`, vendar migracija zanje ne ustvari retroaktivnih engagement dogodkov.

