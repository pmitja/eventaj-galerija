import { AnimationController } from "./animation-controller";
import { Faq, Pricing } from "./commerce-sections";
import { Devices, HowItWorks } from "./content-sections";
import { Essentials, FinalCta } from "./landing-essentials";
import { Footer } from "./footer";
import { Header, Hero, HeroPromise } from "./header-hero";
import { QrPlacement } from "./qr-placement";
import { SocialProof } from "./social-proof";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { appUrlForLocale } from "@/lib/i18n/locale";

/**
 * The landing is the paid-traffic page: price, proof, three steps, what €35
 * buys, and a close. Every long feature story lives on the features page.
 */
export async function LandingPage() {
  const locale = await getRequestLocale();
  const alternateOrigin = appUrlForLocale(getPublicAppUrls(), locale === "sl" ? "en" : "sl");
  return (
      <main className="landing-page">
        <AnimationController />
        <Header locale={locale} alternateOrigin={alternateOrigin} />
        <Hero locale={locale} />
        <SocialProof locale={locale} />
        <HowItWorks locale={locale} maxSteps={3} tone="plain" />
        <QrPlacement locale={locale} tone="plain" />
        <Pricing locale={locale} />
        <HeroPromise locale={locale} />
        <Essentials locale={locale} />
        <Devices locale={locale} />
        <Faq locale={locale} />
        <FinalCta locale={locale} />
        <Footer locale={locale} />
      </main>
  );
}
