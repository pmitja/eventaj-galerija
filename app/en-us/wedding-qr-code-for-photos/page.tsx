import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("en-us", "wedding-qr");
export default function Page() { return <SolutionRoute locale="en-us" id="wedding-qr" />; }
