import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

import { TEST_PORT } from "./tests/helpers/setup";

export default defineConfig({
  server: {
    port: TEST_PORT,
  },
  test: {
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**/*"],
    setupFiles: ["tests/helpers/setup.ts"],
    watch: false,
    environment: "jsdom",
    coverage: {
      provider: "istanbul",
      include: ["app/**/*"],
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
  plugins: [react()],
});
