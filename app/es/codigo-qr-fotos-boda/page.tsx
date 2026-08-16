import { SolutionRoute, solutionMetadata } from "@/components/landing/solution-route";

export const metadata = solutionMetadata("es", "wedding-qr");
export default function Page() { return <SolutionRoute locale="es" id="wedding-qr" />; }
