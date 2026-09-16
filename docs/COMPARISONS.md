# Primerjave Guest Mosaic

Prva uredniška preverba: 2026-09-11. Obseg in poti določa
[ADR-019](decisions/ADR-019-comparison-marketing-pages.md).

## Vsebina in vzdrževanje

`lib/comparisons/` vsebuje register javnih poti, preverjena dejstva, šest
jezikovnih slovarjev ter besedila za vsako alternativo. Skupna predloga je v
`components/comparisons/`. Statično besedilo je strežniško; lokalni simulator
in obstoječi header/footer ohranijo svoje interaktivne komponente.

Pred spremembo številk preveri uradni vir. Posodobi vse prevode, datum
COMPARISON_UPDATED in ciljne teste. Cen ne preračunavaj med valutami in ne
primerjaj promocijske cene, kot da je trajna. Registracija organizatorja ni
isto kot račun gosta. Loči rok nalaganja, rok hrambe in način prenosa.

## Preverjeni viri

| Alternativa | Obseg | Viri |
| --- | --- | --- |
| WhatsApp | Messenger, pošiljanje medijev, HD/dokumenti, zasebnost | [Messaging](https://www.whatsapp.com/messaging), [Privacy](https://www.whatsapp.com/privacy) |
| Google Drive | osebni deljeni folder, dovoljenja in račun | [Shared folders](https://support.google.com/drive/answer/7166529), [Drive](https://support.google.com/drive/answer/2424384) |
| Google Photos | sodelovanje pri albumu, shranjevanje in dostop | [Sharing](https://support.google.com/photos/answer/6131416), [Album privacy](https://support.google.com/photos/answer/9789702) |
| Google storage | brezplačna skupna kvota, dodatni plačljivi prostor | [Google One](https://one.google.com/about/plans) |
| GUESTPIX | Classic, 3 mesece upload, 12 mesecev hosting; cena ni bila razvidna iz javnega izpisa | [Wedding plans](https://guestpix.com/weddings/), [Guest flow](https://help.guestpix.com/article/153-start-here-welcome-to-guestpix) |
| Kululu | Plus; javno prikazana akcija 39 USD in redna cena 79 USD | [Pricing](https://www.kululu.com/pricing), [Guest flow](https://help.kululu.com/en/articles/11402245-what-is-kululu) |
| WedUploader | Premium; povezava z Drive, brez guest login; cena se ni izpisala | [Pricing](https://weduploader.com/pricing), [Storage workflow](https://weduploader.com/) |

Za GUESTPIX in WedUploader je prikazan status nepotrjenega zneska s povezavo
na uradni cenik. Ne gre za brezplačna paketa. Trditev o manjkajočem namenskem
live event wallu pri orodjih za chat/folder/album se nanaša na primerjani
osnovni potek, ne na nezmožnost prikazovanja slik na zaslonu.

Guest Mosaic cena je usklajena z `lib/domain/billing.ts`, rok hrambe z
`lib/domain/events.ts`. ZIP vsebuje galerijske različice fotografij; posamezni
originali imajo ločen prenos. Dostop s povezavo ni zaščita z geslom.

## Iskalne teme

Pred pisanjem je bilo pregledanih 36 kombinacij, šest alternativ × šest
jezikov. Ime alternative je združeno s spodnjo temo. Rezultati so bili
uporabljeni za razumevanje jezika in namena, ne kot vir dejstev o ponudnikih.
Nimamo podatkov o obsegu iskanja ali obljube uvrstitev.

| Jezik | Osnovna tema | Sorodni nameni |
| --- | --- | --- |
| EN | wedding photo sharing comparison alternative | guest uploads, QR code, pricing, storage |
| DE | Hochzeitsfotos sammeln Vergleich Alternative | ohne App, Gästefotos, QR-Code, Kosten |
| NL | trouwfoto’s verzamelen vergelijking alternatief | zonder app, QR-code, kosten, opslag |
| ES | compartir fotos boda comparativa alternativa | invitados, código QR, precio, almacenamiento |
| IT | foto matrimonio confronto alternativa | invitati, senza app, codice QR, prezzo |
| FR | partage photos mariage comparatif alternative | invités, sans application, QR code, prix |

DE/NL/ES/FR rezultati vsebujejo lokalne primerjave in alternative, IT za
nekatere kombinacije vrača tudi druge jezike. Besedila so zato prilagojena
uporabnikom, ne prepisana iz konkurentskih naslovov. Posebni nameni so
WhatsApp kakovost in skupine, Drive dovoljenja, Photos albumi, GUESTPIX
paketi, Kululu čas nalaganja ter WedUploader lastništvo shrambe.

## UX reference

Mobbin: [Sketch](https://mobbin.com/sites/sections/7a16f1f5-eaa6-4142-a34f-97a82a33c85d)
za povezavo ponudbe in tabele;
[Lightdash](https://mobbin.com/sites/sections/923ce9ff-1152-446a-8654-ce0b7ff3e537)
za razlikovanje paketov. Uporabljena je lastna obstoječa vizualna podoba in
posnetki aplikacije. Generiranje slik ni bilo potrebno.

Revizija po vizualnem pregledu uporablja lokalnega skill-a `design-taste-frontend`
in [Impeccable](https://github.com/pbakaus/impeccable) načela jasne hierarhije,
razmikov in dejanske produktne vsebine. Lokalni Taste skill je bil prebran;
Impeccable ni nameščen in njegov zaganjalnik ni bil uporabljen. Uporabljena so
bila uradna navodila `layout` in `craft-floor`, brez namestitve ali novih odvisnosti.
Smer je ohranitev znamke, umirjeno gibanje in zmerna gostota (Taste: variance 3,
motion 1, density 5). Konkreten vzorec je dokumentiran v UX_DESIGN_SYSTEM.md.

## Lokalno preverjanje

Zaženi `pnpm dev --hostname 0.0.0.0 --port 3001`, nato
`node scripts/check-comparison-pages.mjs`. Skripta preveri 42 strani, 404,
štiri širine pregleda in primerjav v šestih jezikih (48 scenarijev),
preklopnik jezika, FAQ in vire s tipkovnico, vidno ozadje nakupnega CTA, lokalni
upload brez omrežnega prenosa in CTA ob dialogu za piškotke. Posnetke shrani
v `/tmp/guestmosaic-comparisons`. Pred nakupom ne izvede nobenega plačila.
Z `COMPARISON_PREVIEW_URL` lahko nastaviš drug lokalni preview URL.

FAQ je skupna shadcn-style komponenta nad Radix Accordion. Premik strani je
CSS-only: kratek vstop hero vsebine in progresivni viewport reveal sekcij. Oba
tokova ostaneta statična, kadar uporabnik izbere zmanjšano gibanje.

Po produkcijski objavi spremljaj prikaze/klike primerjalnih poti v Search
Console ter obstoječe meritve začetih nakupov in nakupov. Nova analitika ali
samodejna redna preverba cen ni uvedena. Objava ni del te implementacije.
