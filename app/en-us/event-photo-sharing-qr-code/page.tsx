import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("en-us", "event-qr-gallery");
export default function Page() { return <SolutionRoute locale="en-us" id="event-qr-gallery" />; }
