export interface Product {
  id: string;
  name: string;
  mockupUrl: string;
  basePrice: number;
  category: string;
  description: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size: string;
  material: string;
  color: string;
  designImageUrl: string | null;
  mockupUrl: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'En attente' | 'En cours' | 'Livré' | 'Annulé';
  items: CartItem[];
  total: number;
  shippingAddress?: ShippingAddress;
}
