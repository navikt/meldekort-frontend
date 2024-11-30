import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import { expressDevServer } from "remix-express-dev-server";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

installGlobals({ nativeFetch: true })

export default defineConfig({
  plugins: [
    expressDevServer(),
    remix(),
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
