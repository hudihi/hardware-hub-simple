import { API_BASE_URL } from '../services/api';

/**
 * Processes image URLs from API responses to handle both external URLs and local uploads
 * 
 * @param imageUrl The image URL from API response (can be external URL or relative path)
 * @returns Processed URL ready for display
 */
export const processImageUrl = (imageUrl: string | null | undefined): string => {
  // Handle null/undefined
  if (!imageUrl) {
    console.log('processImageUrl: null/undefined -> /placeholder.svg');
    return '/placeholder.svg';
  }
  
  // If it's already a full URL (starts with http), return as is
  if (imageUrl.startsWith('http')) {
    console.log(`processImageUrl: external URL -> ${imageUrl}`);
    return imageUrl;
  }
  
  // If it's a relative path starting with /media/, prepend the base URL
  if (imageUrl.startsWith('/media/')) {
    const fullUrl = `${API_BASE_URL}${imageUrl}`;
    console.log(`processImageUrl: media path -> ${fullUrl}`);
    return fullUrl;
  }
  
  // If it starts with / but not /media/, it might be a local path
  if (imageUrl.startsWith('/') && !imageUrl.startsWith('/media/')) {
    const fullUrl = `${API_BASE_URL}${imageUrl}`;
    console.log(`processImageUrl: other local path -> ${fullUrl}`);
    return fullUrl;
  }
  
  // Otherwise, return as is (might be a relative path or placeholder)
  console.log(`processImageUrl: fallback -> ${imageUrl}`);
  return imageUrl;
};

/**
 * Extracts the best image URL from product API response
 * Handles both image_url field and images array for uploaded images
 * 
 * @param product Product object from API response
 * @returns Best image URL for the product
 */
export const getProductImageUrl = (product: any): string => {
  console.log(`getProductImageUrl: Processing product ${product.name}`);
  
  // First try to get primary image from images array (for uploaded images)
  const primaryImage = product.images?.find((img: any) => img.is_primary);
  if (primaryImage?.url) {
    console.log(`getProductImageUrl: Found primary image: ${primaryImage.url}`);
    return processImageUrl(primaryImage.url);
  }
  
  // Fall back to image_url field (for external URLs)
  if (product.image_url) {
    console.log(`getProductImageUrl: Using image_url: ${product.image_url}`);
    return processImageUrl(product.image_url);
  }
  
  // Try the image field if it exists
  if (product.image) {
    console.log(`getProductImageUrl: Using image field: ${product.image}`);
    return processImageUrl(product.image);
  }
  
  // Default to placeholder
  console.log('getProductImageUrl: No image found, using placeholder');
  return '/placeholder.svg';
};

/**
 * Checks if an image URL is from an external source
 * 
 * @param imageUrl The image URL to check
 * @returns True if the image is from an external source
 */
export const isExternalImage = (imageUrl: string): boolean => {
  return imageUrl.startsWith('http') && !imageUrl.includes(API_BASE_URL);
};

/**
 * Checks if an image URL is a local upload
 * 
 * @param imageUrl The image URL to check
 * @returns True if the image is a local upload
 */
export const isLocalUpload = (imageUrl: string): boolean => {
  return imageUrl.startsWith('/media/') || imageUrl.includes(API_BASE_URL);
};
