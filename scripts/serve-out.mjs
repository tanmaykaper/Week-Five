// Serves the static export the way GitHub Pages does, including the base path.
// Usage: pnpm serve  (PORT=4400, NEXT_PUBLIC_BASE_PATH=/week-five to test the Pages sub-path)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = "out";
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const port = Number(process.env.PORT ?? 4400);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

async function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const candidates = [join(root, clean), join(root, clean, "index.html"), join(root, `${clean}.html`)];
  for (const c of candidates) {
    try { if ((await stat(c)).isFile()) return c; } catch { /* try the next */ }
  }
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (base && !url.pathname.startsWith(base)) { res.writeHead(302, { location: `${base}/` }).end(); return; }
  const path = url.pathname.slice(base.length) || "/";
  if (!path.endsWith("/") && !extname(path) && (await resolveFile(`${path}/`))) {
    res.writeHead(301, { location: `${base}${path}/${url.search}` }).end();
    return;
  }
  const file = await resolveFile(path);
  if (!file) {
    res.writeHead(404, { "content-type": types[".html"] }).end(await readFile(join(root, "404.html")).catch(() => "Not found"));
    return;
  }
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" }).end(await readFile(file));
}).listen(port, "127.0.0.1", () => console.log(`Serving ${root}/ at http://localhost:${port}${base}/`));
