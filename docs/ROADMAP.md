# Razvojni roadmap

Roadmap uporablja vertikalne reze: vsak mejnik dostavi uporabno pot skozi UI, API, bazo, worker in opazljivost. Ocene se določijo po potrditvi P0 odločitev in prototipu uploada.

## Faza 0 — temelj

- Next.js aplikacija z ločenimi domenskimi, repository in storage moduli;
- Next.js App Router, TypeScript strict, Tailwind, shadcn/ui;
- lokalna D1 in R2 emulacija prek Wranglerja;
- D1 shema in migracije;
- tipizirana okoljska konfiguracija;
- CI, lint, format, Vitest, Playwright in osnovna observability;
- Auth.js prijava enega administratorja in zaščiten admin del.

**Izhod:** prijavljen admin vidi prazen dashboard svoje organizacije; deployment in migracije delujejo v stagingu.

## Faza 1A — prvi produkcijski rez

- CRUD dogodka z dovoljenimi statusnimi prehodi;
- javna event stran in privacy modes `unlisted`/`public`;
- slikovni multipart upload z resume/retry;
- worker: validacija, EXIF, checksum, thumbnail in web varianta;
- osnovna javna galerija;
- `none` in `full` moderacija;
- QR access point in osnovni visit/upload funnel;
- demo dogodek in integration/E2E testi.

**Izhod:** admin ustvari dogodek, gost naloži slike, admin jih odobri, slike se prikažejo v galeriji.

## Faza 1B — poslovno celovit MVP

- video upload, poster in trajanje;
- password in hidden-until-ended galerija;
- vse tri moderation modes ter bulk dejanja;
- NFC inventar, časovne dodelitve in stabilne preusmeritve;
- branding, naslovnica in Eventaj varne barvne prilagoditve;
- dashboard stanja, storage in napak;
- obvestila za ključne event/retention dogodke;
- retention in izbrisni postopki;
- produkcijski security/load/accessibility pregled.

**Izhod:** operativno uporaben plačan paket Basic, Advanced/Premium upravičenja pa so pripravljena v modelu.

## Faza 2 — prikaz in distribucija

- live slideshow z zaščitenim URL-jem in real-time adapterjem;
- ločena slideshow moderacija;
- ZIP izvozi in kratkotrajni signed downloadi;
- QR predloge in asinhroni PDF materiali;
- napredna analitika access pointov;
- fotobooth access point ter omejen external-upload API.

## Faza 3 — AI kakovost

- ponudniško neodvisen AI pipeline;
- ostrina, osvetlitev, blur in tehnična kakovost;
- checksum + perceptual duplicate detection;
- Best/Good/Duplicate/Blurry/Low Quality kategorije;
- ročni override in AI-only izvoz;
- spremljanje model version ter stroška na dogodek.

AI nikoli samodejno trajno ne izbriše datoteke.

## Faza 4 — obrazi in SaaS širitev

- eksplicitno vključene face collections;
- šifrirani embeddingi, cluster management in brisanje;
- ephemeral selfie search;
- napredne privacy kontrole;
- self-service organizacije, dodatni administratorji in white-label;
- po potrditvi poslovnega modela billing/checkout.

## Definition of Done za vsak rez

- sprejemni kriteriji iz produktnega dokumenta so izpolnjeni;
- migracije so povratno združljive in preverjene;
- permission/tenant testi so zeleni;
- loading, empty, error, retry in mobilna stanja so končana;
- relevantni logi, metrike in alerti obstajajo;
- accessibility in responsive QA sta izvedena;
- dokumentacija ter ADR so posodobljeni;
- ni odprtih P0 varnostnih ali podatkovnih incidentov.
