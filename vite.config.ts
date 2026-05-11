import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
  },
  base:
    process.env.NODE_ENV === "production"
      ? "https://cdn.nav.no/meldekort/meldekort-frontend/client/"
      : "/felles-meldekort",
  plugins: [reactRouter()],
  server: {
    port: 8080,
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
