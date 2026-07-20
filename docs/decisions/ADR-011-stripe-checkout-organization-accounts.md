# ADR-011: Stripe Checkout in organizacijski računi

- Status: accepted
- Datum: 2026-07-20
- Delno nadomeščeno z: [ADR-012](ADR-012-email-only-event-delivery.md), ki
  odstrani uporabniški račun in prijavo iz javnega nakupnega toka

## Kontekst

Prvi Cloudflare MVP je imel en interni administratorski račun in fiksni
`ORGANIZATION_ID`. Javna ponudba mora postati samopostrežna: naročnik plača
posamezen dogodek, po uspešnem plačilu pa dobi lasten, tenantsko omejen dostop.

## Odločitev

- Osnovna cena enega dogodka je 35 EUR. `AI Best Photos` je opcijski dodatek
  15 EUR za največ 3.000 fotografij; večje količine ostanejo ponudba po meri.
- Plačilo uporablja gostovani Stripe Checkout v načinu `payment`. Aplikacija
  ustvari lasten `checkout_order`, Stripe pa v metadata prejme samo njegov
  neobčutljiv ID.
- Podpisan webhook `checkout.session.completed` oziroma
  `checkout.session.async_payment_succeeded` je avtoritativni sprožilec.
  Provisioning je idempotenten in pred njim ponovno pridobi Checkout Session ter
  preveri `payment_status`, valuto in pričakovani znesek.
- Prvi nakup zbere organizacijo, lastnika, e-pošto in geslo še pred preusmeritvijo
  na Stripe. Hrani se samo PBKDF2 hash. Po plačilu nastanejo `organization`,
  `user`, članstvo `owner`, aktiven dogodek, snapshot upravičenj in glavna QR
  dostopna točka.
- Prijavljen član lahko kupi dodaten dogodek za obstoječo organizacijo brez
  ustvarjanja novega računa.
- JWT seja vsebuje `userId`, `organizationId`, vlogo in platform-admin zastavico.
  Vsak administratorski read/write uporablja organizacijo iz preverjene seje;
  fiksni `ORGANIZATION_ID` ostane le za združljivost internega Eventaj računa.
- Stripe secret key in webhook signing secret sta izključno Cloudflare secrets.
  Kartični podatki nikoli ne pridejo v aplikacijo.

## Posledice

- Dogodka ni dovoljeno samopostrežno ustvariti mimo uspešnega plačila.
- Webhook mora sprejeti nespremenjeno surovo telo in preveriti podpis.
- Ponovljeni ali sočasni webhooki ne smejo ustvariti dodatnega dogodka.
- Obstoječi Eventaj podatki ostanejo v organizaciji `eventaj`; migracija je samo
  razširitvena in starejša različica aplikacije nove tabele prezre.
- Pozabljeno geslo in povabila dodatnim članom zahtevajo poznejši e-poštni tok;
  niso pogoj za prvi avtomatiziran nakup lastnika.
