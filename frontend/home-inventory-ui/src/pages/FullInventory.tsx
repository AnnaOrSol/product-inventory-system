import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    LayoutGrid,
    List,
    Download,
    Package,
    Trash2,
    CheckSquare,
    Square,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryCard } from "@/components/InventoryCard";
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

    // --- Bulk Edit State ---
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [inventoryData, productsData] = await Promise.all([
                fetchInventory(),
                fetchProducts()
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
            products.map((p) => [p.id, (p as any).categoryDisplayName || "Uncategorized"])
        );
    }, [products]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            // שינוי ל-genericProductName
            const matchesSearch = (item.genericProductName ?? "").toLowerCase().includes(searchQuery.toLowerCase());
            // שינוי ל-genericProductId
            const itemCat = categoryByProductId.get(item.genericProductId) ?? "Uncategorized";
            const matchesCategory = selectedCategory === "All" || itemCat === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, searchQuery, selectedCategory, categoryByProductId]);

    const toggleSelectItem = (id: number) => {
        setSelectedItemIds(prev =>
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const handleItemDeleted = (inventoryItemId: number) => {
        setItems((prev) => prev.filter((item) => item.id !== inventoryItemId));
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedItemIds.length} items?`)) return;

        try {
            await Promise.all(selectedItemIds.map(id => deleteInventoryItem(id)));
            setSelectedItemIds([]);
            setIsSelectionMode(false);
            loadData();
        } catch (error) {
            alert("Failed to delete some items");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Inventory...</div>;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
                <div className="container py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-bold">Full Inventory</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={isSelectionMode ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                setSelectedItemIds([]);
                            }}
                        >
                            {isSelectionMode ? "Cancel" : "Select"}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                            {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-6">
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

                {/* Grid/List Display */}
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" : "space-y-3"}>
                    {filteredItems.map((item) => (
                        <div key={item.id} className="relative flex items-center gap-2">
                            {isSelectionMode && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleSelectItem(item.id)}
                                    className="shrink-0"
                                >
                                    {selectedItemIds.includes(item.id) ? (
                                        <CheckSquare className="h-6 w-6 text-primary fill-primary/10" />
                                    ) : (
                                        <Square className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </Button>
                            )}
                            <div className="flex-1">
                                <InventoryCard item={item} onUpdate={loadData} onDeleted={handleItemDeleted} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Bulk Action Bar - Appears only when items are selected */}
            {selectedItemIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-foreground text-background rounded-full py-3 px-6 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-10">
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
        </div>
    );
};

export default FullInventory;