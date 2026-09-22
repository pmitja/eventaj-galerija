# ADR-020: Celoten seznam javne galerije

- Status: accepted
- Datum: 2026-09-21

## Kontekst

Galerija periodično zamenja svoj seznam z odgovorom `/events/{slug}/media`.
Poizvedba je vrnila samo 100 medijev brez kazalca za nadaljevanje. Zato je bilo
pri dogodku z 234 ustreznimi fotografijami dostopnih le prvih 100.

## Odločitev

- Ta endpoint vrne celoten seznam metapodatkov javno dovoljenih medijev dogodka
  brez omejitve skupnega števila. To je izjema od splošne API konvencije o
  cursor pagination in ohrani obstoječo pogodbo periodičnega osveževanja.
- Obstoječi filtri `ready`, vidnost, soglasje in efektivna kakovost ostanejo.
- Vrstni red je padajoči čas nalaganja, nato javni identifikator za enake čase.
- Odjemalec še naprej postopoma prikazuje slike; API prenaša le metapodatke.

## Posledice

Velikost odgovora raste s številom dovoljenih medijev. Če bo potrebna strežniška
paginacija, mora sprememba hkrati vključiti odjemalca in osveževanje, da nobena
fotografija ne postane nedostopna zaradi omejitve posamezne strani.
Sprememba ne potrebuje migracije in ohrani obliko API odgovora.
