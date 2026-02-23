import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Package,
    Search,
    SlidersHorizontal,
    LogOut,
    Settings as SettingsIcon,
    Camera,
    X,
    ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryCard } from "@/components/InventoryCard";
import { AddItemForm } from "@/components/AddItemForm";
import { LoginScreen } from "@/components/LoginScreen";
import { Scanner } from "@/components/Scanner";
import { fetchInventory } from "@/api/inventoryApi";
import { installationService } from "@/services/installationService";
import type { InventoryItem } from "@/types/inventory";
import { fetchShoppingList } from "@/api/inventoryRequirementsApi";
import { VoiceInventoryButton } from "@/components/VoiceInventoryButton";
import { fetchProducts } from "@/api/productApi";
import type { Product } from "@/types/product";

const Index = () => {
    const navigate = useNavigate();
    const [installationId, setInstallationId] = useState<string | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "date" | "expiry">("expiry");
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    // Initial load: check for saved session
    useEffect(() => {
        const savedId = installationService.getId();
        if (savedId) {
            setInstallationId(savedId);
        }
        setLoading(false);
    }, []);

    const loadItems = async () => {
        try {
            const inventoryItems = await fetchInventory();
            setItems(inventoryItems);
        } catch (error) {
            console.error("Failed to load inventory:", error);
        }
    };

    const handleLogout = () => {
        installationService.clearId();
        setInstallationId(null);
        setItems([]);
    };

    const handleItemDeleted = (productId: number) => {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    // Auto-load items when ID is set
    useEffect(() => {
        if (installationId) {
            loadItems();
        }
    }, [installationId]);

    useEffect(() => {
        const aliasMap: Record<string, string[]> = {
            "Milk 3% Tnuva": ["חלב", "חלב תנובה", "חלב שלוש", "חלב 3"],
            "Paper Towels": ["נייר סופג", "מגבות נייר"],
            "Eggs L": ["ביצים", "ביצים גדולות"],
        };

        fetchProducts().then((ps) =>
            setProducts(
                ps.map((p) => ({
                    ...p,
                    aliases: aliasMap[(p as any).name] || [],
                }))
            )
        );
    }, []);

    const handleShareToWhatsApp = async () => {
        try {
            const missingItems = await fetchShoppingList();

            if (missingItems.length === 0) {
                alert("Inventory is full, nothing is missing!");
                return;
            }

            let message = "🛒 *Home Shopping List:* \n\n";
            missingItems.forEach((item: any) => {
                message += `• *${item.productName}*: Missing ${item.missingQuantity} units (Have: ${item.currentQuantity}, Need: ${item.requiredQuantity})\n`;
            });

            const encodedMessage = encodeURIComponent(message);
            const phoneNumber = "972547506539";
            const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
            window.location.href = whatsappUrl;
        } catch (error) {
            console.error("Failed to generate shopping list", error);
            alert("Error fetching the shopping list");
        }
    };

    // ---------- Category "Highlights" logic ----------
    const getProductCategory = (p: Product): string => {
        // Adjust here if your Product type uses a different field name.
        const anyP = p as any;
        return (
            anyP.category ||
            anyP.categoryCode ||
            anyP.category_name ||
            anyP.categoryName ||
            "Uncategorized"
        );
    };

    const categoryByProductId = useMemo(() => {
        // productId -> category
        return new Map<number, string>(
            products.map((p: Product) => [(p as any).id, getProductCategory(p)])
        );
    }, [products]);

    const categoryCounts = useMemo(() => {
        const acc: Record<string, number> = {};
        for (const item of items) {
            const cat =
                categoryByProductId.get(item.productId) ?? "Uncategorized";
            acc[cat] = (acc[cat] || 0) + 1;
        }
        return acc;
    }, [items, categoryByProductId]);

    const categories = useMemo(() => {
        const cats = Object.keys(categoryCounts).sort((a, b) => a.localeCompare(b));
        return ["All", ...cats];
    }, [categoryCounts]);

    // Filter by selected category first, then apply search+sort
    const itemsAfterCategoryFilter = useMemo(() => {
        if (selectedCategory === "All") return items;
        return items.filter((item) => {
            const cat = categoryByProductId.get(item.productId) ?? "Uncategorized";
            return cat === selectedCategory;
        });
    }, [items, selectedCategory, categoryByProductId]);

    // Filter and Sort Logic
    const filteredAndSortedItems = useMemo(() => {
        return itemsAfterCategoryFilter
            .filter((item) =>
                (item.productName ?? "")
                    .toLowerCase()
                    .includes((searchQuery ?? "").toLowerCase())
            )
            .sort((a, b) => {
                switch (sortBy) {
                    case "name":
                        return (a.productName || "").localeCompare(b.productName || "");
                    case "date": {
                        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                        return dateB - dateA;
                    }
                    case "expiry": {
                        const expA = a.bestBefore
                            ? new Date(a.bestBefore).getTime()
                            : Infinity;
                        const expB = b.bestBefore
                            ? new Date(b.bestBefore).getTime()
                            : Infinity;
                        return expA - expB;
                    }
                    default:
                        return 0;
                }
            });
    }, [itemsAfterCategoryFilter, searchQuery, sortBy]);

    const expiringCount = items.filter((item) => {
        if (!item.bestBefore) return false;
        const daysUntil = Math.ceil(
            (new Date(item.bestBefore).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysUntil <= 3 && daysUntil >= 0;
    }).length;

    if (loading) return null;

    if (!installationId) {
        return <LoginScreen onLoginSuccess={(id) => setInstallationId(id)} />;
    }

    const CATEGORY_ICONS: Record<string, string> = {
        DAIRY: "🥛",
        BEVERAGES: "🥤",
        PANTRY: "🍝",
        FRUITS: "🍎",
        CANNED_FOOD: "🥫",
        CLEANING: "🧼",
        SNACKS: "🍪",
        LAUNDRY: "🧺",
        PERSONAL_CARE: "🧴",
        VEGETABLES: "🥦",
        Uncategorized: "📦",
        All: "✨",
    };

    const getCategoryIcon = (cat: string) =>
        CATEGORY_ICONS[cat] || "📦";

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
                                    {items.length} items total
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowScanner(!showScanner)}
                                className={showScanner ? "text-red-500" : "text-primary"}
                                title={showScanner ? "Close Scanner" : "AI Scanner"}
                            >
                                {showScanner ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Camera className="h-5 w-5" />
                                )}
                            </Button>

                            {expiringCount > 0 && (
                                <div className="bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full text-xs font-medium border border-orange-200 hidden sm:block">
                                    {expiringCount} expiring soon
                                </div>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleShareToWhatsApp}
                                title="Share Shopping List"
                            >
                                <Package className="h-4 w-4 text-green-600" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/requirements")}
                                title="Inventory Requirements"
                            >
                                <ListChecks className="h-4 w-4 text-muted-foreground" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/settings")}
                                title="Settings"
                            >
                                <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <LogOut className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container py-6 pb-24">
                {showScanner ? (
                    <div className="animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">AI Product Scanner</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowScanner(false)}
                            >
                                Back to List
                            </Button>
                        </div>
                        <Scanner />
                    </div>
                ) : (
                    <>
                        {/* Category Highlights Bar */}
                        <div className="mb-5">
                            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {categories.map((cat) => {
                                    const isActive = selectedCategory === cat;
                                    const count =
                                        cat === "All" ? items.length : categoryCounts[cat] || 0;

                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className="flex flex-col items-center shrink-0 select-none"
                                            title={cat}
                                        >
                                            <div
                                                className={[
                                                    "h-12 w-12 rounded-full flex items-center justify-center border transition",
                                                    isActive
                                                        ? "border-foreground bg-foreground text-background"
                                                        : "border-muted-foreground/20 bg-background text-foreground hover:bg-muted",
                                                ].join(" ")}
                                            >
                                                <span className="text-[18px] leading-none">
                                                    {getCategoryIcon(cat)}
                                                </span>
                                            </div>

                                            <div className="mt-1 text-[11px] text-muted-foreground max-w-[72px] truncate">
                                                {cat}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {count}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Search and Sort Controls */}
                        <div className="flex gap-2 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search inventory..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    setSortBy((prev) =>
                                        prev === "expiry" ? "name" : prev === "name" ? "date" : "expiry"
                                    )
                                }
                                className="shrink-0"
                                title="Sort"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Add Item Form */}
                        {showAddForm && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
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
                                        : selectedCategory !== "All"
                                            ? `No items in "${selectedCategory}"`
                                            : "Your inventory is empty"}
                                </h2>

                                {!searchQuery && !showAddForm && (
                                    <div className="flex gap-2 justify-center">
                                        <Button onClick={() => setShowAddForm(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Manual Add
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowScanner(true)}>
                                            <Camera className="h-4 w-4 mr-2" />
                                            Scan Item
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredAndSortedItems.map((item, index) => (
                                    <div
                                        key={item.productId || index}
                                        className="animate-in fade-in slide-in-from-bottom-2"
                                        style={{ animationDelay: `${index * 40}ms` }}
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
                    </>
                )}
            </main>

            {/* Floating Action Buttons */}
            {!showAddForm && !showScanner && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center">
                    {/* Voice Inventory */}
                    <VoiceInventoryButton products={products} />

                    {/* Scanner */}
                    <Button
                        onClick={() => setShowScanner(true)}
                        className="h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                        title="Scan with AI"
                    >
                        <Camera className="h-6 w-6" />
                    </Button>

                    {/* Manual Add */}
                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="h-14 w-14 rounded-full shadow-2xl"
                        title="Add manually"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Index;