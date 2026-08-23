import type { Metadata } from "next";
import { Clausula, Destacado, DocumentoLegal, Lista } from "@/app/legal/piezas";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Qué datos trata Sapyria, dónde viven, quién puede verlos y cómo se ejercen los derechos que reconoce la Ley N.º 29733.",
  alternates: { canonical: "/privacidad" },
};

/**
 * Política de privacidad.
 *
 * Escrita contra lo que Sapyria **hace**, no contra una plantilla. Dos partes
 * deliberadamente separadas, porque confundirlas sería deshonesto en cualquiera
 * de las dos direcciones:
 *
 *   · **este sitio web** guarda una cuenta y nada más — correo, nombre y un
 *     código de muestra de demostración. Ni un dato biológico;
 *   · **el servicio de análisis** sí trata muestra biológica y datos derivados,
 *     y eso incluye una transferencia internacional que hay que declarar.
 *
 * El marco es el real y está documentado: Ley N.º 26842 (General de Salud),
 * Ley N.º 29733 (Protección de Datos Personales, incluido el flujo
 * transfronterizo) y Ley N.º 29571 (Código del Consumidor).
 */
export default function PrivacidadPage() {
  return (
    <DocumentoLegal
      eyebrow="Privacidad"
      titulo={<>Qué guardamos,<br />dónde vive y cómo se borra.</>}
      entradilla={
        <>
          Este documento describe el tratamiento de datos personales por Sapyria. Está
          escrito contra lo que el sistema hace, no contra una plantilla, y se actualiza
          cuando cambia el sistema.
        </>
      }
      actualizado="23 de agosto de 2026"
    >
      <Clausula n="1" titulo="Quién trata tus datos">
        <p>
          <strong>Sapyria</strong>, con domicilio en Lima, Perú, es responsable del
          tratamiento de los datos personales descritos en este documento. Punto de
          contacto para cualquier asunto de privacidad:{" "}
          <a href="mailto:hola@sapyria.com" className="font-medium"
             style={{ color: "var(--accent-strong)" }}>hola@sapyria.com</a>.
        </p>
      </Clausula>

      <Clausula n="2" titulo="Dos tratamientos distintos, y conviene no confundirlos">
        <p>
          Sapyria hace dos cosas muy diferentes, y los datos que trata en cada una no
          se parecen en nada:
        </p>
        <Lista items={[
          <><strong>Este sitio web.</strong> Guarda una cuenta: correo, nombre y un código
            de muestra <em>de demostración</em>. <strong>Ningún dato biológico.</strong></>,
          <><strong>El servicio de análisis molecular.</strong> Trata muestra biológica y
            los datos derivados de ella. Sólo aplica si has contratado ese servicio y has
            firmado su consentimiento informado, que es un documento aparte.</>,
        ]} />
        <Destacado>
          Crear una cuenta en esta web <strong>no inicia ningún análisis</strong> ni
          entrega ninguna muestra. Son cosas separadas y se contratan por separado.
        </Destacado>
      </Clausula>

      <Clausula n="3" titulo="Qué guarda este sitio web">
        <Lista items={[
          <><strong>Correo electrónico</strong> — identifica la cuenta y permite recuperarla.</>,
          <><strong>Nombre</strong> — el que escribes, o el que envía tu proveedor de
            identidad si accedes con él.</>,
          <><strong>Un código de muestra sintética</strong> (<span className="font-mono">DEMO-####</span>),
            su fecha y su estado. No procede de ninguna persona.</>,
          <><strong>La fecha de creación de la cuenta.</strong></>,
        ]} />
        <p>
          Tu contraseña no la guardamos ni la podemos leer: la gestiona el proveedor de
          identidad, cifrada.
        </p>
        <p>
          <strong>No hay analítica ni rastreadores.</strong> Sin Google Analytics, sin
          píxeles, sin cookies publicitarias. La única cookie es la de tu sesión, y
          caduca al salir.
        </p>
      </Clausula>

      <Clausula n="4" titulo="Datos genéticos y genómicos">
        <p>
          Si contratas el servicio de análisis, el tratamiento incluye la muestra
          biológica y los datos moleculares derivados de ella. Bajo la{" "}
          <strong>Ley N.º 29733</strong> son <strong>datos sensibles</strong>, y reciben
          ese tratamiento.
        </p>
        <Lista items={[
          <><strong>Base legal:</strong> tu <strong>consentimiento informado, previo,
            expreso y por escrito</strong>, específico para el análisis contratado. Sin
            él no se procesa nada.</>,
          <><strong>Finalidad:</strong> producir el informe técnico que has contratado.
            No se usan para publicidad, no se venden y no se ceden con fines comerciales.</>,
          <><strong>Transferencia internacional:</strong> la secuenciación la realiza un
            proveedor especializado <strong>fuera del Perú</strong>. Eso constituye un
            flujo transfronterizo de datos sensibles y se te informa antes de contratar,
            identificando al proveedor y el país de destino.</>,
          <><strong>Investigación:</strong> ningún dato tuyo se usa con fines de
            investigación salvo que lo autorices de forma separada y específica. Negarte
            no afecta al servicio que contrataste.</>,
        ]} />
        <Destacado>
          <strong>Los datos ómicos primarios no salen de la infraestructura
          controlada</strong> y nunca se publican en esta web. Lo que se publica aquí son
          resultados de estudios de <strong>acceso abierto</strong>, no de personas.
        </Destacado>
      </Clausula>

      <Clausula n="5" titulo="Dónde vive y quién puede verlo">
        <p>
          Las cuentas de este sitio se almacenan en una base gestionada por{" "}
          <strong>Supabase</strong>, alojada en Estados Unidos. El sitio lo sirve{" "}
          <strong>Vercel</strong>. Los correos de la plataforma los envía{" "}
          <strong>Resend</strong>.
        </p>
        <p>
          El aislamiento entre cuentas no depende de que el programa se porte bien:{" "}
          <strong>lo impone la propia base de datos, fila por fila</strong>. Una cuenta
          sólo puede leer su perfil y su muestra. El equipo de Sapyria accede a los
          registros para dar soporte y mantener el servicio.
        </p>
      </Clausula>

      <Clausula n="6" titulo="Cuánto tiempo se conserva">
        <Lista items={[
          <><strong>Cuenta web:</strong> mientras exista. Al eliminarla se van con ella el
            perfil y la muestra de demostración —es un borrado en cascada de la base, no
            una tarea manual que alguien pueda olvidar—.</>,
          <><strong>Datos del servicio de análisis:</strong> el plazo que fije el
            consentimiento informado y la normativa sanitaria aplicable, y no más.</>,
        ]} />
      </Clausula>

      <Clausula n="7" titulo="Tus derechos">
        <p>
          La <strong>Ley N.º 29733</strong> y su reglamento te reconocen los derechos de{" "}
          <strong>acceso, rectificación, cancelación y oposición</strong>, además de
          revocar el consentimiento cuando el tratamiento se base en él.
        </p>
        <p>
          Para ejercerlos, escribe a{" "}
          <a href="mailto:hola@sapyria.com" className="font-medium"
             style={{ color: "var(--accent-strong)" }}>hola@sapyria.com</a>{" "}
          desde la dirección de tu cuenta. Puedes pedir también una copia de lo que
          guardamos de ti, que en el caso de la web es la lista corta de la cláusula 3.
        </p>
        <p>
          Si consideras que no atendemos tu solicitud, puedes acudir a la{" "}
          <strong>Autoridad Nacional de Protección de Datos Personales</strong> del
          Ministerio de Justicia y Derechos Humanos.
        </p>
      </Clausula>

      <Clausula n="8" titulo="Seguridad">
        <p>
          Las credenciales viajan cifradas, el acceso a los registros está restringido al
          personal que lo necesita, y el aislamiento por cuenta lo aplica la base de
          datos. Ningún sistema es infalible: si ocurriera un incidente que afecte a tus
          datos, te lo comunicaríamos y lo notificaríamos a la autoridad conforme a la
          normativa aplicable.
        </p>
      </Clausula>

      <Clausula n="9" titulo="Menores de edad">
        <p>
          Esta web no está dirigida a menores de edad y no se crean cuentas para ellos.
          El análisis de una persona menor requiere el consentimiento de quien ejerza la
          patria potestad o tutela, gestionado fuera de esta web.
        </p>
      </Clausula>

      <Clausula n="10" titulo="Marco normativo y cambios">
        <p>
          El tratamiento descrito se rige por la <strong>Ley N.º 29733</strong> de
          Protección de Datos Personales y su reglamento, la{" "}
          <strong>Ley N.º 26842</strong> General de Salud y la{" "}
          <strong>Ley N.º 29571</strong>, Código de Protección y Defensa del Consumidor.
        </p>
        <p>
          Si este documento cambia, se actualiza la fecha del encabezado. Un cambio que
          afecte de forma sustancial al tratamiento de datos sensibles se comunica además
          por correo a las cuentas afectadas.
        </p>
      </Clausula>
    </DocumentoLegal>
  );
}
