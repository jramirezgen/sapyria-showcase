import type { Metadata } from "next";
import { Clausula, Destacado, DocumentoLegal, Lista } from "@/app/legal/piezas";

export const metadata: Metadata = {
  title: "Términos del servicio",
  description:
    "Qué ofrece Sapyria y qué no, cómo se usa la plataforma y qué límites tiene el servicio de interpretación molecular.",
  alternates: { canonical: "/terminos" },
};

/**
 * Términos del servicio.
 *
 * La cláusula que gobierna a todas las demás es la 2: **Sapyria entrega
 * interpretación técnica y tamizaje molecular, no diagnóstico médico**. No es
 * una fórmula defensiva — es lo que el sistema puede sostener, y está medido.
 */
export default function TerminosPage() {
  return (
    <DocumentoLegal
      eyebrow="Términos del servicio"
      titulo={<>Qué ofrecemos,<br />y qué no.</>}
      entradilla={
        <>
          Estos términos regulan el uso de esta plataforma y del servicio de
          interpretación molecular de Sapyria. Al crear una cuenta o contratar un
          análisis, los aceptas.
        </>
      }
      actualizado="23 de agosto de 2026"
    >
      <Clausula n="1" titulo="Qué es esta plataforma">
        <p>
          Sapyria es una plataforma de <strong>interpretación molecular</strong>. A
          partir de una muestra biológica produce un informe técnico que describe cómo
          se organiza un estado molecular, con la evidencia que sostiene cada lectura y
          los límites de cada una.
        </p>
        <p>
          Esta web incluye además un <strong>explorador público</strong> construido
          sobre estudios de acceso abierto, y un espacio privado de demostración. Ambos
          son material de producto, no resultados de personas.
        </p>
      </Clausula>

      <Clausula n="2" titulo="Lo que Sapyria NO es">
        <Destacado>
          <strong>Sapyria no emite diagnósticos médicos.</strong> No indica, confirma ni
          descarta ninguna enfermedad, no prescribe tratamientos y no sustituye la
          evaluación de un profesional de la salud. Lo que entrega es{" "}
          <strong>tamizaje e interpretación técnica</strong>: reduce el espacio de
          búsqueda y dice con qué peso.
        </Destacado>
        <p>
          Ninguna decisión clínica debe tomarse únicamente a partir de un informe de
          Sapyria. Si algo del informe te preocupa, el paso siguiente es consultarlo con
          un profesional de la salud, que es quien puede integrarlo con tu historia
          clínica y con otras pruebas.
        </p>
      </Clausula>

      <Clausula n="3" titulo="Tu cuenta">
        <Lista items={[
          "Necesitas una dirección de correo válida y ser mayor de edad.",
          "Los datos que registres deben ser tuyos y exactos.",
          <>Eres responsable de mantener tu contraseña en secreto. Si sospechas que
            alguien accedió a tu cuenta, escríbenos y la cerramos.</>,
          <>Una cuenta es personal. No la compartas ni la cedas.</>,
        ]} />
        <p>
          Puedes eliminar tu cuenta cuando quieras escribiendo a{" "}
          <a href="mailto:info@sapyria.com" className="font-medium"
             style={{ color: "var(--accent-strong)" }}>info@sapyria.com</a>.
        </p>
      </Clausula>

      <Clausula n="4" titulo="Uso aceptable">
        <p>Al usar la plataforma te comprometes a no:</p>
        <Lista items={[
          "intentar acceder a datos de otras personas, ni a partes del sistema para las que no tienes autorización;",
          "extraer contenido de forma automatizada a un ritmo que degrade el servicio;",
          "presentar un informe de Sapyria como si fuera un diagnóstico médico, propio o ajeno;",
          "usar la plataforma para nada ilícito, ni para tratar datos de terceros sin su consentimiento.",
        ]} />
      </Clausula>

      <Clausula n="5" titulo="El análisis, cuando lo contratas">
        <Lista items={[
          <>El análisis se rige por su <strong>contrato y consentimiento informado</strong>,
            que son documentos aparte y prevalecen sobre estos términos en lo que les
            corresponda.</>,
          <>La calidad del resultado depende de la calidad de la muestra. Una muestra
            insuficiente o degradada puede impedir emitir informe; en ese caso te lo
            decimos, con el motivo.</>,
          <>El informe se entrega con su <strong>nivel de evidencia y sus límites</strong>.
            Una lectura sin respaldo suficiente se marca como tal y no se presenta como
            hallazgo.</>,
        ]} />
      </Clausula>

      <Clausula n="6" titulo="Límites del servicio">
        <p>
          La plataforma se ofrece <em>tal cual está</em> y en función de su
          disponibilidad. No garantizamos que esté libre de interrupciones ni que un
          análisis vaya a encontrar algo: <strong>que no se encuentre señal es un
          resultado legítimo</strong>, y se informa como tal.
        </p>
        <p>
          El estado de madurez de cada capa del sistema es público y está en{" "}
          <a href="/evidencia" className="underline">Evidencia</a>, incluido lo que se
          midió y <strong>no</strong> se encontró.
        </p>
      </Clausula>

      <Clausula n="7" titulo="Propiedad intelectual">
        <Lista items={[
          <><strong>De Sapyria:</strong> la plataforma, el pipeline de análisis, la
            metodología, la marca y los contenidos de este sitio.</>,
          <><strong>Tuyo:</strong> tu muestra y los datos derivados de ella. Sapyria los
            trata para prestarte el servicio; no adquiere su titularidad.</>,
          <><strong>De terceros:</strong> las bases de datos y estudios públicos que el
            sistema usa conservan la licencia de sus autores, que se respeta y se cita.</>,
        ]} />
      </Clausula>

      <Clausula n="8" titulo="Precio, pago y cancelación">
        <p>
          El explorador público y el espacio de demostración son gratuitos. Los servicios
          de análisis tienen el precio y las condiciones de cancelación que se indiquen
          al contratarlos, antes del pago. Si el análisis no puede completarse por causa
          atribuible a Sapyria, se te reembolsa.
        </p>
      </Clausula>

      <Clausula n="9" titulo="Suspensión">
        <p>
          Podemos suspender una cuenta que incumpla la cláusula 4, avisándote y
          explicando el motivo, salvo que la ley lo impida. Puedes responder y, si el
          incumplimiento se corrige, se restablece.
        </p>
      </Clausula>

      <Clausula n="10" titulo="Ley aplicable y resolución de conflictos">
        <p>
          Estos términos se rigen por la <strong>ley peruana</strong>, incluida la{" "}
          <strong>Ley N.º 29571</strong>, Código de Protección y Defensa del Consumidor.
        </p>
        <p>
          Si surge un desacuerdo, lo primero es escribirnos: la mayoría se resuelve
          hablando, y nos comprometemos a responder. Si no se resuelve así, las partes se
          someten a los <strong>jueces y tribunales de Lima, Perú</strong>. Como
          consumidor, conservas además el derecho de acudir al{" "}
          <strong>INDECOPI</strong>, y nada de estos términos lo limita.
        </p>
      </Clausula>

      <Clausula n="11" titulo="Cambios">
        <p>
          Si estos términos cambian, se actualiza la fecha del encabezado. Un cambio
          sustancial se comunica por correo a las cuentas activas antes de que entre en
          vigor.
        </p>
      </Clausula>
    </DocumentoLegal>
  );
}
