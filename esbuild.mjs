import * as esbuild from "esbuild"
import process from "node:process"
import { copyFile } from "node:fs/promises"
import { mkdirSync, readdirSync, rmSync, statSync } from "node:fs"

const BUILD_DIR = "build"
const OUT_DIR = `${BUILD_DIR}/static`

const startTime = Date.now()
const isProd = process.argv.includes("--prod")
const selectedManifest = `public/${
  process.argv.includes("firefox") ? "firefox" : "chrome"
}-manifest.json`

rmSync(BUILD_DIR, { recursive: true, force: true })
mkdirSync(BUILD_DIR)
const fsPromises = [copyFile(selectedManifest, "build/manifest.json")]
const copies = ["logo128.png", "logo16.png", "logo32.png", "logo48.png"]
for (const copy of copies) {
  fsPromises.push(copyFile(`public/${copy}`, `build/${copy}`))
}
await Promise.all(fsPromises)

await esbuild.build({
  entryPoints: ["src/content/index.tsx", "src/background/index.ts"],
  bundle: true,
  minify: isProd,
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
  `📦 Total bundle size: ${totalSize.toFixed(2)}kb`,
  `✨ Done in ${Date.now() - startTime}ms`,
]
reportLines.forEach((x) => console.log(x))
