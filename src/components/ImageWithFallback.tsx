import React, { useState } from 'react';
import { processImageUrl } from '../utils/imageUrlUtils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  fallbackSrc?: string;
  showPlaceholder?: boolean;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  style = {},
  loading = 'eager', // Changed from 'lazy' to 'eager' for faster loading
  fallbackSrc = '/placeholder.svg',
  showPlaceholder = false // Changed to false to remove spinner delay
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Process the image URL using centralized utility
  const processedSrc = processImageUrl(src);

  const finalSrc = imageError ? fallbackSrc : processedSrc;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={{
        objectFit: 'cover',
        ...style
      }}
      loading={loading}
      onError={() => {
        setImageError(true);
        // Fallback to placeholder on error
        if (finalSrc !== fallbackSrc) {
          const img = document.querySelector(`img[src="${finalSrc}"]`) as HTMLImageElement;
          if (img) {
            img.src = fallbackSrc;
          }
        }
      }}
    />
  );
};

export default ImageWithFallback;
