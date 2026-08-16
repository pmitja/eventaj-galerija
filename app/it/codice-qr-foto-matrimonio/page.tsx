import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("it", "wedding-qr");
export default function Page() { return <SolutionRoute locale="it" id="wedding-qr" />; }
