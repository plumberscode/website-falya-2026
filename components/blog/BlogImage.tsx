"use client";

import Image from "next/image";
import { CldImage, CldImageProps } from "next-cloudinary";

interface BlogImageProps extends Omit<CldImageProps, "alt"> {
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

export default function BlogImage({ alt, className, src, ...props }: BlogImageProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const isExternalUrl = typeof src === "string" && (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/"));

  // If cloudName is present and it's a Cloudinary asset or public ID, use CldImage
  if (cloudName && !isExternalUrl) {
    return (
      <CldImage
        src={src}
        alt={alt}
        className={className}
        format="auto"
        quality="auto"
        loading={props.priority ? undefined : "lazy"}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    );
  }

  // Fallback to Next.js standard optimized Image
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={props.fill}
      priority={props.priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      unoptimized={typeof src === "string" && src.startsWith("http")}
    />
  );
}
