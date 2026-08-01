import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = { title: "Pogoji uporabe | Eventaj Galerija", robots: { index: true, follow: true } };

export default function TermsPage() {
  return <main className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}><Link className={styles.brand} href="/">eventaj<span>.</span></Link><Link className={styles.back} href="/">Nazaj na galerijo</Link></div></header>
    <article className={styles.article}>
      <p className={styles.eyebrow}>Pravni dokument</p><h1>Pogoji uporabe</h1><p className={styles.updated}>Različica: 31. julij 2026</p>
      <p>Ti pogoji urejajo uporabo Eventaj Galerije za organizatorje dogodkov in goste, ki prek povezave ali QR kode nalagajo fotografije in videe.</p>
      <h2>1. Storitev in paket</h2><p>Osnovni paket velja za en dogodek, vključuje neomejeno število gostov, fotografije ter do 20 videov. Dodatek »Neomejeno videov« stane 15 € in je predmet poštene uporabe do 1.000 videov na dogodek. Posamezen video je lahko dolg največ 60 sekund in velik največ 500 MB. Video je prikazan samo v galeriji in se ne vključuje v projekcijo.</p>
      <h2>2. Pravice do vsebine</h2><p>Naložnik potrjuje, da je avtor vsebine ali ima dovoljenje za njeno deljenje ter da vsebina ne krši avtorskih, osebnostnih ali drugih pravic. Prepovedane so nezakonite, nasilne, sovražne, spolno eksplicitne, zlonamerne ali tehnično škodljive vsebine.</p>
      <h2>3. Objava v galeriji</h2><p>Naložnik pri nalaganju izbere, ali se sme vsebina pokazati v skupni galeriji. Organizator lahko vsebino skrije ali odstrani. Dostop prek nepredvidljive povezave ni enak javni objavi, vendar povezavo lahko prejmejo tudi druge osebe.</p>
      <h2>4. Hramba in izbris</h2><p>Vsebina novega dogodka se praviloma hrani 180 dni po koncu dogodka in se nato izbriše iz aktivne hrambe. Organizator mora želene datoteke pravočasno prenesti. Vsebino lahko odstranimo prej zaradi zahtevka upravičene osebe, kršitve pogojev, varnostnega tveganja ali zakonske obveznosti.</p>
      <h2>5. Razpoložljivost</h2><p>Storitev zagotavljamo s skrbnostjo, vendar ne jamčimo neprekinjenega delovanja, uspešnega nalaganja iz vsake naprave ali trajne razpoložljivosti vsebine. Pri videu lahko obdelava traja nekaj minut. Organizator naj pomembne datoteke hrani tudi drugje.</p>
      <h2>6. Moderacija in preprečevanje zlorab</h2><p>Uporabljamo kratkotrajne upload seje, omejitve vrste, velikosti, trajanja in števila datotek ter lahko uvedemo dodatno omejevanje prometa. Sumljive ali prepovedane vsebine lahko zavrnemo in v obsegu, ki ga zahteva zakon, ohranimo varnostne zapise.</p>
      <h2>7. Kontakt</h2><p>Za vprašanja, prijavo vsebine ali zahtevek za izbris pišite na <a href="mailto:info@eventaj.si">info@eventaj.si</a>. Podrobnosti o obdelavi osebnih podatkov so v <Link href="/zasebnost">Politiki zasebnosti</Link>.</p>
    </article>
  </main>;
}
