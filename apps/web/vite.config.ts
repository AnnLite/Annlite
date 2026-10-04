import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const isGitHubPages = process.env.ANNLITE_PAGES === "true";
const base = isGitHubPages ? "/Annlite/" : "/";
const siteOrigin = isGitHubPages ? "https://annlite.github.io/Annlite" : "https://annlite.com";

export default defineConfig({
  base,
  plugins: [
    {
      name: "annlite-site-origin",
      transformIndexHtml(html) {
        return html.replaceAll("%SITE_ORIGIN%", siteOrigin);
      },
    },
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/favicon-32.png"],
      manifest: {
        id: base,
        name: "AnnLite — Faith for everyday life",
        short_name: "AnnLite",
        description: "A welcoming place to read Scripture, pray, reflect, and grow in faith.",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#f7f8f4",
        theme_color: "#164d45",
        icons: [
          { src: `${base}icons/annlite-192.png`, sizes: "192x192", type: "image/png" },
          { src: `${base}icons/annlite-512.png`, sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        navigateFallback: `${base}index.html`,
        globPatterns: ["**/*.{css,html,ico,jpg,js,png,svg,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
  },
});