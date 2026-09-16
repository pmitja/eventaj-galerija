import { ComparisonRoute, comparisonMetadata } from "@/components/comparisons/comparison-route";

export const metadata = comparisonMetadata("fr");
export default function Page() { return <ComparisonRoute locale="fr" />; }
