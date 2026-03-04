import React, { useState } from 'react';
import { processImageUrl } from '../utils/imageUrlUtils';
import imageOptimizer from '../utils/imageUtils';

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
  loading = 'lazy',
  fallbackSrc = '/placeholder.svg',
  showPlaceholder = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Process the image URL using centralized utility
  const processedSrc = processImageUrl(src);
  const [optimizedSrc] = useState(() => 
    imageOptimizer.getOptimizedUrl(processedSrc, width, height)
  );

  // Preload image
  React.useEffect(() => {
    if (processedSrc && processedSrc !== fallbackSrc) {
      imageOptimizer.preloadImage(processedSrc)
        .then(() => setImageLoaded(true))
        .catch(() => setImageError(true));
    } else {
      setImageError(true);
      setImageLoaded(true);
    }
  }, [processedSrc, fallbackSrc]);

  const finalSrc = imageError ? fallbackSrc : optimizedSrc;

  return (
    <div className="image-with-fallback-container" style={{ position: 'relative', display: 'inline-block' }}>
      {/* Loading placeholder */}
      {showPlaceholder && !imageLoaded && !imageError && (
        <div 
          className="image-placeholder d-flex align-items-center justify-content-center bg-light"
          style={{
            width: width || '100%',
            height: height || '200px',
            borderRadius: style.borderRadius || '0.375rem',
            ...style
          }}
        >
          <div className="spinner-border spinner-border-sm text-muted" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={finalSrc}
        alt={alt}
        className={`${className} ${imageLoaded ? 'd-block' : 'd-none'}`}
        width={width}
        height={height}
        style={{
          objectFit: 'cover',
          ...style
        }}
        loading={loading}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
      />
    </div>
  );
};

export default ImageWithFallback;
