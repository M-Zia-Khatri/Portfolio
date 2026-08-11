// client/src/shared/utils/cloudinaryUrl.ts (new file)
interface OptimizedCloudinaryUrlProps {
  url: string;
  format?: string | null;
  quality?: number | null;
  width?: number;
}

export function optimizedCloudinaryUrl({
  url,
  format,
  quality,
  width,
}: OptimizedCloudinaryUrlProps): string {
  if (!url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/f_${format ?? "auto"},q_${quality ?? "auto"},w_${width}/`,
  );
}
