import { ComparisonRoute, comparisonMetadata } from "@/components/comparisons/comparison-route";

export const metadata = comparisonMetadata("de");
export default function Page() { return <ComparisonRoute locale="de" />; }
