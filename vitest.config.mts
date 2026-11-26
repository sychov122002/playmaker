import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@server": fileURLToPath(new URL("./server", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: { include: ["server/**/*.test.ts", "src/**/*.test.ts"], environment: "node", testTimeout: 20000 },
});
