import { getProductById } from "@/lib/db";
import { notFound } from "next/navigation";
import ClientProductCustomizer from "./ClientProductCustomizer";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: product } = await getProductById(id);

  if (!product) {
    return notFound();
  }

  return <ClientProductCustomizer product={product} />;
}
