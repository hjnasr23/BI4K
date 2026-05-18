# 🔨 Build Order — Print-on-Demand Frontend

This is your step-by-step task list. Do them in order.
Each task has acceptance criteria — don't move on until those are met.

---

## PHASE 1 — Foundation (do this first, everything else depends on it)

---

### TASK 1.1 — Data layer
**File**: `src/data/products.ts`

Create the shared product database. Export a `productsDB` object (Record<string, Product>) and an `allProducts` array.

Include these products:
- `tshirt-1` Classic T-Shirt $19.99
- `mug-1` Ceramic Mug $12.99
- `hoodie-1` Cozy Hoodie $39.99
- `cap-1` Baseball Cap $15.99
- `tote-1` Tote Bag $14.99
- `poster-1` Poster A3 $9.99
- `phone-case-1` Coque iPhone $16.99
- `hoodie-2` Zip Hoodie $44.99

Each product has: `id, name, mockupUrl, basePrice, category, description`

Use Unsplash URLs for images (use the same ones from the existing `/products` page and add more).

**Acceptance**: TypeScript compiles, no errors, both `productsDB` and `allProducts` export correctly.

---

### TASK 1.2 — TypeScript types
**File**: `src/types/product.ts`
**File**: `src/types/api.ts`

`product.ts` exports: `Product`, `CartItem`, `Order`, `ShippingAddress`
`api.ts` exports: `ApiResponse<T>`, `GenerateImageRequest`, `GenerateImageResponse`

**Acceptance**: All types used in later tasks import from here cleanly.

---

### TASK 1.3 — Cart Zustand store
**File**: `src/hooks/useCartStore.ts`

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/product';
import { v4 as uuidv4 } from 'uuid'; // add uuid to package.json if needed
```

Store shape:
```ts
{
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;      // auto-generates id
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;  // min qty = 1
  clearCart: () => void;
  totalItems: () => number;     // sum of all quantities
  totalPrice: () => number;     // sum of price * quantity
}
```

Use `persist` middleware with key `'printai-cart'`.

**Acceptance**: Adding an item, refreshing the page, and checking the store still shows the item.

---

### TASK 1.4 — Services layer (fill in empty files)
**Files**: `src/services/apiClient.ts`, `src/services/productService.ts`, `src/services/aiService.ts`, `src/services/uploadService.ts`

`apiClient.ts`:
```ts
import axios from 'axios';
export const apiClient = axios.create({ baseURL: '/api' });
```

`productService.ts`:
```ts
// For now returns from local data, ready to swap for real API
import { allProducts, productsDB } from '@/data/products';
export const getProducts = () => allProducts;
export const getProduct = (id: string) => productsDB[id] ?? null;
```

`aiService.ts`:
```ts
export const generateImage = async (prompt: string): Promise<string> => {
  const res = await apiClient.post<{ imageUrl: string }>('/ai/generate', { prompt });
  return res.data.imageUrl;
};
```

`uploadService.ts`:
```ts
// converts File to base64 data URL
export const fileToDataUrl = (file: File): Promise<string> => { ... }
```

**Acceptance**: No TypeScript errors, imports resolve.

---

### TASK 1.5 — Utility files (fill in empty files)
**Files**: `src/utils/constants.ts`, `src/utils/validators.ts`, `src/utils/canvasHelpers.ts`

`constants.ts`:
```ts
export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 4.99;
export const AI_FREE_GENERATIONS = 5;
```

`validators.ts`:
```ts
export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPrompt = (prompt: string): boolean => prompt.trim().length >= 3 && prompt.length <= 500;
export const isValidFileSize = (file: File): boolean => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
```

`canvasHelpers.ts`:
```ts
export const exportCanvasAsDataUrl = (canvas: any): string => canvas.toDataURL({ format: 'png', quality: 1 });
export const centerObject = (obj: any, canvas: any) => { ... };
```

**Acceptance**: Clean imports, no errors.

---

## PHASE 2 — Layout Shell

---

### TASK 2.1 — Header
**File**: `src/components/layout/Header.tsx`
`'use client'` — uses cart store and mobile menu state

Structure:
```
<header sticky top-0 z-50 bg-white/95 backdrop-blur border-b>
  <nav container mx-auto flex justify-between items-center h-16 px-4>
    [Logo: "🖨️ PrintAI" bold blue] [Nav links: Produits | FAQ] [Right: CartIcon + badge | Se connecter btn]
  </nav>
  [Mobile menu dropdown: slides down when hamburger clicked]
</header>
```

Cart icon: use a shopping bag emoji or SVG. Show item count as a red circle badge on top-right corner of icon. Read count from `useCartStore().totalItems()`.

**Acceptance**: Header appears on all pages. Cart count updates when item is added. Mobile menu works.

---

### TASK 2.2 — Footer
**File**: `src/components/layout/Footer.tsx`
Server component (no `'use client'`)

```
<footer bg-slate-800 text-white py-12>
  <div container mx-auto grid grid-cols-3>
    Col 1: Logo + tagline "Créez. Personnalisez. Portez."
    Col 2: Links — Accueil, Produits, FAQ, Contact
    Col 3: Email: contact@printai.fr | Icons: Twitter, Instagram, LinkedIn (SVG or emoji)
  </div>
  <div border-t mt-8 pt-4 text-center text-sm text-gray-400>
    © 2025 PrintAI. Tous droits réservés.
  </div>
</footer>
```

**Acceptance**: Footer appears on all pages, looks clean.

---

### TASK 2.3 — Update layout.tsx
**File**: `src/app/layout.tsx`

Import and add `<Header />` above `{children}` and `<Footer />` below inside `<body>`.

Keep all existing metadata, font, and body styles.

**Acceptance**: All pages now show header and footer.

---

## PHASE 3 — Cart & Checkout

---

### TASK 3.1 — Cart page
**File**: `src/app/cart/page.tsx`
`'use client'` (reads from cart store)

Layout (2-column on desktop, stacked on mobile):
```
Left (lg:col-span-2):
  - "Mon Panier" h1
  - If empty: big empty state with CTA to /products
  - List of cart items, each showing:
    - Small product image (50x50 or emoji placeholder)
    - Product name + size + material in gray
    - Color swatch (small circle with the item's color)
    - Quantity stepper: [−] [n] [+]
    - Price (unit × qty)
    - 🗑️ delete button (calls removeItem)

Right (lg:col-span-1):
  - "Récapitulatif" card
  - Sous-total: X.XX €
  - Livraison: Gratuite if subtotal >= 50, else 4.99 €
  - Total: bold, large
  - "Passer commande" btn-primary full width → /checkout
```

**Acceptance**: Adding a product and going to cart shows it. Qty stepper works. Delete works. Total recalculates.

---

### TASK 3.2 — Update product page "Add to Cart" button
**File**: `src/app/product/[id]/page.tsx`

The "Ajouter au panier" button already exists. Wire it up:
1. Make the page/button `'use client'`
2. Import `useCartStore` and `useDesignStore`
3. On click: call `addItem()` with data from both stores + product data
4. Show a 2-second toast: "✅ Ajouté au panier !" (green, appears at bottom or top of screen, auto-hides)

Create a simple `Toast` component if needed, or use a `useState` + `useEffect` timeout pattern.

**Acceptance**: Clicking "Ajouter" adds the item, toast appears, cart count in header increments.

---

### TASK 3.3 — Stepper component
**File**: `src/components/checkout/Stepper.tsx`

Props: `{ currentStep: 1 | 2 | 3 }`

Visual: 3 steps with connecting lines:
- Completed step: filled blue circle with ✓
- Active step: blue circle with number
- Future step: gray circle with number
- Labels below: "Livraison" | "Paiement" | "Confirmation"

**Acceptance**: Each step state renders correctly.

---

### TASK 3.4 — Checkout page
**File**: `src/app/checkout/page.tsx`
`'use client'`

State: `const [step, setStep] = useState(1)` and `const [shippingData, setShippingData] = useState<ShippingAddress>({...})`

**Step 1 — Shipping form**:
- All fields from `ShippingAddress` type
- Validate on submit (email format, all required)
- "Continuer →" button calls `setStep(2)`

**Step 2 — Payment form**:
- Visual card number input (auto-format with spaces)
- MM/YY and CVV inputs side by side
- Cardholder name input
- "← Retour" link, "Payer X.XX €" button calls `setStep(3)`
- Add a security notice: "🔒 Paiement sécurisé SSL"

**Step 3 — Confirmation**:
- On mount: generate `orderNumber = CMD-${Date.now()}`, call `clearCart()`
- Show: "Commande confirmée ! 🎉", order number, summary of items, "Voir mes commandes" → /account/orders

**Acceptance**: Full flow works. Cart clears on step 3.

---

## PHASE 4 — Auth & Account Pages

---

### TASK 4.1 — Login page
**File**: `src/app/auth/login/page.tsx`
`'use client'`

Centered card (max-w-md mx-auto mt-20):
- Logo at top
- "Connexion" title
- Email input + Password input
- "Se connecter" button (simulated: alert or console.log then redirect to `/account`)
- "Créer un compte" link → `/auth/register`
- Divider "ou"
- "Continuer avec Google" button (grayed out, disabled, title="Bientôt disponible")

**Acceptance**: Form renders, button fires, page looks clean.

---

### TASK 4.2 — Register page
**File**: `src/app/auth/register/page.tsx`
`'use client'`

Same card style:
- Prénom, Nom, Email, Mot de passe, Confirmer le mot de passe
- Validate passwords match before submit
- "Créer mon compte" button (simulated)
- Link to login

**Acceptance**: Validation works, no TypeScript errors.

---

### TASK 4.3 — Account page
**File**: `src/app/account/page.tsx`

Hardcode fake user: `{ name: "Alex Dupont", email: "alex@example.com" }`

Layout:
- Avatar: circle with initials "AD" in blue
- Name + email
- 3 quick-access cards: "Mes commandes 📦" → `/account/orders`, "Mes designs 🎨" → (disabled, "Bientôt"), "Paramètres ⚙️" → (disabled)

**Acceptance**: Page renders cleanly.

---

### TASK 4.4 — Orders page
**File**: `src/app/account/orders/page.tsx`

Hardcode:
```ts
const fakeOrders = [
  { id: "CMD-1712345678", date: "5 Avril 2025", status: "Livré", itemCount: 2, total: 39.98 },
  { id: "CMD-1712399000", date: "15 Avril 2025", status: "En cours", itemCount: 1, total: 19.99 },
  { id: "CMD-1714000000", date: "25 Avril 2025", status: "En attente", itemCount: 3, total: 67.97 },
];
```

Each row as a card:
- Order ID (monospace font), date, status badge, "X article(s)", total, "Voir" button
- Status badge colors: Livré=green, En cours=blue, En attente=orange, Annulé=red

**Acceptance**: 3 orders show with correct badge colors.

---

## PHASE 5 — API & Extra Features

---

### TASK 5.1 — AI Generate API route
**File**: `src/app/api/ai/generate/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  
  // Validate
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
  }

  try {
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!hfResponse.ok) throw new Error('HF API failed');

    const blob = await hfResponse.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    // Graceful fallback
    const fallback = `https://via.placeholder.com/512x512/6366f1/white?text=${encodeURIComponent(prompt.slice(0, 20))}`;
    return NextResponse.json({ imageUrl: fallback });
  }
}
```

**Acceptance**: POST to `/api/ai/generate` with `{ prompt: "a cat" }` returns `{ imageUrl: "..." }`.

---

### TASK 5.2 — Products page search & filter
**File**: `src/app/products/page.tsx` (update to `'use client'`)

Add:
- `const [search, setSearch] = useState('')`
- `const [category, setCategory] = useState('Tous')`
- `const [sort, setSort] = useState('default')`
- `const filtered = useMemo(...)` — applies all three filters

UI above the grid:
- Search bar with 🔍 icon (styled input)
- Category tabs as pill buttons (active = blue filled, inactive = gray outline)
- Sort dropdown on the right

Use `allProducts` from `src/data/products.ts` (not the hardcoded local array anymore).

**Acceptance**: Typing in search immediately filters. Clicking category tabs filters. Sort changes order.

---

### TASK 5.3 — Utility pages

**`src/app/not-found.tsx`**:
```tsx
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold text-blue-600 mb-4">404 — Page introuvable</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <Link href="/" className="btn-primary">← Retour à l'accueil</Link>
    </main>
  );
}
```

**`src/app/loading.tsx`**:
```tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

**`src/app/faq/page.tsx`**: Accordion with 6 Q&As. Use `useState` array to track which items are open. Toggle on click.

---

## PHASE 6 — Polish (do last)

---

### TASK 6.1 — next.config.mjs update
Add missing image hostnames to `remotePatterns`:
```js
{ protocol: 'https', hostname: 'via.placeholder.com' },
{ protocol: 'https', hostname: 'images.unsplash.com' },
{ protocol: 'https', hostname: 'picsum.photos' },
```

---

### TASK 6.2 — Global CSS additions
**File**: `src/app/globals.css`

Add:
```css
/* Toast animation */
@keyframes slideUp {
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.toast { animation: slideUp 0.3s ease-out; }

/* Status badges */
.badge-green { background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge-blue { background: #dbeafe; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge-orange { background: #fed7aa; color: #9a3412; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge-red { background: #fee2e2; color: #991b1b; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
```

---

### TASK 6.3 — README update
**File**: `README.md`

Update with:
- Current feature list (what's actually built)
- Setup steps (npm install, env vars, npm run dev)
- Page routes list
- Keyboard shortcuts (from existing README)
- What's planned for V2

---

## ✅ Done Criteria — The whole thing is complete when:

1. `npm run build` passes with zero errors
2. `npm run dev` starts without crashing  
3. All 14 routes in the file tree render without white screens
4. Cart state persists across page refreshes
5. AI generation returns an image (or graceful fallback)
6. No TypeScript errors in strict mode
7. Mobile layout works on 375px viewport

---

*Task list generated for Antigravity. Work through tasks in order. Don't skip ahead.*
