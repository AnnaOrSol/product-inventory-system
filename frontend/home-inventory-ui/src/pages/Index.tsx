import { useState, useEffect } from "react";
import { Plus, Package, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryCard } from "@/components/InventoryCard";
import { AddItemForm } from "@/components/AddItemForm";
import { fetchInventory } from "@/api/inventoryApi";
import type { InventoryItem } from "@/types/inventory";

const Index = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "date" | "expiry">("expiry");

    const loadItems = async () => {
        const inventoryItems = await fetchInventory();
        setItems(inventoryItems);
    };

    const handleItemDeleted = (productId: number) => {
        setItems(prev => prev.filter(item => item.productId !== productId));
    };

    useEffect(() => {
        loadItems();
    }, []);

    const filteredAndSortedItems = items
        .filter(item =>
            (item.productName ?? "")
                .toLowerCase()
                .includes((searchQuery ?? "").toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.productName.localeCompare(b.productName);
                case "date":
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    );
                case "expiry":
                    return (
                        new Date(a.bestBefore ?? "").getTime() -
                        new Date(b.bestBefore ?? "").getTime()
                    );
                default:
                    return 0;
            }
        });

    const expiringCount = items.filter(item => {
        const daysUntil = Math.ceil(
            (new Date(item.bestBefore ?? "").getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysUntil <= 3 && daysUntil >= 0;
    }).length;

    return (
        <div className="min-h-screen gradient-warm">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
                <div className="container py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                                <Package className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="font-display text-xl font-bold text-foreground">
                                    Home Inventory
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    {items.length} items tracked
                                </p>
                            </div>
                        </div>

                        {expiringCount > 0 && (
                            <div className="bg-warning/10 text-warning px-3 py-1.5 rounded-full text-xs font-medium">
                                {expiringCount} expiring soon
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="container py-6 pb-24">
                {/* Search and Sort */}
                <div className="flex gap-2 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search inventory..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setSortBy(
                                sortBy === "expiry"
                                    ? "name"
                                    : sortBy === "name"
                                        ? "date"
                                        : "expiry"
                            )
                        }
                        className="shrink-0"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                {/* Sort indicator */}
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <span>Sorted by:</span>
                    <button
                        onClick={() =>
                            setSortBy(
                                sortBy === "expiry"
                                    ? "name"
                                    : sortBy === "name"
                                        ? "date"
                                        : "expiry"
                            )
                        }
                        className="font-medium text-primary hover:underline"
                    >
                        {sortBy === "expiry"
                            ? "Expiry Date"
                            : sortBy === "name"
                                ? "Name"
                                : "Date Added"}
                    </button>
                </div>

                {/* Add Item Form */}
                {showAddForm && (
                    <div className="mb-6">
                        <AddItemForm
                            onItemAdded={loadItems}
                            onClose={() => setShowAddForm(false)}
                        />
                    </div>
                )}

                {/* Inventory List */}
                {filteredAndSortedItems.length === 0 ? (
                    <div className="text-center py-16 animate-fade-in">
                        <div className="h-20 w-20 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                            <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                            {searchQuery
                                ? "No items found"
                                : "Your inventory is empty"}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            {searchQuery
                                ? "Try a different search term"
                                : "Start by adding your first item"}
                        </p>
                        {!searchQuery && !showAddForm && (
                            <Button onClick={() => setShowAddForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Item
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredAndSortedItems.map((item, index) => (
                            <div
                                key={item.id}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <InventoryCard
                                    item={item}
                                    onUpdate={loadItems}
                                    onDeleted={handleItemDeleted}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            {!showAddForm && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Button
                        variant="fab"
                        size="fab"
                        onClick={() => setShowAddForm(true)}
                        className="animate-scale-in"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Index;
