import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("fr", "wedding-qr");
export default function Page() { return <SolutionRoute locale="fr" id="wedding-qr" />; }
