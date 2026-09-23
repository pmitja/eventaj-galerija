import type { Locale } from "@/lib/i18n/locale";
import { getSiteCopy } from "@/lib/i18n/site";
import { ComparisonSection } from "./event-landing";
import { genericComparison } from "./event-landing-data";
import { FaqBlock, FinalCtaBlock, PricingBlock } from "./sections";
import { SitePage } from "./site-chrome";

export function PricingPage({ locale }: { locale: Locale }) {
  const t = getSiteCopy(locale);
  return (
    <SitePage locale={locale}>
      <PricingBlock locale={locale} headingLevel="h1" />
      <ComparisonSection locale={locale} comparison={genericComparison(locale)} />
      <FaqBlock locale={locale} heading={t.pricing.faqHeading} items={t.pricing.faq.map(([q, a]) => ({ q, a }))} />
      <FinalCtaBlock locale={locale} />
    </SitePage>
  );
}
