import { ImageResponse } from "next/og";

/** El icono de la pestaña. Sin esto el navegador muestra un hueco, que es de las
 *  primeras cosas que alguien nota al abrir una web. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "#2a78d6", color: "#fff",
          fontSize: 22, fontWeight: 800, borderRadius: 7,
        }}
      >
        S
      </div>
    ),
    size,
  );
}
