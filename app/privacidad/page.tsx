import type { Metadata } from "next";
import Link from "next/link";
import { Card, Eyebrow, Nota, Shell } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Qué datos guarda Sapyria en esta web, dónde viven y cómo se borran.",
};

/**
 * El aviso de privacidad.
 *
 * La web pide correo y nombre para crear una cuenta, y no había ninguno. No es
 * un trámite: es la primera pregunta razonable de quien va a escribir su correo
 * en un formulario.
 *
 * Está escrito contra lo que el código HACE, no contra una plantilla: los campos
 * salen de `components/auth-form.tsx`, las columnas de
 * `supabase/003_esquema_demo.sql`, y la ausencia de analítica se comprobó
 * buscándola en el repositorio.
 */
export default function PrivacidadPage() {
  return (
    <Shell className="py-14 sm:py-20">
      <Eyebrow>Privacidad</Eyebrow>
      <h1 className="balance mt-2 max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-5xl">
        Qué guardamos, dónde vive y cómo se borra.
      </h1>
      <p className="ink-2 mt-6 max-w-2xl text-lg leading-relaxed pretty">
        Este aviso describe esta web. Está escrito contra lo que el código hace, no
        contra una plantilla, y se actualiza cuando cambia el código.
      </p>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-bold">Lo que se guarda</h2>
          <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
            Sólo si creas una cuenta. Navegar por la web no guarda nada tuyo.
          </p>
          <ul className="ink-2 mt-3 space-y-2 text-sm">
            <li>· <strong>Tu correo electrónico</strong> — para identificar la cuenta.</li>
            <li>· <strong>Tu nombre</strong>, el que escribas o el que envíe Google si entras con él.</li>
            <li>· <strong>Un código de muestra sintética</strong> (<span className="font-mono">DEMO-####</span>),
              su fecha y su estado. No procede de ninguna persona.</li>
            <li>· La fecha en que se creó la cuenta.</li>
          </ul>
          <p className="ink-3 mt-3 text-xs leading-relaxed">
            Tu contraseña no la guardamos nosotros ni la podemos leer: la gestiona el
            proveedor de identidad, cifrada.
          </p>
        </Card>

        <Card>
          <h2 className="text-base font-bold">Lo que NO se guarda</h2>
          <ul className="ink-2 mt-3 space-y-2 text-sm">
            <li>· <strong>Ningún dato ómico ni genómico.</strong> Ni FASTQ, ni BAM, ni CRAM, ni VCF.
              Esa frontera es del diseño del sistema, no una promesa.</li>
            <li>· <strong>Ningún dato clínico ni de salud.</strong></li>
            <li>· <strong>Ninguna analítica ni rastreador.</strong> No hay Google Analytics, ni
              píxeles, ni cookies publicitarias. La única cookie es la de tu sesión,
              y desaparece al salir.</li>
            <li>· Nada se vende ni se cede a terceros con fines comerciales.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-base font-bold">Dónde vive, y quién puede verlo</h2>
          <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
            En una base de datos gestionada por <strong>Supabase</strong>, alojada en
            Estados Unidos (región <span className="font-mono">us-east-2</span>). El correo de
            confirmación lo envía <strong>Resend</strong>. La web la sirve <strong>Vercel</strong>.
          </p>
          <p className="ink-2 mt-3 text-sm leading-relaxed pretty">
            El aislamiento entre cuentas no depende de que el programa se porte bien:
            lo impone la propia base de datos, fila por fila. Una cuenta sólo puede
            leer su perfil y su muestra. El equipo de Sapyria puede consultar los
            registros para dar soporte y mantener el servicio.
          </p>
        </Card>

        <Card>
          <h2 className="text-base font-bold">Borrar tu cuenta</h2>
          <p className="ink-2 mt-2 text-sm leading-relaxed pretty">
            Escribe a{" "}
            <a href="mailto:hola@sapyria.com" className="font-semibold"
               style={{ color: "var(--accent)" }}>hola@sapyria.com</a>{" "}
            desde la dirección de la cuenta. Al borrarla se van con ella el perfil y la
            muestra de demostración: es un borrado en cascada de la base, no una tarea
            manual que alguien pueda olvidar.
          </p>
          <p className="ink-2 mt-3 text-sm leading-relaxed pretty">
            Puedes pedir también una copia de lo que guardamos de ti, que es la lista
            corta de arriba.
          </p>
        </Card>
      </div>

      <div className="mt-8 grid gap-4">
        <Nota tono="aviso">
          <strong>Esta web es una demostración de producto.</strong> No emite
          diagnósticos, no valida condiciones clínicas y no debe usarse para tomar
          decisiones médicas. Lo que muestra el espacio privado es una muestra
          sintética declarada, no un resultado tuyo.
        </Nota>
        <p className="ink-3 text-xs">
          Última actualización: 23 de agosto de 2026 · ¿Dudas?{" "}
          <a href="mailto:hola@sapyria.com" className="underline">hola@sapyria.com</a> ·{" "}
          <Link href="/sobre" className="underline">Sobre Sapyria</Link>
        </p>
      </div>
    </Shell>
  );
}
