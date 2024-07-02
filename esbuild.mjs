import * as esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["src/content/index.tsx", "src/background/index.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: "public/build",
})
