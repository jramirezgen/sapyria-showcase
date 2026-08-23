import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, LogOut } from "lucide-react";
import { Card, EvidenceBadge, Eyebrow, Nota, Shell } from "@/components/ui/primitives";
import { demoResult } from "@/lib/demo";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured) redirect("/login?error=setup");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Idempotente y forzado por `auth.uid()` en el servidor: crea únicamente una
  // muestra sintética aislada para esta cuenta.
  //
  // El error de esta llamada SE MIRA. Antes se descartaba, y como el panel tenía
  // un código de reserva que pintar, una base sin ni una tabla se veía
  // exactamente igual que un aprovisionamiento correcto.
  // El nombre YA estaba en la base: el trigger lo copia de `raw_user_meta_data`
  // (Google lo manda como `name`, el formulario como `full_name`). Lo que faltaba
  // era que la interfaz lo pidiera --- era un fallo de presentación, no de datos.
  const { data: perfil } = await supabase
    .from("profiles").select("full_name").eq("id", user.id).maybeSingle();

  const { error: errorRpc } = await supabase.rpc("claim_demo_sample");
  const { data: sample, error: errorConsulta } = await supabase
    .from("samples").select("sample_code, received_at, status")
    .eq("user_id", user.id).eq("is_demo", true).limit(1).maybeSingle();

  const fallo = errorRpc ?? errorConsulta;
  const aprovisionada = Boolean(sample?.sample_code);

  // Si no hay nombre, el nombre local del correo. Nunca se inventa uno.
  const nombre = perfil?.full_name?.trim() || user.email?.split("@")[0] || null;
  const saludo = nombre ? nombre.split(" ")[0] : null;

  /**
   * Los cuatro pasos son el `enum sample_status` del esquema, en orden. Antes se
   * pintaban los cuatro en verde SIEMPRE, sin mirar el estado: una muestra recién
   * recibida se anunciaba como analizada. Un indicador que no puede decir «todavía
   * no» no es un indicador.
   */
  const PASOS = [
    { clave: "received", texto: "Recibida" },
    { clave: "processing", texto: "Procesamiento" },
    { clave: "analysis", texto: "Análisis" },
    { clave: "ready", texto: "Listo" },
  ] as const;
  const estado = sample?.status ?? null;
  const alcanzado = estado ? PASOS.findIndex((p) => p.clave === estado) : -1;

  const codigo = sample?.sample_code ?? null;
  const recibida = sample?.received_at
    ? new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" })
        .format(new Date(sample.received_at))
    : null;

  return (
    <Shell className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.12em]"
                style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}>
            DEMOSTRACIÓN · MUESTRA SINTÉTICA
          </span>
          {saludo ? <span className="ink-2 text-sm">Hola, {saludo}</span> : null}
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="ink-2 inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-80">
            <LogOut size={15} /> Salir
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Mi muestra</Eyebrow>
          {codigo ? (
            <>
              <h1 className="font-mono text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">{codigo}</h1>
              <p className="ink-2 mt-1 text-sm">Recibida el {recibida} · entorno de demostración</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Aún sin asignar</h1>
              <p className="ink-2 mt-1 text-sm">Tu cuenta está activa; falta el aprovisionamiento.</p>
            </>
          )}
        </div>
        {estado === "ready" ? (
          <span className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                style={{ background: "color-mix(in oklab, var(--good) 14%, transparent)", color: "var(--good)" }}>
            <Check size={15} /> Análisis completado
          </span>
        ) : null}
      </div>

      {aprovisionada ? null : (
        <div className="mt-8 grid gap-4">
          <Nota tono="aviso">
            <strong>Tu espacio todavía no tiene muestra asignada.</strong>
            <p className="mt-1.5">
              La sesión es válida y tu cuenta existe: lo que falta es el aprovisionamiento.
              Hasta que haya una muestra tuya <strong>no mostramos ningún fenotipo</strong>,
              ni conjuntos ni evidencia — ni siquiera de demostración. Una lectura sin
              muestra detrás no es una lectura, y aquí no se enseña como si lo fuera.
            </p>
            {fallo ? (
              <p className="ink-3 mt-2 font-mono text-xs">Detalle técnico: {fallo.message}</p>
            ) : null}
          </Nota>
          <Card>
            <h2 className="text-base font-bold">Mientras tanto</h2>
            <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
              La demo pública sí tiene datos reales: ocho cohortes de acceso abierto
              procesadas por el mismo pipeline, con sus cifras y figuras.
            </p>
            <Link href="/demo" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--accent)" }}>
              Abrir la demo pública <ArrowRight size={15} />
            </Link>
          </Card>
        </div>
      )}

      {aprovisionada ? (
        <>
      <ol className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PASOS.map((paso, i) => {
          const hecho = alcanzado >= 0 && i <= alcanzado;
          return (
            <li key={paso.clave} aria-current={i === alcanzado ? "step" : undefined}
                className="rounded-lg border px-3 py-2.5 text-sm"
                style={{ borderColor: "var(--border)", background: hecho ? "var(--surface-1)" : "transparent" }}>
              <span className="flex items-center gap-2" style={hecho ? undefined : { color: "var(--ink-3)" }}>
                <i aria-hidden className="size-2 rounded-full"
                   style={{ background: hecho ? "var(--good)" : "var(--ink-3)", opacity: hecho ? 1 : 0.45 }} />
                {paso.texto}
                <span className="sr-only">{hecho ? " (completado)" : " (pendiente)"}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <section className="mt-10">
        <Eyebrow>Fenotipo molecular</Eyebrow>
        <Card className="mt-3">
          <div className="grid gap-3">
            {demoResult.fenotipo.map((f) => (
              <div key={f.dimension}
                   className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-3 last:border-0 last:pb-0"
                   style={{ borderColor: "var(--border)" }}>
                <strong className="min-w-[11rem] text-sm">{f.dimension}</strong>
                <EvidenceBadge nivel={f.nivel} />
                <span className="ink-2 flex-1 text-sm leading-snug pretty">{f.detalle}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <Eyebrow>Conjuntos moleculares</Eyebrow>
          <Card className="mt-3">
            <div className="grid gap-3">
              {demoResult.modulos.map((m) => (
                <div key={m.nombre}
                     className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b pb-3 last:border-0 last:pb-0"
                     style={{ borderColor: "var(--border)" }}>
                  <strong className="flex-1 text-sm">{m.nombre}</strong>
                  <span className="ink-2 text-sm">{m.coordinacion}</span>
                  <EvidenceBadge nivel={m.nivel} />
                </div>
              ))}
            </div>
            <p className="ink-3 mt-4 text-xs leading-relaxed pretty">
              Sin puntaje a propósito. El solape entre estos conjuntos es del 55–60 %,
              así que se encienden juntos: que uno se mueva no dice cuál es la causa.
            </p>
          </Card>
        </div>

        <div>
          <Eyebrow>Cómo se clasifica la evidencia</Eyebrow>
          <Card className="mt-3">
            <div className="grid gap-3">
              {demoResult.evidencia.map((e) => (
                <div key={e.nivel} className="border-b pb-3 last:border-0 last:pb-0"
                     style={{ borderColor: "var(--border)" }}>
                  <span className="font-mono text-[11px] font-semibold tracking-[0.1em]">{e.nivel}</span>
                  <p className="ink-2 mt-1 text-sm leading-snug pretty">{e.criterio}</p>
                  <p className="ink-3 mt-0.5 text-xs">{e.nota}</p>
                </div>
              ))}
            </div>
            <Link href="/evidencia" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--accent)" }}>
              Ver la validación completa <ArrowRight size={15} />
            </Link>
          </Card>
        </div>
      </section>

      <section className="mt-8 grid gap-4">
        <Nota tono="aviso">
          <strong>Límites de esta lectura.</strong>
          <ul className="mt-2 space-y-1.5">
            {demoResult.limitaciones.map((l) => <li key={l}>· {l}</li>)}
          </ul>
        </Nota>
        <Card>
          <h2 className="text-base font-bold">¿Quieres ver esto sobre datos reales?</h2>
          <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
            La demo pública corre sobre ocho cohortes de acceso abierto procesadas por
            el mismo pipeline, con sus cifras y figuras reales.
          </p>
          <Link href="/demo" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "var(--accent)" }}>
            Abrir la demo pública <ArrowRight size={15} />
          </Link>
        </Card>
      </section>
        </>
      ) : null}

    </Shell>
  );
}
