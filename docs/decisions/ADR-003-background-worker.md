# ADR-003: Ločen BullMQ worker

- Status: superseded for first MVP by ADR-004
- Datum: 2026-07-15

## Kontekst

Thumbnaili, video probing/transcoding, checksum, ZIP, PDF, e-pošta in AI so dolgotrajni ter potrebujejo retry. Next.js request ali serverless funkcija nista zanesljiva izvajalca za takšna opravila.

## Odločitev

Uporabimo Redis/BullMQ in ločen long-running Node.js worker. Naloge vsebujejo samo identifikatorje, ne velikih payloadov. Vsak handler je idempotenten, ima omejene retryje z backoffom, timeout, strukturirane loge in dead-letter obravnavo.

## Posledice

- Worker je dodatna deploy enota in zahteva monitoring.
- Redis postane pomembna operativna komponenta, PostgreSQL pa ostane vir resnice.
- Queue job ni transakcijsko enak DB zapisu; uporabimo transactional outbox ali zanesljiv dispatcher pred produkcijo.
- Retry ne sme podvojiti variant, obvestil ali izvozov.

Za prvi slikovni MVP se ta odločitev ne implementira. Ponovno jo ocenimo ob uvedbi videa ali drugih dolgotrajnih opravil, ki jih Cloudflare Queues oziroma Containers ne pokrijejo primerno.
