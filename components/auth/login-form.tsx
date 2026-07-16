"use client";

import { useState, useTransition, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setError(null);

    startTransition(async () => {
      try {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          setError("E-pošta ali geslo ni pravilno.");
          return;
        }
        router.replace("/admin");
        router.refresh();
      } catch {
        setError("Prijava trenutno ni uspela. Poskusi znova.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "min(100%, 420px)", display: "grid", gap: 18, padding: 32, borderRadius: 20, background: "white", boxShadow: "0 16px 50px #2c241b18" }}>
      <div>
        <p style={{ margin: 0, color: "#80543f", fontWeight: 700 }}>EVENTAJ</p>
        <h1 style={{ marginBottom: 8 }}>Prijava</h1>
        <p style={{ margin: 0, color: "#665f58" }}>Upravljanje dogodkov in galerij.</p>
      </div>
      <label style={{ display: "grid", gap: 7 }}>
        <span>E-pošta</span>
        <input name="email" type="email" defaultValue="info@eventaj.si" required autoComplete="username" style={{ padding: 13, border: "1px solid #d8d2cb", borderRadius: 10 }} />
      </label>
      <label style={{ display: "grid", gap: 7 }}>
        <span>Geslo</span>
        <input name="password" type="password" required autoComplete="current-password" style={{ padding: 13, border: "1px solid #d8d2cb", borderRadius: 10 }} />
      </label>
      {error ? <p role="alert" style={{ margin: 0, color: "#a72c2c" }}>{error}</p> : null}
      <button type="submit" disabled={isPending} style={{ padding: 14, border: 0, borderRadius: 10, color: "white", background: "#34271f", fontWeight: 700, opacity: isPending ? 0.65 : 1 }}>
        {isPending ? "Prijavljam …" : "Prijavi se"}
      </button>
    </form>
  );
}
