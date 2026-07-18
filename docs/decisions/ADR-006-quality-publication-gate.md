# ADR-006: Tehnična kakovost kot javni publication gate

## Status

Sprejeto 2026-07-18.

## Kontekst

Prvi rez tehnične analize je fotografije samo označil. Javna galerija in privzeto odobren slideshow sta zato še naprej prikazovala tudi kategorije `duplicate`, `blurry` in `low_quality`. To ne izpolni namena samodejnega izbora kakovostnih fotografij.

## Odločitev

- Javna galerija in slideshow dostava privzeto pokažeta samo efektivni kategoriji `best` in `good`.
- `duplicate`, `blurry`, `low_quality` in še neanalizirani mediji ostanejo dostopni administratorju, javno pa so skriti.
- Nobena datoteka se zaradi kakovosti ne izbriše ali spremeni v tehnično zavrnjeno.
- Ročni `quality_override` ima prednost pred samodejno kategorijo. Administrator lahko fotografijo objavi tako, da jo ročno označi kot `best` ali `good`.
- Obstoječi dogodki morajo pred javnim prikazom izvesti quality backfill.

## Posledice

Publication gate je fail-closed: nova ali starejša fotografija brez uspešne analize ni javna. S tem se lahko javna galerija začasno izprazni, če quality worker ni dosegljiv; napaka je vidna v adminu in jo je mogoče ponoviti. Standardni ZIP izvoz ostane nespremenjen, dokler ne bo dodan ločen AI-only izvoz.
