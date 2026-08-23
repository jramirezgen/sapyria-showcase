"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

/**
 * El formulario de acceso.
 *
 * Se reescribió el 2026-08-22: usaba clases del CSS artesanal que se retiró al
 * migrar a Tailwind, así que en producción salía **sin un solo estilo** — campos
 * invisibles y botones pegados. Es la página donde alguien decide si confía, y
 * estaba rota.
 */
export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const noConfigurado = "La conexión segura de demostración aún está terminando de configurarse.";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured) return setMessage(noConfigurado);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const fullName = String(form.get("fullName") || "");
    const supabase = createSupabaseBrowserClient();
    setLoading(true);
    setMessage(null);
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (mode === "login") window.location.assign("/dashboard");
    else setMessage("Revisa tu correo para confirmar tu cuenta y activar tu espacio Sapyria.");
  }

  async function signInGoogle() {
    if (!isSupabaseConfigured) return setMessage(noConfigurado);
    setLoading(true);
    setMessage(null);
    const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setLoading(false); setMessage(error.message); }
  }

  const campo =
    "mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors " +
    "focus:border-[var(--accent)]";
  const estiloCampo = { borderColor: "var(--border)", background: "var(--surface-0)", color: "var(--ink-1)" };

  return (
    <div>
      {/* Pestañas: la activa se distingue por fondo Y por `aria-selected`, no
          sólo por color. */}
      <div role="tablist" aria-label="Modo de acceso"
           className="grid grid-cols-2 gap-1 rounded-lg p-1" style={{ background: "var(--surface-2)" }}>
        {(["login", "register"] as const).map((m) => (
          <button
            key={m} type="button" role="tab" aria-selected={mode === m}
            onClick={() => { setMode(m); setMessage(null); }}
            className="rounded-md px-3 py-2 text-sm font-semibold transition-colors"
            style={mode === m
              ? { background: "var(--surface-0)", color: "var(--ink-1)", boxShadow: "0 1px 2px rgb(0 0 0 / 0.06)" }
              : { color: "var(--ink-2)" }}
          >
            {m === "login" ? "Ingresar" : "Crear cuenta"}
          </button>
        ))}
      </div>

      <button
        type="button" onClick={signInGoogle} disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--surface-2)] disabled:opacity-60"
        style={{ borderColor: "var(--border)" }}
      >
        <span aria-hidden className="grid size-5 place-items-center rounded-full text-[11px] font-extrabold"
              style={{ background: "var(--surface-2)" }}>G</span>
        Continuar con Google
      </button>

      <div className="my-4 flex items-center gap-3" aria-hidden>
        <i className="h-px flex-1" style={{ background: "var(--border)" }} />
        <span className="ink-3 text-xs">o</span>
        <i className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>

      <form onSubmit={submit} className="grid gap-3">
        {mode === "register" ? (
          <label className="block text-sm font-medium">
            Nombre completo
            <input name="fullName" autoComplete="name" required className={campo} style={estiloCampo} />
          </label>
        ) : null}
        <label className="block text-sm font-medium">
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required className={campo} style={estiloCampo} />
        </label>
        <label className="block text-sm font-medium">
          Contraseña
          <input name="password" type="password" minLength={8} required
                 autoComplete={mode === "login" ? "current-password" : "new-password"}
                 className={campo} style={estiloCampo} />
        </label>
        {/* `type="submit"` explícito: sin él, cualquier prueba automática que
            busque el botón de envío no lo encuentra --- y no lo encontró. */}
        <button type="submit" disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--accent)" }}>
          {loading ? <LoaderCircle className="animate-spin" size={17} />
                   : <>{mode === "login" ? "Entrar a mi espacio" : "Crear mi espacio"} <ArrowRight size={16} /></>}
        </button>
      </form>

      {message ? (
        <p role="status" aria-live="polite"
           className="mt-4 rounded-lg border-l-4 px-3 py-2.5 text-sm leading-relaxed"
           style={{ borderColor: "var(--serious)", background: "var(--surface-1)" }}>
          {message}
        </p>
      ) : null}

      <p className="ink-3 mt-4 text-xs leading-relaxed pretty">
        Al continuar, confirmas que este entorno es una demostración de producto y no
        brinda diagnóstico clínico.
      </p>
    </div>
  );
}
