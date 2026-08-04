import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { SEO_COPY } from "@/lib/seo";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = SEO_COPY[locale];
  return { title: copy.title, description: copy.description, alternates: { canonical: "/" }, openGraph: { title: copy.title, description: copy.description, url: "/" } };
}

export default function Home() {
  return <LandingPage />;
}
