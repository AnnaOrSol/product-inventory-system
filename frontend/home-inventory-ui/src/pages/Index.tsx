import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Package,
    LogOut,
    Settings as SettingsIcon,
    Camera,
    X,
    ListChecks,
    ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { InventoryCard } from "@/components/InventoryCard";
import { AddItemForm } from "@/components/AddItemForm";
import { useAuth } from "@/context/AuthContext";
import { Scanner } from "@/components/Scanner";
import { fetchInventory } from "@/api/inventoryApi";
import { installationService } from "@/services/installationService";
import type { InventoryItem } from "@/types/inventory";
import { fetchShoppingList } from "@/api/inventoryRequirementsApi";
import { VoiceInventoryButton } from "@/components/VoiceInventoryButton";
import { fetchProducts } from "@/api/productApi";
import type { Product } from "@/types/product";
import { HomeNotes } from "@/components/HomeNotes";

const Index = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [installationId, setInstallationId] = useState<string | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);

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

    useEffect(() => {
        if (installationId) {
            loadItems();
        }
    }, [installationId]);

    useEffect(() => {
        fetchProducts().then((ps) => setProducts(ps));
    }, []);

    const handleLogout = () => {
        logout();
        setInstallationId(null);
        setItems([]);
        navigate("/login");
    };

    const handleItemDeleted = (inventoryItemId: number) => {
        setItems((prev) => prev.filter((item) => item.id !== inventoryItemId));
    };

    const handleShareToWhatsApp = async () => {
        try {
            const missingItems = await fetchShoppingList();
            if (missingItems.length === 0) {
                alert("Inventory is full!");
                return;
            }

            let message = "🛒 *Home Shopping List:* \n\n";
            missingItems.forEach((item: any) => {
                message += `• *${item.productName}*: Missing ${item.missingQuantity} units\n`;
            });

            window.location.href = `whatsapp://send?phone=972547506539&text=${encodeURIComponent(message)}`;
        } catch (error) {
            alert("Error fetching list");
        }
    };

    const urgentItems = useMemo(() => {
        return items
            .filter((item) => {
                if (!item.bestBefore) return false;
                const daysUntil = Math.ceil(
                    (new Date(item.bestBefore).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return daysUntil <= 3 && daysUntil >= 0;
            })
            .sort((a, b) => {
                const expA = new Date(a.bestBefore!).getTime();
                const expB = new Date(b.bestBefore!).getTime();
                return expA - expB;
            });
    }, [items]);

    if (loading || !installationId) return null;

    return (
        <div className="min-h-screen gradient-warm">
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
                <div className="container py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                                <Package className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="font-display text-xl font-bold text-foreground">
                                    Home
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
                            >
                                {showScanner ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Camera className="h-5 w-5" />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleShareToWhatsApp}
                            >
                                <Package className="h-4 w-4 text-green-600" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/requirements")}
                            >
                                <ListChecks className="h-4 w-4 text-muted-foreground" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate("/settings")}
                            >
                                <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                            </Button>

                            <Button variant="ghost" size="icon" onClick={handleLogout}>
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
                            <h2 className="text-lg font-semibold">AI Scanner</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowScanner(false)}
                            >
                                Back
                            </Button>
                        </div>
                        <Scanner />
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <HomeNotes />

                        <hr className="opacity-50" />

                        {showAddForm && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <AddItemForm
                                    onItemAdded={loadItems}
                                    onClose={() => setShowAddForm(false)}
                                />
                            </div>
                        )}

                        <section>
                            <Button
                                onClick={() => navigate("/inventory")}
                                variant="outline"
                                className="w-full h-24 border-2 border-dashed border-primary/20 bg-white/40 hover:bg-primary/5 flex justify-between px-6 rounded-3xl group transition-all hover:border-primary/40"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                        <Package className="h-7 w-7 text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-bold text-xl text-foreground">
                                            Full Inventory
                                        </span>
                                        <span className="text-xs text-muted-foreground italic">
                                            Check everything you have in stock
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <span className="block font-mono font-bold text-lg text-primary">
                                            {items.length}
                                        </span>
                                        <span className="text-[10px] uppercase text-muted-foreground">
                                            Items
                                        </span>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Button>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-orange-600">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                                </span>
                                <h2 className="text-xs font-bold uppercase tracking-widest">
                                    Expiring Soon
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {urgentItems.length === 0 ? (
                                    <div className="text-center py-12 bg-white/20 rounded-3xl border-2 border-dashed border-slate-200">
                                        <p className="text-sm text-muted-foreground italic">
                                            No items expiring soon. Good job! 🍏
                                        </p>
                                    </div>
                                ) : (
                                    urgentItems.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="animate-in fade-in slide-in-from-bottom-2"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <InventoryCard
                                                item={item}
                                                onUpdate={loadItems}
                                                onDeleted={handleItemDeleted}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {!showAddForm && !showScanner && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-center">
                    <VoiceInventoryButton products={products} />

                    <Button
                        onClick={() => setShowScanner(true)}
                        className="h-14 w-14 rounded-full shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Camera className="h-6 w-6" />
                    </Button>

                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="h-14 w-14 rounded-full shadow-2xl"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Index;