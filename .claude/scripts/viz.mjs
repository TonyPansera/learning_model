#!/usr/bin/env node
/**
 * viz — render a Mermaid (.mmd) or SVG (.svg) source file to PNG for the
 * mermaid-maker / svg-maker subagents.
 *
 *   node .claude/scripts/viz.mjs render <source.mmd|source.svg>
 *       Preview render. Prints `preview: <png path>` (under the OS temp dir,
 *       never inside the vault). The maker then Reads that PNG to look at it.
 *
 *   node .claude/scripts/viz.mjs render <source> --publish <slug>
 *       Render and publish into <cwd>/viz as viz-<slug>-<timestamp>.png.
 *       Prints the RESULT block (filename + absolute path) to embed.
 *
 * Mermaid renders through @mermaid-js/mermaid-cli (`mmdc`): the copy installed
 * next to this script (`npm install --prefix .claude/scripts`), else `mmdc` on
 * PATH. An installed Chrome/Chromium is used when found; otherwise puppeteer
 * falls back to its own downloaded browser.
 *
 * SVG renders through rsvg-convert, falling back to ImageMagick (`magick`).
 *
 * Exit code is non-zero on failure, with the renderer's error on stderr.
 */

import { spawn } from "node:child_process"
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { basename, dirname, extname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const STAGING_DIR = join(tmpdir(), "claude-visual-tools")
const PUBLISH_DIRNAME = "viz"
const MERMAID_TIMEOUT_MS = 120_000
const SVG_TIMEOUT_MS = 60_000

// Homebrew / MacPorts / /usr/local may be missing from a thin PATH.
const EXTRA_PATH = ["/opt/local/bin", "/usr/local/bin", "/opt/homebrew/bin"]

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
]

function usage() {
  console.error("Usage: node .claude/scripts/viz.mjs render <source.mmd|source.svg> [--publish <slug>]")
  process.exit(2)
}

function run(cmd, args, { cwd, timeoutMs, env }) {
  return new Promise((done) => {
    const PATH = [...EXTRA_PATH, process.env.PATH ?? ""].join(":")
    const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env, PATH } })
    let stdout = ""
    let stderr = ""
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      child.kill("SIGKILL")
    }, timeoutMs)
    child.stdout.on("data", (d) => (stdout += d))
    child.stderr.on("data", (d) => (stderr += d))
    child.on("error", (err) => {
      clearTimeout(timer)
      done({ code: null, stdout, stderr: stderr + String(err), timedOut })
    })
    child.on("close", (code) => {
      clearTimeout(timer)
      done({ code, stdout, stderr, timedOut })
    })
  })
}

function findMmdc() {
  const local = join(SCRIPT_DIR, "node_modules", ".bin", "mmdc")
  return existsSync(local) ? local : "mmdc"
}

async function renderMermaid(src, out) {
  const chrome = CHROME_CANDIDATES.find((c) => existsSync(c))
  const cfgPath = join(STAGING_DIR, "puppeteer.json")
  const cfg = chrome ? { executablePath: chrome, args: ["--no-sandbox"] } : { args: ["--no-sandbox"] }
  writeFileSync(cfgPath, JSON.stringify(cfg), "utf8")
  const res = await run(findMmdc(), ["-i", src, "-o", out, "-p", cfgPath, "-s", "2", "-b", "white"], {
    cwd: STAGING_DIR,
    timeoutMs: MERMAID_TIMEOUT_MS,
  })
  if (res.code === null && !res.timedOut && /ENOENT/.test(res.stderr)) {
    res.stderr += "\n\nmmdc not found. Install it with: npm install --prefix .claude/scripts"
  }
  return res
}

async function renderSvg(src, out) {
  // rsvg-convert renders at the SVG's intrinsic size; -z 2 doubles it for crispness.
  const rsvg = await run("rsvg-convert", ["-z", "2", "-b", "white", src, "-o", out], {
    cwd: STAGING_DIR,
    timeoutMs: SVG_TIMEOUT_MS,
  })
  if (rsvg.code === 0 && existsSync(out)) return rsvg
  // Fallback: ImageMagick. -density 192 (~2x of 96dpi) for a crisp raster.
  const magick = await run("magick", ["-density", "192", "-background", "white", src, out], {
    cwd: STAGING_DIR,
    timeoutMs: SVG_TIMEOUT_MS,
  })
  if (magick.code === 0 && existsSync(out)) return magick
  return rsvg.code !== null ? rsvg : magick
}

function publish(png, slug) {
  const dir = join(process.cwd(), PUBLISH_DIRNAME)
  mkdirSync(dir, { recursive: true })
  const clean =
    slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "viz"
  const filename = `viz-${clean}-${Date.now()}.png`
  const dest = join(dir, filename)
  copyFileSync(png, dest)
  return { filename, path: dest }
}

async function main() {
  const [cmd, source, ...rest] = process.argv.slice(2)
  if (cmd !== "render" || !source) usage()
  let slug
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--publish" && rest[i + 1]) slug = rest[++i]
    else usage()
  }

  const src = resolve(source)
  if (!existsSync(src)) {
    console.error(`Source not found: ${src}`)
    process.exit(1)
  }
  const ext = extname(src).toLowerCase()
  if (ext !== ".mmd" && ext !== ".svg") {
    console.error(`Unsupported source type "${ext}" — use .mmd (Mermaid) or .svg.`)
    process.exit(2)
  }

  mkdirSync(STAGING_DIR, { recursive: true })
  const out = join(STAGING_DIR, `${basename(src, ext)}-${Date.now()}.png`)
  const res = ext === ".mmd" ? await renderMermaid(src, out) : await renderSvg(src, out)

  if (res.code !== 0 || !existsSync(out)) {
    const detail = (res.stderr || res.stdout || "unknown error").split("\n").slice(-30).join("\n")
    console.error(`${res.timedOut ? "Renderer timed out.\n\n" : ""}Render FAILED — no image produced.\n\n${detail}`)
    process.exit(1)
  }

  if (!slug) {
    console.log(`preview: ${out}`)
    return
  }
  const { filename, path } = publish(out, slug)
  console.log(`RESULT:\nfilename: ${filename}\npath: ${path}`)
}

main()
