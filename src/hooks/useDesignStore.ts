import { create } from 'zustand';

interface DesignStore {
  imageUrl: string | null;
  color: string;
  size: string;
  material: string;
  setImageUrl: (url: string | null) => void;
  setColor: (color: string) => void;
  setSize: (size: string) => void;
  setMaterial: (material: string) => void;
}

export const useDesignStore = create<DesignStore>((set) => ({
  imageUrl: null,
  color: '#ffffff',
  size: 'M',
  material: 'Coton',
  setImageUrl: (url) => set({ imageUrl: url }),
  setColor: (color) => set({ color }),
  setSize: (size) => set({ size }),
  setMaterial: (material) => set({ material }),
}));
