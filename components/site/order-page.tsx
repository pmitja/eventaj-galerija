import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import { marketingHomeHref } from "@/lib/i18n/routes";
import { getSiteCopy } from "@/lib/i18n/site";
import { brandName } from "@/lib/seo";
import { Brand, DEMO_PHOTO, SiteFooter } from "./site-chrome";
import { OrderForm } from "./order-form";

/** Minimal header for the purchase path: back, centred brand, secure-checkout note. */
export function CheckoutHeader({ locale }: { locale: Locale }) {
  const t = getSiteCopy(locale).header;
  const home = marketingHomeHref(locale);
  return (
    <header className="sticky top-0 z-50 border-b border-gm-line bg-[rgba(247,245,241,0.92)] backdrop-blur-[14px]">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-5 px-[clamp(16px,4vw,48px)]">
        <Link href={home} className="flex items-center gap-2 rounded-full py-2.5 pr-3.5 pl-2.5 text-[15px] font-medium whitespace-nowrap hover:bg-gm-sand hover:text-gm-ink!">
          <span aria-hidden="true">←</span><span className="max-[400px]:sr-only">{t.back}</span>
        </Link>
        <Link href={home} aria-label={brandName(locale)} className="mx-auto flex items-center gap-2.5 text-[18px] font-bold whitespace-nowrap max-[400px]:text-[16px]">
          <Brand locale={locale} size={32} />
        </Link>
        <span className="flex items-center gap-2 text-[14px] whitespace-nowrap text-gm-muted" title={t.secureCheckout}>
          <span aria-hidden="true">🔒</span><span className="max-[560px]:sr-only">{t.secureCheckout}</span>
        </span>
      </div>
    </header>
  );
}

export function OrderPage({ locale, videoAddOnAvailable, cancelled, title, intro }: {
  locale: Locale;
  videoAddOnAvailable: boolean;
  cancelled: boolean;
  title: string;
  intro: string;
}) {
  const t = getSiteCopy(locale).order;
  return (
    <div className="gm">
      <a href="#main" className="fixed top-2 -left-[9999px] z-[100] rounded-lg bg-gm-ink px-4 py-3 text-gm-bg! focus:left-2">
        {getSiteCopy(locale).skipToContent}
      </a>
      <CheckoutHeader locale={locale} />
      <main id="main" tabIndex={-1} className="outline-none">
        <section className="px-[clamp(16px,4vw,48px)] pt-[clamp(28px,4vw,56px)] pb-[clamp(56px,7vw,96px)]">
          <div className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(28px,4vw,64px)]">
            <div className="flex max-w-[560px] min-w-0 animate-gm-up flex-col gap-[22px]">
              <div className="text-[12px] font-semibold tracking-[.16em] whitespace-nowrap text-gm-accent uppercase">{t.eyebrow}</div>
              <h1 className="-mt-2 font-serif text-[clamp(40px,5vw,68px)] leading-[1.05] font-normal tracking-[-0.02em]">{title}</h1>
              <p className="text-[18px] leading-[1.55] text-pretty text-gm-muted">{intro}</p>
              <OrderForm locale={locale} videoAddOnAvailable={videoAddOnAvailable} cancelled={cancelled} />
            </div>

            <aside className="relative flex min-h-[clamp(520px,70vh,720px)] min-w-0 animate-gm-in flex-col justify-end overflow-hidden rounded-[28px] text-white min-[900px]:sticky min-[900px]:top-24">
              <img src={DEMO_PHOTO(1)} alt={t.asideAlt} className="absolute inset-0 size-full object-cover" />
              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,15,10,.1)_20%,rgba(20,15,10,.85))]" />
              <div className="relative flex flex-col gap-[22px] p-[clamp(22px,3vw,36px)]">
                <div className="font-serif text-[clamp(26px,2.6vw,36px)] leading-[1.15]">{t.asideTitle}</div>
                <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 p-0">
                  {t.asideSteps.map(([title, text], index) => (
                    <li key={title} className="flex items-start gap-3">
                      <span className={index === 0
                        ? "grid size-7 flex-none place-items-center rounded-full bg-gm-accent text-[13px] font-bold"
                        : "grid size-7 flex-none place-items-center rounded-full border border-white/50 text-[13px] font-bold"}
                      >
                        {index + 1}
                      </span>
                      <span className="text-[14px] leading-[1.45]">
                        <strong className="block text-[15px] font-semibold">{title}</strong>
                        <span className="text-[#e6e0d8]">{text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="flex flex-wrap gap-2">
                  {t.asideChips.map((chip) => (
                    <span key={chip} className="rounded-full bg-white/[.14] px-3 py-[7px] text-[13px] font-medium backdrop-blur-[6px]">{chip}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} sticky={false} />
    </div>
  );
}
