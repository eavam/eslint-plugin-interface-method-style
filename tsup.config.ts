import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: ["src/index.ts"],
  dts: true,
  outDir: "dist",
  clean: true,
  sourcemap: true,
});
