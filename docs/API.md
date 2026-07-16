# API specifikacija

## Konvencije

- Osnova: `/api/v1`.
- JSON uporablja `camelCase`; datumi so ISO 8601 z offsetom/UTC.
- Uspešno ustvarjanje: `201`; asinhrono sprejeto delo: `202`; brez vsebine: `204`.
- Napake uporabljajo Problem Details (`application/problem+json`) z `type`, `title`, `status`, `code`, `detail`, `requestId` in opcijskimi `fieldErrors`.
- Mutacije sprejmejo `Idempotency-Key`, kjer lahko pride do ponovitve.
- Seznami uporabljajo cursor pagination, ne offseta.
- Zunanji API je različiciran; interne Server Actions niso javna pogodba.

## Javni event API

| Metoda | Pot | Namen | Auth |
| --- | --- | --- | --- |
| GET | `/events/{slug}` | javni podatki in omogočene akcije | javno/privacy gate |
| POST | `/events/{slug}/gallery-access` | preveri geslo in izda kratko sejo | rate limit |
| GET | `/events/{slug}/media` | paginirana javna galerija | javna seja |
| GET | `/events/{slug}/media/{publicId}` | lightbox podatki | javna seja |
| POST | `/events/{slug}/upload-sessions` | ustvari sejo in attribution | rate limit |
| POST | `/upload-sessions/{token}/files` | registrira manifest in signed parts | session token |
| POST | `/upload-sessions/{token}/files/{fileId}/parts` | osveži podpis za manjkajoče dele | session token |
| POST | `/upload-sessions/{token}/files/{fileId}/complete` | zaključi multipart upload | session token |
| DELETE | `/upload-sessions/{token}/files/{fileId}` | prekliče upload | session token |
| GET | `/upload-sessions/{token}` | stanja vseh datotek | session token |
| POST | `/upload-sessions/{token}/complete` | zaključi sejo in soglasja | session token |

Upload manifest vsebuje samo metapodatke, nikoli binarne datoteke. `token` se v bazi hrani hashiran.

## Stabilne QR/NFC poti

| Metoda | Pot | Namen |
| --- | --- | --- |
| GET | `/t/{publicCode}` | zabeleži obisk in `302/307` preusmeri na trenutni cilj |
| GET | `/qr/{publicCode}.{format}` | generira/pridobi QR v PNG ali SVG |

PDF se generira kot asinhron tiskarski dokument, ne v istem requestu.

## Dashboard API

| Metoda | Pot | Namen |
| --- | --- | --- |
| GET/POST | `/admin/events` | seznam ali ustvarjanje dogodka |
| GET/PATCH | `/admin/events/{eventId}` | podrobnosti ali urejanje |
| POST | `/admin/events/{eventId}/transitions` | ekspliciten prehod statusa |
| POST | `/admin/events/{eventId}/duplicate` | podvojitev konfiguracije |
| DELETE | `/admin/events/{eventId}` | zahteva za izbris po politiki |
| GET/PATCH | `/admin/events/{eventId}/settings` | privacy, moderation, tema, limiti |
| GET | `/admin/events/{eventId}/media` | upravljavski seznam medijev |
| GET | `/admin/media/{mediaId}` | avtenticiran prikaz zasebnega thumbnaila v upravljavski galeriji |
| POST | `/admin/events/{eventId}/media/actions` | bulk approve/reject/hide/delete |
| GET/POST | `/admin/events/{eventId}/access-points` | fizične točke in QR kode |
| GET | `/admin/events/{eventId}/analytics` | agregati funnelov |
| GET/POST | `/admin/nfc-stands` | inventar stojal |
| POST | `/admin/nfc-stands/{standId}/assignments` | časovno omejena dodelitev |
| DELETE | `/admin/nfc-stands/{standId}/assignments/{id}` | zaključi dodelitev |

Vsak endpoint preveri organizacijski scope. Platform admin override se auditira.

## Poznejše faze

| Metoda | Pot | Namen |
| --- | --- | --- |
| POST | `/admin/events/{eventId}/exports` | asinhron ZIP izvoz |
| GET | `/admin/exports/{exportId}` | status in signed download |
| POST | `/admin/events/{eventId}/print-jobs` | PDF/tiskarski material |
| GET/PATCH | `/admin/events/{eventId}/slideshow` | nastavitve slideshowa |
| POST | `/admin/events/{eventId}/ai/best-photos` | zagon AI izbora |
| POST | `/events/{slug}/face-search-sessions` | soglasje + signed selfie upload |
| POST | `/integrations/events/{eventPublicId}/media` | fotobooth upload z API ključem |

## Webhooki in interni endpointi

- `/api/internal/storage/events`: opcijski storage callback, podpisan in replay-protected.
- `/api/internal/realtime/auth`: avtorizacija kanalov.
- `/api/internal/health/live` in `/ready`: health checks brez občutljivih podrobnosti.

Worker praviloma bere queue in ne potrebuje javnega HTTP callbacka.

## Primer napake

```json
{
  "type": "https://app.eventaj.si/problems/upload-limit",
  "title": "Datoteka presega dovoljeno velikost",
  "status": 422,
  "code": "UPLOAD_FILE_TOO_LARGE",
  "detail": "Največja dovoljena velikost fotografije je 25 MB.",
  "requestId": "req_...",
  "fieldErrors": { "files.0.size": ["Največ 26214400 bajtov."] }
}
```
