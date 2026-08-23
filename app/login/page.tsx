import type { Metadata } from "next";
import { Card, Eyebrow, Nota, Shell } from "@/components/ui/primitives";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Espacio privado de demostración de Sapyria.",
};

/**
 * `auth_error` lo pone `/auth/callback` cuando el canje falla: un enlace caducado,
 * un `redirect_to` fuera de la lista blanca, una configuración a medias. Antes esos
 * tres casos terminaban en un `/login` en blanco, indistinguibles entre sí.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string; sesion?: string }>;
}) {
  const params = await searchParams;
  const aviso = params.auth_error
    ? params.auth_error
    : params.sesion === "cerrada"
      ? "Cerraste sesión. Tu espacio te espera cuando vuelvas."
      : null;

  return (
    <Shell className="py-14 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-start">
        <div>
          <Eyebrow>Espacio personal</Eyebrow>
          <h1 className="balance text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Tu muestra,<br />en contexto.
          </h1>
          <p className="ink-2 mt-6 max-w-lg text-lg leading-relaxed pretty">
            Una demostración privada de cómo Sapyria comunica una lectura molecular
            con su evidencia y sus limitaciones.
          </p>
          <ul className="ink-2 mt-6 space-y-2.5 text-sm">
            {[
              "Seguimiento del estado de la muestra",
              "El fenotipo en seis dimensiones, con su nivel de evidencia",
              "Los límites, antes que los resultados",
            ].map((x) => (
              <li key={x} className="flex gap-2.5">
                <i aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full"
                   style={{ background: "var(--accent)" }} />
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-8 max-w-lg">
            <Nota tono="aviso">
              <strong>La muestra de este espacio es sintética</strong> y lleva un código{" "}
              <span className="font-mono">DEMO-####</span> que no se puede confundir con
              un caso real. Sapyria no publica resultados clínicos en esta web.
            </Nota>
          </div>
        </div>
        <Card className="lg:sticky lg:top-24">
          <AuthForm avisoInicial={aviso} />
        </Card>
      </div>
    </Shell>
  );
}
