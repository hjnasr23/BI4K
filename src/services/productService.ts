import { allProducts, productsDB, Product } from '@/data/products';

export const getProducts = (): Product[] => allProducts;
export const getProduct = (id: string): Product | null => productsDB[id] ?? null;
