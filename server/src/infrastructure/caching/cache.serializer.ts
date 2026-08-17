// cache.serializer.ts
import { promisify } from "node:util";
import { gunzip, gzip } from "node:zlib";
import { COMPRESSION_THRESHOLD_BYTES, MAX_PAYLOAD_BYTES } from "./cache.constants.js";
import type { CachePayload } from "./cache.types.js";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export interface SerializationResult {
  data: string;
  compressed: boolean;
  originalSize: number;
}

export async function serialize<T>(
  payload: CachePayload<T>,
  enableCompression = false,
): Promise<SerializationResult> {
  const json = JSON.stringify(payload);
  const originalSize = Buffer.byteLength(json);

  if (originalSize > MAX_PAYLOAD_BYTES) {
    throw new Error(`Cache payload exceeds ${MAX_PAYLOAD_BYTES} bytes (${originalSize})`);
  }

  if (enableCompression && originalSize > COMPRESSION_THRESHOLD_BYTES) {
    const compressed = await gzipAsync(Buffer.from(json));
    return {
      data: compressed.toString("base64"),
      compressed: true,
      originalSize,
    };
  }

  return { data: json, compressed: false, originalSize };
}

export async function deserialize<T>(raw: string, compressed = false): Promise<CachePayload<T>> {
  try {
    let json: string;

    if (compressed) {
      const buffer = Buffer.from(raw, "base64");
      const decompressed = await gunzipAsync(buffer);
      json = decompressed.toString("utf-8");
    } else {
      json = raw;
    }

    return JSON.parse(json, (_key, value) => {
      if (typeof value === "string" && ISO_DATE_RE.test(value)) {
        return new Date(value);
      }
      return value;
    }) as CachePayload<T>;
  } catch (err) {
    throw new Error(
      `Failed to deserialize cache payload: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }
}
