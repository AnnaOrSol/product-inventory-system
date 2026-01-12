import React, { useState, useEffect, useMemo } from "react";
import { Search, Check, Plus, Minus, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";


import { addInventoryRequirements } from "@/api/inventoryRequirementsApi";
import type { Product } from "@/types/product";

interface Props {
    availableProducts: Product[];
    onItemsAdded: () => void;
}

export function RequirementSelectionGrid({ availableProducts, onItemsAdded }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<Record<number, { name: string, qty: number }>>({});
    const [isSaving, setIsSaving] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!searchQuery && Object.keys(selectedItems).length === 0) return availableProducts.slice(0, 12);

        return availableProducts
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 24);
    }, [availableProducts, searchQuery, selectedItems]);


    useEffect(() => {
        const selectedIds = Object.keys(selectedItems);
        if (selectedIds.length === 0) return;

        const timer = setTimeout(async () => {
            await handleBulkSave();
        }, 2000);

        return () => clearTimeout(timer);
    }, [selectedItems]);

    const handleBulkSave = async () => {
        setIsSaving(true);
        try {
            const payload = Object.entries(selectedItems).map(([id, data]) => ({
                productId: Number(id),
                productName: data.name,
                minimumQuantity: data.qty
            }));

            console.log("Sending payload:", payload);

            await addInventoryRequirements(payload);
            toast.success(`${payload.length} Items added to the list`);
            setSelectedItems({});
            onItemsAdded();
        } catch (error) {
            console.error("Save error details:", error);
            toast.error("Failed to save items - check the DB");
        } finally {
            setIsSaving(false);
        }
    };

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

    const selectedCount = Object.keys(selectedItems).length;

    return (
        <div className="space-y-4">
            <div className="sticky top-0 z-20 bg-white pb-2 space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search product name.."
                        className="pl-10 h-12 rounded-2xl border-2 border-slate-100 focus-visible:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSaving && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    )}
                </div>


                {selectedCount > 0 && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                        {Object.entries(selectedItems).map(([id, data]) => (
                            <div key={id} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full border border-primary/20">
                                <span>{data.name} ({data.qty})</span>
                                <button onClick={() => toggleProduct({ id: Number(id), name: data.name } as any)}>
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => {
                    const isSelected = !!selectedItems[product.id];
                    return (
                        <Card
                            key={product.id}
                            onClick={() => toggleProduct(product)}
                            className={cn(
                                "relative aspect-square flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-200 border-2 rounded-2xl text-center active:scale-95",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                    : "border-slate-100 hover:border-slate-200 shadow-sm"
                            )}
                        >
                            <div className={cn(
                                "font-bold text-sm leading-tight transition-colors",
                                isSelected ? "text-primary" : "text-slate-700"
                            )}>
                                {product.name}
                            </div>

                            {isSelected && (
                                <div className="flex items-center gap-2 mt-3 bg-white border rounded-xl p-1 shadow-sm animate-in zoom-in">
                                    <button onClick={(e) => updateQty(product.id, -1, e)} className="p-1 text-slate-400 hover:text-red-500">
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-xs font-black w-4">{selectedItems[product.id].qty}</span>
                                    <button onClick={(e) => updateQty(product.id, 1, e)} className="p-1 text-slate-400 hover:text-green-500">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && searchQuery && (
                <div className="text-center py-10 text-slate-400 text-sm italic">
                    לא מצאנו מוצר בשם "{searchQuery}"...
                </div>
            )}
        </div>
    );
}