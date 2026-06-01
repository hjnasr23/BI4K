import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ClientProductCustomizer from "./ClientProductCustomizer";

export async function generateStaticParams() {
  try {
    const { data: products } = await supabase.from('products').select('slug, id');
    if (products) {
      return products.map((product) => ({
        id: product.slug || product.id,
      }));
    }
  } catch (error) {
    console.error("Failed to generate static params for products:", error);
  }
  return [];
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Try querying by slug first
  let { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', id)
    .maybeSingle();

  if (!product) {
    // If not found, try querying by UUID id just in case
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      product = data;
    }
  }

  if (!product) {
    return notFound();
  }

  return <ClientProductCustomizer product={product} />;
}
