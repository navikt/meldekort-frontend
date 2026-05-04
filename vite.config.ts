import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    target: "ESNext",
  },
  base: process.env.NODE_ENV === "production" ? "https://cdn.nav.no/meldekort/meldekort-frontend/client/" : "/meldekort",
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
  server: {
    port: 8080
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
