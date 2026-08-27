import type { Metadata } from "next";
import { MessageCircle, Mail, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { enlaceWhatsApp } from "@/lib/contacto";
import { Card, Eyebrow, H2, Nota, Section } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Conoce Sapyria, su plataforma de fenotipo molecular y las opciones para personas, instituciones e investigación.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <>
      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Contacto</Eyebrow>
          <h1 className="balance text-4xl font-extrabold leading-[1.03] tracking-[-0.04em] sm:text-6xl">Conversemos sobre<br /><span style={{ color: "var(--accent)" }}>lo que quieres explorar.</span></h1>
          <p className="ink-2 mt-6 max-w-2xl text-lg leading-relaxed pretty">Sapyria traduce datos ómicos complejos en una experiencia molecular comprensible, con evidencia y límites claros. Cuéntanos en qué punto estás y te orientaremos por el canal que prefieras.</p>
        </div>
      </Section>

      <Section tono="alt">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.4fr] lg:items-start">
          <div className="grid gap-4">
            <Card>
              <MessageCircle size={20} style={{ color: "var(--accent-strong)" }} />
              <h2 className="mt-4 text-lg font-bold">WhatsApp</h2>
              <p className="ink-2 mt-2 text-sm leading-relaxed">Una consulta breve sobre Sapyria, sin compartir datos sensibles.</p>
              <a href={enlaceWhatsApp()} target="_blank" rel="noreferrer" className="btn-marca mt-4 inline-flex rounded-lg px-4 py-2.5 text-sm font-semibold">Escribir por WhatsApp</a>
            </Card>
            <Card>
              <Mail size={20} style={{ color: "var(--accent-strong)" }} />
              <h2 className="mt-4 text-lg font-bold">Correo</h2>
              <p className="ink-2 mt-2 text-sm leading-relaxed"><a className="underline" href="mailto:info@sapyria.com">info@sapyria.com</a><br /><a className="underline" href="mailto:ventas@sapyria.com">ventas@sapyria.com</a></p>
            </Card>
            <Nota><strong>Atención continua.</strong> Puedes dejar tu solicitud en cualquier momento. No prometemos una hora fija de respuesta: confirmamos la recepción y retomamos por el canal elegido.</Nota>
          </div>
          <div>
            <Eyebrow>Solicitud de información</Eyebrow>
            <H2>Empieza con una conversación.</H2>
            <p className="ink-2 mt-3 mb-6 text-sm leading-relaxed">Este formulario no inicia un análisis ni reemplaza el consentimiento informado que requiere una muestra.</p>
            <ContactForm />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-start">
          <span className="grid size-11 place-items-center rounded-lg" style={{ background: "var(--surface-2)", color: "var(--accent-strong)" }}><ShieldCheck size={21} /></span>
          <div>
            <Eyebrow>Una conversación segura</Eyebrow>
            <H2>Primero entendemos el contexto; después, si aplica, se define el proceso.</H2>
            <p className="ink-2 mt-4 max-w-3xl leading-relaxed">La información comercial se mantiene separada de cualquier muestra o dato ómico. Sapyria no solicita archivos clínicos ni genéticos por este canal, y no formula conclusiones diagnósticas.</p>
          </div>
        </div>
      </Section>
    </>
  );
}
