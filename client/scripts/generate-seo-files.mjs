#!/usr/bin/env node
/**
 * Generates public/robots.txt and public/sitemap.xml before the Vite build.
 *
 * Site URL comes from VITE_SITE_URL, passed through the same
 * ARG -> ENV -> build pattern already used for VITE_API_URL /
 * VITE_CLOUDINARY_* in the Dockerfile. Falls back to the production
 * domain so local `pnpm build` and CI still produce correct output
 * without the var set.
 *
 * Add a route here whenever a new public (non-authenticated) page is
 * added to AppRoutes.tsx. Routes behind /auth and /dashboard are
 * intentionally excluded — they're admin-only, not for crawlers.
 */
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(scriptDir, "../public");

const SITE_URL = (process.env.VITE_SITE_URL || "https://ziakhatri.site").replace(/\/+$/, "");

const PUBLIC_ROUTES = [{ path: "/", changefreq: "monthly", priority: "1.0" }];

const DISALLOWED_PATHS = ["/auth", "/dashboard"];

function buildRobotsTxt() {
  const disallowLines = DISALLOWED_PATHS.map((path) => `Disallow: ${path}`).join("\n");

  return `User-agent: *
Allow: /
${disallowLines}

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function buildSitemapXml() {
  const urlEntries = PUBLIC_ROUTES.map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

writeFileSync(resolve(publicDir, "robots.txt"), buildRobotsTxt());
writeFileSync(resolve(publicDir, "sitemap.xml"), buildSitemapXml());

console.log(`Generated robots.txt and sitemap.xml for ${SITE_URL}`);
