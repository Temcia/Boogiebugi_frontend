import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/api";
import { PDPClient } from "@/components/product/PDPClient";

interface PDPPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PDPPageProps): Promise<Metadata> {
  try {
    const { product } = await getProductBySlug(params.slug);
    return {
      title: `${product.name} — BOOGIEBUGI`,
      description: product.description.slice(0, 155),
    };
  } catch {
    return { title: "Not Found — BOOGIEBUGI" };
  }
}

export default async function PDPPage({ params }: PDPPageProps) {
  try {
    const { product } = await getProductBySlug(params.slug);
    return <PDPClient product={product} />;
  } catch {
    notFound();
  }
}
