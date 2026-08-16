import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("es", "no-app-sharing");
export default function Page() { return <SolutionRoute locale="es" id="no-app-sharing" />; }
