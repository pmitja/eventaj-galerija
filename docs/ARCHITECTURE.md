# Arhitektura

## Izbrani pristop

Za prvi slikovni MVP velja [ADR-004](decisions/ADR-004-cloudflare-platform.md). Sistem je modularni monolit na Cloudflare platformi z dvema Worker skriptama:

1. `web`: Next.js App Router prek OpenNext za javne strani, dashboard in Route Handlerje;
2. `retention`: majhen scheduled Worker za dnevni fizični izbris.

Metapodatki so v D1, zasebni originali ter spletne variante v R2. Cloudflare Images binding iz originala izdela očiščen WebP in thumbnail. Redis/BullMQ ter dolgoročen Node.js worker niso del prvega slikovnega MVP-ja.

## Predlagani moduli

| Modul | Odgovornost |
| --- | --- |
| identity | prijava, seje, vloge in članstvo v organizaciji |
| organizations | tenant meja in naročniki |
| events | življenjski cikel dogodka, nastavitve in upravičenja |
| access | QR/NFC točke, preusmeritve, attribution in obiski |
| uploads | upload seje, signed URL-ji, kvote in zaključevanje |
| media | metapodatki, variante, moderacija in galerija |
| processing | queue opravila, thumbnaili, EXIF, video in checksum |
| exports | ZIP ter časovno omejeni prenosi |
| slideshow | playlist, dovoljenja in real-time dogodki |
| ai | ponudniško neodvisni ukazi ter rezultati analiz |
| notifications | e-pošta in in-app obvestila |
| compliance | soglasja, hramba, izbris in audit |
| billing | paketi, dodatki, cene in upravičenja |

Moduli komunicirajo prek funkcij use-case in domenskih dogodkov. Ne uvažajo notranjih repositoryjev drugih modulov.

## Next.js poti

```text
app/
  (public)/e/[slug]/              # javna stran, upload in galerija
  (public)/t/[code]/              # stabilna QR/NFC preusmeritev
  (auth)/login/                   # prijava osebja
  (dashboard)/admin/              # platform admin
  (dashboard)/events/[eventId]/   # upravljanje dogodka
  display/[token]/                # zaščiten slideshow (faza 2)
  api/v1/                         # javni in partnerski HTTP API
  api/internal/                   # webhooki in notranji callbacki
```

Route groups so predstavitvena struktura. Poslovna pravila živijo v `packages/domain` oziroma strežniških feature modulih.

## Tok uploada

```mermaid
sequenceDiagram
  participant G as Gost
  participant W as Next.js API
  participant D as Cloudflare D1
  participant S as Cloudflare R2
  participant M as Cloudflare Images

  G->>W: Ustvari upload sejo + manifest datotek
  W->>W: Validacija, kvota, rate limit, privacy pravila
  W->>D: upload_session + uploads(pending)
  W-->>G: kratkotrajen signed PUT URL
  G->>S: Neposreden prenos slike
  G->>W: Zaključi posamezen upload
  W->>S: HEAD preverjanje velikosti
  W->>D: status=processing
  W-->>G: 202 Accepted
  W->>M: asinhrona transformacija prek waitUntil
  M->>S: Prebere zasebni original
  M->>M: dekodiranje in WebP transformacija
  M->>S: Shrani web + thumbnail
  M->>D: media_file + variants + status=ready
```

### Pravila uploada

- podpis velja kratek čas in dovoljuje le določen object key ter velikost;
- object key temelji na internem UUID, ne na originalnem imenu;
- originalno ime je očiščeno in je le metapodatek;
- odjemalčev MIME je namig, worker preveri magic bytes;
- dogodek, seja in vsaka datoteka imajo kvoto ter rate limit;
- zaključek in processing job sta idempotentna;
- zapuščeni pending zapisi in objekti se periodično očistijo;
- status se spreminja s compare-and-set, da retry ne vrne stanja nazaj.

## Shranjevanje

Predlagana logična struktura bucketov/prefixov:

```text
private-originals/{organizationId}/{eventId}/{mediaId}/original
private-derived/{organizationId}/{eventId}/{mediaId}/{variant}
temporary/{uploadSessionId}/{uploadId}
exports/{organizationId}/{eventId}/{exportId}.zip
```

Originali so vedno zasebni. Javne variante se dostavljajo prek podpisanih CDN URL-jev ali preverjene image delivery poti. Imena bucketov so konfiguracija okolja.

## Cache in real-time

- Redis se uporablja za queue, rate limiting in kratke cache ključe, ne kot vir resnice.
- V MVP galerija uporablja revalidation oziroma polling po uspešnem uploadu.
- Faza 2 uvede `RealtimePublisher` adapter (Pusher/Ably/Supabase ali SSE na primernem hostingu).
- Sporočilo vsebuje le ID in tip dogodka; odjemalec nato pridobi avtorizirano stanje iz API-ja.

## Avtentikacija in avtorizacija

- Osebje uporablja e-poštno prijavo; ponudnik se potrdi pred scaffoldom.
- Seja identificira uporabnika, avtorizacijska storitev pa preveri članstvo, vlogo, organizacijo in po potrebi dogodek.
- Platform admin je ločena globalna sposobnost, ne članstvo v vsaki organizaciji.
- Javni slideshow uporablja preklicljiv, rotirajoč, hashiran token.
- Partnerski fotobooth API uporablja hashiran ključ z obsegom, dogodkom, rokom in rate limitom.

## Deployment topologija

Priporočena začetna topologija:

- Next.js web na platformi z dobro podporo za App Router;
- worker na long-running container hostingu;
- upravljani PostgreSQL z EU regijo in PITR;
- upravljani Redis z vztrajnostjo, primerno za queue;
- R2/S3 bucket in CDN v EU-kompatibilni konfiguraciji;
- ločena okolja `local`, `preview`, `staging`, `production`.

Ponudniki ostanejo odprta odločitev. Preview okolja ne smejo uporabljati produkcijskih osebnih podatkov.

## Opazljivost

- strukturirani JSON logi z `requestId`, `jobId`, `eventId` in brez PII;
- error tracking za web in worker;
- metrike: upload success rate, processing latency, queue depth, failed jobs, storage bytes, signed URL failures;
- health endpoints za web, DB, Redis in worker heartbeat;
- alarm za naraščajočo dead-letter vrsto ter neuspešno brisanje ob poteku hrambe.
