# Produktna specifikacija

## Vrednost produkta

Eventaj Galerija omogoča organizatorju, da brez nameščanja aplikacije zbere fotografije in kratke videe vseh gostov na enem mestu. QR kode in ponovno uporabna NFC stojala zmanjšajo trenje, moderacija in poznejše AI funkcije pa povečajo uporabnost zbranega gradiva.

## Uporabniki in vloge

### Platform administrator

Upravlja organizacije, stranke, dogodke, pakete, dodatke, fizično opremo, procesiranje, plačila, hrambo in incidente. Ima globalen pregled, vendar so privilegirana dejanja auditirana.

### Organizator

V okviru dodeljene organizacije in dogodkov pregleduje galerijo, moderira, prenaša datoteke, nastavlja slideshow in uporablja omogočene funkcije. V MVP sta vlogi `owner` in `event_manager`.

### Gost

Nima računa. Prek javne ali unikatne povezave odpre dogodek, izbere datoteke, spremlja prenos in po pravilih zasebnosti pregleda galerijo.

## Paketi in upravičenja

Paketi so cenik; dejanska upravičenja dogodka so posnetek (`event_entitlements`) ob nakupu oziroma ročni konfiguraciji. Tako poznejša sprememba paketa ne spremeni že prodanega dogodka.

| Funkcija | Basic 19 € | Advanced 39 € | Premium 99 € |
| --- | --- | --- | --- |
| Galerija, foto/video upload, QR/NFC | da | da | da |
| Osnovna moderacija in prenos | da | da | da |
| AI Best Photos in tehnična analiza | ne | da | da |
| AI Face Collections | ne | ne | da |
| Live Slideshow | ne | ne | da |
| Privzeta hramba | 30 dni | 90 dni | 180 dni |

Dodatki so neodvisna upravičenja: Face Collections +15 €, Live Slideshow +40 €, enoletna hramba +10 €, ZIP +5 €, dodatni administrator +10 €. Cene so konfiguracija in se hranijo v centih; niso hardcodane v UI.

## Statusi dogodka

| Status | Pomen | Javni upload |
| --- | --- | --- |
| `draft` | nepopolna konfiguracija | ne |
| `prepared` | pripravljen, še ni aktiven | konfigurabilno/testno |
| `active` | dogodek poteka | da |
| `ended` | dogodek končan, galerija v hrambi | privzeto ne |
| `archived` | ročno arhiviran | ne |
| `expired` | hramba potekla, čaka izbris | ne |

Prehodi so eksplicitni in auditirani. Časovni job lahko predlaga ali izvede prehod, vendar ne sme obiti pravil hrambe.

## Zasebnost galerije

- `public`: dostopna vsem z URL-jem in lahko indeksirana samo, če je to izrecno omogočeno;
- `password`: zahteva geslo dogodka, shranjeno kot hash;
- `unlisted`: nepredvidljiv URL, `noindex`;
- `hidden_until_ended`: med dogodkom je upload dovoljen, galerija pa skrita.

Vse galerije so privzeto `unlisted` in `noindex`.

## Moderacija

| Način | Javna galerija | Slideshow |
| --- | --- | --- |
| `none` | po procesiranju samodejno odobreno | po entitlementu in pravilih |
| `slideshow_only` | samodejno odobreno | čaka odobritev |
| `full` | čaka odobritev | čaka odobritev |

Galerijska in slideshow odobritev sta ločeni polji/stroja stanj. Zavrnitev ne izbriše originala; trajni izbris je ločena operacija.

## Funkcionalni kriteriji MVP

### Ustvarjanje dogodka

- Administrator vnese naziv, datum, časovni pas, lokacijo, slug, paket in zasebnost.
- Sistem preveri unikatnost sluga in ustvari nepredvidljiv javni ID.
- Dogodek v `draft` ni javno dostopen.
- Aktivacija ni možna brez obveznih nastavitev in pravil hrambe.

### Gostujoči upload

- Izbirnik ne zahteva dostopa do celotne galerije naprave.
- Omogočen je izbor več datotek, predogled, odstranitev in ponovni poskus.
- Vsaka datoteka ima lasten napredek in stanje.
- Nadaljevanje uporablja multipart upload ter lokalno shranjen neobčutljiv ID seje.
- Uspešen prenos takoj prikaže zahvalo; procesiranje se nadaljuje v ozadju.
- Privolitev za objavo je ločena od tehničnega soglasja za upload.

### Galerija

- Prikaže le `ready` datoteke, dovoljene s privacy in moderation pravili.
- Podpira slike najprej, nato video, filtre in celozaslonski pregled.
- Slike imajo določeno razmerje stranic pred prikazom, da ni layout shiftov.

## Izven prvega vertikalnega reza

- plačilni checkout in avtomatizirano obračunavanje;
- AI ocenjevanje in face embeddings;
- slideshow in real-time ekran;
- PDF generator in predloge za tisk;
- ZIP izvoz;
- zunanji fotobooth upload API;
- white-label in samopostrežni onboarding organizacij.

