# ADR-004: Cloudflare platforma za prvi MVP

- Status: accepted
- Datum: 2026-07-15

## Kontekst

Prvi MVP ima enega administratorja, javne neindeksirane galerije prek nepredvidljive povezave in 90-dnevno hrambo. Fotografije predstavljajo skoraj ves volumen podatkov. Cilj je čim manj operativnih storitev in nizek začetni strošek.

Prejšnji načrt je predvideval PostgreSQL, Redis/BullMQ in ločen Node.js worker. Pred začetkom backend implementacije je bila sprejeta odločitev, da se prvi MVP poenoti na Cloudflare platformi.

## Odločitev

- Next.js aplikacijo in Route Handlerje deployamo na Cloudflare Workers prek OpenNext adapterja.
- Fotografije in izpeljane datoteke hranimo v zasebnem Cloudflare R2 bucketu.
- Relacijske metapodatke hranimo v Cloudflare D1. Slike se nikoli ne hranijo v D1.
- Periodično delo za 90-dnevni izbris sproža Cloudflare Cron. Daljša asinhrona opravila se po potrebi dodajo prek Cloudflare Queues.
- Prvi MVP ima enega administratorja `info@eventaj.si`; Auth.js Credentials prijava uporablja hashirano geslo iz Cloudflare secret konfiguracije in JWT sejo.
- Javne galerije so `unlisted`, `noindex` in uporabljajo kriptografsko nepredvidljiv javni slug.
- Hramba poteče 90 dni po `ends_at`. Cron fizično izbriše R2 objekte in nato pripadajoče aktivne zapise.

## Posledice

- Odpadejo PostgreSQL, Redis in ločen worker v prvem slikovnem MVP-ju.
- D1 uporablja SQLite semantiko in ima omejitve drugačne od PostgreSQL; poizvedbe ter migracije morajo biti testirane proti D1.
- Rešitev je bolj vezana na Cloudflare, vendar so domena, validacija in storage adapterji še vedno ločeni od predstavitvenega sloja.
- Ob uvedbi zahtevnega video procesiranja ali drugega dolgotrajnega dela ponovno ocenimo Queues, Containers ali ločen worker.
- Če D1 omejitve postanejo dejanska ovira, migracija metapodatkov na PostgreSQL ne zahteva selitve R2 objektov.

