# ADR-017: Plačilo pred nastavitvijo dogodka

- Status: accepted
- Datum: 2026-08-17

## Kontekst

Mednarodni promet iz oglasov je dosegel naročilnico, vendar obiskovalci niso
začeli izpolnjevati dolgega obrazca. Podatki o dogodku niso potrebni za izračun
osnovne cene 35 EUR, zato pred plačilom po nepotrebnem povečujejo trenje.

## Odločitev

- Pred Stripe Checkout zberemo samo e-pošto in sprejem pogojev uporabe.
- Webhook po preverjenem plačilu idempotentno ustvari dogodek z začasnimi
  vrednostmi in močno naključno upravljavsko povezavo.
- Naročnik na upravljavski strani vnese naziv, datum in neobvezno lokacijo.
  Časovni pas se zazna samodejno, vendar ga lahko popravi. Privzeti konec je
  naslednji dan ob 12:00 v časovnem pasu dogodka.
- Šele dokončana nastavitev odklene QR, galerijo in Live Show ter sproži njihovo
  transakcijsko e-pošto. ZIP je na isti strani prikazan kot poznejši rezultat;
  dejanski prenos še vedno uporablja kratkotrajni podpisan URL.
- Osnovni nakup nima dodatkov. Dodatki se lahko pozneje prodajo kot ločen tok.

## Varnost in združljivost

- Upravljavska povezava ni javna galerijska ali Live Show povezava, je
  nepredvidljiva in se ne zapisuje v aplikacijske dnevnike.
- Migracija je razširitvena. Stara koda nove nullable stolpce prezre, nova koda
  pa še vedno zna prikazati že provisionirane nakupe.
- Plačana, a nedokončana naročila ostanejo vidna administratorju in jih je
  mogoče varno ponovno poslati brez ponovnega provisioninga.
