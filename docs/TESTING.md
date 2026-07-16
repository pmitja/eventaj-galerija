# Testna strategija

## Testna piramida

### Unit testi

Orodje: Vitest. Pokrivajo čiste domenske funkcije:

- dovoljeni statusni prehodi dogodka in medija;
- izračun entitlementov in hrambe;
- moderation policy;
- upload omejitve, MIME/extension pravila in kvote;
- RBAC/permission matrika;
- normalizacija slugov in access point ciljev.

### Integration testi

Tečejo proti začasnemu PostgreSQL, Redis in S3-kompatibilnemu storage emulatorju/Testcontainers:

- tenant izolacija vseh repositoryjev;
- ustvarjanje upload seje, podpis, complete in idempotenten retry;
- worker ustvari variante in pravilno spremeni status;
- delni/neveljaven upload ne ustvari javnega medija;
- moderacija zapiše audit in pravilno filtrira galerijo;
- konflikt NFC dodelitev je preprečen tudi pri konkurenci;
- retention job izbriše vse pričakovane objekte in ostane idempotenten.

### E2E testi

Orodje: Playwright, primarno mobilni viewport.

- admin se prijavi, ustvari in aktivira dogodek;
- gost iz QR/NFC poti z enim klikom pride do file pickerja;
- upload več datotek prikazuje napredek, uspeh in retry;
- javna galerija spoštuje geslo, hidden state in moderacijo;
- moderator odobri fotografijo, ki se nato prikaže gostu;
- tipkovnica, fokus in osnovni accessibility smoke test.

## Upload testna matrika

| Scenarij | Pričakovanje |
| --- | --- |
| JPEG/HEIC/WebP v limitu | sprejet; web JPEG/WebP/AVIF po odločitvi |
| napačen extension, pravilni bytes | odločitev temelji na zaznanem tipu |
| deklarirana slika, izvršljiva vsebina | karantena/rejected |
| datoteka tik nad limitom | zavrnjena pred in po podpisu |
| prekinitev po več delih | nadaljevanje samo manjkajočih delov |
| potek podpisanega URL-ja | obnovljen podpis, brez novega media zapisa |
| dvojni complete request | isti rezultat, en job |
| dva enaka uploada | oba ohranjena v Basic; označena kot duplikat, ko je funkcija omogočena |
| worker crash po zapisu variante | retry brez podvojenih variant |
| dogodek doseže kvoto | jasna napaka, brez orphaned multipart uploada |

## Nefunkcionalni testi

- obremenitveni test upload-session API-ja in burst-a po koncu poroke;
- worker throughput in queue backlog pri več sto medijih;
- preverjanje velikosti Next.js bundle-a;
- Lighthouse/real-device meritve javne strani;
- avtomatizirani axe smoke testi, nato ročni pregled tipkovnice in screen readerja;
- restore test baze in vzorčni recovery storage metapodatkov.

## CI kakovostna vrata

1. format/lint;
2. TypeScript strict check;
3. unit testi;
4. integration testi z izoliranimi storitvami;
5. build web + worker;
6. migration check na prazni in kopiji prejšnje sheme;
7. E2E smoke za preview;
8. dependency/security scan.

Coverage odstotek ni samostojen cilj. Kritična pravila upload, auth, tenancy, moderacije in retentiona morajo imeti eksplicitne teste ne glede na skupno metriko.

