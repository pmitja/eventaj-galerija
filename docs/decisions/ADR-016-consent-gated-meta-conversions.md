# ADR-016: Meta konverzije samo z veljavnim marketing soglasjem

- Status: accepted
- Datum: 2026-08-13

## Kontekst

Guest Mosaic uporablja Meta oglase in mora meriti začetek nakupa ter uspešno
plačilo. Browser Pixel sam ni dovolj zanesljiv, Conversions API pa ne sme
obiti uporabnikove izbire glede marketing piškotkov ali zajeti Eventaj oziroma
občutljivih gostujočih poti.

## Odločitev

- Meta Pixel in Conversions API sta omogočena samo za kanonično domeno
  `guestmosaic.com` ter samo ob veljavnem marketing soglasju trenutne verzije.
- Strežnik pošlje standardna dogodka `InitiateCheckout` po uspešni vzpostavitvi
  Stripe Checkout in `Purchase` po preverjenem plačilu ter provisioningu.
- Stabilni `event_id`, izpeljan iz lokalnega ID-ja naročila, omogoča varno
  deduplikacijo ponovitev. Stripe še naprej prejme samo lokalni ID naročila.
- E-pošta se pred pošiljanjem normalizira in zgošči s SHA-256. `fbp`, `fbc`, IP
  in user-agent se začasno hranijo ob naročilu, če je soglasje veljavno, ter se
  fizično izbrišejo po poskusu pošiljanja `Purchase` dogodka ali ob poteku
  naročila. Token za Conversions API je izključno Cloudflare secret.
- Nedosegljivost Mete nikoli ne prepreči začetka ali zaključka plačila. Napaka
  se zabeleži brez osebnih podatkov, skrivnosti ali celotnega zahtevka.

## Posledice

- Ob zavrnjenem, manjkajočem ali zastarelem soglasju se noben Meta konverzijski
  dogodek ne pošlje in identifikatorji se ne shranijo.
- Ponovljen Stripe webhook ne ustvari dodatnega poslovnega dogodka; Meta lahko
  prejme isti `event_id`, ki ga deduplicira.
- Migracija je razširitvena. Starejša aplikacija nove nullable stolpce prezre,
  obstoječa naročila pa imajo marketing soglasje privzeto izključeno.
