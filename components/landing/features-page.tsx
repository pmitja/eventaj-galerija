import Link from "next/link";
import { AnimationController } from "./animation-controller";
import { AiFeatures, Features, Slideshow } from "./content-sections";
import { Footer } from "./footer";
import { Header } from "./header-hero";
import { FinalCta } from "./landing-essentials";
import { MemoryFeatures } from "./memory-features";
import { Showcase } from "./showcase-sections";
import { SocialProof } from "./social-proof";
import { SolutionHub } from "./solution-hub";
import { EventUseCasesSection } from "./use-case-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { appUrlForLocale, type Locale } from "@/lib/i18n/locale";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { demoEventPath, localizedMarketingPath, orderPath } from "@/lib/i18n/routes";
import { brandName } from "@/lib/seo";

function FeaturesHero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const home = localizedMarketingPath("/", locale);
  return (
    <section className="features-hero" id="top">
      <div className="features-hero-inner shell">
        <Link className="use-case-breadcrumb" href={home}>
          {brandName(locale)} <span aria-hidden="true">/</span> {t.nav.features}
        </Link>
        <div className="eyebrow"><span />{t.featuresPage.eyebrow}</div>
        <h1>{t.featuresPage.title}</h1>
        <p>{t.featuresPage.subtitle}</p>
        <div className="hero-buttons">
          <Link className="button" href={orderPath(locale)} data-sticky-cta-trigger="create-event">
            {t.hero.ctaPrimary}
          </Link>
          <Link className="button button--secondary" href={demoEventPath(locale)}>
            {t.hero.ctaSecondary}
          </Link>
        </div>
        <div className="hero-trust" aria-label={t.hero.trustLabel}>
          {t.hero.trust.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
    </section>
  );
}

/**
 * Everything the landing used to explain at length: the feature list, voice
 * guestbook and single-photo download, AI Best Photos, the live slideshow,
 * guest participation and the event categories.
 */
export async function FeaturesPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const alternateOrigin = appUrlForLocale(getPublicAppUrls(), locale === "sl" ? "en" : "sl");
  const pricingHref = `${localizedMarketingPath("/", locale)}#${t.anchors.pricing}`;

  return (
    <main className="landing-page features-page">
      <AnimationController />
      <Header locale={locale} alternateOrigin={alternateOrigin} />
      <FeaturesHero locale={locale} />
      <SocialProof locale={locale} />
      <Features locale={locale} />
      <MemoryFeatures locale={locale} />
      <AiFeatures locale={locale} />
      <Slideshow locale={locale} priceHref={pricingHref} />
      <Showcase locale={locale} />
      <EventUseCasesSection locale={locale} />
      <SolutionHub locale={locale} />
      <FinalCta locale={locale} />
      <Footer locale={locale} />
    </main>
  );
}
