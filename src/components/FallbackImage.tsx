"use client";

import React, { useState } from "react";

interface FallbackImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const DEFAULT_FACULTY_IMAGE = "https://png.pngtree.com/element_our/20200610/ourmid/pngtree-character-default-avatar-image_2237203.jpg";

function isValidImageSrc(src: string): boolean {
  return src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://");
}

const FallbackImage = (props: FallbackImageProps) => {
  const { src, alt, className, width, height, style } = props;
  const [isErr, setIsErr] = useState(false);
  const trimmedSrc = src?.trim() ?? "";
  const safeSrc =
    trimmedSrc.length > 0 &&
    trimmedSrc.toLowerCase() !== "unknown" &&
    isValidImageSrc(trimmedSrc)
      ? trimmedSrc
      : DEFAULT_FACULTY_IMAGE;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt ?? ""}
      className={className}
      width={width}
      height={height}
      style={style}
      src={isErr ? DEFAULT_FACULTY_IMAGE : safeSrc}
      onError={() => {
        setIsErr(true);
      }}
    />
  );
};

export default FallbackImage;
