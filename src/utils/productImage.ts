import { useEffect, useState } from 'react';
import { PRODUCT_IMAGE_PLACEHOLDER } from '../api/catalog';

/** Keeps img src in sync with product data and falls back when a cached/deleted API image 404s. */
export function useProductImageSrc(src: string | undefined): {
  src: string;
  onError: () => void;
} {
  const [resolved, setResolved] = useState(src?.trim() || PRODUCT_IMAGE_PLACEHOLDER);

  useEffect(() => {
    setResolved(src?.trim() || PRODUCT_IMAGE_PLACEHOLDER);
  }, [src]);

  return {
    src: resolved,
    onError: () => setResolved(PRODUCT_IMAGE_PLACEHOLDER),
  };
}
