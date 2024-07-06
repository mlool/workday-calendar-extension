import * as esbuild from "esbuild"
import { argv } from "node:process"
import { copyFileSync, existsSync, rmSync } from "node:fs"
import { rename } from "node:fs/promises"

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

// Move old build folder to prevent confusion
if (existsSync("build/")) rename("build/", "old_build")

console.log("📦 Outputting bundle in public/ ...")
if (shouldWatch) {
  const ctx = await esbuild.context(buildOptions)
  await ctx.watch()
} else {
  await esbuild.build(buildOptions)
}
