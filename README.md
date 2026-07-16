# Eventaj Galerija

Mobilno prilagojena SaaS platforma za zbiranje fotografij in videov z dogodkov prek QR kode ali NFC stojala. Gostje ne potrebujejo računa ali aplikacije.

Projekt ima pripravljeno načrtovalsko dokumentacijo in prvo implementirano Next.js površino: odzivno produktno landing stran po priloženih desktop ter mobile dizajnih.

## Lokalni razvoj

```bash
pnpm install
pnpm dev
```

Aplikacija je nato dosegljiva na `http://localhost:3000`. Preverjanje kakovosti:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Dogovorjeni tehnološki temelj

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Cloudflare D1 za relacijske metapodatke
- Cloudflare R2 za zasebno hrambo medijev
- Cloudflare Workers, Cron in po potrebi Queues za izvajanje
- Zod za validacijo na vseh mejah sistema
- React Hook Form za kompleksne obrazce
- OpenNext adapter za deployment Next.js aplikacije na Cloudflare Workers

## Dokumentacija

Začni z [načrtom projekta](docs/PLANNING.md).

| Dokument | Namen |
| --- | --- |
| [Produktna specifikacija](docs/PRODUCT.md) | uporabniki, obseg, pravila paketov in kriteriji uspeha |
| [Arhitektura](docs/ARCHITECTURE.md) | komponente, meje modulov, deployment in tok datotek |
| [Podatkovni model](docs/DATA_MODEL.md) | entitete, relacije, statusi in vrstni red migracij |
| [API](docs/API.md) | javni, uporabniški, administratorski in interni endpointi |
| [Uporabniški tokovi](docs/USER_FLOWS.md) | ključni scenariji in robni primeri |
| [UX in design sistem](docs/UX_DESIGN_SYSTEM.md) | vizualna smer, responsive pravila in dostopnost |
| [Varnost in zasebnost](docs/SECURITY_PRIVACY.md) | grožnje, GDPR, soglasja in hramba |
| [Testna strategija](docs/TESTING.md) | unit, integration, E2E in kakovostne meje |
| [Roadmap](docs/ROADMAP.md) | faze, vertikalni rezi in Definition of Done |
| [Sledljivost zahtev](docs/REQUIREMENTS_TRACEABILITY.md) | preslikava celotnega briefa v faze in dokumente |
| [Register tveganj](docs/RISKS.md) | glavna produktna, tehnična in operativna tveganja |
| [Odprta vprašanja](docs/OPEN_QUESTIONS.md) | odločitve, ki jih je treba potrditi pred implementacijo |

Arhitekturne odločitve so v `docs/decisions/`.

## Trenutna struktura backend kode

```text
app/api/v1/            # javni in administratorski Route Handlerji
lib/domain/            # čista poslovna pravila
lib/repositories/      # D1 dostop
lib/storage/           # R2 podpisovanje in Cloudflare Images obdelava
lib/validation/        # deljene Zod sheme
migrations/            # D1 migracije
workers/retention.ts   # dnevni fizični izbris po 90 dneh
```

## Cloudflare namestitev

Konfiguraciji sta `wrangler.jsonc` za aplikacijo in `wrangler.retention.jsonc` za dnevni retention worker. Produkcijske skrivnosti (`AUTH_SECRET`, `ADMIN_PASSWORD_HASH`, R2 S3 ključa) se nastavijo z `wrangler secret put` in se ne zapisujejo v repozitorij.

R2 CORS je omejen na produkcijska in lokalna izvora iz `config/r2-cors.json`. Po spremembi se ponovljivo uveljavi in preveri z:

```bash
pnpm r2:cors:apply
pnpm r2:cors:list
```

Bucket ostaja zaseben; `r2.dev` ni omogočen. Brskalnik nalaga neposredno prek 10-minutnega podpisanega `PUT` URL-ja, podpis pa je vezan tudi na deklarirani `Content-Type`.

Vsak nov dogodek dobi glavno QR dostopno točko. QR sliki sta na `/qr/{publicCode}.svg` in `.png`, stabilna povezava `/t/{publicCode}` pa zabeleži obisk, ohrani attribution za upload sejo in preusmeri na trenutni dogodek. Kanonični izvor, ki se zapiše v QR, določa `PUBLIC_APP_URL` v `wrangler.jsonc`.

Trenutna produkcijska aplikacija je na `https://eventaj-galerija.eventaj.workers.dev`. Glavni Worker uporablja EU D1/R2 bindinge, retention Worker pa ni javno dostopen in se zažene vsak dan ob 02:17 UTC. Za kasnejši priklop `galerija.eventaj.si` se doda Cloudflare Custom Domain; obstoječa stran na Vercelu lahko ostane nespremenjena.
