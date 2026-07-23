import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Prijava | Eventaj Galerija",
  robots: { index: false, follow: false, nocache: true },
};

export default function LoginPage() {
  return (
    <main className="login-page">
      <LoginForm />
    </main>
  );
}
