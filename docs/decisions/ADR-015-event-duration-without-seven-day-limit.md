# ADR-015: Trajanje dogodka brez sedemdnevne omejitve

## Status

Sprejeto

## Kontekst

Nakupni in administratorski tok sta trajanje dogodka omejevala na sedem dni.
To je preprečevalo uporabo iste galerije za daljše večdnevne dogodke, čeprav se
hramba že računa od dejanskega konca dogodka.

## Odločitev

Dogodek nima vnaprej določene največje dolžine. Konec mora biti strogo po
začetku, končni datum pa ostane spodnja meja date pickerja vezan na začetni
datum. Hramba, zapiranje uploadov in dostava ZIP-a se še naprej računajo od
izbranega konca dogodka.

## Posledice

- checkout in administratorski API sprejmeta tudi dogodke, daljše od sedem dni;
- uporabniški vmesnik ne prikazuje več sedemdnevne omejitve;
- obstoječi dogodki in podatkovna shema ostanejo povratno združljivi, zato
  migracija ni potrebna.
