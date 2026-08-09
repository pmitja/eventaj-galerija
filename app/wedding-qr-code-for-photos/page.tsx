import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("en", "wedding-qr");
export default function Page() { return <SolutionRoute locale="en" id="wedding-qr" />; }
