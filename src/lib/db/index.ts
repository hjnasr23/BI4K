// ─────────────────────────────────────────────────────────────
// src/lib/db/index.ts
// Single barrel export — import everything from '@/lib/db'
// ─────────────────────────────────────────────────────────────

// Clients
export { browserClient, serverClient, adminClient, supabase } from './client';

// Types
export type {
  Database,
  UUID,
  ISODate,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PrintSupport,
  Lang,
  ShippingAddress,
  CustomizationData,
  UserProfile,
  Category,
  Product,
  Mockup,
  Design,
  UserDesign,
  Cart,
  CartItem,
  Commande,
  LigneCommande,
  InsertCategory,
  InsertProduct,
  InsertDesign,
  InsertUserDesign,
  InsertCartItem,
  InsertCommande,
  InsertLigneCommande,
} from './types';

// Query helpers
export {
  // Categories
  getCategories,
  getCategoryById,
  insertCategory,
  deleteCategory,
  // Products
  getProducts,
  getProductById,
  insertProduct,
  updateProduct,
  deleteProduct,
  // Mockups
  getMockups,
  // Designs
  getDesignsByUser,
  insertDesign,
  deleteDesign,
  // User Designs
  getUserDesigns,
  insertUserDesign,
  deleteUserDesign,
  // Cart
  getOrCreateCart,
  getCartWithItems,
  addCartItem,
  updateCartItemQty,
  removeCartItem,
  clearCart,
  // Orders
  getOrdersByUser,
  getOrderById,
  insertOrder,
  updateOrderStatus,
  // Profile
  getProfile,
  updateProfile,
  // Admin
  adminGetAllOrders,
  adminGetStats,
} from './queries';
