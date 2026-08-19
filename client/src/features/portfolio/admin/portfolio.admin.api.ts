import { api } from "@/shared/api/axios";
import { clearETag, getETag, setETag } from "@/shared/api/etag-store";
import type { ApiResponse, PortfolioItem } from "./portfolio.types";

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) throw new Error("Cloudinary upload failed");
  const data = await response.json();
  return data.secure_url as string;
}

async function fetchFreshETag(url: string): Promise<string | null> {
  try {
    await api.get(url, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    const stored = getETag(url);
    if (stored) {
      console.debug(`[fetchFreshETag] ETag from store for ${url}:`, stored);
      return stored;
    }

    console.error(
      `[fetchFreshETag] ETag header unreachable for ${url}.\n` +
        "Add  exposedHeaders: ['ETag']  to your server CORS config.",
    );
    return null;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.warn(`[fetchFreshETag] 404 – item not found: ${url}`);
      return null;
    }
    throw err;
  }
}

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  const { data, headers } = await api.get<ApiResponse<PortfolioItem[]>>("/portfolio");

  const etag = headers.etag as string | undefined;
  if (etag) {
    setETag("/portfolio", etag);
  }

  return data.data ?? [];
}

export async function createPortfolio(payload: Omit<PortfolioItem, "id">): Promise<PortfolioItem> {
  const { data, headers } = await api.post<ApiResponse<PortfolioItem>>("/portfolio", payload);

  if (!data.success || !data.data) {
    throw new Error(data.message || "Create failed");
  }

  const etag = headers?.etag as string | undefined;
  if (etag) {
    setETag(`/portfolio/${data.data.id}`, etag);
  }
  clearETag("/portfolio");

  return data.data;
}

export async function updatePortfolio(
  id: string,
  payload: Partial<Omit<PortfolioItem, "id">>,
): Promise<PortfolioItem> {
  const url = `/portfolio/${id}`;

  const etag = await fetchFreshETag(url);

  if (!etag) {
    throw new Error(
      "Could not read the item's ETag. " +
        "Add  exposedHeaders: ['ETag']  to your server CORS middleware.",
    );
  }

  const { data, headers } = await api.patch<ApiResponse<PortfolioItem>>(url, payload, {
    headers: { "If-Match": etag },
  });

  if (!data.success || !data.data) {
    throw new Error(data.message || "Update failed");
  }

  const newEtag = headers?.etag as string | undefined;
  if (newEtag) {
    setETag(url, newEtag);
  }
  clearETag("/portfolio");

  return data.data;
}

export async function deletePortfolio(id: string): Promise<void> {
  const url = `/portfolio/${id}`;

  const etag = await fetchFreshETag(url);

  const config = etag ? { headers: { "If-Match": etag } } : undefined;

  await api.delete(url, config);

  clearETag(url);
  clearETag("/portfolio");
}
