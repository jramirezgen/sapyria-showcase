"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured) return setMessage("La conexión segura de demostración aún está terminando de configurarse.");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const fullName = String(form.get("fullName") || "");
    const supabase = createSupabaseBrowserClient();
    setLoading(true); setMessage(null);
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "login") window.location.assign("/dashboard");
    else setMessage("Revisa tu correo para confirmar tu cuenta y activar tu espacio Sapyria.");
  }

  async function signInGoogle() {
    if (!isSupabaseConfigured) return setMessage("La conexión segura de demostración aún está terminando de configurarse.");
    setLoading(true); setMessage(null);
    const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setLoading(false); setMessage(error.message); }
  }

  return <div className="auth-card">
    <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Ingresar</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Crear cuenta</button></div>
    <button className="google-button" onClick={signInGoogle} disabled={loading}><span>G</span>Continuar con Google</button>
    <div className="or"><i />o<i /></div>
    <form onSubmit={submit}>
      {mode === "register" && <label>Nombre completo<input name="fullName" autoComplete="name" required /></label>}
      <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
      <label>Contraseña<input name="password" type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
      <button className="primary-button" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17} /> : <>{mode === "login" ? "Entrar a mi espacio" : "Crear mi espacio"}<ArrowRight size={17} /></>}</button>
    </form>
    {message && <p className="form-message">{message}</p>}
    <p className="consent">Al continuar, confirmas que este entorno es una demostración de producto y no brinda diagnóstico clínico.</p>
  </div>;
}
