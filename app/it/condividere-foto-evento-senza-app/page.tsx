import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("it", "no-app-sharing");
export default function Page() { return <SolutionRoute locale="it" id="no-app-sharing" />; }
