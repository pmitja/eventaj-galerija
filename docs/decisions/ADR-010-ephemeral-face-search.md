# ADR-010: Ephemeral selfie search prek ponudniškega face collection adapterja

Status: sprejeto za prvi rez faze 4, dopolnjeno z lokalnim UX predpomnilnikom
Datum: 2026-07-19, dopolnitev 2026-07-20

## Kontekst

Produktna specifikacija predvideva AI Face Collections in iskanje vseh fotografij
gosta s selfijem. Gre za biometrično obdelavo z visokim vplivom: rezultat mora
ostati omejen na en dogodek, selfie ne sme postati del galerije, ponudnik in
regija pa ne smeta biti zaklenjena v domenski model. P2 pravna vprašanja (DPIA,
končna pravna podlaga in natančen retention) ostajajo produkcijski gate.

## Odločitev

- Funkcija je privzeto izključena in jo strežnik dovoli samo ob globalnem
  `FACE_SEARCH_ENABLED=true` ter materializiranem event entitlementu `face_collections`.
- Gost poda ločeno, verzionirano soglasje za namen `selfie_match_processing`.
- Brskalnik naloži JPEG/PNG neposredno v zasebni R2 z največ 5 MB in podpisom,
  vezanim na MIME. Selfie poteče po 15 minutah.
- Indeksiranje dogodkovnih fotografij in selfie search tečeta v idempotentnem
  Queue workerju. Vse poizvedbe vključujejo `organization_id` in `event_id`.
- Domenski adapter izpostavi `indexFaces`, `searchFaces` in `deleteFaces`.
  Prvi produkcijski adapter uporablja Amazon Rekognition collection v izrecno
  nastavljeni EU regiji (privzeto `eu-central-1`). AWS skrivnosti so samo worker
  secrets. Zamenjava ponudnika ne spremeni HTTP API-ja ali podatkovnega modela.
- Lokalna baza hrani ponudniške opaque face ID-je, bounding box in model version,
  ne pa dostopnih surovih embeddingov. Ponudnik hrani face vector v regionalni
  collection; izbris medija ali dogodka mora izbrisati tudi ponudniške face ID-je
  oziroma collection.
- Selfie in njegov začasni objekt se fizično izbrišeta po uspehu, terminalni
  napaki, umiku soglasja ali timeoutu. Rezultati se izbrišejo ob umiku in potečejo
  skupaj s sejo.
- Rezultat vrne samo sicer javno dostavljive fotografije (`ready`, dovoljena
  objava, vidna galerija in efektivna kakovost `best`/`good`). Prag podobnosti je
  konfigurabilen in se zapiše ob rezultatu; AI rezultat ni jamstvo identitete.
- Rezultati se prikažejo kot filter obstoječe javne galerije, ne kot druga mreža.
  Brskalnik lahko največ 30 dni hrani verzioniran seznam javnih `media.public_id`
  zadetkov, vezan na event slug, lokalni `guest_id` in trenutno verzijo pravilnika.
  Ob poteku, spremembi pravilnika ali dejanju »Pozabi« se lokalni zapis odstrani.
  Selfie, similarity, ponudniški face ID in embedding niso del tega predpomnilnika.

## Posledice

Selfie ne potuje skozi Next.js proces, spletna zahteva ne čaka na AI in retry je
varen. Lokalni seznam javnih ID-jev omogoči nadaljevanje filtra brez nove
biometrične obdelave, vendar pomeni osebno povezavo na uporabnikovi napravi, zato
je omejen, verzioniran in eksplicitno izbrisljiv. Za produkcijo so potrebni Queue/DLQ, odobrene AWS IAM pravice, EU regija,
DPIA in potrjeno besedilo pravilnika. Če ponudnik ali entitlement ni konfiguriran,
API odpove zaprto in ne sprejme biometričnega uploada.

Migracija `0014_face_search.sql` je aditivna. Obstoječe Premium dogodke napolni z
upravičenjem; ostali ostanejo izključeni. Rollback aplikacije je združljiv, ker
starejša koda novih tabel in bindinga ne uporablja. Pred fizičnim rollbackom
migracije je treba najprej izbrisati ponudniške collections in začasne R2 objekte.
