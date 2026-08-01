import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = { title: "Zasebnost | Eventaj Galerija", robots: { index: true, follow: true } };

export default function PrivacyPage() {
  return <main className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}><Link className={styles.brand} href="/">eventaj<span>.</span></Link><Link className={styles.back} href="/">Nazaj na galerijo</Link></div></header>
    <article className={styles.article}>
      <p className={styles.eyebrow}>Pravni dokument</p><h1>Politika zasebnosti</h1><p className={styles.updated}>Različica: 31. julij 2026</p>
      <p>Ta politika pojasnjuje obdelavo podatkov v Eventaj Galeriji. Za vprašanja ali uveljavljanje pravic pišite na <a href="mailto:info@eventaj.si">info@eventaj.si</a>.</p>
      <h2>1. Katere podatke obdelujemo</h2><ul><li>podatke organizatorja in naročila, kot so e-pošta, podatki o dogodku in plačilni status;</li><li>fotografije, videe, imena datotek, tehnične metapodatke in izbrano dovoljenje za objavo;</li><li>tehnične varnostne podatke, kot so čas zahteve, omejeni identifikatorji seje in podatki, potrebni za preprečevanje zlorab;</li><li>če je funkcija posebej vključena in je podano soglasje, selfie ter rezultate iskanja po obrazu.</li></ul>
      <h2>2. Namen in pravna podlaga</h2><p>Podatke obdelujemo za izvedbo naročene storitve, varno nalaganje in prikaz vsebine, podporo uporabnikom, preprečevanje zlorab ter izpolnjevanje zakonskih obveznosti. Dovoljenje naložnika določa, ali se vsebina sme prikazati v galeriji. Iskanje po obrazu se izvaja le na podlagi ločenega, izrecnega soglasja.</p>
      <h2>3. Ponudniki obdelave</h2><p>Za gostovanje, zbirko podatkov, shrambo slik in obdelavo videov uporabljamo Cloudflare. Plačila obdeluje Stripe; Eventaj Galerija ne hrani celotnih podatkov plačilne kartice. Posamezne dodatne funkcije lahko uporabljajo dokumentirane zunanje ponudnike pod pogodbenimi in varnostnimi omejitvami.</p>
      <h2>4. Hramba</h2><p>Mediji novega dogodka se praviloma hranijo 180 dni po koncu dogodka. Nato izbrišemo slike iz objektne shrambe, videe iz Cloudflare Stream in povezane zapise. Plačilni, računovodski, varnostni ali revizijski zapisi se lahko hranijo dlje, kadar to zahteva zakon ali upravičen interes. Začasni selfieji in biometrične reference imajo krajše, posebej določene roke.</p>
      <h2>5. Kdo vidi vsebino</h2><p>Galerija je dostopna osebam z njeno povezavo. Organizator in pooblaščeno osebje lahko upravljata vsebino. Video uporablja podpisano predvajanje; videi se ne prikazujejo v projekciji. Povezave ne objavljajte javno, če tega ne želite.</p>
      <h2>6. Vaše pravice</h2><p>Glede na okoliščine lahko zahtevate dostop, popravek, izbris, omejitev ali ugovor obdelavi ter prenosljivost podatkov. Soglasje lahko prekličete brez vpliva na zakonitost pretekle obdelave. Zahtevek pošljite na <a href="mailto:info@eventaj.si">info@eventaj.si</a>; za hitrejšo obravnavo navedite dogodek in datoteko.</p>
      <h2>7. Varnost in spremembe</h2><p>Uporabljamo nepredvidljive javne identifikatorje, kratkotrajne upload seje, neposredne podpise za nalaganje, omejevanje zahtevkov ter ločevanje podatkov med organizacijami. Politiko lahko posodobimo; na strani vedno objavimo datum veljavne različice.</p>
      <p className={styles.notice}>Če ste prepričani, da je bila vaša fotografija ali video objavljen brez dovoljenja, nam pišite. Vsebino lahko med preverjanjem takoj skrijemo.</p>
    </article>
  </main>;
}
