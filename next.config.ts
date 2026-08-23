import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // TypeScript is checked explicitly by the build script. Next 16.3's own
  // `--showConfig` parser is unstable with TypeScript 5.8 in this runtime.
  typescript: { ignoreBuildErrors: true },

  // El sitio está en castellano y sus rutas también (`/como-funciona`,
  // `/evidencia`). Pero las URLs registradas en la consola de Google son
  // `/privacy` y `/terms`, así que se sirven las mismas páginas ahí con 200, sin
  // redirección: un revisor que reciba un 308 puede darlo por bueno o puede no
  // hacerlo, y no hay motivo para arriesgarlo por un salto que no aporta nada.
  // El `canonical` de cada página apunta a la ruta en castellano.
  async rewrites() {
    return [
      { source: "/privacy", destination: "/privacidad" },
      { source: "/terms", destination: "/terminos" },
      { source: "/privacy-policy", destination: "/privacidad" },
      { source: "/terms-of-service", destination: "/terminos" },
    ];
  },
};

export default nextConfig;
