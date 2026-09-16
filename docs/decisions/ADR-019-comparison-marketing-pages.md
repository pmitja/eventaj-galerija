# ADR-019: Guest Mosaic primerjalne prodajne strani

Status: sprejeto 2026-09-11

## Odločitev

Guest Mosaic ima `/compare` in šest strani `/compare/guest-mosaic-vs-{id}`
za WhatsApp, Google Drive, Google Photos, GUESTPIX, Kululu in WedUploader.
EN je na korenu, DE/NL/ES/IT/FR uporabljajo jezikovne predpone in enake
sluge. To je izrecna izjema od naravnih lokaliziranih solution slugov v ADR-013.
Slovenska domena teh strani ne objavlja. Obstoječi wedding URL ostaja lastnik
generičnega poročnega prodajnega namena; primerjave odgovarjajo na izbiro alternative.

Vsebina je strežniška, iz tipiziranega registra in lokaliziranih besedil.
Viri, dejstva in datum preverjanja so skupni prevodom. Cene, ki jih ni mogoče
potrditi, ne dobijo izmišljene vrednosti. Primerjava jasno navaja založnika
Guest Mosaic, primerjani paket, vire ter prednosti in omejitve obeh rešitev.

Vsak jezik ima fizično App Router pot, da se HTML/cache ne meša med jeziki.
Canonical, hreflang, sitemap in jezikovni preklopnik uporabljajo isti register.
Javni slugi so validirani z Zod. Neveljavni slugi vrnejo 404.

Oblikovanje ohrani obstoječe marketinške komponente, posnetke aplikacije,
lokalni demo in mobilni CTA. Ne uvajamo CMS, novih API-jev, baze ali analitike.

## Povratna združljivost

Sprememba dodaja javne strani in povezave. Obstoječe poti, nakup in zasebne
galerije ostanejo združljivi; migracija baze ni potrebna. Deployment je ločen korak.
