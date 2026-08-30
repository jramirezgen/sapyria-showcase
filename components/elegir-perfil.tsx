"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { mensajeHumano } from "@/lib/auth-messages";

/**
 * La primera pantalla de quien acaba de entrar.
 *
 * Existe por dos razones que se resuelven a la vez. La primera: entrar con
 * Google dejaba a la persona en un informe sin haberle dicho nada — ni que había
 * entrado, ni que con Google no hay correo que confirmar. La segunda: el perfil
 * que se exploraba estaba **inventado**, y por eso la web tenía que gritar
 * «MUESTRA SINTÉTICA» en cada bloque.
 *
 * Eligiendo entre ocho cohortes públicas REALES, las cifras dejan de estar
 * simuladas —así que no hay nada que disimular— y el momento de elegir se
 * convierte en la entrada al producto.
 */
export type PerfilDisponible = { id: string; titulo: string; clase: string };

const DESCRIPCION: Record<string, string> = {
  infecciosa: "Respuesta del cuerpo frente a un agente externo",
  neurodegenerativa: "Procesos del sistema nervioso a largo plazo",
  "oncológica": "Crecimiento celular fuera de control",
  inmune: "El sistema de defensa ajustándose",
};

export function ElegirPerfil({
  perfiles, nombre, yaEligio = false, avisoInicial = null,
}: {
  perfiles: PerfilDisponible[];
  nombre: string | null;
  yaEligio?: boolean;
  /** Aviso ya traducido que trae el servidor --- por ejemplo si
   *  `claim_demo_sample()` falló antes de llegar aquí. Sin esto, esa falla se
   *  veía igual que la pantalla de un usuario nuevo. */
  avisoInicial?: string | null;
}) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [eligiendo, setEligiendo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(avisoInicial);

  async function elegir(id: string) {
    setEligiendo(id);
    setError(null);
    const { error } = await createSupabaseBrowserClient().rpc("elegir_perfil", { p_cohorte: id });
    if (error) {
      setEligiendo(null);
      return setError(mensajeHumano(error));
    }
    empezar(() => { router.replace("/dashboard"); router.refresh(); });
  }

  const porClase = perfiles.reduce<Record<string, PerfilDisponible[]>>((acc, p) => {
    (acc[p.clase] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--accent-strong)" }}>
        {yaEligio ? "Cambiar de perfil" : "Tu espacio está listo"}
      </p>
      <h1 className="balance mt-3 max-w-3xl text-4xl font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-5xl">
        {yaEligio ? <>Elige otro perfil<br />para explorar.</>
                  : <>{nombre ? `Bienvenido, ${nombre}.` : "Bienvenido."}<br />Elige por dónde empezar.</>}
      </h1>
      <p className="ink-2 mt-5 max-w-2xl text-lg leading-relaxed pretty">
        {yaEligio
          ? "Cada perfil se lee distinto. Comparar es la mejor forma de ver qué distingue Sapyria y qué no."
          : "Tu cuenta ya está activa —si entraste con Google, no hay ningún correo que confirmar—. Ahora escoge un perfil molecular para explorar: verás cómo Sapyria lo lee, qué observa y hasta dónde puede llegar."}
      </p>
      <p className="ink-3 mt-3 max-w-2xl text-sm leading-relaxed pretty">
        Los ocho perfiles proceden de estudios públicos reales procesados por este
        mismo sistema. Ninguna cifra está simulada. Podrás cambiar de perfil cuando
        quieras.
      </p>

      {error ? (
        <p role="status" className="mt-5 rounded-lg border-l-4 px-3 py-2.5 text-sm"
           style={{ borderColor: "var(--serious)", background: "var(--surface-1)" }}>
          {error}
        </p>
      ) : null}

      <div className="mt-10 grid gap-8">
        {Object.entries(porClase).map(([clase, lista]) => (
          <section key={clase}>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--ink-3)" }}>
              {clase} · {DESCRIPCION[clase] ?? ""}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((p) => {
                const cargando = eligiendo === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => elegir(p.id)}
                    disabled={Boolean(eligiendo) || pendiente}
                    className="group flex items-center justify-between gap-3 rounded-xl border p-5 text-left transition-colors hover:bg-[var(--surface-1)] disabled:opacity-60"
                    style={{ borderColor: "var(--border)", background: "var(--surface-0)" }}
                  >
                    <span>
                      <span className="block text-[17px] font-bold leading-tight tracking-[-0.01em]">
                        {p.titulo}
                      </span>
                      <span className="ink-3 mt-1 block font-mono text-[11px]">{p.id}</span>
                    </span>
                    {cargando
                      ? <LoaderCircle size={18} className="animate-spin" style={{ color: "var(--accent)" }} />
                      : <ArrowRight size={18} style={{ color: "var(--accent)" }} />}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
