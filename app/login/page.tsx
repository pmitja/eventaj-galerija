import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f7f5f2" }}>
      <LoginForm />
    </main>
  );
}
