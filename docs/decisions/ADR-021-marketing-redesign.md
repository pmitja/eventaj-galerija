# ADR-021: Prenova marketinške strani (Guest Mosaic design)

- Status: accepted
- Datum: 2026-09-23

## Kontekst

Za Guest Mosaic je bil v Claude Design pripravljen nov vizualni sistem (topli
papirnati toni, terakota poudarek, Libre Caslon Text + Hanken Grotesk) za
domačo stran, cenik, pogosta vprašanja, poročno stran, naročilo in pravne
strani. Naročilo v dizajnu vsebuje tudi oba dodatka po 15 €, ki ju je ADR-017
odstranil iz minimalnega nakupa.

## Odločitev

- Prenovljene strani živijo v `components/site/` in uporabljajo Tailwind
  tokene `gm-*` iz `app/globals.css`; tekst je v `lib/i18n/site/<locale>.ts`,
  tipiziran proti angleščini.
- Vse strani dogodkov (`/for-events/*`) in tri SEO strani uporabljajo isto
  predlogo kot poročna stran (`EventLanding`), z obstoječo lokalizirano vsebino.
- Nova `/pricing` in `/faq` obstajata samo na domeni Guest Mosaic (in njenih
  jezikovnih predponah). Na slovenskem gostitelju ju middleware preusmeri na
  `eventaj.si/qr-galerija`, hreflang pa slovenščine ne navaja.
- Minimalni nakup (ADR-017) ostane: e-pošta + pogoji, podatki dogodka po
  plačilu. Dodana sta neobvezna `aiBestPhotos` in `videoUnlimited` (privzeto
  `false`); cena se izračuna na strežniku s `checkoutTotalCents`, video dodatek
  je zavrnjen, dokler `VIDEO_UPLOAD_ENABLED` ni `true`.

## Posledice

Ni migracije: stolpca `ai_best_photos` in `video_unlimited` v `checkout_orders`
že obstajata in izpolnitev naročila ju že upošteva. Stari odjemalci, ki
pošljejo samo e-pošto in pogoje, delujejo nespremenjeno. Strani funkcij in
primerjav še uporabljajo stari landing CSS in jih je treba prenoviti posebej.
