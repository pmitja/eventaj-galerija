import type { Locale } from "@/lib/i18n/locale";
import { orderPath } from "@/lib/i18n/routes";
import { getSiteCopy } from "@/lib/i18n/site";
import { HomeHero } from "./home-hero";
import { FaqBlock, FinalCtaBlock, HowItWorksBlock, LiveDemoBlock, MadeForStrip, PlacementBlock, PricingBlock, homeFaq } from "./sections";
import { SitePage } from "./site-chrome";

/** The redesigned landing: mosaic hero, three steps, live demo, placement, price, FAQ, close. */
export function HomePage({ locale }: { locale: Locale }) {
  const site = getSiteCopy(locale);
  return (
    <SitePage locale={locale}>
      <HomeHero
        orderHref={orderPath(locale)}
        copy={{
          ...site.hero,
          cta: site.finalCta.ctaWedding,
          moments: site.hero.moments.replace("{count}", "9"),
        }}
      />
      <MadeForStrip locale={locale} />
      <HowItWorksBlock locale={locale} />
      <LiveDemoBlock locale={locale} />
      <PlacementBlock locale={locale} />
      <PricingBlock locale={locale} />
      <FaqBlock locale={locale} items={homeFaq(locale)} />
      <FinalCtaBlock locale={locale} />
    </SitePage>
  );
}
