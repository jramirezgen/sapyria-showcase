"use client";

import { useState } from "react";
import { ExternalLink, Info, Microscope } from "lucide-react";

const cohorts = [
  { id: "GSE46579", context: "Neurológico", samples: "70 muestras", label: "Alzheimer vs. control · sangre total", figure: "/research/gse46579-pca.svg" },
  { id: "GSE228540", context: "Inmune / infeccioso", samples: "29 muestras", label: "Sepsis vs. sano · sangre total", figure: "/research/gse228540-pca.svg" },
  { id: "GSE97901", context: "Oncología / hematología", samples: "39 muestras", label: "Cáncer de próstata · sangre total", figure: "/research/gse97901-pca.svg" },
];

export function PublicResearch() {
  const [selected, setSelected] = useState(0);
  const cohort = cohorts[selected];
  return <section className="research" id="investigacion"><div className="shell">
    <div className="research-heading"><div><p className="section-label">INVESTIGACIÓN PÚBLICA</p><h2>La plataforma se prueba<br /><em>contra datos abiertos.</em></h2></div><p>327 muestras públicas de 7 cohortes GEO fueron reprocesadas por el mismo workflow canónico. Los análisis de cohorte acompañan la validación; no alimentan la inferencia individual.</p></div>
    <div className="research-layout"><div className="cohort-list">{cohorts.map((item, index) => <button key={item.id} onClick={() => setSelected(index)} className={index === selected ? "selected" : ""}><span>{item.id}</span><strong>{item.context}</strong><small>{item.samples}</small></button>)}</div><article className="research-figure"><div className="figure-meta"><span>GEO {cohort.id}</span><span>{cohort.samples}</span></div><img src={cohort.figure} alt="PCA exploratorio de la cohorte pública" /><div className="figure-caption"><div><strong>PCA exploratorio de la cohorte pública</strong><p>{cohort.label}</p></div><a href={`https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=${cohort.id}`} target="_blank" rel="noreferrer">Ver fuente <ExternalLink size={14} /></a></div></article></div>
    <div className="research-rules"><div><Microscope size={19} /><strong>Qué se mide</strong><p>Abundancia relativa de small RNAs y perfiles moleculares por muestra.</p></div><div><Info size={19} /><strong>Qué muestra la figura</strong><p>Exploración de estructura de cohorte y comparación diferencial a nivel de grupo.</p></div><div><Info size={19} /><strong>Qué no afirma</strong><p>Las etiquetas de GEO son contexto público, no una inferencia ni diagnóstico de Sapyria.</p></div></div>
  </div></section>;
}
