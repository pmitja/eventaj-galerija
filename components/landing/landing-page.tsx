import { AnimationController } from "./animation-controller";
import { LoginModalProvider } from "@/components/auth/login-modal";
import { Comparison, Faq, Pricing } from "./commerce-sections";
import { AiFeatures, Devices, Features, HowItWorks, Photobooth, Slideshow, Testimonials } from "./content-sections";
import { Footer } from "./footer";
import { Header, Hero, QuickSteps } from "./header-hero";

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
        <Photobooth />
        <Devices />
        <Testimonials />
        <Comparison />
        <Pricing />
        <Faq />
        <Footer />
      </main>
    </LoginModalProvider>
  );
}
