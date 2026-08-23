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
  await supabase.rpc("claim_demo_sample");
  const { data: sample } = await supabase
    .from("samples").select("sample_code, received_at, status")
    .eq("user_id", user.id).eq("is_demo", true).limit(1).maybeSingle();

  const codigo = sample?.sample_code ?? demoResult.sampleCode;
  const recibida = sample?.received_at
    ? new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" })
        .format(new Date(sample.received_at))
    : demoResult.receivedAt;

  return (
    <Shell className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-md px-2.5 py-1 font-mono text-[10px] font-medium tracking-[0.12em]"
              style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}>
          DEMOSTRACIÓN · MUESTRA SINTÉTICA
        </span>
        <Link href="/login" className="ink-2 inline-flex items-center gap-1.5 text-sm font-medium">
          <LogOut size={15} /> Salir
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Mi muestra</Eyebrow>
          <h1 className="font-mono text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">{codigo}</h1>
          <p className="ink-2 mt-1 text-sm">Recibida el {recibida} · entorno de demostración</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
              style={{ background: "color-mix(in oklab, var(--good) 14%, transparent)", color: "var(--good)" }}>
          <Check size={15} /> {sample?.status === "ready" ? "Análisis completado" : demoResult.status}
        </span>
      </div>

      <ol className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {["Recibido", "Procesamiento", "Análisis", "Listo"].map((paso) => (
          <li key={paso} className="rounded-lg border px-3 py-2.5 text-sm"
              style={{ borderColor: "var(--border)" }}>
            <span className="flex items-center gap-2">
              <i aria-hidden className="size-2 rounded-full" style={{ background: "var(--good)" }} />
              {paso}
            </span>
          </li>
        ))}
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
    </Shell>
  );
}
