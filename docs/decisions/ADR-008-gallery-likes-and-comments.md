# ADR-008: Lokalni všečki in dogodkovni komentarji fotografij

- Status: accepted
- Datum: 2026-07-18

## Kontekst

Gost želi fotografijo označiti kot priljubljeno brez računa in se o njej pogovarjati z drugimi gosti. Všeček je osebna organizacijska preferenca, komentar pa skupna vsebina, ki potrebuje strežniško hrambo, validacijo in dogodkovno omejitev.

## Odločitev

- Všečki se hranijo kot verzioniran seznam stabilnih javnih identifikatorjev fotografij v `localStorage`, ločeno za vsak dogodek. Ne pošiljajo se strežniku in ne ustvarjajo javnega števca.
- Komentarji se hranijo v D1 in so vezani na `event_id`, `media_id` in `guest_id`. Prikazno ime se ob branju pridobi iz `event_guests`, zato sprememba imena velja tudi za stare komentarje.
- Javni API dovoli branje in dodajanje komentarjev samo na trenutno javno, AI-sprejete fotografije istega dogodka.
- Komentar ima največ 500 znakov. Strežnik odstrani odvečne prazne vrstice in za posameznega gosta dovoli največ pet komentarjev na minuto.
- Novi komentarji so takoj vidni. Stanje `hidden` omogoča naknadno moderacijo brez fizičnega izbrisa; izbris dogodka, fotografije ali gosta komentar fizično izbriše.
- Komentarje je mogoče izključiti za posamezen dogodek z nastavitvijo `events.comments_enabled`. Privzeta vrednost je vključeno. Ko so izključeni, javni API zavrne branje in dodajanje komentarjev, gostujoči UI pa ne prikaže dejanja za komentarje. Obstoječi komentarji ostanejo shranjeni in se znova prikažejo, če administrator komentarje pozneje vključi.
- Mobilni UX uporablja spodnji panel z vedno vidnim vnosom. Na večjih zaslonih je isti panel desno od fotografije. Všeček in odpiranje komentarjev ostaneta neposredno ob fotografiji.
- Zaščiteni liveshow v polling posnetku prejme največ 20 vidnih komentarjev iz zadnjih dveh minut. Vključi jih samo, ko so komentarji dogodka omogočeni, gost dovoli prikaz na live zaslonu in je komentirana fotografija odobrena za slideshow ter prestane publication gate. Odjemalec nove komentarje prikaže kot največ tri kratkotrajne oblačke na desni strani.

## Varnost in zasebnost

- `guest_id` je psevdonimen ključ nizkega tveganja in ni prijavna seja. Vsaka mutacija preveri pripadnost gosta dogodku.
- Besedilo se validira na deljeni Zod shemi in React ga prikaže kot besedilo, ne kot HTML.
- Javni odgovori komentarjev uporabljajo `no-store`; API ne razkriva notranjih identifikatorjev dogodka ali medija.
- Liveshow ne razkrije notranjih identifikatorjev in ne prikaže komentarja gosta, ki je izključil `show_on_live_screen`.

## Povratna združljivost

Migraciji sta samo razširitveni in ne spreminjata obstoječih medijev ali gostov. `comments_enabled` ima privzeto vrednost `1`, zato obstoječi dogodki ohranijo komentarje. Brskalniki brez zapisa všečkov začnejo s praznim seznamom. Odjemalci pred to spremembo še naprej uporabljajo obstoječe gallery endpoint-e.
