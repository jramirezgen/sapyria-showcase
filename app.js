const fallbackCases = [
  { id: "SR-014", title: "Perfil regulatorio exploratorio", assay: "small_rna_seq", status: "Hipótesis sustentada", summary: "Una firma coordinada de small RNAs orienta la exploración hacia rutas de neuroinflamación.", signal: "Señal regulatoria consistente", evidence: "Recuperación de hipótesis con evidencia pública; interpretación phenotype-blind.", metric_label: "Cobertura de señal", metric_value: "0.81", metric_detail: "coherencia multi-miRNA", stage: 2 },
  { id: "WE-028", title: "Priorización de variante codificante", assay: "wes", status: "Revisión técnica", summary: "El recorrido conserva variantes relevantes y presenta contexto de calidad, frecuencia y evidencia.", signal: "2 hallazgos para revisar", evidence: "Pipeline técnicamente operativo; cualquier conclusión requiere revisión clínica independiente.", metric_label: "Cobertura objetivo", metric_value: "98.4%", metric_detail: "bases objetivo ≥20×", stage: 3 },
  { id: "WG-006", title: "Piloto de amplitud genómica", assay: "wgs", status: "Diseño exploratorio", summary: "Un piloto orientado a SNV e indels germinales, con procedencia reproducible de extremo a extremo.", signal: "SNV / indel germinal", evidence: "Arquitectura de piloto: no declara soporte para SV, CNV, MT, repeticiones ni mosaicismo.", metric_label: "Profundidad planificada", metric_value: "30×", metric_detail: "singleton de referencia", stage: 1 },
  { id: "SR-021", title: "Comparación de firma molecular", assay: "small_rna_seq", status: "Exploración de cohorte", summary: "La interfaz permite comparar una señal individual contra una cohorte de referencia sintética.", signal: "Concordancia de patrón", evidence: "Tamizaje investigacional; no biomarcador clínicamente validado.", metric_label: "Genes de ruta", metric_value: "14", metric_detail: "hipótesis relacionadas", stage: 2 },
];

const labels = { small_rna_seq: "small RNA-seq", wes: "WES", wgs: "WGS" };
let cases = fallbackCases;
let selectedId = fallbackCases[0].id;
let filter = "all";

async function loadCases() {
  const config = window.SAPYRIA_SHOWCASE_CONFIG;
  if (!config?.url || !config?.anonKey) return setSource("Cohorte sintética local");
  try {
    const response = await fetch(`${config.url}/rest/v1/${config.table || "showcase_cases"}?select=*&is_public_demo=eq.true&order=updated_at.desc`, {
      headers: { apikey: config.anonKey, Authorization: `Bearer ${config.anonKey}` },
    });
    if (!response.ok) throw new Error(`Supabase ${response.status}`);
    const remote = await response.json();
    if (!Array.isArray(remote) || !remote.length) throw new Error("Empty demo dataset");
    cases = remote;
    selectedId = cases[0].id;
    setSource("Cohorte demo sincronizada · Supabase");
  } catch (_) { setSource("Cohorte sintética local · Supabase no disponible"); }
}

function setSource(value) { document.querySelector("#data-source").textContent = value; }
function visibleCases() { return filter === "all" ? cases : cases.filter((item) => item.assay === filter); }
function render() {
  const visible = visibleCases();
  if (!visible.some((item) => item.id === selectedId)) selectedId = visible[0]?.id;
  const selected = cases.find((item) => item.id === selectedId);
  document.querySelector("#case-list").innerHTML = visible.map((item) => `
    <button class="case-card ${item.id === selectedId ? "selected" : ""}" data-case="${item.id}">
      <span class="case-id">${item.id}</span><span class="case-assay">${labels[item.assay]}</span>
      <strong>${item.title}</strong><small>${item.status}</small><i></i>
    </button>`).join("") || "<p class=empty>No hay muestras en esta capa.</p>";
  document.querySelectorAll("[data-case]").forEach((button) => button.addEventListener("click", () => { selectedId = button.dataset.case; render(); }));
  document.querySelector("#case-detail").innerHTML = selected ? `
    <div class="detail-top"><span>${labels[selected.assay]} · ${selected.id}</span><span class="status">${selected.status}</span></div>
    <h3>${selected.title}</h3><p class="detail-summary">${selected.summary}</p>
    <div class="signal-card"><span>SEÑAL DESTACADA</span><strong>${selected.signal}</strong><div class="wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="detail-grid"><div><span>MÉTRICA</span><b>${selected.metric_value}</b><small>${selected.metric_label} · ${selected.metric_detail}</small></div><div><span>MADUREZ</span><b>0${selected.stage} / 04</b><small>evidencia y trazabilidad técnica</small></div></div>
    <div class="evidence"><span>NOTA DE ALCANCE</span><p>${selected.evidence}</p></div>` : "";
}

document.querySelectorAll(".filter").forEach((button) => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  document.querySelectorAll(".filter").forEach((item) => { const active = item === button; item.classList.toggle("active", active); item.setAttribute("aria-selected", active); });
  render();
}));
loadCases().finally(render);
