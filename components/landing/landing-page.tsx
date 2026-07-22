import { AnimationController } from "./animation-controller";
import { LoginModalProvider } from "@/components/auth/login-modal";
import { Faq, Pricing } from "./commerce-sections";
import { AiFeatures, Devices, Features, HowItWorks, Slideshow } from "./content-sections";
import { Footer } from "./footer";
import { Header, Hero, QuickSteps } from "./header-hero";
import { Showcase } from "./showcase-sections";

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
        <Pricing />
        <Faq />
        <Footer />
      </main>
    </LoginModalProvider>
  );
}
