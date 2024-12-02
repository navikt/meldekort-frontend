import { installGlobals } from "@remix-run/node";
import { defineConfig, loadEnv } from "vite";
import { expressDevServer } from "./app/utils/devServerUtils";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

installGlobals({ nativeFetch: true });

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      target: "ESNext",
    },
    base: env.BASE_PATH + "/",
    plugins: [
      expressDevServer({ base: env.BASE_PATH }),
      remix({ basename: env.BASE_PATH + "/" }),
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
  };
});
