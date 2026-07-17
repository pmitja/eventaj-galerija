# Sledljivost zahtev

Ta matrika ohranja povezavo med izvornim briefom, načrtom in predvideno izvedbo. Status `planned` pomeni, da je zahteva arhitekturno upoštevana, ne da je že implementirana.

| # | Sklop briefa | Faza | Primarni dokument | Status načrta |
| --- | --- | --- | --- | --- |
| 1 | Upravljanje dogodkov | 1A/1B | [PRODUCT](PRODUCT.md), [API](API.md) | planned |
| 2 | Javna stran dogodka | 1A/1B | [PRODUCT](PRODUCT.md), [UX](UX_DESIGN_SYSTEM.md) | planned |
| 3 | Foto/video upload | 1A/1B | [ARCHITECTURE](ARCHITECTURE.md), [USER_FLOWS](USER_FLOWS.md) | planned |
| 4 | Obdelava datotek | 1A/1B | [ARCHITECTURE](ARCHITECTURE.md), [ADR-003](decisions/ADR-003-background-worker.md) | planned |
| 5 | Galerija | 1A/1B | [PRODUCT](PRODUCT.md), [UX](UX_DESIGN_SYSTEM.md) | planned |
| 6 | Moderacija | 1A/1B | [PRODUCT](PRODUCT.md), [DATA_MODEL](DATA_MODEL.md) | planned |
| 7 | AI Best Photos | 3 | [ROADMAP](ROADMAP.md), [DATA_MODEL](DATA_MODEL.md) | planned |
| 8 | AI Face Collections | 4 | [SECURITY_PRIVACY](SECURITY_PRIVACY.md), [USER_FLOWS](USER_FLOWS.md) | planned, legal gate |
| 9 | Live Slideshow | 2 | [ARCHITECTURE](ARCHITECTURE.md), [API](API.md) | planned |
| 10 | QR kode | 1A/2 | [API](API.md), [ROADMAP](ROADMAP.md) | implemented (stable redirect + SVG/PNG) |
| 11 | NFC stojala | 1B | [DATA_MODEL](DATA_MODEL.md), [USER_FLOWS](USER_FLOWS.md) | planned |
| 12 | Sledenje virom | 1A/1B | [DATA_MODEL](DATA_MODEL.md), [PLANNING](PLANNING.md) | planned |
| 13 | Fotobooth dostop | 2 | [ROADMAP](ROADMAP.md), [USER_FLOWS](USER_FLOWS.md) | uporablja običajni access point in gostujoči upload |
| 14 | PDF in tiskovine | — | [ROADMAP](ROADMAP.md) | izven dogovorjenega obsega |
| 15 | Prenosi in ZIP | 2 | [ARCHITECTURE](ARCHITECTURE.md), [API](API.md) | planned |
| 16 | Hramba in brisanje | 1B | [SECURITY_PRIVACY](SECURITY_PRIVACY.md), [USER_FLOWS](USER_FLOWS.md) | planned, legal gate |
| 17 | Admin dashboard | 1A/1B | [UX](UX_DESIGN_SYSTEM.md), [API](API.md) | planned |
| 18 | Obvestila | 1B/2 | [DATA_MODEL](DATA_MODEL.md), [ROADMAP](ROADMAP.md) | planned |
| 19 | Varnost | 0–4 | [SECURITY_PRIVACY](SECURITY_PRIVACY.md), [TESTING](TESTING.md) | cross-cutting |
| 20 | GDPR in zasebnost | 0–4 | [SECURITY_PRIVACY](SECURITY_PRIVACY.md), [DATA_MODEL](DATA_MODEL.md) | cross-cutting, legal gate |

## Poslovni elementi

| Zahteva | Načrtovana rešitev |
| --- | --- |
| Basic/Advanced/Premium | paket je prodajna konfiguracija; event entitlement snapshot je izvršilni vir resnice |
| Neodvisni dodatki | `event_addons` + materializirani `event_entitlements` |
| Razširitev na agencije | `organizations` in članstva od prve migracije |
| Stabilni NFC URL | časovno veljavne `nfc_assignments` za stalen `public_code` |
| Merjenje konverzije | event-specifičen anonimen obisk, povezan z upload sejo in access pointom |
| AI brez trajnega brisanja | rezultat je analiza/kategorija; delete je ločena avtorizirana operacija |
| Selfie samo za iskanje | začasni zasebni objekt in embedding z obveznim cleanupom |

## Sprejemna sledljivost

Ob implementaciji se vsaka user story sklicuje na vrstico te matrike in doda:

- konkreten sprejemni kriterij;
- testni primer ali razlago, zakaj test ni avtomatiziran;
- metriko/opazljivost, kadar gre za zanesljivost ali operacije;
- odločitev o zasebnosti in hrambi, kadar nastajajo novi podatki.
