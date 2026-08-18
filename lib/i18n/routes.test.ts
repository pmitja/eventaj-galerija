import { describe, expect, it } from "vitest";
import {
  checkoutSuccessPath,
  eventUseCasePath,
  eventUseCaseMarketingPath,
  featuresPath,
  localizedMarketingPath,
  orderPath,
  privacyPath,
  solutionPageIdFromPath,
  solutionPagePath,
  slovenianRoutePath,
  termsPath,
} from "./routes";

describe("localized public routes", () => {
  it("uses English route segments on the English domain", () => {
    expect(orderPath("en")).toBe("/order");
    expect(checkoutSuccessPath("en")).toBe("/order/success");
    expect(termsPath("en")).toBe("/terms-of-use");
    expect(privacyPath("en")).toBe("/privacy");
    expect(eventUseCasePath("en", "poslovni-dogodki")).toBe("/for-events/corporate-events");
    expect(featuresPath("en")).toBe("/features");
  });

  it("maps language-switch destinations in both directions", () => {
    expect(localizedMarketingPath("/za-dogodke/poroke", "en")).toBe("/wedding-qr-code-for-photos");
    expect(localizedMarketingPath("/for-events/weddings", "sl")).toBe("/za-dogodke/poroke");
    expect(localizedMarketingPath("/order", "sl")).toBe("/naroci");
    expect(localizedMarketingPath("/funkcije", "fr")).toBe("/fr/features");
    expect(localizedMarketingPath("/features", "sl")).toBe("/funkcije");
  });

  it("reuses English slugs under a path prefix for the additional languages", () => {
    expect(orderPath("de")).toBe("/de/order");
    expect(checkoutSuccessPath("nl")).toBe("/nl/order/success");
    expect(termsPath("es")).toBe("/es/terms-of-use");
    expect(privacyPath("it")).toBe("/it/privacy");
    expect(eventUseCasePath("fr", "poslovni-dogodki")).toBe("/fr/for-events/corporate-events");
    expect(featuresPath("de")).toBe("/de/features");
  });

  it("switches languages from and to a prefixed locale", () => {
    expect(localizedMarketingPath("/de/for-events/weddings", "sl")).toBe("/za-dogodke/poroke");
    expect(localizedMarketingPath("/de/for-events/weddings", "fr")).toBe("/fr/qr-code-photos-mariage");
    expect(localizedMarketingPath("/za-dogodke/poroke", "de")).toBe("/de/hochzeitsfotos-per-qr-code");
    expect(localizedMarketingPath("/de/order", "en")).toBe("/order");
    expect(localizedMarketingPath("/", "de")).toBe("/de");
    expect(localizedMarketingPath("/de", "sl")).toBe("/");
  });

  it("reduces any localized path back to the internal Slovenian route", () => {
    expect(slovenianRoutePath("/de/order")).toBe("/naroci");
    expect(slovenianRoutePath("/it/features")).toBe("/funkcije");
    expect(slovenianRoutePath("/nl/for-events/birthdays")).toBe("/za-dogodke/rojstni-dnevi");
    expect(slovenianRoutePath("/es/downloads/abc")).toBe("/prenosi/abc");
    expect(slovenianRoutePath("/naroci")).toBe("/naroci");
    expect(slovenianRoutePath("/de/unknown")).toBe("/unknown");
  });

  it("maps native solution-page slugs through a stable page id", () => {
    expect(solutionPagePath("en", "wedding-qr")).toBe("/wedding-qr-code-for-photos");
    expect(solutionPagePath("de", "wedding-qr")).toBe("/de/hochzeitsfotos-per-qr-code");
    expect(solutionPagePath("nl", "wedding-qr")).toBe("/nl/trouwfotos-verzamelen-qr-code");
    expect(solutionPagePath("fr", "wedding-qr")).toBe("/fr/qr-code-photos-mariage");
    expect(solutionPagePath("es", "no-app-sharing")).toBe("/es/compartir-fotos-evento-sin-app");
    expect(solutionPagePath("it", "event-qr-gallery")).toBe("/it/codice-qr-foto-evento");
    expect(solutionPageIdFromPath("/de/hochzeitsfotos-per-qr-code")).toBe("wedding-qr");
    expect(localizedMarketingPath("/nl/trouwfotos-verzamelen-qr-code", "de"))
      .toBe("/de/hochzeitsfotos-per-qr-code");
    expect(slovenianRoutePath("/event-photo-sharing-qr-code"))
      .toBe("/solutions/event-qr-gallery");
    expect(eventUseCaseMarketingPath("fr", "poroke")).toBe("/fr/qr-code-photos-mariage");
    expect(eventUseCaseMarketingPath("sl", "poroke")).toBe("/za-dogodke/poroke");
  });
});
