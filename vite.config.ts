import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { expressDevServer } from "./app/utils/devServerUtils";

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
