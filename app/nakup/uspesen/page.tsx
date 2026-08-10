import type { Metadata } from "next";
import Link from "next/link";
import { Check, Download, Mail, MonitorPlay, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fulfillCheckout, findDeliveryLinks } from "@/lib/repositories/checkout";
import { checkoutSessionIdSchema } from "@/lib/validation/checkout";
import { checkoutHeadingClass, checkoutHeadingTextClass, checkoutHeadingTitleClass, checkoutPageClass, checkoutShellClass } from "@/components/checkout/checkout-styles";
import { getRequestLocale } from "@/lib/i18n/server";
import { checkoutSuccessPath, orderPath } from "@/lib/i18n/routes";
import { withLocalePrefix } from "@/lib/i18n/locale";
import { brandName } from "@/lib/seo";
import { cn } from "@/lib/utils";

const successLink =
  "flex min-h-[50px] items-center justify-center gap-2 rounded-[14px] px-[18px] py-3 text-[15px] font-bold no-underline";
const nextStep = "flex items-start gap-2.5 rounded-[14px] border border-[#eee0e6] bg-[#fffbfd] p-3.5";
const nextStepIcon = "size-[19px] flex-none text-brand";
const nextStepNote = "text-[12px]/[1.45] text-plum-muted";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: locale === "en" ? `Order status | ${brandName(locale)}` : `Status naročila | ${brandName(locale)}`, robots: { index: false, follow: false, nocache: true } };
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const parsed = checkoutSessionIdSchema.safeParse((await searchParams).session_id);
  let eventId: string | null = null;
  if (parsed.success) {
    try { eventId = (await fulfillCheckout(parsed.data, locale)).provisioned_event_id; } catch { eventId = null; }
  }
  const ready = Boolean(eventId);
  const links = eventId ? await findDeliveryLinks(eventId) : null;
  const galleryUrl = links ? withLocalePrefix(locale, `/t/${encodeURIComponent(links.publicCode)}`) : null;
  const liveshowUrl = links?.slideshowToken ? withLocalePrefix(locale, `/display/${encodeURIComponent(links.slideshowToken)}`) : null;

  return <main className={checkoutPageClass}><div className={checkoutShellClass}>
    <header className={checkoutHeadingClass}>
      <p className="m-0 mb-2.5">{ready ? (en ? "PAYMENT SUCCESSFUL" : "PLAČILO USPEŠNO") : (en ? "PAYMENT PROCESSING" : "PLAČILO V OBDELAVI")}</p>
      <h1 className={checkoutHeadingTitleClass}>{ready ? (en ? "Your payment is confirmed." : "Plačilo je potrjeno.") : (en ? "We are finishing your gallery." : "Zaključujemo pripravo galerije.")}</h1>
      <span className={checkoutHeadingTextClass}>{ready ? (en ? "We are sending the QR code and event link to the email address from your order." : "QR kodo in povezavo do dogodka pošiljamo na e-poštni naslov iz naročila.") : (en ? "Stripe is still confirming the payment. Refresh this page in a few moments." : "Stripe še potrjuje plačilo. Stran čez nekaj trenutkov osveži.")}</span>
    </header>
    {ready ? <Card className="mx-auto mt-8 max-w-[650px] text-center shadow-[0_18px_48px_rgba(79,18,47,.09)]"><CardContent>
      <div className="mx-auto mb-[18px] grid size-[58px] place-items-center rounded-full bg-[#dcfce7] text-[#15803d]"><Check className="size-7" aria-hidden="true" /></div>
      {galleryUrl ? <div className="mb-5 grid gap-2.5">
        <a className={cn(successLink, "bg-brand text-white! shadow-[0_1px_2px_rgba(225,29,72,.3)]")} href={galleryUrl}><QrCode className="size-[18px] flex-none" aria-hidden="true" />{en ? "Open gallery and QR" : "Odpri galerijo in QR"}</a>
        {liveshowUrl ? <a className={cn(successLink, "border border-[#eccdd9] bg-[#fffbfd] text-[#9d174d]!")} href={liveshowUrl}><MonitorPlay className="size-[18px] flex-none" aria-hidden="true" />{en ? "Open live display" : "Odpri prikaz v živo"}</a> : null}
      </div> : null}
      <div className="my-[22px] grid gap-3 text-left sm:grid-cols-2">
        <div className={nextStep}><Mail className={nextStepIcon} aria-hidden="true" /><span className="grid gap-[3px]"><strong className="text-[13.5px]">{en ? "Check your email" : "Preveri e-pošto"}</strong><small className={nextStepNote}>{en ? "You will receive the QR code and a direct link. Check your spam folder too." : "Prejmeš QR kodo in neposredno povezavo. Poglej tudi med vsiljeno pošto."}</small></span></div>
        <div className={nextStep}><Download className={nextStepIcon} aria-hidden="true" /><span className="grid gap-[3px]"><strong className="text-[13.5px]">{en ? "After the event" : "Po dogodku"}</strong><small className={nextStepNote}>{en ? "We will send another email with a 24-hour link to the photo ZIP." : "Pošljemo ti novo sporočilo z 24-urno povezavo do ZIP-a fotografij."}</small></span></div>
      </div>
      {eventId ? <p className="m-0 mb-[18px] rounded-[14px] border border-dashed border-[#eccdd9] bg-[#fffbfd] px-4 py-3 text-[13px]/[1.5] text-plum-muted"><strong className="block text-[12px] font-bold tracking-[.04em] text-[#4f122f] uppercase">{en ? "Event number" : "Številka dogodka"}</strong><code className="text-[14px] break-all text-[#9d174d]">{eventId}</code>{en ? "If anything goes wrong, send us this number and we will help." : "Če kaj ne deluje, nam pošlji to številko in ti pomagamo."}</p> : null}
      <p className="m-0 text-[13px]/[1.55] text-plum-muted">{en ? "We did not create an account and no sign-in is required. You can safely close this page." : "Računa nismo ustvarili in prijava ni potrebna. To stran lahko varno zapreš."}</p>
    </CardContent></Card> : <Link className="mx-auto mt-6 grid min-h-[54px] w-full max-w-[420px] place-items-center rounded-xl bg-brand text-[16px] font-[750] text-white! no-underline hover:bg-brand-hover" href={parsed.success ? `${checkoutSuccessPath(locale)}?session_id=${encodeURIComponent(parsed.data)}` : orderPath(locale)}>{en ? "Check again" : "Preveri znova"}</Link>}
  </div></main>;
}
