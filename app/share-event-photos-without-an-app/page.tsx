import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("en", "no-app-sharing");
export default function Page() { return <SolutionRoute locale="en" id="no-app-sharing" />; }
