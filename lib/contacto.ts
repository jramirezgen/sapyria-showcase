export const WHATSAPP_SAPYRIA = "https://wa.me/51923418089";

export const MENSAJE_WHATSAPP_CONTACTO =
  "Hola, quisiera conocer Sapyria y entender qué tipo de experiencia o análisis podría explorar.";

export function enlaceWhatsApp(mensaje = MENSAJE_WHATSAPP_CONTACTO) {
  return `${WHATSAPP_SAPYRIA}?text=${encodeURIComponent(mensaje)}`;
}

export const TIPOS_INTERESADO = [
  "Persona",
  "Profesional de salud",
  "Clínica o institución",
  "Investigador/a",
  "Empresa o alianza",
] as const;

export const PREFERENCIAS_CONTACTO = ["WhatsApp", "Email", "Teléfono"] as const;

export const SERVICIOS_INTERES = [
  "Conocer la plataforma Sapyria",
  "Fenotipo molecular personal",
  "small RNA-seq",
  "WES / WGS futuro",
  "Investigación o datos públicos",
  "Alianza institucional",
] as const;
