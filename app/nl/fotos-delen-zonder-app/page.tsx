import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("nl", "no-app-sharing");
export default function Page() { return <SolutionRoute locale="nl" id="no-app-sharing" />; }
