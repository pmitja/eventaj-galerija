# Odprta vprašanja in predpostavke

## P0 — potrditi pred scaffoldom ali prvo migracijo

1. **Hosting in regija:** kateri ponudniki za Next.js, worker, PostgreSQL, Redis in object storage ter zahteva, da vsi osebni podatki ostanejo v EU?
2. **Avtentikacija:** magic link, geslo ali oboje; ali obstaja že Eventaj uporabniški sistem, s katerim se moramo povezati?
3. **Tenancy:** je začetna organizacija samo Eventaj ali morajo imeti agencije lasten dashboard že v MVP?
4. **Domene:** ali bodo produkcijske poti `app.eventaj.si`, poddomena na dogodek ali lastne domene naročnikov?
5. **Limiti:** največja velikost fotografije/videa, maksimalno trajanje videa, skupna kvota na paket in dovoljena formata HEIC/RAW?
6. **Pravna vloga:** kdo je upravljavec in kdo obdelovalec podatkov; natančno besedilo ter verzioniranje soglasij?
7. **Brisanje:** opozorilni intervali in grace obdobje po `gallery_expires_at`.

## P1 — potrditi med Fazo 1

1. Ali Basic vključuje ZIP ali se +5 € nanaša samo na ustvarjanje arhiva, medtem ko je ročni prenos vseh datotek vedno vključen?
2. Ali je objava v javni galeriji dovoljena brez izrecnega checkboxa ali mora biti privolitev obvezna za vsako sejo?
3. Ali naj admin lahko naknadno spremeni paket in kako se obračuna proracija/dodatki?
4. Ali `prepared` dovoljuje testne uploade in ali se ti ob aktivaciji izbrišejo?
5. Kdo prejema opozorila in prek katerega ponudnika se pošilja e-pošta?
6. Ali je dovoljen download originala ali samo optimizirane različice za posamezno fotografijo?
7. Ali lahko ista NFC stojala imajo vnaprej rezervirane prihodnje dodelitve?

## P2 — pred poznejšimi fazami

1. Izbor real-time ponudnika in pričakovano največje število hkratnih slideshow zaslonov.
2. AI build-vs-buy, ciljni strošek na fotografijo in sprejemljiva natančnost.
3. Face processing ponudnik/regija, DPIA in natančna biometrična retention politika.
4. Plačilni ponudnik, davki, računi in samopostrežni checkout.

## Začasne predpostavke

Dokler ni drugače potrjeno:

- podatki in backupi so v EU;
- javne galerije so `unlisted` in `noindex`;
- gostujoče slike: JPEG, PNG, WebP, HEIC; videi: MP4/MOV;
- slike največ 25 MB, videi največ 250 MB in 60 sekund;
- originali so zasebni, javne so samo očiščene spletne variante;
- upload po koncu dogodka je izključen, aktivna seja ima 15-minutno grace obdobje;
- opozorila o poteku so 14, 7 in 1 dan prej; fizični izbris 7 dni po poteku;
- prvi tenant je Eventaj, vendar je schema multi-tenant od začetka;
- real-time ponudnik in auth knjižnica ostaneta za adapterjem do P0 odločitve.
