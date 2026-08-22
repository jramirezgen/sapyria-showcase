import Link from "next/link";
import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return <main className="auth-page"><nav className="nav shell"><Brand /><Link href="/" className="text-link">← Volver al inicio</Link></nav><section className="auth-layout shell"><div><p className="section-label">ESPACIO PERSONAL</p><h1>Tu muestra,<br /><em>en contexto.</em></h1><p>Accede a una demostración privada de cómo Sapyria comunica una lectura molecular con su evidencia y sus limitaciones.</p><ul><li>Seguimiento claro de la muestra</li><li>Fenotipo molecular inferido</li><li>Sin resultados clínicos reales</li></ul></div><AuthForm /></section></main>;
}
