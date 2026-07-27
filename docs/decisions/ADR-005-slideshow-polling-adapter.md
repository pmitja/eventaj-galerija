# ADR-005: Slideshow z zamenljivim polling adapterjem

- Status: accepted
- Datum: 2026-07-16
- Spremenjeno: 2026-07-27

## Kontekst

Faza 2 zahteva zaščiten live slideshow. Trenutni Cloudflare MVP nima zunanjega real-time ponudnika, izbira ponudnika pa je v `docs/OPEN_QUESTIONS.md` še odprta. Neposredna vezava na Pusher, Ably ali drug sistem bi v tej fazi zaklenila ponudnika in dodala novo operativno skrivnost.

## Odločitev

- Vsak dogodek ob ustvarjanju dobi en kriptografsko naključen projekcijski URL token.
- Projekcijska povezava je v dashboardu stalna: administrator jo lahko prikaže,
  kopira ali odpre, ne more pa ustvariti nove oziroma rotirati obstoječe.
- D1 hrani SHA-256 hash za preverjanje javnih zahtev in izvorni token za
  ponovno prikazovanje povezave pooblaščenemu administratorju. Token se ne
  zapisuje v loge ali audit payload.
- Odjemalec pridobi avtoriziran posnetek playliste prek `SlideshowUpdatesAdapter` v petsekundnem intervalu.
- Adapter pošilja samo zahtevo po novem posnetku; binarni mediji ostanejo v zasebnem R2 in se dostavljajo prek preverjene route poti.
- Seznam ni CDN-cachean. Izpeljane slike se za slideshow dostavljajo kot zasebni odgovori.
- Vmesnik adapterja je ločen od React komponente, da ga je mogoče pozneje zamenjati s SSE ali ponudniškim real-time adapterjem brez spremembe projekcijskega UI-ja.

Polling je za prvi produkcijski slideshow sprejemljiv near-real-time kompromis. Ne predstavlja končne izbire real-time ponudnika.

## Posledice

- Nova fotografija se na projekciji pojavi najpozneje v približno petih sekundah po tehnični obdelavi in slideshow odobritvi.
- Vsak odprt projekcijski zaslon izvaja periodičen D1 read; metrike se spremljajo pred izbiro stalnega ponudnika.
- Obstoječi zapisi brez shranjenega izvornega tokena ob prvem administratorskem
  prikazu dobijo enkratno nadomestno povezavo. Po tej združljivostni
  inicializaciji povezava ostane nespremenjena.
