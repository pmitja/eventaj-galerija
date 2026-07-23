import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} | QR galerija za dogodke`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} | QR galerija za dogodke`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
};

export default function Home() {
  return <LandingPage />;
}
