import { supabase } from "@/lib/supabase";

export async function generateStaticParams() {
  try {
    const { data: categories } = await supabase.from('categories').select('slug');
    if (categories) {
      return categories.map((cat) => ({
        categoryName: cat.slug,
      }));
    }
  } catch (error) {
    console.error("Failed to generate static params for categories:", error);
  }
  return [];
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
