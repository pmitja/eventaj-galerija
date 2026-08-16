import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { eventUseCaseGroupsFor, eventUseCasesFor } from "./use-cases";
import { HeaderClient } from "./header";

export function Header({
  howItWorksHref,
  locale = "sl",
  alternateOrigin,
  languageLocales,
}: {
  howItWorksHref?: string;
  locale?: Locale;
  alternateOrigin?: string;
  languageLocales?: readonly Locale[];
} = {}) {
  return (
    <HeaderClient
      howItWorksHref={howItWorksHref}
      locale={locale}
      alternateOrigin={alternateOrigin}
      languageLocales={languageLocales}
      copy={getDictionary(locale)}
      eventUseCases={eventUseCasesFor(locale)}
      eventUseCaseGroups={eventUseCaseGroupsFor(locale)}
    />
  );
}
