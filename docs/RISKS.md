# Register tveganj

Ocena uporablja verjetnost in vpliv `nizek/srednji/visok`. Register se pregleda ob vsakem faznem mejniku.

| Tveganje | Verjetnost | Vpliv | Zmanjšanje tveganja | Signal/owner |
| --- | --- | --- | --- | --- |
| Slabo mobilno omrežje povzroči opuščene uploade | visoka | visok | multipart resume, retry, omejena konkurenca, offline stanje, metrike po delu | upload success rate / engineering |
| Nenaden burst več sto datotek preobremeni worker | visoka | visok | queue backpressure, autoscaling, limiti videa, backlog alert | queue age/depth / ops |
| Napačna tenant poizvedba razkrije drug dogodek | srednja | visok | organization scope v repositoryjih, integration testi, deny default | security tests / engineering |
| Javna povezava ali signed URL uide izven dogodka | srednja | visok | kratka veljavnost, unlisted/noindex, preklic sej, zasebni originali | access anomaly / security |
| Strošek storage/egress/video procesiranja preseže ceno paketa | srednja | visok | kvote, web variante/CDN, merjenje stroška na event, video limiti | margin per event / product |
| HEIC/MOV razlike med telefoni lomijo processing | visoka | srednji | real-device corpus, magic bytes, podprta matrika, fallback | failure by codec/device / media owner |
| Nejasna pravna podlaga za objavo in obraze | srednja | visok | legal review, verzionirana soglasja, face privzeto off, DPIA | legal gate / product owner |
| Brisanje ne zajame derivatov, ZIP ali backupov | srednja | visok | data inventory, idempotent retention job, deletion audit, restore politika | failed retention jobs / DPO+ops |
| QR/NFC attribution zaradi privacy omejitev ni natančen | srednja | srednji | event-scoped identifikator, first-party seja, agregati in jasna definicija metrike | unattributed rate / analytics |
| Serverless in long-running potrebe se pomešajo | srednja | visok | ločen worker, jasni job handoffi, staging load test | web timeout/job age / architecture |
| AI rezultati razočarajo ali so predragi | srednja | srednji | provider adapter, model version, ročni override, omejen pilot | cost/acceptance rate / AI owner |
| Preveč funkcij odloži zanesljiv Basic MVP | visoka | visok | fazni gate, prvi vertikalni rez, brez AI/slideshow v 1A | roadmap burnup / product owner |

## Pogoji za produkcijski zagon Basic

- P0 odprta vprašanja so zaključena in podpisana s strani lastnika produkta.
- Uspešno izveden real-device upload test na iOS Safari in Android Chrome.
- Dokazan restore baze ter preverjen retention/delete test v stagingu.
- Tenant isolation, authorization in upload abuse testi so zeleni.
- On-call oseba zna ustaviti uploade, ponoviti job in preklicati dostop.
- Stroškovna meja na dogodek je izmerjena z realističnim testnim corpusom.

