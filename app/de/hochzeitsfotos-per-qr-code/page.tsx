import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("de", "wedding-qr");
export default function Page() { return <SolutionRoute locale="de" id="wedding-qr" />; }
