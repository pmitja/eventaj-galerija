import type { Metadata } from "next";
import { OrderPage } from "@/components/site/order-page";
import { getCloudflareEnv } from "@/lib/cloudflare";
import { getRequestLocale } from "@/lib/i18n/server";
import { orderPath } from "@/lib/i18n/routes";
import { getPublicAppUrls } from "@/lib/i18n/server";
import { canonicalUrl, languageAlternates } from "@/lib/i18n/alternates";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const env = getPublicAppUrls();
  const t = getDictionary(locale).order;
  const url = orderPath(locale);
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: canonicalUrl(env, locale, url),
      languages: languageAlternates(env, url),
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, url },
  };
}

export const dynamic = "force-dynamic";

export default async function OrderRoute({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).order;
  const params = await searchParams;
  return (
    <OrderPage
      locale={locale}
      title={t.title}
      intro={t.intro}
      cancelled={params.preklicano === "1"}
      videoAddOnAvailable={String(getCloudflareEnv().VIDEO_UPLOAD_ENABLED) === "true"}
    />
  );
}
