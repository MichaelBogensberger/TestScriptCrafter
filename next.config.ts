import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Deaktiviert ESLint während des Build-Prozesses
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deaktiviert TypeScript-Fehler während des Build-Prozesses
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
