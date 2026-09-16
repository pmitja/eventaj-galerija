import { ComparisonRoute, comparisonMetadata } from "@/components/comparisons/comparison-route";

export const metadata = comparisonMetadata("nl");
export default function Page() { return <ComparisonRoute locale="nl" />; }
