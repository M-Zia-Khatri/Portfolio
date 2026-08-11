import type { ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  avifSrcSet: string;
  webpSrcSet: string;
  fallbackSrc: string;
  sizes: string;
  width: number;
  height: number;
  priority?: boolean;
}

export default function OptimizedImage({
  avifSrcSet,
  webpSrcSet,
  fallbackSrc,
  sizes,
  width,
  height,
  priority = false,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />

      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />

      <img
        {...props}
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
