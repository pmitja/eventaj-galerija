"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { LoginForm } from "./login-form";

type LoginModalContextValue = {
  openLogin: (callbackUrl?: string) => void;
};

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function LoginModalProvider({ children }: Readonly<{ children: ReactNode }>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (callbackUrl && !dialog.open) dialog.showModal();
    if (!callbackUrl && dialog.open) dialog.close();
  }, [callbackUrl]);

  function closeLogin() {
    setCallbackUrl(null);
  }

  return (
    <LoginModalContext.Provider value={{ openLogin: (url = "/admin") => setCallbackUrl(url) }}>
      {children}
      <dialog
        ref={dialogRef}
        className="login-modal"
        aria-labelledby="login-modal-title"
        onCancel={closeLogin}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeLogin();
        }}
      >
        <div className="login-modal__panel">
          <button className="login-modal__close" type="button" onClick={closeLogin} aria-label="Zapri prijavo">
            <span aria-hidden="true">×</span>
          </button>
          <LoginForm callbackUrl={callbackUrl ?? "/admin"} titleId="login-modal-title" compact />
          <a className="login-modal__fallback" href="/login">Odpri prijavo na ločeni strani</a>
        </div>
      </dialog>
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (!context) throw new Error("useLoginModal must be used inside LoginModalProvider");
  return context;
}

type LoginTriggerProps = {
  children: ReactNode;
  className?: string;
  callbackUrl?: string;
};

export function LoginTrigger({ children, className, callbackUrl = "/admin" }: Readonly<LoginTriggerProps>) {
  const { openLogin } = useLoginModal();
  return <button className={className} type="button" onClick={() => openLogin(callbackUrl)}>{children}</button>;
}
