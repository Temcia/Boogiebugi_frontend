import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PLPClient } from "@/components/product/PLPClient";
import { getProducts, getCategories, ProductResponse, Category } from "@/lib/api";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: { category: string }; // slug or ID passed as segment
  searchParams?: { sort?: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const { categories } = await getCategories();
    // Flatten all categories to find by slug or id
    const all = categories.flatMap((c) => [c, ...(c.children ?? [])]);
    const cat = all.find((c) => c.slug === params.category || c.id === params.category);
    if (!cat) return { title: "Not Found — BOOGIEBUGI" };
    return {
      title: `${cat.name} — BOOGIEBUGI`,
      description: `Shop the ${cat.name} collection at BOOGIEBUGI. Luxury unisex clothing, India-first.`,
    };
  } catch {
    return { title: "Not Found — BOOGIEBUGI" };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  let products: ProductResponse[] = [];
  let categories: Category[] = [];
  let currentCategory: Category | null = null;

  try {
    const { categories: allCats } = await getCategories();
    categories = allCats;

    // Find the category by slug or id
    const all = allCats.flatMap((c) => [c, ...(c.children ?? [])]);
    currentCategory = all.find((c) => c.slug === params.category || c.id === params.category) ?? null;

    if (!currentCategory) {
      notFound();
    }

    const query = new URLSearchParams({ categoryId: currentCategory.id });
    if (searchParams?.sort) query.set("sort", searchParams.sort);

    const prodsRes = await getProducts(query.toString());
    products = prodsRes.products || [];
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_NOT_FOUND")) throw err;
    console.error("Failed to fetch category products:", err);
  }

  return (
    <Suspense>
      <PLPClient
        initialProducts={products}
        categories={categories}
        currentCategory={currentCategory ?? undefined}
      />
    </Suspense>
  );
}
