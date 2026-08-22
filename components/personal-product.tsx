import Link from "next/link";
import { ArrowRight, Check, Clock3, LockKeyhole, Sparkles } from "lucide-react";

const steps = [
  ["01", "Crea tu espacio", "Un lugar privado para seguir tu experiencia Sapyria."],
  ["02", "Sigue tu muestra", "Ves cada etapa con un lenguaje claro, no una cadena de archivos."],
  ["03", "Explora tu mapa", "Recibes una lectura molecular con evidencia y límites visibles."],
];

export function PersonalProduct() {
  return <section className="personal-product" id="experiencia"><div className="shell">
    <div className="product-heading"><div><p className="section-label">TU EXPERIENCIA SAPYRIA</p><h2>De una muestra<br /><em>a tu mapa molecular.</em></h2></div><p>No necesitas interpretar un archivo genómico. Sapyria organiza lo observado, lo que puede inferirse y aquello que sigue siendo incierto en un solo espacio personal.</p></div>
    <div className="product-flow">{steps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    <div className="portal-preview"><div className="preview-sidebar"><div className="preview-brand"><i /> SAPYRIA</div><small>MI ESPACIO</small><b>◈ &nbsp; Mi muestra</b><span>⌁ &nbsp; Mapa molecular</span><span>◇ &nbsp; Evidencia</span><div><LockKeyhole size={14} /><p>Tu información se presenta en un entorno personal.</p></div></div><div className="preview-content"><div className="preview-top"><div><small>MI MUESTRA</small><strong>SPY-2025-0002</strong><p><Clock3 size={13} /> Análisis en curso</p></div><span>Demo de producto</span></div><div className="preview-progress"><div><i className="complete" /><small>Recibido</small></div><div><i className="complete" /><small>Procesamiento</small></div><div><i className="active" /><small>Análisis</small></div><div><i /><small>Mapa listo</small></div></div><div className="preview-message"><Sparkles size={18} /><div><small>PRÓXIMAMENTE</small><strong>Tu mapa molecular estará disponible cuando el análisis termine.</strong><p>Verás señal observada, módulos moleculares, evidencia disponible y limitaciones.</p></div></div><div className="preview-cards"><article><small>SEÑAL OBSERVADA</small><b>En proceso</b><i /></article><article><small>INTERPRETACIÓN</small><b>Se construye con evidencia</b><i /></article><article><small>LÍMITES</small><b>Siempre visibles</b><i /></article></div></div></div>
    <div className="product-footer"><p><Check size={17} /> Sin promesas diagnósticas. <Check size={17} /> Evidencia y límites en cada lectura.</p><Link href="/login">Conocer mi espacio <ArrowRight size={16} /></Link></div>
  </div></section>;
}
