import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("fr", "no-app-sharing");
export default function Page() { return <SolutionRoute locale="fr" id="no-app-sharing" />; }
