import type { Metadata } from "next";
import { Suspense } from "react";
import { PLPClient } from "@/components/product/PLPClient";
import { getProducts, getCategories, ProductResponse, Category } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products — BOOGIEBUGI",
  description:
    "Browse the full BOOGIEBUGI collection. Luxury unisex clothing for Men, Women, and Kids.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string; sort?: string };
}) {
  let products: ProductResponse[] = [];
  let categories: Category[] = [];

  try {
    const query = new URLSearchParams();
    if (searchParams?.sort) query.set("sort", searchParams.sort);
    if (searchParams?.category) query.set("categoryId", searchParams.category);

    const [prodsRes, catsRes] = await Promise.all([
      getProducts(query.toString()),
      getCategories(),
    ]);
    products = prodsRes.products || [];
    categories = catsRes.categories || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <Suspense>
      <PLPClient
        initialProducts={products}
        categories={categories}
      />
    </Suspense>
  );
}
