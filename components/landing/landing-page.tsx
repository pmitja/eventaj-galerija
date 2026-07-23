import { AnimationController } from "./animation-controller";
import { LoginModalProvider } from "@/components/auth/login-modal";
import { Faq, Pricing } from "./commerce-sections";
import { AiFeatures, Devices, Features, HowItWorks, Slideshow } from "./content-sections";
import { Footer } from "./footer";
import { Header, Hero, QuickSteps } from "./header-hero";
import { Showcase } from "./showcase-sections";
import { EventUseCasesSection } from "./use-case-page";

export function LandingPage() {
  return (
    <LoginModalProvider>
      <main className="landing-page">
        <AnimationController />
        <Header />
        <Hero />
        <QuickSteps />
        <HowItWorks />
        <Features />
        <AiFeatures />
        <Slideshow />
        <Showcase />
        <Devices />
        <EventUseCasesSection />
        <Pricing />
        <Faq />
        <Footer />
      </main>
    </LoginModalProvider>
  );
}
