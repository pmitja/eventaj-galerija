import { notFound } from "next/navigation";
import { ComparisonRoute, comparisonMetadata } from "@/components/comparisons/comparison-route";
import { comparisonIdFromSlug } from "@/lib/comparisons/routes";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const id = comparisonIdFromSlug((await params).slug);
  if (!id) notFound();
  return comparisonMetadata("en", id);
}
export default async function Page({ params }: Props) {
  const id = comparisonIdFromSlug((await params).slug);
  if (!id) notFound();
  return <ComparisonRoute locale="en" id={id} />;
}
