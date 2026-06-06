"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/utils";
import { Search, Plus, X, Edit2, Trash2, UploadCloud } from "lucide-react";
import {
  getAdminProducts,
  getCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  Category,
  ProductResponse,
  CreateProductInput,
  VariantInput,
} from "@/lib/api";
import { createClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Helper: get fresh Supabase token
// ---------------------------------------------------------------------------
async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

// ---------------------------------------------------------------------------
// Drawer Component (handles both Create & Edit)
// ---------------------------------------------------------------------------

function ProductDrawer({
  isOpen,
  onClose,
  categories,
  onSave,
  editProduct,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: () => void;
  editProduct: ProductResponse | null;
}) {
  const isEditing = editProduct !== null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<VariantInput[]>([{
    size: "",
    color: "",
    stock: 0,
    sku: "",
  }]);
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Pre-fill fields when editing
  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setCategoryId(editProduct.categoryId);
      setDescription(editProduct.description);
      setPrice((editProduct.price / 100).toString());
      setComparePrice(editProduct.comparePrice ? (editProduct.comparePrice / 100).toString() : "");
      setIsActive(editProduct.isActive);
      setImages(editProduct.images || []);
      if (editProduct.variants && editProduct.variants.length > 0) {
        setVariants(editProduct.variants.map((v: any) => ({
          size: v.size ?? "",
          color: v.color ?? "",
          stock: v.stock ?? 0,
          sku: v.sku ?? "",
        })));
      } else {
        setVariants([{ size: "", color: "", stock: 0, sku: "" }]);
      }
    } else {
      // Reset for create mode
      setName(""); setCategoryId(""); setDescription("");
      setPrice(""); setComparePrice(""); setIsActive(true);
      setVariants([{ size: "", color: "", stock: 0, sku: "" }]);
      setImages([]);
      setIsDragging(false);
    }
    setError("");
  }, [editProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name || !categoryId || !description || !price || variants.some(v => !v.size || !v.sku)) {
      setError("Please fill out all required fields including Variant Size and SKU for all variants.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = await getToken();
      if (!token) { setError("You are not logged in. Please sign in again."); return; }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const priceInPaise = Math.round(parseFloat(price) * 100);
      const comparePriceInPaise = comparePrice ? Math.round(parseFloat(comparePrice) * 100) : undefined;
      const finalImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1596755094514-f87e32f85e98?auto=format&fit=crop&w=800&q=80"];

      if (isEditing && editProduct) {
        // PATCH — update existing product
        await updateAdminProduct(
          editProduct.id,
          {
            name, slug, categoryId, description,
            price: priceInPaise,
            comparePrice: comparePriceInPaise,
            isActive,
            variants,
            images: finalImages,
          },
          token
        );
      } else {
        // POST — create new product
        const payload: CreateProductInput = {
          name, slug, categoryId, description,
          price: priceInPaise,
          comparePrice: comparePriceInPaise,
          images: finalImages,
          tags: [],
          variants,
        };
        await createAdminProduct(payload, token);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[var(--color-ivory)] shadow-xl z-50 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <h2 className="font-display text-xl text-[var(--color-obsidian)]">
            {isEditing ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--color-obsidian)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 flex-1">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">Product Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Linen Structured Shirt"
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">Category *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]">
              <option value="">Select category</option>
              {categories.map((parent) =>
                parent.children && parent.children.length > 0 ? (
                  <optgroup key={parent.id} label={parent.name}>
                    {parent.children.map((child) => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </optgroup>
                ) : (
                  <option key={parent.id} value={parent.id}>{parent.name}</option>
                )
              )}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">Description *</label>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..."
              className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]" />
          </div>

          {/* Prices */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">Price (₹) *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
                className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]" />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">Compare Price (₹)</label>
              <input type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="0.00"
                className="w-full border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]" />
            </div>
          </div>

          {/* Variants */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)]">Variants *</label>
              <button type="button" onClick={() => setVariants([...variants, { size: "", color: "", stock: 0, sku: "" }])} className="text-[10px] font-medium uppercase tracking-widest text-[var(--color-gold)] hover:text-[var(--color-obsidian)] transition-colors">
                + Add Size
              </button>
            </div>
            <div className="space-y-3">
              {variants.map((v, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center">
                  <input type="text" placeholder="Size *" value={v.size} onChange={(e) => { const newVars = [...variants]; newVars[index].size = e.target.value; setVariants(newVars); }}
                    className="border border-[var(--color-border)] rounded-md px-3 py-2 text-sm bg-[var(--color-white)] w-full min-w-0" />
                  <input type="text" placeholder="Color" value={v.color ?? ""} onChange={(e) => { const newVars = [...variants]; newVars[index].color = e.target.value; setVariants(newVars); }}
                    className="border border-[var(--color-border)] rounded-md px-3 py-2 text-sm bg-[var(--color-white)] w-full min-w-0" />
                  <input type="text" placeholder="SKU *" value={v.sku} onChange={(e) => { const newVars = [...variants]; newVars[index].sku = e.target.value; setVariants(newVars); }}
                    className="border border-[var(--color-border)] rounded-md px-3 py-2 text-sm bg-[var(--color-white)] w-full min-w-0" />
                  <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => { const newVars = [...variants]; newVars[index].stock = parseInt(e.target.value) || 0; setVariants(newVars); }}
                    className="border border-[var(--color-border)] rounded-md px-3 py-2 text-sm bg-[var(--color-white)] w-full min-w-0" />
                  <button type="button" onClick={() => { if (variants.length > 1) { const newVars = variants.filter((_, i) => i !== index); setVariants(newVars); } }} 
                    className="p-2 text-[var(--color-warm-gray)] hover:text-red-600 transition-colors disabled:opacity-30" disabled={variants.length === 1}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-widest text-[var(--color-obsidian)] mb-2">Images ({images.length}/5) *</label>
            <div
              className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md text-center transition-colors mb-2 ${
                isDragging ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5" : "border-[var(--color-border)] bg-[var(--color-white)]"
              } ${images.length >= 5 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[var(--color-ivory)]"}`}
              onDragOver={(e) => { e.preventDefault(); if (images.length < 5) setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (images.length >= 5) return;
                const files = e.dataTransfer.files;
                if (!files) return;
                const remaining = 5 - images.length;
                const filesToProcess = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, remaining);
                filesToProcess.forEach(file => {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (ev.target?.result) {
                      setImages(prev => [...prev, ev.target!.result as string]);
                    }
                  };
                  reader.readAsDataURL(file);
                });
              }}
            >
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={images.length >= 5}
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  const remaining = 5 - images.length;
                  const filesToProcess = Array.from(files).slice(0, remaining);
                  filesToProcess.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        setImages(prev => [...prev, ev.target!.result as string]);
                      }
                    };
                    reader.readAsDataURL(file);
                  });
                  e.target.value = ''; // reset
                }}
              />
              <UploadCloud className="w-8 h-8 text-[var(--color-warm-gray)] mb-2" />
              <p className="text-xs text-[var(--color-obsidian)] font-medium">Click to upload or drag & drop</p>
              <p className="text-[10px] text-[var(--color-warm-gray)] mt-1">SVG, PNG, JPG or GIF (max 5)</p>
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 border border-[var(--color-border)] rounded overflow-hidden group">
                    <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 p-1 bg-white/80 hover:bg-red-100 text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-600 text-xs font-medium">{error}</p>}

          {/* Active toggle */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-gold)]" />
            <label htmlFor="active" className="text-sm text-[var(--color-obsidian)]">Active product</label>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border)]">
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-[var(--color-obsidian)] text-[var(--color-ivory)] py-3 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] transition-colors disabled:opacity-50">
            {loading ? "Saving..." : isEditing ? "Update Product" : "Save Product"}
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ProductsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const catRes = await getCategories();
      setCategories(catRes.categories || []);

      const token = await getToken();
      if (token) {
        const prodRes = await getAdminProducts(token);
        setProducts(prodRes.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => { setEditProduct(null); setDrawerOpen(true); };
  const openEdit = (p: ProductResponse) => { setEditProduct(p); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditProduct(null); };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    const token = await getToken();
    if (!token) return;
    try {
      await deleteAdminProduct(id, token);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-obsidian)]">Products</h1>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">Manage your catalog</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-[var(--color-obsidian)] text-[var(--color-ivory)] px-6 py-2.5 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[var(--color-gold)] hover:text-[var(--color-obsidian)] transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-warm-gray)]" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-white)] text-sm focus:outline-none focus:border-[var(--color-gold)]" />
        </div>
        <select className="w-full sm:w-48 px-4 py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-white)] text-sm focus:outline-none focus:border-[var(--color-gold)]">
          <option value="">All Categories</option>
          {categories.map((parent) =>
            parent.children && parent.children.length > 0 ? (
              <optgroup key={parent.id} label={parent.name}>
                {parent.children.map((child) => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </optgroup>
            ) : (
              <option key={parent.id} value={parent.id}>{parent.name}</option>
            )
          )}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--color-ivory)] border-b border-[var(--color-border)]">
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)] w-16">Image</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Name</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Category</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Price</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Stock</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Status</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-warm-gray)]">
                    Loading products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--color-warm-gray)]">
                    {search ? `No products matching "${search}"` : "No products yet. Click Add Product to get started!"}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const totalStock = product.variants?.reduce((s, v) => s + (v.stock ?? 0), 0) ?? 0;
                  return (
                    <tr key={product.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-black/[0.02]">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-[var(--color-ivory)] border border-[var(--color-border)] rounded overflow-hidden flex items-center justify-center">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            : <span className="text-[10px] text-[var(--color-warm-gray)]">IMG</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-[var(--color-obsidian)]">{product.name}</td>
                      <td className="px-6 py-4 text-[var(--color-warm-gray)]">{product.category?.name ?? "—"}</td>
                      <td className="px-6 py-4 text-[var(--color-obsidian)]">{formatPrice(product.price)}</td>
                      <td className="px-6 py-4 text-[var(--color-obsidian)]">
                        <span className={totalStock === 0 ? "text-red-500 font-medium" : totalStock < 5 ? "text-amber-500 font-medium" : ""}>
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded-full border ${
                          product.isActive
                            ? "text-[var(--color-gold)] border-[var(--color-gold)]"
                            : "text-[var(--color-warm-gray)] border-[var(--color-warm-gray)]"
                        }`}>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => openEdit(product)}
                            className="text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)] transition-colors" aria-label="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id, product.name)}
                            className="text-[var(--color-warm-gray)] hover:text-red-600 transition-colors" aria-label="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-ivory)] text-xs">
          <span className="text-[var(--color-warm-gray)]">
            {filtered.length} of {products.length} products
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-[var(--color-white)] disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-[var(--color-border)] rounded hover:bg-[var(--color-white)] disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      <ProductDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        categories={categories}
        onSave={fetchData}
        editProduct={editProduct}
      />
    </div>
  );
}
