# Glavni uporabniški tokovi

## 1. Gost naloži fotografije

**Happy path**

1. Gost skenira QR, uporabi NFC ali odpre neposredno povezavo.
2. Stabilna točka po potrebi zabeleži anonimen obisk in ga preusmeri na dogodek.
3. Če za dogodek še nima lokalne identitete, izbere ime/vzdevek ali nadaljuje anonimno; ne ustvari računa.
4. Na hero območju izbere »Dodaj fotografije«.
5. Sistemski izbirnik odpre galerijo naprave z večkratnim izborom.
6. Gost odstrani neželene predoglede in potrdi objavo.
7. Aplikacija ustvari na lokalni `guest_id` vezano sejo, pridobi podpisane URL-je in nalaga datoteke vzporedno z omejeno konkurenco.
8. Vsaka datoteka prikazuje napredek; neuspešna ima jasen »Poskusi znova«.
9. Po zaključenem prenosu se prikaže: »Hvala! Tvoje fotografije so bile uspešno dodane.«
10. Procesiranje teče v ozadju; galerija, leaderboard in live obvestila štejejo samo efektivni kategoriji kakovosti `best` in `good`.

**Robni primeri**

- brez povezave pred začetkom: ohrani izbor, pokaži offline stanje in samodejni retry ob vrnitvi;
- prekinitev med uploadom: nadaljuj manjkajoče multipart dele;
- potek podpisanega URL-ja: tiho pridobi nov podpis za nedokončane dele;
- neveljaven tip ali prevelika datoteka: zavrni pred uploadom in znova na strežniku;
- dogodek se med uploadom konča: že podpisane aktivne seje imajo kratko grace obdobje;
- delni uspeh: zahvala navede uspešne datoteke, neuspešne ostanejo za retry.

## 2. Administrator pripravi dogodek

1. Prijava in izbor organizacije.
2. »Nov dogodek«: osnovni podatki, časovni pas, paket, zasebnost in moderacija.
3. Sistem shrani `draft` in izračuna entitlement snapshot.
4. Admin doda branding, naslovnico in pozdrav.
5. Ustvari access pointe (vhod, mize, bar, fotobooth).
6. Dodeli NFC stojala v izbranem časovnem intervalu.
7. Predogleda javno mobilno stran in testira QR.
8. Checklist preveri obvezne nastavitve; admin prestavi dogodek v `prepared` ali `active`.

Konflikt dodelitve NFC stojala mora biti blokiran na ravni baze in jasno prikazan v UI.

## 3. Moderator odobri vsebino

1. Odpre čakalno vrsto dogodka.
2. Filtrira `pending`, slike/video in vir.
3. V mreži ali lightboxu izbere eno ali več datotek.
4. Izvede ločeno akcijo za galerijo oziroma slideshow.
5. Optimistični UI se ob napaki povrne, dejanje pa ostane sledljivo v audit logu.

Tipke za hitro moderacijo so dovoljene, vendar morajo imeti vidne oznake in ne smejo nadomestiti dostopnih gumbov.

## 4. NFC preusmeritev

1. Gost odpre trajni `/t/{standCode}`.
2. Sistem poišče trenutno veljavno dodelitev po času.
3. Zabeleži access point, čas in privacy-safe anonimen obisk.
4. Preusmeri na dogodek z attribution cookiejem/tokenom.
5. Če ni dodelitve, prikaže brandirano varno stran »Stojalo trenutno ni aktivno«, ne administrativnih podatkov.

## 5. Potek hrambe

1. Sistem vnaprej ustvari opozorilo organizatorju.
2. Ob `gallery_expires_at` onemogoči javni dostop in nove uploade.
3. Po konfiguriranem grace obdobju retention job izbriše variante, originale, izvoze in občutljive derivate.
4. Minimalen audit zapis o izvedenem izbrisu ostane brez izbrisanih osebnih podatkov.
5. Neuspeh sproži alarm in varen retry.

## 6. Face search (prvi rez faze 4 implementiran)

1. Gost vidi razlago namena, časa hrambe in ločeno soglasje.
2. Selfie naloži v začasni zasebni prostor.
3. Sistem asinhrono počaka, da so upravičene fotografije dogodka indeksirane,
   nato pri regionalnem ponudniku poišče ujemanja samo znotraj collection tega dogodka.
4. Vrne samo fotografije, ki so že varne za javno galerijo; similarity ni dokaz identitete.
5. Selfie se fizično izbriše po uspehu, terminalni napaki ali najpozneje po 15 minutah.
6. Gost lahko umakne soglasje; sistem izbriše selfie in rezultate ter zapiše audit brez biometričnih podatkov.

## 7. Projekcija dogodka

1. Administrator v galeriji izbere dogodek in ustvari projekcijsko povezavo.
2. Sistem prikaže skrivni URL samo ob ustvarjanju ali rotaciji; v bazi ostane hash.
3. Administrator odpre povezavo na projektorju in po želji vključi celozaslonski način.
4. Projekcija vsakih pet sekund pridobi avtoriziran posnetek odobrenih fotografij in jih samodejno menja.
5. Playlist vsebuje samo efektivni kategoriji kakovosti `best` in `good`; neanalizirane in slabše fotografije ostanejo v adminu.
6. Administrator lahko posamezno fotografijo neodvisno skrije s projekcije.
7. Ob sumu razkritja ustvari novo povezavo; stara pri naslednji zahtevi preneha delovati.
8. Projekcija po sprejetem uploadu prikaže kratko združeno obvestilo, dosežke in nato AI-filtriran top leaderboard; overlay ne ustavi predvajanja.

## 8. Gost všečka ali komentira fotografijo

1. Gost odpre fotografijo v celozaslonskem pregledu.
2. Všeček lahko vključi neposredno v mreži ali pregledu; izbira se lokalno shrani samo za ta dogodek in nima javnega števca.
3. Kartica fotografije prikaže komentarno ikono s številom vidnih komentarjev; klik odpre fotografijo neposredno s komentarji.
4. Gumb »Komentarji« na telefonu odpre spodnji panel, na večjem zaslonu pa desni panel ob fotografiji.
5. Panel prikaže loading, prazno, error/retry ali seznam komentarjev ter vedno dostopen vnos.
6. Ob objavi strežnik preveri `guest_id`, dogodek, javno stanje fotografije, AI-kakovost in omejitev hitrosti.
7. Komentar je prikazan z aktualnim prikaznim imenom gosta; sprememba imena velja tudi za prejšnje komentarje.
8. Zaprtje komentarjev ohrani odprto fotografijo, `Escape` pa najprej zapre komentarje in šele nato lightbox.
9. Če administrator za dogodek izključi komentarje, gost gumba ne vidi, API pa zavrne branje in objavo; obstoječi komentarji ostanejo shranjeni za morebitno ponovno vključitev.
9. Liveshow sveže komentarje privoljenih gostov prikaže v največ treh oblačkih, ki se na desni strani umirjeno dvignejo in nato izginejo; pri `prefers-reduced-motion` se samo prikažejo ter zbledijo.
