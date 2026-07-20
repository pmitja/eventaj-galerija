# ADR-012: Dostava dogodka brez uporabniškega računa

- Status: accepted
- Datum: 2026-07-20
- Nadomešča: uporabniški račun in organizatorsko prijavo iz ADR-011

## Kontekst

Naročnik kupi enkraten dogodek in po nakupu ne potrebuje nadzorne plošče.
Ustvarjanje gesla ter organizacijskega računa zato dodaja trenje in obveznosti,
ki niso del želene storitve. Naročnik potrebuje QR kodo pred dogodkom ter varen
prenos zbranih fotografij po njegovem zaključku.

## Odločitev

- Javni checkout zahteva kontaktno ime in e-pošto, ne gesla ali prijave.
- Plačan webhook idempotentno ustvari stranko in dogodek znotraj interne
  organizacije `eventaj`; ne ustvari uporabnika ali članstva.
- Po provisioningu se prek Cloudflare Queue pošlje transakcijska e-pošta z QR
  kodo, neposredno povezavo in jasnim opisom naslednjega koraka.
- Scheduled worker po `ends_at` označi dogodek kot zaključen, izdela en ZIP vseh
  pripravljenih galerijskih fotografij in po zaključku pošlje drugo e-pošto.
- ZIP povezava vsebuje nepredvidljiv bearer token; v D1 je samo SHA-256 hash.
  Povezava velja 24 ur, prenos pa ustvari kratkotrajen podpisan R2 URL.
- E-poštni ponudnik je za adapterjem. Prvi adapter uporablja Resend HTTP API,
  Cloudflare secret in idempotency key; retry ne sme poslati dvojnega sporočila.
- Platform administrator ohrani obstoječo prijavo za podporo in operacije.

## Posledice

- Organizatorski login ni del javnega produkta; checkout in success UI ne smeta
  obljubljati računa ali administratorskega dostopa.
- QR in ZIP e-pošti sta asinhroni, opazljivi in ponovljivi opravili.
- Če ob koncu ni pripravljenih fotografij, worker opravilo varno ponovi; praznega
  ZIP-a in zavajajoče e-pošte ne pošlje.
- Obstoječi uporabniki in članstva ostanejo zaradi povratne združljivosti, nova
  samopostrežna naročila pa jih ne ustvarjajo.
