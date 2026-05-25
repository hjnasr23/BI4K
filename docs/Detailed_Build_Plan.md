# Antigravity Implementation Blueprint: Customization Module

This plan outlines the specific steps for the Antigravity Agents to build the Customization Engine.

## Phase 1: Environment & Infrastructure (Setup Agent)
1. **Supabase Schema Initialization:**
   - Create `designs` table: `id (uuid)`, `url (text)`, `user_id (uuid)`, `prompt (text)`, `is_ai (bool)`.
   - Create `design_storage` bucket with public access for previews.
2. **Environment Secrets:**
   - Configure `SUPABASE_URL`, `SUPABASE_KEY`, and `OPENAI_API_KEY`.

## Phase 2: Design Generation Service (Backend Agent)
1. **API Endpoint `POST /generate-design`:**
   - Input: User Prompt + Product Type.
   - Logic: Call DALL-E 3 / Stability API -> Receive Image Buffer -> Upload to Supabase Storage -> Return Public URL.
2. **API Endpoint `POST /upload-design`:**
   - Handle multipart file upload -> Validate Image Type -> Store in 'uploads/' folder -> Return Reference.

## Phase 3: The Interactive Editor (Frontend Agent)
1. **Next.js Canvas Component:**
   - Implement `EditorCanvas.tsx` using Fabric.js.
   - Layer 1: Product Mockup (Background).
   - Layer 2: User Design (Moveable/Scalable).
2. **State Management:**
   - Capture transformation data (x, y, scale, rotation) on 'Save' event.

## Phase 4: Integration & Order Submission (Full-Stack Agent)
1. **Bridge Logic:**
   - On 'Add to Cart', send the Product ID + Design ID + Transformation JSON to the `LigneCommande` endpoint.
2. **Preview Generation:**
   - Generate a data-URL snapshot of the canvas and save it as the 'Ordered Preview' for admin verification.

## Phase 5: Security & Testing (QA Agent)
1. **Automated Unit Tests:**
   - Test prompt rejection for toxic keywords.
   - Test large file upload limits (e.g., max 5MB).
