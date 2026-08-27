"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PREFERENCIAS_CONTACTO, SERVICIOS_INTERES, TIPOS_INTERESADO } from "@/lib/contacto";

type Estado = "idle" | "sending" | "success" | "error";

const campo = "mt-1 w-full rounded-lg border bg-[var(--surface-0)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]";

export function ContactForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [mensaje, setMensaje] = useState("");

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("sending");
    setMensaje("");

    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const respuesta = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await respuesta.json()) as { error?: string };
      if (!respuesta.ok) throw new Error(data.error || "No pudimos registrar tu solicitud.");

      event.currentTarget.reset();
      setEstado("success");
      setMensaje("Recibimos tu solicitud. El equipo de Sapyria la revisará por el canal que elegiste.");
    } catch (error) {
      setEstado("error");
      setMensaje(error instanceof Error ? error.message : "No pudimos registrar tu solicitud. Inténtalo nuevamente.");
    }
  }

  return (
    <form onSubmit={enviar} className="rounded-xl border p-5 sm:p-6" style={{ borderColor: "var(--border)", background: "var(--surface-0)" }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Nombre completo
          <input className={campo} style={{ borderColor: "var(--border-strong)" }} name="nombre" autoComplete="name" maxLength={160} required />
        </label>
        <label className="text-sm font-semibold">
          Correo electrónico
          <input className={campo} style={{ borderColor: "var(--border-strong)" }} name="email" type="email" autoComplete="email" maxLength={254} required />
        </label>
        <label className="text-sm font-semibold">
          Teléfono o WhatsApp
          <input className={campo} style={{ borderColor: "var(--border-strong)" }} name="telefono" type="tel" autoComplete="tel" maxLength={40} required />
        </label>
        <label className="text-sm font-semibold">
          Ciudad
          <input className={campo} style={{ borderColor: "var(--border-strong)" }} name="ciudad" autoComplete="address-level2" maxLength={100} required />
        </label>
        <label className="text-sm font-semibold">
          País
          <input className={campo} style={{ borderColor: "var(--border-strong)" }} name="pais" autoComplete="country-name" maxLength={100} required />
        </label>
        <label className="text-sm font-semibold">
          Eres
          <select className={campo} style={{ borderColor: "var(--border-strong)" }} name="tipoInteresado" defaultValue="" required>
            <option value="" disabled>Selecciona una opción</option>
            {TIPOS_INTERESADO.map((opcion) => <option key={opcion}>{opcion}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Motivo de contacto
          <input className={campo} style={{ borderColor: "var(--border-strong)" }} name="motivo" maxLength={240} placeholder="¿Qué te gustaría conocer?" required />
        </label>
        <label className="text-sm font-semibold">
          Área de interés
          <select className={campo} style={{ borderColor: "var(--border-strong)" }} name="servicioInteres" defaultValue="">
            <option value="">Aún no estoy seguro/a</option>
            {SERVICIOS_INTERES.map((opcion) => <option key={opcion}>{opcion}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Prefiero que me contacten por
          <select className={campo} style={{ borderColor: "var(--border-strong)" }} name="preferenciaContacto" defaultValue="" required>
            <option value="" disabled>Selecciona un canal</option>
            {PREFERENCIAS_CONTACTO.map((opcion) => <option key={opcion}>{opcion}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Mensaje <span className="font-normal" style={{ color: "var(--ink-3)" }}>(opcional)</span>
          <textarea className={`${campo} min-h-28 resize-y`} style={{ borderColor: "var(--border-strong)" }} name="mensaje" maxLength={2000} placeholder="Cuéntanos brevemente qué quieres explorar. No incluyas información médica, genética, resultados ni archivos." />
        </label>
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <p className="mt-4 rounded-lg border-l-4 px-4 py-3 text-sm leading-relaxed" style={{ borderColor: "var(--serious-marca)", background: "var(--surface-1)", color: "var(--ink-2)" }}>
        Este canal es comercial e informativo. No envíes historias clínicas, archivos, resultados de laboratorio ni información genética. Para gestionar una muestra se usa un proceso separado con consentimiento informado.
      </p>

      <label className="mt-4 flex items-start gap-3 text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
        <input name="consentimiento" type="checkbox" className="mt-1 size-4" required />
        <span>Autorizo a Sapyria a usar estos datos para responder mi solicitud, de acuerdo con la <Link href="/privacidad" className="font-semibold underline" style={{ color: "var(--accent-strong)" }}>política de privacidad</Link>.</span>
      </label>

      <button type="submit" disabled={estado === "sending"} className="btn-marca mt-5 inline-flex rounded-lg px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70">
        {estado === "sending" ? "Enviando…" : "Enviar solicitud"}
      </button>
      {mensaje ? (
        <p className="mt-3 text-sm leading-relaxed" role="status" style={{ color: estado === "error" ? "var(--critical)" : "var(--good)" }}>{mensaje}</p>
      ) : null}
    </form>
  );
}
