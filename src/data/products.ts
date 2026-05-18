export interface Product {
  id: string;
  name: string;
  mockupUrl: string;
  basePrice: number;
  category: string;
  description: string;
}

export const productsDB: Record<string, Product> = {
  'tshirt-1': {
    id: 'tshirt-1',
    name: 'Classic T-Shirt',
    mockupUrl: 'https://via.placeholder.com/400x500/ffffff/000000?text=T-Shirt',
    basePrice: 19.99,
    category: 'T-Shirts',
    description: 'T-shirt 100% coton, coupe classique et confortable.',
  },
  'mug-1': {
    id: 'mug-1',
    name: 'Ceramic Mug',
    mockupUrl: 'https://via.placeholder.com/400x400/ffffff/000000?text=Mug',
    basePrice: 12.99,
    category: 'Mugs',
    description: 'Mug en céramique 330ml, lavable au lave-vaisselle.',
  },
  'hoodie-1': {
    id: 'hoodie-1',
    name: 'Cozy Hoodie',
    mockupUrl: 'https://via.placeholder.com/400x500/1e293b/ffffff?text=Hoodie',
    basePrice: 39.99,
    category: 'Hoodies',
    description: 'Sweat à capuche doublé, chaud et stylé.',
  },
  'cap-1': {
    id: 'cap-1',
    name: 'Baseball Cap',
    mockupUrl: 'https://via.placeholder.com/400x300/ffffff/000000?text=Cap',
    basePrice: 15.99,
    category: 'Casquettes',
    description: 'Casquette ajustable, broderie disponible.',
  },
  'tote-1': {
    id: 'tote-1',
    name: 'Tote Bag',
    mockupUrl: 'https://via.placeholder.com/400x400/f5f5f0/333333?text=Tote+Bag',
    basePrice: 14.99,
    category: 'Accessories',
    description: 'Tote bag en coton bio, anses renforcées.',
  },
  'poster-1': {
    id: 'poster-1',
    name: 'Poster A3',
    mockupUrl: 'https://via.placeholder.com/400x560/ffffff/000000?text=Poster',
    basePrice: 9.99,
    category: 'Déco',
    description: 'Poster format A3, impression haute qualité.',
  },
  'phone-case-1': {
    id: 'phone-case-1',
    name: 'Coque iPhone',
    mockupUrl: 'https://via.placeholder.com/300x500/ffffff/000000?text=Coque',
    basePrice: 16.99,
    category: 'Accessories',
    description: 'Coque rigide pour iPhone, protection intégrale.',
  },
  'hoodie-2': {
    id: 'hoodie-2',
    name: 'Zip Hoodie',
    mockupUrl: 'https://via.placeholder.com/400x500/000000/ffffff?text=Zip+Hoodie',
    basePrice: 44.99,
    category: 'Hoodies',
    description: 'Sweat zippé avec poches, coupe ajustée.',
  },
};

export const allProducts: Product[] = Object.values(productsDB);
