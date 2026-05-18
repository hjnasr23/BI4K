# 🖨️ Print-on-Demand Platform — Antigravity Vibe Coding Instructions

> **Read this entire file before writing a single line of code.**
> This is your source of truth. The project already has a working foundation — your job is to continue and complete it.

---

## 📦 What Already Exists (DO NOT REWRITE)

The frontend scaffold is already committed. Here's what's **done and working**:

### ✅ Pages
| Route | Status | Description |
|---|---|---|
| `/` | ✅ Done | Hero + features section + products grid |
| `/products` | ✅ Done | Full product catalog (4 items) |
| `/product/[id]` | ✅ Done | Product customization page |

### ✅ Components (`src/components/product/`)
| Component | Status | What it does |
|---|---|---|
| `ProductPreview.tsx` | ✅ Done | Fabric.js canvas — real-time design editor |
| `AIGenerator.tsx` | ✅ Done | Prompt input → calls `/api/ai/generate` → puts image on canvas |
| `ImageUploader.tsx` | ✅ Done | Drag & drop image upload (react-dropzone) |
| `PersonalizationPanel.tsx` | ✅ Done | Color picker (react-colorful), size select, material select |
| `RegistrationModal.tsx` | ✅ Done | Email collection modal triggered before AI generation |

### ✅ State
- **Zustand store** at `src/hooks/useDesignStore.ts` — holds `imageUrl`, `color`, `size`, `material`, `setImage`, `setColor`, `setSize`, `setMaterial`

### ✅ Tech Stack (keep all of this)
- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + custom CSS vars (`--primary-yellow: #facc15`, `--primary-blue: #3b82f6`)
- **Canvas**: Fabric.js v7
- **State**: Zustand
- **HTTP**: Axios + TanStack Query
- **AI**: Hugging Face Stable Diffusion (via internal API route `/api/ai/generate`)
- **Color picker**: react-colorful
- **Drag & drop**: react-dropzone

### ✅ Design System
- `btn-primary` = blue pill button (`#3b82f6`, white text, rounded-full)
- `btn-secondary` = yellow pill button (`#facc15`, dark text, rounded-full)
- Color palette: Yellow (`#facc15`) + Blue (`#3b82f6`) + White
- Body font: Inter
- Body bg: `linear-gradient(135deg, #fefce8 0%, #ffffff 100%)`
- Cards: `rounded-2xl shadow-xl bg-white`

---

## 🚧 What Needs To Be Built (Your Mission)

Work in this order. Complete each section before moving to the next.

---

## 1. 🗂️ Layout Components

### 1a. `src/components/layout/Header.tsx`
- Logo on left: text "PrintAI" with a 🖨️ icon, links to `/`
- Nav links: `Produits` → `/products`, `Mon compte` → `/account`
- Right side: Cart icon with item count badge (read from cart store), `Se connecter` button → `/auth/login`
- Sticky at top, white background with bottom border, backdrop-blur
- Mobile: hamburger menu that shows nav as dropdown

### 1b. `src/components/layout/Footer.tsx`
- 3 columns: Brand info | Links (Accueil, Produits, FAQ) | Contact (email, social icons)
- Dark background (`#1e293b`), white text
- Bottom bar: "© 2025 PrintAI. Tous droits réservés."

### 1c. `src/app/layout.tsx` — UPDATE (don't replace, just add)
- Wrap children with `<Header />` and `<Footer />`
- Keep existing metadata and body font setup

---

## 2. 🛒 Cart System

### 2a. `src/hooks/useCartStore.ts`
Zustand store with this shape:
```ts
interface CartItem {
  id: string;           // unique item id (uuid)
  productId: string;    // e.g. "tshirt-1"
  productName: string;
  price: number;
  quantity: number;
  size: string;
  material: string;
  color: string;
  designImageUrl: string | null;  // base64 or URL of the user's design
  mockupUrl: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}
```
- Use `persist` middleware to save to localStorage

### 2b. Update `src/app/product/[id]/page.tsx` — UPDATE the "Ajouter au panier" button
- On click: read current state from `useDesignStore` and `useCartStore`, call `addItem()`
- Show a toast/alert: "✅ Produit ajouté au panier !"
- The button should become briefly green then reset

### 2c. `src/app/cart/page.tsx` — NEW PAGE
Layout:
- Left column (2/3 width): list of cart items
  - Each item: mockup thumbnail (small), product name, size, material, color swatch, qty stepper (+/-), delete button, price
  - Empty state: "Votre panier est vide 🛒" with CTA button to `/products`
- Right column (1/3 width): order summary card
  - Subtotal, Livraison (free if > 50€, else 4.99€), Total
  - Big CTA button: "Passer commande" → navigates to `/checkout`

### 2d. `src/components/layout/CartDrawer.tsx` (optional but nice)
- Slide-in drawer from right when cart icon in header is clicked
- Shows cart items list with checkout CTA
- Close button (X)

---

## 3. 🔐 Auth Pages (UI only, no real backend needed yet)

### 3a. `src/app/auth/login/page.tsx`
- Email + password inputs
- "Se connecter" button (logs to console for now, shows "Connexion simulée ✅" toast)
- "Pas de compte ? S'inscrire" link → `/auth/register`
- Google sign-in button (UI only, disabled with tooltip "Bientôt disponible")
- Centered card layout, gradient background

### 3b. `src/app/auth/register/page.tsx`
- Name, email, password, confirm password
- "Créer mon compte" button (simulated)
- Link back to login
- Same card style as login

---

## 4. 💳 Checkout Flow

### 4a. `src/app/checkout/page.tsx`
Single page with 3 visible steps (stepper component at top):

**Step 1 — Livraison**
- Form: Prénom, Nom, Email, Téléphone, Adresse, Code postal, Ville, Pays (select, default France)
- "Continuer" button → go to step 2

**Step 2 — Paiement**
- Show Stripe-like card input UI (just visual, no real Stripe needed yet):
  - Card number field (formatted as `XXXX XXXX XXXX XXXX`)
  - Expiry + CVV side by side
  - Cardholder name
- "Payer [total]€" button → go to step 3

**Step 3 — Confirmation**
- Show order summary (items from cart)
- Generate fake order number: `CMD-${Date.now()}`
- "Votre commande est confirmée ! 🎉" big message
- Call `clearCart()` on mount
- CTA: "Voir mes commandes" → `/account/orders`

### 4b. `src/components/checkout/Stepper.tsx`
- Visual step indicator: Step 1 (✔ / active / inactive), Step 2, Step 3
- Props: `currentStep: number`

---

## 5. 👤 Account / Dashboard

### 5a. `src/app/account/page.tsx`
- Display: avatar placeholder (initials), name, email
- Quick links: "Mes commandes", "Mes designs", "Paramètres"
- Fake user data (hardcode for now): `{ name: "Alex Dupont", email: "alex@example.com" }`

### 5b. `src/app/account/orders/page.tsx`
- List of fake orders (hardcode 2-3 sample orders):
```ts
[
  { id: "CMD-1712345678", date: "2025-04-05", status: "Livré", items: 2, total: 39.98 },
  { id: "CMD-1712399000", date: "2025-04-15", status: "En cours", items: 1, total: 19.99 },
]
```
- Each order: order number, date, status badge (color-coded: green=Livré, blue=En cours, orange=En attente), number of items, total price, "Voir détails" button (links to `/account/orders/[id]`, just shows the same data for now)
- Status badge styles:
  - `Livré` → green pill
  - `En cours` → blue pill
  - `En attente` → orange pill

---

## 6. 🤖 AI API Route (Backend)

### `src/app/api/ai/generate/route.ts`
This route is already being called by `AIGenerator.tsx`. Build it properly:

```ts
// POST /api/ai/generate
// Body: { prompt: string }
// Returns: { imageUrl: string }
```

Logic:
1. Validate: prompt must be non-empty string, max 500 chars
2. Call Hugging Face API:
   ```
   POST https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1
   Authorization: Bearer ${process.env.HUGGINGFACE_API_KEY}
   Body: { inputs: prompt }
   ```
3. Response is a binary image blob — convert to base64 data URL: `data:image/png;base64,...`
4. Return `{ imageUrl: base64DataUrl }`
5. On error: return `{ imageUrl: "https://via.placeholder.com/512x512.png?text=Demo+Design" }` with status 200 (graceful fallback)
6. Set rate limit hint header: `X-RateLimit-Remaining: 5`

**`.env.local`** (already exists, just add):
```
HUGGINGFACE_API_KEY=hf_your_token_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. 🔍 Product Search & Filter

### Update `src/app/products/page.tsx`
Add above the grid:
- Search bar: text input, filters products by name in real-time (client-side, no API needed)
- Category tabs: `Tous | T-Shirts | Mugs | Hoodies | Casquettes`
- Sort dropdown: `Prix croissant | Prix décroissant | Nouveautés`
- All filtering/sorting happens client-side with `useState` + `useMemo`

Expand the product list to 8 items (add 4 more):
```ts
{ id: 'tote-1', name: 'Tote Bag', price: 14.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', category: 'Accessories' },
{ id: 'poster-1', name: 'Poster A3', price: 9.99, image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500', category: 'Déco' },
{ id: 'phone-case-1', name: 'Coque iPhone', price: 16.99, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500', category: 'Accessories' },
{ id: 'hoodie-2', name: 'Zip Hoodie', price: 44.99, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', category: 'Hoodies' },
```

---

## 8. 📱 Missing Utility Pages

### 8a. `src/app/not-found.tsx`
- Custom 404 page
- "404 — Page introuvable" heading
- Fun illustration (use a big emoji like 🔍 or 😵)
- CTA button back to home

### 8b. `src/app/loading.tsx`
- Global loading skeleton
- Spinner centered on screen
- Use Tailwind animate-spin on a border-based spinner

### 8c. `src/app/faq/page.tsx`
- Accordion-style FAQ (no external library, pure CSS/React state)
- 6 questions:
  1. Comment fonctionne la génération IA ?
  2. Quels formats d'image sont acceptés ?
  3. Combien de temps prend la livraison ?
  4. Puis-je retourner un produit personnalisé ?
  5. Comment suivre ma commande ?
  6. L'IA génère-t-elle du contenu illégal ?

---

## 9. 🎨 Product Catalog — Update `productsDB`

In `src/app/product/[id]/page.tsx`, the `productsDB` object needs to be expanded and moved to a shared file.

Create `src/data/products.ts`:
```ts
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
};
```

Then import it in both `/products/page.tsx` and `/product/[id]/page.tsx`.

---

## 10. 🧹 TypeScript Types

Create/update `src/types/product.ts`:
```ts
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

export interface Order {
  id: string;
  date: string;
  status: 'En attente' | 'En cours' | 'Livré' | 'Annulé';
  items: CartItem[];
  total: number;
  shippingAddress?: ShippingAddress;
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
```

---

## ⚙️ Project Rules (NEVER break these)

1. **Keep French** — All UI text is in French. No mixing with English.
2. **Keep the color palette** — Yellow (#facc15) + Blue (#3b82f6) + White. No random new colors.
3. **No breaking changes** — Don't modify `ProductPreview.tsx`, `AIGenerator.tsx`, `useDesignStore.ts` unless the task explicitly says to update them.
4. **TypeScript strict** — No `any` types. Define interfaces for everything.
5. **Client components** — Any component using hooks, events, or state must have `'use client'` at the top.
6. **Server components by default** — Pages that just render data (no interactivity) stay as server components.
7. **Tailwind only** — No external CSS-in-JS. No inline styles unless dynamically computed (e.g., color swatches).
8. **Modular** — One component per file. No god files.
9. **No `console.error` silenced** — Handle errors properly.
10. **No placeholder-only TODOs** — If you write a function, implement it fully.

---

## 🗺️ Final File Tree (target state)

```
src/
├── app/
│   ├── layout.tsx                    ✅ UPDATE (add Header/Footer)
│   ├── page.tsx                      ✅ Done
│   ├── loading.tsx                   🔨 Build
│   ├── not-found.tsx                 🔨 Build
│   ├── globals.css                   ✅ Done
│   ├── products/
│   │   └── page.tsx                  ✅ UPDATE (add search/filter)
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx              ✅ UPDATE (wire cart button)
│   ├── cart/
│   │   └── page.tsx                  🔨 Build
│   ├── checkout/
│   │   └── page.tsx                  🔨 Build
│   ├── account/
│   │   ├── page.tsx                  🔨 Build
│   │   └── orders/
│   │       └── page.tsx              🔨 Build
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx              🔨 Build
│   │   └── register/
│   │       └── page.tsx              🔨 Build
│   ├── faq/
│   │   └── page.tsx                  🔨 Build
│   └── api/
│       └── ai/
│           └── generate/
│               └── route.ts          🔨 Build
├── components/
│   ├── layout/
│   │   ├── Header.tsx                🔨 Build
│   │   ├── Footer.tsx                🔨 Build
│   │   └── CartDrawer.tsx            🔨 Build (optional)
│   ├── checkout/
│   │   └── Stepper.tsx               🔨 Build
│   └── product/
│       ├── AIGenerator.tsx           ✅ Done
│       ├── ImageUploader.tsx         ✅ Done
│       ├── PersonalizationPanel.tsx  ✅ Done
│       ├── ProductPreview.tsx        ✅ Done
│       └── RegistrationModal.tsx     ✅ Done
├── data/
│   └── products.ts                   🔨 Build
├── hooks/
│   ├── useDesignStore.ts             ✅ Done
│   ├── useCartStore.ts               🔨 Build
│   ├── useGenerateImage.ts           (exists, empty — fill in)
│   └── useUploadImage.ts             (exists, empty — fill in)
├── services/
│   ├── aiService.ts                  (exists, empty — fill in)
│   ├── apiClient.ts                  (exists, empty — fill in)
│   ├── productService.ts             (exists, empty — fill in)
│   └── uploadService.ts             (exists, empty — fill in)
├── types/
│   ├── product.ts                    🔨 Build
│   └── api.ts                        🔨 Build
└── utils/
    ├── canvasHelpers.ts              (exists, empty — fill in)
    ├── constants.ts                  (exists, empty — fill in)
    └── validators.ts                 (exists, empty — fill in)
```

---

## 🧪 Smoke Test Checklist

After building, manually verify:

- [ ] Home page loads, "Découvrir les produits" navigates to `/products`
- [ ] Products page shows 8 products, search filters in real-time
- [ ] Clicking "Personnaliser" on any product loads the canvas page
- [ ] Uploading an image shows it on the Fabric.js canvas
- [ ] Entering a prompt and clicking "Générer" opens the modal, then calls `/api/ai/generate`
- [ ] Color picker changes the product background overlay color on canvas
- [ ] Size and material dropdowns work
- [ ] "Ajouter au panier" adds the item and shows a toast
- [ ] Cart icon in header shows the correct count
- [ ] `/cart` shows items, qty steppers work, total is correct
- [ ] Checkout stepper moves through all 3 steps
- [ ] Step 3 shows order number and clears cart
- [ ] `/account/orders` shows the fake order list with correct badges
- [ ] 404 page shows on bad URLs

---

## 🚀 Getting Started

```bash
cd print-on-demand-frontend
npm install
cp .env.local.example .env.local   # fill in HUGGINGFACE_API_KEY
npm run dev
```

Open: http://localhost:3000

---

*Generated instruction file for Antigravity. Last updated: May 2026.*
