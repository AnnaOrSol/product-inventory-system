import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    ArrowLeft,
    Search,
    LayoutGrid,
    List,
    Trash2,
    CheckSquare,
    Square,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryCard } from "@/components/InventoryCard";
import { AddItemForm } from "@/components/AddItemForm";

import { fetchInventory, deleteInventoryItem } from "@/api/inventoryApi";
import { fetchProducts } from "@/api/productApi";
import { installationService } from "@/services/installationService";

import type { InventoryItem } from "@/types/inventory";
import type { Product } from "@/types/product";

const FullInventory = () => {
    const navigate = useNavigate();

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showAddForm, setShowAddForm] = useState(false);

    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [inventoryData, productsData] = await Promise.all([
                fetchInventory(),
                fetchProducts(),
            ]);
            setItems(inventoryData);
            setProducts(productsData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!installationService.getId()) {
            navigate("/onboarding");
            return;
        }

        loadData();
    }, [navigate]);

    const categoryByProductId = useMemo(() => {
        return new Map<number, string>(
            products.map((p) => [
                p.id,
                (p as any).categoryDisplayName || "Uncategorized",
            ])
        );
    }, [products]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = (item.genericProductName ?? "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const itemCat =
                categoryByProductId.get(item.genericProductId ?? -1) ??
                "Uncategorized";

            const matchesCategory =
                selectedCategory === "All" || itemCat === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [items, searchQuery, selectedCategory, categoryByProductId]);

    const toggleSelectItem = (id: number) => {
        setSelectedItemIds((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id]
        );
    };

    const handleItemDeleted = (inventoryItemId: number) => {
        setItems((prev) => prev.filter((item) => item.id !== inventoryItemId));
        setSelectedItemIds((prev) =>
            prev.filter((itemId) => itemId !== inventoryItemId)
        );
    };

    const handleBulkDelete = async () => {
        if (!selectedItemIds.length) return;
        if (!window.confirm(`Delete ${selectedItemIds.length} items?`)) return;

        try {
            await Promise.all(selectedItemIds.map((id) => deleteInventoryItem(id)));
            setSelectedItemIds([]);
            setIsSelectionMode(false);
            await loadData();
        } catch (error) {
            console.error("Failed to delete some items:", error);
            alert("Failed to delete some items");
        }
    };

    const handleToggleSelectionMode = () => {
        setIsSelectionMode((prev) => !prev);
        setSelectedItemIds([]);
    };

    if (loading) {
        return <div className="p-10 text-center">Loading Inventory...</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
                <div className="container px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-bold truncate">Full Inventory</h1>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant={isSelectionMode ? "secondary" : "outline"}
                            size="sm"
                            onClick={handleToggleSelectionMode}
                        >
                            {isSelectionMode ? "Cancel" : "Select"}
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setViewMode(viewMode === "grid" ? "list" : "grid")
                            }
                        >
                            {viewMode === "grid" ? (
                                <List className="h-4 w-4" />
                            ) : (
                                <LayoutGrid className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container px-4 sm:px-6 py-6">
                {/* Filters */}
                <div className="mb-6 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter list..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Empty state */}
                {filteredItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-10 text-center">
                        <p className="text-sm text-muted-foreground">
                            No inventory items found.
                        </p>
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === "grid"
                                ? "grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
                                : "space-y-3"
                        }
                    >
                        {filteredItems.map((item) => {
                            const isSelected = selectedItemIds.includes(item.id);

                            if (viewMode === "grid") {
                                return (
                                    <div key={item.id} className="relative min-w-0">
                                        {isSelectionMode && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleSelectItem(item.id)}
                                                className="absolute top-2 left-2 z-10 h-9 w-9 rounded-full bg-background/85 backdrop-blur border shadow-sm"
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="h-5 w-5 text-primary fill-primary/10" />
                                                ) : (
                                                    <Square className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </Button>
                                        )}

                                        <div className={isSelectionMode ? "pt-1" : ""}>
                                            <InventoryCard
                                                item={item}
                                                onUpdate={loadData}
                                                onDeleted={handleItemDeleted}
                                            />
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.id}
                                    className="relative flex items-center gap-2"
                                >
                                    {isSelectionMode && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleSelectItem(item.id)}
                                            className="shrink-0"
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="h-6 w-6 text-primary fill-primary/10" />
                                            ) : (
                                                <Square className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </Button>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <InventoryCard
                                            item={item}
                                            onUpdate={loadData}
                                            onDeleted={handleItemDeleted}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Add Item Overlay */}
            {showAddForm && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border bg-background shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3 rounded-t-2xl">
                            <h2 className="text-lg font-semibold">Add item</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowAddForm(false)}
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-4">
                            <AddItemForm
                                onItemAdded={() => {
                                    setShowAddForm(false);
                                    loadData();
                                }}
                                onClose={() => setShowAddForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Bar */}
            {selectedItemIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-foreground text-background rounded-full py-3 px-4 sm:px-6 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-10">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {selectedItemIds.length}
                        </span>
                        <span className="text-sm font-medium">Selected</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-white/10"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>

                        <div className="h-4 w-[1px] bg-white/20" />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedItemIds([])}
                            className="hover:bg-white/10"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Floating Add Button */}
            <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-center">
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="h-14 w-14 rounded-full shadow-xl hover:scale-105 transition-all duration-200"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
};

export default FullInventory;