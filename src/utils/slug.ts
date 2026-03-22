/**
 * Creates a URL-friendly slug from a product name
 * @param name - The product name to convert to a slug
 * @returns A URL-safe slug string
 */
export const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Creates a product URL with slug and short ID for security
 * @param id - The full product UUID
 * @param name - The product name
 * @returns A secure product URL path
 */
export const createProductUrl = (id: string, name: string): string => {
  const slug = createSlug(name);
  // Use first 8 characters of UUID for uniqueness while keeping it short
  const shortId = id.substring(0, 8);
  return `/products/${slug}-${shortId}`;
};

/**
 * Extracts the product short ID from a slug-based URL
 * @param slugWithId - The slug with short ID (e.g., "power-drill-abc12345")
 * @returns The short ID (first 8 chars) if found, null otherwise
 */
export const extractProductIdFromSlug = (slugWithId: string): string | null => {
  // Extract the short ID from the end of the slug
  const match = slugWithId.match(/([a-f0-9]{8})$/);
  if (!match) return null;
  
  return match[1];
};
