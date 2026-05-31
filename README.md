# BI4K — Custom Apparel Design E-Commerce Platform

Welcome to **BI4K**! This is a state-of-the-art, custom apparel e-commerce platform built with Next.js (App Router), Tailwind CSS, Framer Motion, and Supabase. It features an interactive, drag-and-drop canvas designer (using Fabric.js) allowing customers to design their own t-shirts, hoodies, and other products with custom texts, images, and AI-generated artwork.

---

## 🚀 Local Setup Guide

Follow these step-by-step instructions to get your local development environment up and running smoothly.

### 1. Install Dependencies

Ensure you have **Node.js (v18+ or v20+)** and **npm** installed. Then, clone the repository, navigate into the project directory, and install all required packages:

```bash
# Navigate into the project folder
cd BI4K

# Install all node modules and package dependencies
npm install
```

---

### 2. Environment Variables Configuration

Duplicate the environment variables template file to create your local environment file:

```bash
# Copy the template file to .env.local
cp .env.example .env.local
```

Open `.env.local` in your text editor and fill in the required keys. 

Here are the critical keys you must supply:

*   **`ADMIN_EMAIL` & `ADMIN_PASSWORD`**: Default credentials used to access the administrator panel (`/admin`).
*   **`ADMIN_SECRET`**: A unique secret token for secure server actions.
*   **`NEXT_PUBLIC_SUPABASE_URL`**: The API URL of your Supabase project (from the Supabase project dashboard under Settings > API).
*   **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: The publishable anonymous key for client-side queries.
*   **`SUPABASE_SERVICE_ROLE_KEY`**: The high-privilege service key used by server actions (keep this secure!).
*   **`DATABASE_URL`**: The direct PostgreSQL connection string for database access and scripting.

---

### 3. Database Setup & Schema (Critical)

This project uses **Supabase** for database storage, authentication, and security policies.

To match your local database structure with the production database schema, execute the SQL scripts in the `database` folder:

1.  **Log in to Supabase**: Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2.  **Open SQL Editor**: Navigate to the **SQL Editor** tab in the sidebar.
3.  **Run Schema Script**: 
    *   Create a new query.
    *   Copy the full contents of the [database/schema_complete.sql](file:///c:/Users/user/next-js/BI4K/database/schema_complete.sql) file.
    *   Paste it into the editor and click **Run**. This will create the base public schema tables (`UserProfile`, `Category`, `Product`, `Mockup`, `designs`, `UserDesign`, etc.) and register trigger functions.
4.  **Run RLS Policies**:
    *   Create another query.
    *   Copy and run the contents of [database/rls_policies.sql](file:///c:/Users/user/next-js/BI4K/database/rls_policies.sql) to enable Row Level Security policies.
5.  **Run Seed Data Setup**:
    *   Copy and run the contents of [database/setup.sql](file:///c:/Users/user/next-js/BI4K/database/setup.sql) to seed default product mockups, permissions, and starting data.

#### Verify Database Connection
Once the database schema is loaded, run the pre-configured database test script to verify connection:

```bash
# Run the built-in database check script
npm run db:test
```

---

### 4. Development Server

Start the Next.js local development server with **Turbopack** enabled for blazing-fast hot-reloading:

```bash
# Start Next.js dev server with Turbopack compiler
npm run dev -- --turbo
```

The application will be live at: **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Tech Stack & Architecture Overview

*   **Frontend**: Next.js 16 (App Router), React 19, TypeScript
*   **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
*   **Canvas Studio**: Fabric.js for rich, interactive vector manipulation and custom product design placement
*   **Backend & DB**: Supabase (Postgres, Auth, Storage, Row-Level Security)
