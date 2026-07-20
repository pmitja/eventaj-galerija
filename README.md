# Eventaj Galerija

Mobilno prilagojena SaaS platforma za zbiranje fotografij z dogodkov prek QR kode. Gostje ne potrebujejo računa ali aplikacije, organizator pa po Stripe plačilu dobi lasten organizacijski dostop.

Osnovna cena je 35 EUR na dogodek. Opcijski `AI Best Photos` stane 15 EUR do 3.000 fotografij; večje količine so ponudba po meri.

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

Za dejanski lokalni upload in plačila kopiraj `.dev.vars.example` v `.dev.vars` ter dodaj R2 in Stripe testne skrivnosti. Brez njih UI deluje, podpisani upload oziroma Checkout pa namenoma vrneta `503`; skrivnosti se ne zapisujejo v repozitorij.

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
workers/exports.ts     # asinhrona izdelava ZIP izvozov prek Cloudflare Queue
workers/quality.ts     # idempotenten masovni backfill tehnične kakovosti
workers/media-processing.ts # omejena, ponovljiva obdelava novih slik
workers/face-processing.ts # dogodkovno omejen face index + ephemeral selfie search
```

## Cloudflare namestitev

Konfiguracije so `wrangler.jsonc` za aplikacijo, `wrangler.retention.jsonc` za dnevni retention worker, `wrangler.exports.jsonc` za ZIP queue consumer in `wrangler.quality.jsonc` za masovno tehnično analizo. Produkcijske skrivnosti (`AUTH_SECRET`, `ADMIN_PASSWORD_HASH`, R2 S3 ključa) se nastavijo z `wrangler secret put` in se ne zapisujejo v repozitorij.

Pred prvim deploymentom ZIP izvoza ustvari glavno in dead-letter vrsto ter namesti consumer:

```bash
pnpm wrangler queues create eventaj-gallery-exports
pnpm wrangler queues create eventaj-gallery-exports-dlq
pnpm deploy:exports
```

Pred prvim masovnim backfillom ustvari quality vrsti in namesti consumer:

```bash
pnpm wrangler queues create eventaj-gallery-quality
pnpm wrangler queues create eventaj-gallery-quality-dlq
pnpm deploy:quality
```

Pred produkcijskim uploadom ustvari media-processing vrsti in namesti consumer:

> Media-processing Worker uporablja 30 s CPU omejitev in zato zahteva Workers
> Paid naročnino. Plačljiv R2 paket tega ne vključuje. Naročnino aktiviraj pred
> deploymentom Workerja; sicer Cloudflare ne zagotovi potrebne CPU rezerve za
> tehnično analizo več sočasnih fotografij.

```bash
pnpm wrangler queues create eventaj-gallery-media-processing
pnpm wrangler queues create eventaj-gallery-media-processing-dlq
pnpm deploy:media-processing
```

Face search je privzeto fail-closed in zahteva potrjen DPIA/pravni gate, Premium
entitlement ter AWS Rekognition v odobreni EU regiji. Pred deploymentom ustvari
vrsti, nastavi worker secrets in ga namesti:

```bash
pnpm wrangler queues create eventaj-gallery-face-processing
pnpm wrangler queues create eventaj-gallery-face-processing-dlq
pnpm wrangler secret put AWS_REKOGNITION_ACCESS_KEY_ID --config wrangler.face-processing.jsonc
pnpm wrangler secret put AWS_REKOGNITION_SECRET_ACCESS_KEY --config wrangler.face-processing.jsonc
pnpm deploy:face-processing
```

IAM principal potrebuje najmanj `rekognition:CreateCollection`,
`rekognition:IndexFaces`, `rekognition:SearchFacesByImage` in
`rekognition:DeleteFaces` za collection prefix `eventaj-*`. Skrivnosti niso na
web Workerju. Privzeta regija je `eu-central-1`, similarity prag 90, selfie pa
se izbriše po zaključku ali najpozneje v 15 minutah.
Po pravni in operativni odobritvi nastavi `FACE_SEARCH_ENABLED` na `true` v
`wrangler.jsonc` in `wrangler.face-processing.jsonc`; oba privzeto ostaneta
`false`, zato Premium paket sam ne vključi biometrične obdelave.

Produkcijski vrstni red je: najprej `pnpm db:migrate:remote`, nato potrebne vrste
in workerji (vključno s face-processing), nazadnje nov deployment spletne
aplikacije. Tako noben HTTP zaključek ne more uporabiti bindinga ali tabele, ki
še nista pripravljena.

Administratorski zagon ustvari en backfill job. Worker ga razdeli v sporočila po največ 100 fotografij; posamezni zapisi preprečijo dvojno štetje ob at-least-once dostavi.

ZIP vsebuje galerijske WebP različice, se pretočno shrani v zasebni R2 in poteče po 24 urah. Posamezna podpisana povezava za prenos velja 10 minut.

R2 CORS je omejen na produkcijska in lokalna izvora iz `config/r2-cors.json`. Po spremembi se ponovljivo uveljavi in preveri z:

```bash
pnpm r2:cors:apply
pnpm r2:cors:list
```

Bucket ostaja zaseben; `r2.dev` ni omogočen. Brskalnik nalaga neposredno prek 10-minutnega podpisanega `PUT` URL-ja, podpis pa je vezan tudi na deklarirani `Content-Type`.

Vsak nov dogodek dobi glavno QR dostopno točko. QR sliki sta na `/qr/{publicCode}.svg` in `.png`, stabilna povezava `/t/{publicCode}` pa zabeleži obisk, ohrani attribution za upload sejo in preusmeri na trenutni dogodek. Kanonični izvor, ki se zapiše v QR, določa `PUBLIC_APP_URL` v `wrangler.jsonc`.

Trenutna produkcijska aplikacija je na `https://eventaj-galerija.eventaj.workers.dev`. Glavni Worker uporablja EU D1/R2 bindinge, retention Worker pa ni javno dostopen in se zažene vsak dan ob 02:17 UTC. Za kasnejši priklop `galerija.eventaj.si` se doda Cloudflare Custom Domain; obstoječa stran na Vercelu lahko ostane nespremenjena.

## Stripe Checkout

Produkcijski skrivnosti nastavi z `wrangler secret put STRIPE_SECRET_KEY` in
`wrangler secret put STRIPE_WEBHOOK_SECRET`. Stripe webhook cilj je
`/api/webhooks/stripe`; posluša `checkout.session.completed`,
`checkout.session.async_payment_succeeded` in `checkout.session.expired`.
Provisioning organizacije, lastnika, aktivnega dogodka in glavne QR kode je
idempotenten. Kartični podatki vedno ostanejo na gostovanem Stripe Checkout.
