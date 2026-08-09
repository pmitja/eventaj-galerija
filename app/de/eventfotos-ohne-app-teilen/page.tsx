import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("de", "no-app-sharing");
export default function Page() { return <SolutionRoute locale="de" id="no-app-sharing" />; }
