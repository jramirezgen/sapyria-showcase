import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, CircleAlert, Clock3, Dna, FileText, LogOut, Microscope, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { demoResult } from "@/lib/demo";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured) redirect("/login?error=setup");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // Provisioning is idempotent and server-enforced by auth.uid(); it creates
  // only an isolated synthetic result for this authenticated demo account.
  await supabase.rpc("claim_demo_sample");
  const { data: sample } = await supabase.from("samples").select("id, sample_code, received_at, status").eq("user_id", user.id).eq("is_demo", true).limit(1).maybeSingle();
  const { data: storedResult } = sample ? await supabase.from("demo_results").select("phenotype_summary").eq("sample_id", sample.id).maybeSingle() : { data: null };
  const sampleCode = sample?.sample_code ?? demoResult.sampleCode;
  const receivedAt = sample?.received_at ? new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(sample.received_at)) : demoResult.receivedAt;
  const status = sample?.status === "ready" ? "Análisis completado" : demoResult.status;
  const phenotype = storedResult?.phenotype_summary ?? demoResult.phenotype;
  return <main className="dashboard"><header className="dashboard-nav"><Brand /><div><span className="demo-chip">DEMO DE PRODUCTO</span><Link href="/login" className="logout"><LogOut size={15} /> Salir</Link></div></header><div className="dashboard-layout"><aside><p>MI ESPACIO</p><a className="side-active" href="#muestra"><Dna size={17} /> Mi muestra</a><a href="#evidencia"><Microscope size={17} /> Evidencia</a><a href="#alcance"><ShieldCheck size={17} /> Alcance</a><div className="help"><strong>¿Tienes una pregunta?</strong><p>La lectura molecular se explora siempre dentro de sus límites de evidencia.</p><a href="mailto:hola@sapyria.com">Hablar con Sapyria <ArrowRight size={13} /></a></div></aside><section className="dashboard-content" id="muestra"><div className="dashboard-heading"><div><p className="section-label">MI MUESTRA</p><h1>{sampleCode}</h1><p>Recibida el {receivedAt} · Entorno de demostración</p></div><div className="completed"><Check size={16} /> {status}</div></div><div className="progress"><div><span>Recibido</span><i className="done" /></div><div><span>Procesamiento</span><i className="done" /></div><div><span>Análisis</span><i className="done" /></div><div><span>Listo</span><i className="done" /></div></div><article className="phenotype-summary"><span>FENOTIPO MOLECULAR INFERIDO</span><h2>{phenotype}</h2><p>Esta lectura integra señales de demostración y no es un diagnóstico, pronóstico ni recomendación clínica.</p></article><div className="result-grid"><article><div className="card-icon"><Dna size={18} /></div><span>COMPOSICIÓN CELULAR</span>{demoResult.cellular.map(([name, status, tone]) => <div className="status-row" key={name}><b>{name}</b><small className={tone}>{status}</small></div>)}</article><article><div className="card-icon"><Microscope size={18} /></div><span>ESTADO REGULATORIO</span><h3>Señal coordinada</h3><p>Patrón demostrativo compatible con actividad regulatoria que merece exploración contextual.</p><div className="mini-wave">{Array.from({ length: 12 }).map((_, i) => <i key={i} />)}</div></article></div><section className="modules"><div className="section-title"><div><p className="section-label">MÓDULOS MOLECULARES</p><h2>Señales que componen la lectura</h2></div><span>3 módulos</span></div>{demoResult.modules.map(([name, state, score]) => <article key={name}><div><strong>{name}</strong><p>{state}</p></div><div className="module-bar"><i style={{ width: `${Number(score) * 100}%` }} /></div><b>{score}</b><ArrowRight size={16} /></article>)}</section><section className="dashboard-evidence" id="evidencia"><FileText size={20} /><div><p className="section-label">EVIDENCIA DISPONIBLE</p><h2>Qué sostiene esta interpretación</h2><p>La demo diferencia de forma explícita entre señal observada, hipótesis derivada y evidencia disponible. Ninguna de estas capas equivale a confirmación clínica.</p><Link href="#alcance">Ver limitaciones <ArrowRight size={15} /></Link></div></section><section className="limitations" id="alcance"><CircleAlert size={20} /><div><h2>Limitaciones importantes</h2><p>Este espacio muestra resultados sintéticos. Sapyria no declara diagnóstico ni valida una condición clínica desde esta interfaz. Los análisis pesados y datos primarios permanecen en infraestructura local controlada.</p></div></section></section></div></main>;
}
