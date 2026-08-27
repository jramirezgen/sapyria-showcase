import { NextRequest, NextResponse } from "next/server";
import { PREFERENCIAS_CONTACTO, SERVICIOS_INTERES, TIPOS_INTERESADO } from "@/lib/contacto";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_ERROR_DETAIL = 500;

type LeadInput = {
  nombre?: unknown;
  email?: unknown;
  telefono?: unknown;
  ciudad?: unknown;
  pais?: unknown;
  tipoInteresado?: unknown;
  motivo?: unknown;
  servicioInteres?: unknown;
  preferenciaContacto?: unknown;
  mensaje?: unknown;
  consentimiento?: unknown;
  website?: unknown;
};

type ValidLead = {
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
  tipoInteresado: string;
  motivo: string;
  servicioInteres: string;
  preferenciaContacto: string;
  mensaje: string;
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function currentOrigin(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  return configured ? new URL(configured).origin : request.nextUrl.origin;
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const accepted = new Set([currentOrigin(request), "https://sapyria.com", "https://www.sapyria.com"]);
  return accepted.has(origin) || (process.env.NODE_ENV !== "production" && origin.startsWith("http://localhost"));
}

async function saveNotification(leadId: string, status: "sent" | "skipped" | "error", detail?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) return;

  const response = await fetch(`${url}/rest/v1/lead_notification_events`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ lead_id: leadId, channel: "email", status, detail: detail?.slice(0, MAX_ERROR_DETAIL) ?? null }),
  });
  if (!response.ok) console.error("No se pudo registrar el estado de la notificación del lead.");
}

async function notifySales(leadId: string, lead: ValidLead) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_NOTIFICATION_FROM;
  const to = process.env.CONTACT_NOTIFICATION_TO || "ventas@sapyria.com";
  if (!apiKey || !from) {
    await saveNotification(leadId, "skipped", "Resend no está configurado en el entorno del servidor.");
    return;
  }

  const rows = [
    ["Nombre", lead.nombre], ["Email", lead.email], ["Teléfono", lead.telefono],
    ["Ubicación", `${lead.ciudad}, ${lead.pais}`], ["Perfil", lead.tipoInteresado],
    ["Motivo", lead.motivo], ["Área", lead.servicioInteres || "No indicada"],
    ["Preferencia", lead.preferenciaContacto], ["Mensaje", lead.mensaje || "—"],
  ].map(([label, value]) => `<tr><td style="padding:6px 12px 6px 0;color:#3d5c5c"><strong>${escapeHtml(label)}</strong></td><td style="padding:6px 0">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`).join("");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: lead.email,
        subject: `Nuevo contacto web · ${lead.nombre}`,
        html: `<main style="font-family:Arial,sans-serif;color:#002626"><h1 style="font-size:20px">Nueva solicitud de Sapyria</h1><table>${rows}</table><p style="margin-top:20px;color:#577373;font-size:12px">Lead ${escapeHtml(leadId)} · origen: sapyria.com</p></main>`,
      }),
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, MAX_ERROR_DETAIL);
      console.error("Resend rechazó la notificación de contacto.");
      await saveNotification(leadId, "error", detail);
      return;
    }
    await saveNotification(leadId, "sent");
  } catch {
    console.error("No se pudo enviar la notificación de contacto.");
    await saveNotification(leadId, "error", "Error de red al contactar el proveedor de correo.");
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });

  let body: LeadInput;
  try {
    body = await request.json() as LeadInput;
  } catch {
    return NextResponse.json({ error: "La solicitud no tiene un formato válido." }, { status: 400 });
  }

  if (text(body.website, 200)) return NextResponse.json({ ok: true });

  const lead = {
    nombre: text(body.nombre, 160),
    email: text(body.email, 254).toLowerCase(),
    telefono: text(body.telefono, 40),
    ciudad: text(body.ciudad, 100),
    pais: text(body.pais, 100),
    tipoInteresado: text(body.tipoInteresado, 80),
    motivo: text(body.motivo, 240),
    servicioInteres: text(body.servicioInteres, 120),
    preferenciaContacto: text(body.preferenciaContacto, 30),
    mensaje: text(body.mensaje, MAX_MESSAGE_LENGTH),
  };

  const valid = lead.nombre && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) && lead.telefono && lead.ciudad && lead.pais && lead.motivo
    && (TIPOS_INTERESADO as readonly string[]).includes(lead.tipoInteresado)
    && (PREFERENCIAS_CONTACTO as readonly string[]).includes(lead.preferenciaContacto)
    && (!lead.servicioInteres || (SERVICIOS_INTERES as readonly string[]).includes(lead.servicioInteres))
    && body.consentimiento === "on";
  if (!valid) return NextResponse.json({ error: "Revisa los campos requeridos y confirma la política de privacidad." }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) return NextResponse.json({ error: "El formulario no está disponible temporalmente." }, { status: 503 });

  const referer = request.headers.get("referer");
  let originPage = "/contacto";
  if (referer) {
    try { originPage = new URL(referer).pathname.slice(0, 200) || "/contacto"; } catch { /* usa el valor seguro */ }
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/create_commercial_lead`, {
    method: "POST",
    headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      p_full_name: lead.nombre, p_email: lead.email, p_phone: lead.telefono, p_city: lead.ciudad,
      p_country: lead.pais, p_interested_type: lead.tipoInteresado, p_reason: lead.motivo,
      p_service_interest: lead.servicioInteres || null, p_contact_preference: lead.preferenciaContacto,
      p_message: lead.mensaje || null, p_origin_page: originPage,
    }),
  });
  if (!response.ok) {
    console.error("Supabase rechazó la creación de un lead comercial.");
    return NextResponse.json({ error: "No pudimos registrar tu solicitud. Inténtalo nuevamente." }, { status: 502 });
  }

  const leadId = await response.json() as string;
  // El lead ya quedó persistido. Un fallo de correo se captura dentro de esta
  // función y nunca revierte esa captura; esperar evita que un runtime serverless
  // termine el trabajo de Resend antes de iniciarlo.
  await notifySales(leadId, lead);
  return NextResponse.json({ ok: true }, { status: 201 });
}
