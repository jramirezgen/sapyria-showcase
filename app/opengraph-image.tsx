import { ImageResponse } from "next/og";

/**
 * Lo que se ve cuando alguien comparte el enlace por WhatsApp o LinkedIn.
 *
 * Sin esto el enlace viaja como un rectángulo vacío, y para una web cuyo trabajo
 * es que alguien la abra eso es media presentación perdida.
 */
export const alt = "Sapyria — fenotipo molecular trazable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "72px 80px",
        background: "#ffffff", color: "#0b0b0b",
        fontFamily: "sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: "#2a78d6",
            color: "#fff", fontSize: 26, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>S</div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>Sapyria</div>
        </div>

        <div style={{ marginTop: 40, fontSize: 66, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2.6, display: "flex", flexDirection: "column" }}>
          <span>Tu muestra.</span>
          <span style={{ color: "#2a78d6" }}>Tu mapa molecular.</span>
        </div>

        <div style={{ marginTop: 30, fontSize: 27, color: "#52514e", lineHeight: 1.35, maxWidth: 880 }}>
          Un fenotipo molecular en seis dimensiones, cada una con su nivel de evidencia.
        </div>

        <div style={{ marginTop: 44, display: "flex", gap: 12, fontSize: 18, color: "#52514e" }}>
          {["8 cohortes públicas reales", "Evidencia por dimensión", "Los límites, primero"].map((t) => (
            <div key={t} style={{
              display: "flex", padding: "9px 16px", borderRadius: 8,
              border: "1px solid #e3e3dd", background: "#fcfcfb",
            }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
