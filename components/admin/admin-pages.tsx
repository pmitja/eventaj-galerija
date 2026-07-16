import Link from "next/link";
import Image from "next/image";
import { chartData } from "./data";
import { Icon } from "./icon";
import styles from "./admin.module.css";
import { NewEventForm } from "./new-event-form";
import { listEvents } from "@/lib/repositories/events";
import { listAdminEventSummaries, listAdminMedia } from "@/lib/repositories/admin-dashboard";
import { listAccessPoints } from "@/lib/repositories/access-points";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { AccessPointsPanel } from "./access-points-panel";
import { presentEventStatus, formatRelativeTime } from "@/lib/domain/admin-dashboard";
import { adminGalleryQuerySchema } from "@/lib/validation/admin";

const mediaItems = [
  ["IMG_4821.jpg", "rose", "pred 4 min"], ["IMG_4818.jpg", "violet", "pred 7 min"],
  ["IMG_4812.jpg", "amber", "pred 9 min"], ["IMG_4806.jpg", "blue", "pred 12 min"],
  ["IMG_4798.jpg", "green", "pred 15 min"], ["IMG_4784.jpg", "rose", "pred 18 min"],
  ["IMG_4771.jpg", "violet", "pred 21 min"], ["IMG_4765.jpg", "amber", "pred 24 min"],
] as const;

const customers = [
  ["Ana Kovač", "ana.kovac@email.si", "Poroka Ane & Marka", "18. jul. 2026", "Aktivna"],
  ["Lumen d.o.o.", "marketing@lumen.si", "50 let podjetja Lumen", "3. jul. 2026", "Zaključena"],
  ["Tina Zupan", "tina@studiot.si", "Poletni piknik ekipe", "24. jul. 2026", "Osnutek"],
  ["Gregor Vidmar", "gregor@vidmar.si", "Vidmar 40", "12. jun. 2026", "Zaključena"],
] as const;

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <section className={styles.subpageHeading}><div><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</section>;
}

function FilterBar({ gallery = false }: { gallery?: boolean }) {
  return (
    <div className={styles.filterBar} aria-label="Filtri">
      <label className={styles.filterSearch}><Icon name="search" size={17} /><span className={styles.srOnly}>Išči</span><input type="search" placeholder={gallery ? "Išči po imenu datoteke ..." : "Išči po dogodkih ..."} /></label>
      <label className={styles.selectControl}><span className={styles.srOnly}>Status</span><select defaultValue="all"><option value="all">Vsi statusi</option><option>Aktivni</option><option>Pripravljeni</option><option>Osnutki</option><option>Zaključeni</option></select></label>
      <label className={styles.selectControl}><span className={styles.srOnly}>Časovno obdobje</span><select defaultValue="recent"><option value="recent">Najnovejši</option><option>Ta mesec</option><option>Prejšnji mesec</option></select></label>
      <button type="button" className={styles.iconControl} aria-label="Več filtrov"><Icon name="settings" size={18} /></button>
    </div>
  );
}

export async function EventsPage() {
  const storedEvents = await listAdminEventSummaries();
  const displayedEvents = storedEvents.map((event, index) => ({
    id: event.id,
    name: event.name,
    location: event.location ?? "Brez lokacije",
    date: new Intl.DateTimeFormat("sl-SI", { dateStyle: "medium", timeZone: event.timezone }).format(new Date(event.starts_at)),
    status: presentEventStatus(event.status).label,
    statusTone: presentEventStatus(event.status).tone,
    accent: index % 3 === 0 ? "rose" : index % 3 === 1 ? "amber" : "violet",
    photos: event.photo_count,
    guests: event.visit_count,
    href: `/admin/gallery?eventId=${encodeURIComponent(event.id)}`,
  }));
  const activeCount = storedEvents.filter((event) => event.status === "active").length;
  const upcomingCount = storedEvents.filter((event) => Boolean(event.is_upcoming)).length;
  return <main className={styles.main}>
    <PageHeader eyebrow="UPRAVLJANJE" title="Dogodki" description="Ustvari, pripravi in spremljaj vse dogodke na enem mestu." action={<Link className={styles.primaryAction} href="/admin/events/new"><Icon name="plus" size={19} /> Nov dogodek</Link>} />
    <section className={styles.miniMetricGrid} aria-label="Povzetek dogodkov"><article><span className={styles.green}><Icon name="calendar" size={19} /></span><div><strong>{activeCount}</strong><small>aktivnih dogodkov</small></div></article><article><span className={styles.rose}><Icon name="clock" size={19} /></span><div><strong>{upcomingCount}</strong><small>prihajajočih dogodkov</small></div></article><article><span className={styles.violet}><Icon name="image" size={19} /></span><div><strong>{storedEvents.length}</strong><small>vseh dogodkov</small></div></article></section>
    <section className={styles.panel}><div className={styles.panelTop}><div><h2>Vsi dogodki</h2><p>{storedEvents.length} dogodkov v delovnem prostoru</p></div><div className={styles.viewSwitch}><button type="button" aria-label="Prikaz seznama" className={styles.viewActive}><Icon name="chart" size={17} /></button><button type="button" aria-label="Prikaz kartic"><Icon name="image" size={17} /></button></div></div><FilterBar />
      <div className={styles.tableWrap}><table className={`${styles.dataTable} ${styles.eventsTable}`}><thead><tr><th>Dogodek</th><th>Datum</th><th>Status</th><th>Galerija</th><th>Obiski</th><th><span className={styles.srOnly}>Dejanja</span></th></tr></thead><tbody>{displayedEvents.map((event) => <tr key={event.name}><td data-label="Dogodek"><div className={styles.tableIdentity}><span className={`${styles.miniVisual} ${styles[event.accent]}`} /><div><strong>{event.name}</strong><small>{event.location}</small></div></div></td><td data-label="Datum">{event.date}</td><td data-label="Status"><span className={`${styles.statusBadge} ${styles[event.statusTone]}`}><i />{event.status}</span></td><td data-label="Galerija">{event.photos} fotografij</td><td data-label="Obiski">{event.guests}</td><td><Link className={styles.tableAction} href={event.href} aria-label={`Odpri ${event.name}`}><Icon name="chevron" size={18} /></Link></td></tr>)}</tbody></table></div>
      {displayedEvents.length === 0 ? <p>Dogodkov še ni. Ustvari prvega z gumbom zgoraj.</p> : null}
      <div className={styles.pagination}><span>{displayedEvents.length} dogodkov</span></div>
    </section>
  </main>;
}

export function NewEventPage() {
  return <main className={styles.mainNarrow}>
    <PageHeader eyebrow="NOV DOGODEK" title="Pripravi nov dogodek" description="Najprej vnesi osnovne podatke. Dogodek bo shranjen kot osnutek." action={<Link className={styles.secondaryAction} href="/admin/events">Prekliči</Link>} />
    <NewEventForm />
  </main>;
}

export async function GalleryPage({ selectedEventId }: { selectedEventId?: string }) {
  const parsedQuery = adminGalleryQuerySchema.safeParse({ eventId: selectedEventId });
  const events = await listEvents();
  const selectedEvent = parsedQuery.success
    ? events.find((event) => event.id === parsedQuery.data.eventId)
    : undefined;
  const media = selectedEvent ? await listAdminMedia(selectedEvent.id) : [];
  const readyMedia = media.filter((item) => item.status === "ready");
  const visibleCount = readyMedia.filter((item) => item.gallery_state === "visible").length;
  const totalBytes = media.reduce((total, item) => total + item.size_bytes, 0);
  const storage = totalBytes < 1024 * 1024
    ? `${Math.round(totalBytes / 1024)} KB`
    : totalBytes < 1024 * 1024 * 1024
      ? `${(totalBytes / 1024 / 1024).toLocaleString("sl-SI", { maximumFractionDigits: 1 })} MB`
      : `${(totalBytes / 1024 / 1024 / 1024).toLocaleString("sl-SI", { maximumFractionDigits: 1 })} GB`;
  return <main className={styles.main}>
    <PageHeader eyebrow="MEDIJI" title="Galerija" description="Izberi dogodek ter preglej njegove naložene fotografije." action={selectedEvent && readyMedia.length ? <button type="button" className={styles.secondaryAction}><Icon name="upload" size={18} /> Izvozi izbor</button> : undefined} />
    {!selectedEvent ? <section className={styles.eventPicker} aria-labelledby="event-picker-title"><span className={`${styles.metricIcon} ${styles.violet}`}><Icon name="image" size={22} /></span><div><h2 id="event-picker-title">Izberi dogodek</h2><p>Fotografije se prikažejo šele, ko izbereš dogodek.</p></div>{events.length ? <form action="/admin/gallery" method="get"><label className={styles.selectControl}><span className={styles.srOnly}>Dogodek</span><select name="eventId" required defaultValue=""><option value="" disabled>Izberi dogodek …</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></label><button className={styles.primaryAction} type="submit">Prikaži galerijo</button></form> : <Link className={styles.primaryAction} href="/admin/events/new"><Icon name="plus" size={18} /> Ustvari dogodek</Link>}</section> : <>
      <section className={styles.contextBar}><div className={styles.contextEvent}><span className={`${styles.miniVisual} ${styles.violet}`} /><div><small>IZBRANI DOGODEK</small><strong>{selectedEvent.name}</strong></div></div><Link className={styles.changeEventLink} href="/admin/gallery">Zamenjaj dogodek <Icon name="chevron" size={16} /></Link><div className={styles.contextStats}><span><strong>{readyMedia.length}</strong><small>fotografij</small></span><span><strong>{storage}</strong><small>porabe</small></span></div></section>
      <section className={styles.panel}><div className={styles.panelTop}><div className={styles.tabList} role="tablist" aria-label="Vrsta medija"><button role="tab" aria-selected="true">Vse <b>{media.length}</b></button><button role="tab" aria-selected="false">Objavljeno <b>{visibleCount}</b></button><button role="tab" aria-selected="false">V obdelavi <b>{media.length - readyMedia.length}</b></button></div><div className={styles.viewSwitch}><button type="button" aria-label="Mreža" className={styles.viewActive}><Icon name="image" size={17} /></button><button type="button" aria-label="Seznam"><Icon name="chart" size={17} /></button></div></div><FilterBar gallery />
        {media.length ? <div className={styles.mediaGrid}>{media.map((item) => <article className={styles.mediaCard} key={item.id}><div className={`${styles.mediaVisual} ${styles.violet}`}>{item.status === "ready" ? <Image src={`/api/v1/admin/media/${item.id}`} alt={item.original_filename} fill sizes="(max-width: 767px) 50vw, (max-width: 1100px) 33vw, 25vw" unoptimized /> : <div className={styles.mediaPending}><Icon name="clock" size={22} /><span>{item.status === "rejected" ? "Zavrnjeno" : "V obdelavi"}</span></div>}</div><div className={styles.mediaMeta}><div><strong>{item.original_filename}</strong><small>{formatRelativeTime(item.uploaded_at ?? item.created_at)}</small></div><button type="button" aria-label={`Več možnosti za ${item.original_filename}`}><Icon name="more" size={18} /></button></div></article>)}</div> : <p className={styles.emptyState}>Za ta dogodek še ni naloženih fotografij.</p>}
        <div className={styles.loadMore}><span>Prikazanih {media.length} od {media.length}</span></div>
      </section>
    </>}
  </main>;
}

export function ModerationPage() {
  return <main className={styles.main}>
    <PageHeader eyebrow="VARNOST VSEBINE" title="Moderacija" description="Preglej vsebino pred objavo v galeriji dogodka." />
    <section className={styles.queueSummary}><div><span className={styles.amber}><Icon name="clock" size={20} /></span><div><strong>8 fotografij čaka na pregled</strong><p>Najstarejša čaka 24 minut.</p></div></div><div className={styles.queueLegend}><span><i className={styles.legendPending} /> Čaka</span><span><i className={styles.legendApproved} /> Odobreno</span><span><i className={styles.legendRejected} /> Zavrnjeno</span></div></section>
    <section className={styles.panel}><div className={styles.panelTop}><div className={styles.tabList} role="tablist" aria-label="Status moderacije"><button role="tab" aria-selected="true">Čaka <b>8</b></button><button role="tab" aria-selected="false">Odobreno</button><button role="tab" aria-selected="false">Zavrnjeno</button></div></div><div className={styles.filterBar}><label className={styles.selectControl}><span className={styles.srOnly}>Dogodek</span><select><option>50 let podjetja Lumen</option><option>Poroka Ane & Marka</option></select></label><label className={styles.selectControl}><span className={styles.srOnly}>Vrsta</span><select><option>Vsi mediji</option><option>Fotografije</option><option>Videi</option></select></label><button type="button" className={styles.iconControl} aria-label="Več filtrov"><Icon name="settings" size={18} /></button></div>
      <div className={styles.bulkBar}><div><span className={styles.checkMock}><Icon name="check" size={14} /></span><strong>3 izbrane</strong><button type="button">Počisti izbor</button></div><div><button type="button" className={styles.rejectAction}>Zavrni</button><button type="button" className={styles.approveAction}><Icon name="check" size={17} /> Odobri za galerijo</button></div></div>
      <div className={styles.moderationGrid}>{mediaItems.map(([name, tone], index) => <article className={`${styles.moderationCard} ${index < 3 ? styles.mediaSelected : ""}`} key={name}><label className={styles.mediaCheckbox}><input type="checkbox" defaultChecked={index < 3} aria-label={`Izberi ${name}`} /><span><Icon name="check" size={14} /></span></label><div className={`${styles.moderationVisual} ${styles[tone]}`}><span /><span /></div><div><strong>{name}</strong><small>Gost • pred {4 + index * 3} min</small></div><button type="button" aria-label={`Odpri ${name}`}><Icon name="chevron" size={18} /></button></article>)}</div>
    </section>
  </main>;
}

export async function AccessPage() {
  const [events, accessPoints] = await Promise.all([listEvents(), listAccessPoints()]);
  return <main className={styles.main}>
    <PageHeader eyebrow="DOSTOPNE TOČKE" title="QR & NFC" description="Upravljaj stabilne gostujoče QR kode in spremljaj obiske posameznih točk." />
    <AccessPointsPanel
      events={events.map((event) => ({ id: event.id, name: event.name }))}
      accessPoints={accessPoints.map((point) => ({
        id: point.id,
        publicCode: point.public_code,
        label: point.label,
        type: point.type,
        active: Boolean(point.active),
        visitCount: point.visit_count,
        eventName: point.event_name,
        eventSlug: point.event_slug,
      }))}
      publicAppUrl={getCloudflareEnv().PUBLIC_APP_URL}
    />
  </main>;
}

export function CustomersPage() {
  return <main className={styles.main}>
    <PageHeader eyebrow="ORGANIZACIJA" title="Stranke" description="Pregled naročnikov, kontaktov in njihovih dogodkov." action={<button type="button" className={styles.primaryAction}><Icon name="plus" size={18} /> Nova stranka</button>} />
    <section className={styles.metricGrid}><article className={styles.metricCard}><div><p>Vse stranke</p><strong>24</strong></div><span className={`${styles.metricIcon} ${styles.blue}`}><Icon name="users" size={21} /></span><small><b>+3</b> ta mesec</small></article><article className={styles.metricCard}><div><p>Aktivne galerije</p><strong>6</strong></div><span className={`${styles.metricIcon} ${styles.rose}`}><Icon name="image" size={21} /></span><small>v obdobju hrambe</small></article><article className={styles.metricCard}><div><p>Prihajajoči dogodki</p><strong>2</strong></div><span className={`${styles.metricIcon} ${styles.amber}`}><Icon name="calendar" size={21} /></span><small>v naslednjih 30 dneh</small></article></section>
    <section className={styles.panel}><div className={styles.panelTop}><div><h2>Imenik strank</h2><p>24 kontaktov</p></div></div><FilterBar /><div className={styles.tableWrap}><table className={styles.dataTable}><thead><tr><th>Stranka</th><th>Zadnji dogodek</th><th>Datum</th><th>Status</th><th><span className={styles.srOnly}>Dejanja</span></th></tr></thead><tbody>{customers.map(([name,email,event,date,status]) => <tr key={email}><td data-label="Stranka"><div className={styles.customerIdentity}><span>{name.split(" ").slice(0,2).map(word => word[0]).join("")}</span><div><strong>{name}</strong><small>{email}</small></div></div></td><td data-label="Dogodek">{event}</td><td data-label="Datum">{date}</td><td data-label="Status"><span className={`${styles.statusBadge} ${status === "Aktivna" ? styles.prepared : status === "Osnutek" ? styles.draft : styles.ended}`}><i />{status}</span></td><td><button className={styles.tableAction} type="button" aria-label={`Odpri ${name}`}><Icon name="chevron" size={18} /></button></td></tr>)}</tbody></table></div></section>
  </main>;
}

export function AnalyticsPage() {
  const sources = [["QR – glavni vhod",76],["Neposredna povezava",14],["NFC stojala",10]] as const;
  return <main className={styles.main}>
    <PageHeader eyebrow="MERITVE" title="Analitika" description="Spremljaj obiske, uploade in uspešnost dostopnih točk." action={<label className={styles.selectControl}><span className={styles.srOnly}>Obdobje</span><select defaultValue="30"><option value="30">Zadnjih 30 dni</option><option>Zadnjih 7 dni</option><option>Ta mesec</option></select></label>} />
    <section className={styles.metricGrid}><article className={styles.metricCard}><div><p>Obiski dogodkov</p><strong>3.842</strong></div><span className={`${styles.metricIcon} ${styles.blue}`}><Icon name="users" size={21} /></span><small><b>+18,2 %</b> glede na prej</small></article><article className={styles.metricCard}><div><p>Začeti uploadi</p><strong>1.506</strong></div><span className={`${styles.metricIcon} ${styles.rose}`}><Icon name="upload" size={21} /></span><small><b>39,2 %</b> obiskovalcev</small></article><article className={styles.metricCard}><div><p>Uspešno zaključeni</p><strong>1.438</strong></div><span className={`${styles.metricIcon} ${styles.green}`}><Icon name="check" size={21} /></span><small><b>95,5 %</b> začetih uploadov</small></article><article className={styles.metricCard}><div><p>Naloženi mediji</p><strong>2.917</strong></div><span className={`${styles.metricIcon} ${styles.violet}`}><Icon name="image" size={21} /></span><small>2,03 na upload sejo</small></article></section>
    <div className={styles.analyticsGrid}><section className={styles.analyticsCard}><div className={styles.cardHeader}><div><h2>Obiski in uploadi</h2><p>Dnevni trend zadnjih 14 dni</p></div><div className={styles.chartLegend}><span><i /> Obiski</span><span><i /> Uploadi</span></div></div><div className={styles.chart} role="img" aria-label="Naraščajoč dnevni trend obiskov">{chartData.map((value,index)=><span key={index} style={{height:`${value}%`}}><i>{value}</i></span>)}</div><div className={styles.chartLabels}><span>2. jul.</span><span>5. jul.</span><span>8. jul.</span><span>11. jul.</span><span>15. jul.</span></div></section><section className={styles.funnelCard}><div className={styles.cardHeader}><div><h2>Upload funnel</h2><p>Od obiska do zaključka</p></div></div><div className={styles.funnel}><div style={{width:"100%"}}><span>Obisk</span><strong>3.842</strong></div><div style={{width:"72%"}}><span>Upload začet</span><strong>1.506</strong></div><div style={{width:"68%"}}><span>Upload zaključen</span><strong>1.438</strong></div></div></section></div>
    <section className={styles.panel}><div className={styles.panelTop}><div><h2>Viri obiskov</h2><p>Kako gostje pridejo do galerije</p></div></div><div className={styles.sourceList}>{sources.map(([label,value])=><div key={label}><div><strong>{label}</strong><span>{value} %</span></div><div><span style={{width:`${value}%`}} /></div></div>)}</div></section>
  </main>;
}

export function SettingsPage() {
  return <main className={styles.mainNarrow}>
    <PageHeader eyebrow="DELOVNI PROSTOR" title="Nastavitve" description="Upravljaj organizacijo, obvestila in varnost računa." />
    <div className={styles.settingsLayout}><nav aria-label="Razdelki nastavitev"><a href="#organization" className={styles.settingsActive}>Organizacija</a><a href="#notifications">Obvestila</a><a href="#security">Varnost</a><a href="#danger">Nevarna dejanja</a></nav><div className={styles.settingsContent}>
      <section className={styles.formSection} id="organization"><div className={styles.formTitle}><h2>Organizacija</h2><p>Osnovni podatki delovnega prostora.</p></div><div className={styles.formGrid}><label className={styles.fieldWide}><span>Naziv organizacije</span><input defaultValue="Eventaj.si" /></label><label><span>Kontaktni e-poštni naslov</span><input type="email" defaultValue="info@eventaj.si" /></label><label><span>Privzeti časovni pas</span><select defaultValue="Europe/Ljubljana"><option>Europe/Ljubljana</option></select></label></div><div className={styles.inlineActions}><button type="button" className={styles.primaryAction}>Shrani spremembe</button></div></section>
      <section className={styles.formSection} id="notifications"><div className={styles.formTitle}><h2>Obvestila</h2><p>Izberi, katera operativna opozorila želiš prejemati.</p></div><div className={styles.toggleList}><label><span><strong>Neuspešni uploadi</strong><small>Ko stopnja neuspeha preseže varno mejo.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Dogodek je pripravljen</strong><small>Ko so izpolnjene vse zahteve za aktivacijo.</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Opozorilo pred potekom hrambe</strong><small>7 dni pred načrtovanim izbrisom galerije.</small></span><input type="checkbox" defaultChecked /></label></div></section>
      <section className={styles.formSection} id="security"><div className={styles.formTitle}><h2>Varnost</h2><p>Pregled aktivne seje in zaščite računa.</p></div><div className={styles.securityRow}><span className={styles.green}><Icon name="shield" size={20} /></span><div><strong>Trenutna seja</strong><p>Ljubljana, Slovenija • Safari na macOS</p></div><small>Aktivna zdaj</small></div><button type="button" className={styles.secondaryAction}>Odjavi vse druge seje</button></section>
      <section className={`${styles.formSection} ${styles.dangerSection}`} id="danger"><div className={styles.formTitle}><h2>Nevarna dejanja</h2><p>Ta dejanja so auditirana in jih ni mogoče preprosto razveljaviti.</p></div><div className={styles.dangerRow}><div><strong>Izbriši organizacijo</strong><p>Trajno izbriše podatke skladno s politiko hrambe.</p></div><button type="button">Zahtevaj izbris</button></div></section>
    </div></div>
  </main>;
}
