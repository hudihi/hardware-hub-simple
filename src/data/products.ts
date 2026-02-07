import { Product, Category } from '../types';

export const categories: Category[] = [
  { id: 'tools', name: 'Vifaa', icon: 'bi-tools' },
  { id: 'electrical', name: 'Umeme', icon: 'bi-lightning' },
  { id: 'plumbing', name: 'Mabomba', icon: 'bi-droplet' },
  { id: 'paint', name: 'Rangi', icon: 'bi-palette' },
  { id: 'building', name: 'Ujenzi', icon: 'bi-bricks' },
  { id: 'garden', name: 'Bustani', icon: 'bi-flower1' },
];

export const products: Product[] = [
  // Tools - Vifaa
  {
    id: 'prod-001',
    name: 'Nyundo Kubwa',
    description: 'Nyundo ya chuma imara na mpini wa mpira. Inafaa kwa kazi za ujenzi.',
    price: 85000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400',
    category: 'tools',
    stock: 50,
  },
  {
    id: 'prod-002',
    name: 'Seti ya Skrudreva (12pcs)',
    description: 'Seti kamili ya skrudreva za aina mbalimbali.',
    price: 125000,
    unit: 'seti',
    image: 'https://images.unsplash.com/photo-1580402427914-a6cc60d7b44f?w=400',
    category: 'tools',
    stock: 35,
  },
  {
    id: 'prod-003',
    name: 'Drili ya Umeme 500W',
    description: 'Drili ya umeme yenye betri inayojazwa upya. Inakuja na seti ya bits.',
    price: 450000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    category: 'tools',
    stock: 20,
  },
  {
    id: 'prod-004',
    name: 'Tepi ya Kupima 5m',
    description: 'Tepi ya kupima ya kitaalamu yenye kufunga kiatomati.',
    price: 35000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    category: 'tools',
    stock: 100,
  },
  // Electrical - Umeme
  {
    id: 'prod-005',
    name: 'Balbu LED 12W (Pakiti 3)',
    description: 'Balbu za LED zinazookoa umeme na mwanga mweupe. Zinadumu sana.',
    price: 75000,
    unit: 'pakiti',
    image: 'https://images.unsplash.com/photo-1532007794683-c1ec1f03ff4b?w=400',
    category: 'electrical',
    stock: 200,
  },
  {
    id: 'prod-006',
    name: 'Waya wa Kuongeza 5m',
    description: 'Waya wa kuongeza mita 5 wenye sockets 4 na ulinzi wa umeme.',
    price: 95000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=400',
    category: 'electrical',
    stock: 45,
  },
  {
    id: 'prod-007',
    name: 'Waya wa Umeme 2.5mm (10m)',
    description: 'Waya wa shaba bora kwa ajili ya wiring ya nyumbani.',
    price: 120000,
    unit: 'roli',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'electrical',
    stock: 60,
  },
  // Plumbing - Mabomba
  {
    id: 'prod-008',
    name: 'Bomba la PVC 3/4" (4m)',
    description: 'Bomba la PVC imara kwa mfumo wa maji.',
    price: 45000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    category: 'plumbing',
    stock: 150,
  },
  {
    id: 'prod-009',
    name: 'Bomba la Maji Chrome',
    description: 'Bomba la maji la kisasa lenye rangi ya chrome kwa jikoni au bafuni.',
    price: 185000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    category: 'plumbing',
    stock: 30,
  },
  {
    id: 'prod-010',
    name: 'Spana ya Bomba 12"',
    description: 'Spana kubwa inayobadilika kwa kazi za mabomba.',
    price: 145000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
    category: 'plumbing',
    stock: 25,
  },
  // Paint - Rangi
  {
    id: 'prod-011',
    name: 'Rangi ya Ukuta Nyeupe 5L',
    description: 'Rangi bora ya ukuta wa ndani yenye ufunikaji mzuri.',
    price: 250000,
    unit: 'ndoo',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
    category: 'paint',
    stock: 40,
  },
  {
    id: 'prod-012',
    name: 'Seti ya Brashi za Rangi (5pcs)',
    description: 'Seti ya brashi za rangi za kitaalamu za ukubwa mbalimbali.',
    price: 65000,
    unit: 'seti',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400',
    category: 'paint',
    stock: 80,
  },
  {
    id: 'prod-013',
    name: 'Rola ya Rangi na Trei',
    description: 'Seti kamili ya rola ya rangi na trei kwa upakaji rahisi.',
    price: 55000,
    unit: 'seti',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'paint',
    stock: 55,
  },
  // Building Materials - Vifaa vya Ujenzi
  {
    id: 'prod-014',
    name: 'Saruji 50kg',
    description: 'Saruji ya Portland kwa matumizi ya ujenzi wa kawaida.',
    price: 75000,
    unit: 'mfuko',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    category: 'building',
    stock: 500,
  },
  {
    id: 'prod-015',
    name: 'Mchanga (mita 1 ya ujazo)',
    description: 'Mchanga laini wa ujenzi kwa kuchanganya zege.',
    price: 350000,
    unit: 'ujazo',
    image: 'https://images.unsplash.com/photo-1533514114760-4c7e41c5ef77?w=400',
    category: 'building',
    stock: 100,
  },
  {
    id: 'prod-016',
    name: 'Chuma cha Kuimarisha 10mm (6m)',
    description: 'Chuma cha kuimarisha kwa miundo ya zege.',
    price: 95000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    category: 'building',
    stock: 300,
  },
  // Garden - Bustani
  {
    id: 'prod-017',
    name: 'Hose ya Bustani 15m',
    description: 'Hose laini ya bustani yenye nozzle ya kunyunyiza.',
    price: 175000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    category: 'garden',
    stock: 35,
  },
  {
    id: 'prod-018',
    name: 'Koleo la Bustani',
    description: 'Koleo imara la chuma lenye mpini wa mbao.',
    price: 95000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    category: 'garden',
    stock: 45,
  },
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(product => product.category === categoryId);
};

export const getProductById = (productId: string): Product | undefined => {
  return products.find(product => product.id === productId);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
  );
};
