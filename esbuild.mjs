import * as esbuild from "esbuild"
import { argv } from "node:process"
import { copyFileSync, rmSync } from "node:fs"

const PKG_DIR = "public"
const OUT_DIR = `${PKG_DIR}/build`

const isProd = argv.includes("--prod")
const shouldWatch = argv.includes("--watch")
const selectedManifest = `assets/${
  argv.includes("firefox") ? "firefox" : "chrome"
}-manifest.json`
copyFileSync(selectedManifest, `${PKG_DIR}/manifest.json`)
rmSync(OUT_DIR, { recursive: true, force: true })

const buildOptions = {
  entryPoints: ["src/content/index.tsx", "src/background/index.ts"],
  bundle: true,
  minify: isProd,
  sourcemap: !isProd,
  outdir: OUT_DIR,
  logLevel: "info",
}

if (shouldWatch) {
  const ctx = await esbuild.context(buildOptions)
  await ctx.watch()
} else {
  await esbuild.build(buildOptions)
}
