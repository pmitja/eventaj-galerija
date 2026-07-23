import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UseCasePage } from "@/components/landing/use-case-page";
import { JsonLd } from "@/components/seo/json-ld";
import { eventUseCases, getEventUseCase } from "@/components/landing/use-cases";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return eventUseCases.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const useCase = getEventUseCase((await params).slug);
  if (!useCase) return {};

  const title = `${useCase.navTitle} – QR galerija za fotografije | Eventaj`;
  const description = useCase.description;

  return {
    title,
    description,
    alternates: { canonical: `/za-dogodke/${useCase.slug}` },
    openGraph: {
      title,
      description,
      url: `/za-dogodke/${useCase.slug}`,
      siteName: SITE_NAME,
      locale: "sl_SI",
      type: "website",
      images: ["/og-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function EventUseCaseRoute({ params }: PageProps) {
  const useCase = getEventUseCase((await params).slug);
  if (!useCase) notFound();

  const pageUrl = absoluteUrl(`/za-dogodke/${useCase.slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${useCase.navTitle} – QR galerija za fotografije`,
        description: useCase.description,
        inLanguage: "sl-SI",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#application` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Eventaj Galerija",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: useCase.navTitle,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <UseCasePage useCase={useCase} />
    </>
  );
}
