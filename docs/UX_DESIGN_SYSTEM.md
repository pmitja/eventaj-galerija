# UX in design sistem

## Izkušnja

Produkt mora delovati praznično in prijazno, vendar dovolj mirno ter zaupanja vredno za fotografije gostov. Gostujoči vmesnik je vsebinsko lahek; administratorski del je gostejši, vendar uporablja iste tokene in komponente.

Začetna smer je **modern soft UI z jasnim kontrastom**, brez izrazitega neumorfizma. Priporočila UI/UX skill-a so vplivala na izbor prijazne tipografije, nežne globine, vidnih fokusov in mobile-first kontrol.

## Barve

Predlagani začetni tokeni, ki jih je treba uskladiti z obstoječo znamko Eventaj:

| Token | Vrednost | Uporaba |
| --- | --- | --- |
| `brand-600` | `#DB2777` | primarne akcije, aktivna stanja |
| `brand-400` | `#F472B6` | poudarki in nežna ozadja |
| `accent-600` | `#A16207` | sekundarni praznični poudarek |
| `surface-warm` | `#FDF2F8` | posebni hero/prazni deli |
| `ink-900` | `#3F0D25` | glavno besedilo na svetlem ozadju |
| `surface` | `#FFFFFF` | kartice in osnovno ozadje |

Originalno predlagana zlata `#CA8A04` na belem ni primerna za drobno besedilo; uporablja se temnejši odtenek ali le dekorativno. Vsak dejanski par mora doseči WCAG 2.2 AA (4.5:1 za običajno besedilo, 3:1 za večje).

Event branding se izvaja prek omejenih CSS tokenov. Naročnik ne more nastaviti kombinacije, ki krši minimalni kontrast; sistem ponudi varno izpeljano barvo besedila.

## Tipografija

- Primarna družina: **Plus Jakarta Sans**, z lokalnim/Next Font nalaganjem.
- Fallback: `ui-sans-serif, system-ui, sans-serif`.
- Body na mobilnem: najmanj 16 px, line-height 1.5–1.65.
- Dolga besedila: največ 65–75 znakov na vrstico.
- Številčni dashboard podatki uporabljajo `font-variant-numeric: tabular-nums`.

## Prostorski in oblikovni tokeni

- 4 px osnovna mreža; ključni razmiki 8, 12, 16, 24, 32, 48.
- Radius: 12 px kontrole, 16 px kartice, 24 px hero/večje površine.
- Sence so nežne in ne nosijo edine informacije o hierarhiji.
- Z-index lestvica: 10 sticky, 20 dropdown, 30 overlay, 40 modal, 50 toast.

## Gostujoča mobilna stran

Prvi viewport vsebuje naziv dogodka, kratek pozdrav in en dominantni CTA »Dodaj fotografije«. Video je sekundarna akcija, lahko združena v isti file picker, če so dovoljeni oba tipa. Galerija se začne pod foldom.

- CTA ima najmanj 52 px višine in polno uporabno širino na manjšem telefonu.
- Vse touch tarče so najmanj 44 × 44 px.
- File input je pravi semantičen input, sprožen z dostopno oznako/gumbom.
- Upload tray ostane viden in ne izgine ob navigaciji znotraj event strani.
- Napredek je podan z barom, odstotkom in besednim stanjem; ne samo z barvo.
- Skeletoni rezervirajo razmerje stranic in preprečijo layout shift.

## Galerija

- Mobile: 2 stolpca z razmerji stranic iz metapodatkov; desktop: prilagodljiva masonry mreža.
- Virtualizacija ali postopno nalaganje pri večjih galerijah.
- Lightbox podpira swipe, tipke, escape, fokus trap in reduced motion.
- Video nikoli ne autoplaya z zvokom.
- Filter in bulk izbira sta v adminu, gostujoči pogled ostane enostaven.

## Dashboard

- Navigacija po jasnih področjih: Pregled, Galerija, Moderacija, QR/NFC, Nastavitve.
- Statusi imajo besedilo + ikono + barvo.
- Destruktivne akcije niso v bližini primarnih dejanj in zahtevajo potrditev z opisom posledice.
- Tabele na mobilnem postanejo kartice ali horizontalno kontroliran prikaz; celotna stran ne sme horizontalno drseti.

## Gibanje

- Micro-interactions 150–250 ms, transform/opacity.
- Uspešen upload lahko uporabi kratko umirjeno animacijo, nikoli ne blokira nadaljevanja.
- `prefers-reduced-motion` odstrani nebistvene prehode in swipe animacije.
- Liveshow komentarji so omejeni na tri hkratne oblačke ob desnem robu, ne prekrivajo glavnih kontrol in uporabljajo samo `transform` ter `opacity`; reduced-motion različica ne spreminja položaja.

## Obvezna stanja komponent

Vsak podatkovni pogled definira: initial loading, background refresh, empty, partial data, recoverable error, terminal error in permission denied. Vsak async gumb ima pending stanje ter je zaščiten pred dvojnim klikom.

## Breakpoint QA

Obvezno ročno in avtomatizirano preverjanje pri 375, 768, 1024 in 1440 px. Dodatno preveri iOS Safari, Android Chrome, landscape, povečavo 200 %, tipkovnico in počasno/prekinitveno omrežje.

## Informacijska arhitektura marketing strani

Marketing navigacija segmentira **vrste dogodkov**, ne ljudi. Primarni naziv je
»Za dogodke«, ker je razumljivejši od »Komu je namenjeno« in ne ustvarja vtisa,
da je produkt omejen na poroke.

- Zasebni dogodki: poroke, rojstni dnevi in druga praznovanja.
- Poslovni dogodki: team buildingi, poslovni dogodki ter konference in sejmi.
- Vsaka vrsta dogodka ima svojo indeksabilno podstran z unikatnim naslovom,
  opisom, primeri uporabe in kontekstualnimi pogostimi vprašanji.
- Desktop uporablja dvostolpčni besedilni dropdown brez slik; na mobilnem je isti
  nabor prikazan v semantičnem razširljivem seznamu.
- Dropdown se odpre s klikom in tipkovnico, zapre s tipko Escape ali klikom zunaj
  ter ohrani vidna fokusna stanja in najmanj 44 px velike mobilne tarče.

## Prednakupni demo

- Primarni CTA ostaja »Ustvari dogodek«, sekundarni »Preizkusi demo dogodek« pa
  je v headerju in hero območju vizualno manj izrazit, vendar vedno jasno viden.
- Na mobilnem sta obe akciji na dnu odprte navigacije prikazani v polni širini.
- V vzorčni galeriji je Live Show predstavljen kot široka kontrastna kartica nad
  mrežo fotografij, z jasno ikono predvajanja, opisom in smerno puščico.
- Celozaslonski demo ohrani kontrole produkcijske projekcije, označen je kot
  »Demo v živo« in vedno ponuja pot nazaj v galerijo.
- Vzorčne fotografije vsebujejo statične komentarje, ki so vidni v mreži,
  lightbox panelu in Live Showu brez omrežnih zahtev ali možnosti objave.
- Logotip v demo galeriji, lightboxu in Live Showu vedno vodi nazaj na marketing
  stran. Lightbox puščici uporabljata optično centrirani SVG ikoni in na večjih
  zaslonih ostaneta ob fotografiji, ne ob robu celotnega viewporta.
- Vsi demo prehodi spoštujejo `prefers-reduced-motion`, kontrole imajo najmanj
  44 × 44 px in vidna fokusna stanja.

## SEO in AI discovery

- Kanonična domena aplikacije je `https://galerija.eventaj.si`; strukturirani
  podatki jo povezujejo z glavno znamko `https://eventaj.si`.
- Sitemap vsebuje samo domačo stran, naročilo in marketinške podstrani po vrstah
  dogodkov. Zasebne galerije, admin, demo in plačilni rezultati niso vključeni.
- Javni marketing je indeksabilen; zasebni in operativni tokovi uporabljajo
  `noindex` ter ustrezne `robots.txt` omejitve.
- JSON-LD uporablja dejanske tipe `Organization`, `WebSite`, `WebApplication`,
  `WebPage` in `BreadcrumbList`. Dokler ni preverjenih ocen, se
  `aggregateRating`, reviewi in testimonial trditve ne objavljajo.
- `/llms.txt` je kratek kuriran zemljevid javnih virov, `/llms-full.txt` pa
  avtoritativni razširjeni opis ponudbe, omejitev, zasebnosti in vseh use-caseov.
