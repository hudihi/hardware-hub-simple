import { Product, Category } from '../types';

export const categories: Category[] = [
  { id: 'tools', name: 'Tools', icon: 'bi-tools' },
  { id: 'electrical', name: 'Electrical', icon: 'bi-lightning' },
  { id: 'plumbing', name: 'Plumbing', icon: 'bi-droplet' },
  { id: 'paint', name: 'Paint', icon: 'bi-palette' },
  { id: 'building', name: 'Building', icon: 'bi-bricks' },
  { id: 'garden', name: 'Garden', icon: 'bi-flower1' },
];

export const products: Product[] = [
  // Tools
  {
    id: 'prod-001',
    name: 'Heavy Duty Hammer',
    description: 'Professional grade steel hammer with rubber grip handle. Perfect for construction and DIY projects.',
    price: 85000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400',
    category: 'tools',
    stock: 50,
  },
  {
    id: 'prod-002',
    name: 'Screwdriver Set (12pcs)',
    description: 'Complete set of flathead and Phillips screwdrivers in various sizes.',
    price: 125000,
    unit: 'set',
    image: 'https://images.unsplash.com/photo-1580402427914-a6cc60d7b44f?w=400',
    category: 'tools',
    stock: 35,
  },
  {
    id: 'prod-003',
    name: 'Power Drill 500W',
    description: 'Cordless power drill with rechargeable battery. Includes drill bits set.',
    price: 450000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    category: 'tools',
    stock: 20,
  },
  {
    id: 'prod-004',
    name: 'Measuring Tape 5m',
    description: 'Professional measuring tape with auto-lock feature.',
    price: 35000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
    category: 'tools',
    stock: 100,
  },
  // Electrical
  {
    id: 'prod-005',
    name: 'LED Bulb 12W (Pack of 3)',
    description: 'Energy-efficient LED bulbs with warm white light. Long lasting.',
    price: 75000,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1532007794683-c1ec1f03ff4b?w=400',
    category: 'electrical',
    stock: 200,
  },
  {
    id: 'prod-006',
    name: 'Extension Cord 5m',
    description: '5-meter extension cord with 4 outlets and surge protection.',
    price: 95000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=400',
    category: 'electrical',
    stock: 45,
  },
  {
    id: 'prod-007',
    name: 'Electrical Wire 2.5mm (10m)',
    description: 'High quality copper electrical wire for residential wiring.',
    price: 120000,
    unit: 'roll',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'electrical',
    stock: 60,
  },
  // Plumbing
  {
    id: 'prod-008',
    name: 'PVC Pipe 3/4" (4m)',
    description: 'Durable PVC pipe for water supply systems.',
    price: 45000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    category: 'plumbing',
    stock: 150,
  },
  {
    id: 'prod-009',
    name: 'Water Faucet Chrome',
    description: 'Modern chrome finish water faucet for kitchen or bathroom.',
    price: 185000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    category: 'plumbing',
    stock: 30,
  },
  {
    id: 'prod-010',
    name: 'Pipe Wrench 12"',
    description: 'Heavy duty adjustable pipe wrench for plumbing work.',
    price: 145000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
    category: 'plumbing',
    stock: 25,
  },
  // Paint
  {
    id: 'prod-011',
    name: 'Wall Paint White 5L',
    description: 'Premium interior wall paint with excellent coverage.',
    price: 250000,
    unit: 'bucket',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
    category: 'paint',
    stock: 40,
  },
  {
    id: 'prod-012',
    name: 'Paint Brush Set (5pcs)',
    description: 'Professional paint brush set in various sizes.',
    price: 65000,
    unit: 'set',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400',
    category: 'paint',
    stock: 80,
  },
  {
    id: 'prod-013',
    name: 'Paint Roller with Tray',
    description: 'Complete paint roller set with tray for easy painting.',
    price: 55000,
    unit: 'set',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    category: 'paint',
    stock: 55,
  },
  // Building Materials
  {
    id: 'prod-014',
    name: 'Cement 50kg',
    description: 'Portland cement for general construction purposes.',
    price: 75000,
    unit: 'sack',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    category: 'building',
    stock: 500,
  },
  {
    id: 'prod-015',
    name: 'Sand (1 cubic meter)',
    description: 'Fine construction sand for concrete mixing.',
    price: 350000,
    unit: 'cubic',
    image: 'https://images.unsplash.com/photo-1533514114760-4c7e41c5ef77?w=400',
    category: 'building',
    stock: 100,
  },
  {
    id: 'prod-016',
    name: 'Steel Rebar 10mm (6m)',
    description: 'Reinforcement steel bar for concrete structures.',
    price: 95000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    category: 'building',
    stock: 300,
  },
  // Garden
  {
    id: 'prod-017',
    name: 'Garden Hose 15m',
    description: 'Flexible garden hose with spray nozzle.',
    price: 175000,
    unit: 'pcs',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    category: 'garden',
    stock: 35,
  },
  {
    id: 'prod-018',
    name: 'Garden Shovel',
    description: 'Sturdy steel shovel with wooden handle.',
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
