import * as esbuild from "esbuild"
import process from "node:process"
import { copyFileSync, readdirSync, rmSync, statSync } from "node:fs"

const PKG_DIR = "public"
const OUT_DIR = `${PKG_DIR}/build`

const startTime = Date.now()
const isProd = process.argv.includes("--prod")
const selectedManifest = `assets/${
  process.argv.includes("firefox") ? "firefox" : "chrome"
}-manifest.json`

copyFileSync(selectedManifest, `${PKG_DIR}/manifest.json`)

rmSync(OUT_DIR, { recursive: true, force: true })
await esbuild.build({
  entryPoints: ["src/content/index.tsx", "src/background/index.ts"],
  bundle: true,
  minify: isProd,
  sourcemap: !isProd,
  outdir: OUT_DIR,
})

const output = readdirSync(OUT_DIR, { recursive: true }).slice(2)
let totalSize = 0
const sizeReports = output.map((x) => {
  const size = statSync(`${OUT_DIR}/${x}`)["size"] / 1000
  totalSize += size
  return `${x}	 ${size.toFixed(3)}kb`
})

const reportLines = [
  "\n~~~~~~~~~~",
  ...sizeReports,
  "~~~~~~~~~~\n",
  `📦 total bundle size: ${totalSize.toFixed(2)}kb`,
  `✨ esbuild done in ${Date.now() - startTime}ms\n`,
]
reportLines.forEach((x) => console.log(x))
