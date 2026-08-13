# Varnost in zasebnost

## Model groženj

Največja tveganja so zlonamerni ali množični uploadi, dostop do zasebnih galerij, tenant data leak, nepooblaščena moderacija, nevarne datoteke, kraja podpisanih URL-jev, zloraba NFC/QR točk in prekomerna hramba osebnih ali biometričnih podatkov.

## Kontrole po meji sistema

### Javni dostop

- nepredvidljivi javni ID-ji in `noindex` privzeto;
- rate limit po dogodku, seji in privacy-safe omrežnem signalu;
- bot/spam zaščita stopnjevano: brez trenja za normalen promet, challenge ob anomaliji;
- geslo galerije kot močan hash, nikoli plaintext;
- kratkotrajne, hashirano shranjene javne seje.

### Upload

- allowlist formatov, omejitev velikosti, števila in videodolžine;
- magic-byte/MIME preverjanje v workerju;
- glasovna voščila so omejena na 120 sekund/5 MB; zaključek preveri Content-Type in podpis WebM, MP4 ali Ogg vsebine pred objavo;
- randomiziran object key in očiščeno originalno ime;
- signed URL omejen na operacijo, key, čas in po možnosti content length/checksum;
- karantena do zaključenega varnostnega procesiranja;
- SVG/HTML in drugi aktivni formati niso dovoljeni kot gostujoči mediji;
- EXIF/GPS se ne objavi; spletne variante odstranijo občutljive metapodatke.

### Avtorizacija

- deny-by-default use-case policies;
- vsaka poizvedba vključuje organization/event scope;
- globalna admin dejanja in impersonation so posebej označena ter auditirana;
- API ključi imajo scope, datum poteka, rotacijo in prikaz samo ob ustvarjanju.

### Operacije

- skrivnosti so v secret managerju, ne v `.env` datotekah v repozitoriju;
- šifriranje med prenosom in v mirovanju;
- redni backupi ter preverjen restore postopek;
- dependency in container scanning v CI;
- CSP, varni cookieji, CSRF zaščita za cookie-auth mutacije in strogi CORS.

### Analitika in oglaševanje

- LiveSession in Meta Pixel se nalagata samo na javnih marketinških in pravnih straneh kanonične domene `guestmosaic.com` in šele po predhodnem soglasju; zasebne galerije, display, admin, prenosi, QR in plačilni rezultat so izključeni;
- LiveSession spada v ločeno kategorijo Analitika, Meta Pixel pa v kategorijo Marketing; obe sta privzeto izključeni;
- zavrnitev vseh nenujnih tehnologij mora biti enako dosegljiva kot sprejem, uporabnik pa lahko izbiro kadarkoli ponovno odpre;
- izbira in verzija obvestila se 180 dni hranita v nujnem first-party piškotku in lokalni shrambi;
- fotografije, videi, selfieji, face podatki in glasovna voščila se ne pošiljajo ponudnikoma analitike ali oglaševanja;
- Conversions API ne obide soglasja; dogodki se smejo poslati samo za brskalnik oziroma nakup z veljavnim marketinškim soglasjem.

## GDPR evidenca

Za vsak namen se zabeležijo verzija pravilnika, čas, dogodek, subjekt/seja in granted/withdrawn. Najmanj ločeni nameni:

- tehnična obdelava uploada;
- objava v galeriji;
- prikaz na slideshowu, če je relevanten;
- upload glasovnega voščila in njegova javna objava kot ločena namena;
- face collection processing;
- selfie match processing.

Soglasje ni edina možna pravna podlaga za celoten produkt; končno pravno podlago in vloge upravljavec/obdelovalec mora potrditi pravni svetovalec. Objavljena politika zasebnosti je produktna različica z dne 2026-08-13, pogoji uporabe pa z dne 2026-07-31; oba dokumenta pred polno produkcijsko uporabo potrebujeta pravni pregled ter dopolnitev polnih podatkov pravne osebe.

Videi so zasebni objekti v Cloudflare Stream s podpisanim predvajanjem. Ne vstopajo v slideshow, AI-izbor ali obrazno iskanje. Retention worker mora pred izbrisom dogodka uspešno izbrisati tudi vse pripadajoče Stream UID-je; ob napaki je izbris dogodka blokiran in se ponovi.

## Življenjski cikel podatkov

- Dogodek ima izračunan `gallery_expires_at` iz entitlementa in morebitnega podaljšanja.
- Opozorila se pošljejo pred potekom; točen urnik je produktna odločitev.
- Ob poteku se najprej prekliče dostop, nato po grace obdobju izvede fizični izbris.
- Signed izvozi imajo bistveno krajšo življenjsko dobo kot galerija.
- Selfie za iskanje se izbriše takoj po zaključku ali timeoutu.
- Brskalnik lahko zaradi nadaljevanja uporabniške izkušnje največ 30 dni hrani
  samo javne ID-je fotografij, ki so bile vrnjene kot zadetki. Zapis je vezan na
  dogodek, lokalnega gosta in verzijo pravilnika ter ga lahko gost kadarkoli izbriše.
  Selfie, embedding, similarity in ponudniški face ID se ne zapisujejo v brskalnik.
- Face embeddings imajo lasten krajši retention in jih je mogoče izbrisati ločeno.
- R2 objekti glasovnih voščil uporabljajo dogodkovno predpono in se ob retentionu dogodka fizično izbrišejo skupaj z metapodatki.
- Prvi face-search rez lokalno hrani samo opaque provider face ID-je; ponudniški
  face vector je v collection posameznega dogodka v konfigurirani EU regiji in
  poteče najpozneje v 30 dneh oziroma ob retentionu dogodka.
- Face search je dovoljen samo registrirani anonimni dogodkovni identiteti,
  največ petkrat na uro, ob Premium/add-on entitlementu in trenutni verziji soglasja.
- Backup retention mora biti opisan v pravilniku; izbris iz aktivnih sistemov ne sme obljubljati nemogočega trenutnega prepisa vseh backupov.

## Audit dogodki

Obvezno se beležijo prijave, spremembe vlog, statusi dogodka, privacy/moderation nastavitve, dodelitve NFC, odobritve/zavrnitve, izvozi, API ključi, ročni retryji, zahteve za izbris in zaključek retention jobov. Audit ne vsebuje originalnih datotek, podpisanih URL-jev, tokenov ali embeddingov.

## Incident minimum

- možnost takojšnjega izklopa uploadov na dogodku in globalno;
- preklic javnih sej, slideshow tokenov in API ključev;
- karantena posameznega medija;
- iskanje po request/job/event ID brez razkrivanja PII;
- dokumentiran owner incidenta, obveščanje in post-incident pregled pred produkcijo.
