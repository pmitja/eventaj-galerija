import { ComparisonRoute, comparisonMetadata } from "@/components/comparisons/comparison-route";

export const metadata = comparisonMetadata("en");
export default function Page() { return <ComparisonRoute locale="en" />; }
