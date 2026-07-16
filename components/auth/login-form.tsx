"use client";

import { useState, useTransition, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  callbackUrl?: string;
  compact?: boolean;
  titleId?: string;
};

export function LoginForm({ callbackUrl = "/admin", compact = false, titleId }: Readonly<LoginFormProps>) {
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
        router.replace(callbackUrl);
        router.refresh();
      } catch {
        setError("Prijava trenutno ni uspela. Poskusi znova.");
      }
    });
  }

  return (
    <form className={`login-form ${compact ? "login-form--compact" : ""}`} onSubmit={handleSubmit}>
      <div className="login-form__heading">
        <p>EVENTAJ.SI GALERIJA</p>
        <h1 id={titleId}>Prijava</h1>
        <span>Upravljanje dogodkov in galerij.</span>
      </div>
      <label>
        <span>E-pošta</span>
        <input name="email" type="email" defaultValue="info@eventaj.si" required autoComplete="username" autoFocus={compact} />
      </label>
      <label>
        <span>Geslo</span>
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      {error ? <p className="login-form__error" role="alert">{error}</p> : null}
      <button className="login-form__submit" type="submit" disabled={isPending}>
        {isPending ? "Prijavljam …" : "Prijavi se"}
      </button>
    </form>
  );
}
