import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/lib/api";
import { SearchClient } from "./SearchClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search — BOOGIEBUGI",
  description: "Search for products at BOOGIEBUGI.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  let products: any[] = [];
  const queryParam = searchParams?.q || "";

  try {
    if (queryParam) {
      const query = new URLSearchParams();
      query.set("q", queryParam);
      const prodsRes = await getProducts(query.toString());
      products = prodsRes.products || [];
    }
  } catch (error) {
    console.error("Search failed:", error);
  }

  return (
    <Suspense>
      <SearchClient initialProducts={products} query={queryParam} />
    </Suspense>
  );
}
