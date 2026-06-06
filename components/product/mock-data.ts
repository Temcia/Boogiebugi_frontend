export type BadgeType = "new" | "sale" | "limited";

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  price: number; // paise
  salePrice?: number; // paise
  category: string; // men | women | kids
  subcategory: string; // tops | bottoms | outerwear | accessories
  badge?: BadgeType;
  sizes: string[];
  colors: { name: string; value: string }[];
  description: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

const defaultColors = [
  { name: "Black", value: "#1A1A1A" },
  { name: "White", value: "#FFFFFF" },
  { name: "Beige", value: "#F5F0E8" },
];

const earthyColors = [
  { name: "Camel", value: "#C19A6B" },
  { name: "Olive", value: "#5A6B4A" },
  { name: "Navy", value: "#1E2A3A" },
];

export const mockProducts: MockProduct[] = [
  {
    id: "1",
    name: "Oversized Linen Shirt",
    slug: "oversized-linen-shirt",
    price: 349000,
    category: "men",
    subcategory: "tops",
    badge: "new",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: defaultColors,
    description:
      "A relaxed, oversized silhouette crafted from breathable linen. Perfect for layering or wearing on its own during warmer months. Features a chest pocket and mother-of-pearl buttons.",
    rating: 4.5,
    reviewCount: 24,
    inStock: true,
  },
  {
    id: "2",
    name: "Relaxed Fit Trousers",
    slug: "relaxed-fit-trousers",
    price: 429000,
    category: "men",
    subcategory: "bottoms",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: earthyColors,
    description:
      "Effortlessly tailored trousers with a relaxed fit through the thigh and tapered hem. Pressed crease for a polished look. Elastic waistband at the back for comfort.",
    rating: 4.3,
    reviewCount: 18,
    inStock: true,
  },
  {
    id: "3",
    name: "Merino Wool Blazer",
    slug: "merino-wool-blazer",
    price: 899000,
    salePrice: 699000,
    category: "men",
    subcategory: "outerwear",
    badge: "sale",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Charcoal", value: "#2C2A26" },
      { name: "Navy", value: "#1E2A3A" },
    ],
    description:
      "A refined blazer cut from fine merino wool with a subtle texture. Half-canvas construction for a natural drape. Notch lapel, two-button closure, and functioning surgeon cuffs.",
    rating: 4.8,
    reviewCount: 32,
    inStock: true,
  },
  {
    id: "4",
    name: "Silk Blend Scarf",
    slug: "silk-blend-scarf",
    price: 199000,
    category: "women",
    subcategory: "accessories",
    sizes: ["OS"],
    colors: [
      { name: "Ivory", value: "#F5F0E8" },
      { name: "Rose", value: "#C4918A" },
      { name: "Sage", value: "#A8B5A0" },
    ],
    description:
      "A luxurious silk-blend scarf with a soft hand feel. Lightweight and versatile, it can be worn around the neck, as a headscarf, or tied to a bag. Finished with a delicate rolled edge.",
    rating: 4.6,
    reviewCount: 15,
    inStock: true,
  },
  {
    id: "5",
    name: "Cropped Cotton Tee",
    slug: "cropped-cotton-tee",
    price: 159000,
    category: "women",
    subcategory: "tops",
    badge: "new",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: defaultColors,
    description:
      "A wardrobe essential in premium organic cotton. Cropped length pairs perfectly with high-waisted bottoms. Ribbed neckline and dropped shoulders for a modern silhouette.",
    rating: 4.4,
    reviewCount: 41,
    inStock: true,
  },
  {
    id: "6",
    name: "Wide Leg Palazzo",
    slug: "wide-leg-palazzo",
    price: 389000,
    salePrice: 299000,
    category: "women",
    subcategory: "bottoms",
    badge: "sale",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: earthyColors,
    description:
      "Flowing palazzo pants with a high waist and dramatic wide leg. Crafted from a drapey Tencel blend that moves beautifully. Side pockets and invisible zip closure.",
    rating: 4.7,
    reviewCount: 28,
    inStock: true,
  },
  {
    id: "7",
    name: "Structured Linen Blazer",
    slug: "structured-linen-blazer",
    price: 749000,
    category: "women",
    subcategory: "outerwear",
    badge: "limited",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Sand", value: "#D2B48C" },
      { name: "Black", value: "#1A1A1A" },
    ],
    description:
      "A structured yet breathable linen blazer for warm-weather dressing. Features a single-button closure, patch pockets, and a slightly oversized fit. Fully lined in cotton.",
    rating: 4.9,
    reviewCount: 12,
    inStock: true,
  },
  {
    id: "8",
    name: "Kids Graphic Polo",
    slug: "kids-graphic-polo",
    price: 129000,
    category: "kids",
    subcategory: "tops",
    badge: "new",
    sizes: ["XS", "S", "M"],
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Sky", value: "#87CEEB" },
    ],
    description:
      "A playful polo shirt in soft cotton jersey. Features a subtle embroidered graphic at the chest. Button placket and ribbed collar for a classic finish.",
    rating: 4.2,
    reviewCount: 9,
    inStock: true,
  },
  {
    id: "9",
    name: "Kids Jogger Pants",
    slug: "kids-jogger-pants",
    price: 179000,
    category: "kids",
    subcategory: "bottoms",
    sizes: ["XS", "S", "M"],
    colors: [
      { name: "Grey", value: "#808080" },
      { name: "Navy", value: "#1E2A3A" },
    ],
    description:
      "Comfortable jogger pants in brushed cotton fleece. Elasticated waistband and cuffs for a snug fit. Side pockets and a back pocket. Perfect for play and everyday wear.",
    rating: 4.1,
    reviewCount: 14,
    inStock: true,
  },
  {
    id: "10",
    name: "Leather Tote Bag",
    slug: "leather-tote-bag",
    price: 599000,
    category: "women",
    subcategory: "accessories",
    badge: "limited",
    sizes: ["OS"],
    colors: [
      { name: "Tan", value: "#D2B48C" },
      { name: "Black", value: "#1A1A1A" },
    ],
    description:
      "A spacious tote crafted from full-grain leather with a smooth, buttery hand feel. Unlined interior with a detachable zip pouch. Reinforced handles for everyday durability.",
    rating: 4.7,
    reviewCount: 19,
    inStock: true,
  },
  {
    id: "11",
    name: "Cotton Oxford Shirt",
    slug: "cotton-oxford-shirt",
    price: 279000,
    category: "men",
    subcategory: "tops",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: defaultColors,
    description:
      "A timeless oxford shirt in durable cotton Oxford cloth. Button-down collar, chest pocket, and a regular fit that works tucked or untucked. A true wardrobe staple.",
    rating: 4.4,
    reviewCount: 37,
    inStock: false,
  },
  {
    id: "12",
    name: "Kids Puffer Jacket",
    slug: "kids-puffer-jacket",
    price: 449000,
    salePrice: 349000,
    category: "kids",
    subcategory: "outerwear",
    badge: "sale",
    sizes: ["XS", "S", "M"],
    colors: [
      { name: "Black", value: "#1A1A1A" },
      { name: "Burgundy", value: "#722F37" },
    ],
    description:
      "A lightweight puffer jacket filled with recycled down for warmth without bulk. Water-resistant shell, elasticated hood, and zip pockets. Packs into its own pocket for travel.",
    rating: 4.6,
    reviewCount: 21,
    inStock: true,
  },
];

export const categoryMap: Record<string, { label: string; subcategories: string[] }> = {
  men: {
    label: "Men",
    subcategories: ["tops", "bottoms", "outerwear", "accessories"],
  },
  women: {
    label: "Women",
    subcategories: ["tops", "bottoms", "outerwear", "accessories"],
  },
  kids: {
    label: "Kids",
    subcategories: ["tops", "bottoms", "outerwear"],
  },
};

export const subcategoryLabels: Record<string, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  outerwear: "Outerwear",
  accessories: "Accessories",
};
