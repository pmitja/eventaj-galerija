# ADR-009: Zanesljiva vrsta za obdelavo medijev

- Status: accepted
- Datum: 2026-07-18

## Kontekst

HTTP zaključek uploada je obdelavo slike izvajal prek `waitUntil`. Ob več
sočasnih fotografijah je spletni Worker presegel CPU omejitev, odgovor `202` pa
je bil že poslan. Ker prekinjena naloga ni mogla zapisati napake, je medij ostal
trajno v stanju `processing`.

Več dogodkov lahko poteka istočasno, zato omejitev sočasnosti samo v enem
brskalniku ne omeji skupne obremenitve sistema.

## Odločitev

- HTTP zaključek preveri R2 objekt, atomarno ustvari idempotenten processing job
  in v Cloudflare Queue pošlje samo identifikatorje.
- Ločen media-processing Worker obdeluje po eno sliko na invocation in ima
  globalni `max_concurrency = 2`, ne glede na število dogodkov ali gostov.
- Queue uporablja at-least-once dostavo, največ pet poskusov z zamikom in
  dead-letter vrsto. Handler je idempotenten; že pripravljen ali zavrnjen medij
  samo uskladi s processing jobom.
- Scheduled recovery ponovno odda osirotele `queued` jobe in predolgo trajajoče
  `processing` jobe. Po izčrpanih poskusih je napaka vidna v D1.
- Posamezen odjemalec hkrati prenaša največ tri datoteke. To ščiti mobilno
  povezavo in R2, ni pa primarni mehanizem za globalno omejevanje.

## Posledice

- Spletni Worker ostane hiter in ne izvaja transformacij po odgovoru.
- Kratki prometni vrhovi povečajo globino vrste, ne CPU obremenitve spletnega
  Workerja.
- Nova deploy enota, glavna vrsta in DLQ zahtevajo monitoring backlog metrike.
- Produkcijska 30-sekundna CPU rezerva media-processing Workerja zahteva Workers
  Paid; R2 Paid je ločena naročnina in te rezerve ne zagotavlja.
- Fotografija se lahko v adminu nekaj časa kaže kot »V obdelavi«, vendar se
  prekinjena naloga varno ponovi in ne ostane brez operativnega zapisa.
