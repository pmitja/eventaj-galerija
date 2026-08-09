import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("de", "event-qr-gallery");
export default function Page() { return <SolutionRoute locale="de" id="event-qr-gallery" />; }
