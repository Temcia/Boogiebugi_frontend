"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Save, Edit2 } from "lucide-react";
import { getAdminProducts, updateAdminProduct } from "@/lib/api";
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
// Types & Constants
// ---------------------------------------------------------------------------

interface InventoryItem {
  id: string; // variant ID or SKU
  productId: string;
  product: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
}

const FILTER_TABS = ["All", "Low Stock", "Out of Stock"];

// ---------------------------------------------------------------------------
// Inline Edit Component
// ---------------------------------------------------------------------------

function StockCell({
  stock: initialStock,
  onSave,
  disabled
}: {
  stock: number;
  onSave: (val: number) => void;
  disabled?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialStock.toString());

  // Keep internal state in sync if parent changes initialStock
  useEffect(() => {
    setValue(initialStock.toString());
  }, [initialStock]);

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-16 border border-[var(--color-gold)] rounded px-2 py-1 text-xs text-[var(--color-obsidian)] focus:outline-none"
          autoFocus
          disabled={disabled}
        />
        <button
          onClick={() => {
            const num = parseInt(value, 10);
            if (!isNaN(num) && num >= 0) {
              onSave(num);
            } else {
              setValue(initialStock.toString());
            }
            setIsEditing(false);
          }}
          disabled={disabled}
          className="p-1 text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[var(--color-ivory)] rounded transition-colors disabled:opacity-50"
        >
          <Save className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 group ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      onClick={() => !disabled && setIsEditing(true)}
    >
      <span className={initialStock === 0 ? "line-through text-[var(--color-warm-gray)]" : ""}>
        {initialStock}
      </span>
      {!disabled && <Edit2 className="w-3 h-3 text-[var(--color-warm-gray)] opacity-0 group-hover:opacity-100 transition-opacity" />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingSku, setUpdatingSku] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const res = await getAdminProducts(token);
      
      const flatInventory: InventoryItem[] = [];
      res.products.forEach((prod) => {
        if (prod.variants) {
          prod.variants.forEach((v: any) => {
            flatInventory.push({
              id: v.sku, // Assuming SKU is unique
              productId: prod.id,
              product: prod.name,
              size: v.size,
              color: v.color || "",
              sku: v.sku,
              stock: v.stock || 0,
            });
          });
        }
      });
      
      setInventory(flatInventory);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredInventory = inventory.filter((item) => {
    // Text search
    if (search) {
      const q = search.toLowerCase();
      const matchSku = item.sku && item.sku.toLowerCase().includes(q);
      const matchProduct = item.product && item.product.toLowerCase().includes(q);
      if (!matchSku && !matchProduct) {
        return false;
      }
    }

    // Tab filter
    if (activeTab === "Low Stock") return item.stock > 0 && item.stock < 5;
    if (activeTab === "Out of Stock") return item.stock === 0;
    
    return true; // "All"
  });

  const handleUpdateStock = async (item: InventoryItem, newStock: number) => {
    if (newStock === item.stock) return;

    try {
      setUpdatingSku(item.sku);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      // We use the partial update endpoint to send only the updated variant
      await updateAdminProduct(
        item.productId,
        {
          variants: [{
            sku: item.sku,
            size: item.size,
            color: item.color,
            stock: newStock,
          }],
        },
        token
      );

      // Optimistically update the local state
      setInventory((prev) =>
        prev.map((inv) => (inv.sku === item.sku ? { ...inv, stock: newStock } : inv))
      );
    } catch (err) {
      console.error("Failed to update stock", err);
      alert("Failed to update stock");
    } finally {
      setUpdatingSku(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-obsidian)]">
            Inventory
          </h1>
          <p className="text-sm text-[var(--color-warm-gray)] mt-1">
            Track and manage variant stock levels
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-none -mb-px border-b border-[var(--color-border)]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium uppercase tracking-widest transition-colors duration-150 border-b-2 ${
                activeTab === tab
                  ? "border-[var(--color-obsidian)] text-[var(--color-obsidian)]"
                  : "border-transparent text-[var(--color-warm-gray)] hover:text-[var(--color-obsidian)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-warm-gray)]" />
          <input
            type="text"
            placeholder="Search SKU or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-white)] focus:outline-none focus:border-[var(--color-gold)]"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-[var(--color-white)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-[var(--color-ivory)] border-b border-[var(--color-border)]">
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Product</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Size</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Color</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">SKU</th>
                <th className="px-6 py-4 font-medium text-[var(--color-obsidian)]">Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-warm-gray)]">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-warm-gray)]">
                    {search ? `No variants matching "${search}"` : "No inventory data found."}
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isOutOfStock = item.stock === 0;
                  const isLowStock = item.stock > 0 && item.stock < 5;

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-[var(--color-border)] last:border-0 ${
                        isLowStock ? "bg-[var(--color-gold)]/10" : "hover:bg-black/[0.02]"
                      }`}
                    >
                      <td className={`px-6 py-4 font-medium ${isOutOfStock ? "text-[var(--color-warm-gray)]" : "text-[var(--color-obsidian)]"}`}>
                        {item.product}
                      </td>
                      <td className={`px-6 py-4 ${isOutOfStock ? "text-[var(--color-warm-gray)]" : "text-[var(--color-obsidian)]"}`}>
                        {item.size}
                      </td>
                      <td className={`px-6 py-4 ${isOutOfStock ? "text-[var(--color-warm-gray)]" : "text-[var(--color-obsidian)]"}`}>
                        {item.color || "-"}
                      </td>
                      <td className="px-6 py-4 text-[var(--color-warm-gray)]">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <StockCell
                          stock={item.stock}
                          onSave={(val) => handleUpdateStock(item, val)}
                          disabled={updatingSku === item.sku}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
