import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";
import { getRequestLocale } from "@/lib/i18n/server";
import { privacyPath } from "@/lib/i18n/routes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "en" ? "Privacy | Eventaj Gallery" : "Zasebnost | Eventaj Galerija", alternates: { canonical: privacyPath(locale) }, robots: { index: true, follow: true } };
}

export default async function PrivacyPage() {
  const en = await getRequestLocale() === "en";
  return <main className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}><Link className={styles.brand} href="/">eventaj<span>.</span></Link><Link className={styles.back} href="/">{en ? "Back to gallery" : "Nazaj na galerijo"}</Link></div></header>
    <article className={styles.article}>
      {en ? <>
      <p className={styles.eyebrow}>Legal document</p><h1>Privacy Policy</h1><p className={styles.updated}>Version: 31 July 2026</p>
      <p>This policy explains how data is processed in Eventaj Gallery. For questions or to exercise your rights, email <a href="mailto:info@eventaj.si">info@eventaj.si</a>.</p>
      <h2>1. Data we process</h2><ul><li>organiser and order details, such as email, event information and payment status;</li><li>photos, videos, filenames, technical metadata and the chosen publication permission;</li><li>technical security data, such as request time, limited session identifiers and information needed to prevent abuse;</li><li>where the feature is expressly enabled and consent is given, a selfie and face-search results.</li></ul>
      <h2>2. Purpose and legal basis</h2><p>We process data to provide the ordered service, upload and display content securely, support users, prevent abuse and meet legal obligations. The uploader&apos;s permission determines whether content may appear in the gallery. Face search is performed only with separate, explicit consent.</p>
      <h2>3. Processors</h2><p>We use Cloudflare for hosting, database, image storage and video processing. Stripe processes payments; Eventaj Gallery does not store full card details. Specific optional features may use documented external providers under contractual and security restrictions.</p>
      <h2>4. Retention</h2><p>Media from a new event is generally stored for 180 days after the event ends. We then delete images from object storage, videos from Cloudflare Stream and related records. Payment, accounting, security or audit records may be kept longer where required by law or legitimate interest. Temporary selfies and biometric references have shorter, specifically defined periods.</p>
      <h2>5. Who can see the content</h2><p>The gallery is available to people who have its link. The organiser and authorised staff can manage content. Video uses signed playback and does not appear in the live display. Do not publish the link publicly unless you intend to.</p>
      <h2>6. Your rights</h2><p>Depending on the circumstances, you may request access, correction, deletion, restriction, objection or data portability. You may withdraw consent without affecting the lawfulness of earlier processing. Send requests to <a href="mailto:info@eventaj.si">info@eventaj.si</a> and include the event and file for faster handling.</p>
      <h2>7. Security and changes</h2><p>We use unpredictable public identifiers, short-lived upload sessions, direct upload signatures, request limiting and separation between organisations. We may update this policy; the current version date is always published here.</p>
      <p className={styles.notice}>If you believe your photo or video was published without permission, contact us. We can hide the content immediately while we review it.</p>
      </> : <>
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
      </>}
    </article>
  </main>;
}
