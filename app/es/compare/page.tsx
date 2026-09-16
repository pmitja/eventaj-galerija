import { ComparisonRoute, comparisonMetadata } from "@/components/comparisons/comparison-route";

export const metadata = comparisonMetadata("es");
export default function Page() { return <ComparisonRoute locale="es" />; }
