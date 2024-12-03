import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import { expressDevServer } from "./app/utils/devServerUtils";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

installGlobals({ nativeFetch: true });

export default defineConfig({
  build: {
    target: "ESNext",
  },
  base: "/meldekort/",
  plugins: [
    expressDevServer({ base: "/meldekort" }),
    remix({ basename: "/meldekort/" }),
    tsconfigPaths(),
  ],
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
