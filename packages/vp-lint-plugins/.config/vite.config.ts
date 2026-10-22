import { defineConfig } from "vite-plus";

export default defineConfig({
  oxc: { target: "es2020" },
  test: {
    include: ["tests/**/*.test.ts"],

    coverage: {
      include: ["src/**/*.ts"],

      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "./coverage",
    },
  },
});
