# ADR-001: Next.js modularni monolit

- Status: accepted for planning
- Datum: 2026-07-15

## Kontekst

Produkt potrebuje javno mobilno stran, upravljavski dashboard, HTTP API in pozneje partner API. Ekipa želi Next.js, MVP pa ne upraviči mreže mikroservisov. Obdelava velikih medijev kljub temu ne sodi v spletni request lifecycle.

## Odločitev

Uporabimo Next.js App Router kot spletni/BFF proces in en skupen modularen domenski sloj. Asinhrono delo izvaja ločen Node.js worker. Koda je lahko v pnpm monorepu, deployment enot pa sta sprva dve.

## Posledice

- Enostavnejši razvoj, tipi in transakcije čez jedrne module.
- Jasna meja workerja prepreči serverless timeout težave.
- Modulske meje je treba vzdrževati s strukturo uvozov in testi.
- Posamezen modul je mogoče pozneje izločiti, če meritve pokažejo potrebo; to ni vnaprejšnji cilj.

