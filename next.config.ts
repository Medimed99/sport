import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Turbopack config vide pour éviter l'erreur
  turbopack: {},
};

export default nextConfig;
