import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LogOut, Repeat } from "lucide-react";
import { Card, EvidenceBadge, Eyebrow, Nota, Shell } from "@/components/ui/primitives";
import { ModuloCard } from "@/components/modulo-card";
import { ElegirPerfil } from "@/components/elegir-perfil";
import { demoResult } from "@/lib/demo";
import { cohorte, cohortes } from "@/lib/showcase";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * El espacio personal.
 *
 * Dos estados, y el primero es la entrada al producto:
 *
 *   · **sin perfil elegido** → pantalla de bienvenida y elección. Responde sola
 *     a «¿qué ha pasado?» de quien acaba de entrar con Google y no recibió
 *     ningún correo — porque con Google no hay ninguno que recibir.
 *   · **con perfil** → el informe, en tres capas: lo que se lee de un vistazo,
 *     lo que significa, y el dato con su límite.
 *
 * Antes esto encabezaba con un código `DEMO-####` y gritaba «MUESTRA SINTÉTICA»
 * en cada bloque. Tenía que gritarlo: las cifras estaban inventadas. Ahora salen
 * de una cohorte pública real, así que la procedencia se declara **una vez** y
 * con dignidad, no en cada sección.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cambiar?: string }>;
}) {
  const quiereCambiar = (await searchParams).cambiar === "1";
  if (!isSupabaseConfigured) redirect("/login?error=setup");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.rpc("claim_demo_sample");

  // La lista de perfiles sale del JSON del pipeline, no de la base: es el mismo
  // dato que ya sirve el explorador público y así la pantalla de bienvenida
  // funciona aunque la base aún no tenga la lista blanca. En la base, esa lista
  // existe sólo como clave foránea --- para que el navegador no pueda escribir un
  // identificador que no sea de los ocho.
  const [{ data: perfilCuenta }, { data: muestra }, disponibles] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("samples").select("perfil, received_at").eq("user_id", user.id).eq("is_demo", true).maybeSingle(),
    cohortes(),
  ]);

  const nombreCompleto = perfilCuenta?.full_name?.trim() || user.email?.split("@")[0] || null;
  const nombre = nombreCompleto ? nombreCompleto.split(" ")[0] : null;

  const salir = (
    <form action="/auth/signout" method="post">
      <button type="submit" className="ink-2 inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-80">
        <LogOut size={15} /> Salir
      </button>
    </form>
  );

  // ── Sin perfil: la bienvenida ────────────────────────────────────────────
  if (!muestra?.perfil || quiereCambiar) {
    return (
      <Shell className="py-10 sm:py-16">
        <div className="flex justify-end">{salir}</div>
        <div className="mt-4">
          <ElegirPerfil
            perfiles={disponibles.map((c) => ({ id: c.id, titulo: c.titulo, clase: c.clase }))}
            nombre={nombre}
            yaEligio={Boolean(muestra?.perfil)}
          />
        </div>
      </Shell>
    );
  }

  // ── Con perfil: el informe ───────────────────────────────────────────────
  const c = await cohorte(muestra.perfil);
  const de = c.expresion_diferencial;
  const activos = c.modulos.filter((m) => m.responde).length;
  const pct = de.fraccion_significativa != null ? (de.fraccion_significativa * 100).toFixed(1) : null;

  return (
    <Shell className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ink-3 text-sm">{nombre ? `Hola, ${nombre}` : "Tu espacio"}</p>
        {salir}
      </div>

      {/* ── Nivel 1: el resumen que se entiende sin saber biología ────────── */}
      <div className="mt-6">
        <Eyebrow>Tu perfil de exploración</Eyebrow>
        <h1 className="balance mt-2 max-w-3xl text-4xl font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-5xl">
          {c.titulo}
        </h1>
        <p className="ink-2 mt-4 max-w-2xl text-lg leading-relaxed pretty">
          De {de.universo.toLocaleString("es")} reguladores medidos en sangre,{" "}
          <strong>{de.significativos.toLocaleString("es")} se apartan</strong> de lo esperable
          {pct ? ` — un ${pct} % del total` : ""}. {activos > 0
            ? <>Y <strong>{activos} de {c.modulos.length} conjuntos biológicos</strong> se movieron de forma coordinada.</>
            : <>Ningún conjunto biológico se movió de forma coordinada.</>}
        </p>
        <p className="ink-3 mt-3 max-w-2xl text-sm leading-relaxed pretty">
          Perfil construido sobre el estudio público <span className="font-mono">{c.id}</span> ({c.contraste}),
          procesado por este mismo sistema. Ninguna cifra está simulada.{" "}
          <Link href="/dashboard?cambiar=1" className="font-medium underline">Cambiar de perfil</Link>
        </p>
      </div>

      {/* ── Nivel 2: los conjuntos, explorables ───────────────────────────── */}
      <section className="mt-12">
        <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Tus conjuntos biológicos</h2>
        <p className="ink-2 mt-2 max-w-2xl text-sm leading-relaxed pretty">
          Cada uno agrupa reguladores que trabajan en lo mismo. Despliega para ver qué
          significa y cuál es su límite.
        </p>
        <div className="mt-5 grid gap-3">
          {c.modulos.map((m) => (
            <ModuloCard key={m.modulo} d={{ ...m, percentil_vs_sorteados: m.percentil_vs_sorteados ?? 0 }} />
          ))}
        </div>
      </section>

      {/* ── Las seis dimensiones, como marco ──────────────────────────────── */}
      <section className="mt-12">
        <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Cómo se lee un perfil</h2>
        <p className="ink-2 mt-2 max-w-2xl text-sm leading-relaxed pretty">
          Sapyria no resume tu biología en una nota. La describe en seis dimensiones, y
          cada una viaja con el peso que la sostiene.
        </p>
        <Card className="mt-5">
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

      {/* ── Nivel 3 y límites ─────────────────────────────────────────────── */}
      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Qué sostiene cada lectura</h2>
          <Card className="mt-4">
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
                  style={{ color: "var(--accent-strong)" }}>
              Ver la validación completa <ArrowRight size={15} />
            </Link>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-[-0.02em]">Hasta dónde llega</h2>
          <div className="mt-4 grid gap-4">
            <Nota tono="aviso">
              <ul className="space-y-1.5">
                {demoResult.limitaciones.map((l) => <li key={l}>· {l}</li>)}
              </ul>
            </Nota>
            <Card>
              <h3 className="flex items-center gap-2 text-base font-bold">
                <Repeat size={17} style={{ color: "var(--accent)" }} /> Explora otro perfil
              </h3>
              <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
                Cada uno de los ocho perfiles se lee distinto. Comparar es la mejor forma
                de ver qué distingue Sapyria y qué no.
              </p>
              <Link href="/dashboard?cambiar=1" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "var(--accent-strong)" }}>
                Cambiar de perfil <ArrowRight size={15} />
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </Shell>
  );
}
