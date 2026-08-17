// cache.etag.ts
import { createHash } from "node:crypto";

const WEAK_PREFIX = "W/";

export function generateETag(data: unknown, weak = false): string {
  const hash = createHash("sha256").update(JSON.stringify(data)).digest("base64url").slice(0, 16);

  return weak ? `${WEAK_PREFIX}"${hash}"` : `"${hash}"`;
}

export function matchETag(clientETag: string | undefined, serverETag: string): boolean {
  if (!clientETag) return false;
  if (clientETag === "*") return true;

  const normalize = (e: string) => e.replace(/^W\//, "").replace(/"/g, "").trim();

  const clientTags = clientETag.split(",").map(normalize);
  const serverTag = normalize(serverETag);

  return clientTags.includes(serverTag);
}

export function isWeakETag(etag: string): boolean {
  return etag.startsWith(WEAK_PREFIX);
}

export function generateCompositeETag(etags: string[]): string {
  const sorted = [...etags].sort();
  return generateETag(sorted.join(":"), true); // Weak etag for collections
}
