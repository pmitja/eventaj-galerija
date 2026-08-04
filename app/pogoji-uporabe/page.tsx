import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";
import { getRequestLocale } from "@/lib/i18n/server";
import { privacyPath, termsPath } from "@/lib/i18n/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "en" ? "Terms of Use | Eventaj Gallery" : "Pogoji uporabe | Eventaj Galerija", alternates: { canonical: termsPath(locale) }, robots: { index: true, follow: true } };
}

export default async function TermsPage() {
  const en = await getRequestLocale() === "en";
  return <main className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}><Link className={styles.brand} href="/">eventaj<span>.</span></Link><Link className={styles.back} href="/">{en ? "Back to gallery" : "Nazaj na galerijo"}</Link></div></header>
    <article className={styles.article}>
      {en ? <>
      <p className={styles.eyebrow}>Legal document</p><h1>Terms of Use</h1><p className={styles.updated}>Version: 31 July 2026</p>
      <p>These terms govern the use of Eventaj Gallery by event organisers and guests who upload photos and videos through a link or QR code.</p>
      <h2>1. Service and package</h2><p>The basic package applies to one event and includes unlimited guests, photos and up to 20 videos. The “Unlimited videos” add-on costs €15 and is subject to fair use of up to 1,000 videos per event. A video may be no longer than 60 seconds and no larger than 500 MB. Video appears only in the gallery and is not included in the live display.</p>
      <h2>2. Content rights</h2><p>Uploaders confirm that they created the content or have permission to share it, and that it does not infringe copyright, privacy or other rights. Illegal, violent, hateful, sexually explicit, malicious or technically harmful content is prohibited.</p>
      <h2>3. Gallery publication</h2><p>During upload, the uploader chooses whether content may appear in the shared gallery. The organiser may hide or remove content. Access through an unpredictable link is not the same as public publication, but the link may still be shared with others.</p>
      <h2>4. Retention and deletion</h2><p>Content from a new event is generally stored for 180 days after the event ends and is then removed from active storage. The organiser must download wanted files in time. We may remove content earlier following a valid request, a breach of these terms, a security risk or a legal obligation.</p>
      <h2>5. Availability</h2><p>We provide the service with reasonable care but do not guarantee uninterrupted operation, successful uploads from every device or permanent content availability. Video processing may take several minutes. Organisers should also keep important files elsewhere.</p>
      <h2>6. Moderation and abuse prevention</h2><p>We use short-lived upload sessions, file type, size, duration and count limits, and may apply additional traffic limits. We may reject suspicious or prohibited content and retain security records where required by law.</p>
      <h2>7. Contact</h2><p>For questions, content reports or deletion requests, email <a href="mailto:info@eventaj.si">info@eventaj.si</a>. Details about personal data processing are in the <Link href={privacyPath("en")}>Privacy Policy</Link>.</p>
      </> : <>
      <p className={styles.eyebrow}>Pravni dokument</p><h1>Pogoji uporabe</h1><p className={styles.updated}>Različica: 31. julij 2026</p>
      <p>Ti pogoji urejajo uporabo Eventaj Galerije za organizatorje dogodkov in goste, ki prek povezave ali QR kode nalagajo fotografije in videe.</p>
      <h2>1. Storitev in paket</h2><p>Osnovni paket velja za en dogodek, vključuje neomejeno število gostov, fotografije ter do 20 videov. Dodatek »Neomejeno videov« stane 15 € in je predmet poštene uporabe do 1.000 videov na dogodek. Posamezen video je lahko dolg največ 60 sekund in velik največ 500 MB. Video je prikazan samo v galeriji in se ne vključuje v projekcijo.</p>
      <h2>2. Pravice do vsebine</h2><p>Naložnik potrjuje, da je avtor vsebine ali ima dovoljenje za njeno deljenje ter da vsebina ne krši avtorskih, osebnostnih ali drugih pravic. Prepovedane so nezakonite, nasilne, sovražne, spolno eksplicitne, zlonamerne ali tehnično škodljive vsebine.</p>
      <h2>3. Objava v galeriji</h2><p>Naložnik pri nalaganju izbere, ali se sme vsebina pokazati v skupni galeriji. Organizator lahko vsebino skrije ali odstrani. Dostop prek nepredvidljive povezave ni enak javni objavi, vendar povezavo lahko prejmejo tudi druge osebe.</p>
      <h2>4. Hramba in izbris</h2><p>Vsebina novega dogodka se praviloma hrani 180 dni po koncu dogodka in se nato izbriše iz aktivne hrambe. Organizator mora želene datoteke pravočasno prenesti. Vsebino lahko odstranimo prej zaradi zahtevka upravičene osebe, kršitve pogojev, varnostnega tveganja ali zakonske obveznosti.</p>
      <h2>5. Razpoložljivost</h2><p>Storitev zagotavljamo s skrbnostjo, vendar ne jamčimo neprekinjenega delovanja, uspešnega nalaganja iz vsake naprave ali trajne razpoložljivosti vsebine. Pri videu lahko obdelava traja nekaj minut. Organizator naj pomembne datoteke hrani tudi drugje.</p>
      <h2>6. Moderacija in preprečevanje zlorab</h2><p>Uporabljamo kratkotrajne upload seje, omejitve vrste, velikosti, trajanja in števila datotek ter lahko uvedemo dodatno omejevanje prometa. Sumljive ali prepovedane vsebine lahko zavrnemo in v obsegu, ki ga zahteva zakon, ohranimo varnostne zapise.</p>
      <h2>7. Kontakt</h2><p>Za vprašanja, prijavo vsebine ali zahtevek za izbris pišite na <a href="mailto:info@eventaj.si">info@eventaj.si</a>. Podrobnosti o obdelavi osebnih podatkov so v <Link href={privacyPath("sl")}>Politiki zasebnosti</Link>.</p>
      </>}
    </article>
  </main>;
}
