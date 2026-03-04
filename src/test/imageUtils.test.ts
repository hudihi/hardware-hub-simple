import { getProductImageUrl, processImageUrl } from '../utils/imageUrlUtils';

// Mock API_BASE_URL for testing
const mockApiBaseUrl = 'https://api.pahala.store';

// Test data matching your API response structure
const testProducts = [
  {
    name: 'Lionel Stark',
    image_url: null,
    images: [
      {
        url: '/media/products/23fc0773-ed94-41eb-9d1e-4b2ada791dfa/575cde83f83a43049e08bebbd1bcc2ec.png',
        is_primary: true,
        id: '40f70162-d938-48df-95f7-3ef132006ea1',
        product_id: '23fc0773-ed94-41eb-9d1e-4b2ada791dfa',
        created_at: '2026-03-02T11:22:48.883531Z'
      }
    ]
  },
  {
    name: 'Germaine Cunningham',
    image_url: null,
    images: []
  },
  {
    name: 'External Image Product',
    image_url: 'https://example.com/image.jpg',
    images: []
  }
];

// Test the image URL processing
console.log('=== Testing Image URL Processing ===');

testProducts.forEach((product, index) => {
  const imageUrl = getProductImageUrl(product);
  console.log(`Product ${index + 1}: ${product.name}`);
  console.log(`Image URL: ${imageUrl}`);
  console.log('---');
});

// Test individual URL processing
console.log('\n=== Testing Individual URL Processing ===');
const testUrls = [
  '/media/products/test.png',
  'https://example.com/image.jpg',
  null,
  '',
  undefined
];

testUrls.forEach((url, index) => {
  const processedUrl = processImageUrl(url);
  console.log(`URL ${index + 1}: ${url} -> ${processedUrl}`);
});

export {};
