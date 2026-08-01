# ADR-013: Zasebni video v galeriji prek Cloudflare Stream

- Status: accepted
- Datum: 2026-07-31

## Kontekst

Eventaj Galerija želi sprejemati kratke videoposnetke gostov. Video je del
galerije in prenosa, ne pa Live Show projekcije, AI Best Photos ali iskanja po
obrazu. Velike datoteke ne smejo teči skozi Next.js proces, mobilni upload pa
mora preživeti nestabilno povezavo.

Osnovni dogodek vključuje 20 videov. Dodatek za 15 EUR odstrani običajno kvoto,
vendar še vedno veljajo največ 60 sekund in 500 MB na video ter fair-use zaščita
1.000 videov na dogodek. Novi dogodki se hranijo 180 dni.

## Odločitev

- Video nalagamo neposredno v Cloudflare Stream z Direct Creator Upload in TUS.
- Stream upload vedno uporablja `maxDurationSeconds: 60`, zasebno predvajanje in
  omejene dovoljene izvore.
- D1 pred izdajo upload URL-ja atomarno rezervira mesto v dogodkovni kvoti.
- Podpisan Stream webhook idempotentno potrdi trajanje in končno stanje.
- Poster se shrani v zasebni R2; video segmenti ostanejo v Streamu.
- Galerija izda kratek podpisan playback token šele, ko obiskovalec odpre video.
- Vse slideshow poizvedbe eksplicitno zahtevajo `kind = 'image'`.
- Retention najprej izbriše Stream asset in šele nato pripadajoči D1 dogodek.
- Prva izdaja omogoča posamičen zasebni MP4 prenos. Foto ZIP ostane ločen, dokler
  export worker ne podpira velikih pretočnih ZIP vnosov brez bufferiranja.

## Posledice

- Dodamo Stream adapter, webhook secret, TUS odjemalca in novo operativno metriko.
- Stream je zunanji obdelovalec osebnih podatkov in mora biti naveden v politiki
  zasebnosti ter registru podizvajalcev.
- `unlimited` je vedno vezan na objavljeno fair-use politiko in tehnične meje.
- Če Stream ni dosegljiv, foto upload in obstoječa galerija ostaneta delujoča.
