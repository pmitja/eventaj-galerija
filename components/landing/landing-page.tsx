import { AnimationController } from "./animation-controller";
import { LoginModalProvider } from "@/components/auth/login-modal";
import { Faq, Pricing } from "./commerce-sections";
import { AiFeatures, Devices, Features, HowItWorks, Slideshow } from "./content-sections";
import { Footer } from "./footer";
import { Header, Hero, QuickSteps } from "./header-hero";
import { Showcase } from "./showcase-sections";
import { MemoryFeatures } from "./memory-features";
import { EventUseCasesSection } from "./use-case-page";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { appUrlForLocale } from "@/lib/i18n/locale";

export async function LandingPage() {
  const locale = await getRequestLocale();
  const alternateOrigin = appUrlForLocale(getPublicAppUrls(), locale === "en" ? "sl" : "en");
  return (
    <LoginModalProvider>
      <main className="landing-page">
        <AnimationController />
        <Header locale={locale} alternateOrigin={alternateOrigin} />
        <Hero locale={locale} />
        <QuickSteps locale={locale} />
        <HowItWorks locale={locale} />
        <Features locale={locale} />
        <MemoryFeatures locale={locale} />
        <AiFeatures locale={locale} />
        <Slideshow locale={locale} />
        <Showcase locale={locale} />
        <Devices locale={locale} />
        <EventUseCasesSection locale={locale} />
        <Pricing locale={locale} />
        <Faq locale={locale} />
        <Footer locale={locale} />
      </main>
    </LoginModalProvider>
  );
}
