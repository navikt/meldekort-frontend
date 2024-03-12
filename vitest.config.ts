import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";
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
      all: true,
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
