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

## Obvezna stanja komponent

Vsak podatkovni pogled definira: initial loading, background refresh, empty, partial data, recoverable error, terminal error in permission denied. Vsak async gumb ima pending stanje ter je zaščiten pred dvojnim klikom.

## Breakpoint QA

Obvezno ročno in avtomatizirano preverjanje pri 375, 768, 1024 in 1440 px. Dodatno preveri iOS Safari, Android Chrome, landscape, povečavo 200 %, tipkovnico in počasno/prekinitveno omrežje.

