import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // TypeScript is checked explicitly by the build script. Next 16.3's own
  // `--showConfig` parser is unstable with TypeScript 5.8 in this runtime.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
