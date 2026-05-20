import { getCategories, getProducts } from "@/lib/db";
import ClientHome from "./ClientHome";

export default async function Home() {
  const { data: categories } = await getCategories();
  const { data: products } = await getProducts({ activeOnly: true });

  return <ClientHome categories={categories || []} products={products || []} />;
}
