# ADR-018: Slovenski marketing na podmapi eventaj.si

Status: sprejeto 2026-08-30

## Kontekst

Slovenske prodajne in vsebinske strani Galerije Eventaj so bile na
`galerija.eventaj.si`. Iskalniki poddomeno obravnavajo kot ločeno spletno
mesto, zato te strani niso neposredno uporabljale avtoritete glavne domene
Eventaj. Aplikacijske poti, zasebne galerije in QR kode morajo zaradi stabilnih
povezav ostati na poddomeni.

## Odločitev

- Slovenski landing je na `https://www.eventaj.si/qr-galerija`.
- Funkcije so na `https://www.eventaj.si/qr-galerija/funkcije`.
- Strani po vrsti dogodka so na
  `https://www.eventaj.si/qr-galerija/za-dogodke/{slug}`.
- Stare marketinške poti na `galerija.eventaj.si` in njenem `www` hostnameu se
  z enim trajnim HTTP 301 preusmerijo na novo kanonično pot. Query parametri se
  ohranijo.
- `/naroci`, pravne strani, `/e/*`, `/t/*`, `/qr/*`, administracija in API
  ostanejo na poddomeni.
- Slovenski sitemap poddomene ne navaja preseljenih strani. Slovenski
  `llms*.txt` in povezave iz aplikacijskega vmesnika kažejo neposredno na novo
  lokacijo.
- Mednarodni marketing na `guestmosaic.com` se ne spreminja.

## Posledice

Glavna domena prevzame slovenski organski promet in notranje povezave. Worker
na poddomeni ostane lastnik aplikacije, plačila, galerij gostov in stabilnih QR
poti. Selitev je enostopenjska in ne ustvarja verige preusmeritev niti za
`www.galerija.eventaj.si`.
