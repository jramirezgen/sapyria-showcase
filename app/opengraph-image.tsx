import { readFile } from "node:fs/promises";
import { join } from "node:path";
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

export default async function OpengraphImage() {
  // El símbolo oficial, no una letra dibujada a mano. `next/og` no resuelve rutas
  // relativas, así que se incrusta el archivo como data URI.
  const simbolo = await readFile(join(process.cwd(), "public/marca/sapyria-simbolo-72.png"));
  const simboloSrc = `data:image/png;base64,${simbolo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "72px 80px",
        background: "#ffffff", color: "#002626",
        fontFamily: "sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={simboloSrc} alt="" height={52} width={27} />
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>Sapyria</div>
        </div>

        <div style={{ marginTop: 40, fontSize: 66, fontWeight: 800, lineHeight: 1.04, letterSpacing: -2.6, display: "flex", flexDirection: "column" }}>
          <span>Tu muestra.</span>
          <span style={{ color: "#257F80" }}>Tu mapa molecular.</span>
        </div>

        <div style={{ marginTop: 30, fontSize: 27, color: "#3d5c5c", lineHeight: 1.35, maxWidth: 880 }}>
          Un fenotipo molecular en seis dimensiones, cada una con su nivel de evidencia.
        </div>

        <div style={{ marginTop: 44, display: "flex", gap: 12, fontSize: 18, color: "#3d5c5c" }}>
          {["8 cohortes públicas reales", "Evidencia por dimensión", "Los límites, primero"].map((t) => (
            <div key={t} style={{
              display: "flex", padding: "9px 16px", borderRadius: 8,
              border: "1px solid #c6d2cf", background: "#fbfbf6",
            }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
