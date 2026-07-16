# ADR-002: Neposreden upload v object storage

- Status: accepted for planning
- Datum: 2026-07-15

## Kontekst

Gostje nalagajo več velikih datotek prek mobilnih omrežij. Prenos skozi Next.js bi povečal strošek, porabo pomnilnika in tveganje timeouta ter otežil nadaljevanje.

## Odločitev

Odjemalec pridobi kratkotrajne podpisane multipart URL-je in datoteke pošlje neposredno v zasebno S3-kompatibilno hrambo. API upravlja sejo, omejitve in zaključek; worker preveri dejansko vsebino ter ustvari varne variante.

Za prvi slikovni rez na R2 se zaradi omejitve vhodne slike na 20 MB uporablja en podpisan `PUT`. Multipart ostaja odločitev za video in večje datoteke, ko se ta tok uvede. S tem se ohrani neposreden prenos mimo Next.js procesa brez nepotrebne multipart kompleksnosti za majhne slike.

## Posledice

- Boljša zanesljivost in horizontalna skalabilnost uploada.
- Potrebni so CORS, cleanup zapuščenih multipart uploadov in natančna state machine.
- Klient ne sme sam razglasiti datoteke za varno ali `ready`.
- Storage ponudnik mora podpirati multipart, signed operations in lifecycle pravila.
