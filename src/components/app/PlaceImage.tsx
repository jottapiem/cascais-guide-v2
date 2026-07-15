"use client";

import { forwardRef } from "react";

// Shared place image — renders the <img> with the exact same styling everywhere
// it's used (MorphCard card image, TransitionLayer morphing clone). The PARENT
// owns the sizing (aspect-ratio, width/height), clipping (overflow, border-radius)
// and positioning (position: relative). This component only fills its parent
// absolutely with object-cover, matching the card's image element byte-for-byte.
export const PlaceImage = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  function PlaceImage({ src, alt = "", className, ...rest }, ref) {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`}
        {...rest}
      />
    );
  }
);
