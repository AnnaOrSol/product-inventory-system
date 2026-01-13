import React, { useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { Search, Plus, Minus, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addInventoryRequirements } from "@/api/inventoryRequirementsApi";
import type { Product } from "@/types/product";

interface Props {
    availableProducts: Product[];
    onItemsAdded: () => void;
    onSelectionChange?: (count: number) => void;
}

export interface GridRef {
    triggerSave: () => Promise<void>;
    hasPendingItems: boolean;
}

export const RequirementSelectionGrid = forwardRef<GridRef, Props>(({ availableProducts, onItemsAdded, onSelectionChange }, ref) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<Record<number, { name: string, qty: number }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Expose the save function to the parent Dialog
    useImperativeHandle(ref, () => ({
        triggerSave: async () => {
            await handleBulkSave();
        },
        hasPendingItems: Object.keys(selectedItems).length > 0
    }));

    useEffect(() => {
        onSelectionChange?.(Object.keys(selectedItems).length);
    }, [selectedItems, onSelectionChange]);

    const handleBulkSave = async (itemsToSave = selectedItems) => {
        const entries = Object.entries(itemsToSave);
        if (entries.length === 0) return;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        setIsSaving(true);
        console.log("Syncing items to database...");

        try {
            const payload = entries.map(([id, data]) => ({
                productId: Number(id),
                productName: data.name,
                minimumQuantity: data.qty
            }));

            await addInventoryRequirements(payload);
            console.log("Successfully synced batch save");
            toast.success(`Synced ${payload.length} items`);

            setSelectedItems({});
            onItemsAdded();
        } catch (error) {
            console.error("Save Error:", error);
            toast.error("Sync failed. Check connection.");
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save debounce
    useEffect(() => {
        if (Object.keys(selectedItems).length === 0) return;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            handleBulkSave();
        }, 3000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [selectedItems]);

    const toggleProduct = (product: Product) => {
        setSelectedItems(prev => {
            const next = { ...prev };
            if (next[product.id]) {
                delete next[product.id];
            } else {
                next[product.id] = { name: product.name, qty: 1 };
            }
            return next;
        });
    };

    const updateQty = (id: number, delta: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedItems(prev => {
            if (!prev[id]) return prev;
            return {
                ...prev,
                [id]: { ...prev[id], qty: Math.max(1, prev[id].qty + delta) }
            };
        });
    };

    // Filter logic: Selected items disappear from the grid for better UX
    const filteredProducts = useMemo(() => {
        return availableProducts
            .filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !selectedItems[p.id] // Optimistic: hide if selected
            )
            .slice(0, 24);
    }, [availableProducts, searchQuery, selectedItems]);

    return (
        <div className="space-y-4">
            <div className="sticky top-0 z-20 bg-white pb-2 space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search product catalog..."
                        className="pl-10 h-12 rounded-2xl border-2 border-slate-100 focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSaving && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white pl-2">
                            <span className="text-[10px] font-bold text-primary animate-pulse uppercase tracking-wider">Syncing</span>
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                    )}
                </div>

                {/* Selection Bar (Chips) */}
                <div className="flex flex-wrap gap-2 min-h-[32px]">
                    {Object.entries(selectedItems).map(([id, data]) => (
                        <div key={id} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-100 animate-in zoom-in duration-200">
                            <span>{data.name} ({data.qty})</span>
                            <button onClick={() => toggleProduct({ id: Number(id) } as any)}>
                                <X size={14} className="hover:text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                    <Card
                        key={product.id}
                        onClick={() => toggleProduct(product)}
                        className="relative aspect-square flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-200 border-2 border-slate-100 hover:border-slate-200 rounded-2xl text-center active:scale-95 shadow-sm hover:shadow-md animate-in fade-in"
                    >
                        <div className="font-bold text-sm leading-tight text-slate-700">
                            {product.name}
                        </div>
                        <div className="absolute top-2 right-2 p-1 bg-slate-50 rounded-full">
                            <Plus size={12} className="text-slate-400" />
                        </div>
                    </Card>
                ))}
            </div>

            {filteredProducts.length === 0 && searchQuery && (
                <div className="text-center py-10 text-slate-400 text-sm italic">
                    No results for "{searchQuery}"
                </div>
            )}
        </div>
    );
});