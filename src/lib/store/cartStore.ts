import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DesignCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface CartItem {
  id: string; // Product ID
  name: string;
  price: number;
  size: string;
  quantity: number;
  cartItemId: string; // Generated unique UUID to distinguish variations
  image_url: string; // Clean product support image (e.g., Hoodie photo from DB)
  design_url?: string | null; // Isolated transparent custom design URL
  coordinates?: DesignCoordinates | null; // Exact placement metadata for industrial printing
  // Legacy fields kept for backward compatibility with existing orders in DB
  mockupUrl?: string;
  finalMockup?: string;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      
      addToCart: (item) =>
        set((state) => {
          const cartItemId = generateUUID();
          return {
            items: [...state.items, { ...item, cartItemId }],
          };
        }),
        
      removeFromCart: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        })),
        
      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),
        
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'printforge-cart', // Unique name in localStorage
    }
  )
);
