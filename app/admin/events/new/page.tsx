import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = { title: "Nov dogodek | Eventaj Galerija" };
export default function Page() { redirect("/naroci"); }
