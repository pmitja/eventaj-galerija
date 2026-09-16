import { ComparisonRoute, comparisonMetadata } from "@/components/comparisons/comparison-route";

export const metadata = comparisonMetadata("it");
export default function Page() { return <ComparisonRoute locale="it" />; }
