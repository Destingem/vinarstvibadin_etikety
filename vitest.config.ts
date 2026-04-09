import { defineConfig } from "vitest/config";

export default defineConfig({
  css: {
    postcss: {},
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.{ts,tsx,js,jsx,mjs,cjs}"],
    restoreMocks: true,
    clearMocks: true,
    unstubEnvs: true,
  },
});
