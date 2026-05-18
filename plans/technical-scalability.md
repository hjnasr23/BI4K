# Plan: Technical Scalability & Production Readiness

## Objective
Optimize the FastAPI backend and Supabase infrastructure to handle high-traffic ecommerce workloads, reduce egress costs, and ensure 99.9% uptime for image-heavy operations.

## Proposed Improvements

### 1. Connection Optimization
- **Supavisor Integration**: Update the FastAPI connection logic to use **Port 6543** (Transaction Mode).
- **Async Implementation**: Audit all `main.py` routes to ensure zero blocking calls. Replace any synchronous DB queries with `await` patterns.

### 2. High-Performance Image Pipeline
- **On-the-fly Transformations**: Shift away from manual image resizing. Implement Supabase Image Transformation URLs for:
  - Catalog Thumbnails: `width=300&height=300&resize=cover`
  - Studio Mockups: `width=800&quality=80&format=webp`
- **Modern Formats**: Force all served images to **WebP** via transformation parameters to reduce bandwidth by up to 60%.

### 3. Storage & CDN Strategy
- **Smart CDN**: Enable Global CDN on Supabase for the `fashion` and `designs` buckets.
- **Cache-Control**: Update the `storage_service.py` to set `public, max-age=31536000` headers on all uploaded user designs and AI generations.

### 4. Background Processing (Scaling AI)
- **Task Offloading**: For the AI synthesis flow, implement a status-based polling mechanism instead of keeping a long-held HTTP connection.
  1. Frontend hits `/generate`.
  2. Backend returns `202 Accepted` + `task_id`.
  3. Frontend polls for status.
  *This prevents timeout issues during slow AI generations.*

### 5. Security Hardening
- **JWT-based RLS**: Update the FastAPI dependency injection to extract the user's JWT and pass it to the Supabase client.
- **Validation**: Upgrade to **Pydantic v2** for faster serialization of the product catalog.

## Implementation Phases
1. **Infrastructure**: Configure Supavisor and CDN.
2. **Storage Service**: Update upload headers and serving URLs.
3. **Backend Refactor**: Implement async-first patterns and Pydantic v2.
4. **Resilience**: Implement the polling mechanism for AI tasks.
