import type { Metadata } from "next";
import { SettingsPage } from "@/components/admin/admin-pages";
export const metadata: Metadata = { title: "Nastavitve | Eventaj Galerija" };
export default function Page() { return <SettingsPage />; }
