import type { Locale } from "@/lib/i18n/locale";
import { demoEventPath } from "@/lib/i18n/routes";
import { getSiteCopy } from "@/lib/i18n/site";
import { supportEmail } from "@/lib/seo";
import { DEMO_PHOTO } from "./demo-photos";
import { FaqExplorer } from "./faq-explorer";
import { FinalCtaBlock } from "./sections";
import { SitePage } from "./site-chrome";

export function FaqPage({ locale }: { locale: Locale }) {
  const t = getSiteCopy(locale);
  const email = supportEmail(locale);
  return (
    <SitePage locale={locale}>
      <FaqExplorer copy={t.faqPage} items={t.faq.items} email={email}>
        <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
          <a href={demoEventPath(locale)} className="group relative flex min-h-[180px] flex-col justify-end overflow-hidden rounded-[22px] p-6 text-white! hover:text-white!">
            <img src={DEMO_PHOTO(1)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-[800ms] ease-gm group-hover:scale-105" />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,15,10,.1),rgba(20,15,10,.75))]" />
            <span className="relative font-serif text-[23px] leading-[1.05]">{t.faqPage.demoTitle}</span>
            <span className="relative text-[14px] opacity-90">{t.faqPage.demoText}</span>
          </a>
          <a href={`mailto:${email}`} className="flex min-h-[180px] flex-col justify-end gap-1 rounded-[22px] bg-gm-ink p-6 text-gm-bg! transition-colors duration-200 hover:bg-[#2a2521] hover:text-white!">
            <span className="font-serif text-[23px] leading-[1.05]">{t.faqPage.contactTitle}</span>
            <span className="text-[14px] text-gm-line-strong">{t.faqPage.contactText.replace("{email}", email)}</span>
          </a>
        </div>
      </FaqExplorer>
      <FinalCtaBlock locale={locale} />
    </SitePage>
  );
}
