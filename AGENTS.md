# Navodila za razvojne agente

## Vir resnice

Pred spremembo kode preberi `README.md`, `docs/PLANNING.md` in dokument za področje, ki ga spreminjaš. Če implementacija odstopa od dokumentirane odločitve, najprej dodaj ali spremeni ADR v `docs/decisions/`.

## Obseg in arhitektura

- Uporabljaj Next.js App Router in TypeScript v strogem načinu.
- Ohrani modularni monolit. Poslovna pravila ne sodijo v React komponente ali Route Handlerje.
- Vsi vhodi sistema morajo biti validirani z deljenimi Zod shemami.
- Dostop do podatkov mora vedno upoštevati `organizationId`; javne operacije uporabljajo nepredvidljive javne identifikatorje.
- Velikih datotek ne prenašaj prek Next.js procesa. Uporabi podpisane neposredne uploade.
- Obdelava medijev, ZIP, e-pošta in AI so asinhrone, ponovljive naloge v workerju.
- Zunanje ponudnike skrij za adapterje, da jih je mogoče zamenjati.

## Kakovost

- Za vsako poslovno pravilo dodaj unit test.
- Za spremembe upload, auth, moderacije in dovoljenj dodaj integration test.
- Za kritične gostujoče tokove dodaj mobilni E2E test.
- Ne dodajaj funkcije brez loading, empty, error in retry stanja, kadar so relevantna.
- UI mora delovati pri širinah 375, 768, 1024 in 1440 px ter s tipkovnico.
- Ne logiraj signed URL-jev, gesel, API ključev, selfiejev ali face embeddingov.

## Podatkovna baza

- Vsaka sprememba sheme potrebuje migracijo in opis povratne združljivosti.
- Denarne vrednosti hrani kot celo število v centih in z ISO valuto.
- Časovne vrednosti hrani v UTC; prikazuj jih v časovnem pasu dogodka.
- Za izbris uporabljaj jasno določeno politiko: soft delete samo tam, kjer ga zahteva audit ali obnovitev; osebne in biometrične podatke je treba fizično izbrisati skladno z zahtevkom.

## Varnost

- Preveri avtorizacijo v strežniški plasti pri vsaki operaciji; skrit gumb ni varnostni mehanizem.
- Javne upload seje so kratkotrajne, vezane na dogodek in rate-limitane.
- Vse background naloge morajo biti idempotentne.
- Za občutljiva dejanja zapiši audit dogodek.

