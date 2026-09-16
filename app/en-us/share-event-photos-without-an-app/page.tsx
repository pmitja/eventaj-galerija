import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("en-us", "no-app-sharing");
export default function Page() { return <SolutionRoute locale="en-us" id="no-app-sharing" />; }
