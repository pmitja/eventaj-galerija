import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("nl", "wedding-qr");
export default function Page() { return <SolutionRoute locale="nl" id="wedding-qr" />; }
