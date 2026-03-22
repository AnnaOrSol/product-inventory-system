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
        <div className="min-h-screen  px-3 gradient-warm">
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
                            <button
                                onClick={() => navigate("/inventory")}
                                className="w-full rounded-[28px] border border-border/60 bg-white/70 backdrop-blur-sm px-5 py-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-white group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105 group-hover:bg-primary/15">
                                            <Package className="h-7 w-7" />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-lg font-semibold text-foreground">
                                                    Full Inventory
                                                </h2>
                                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                                                    {items.length} items
                                                </span>
                                            </div>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Browse, update and manage everything you have at home
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 transition-all duration-300 group-hover:bg-primary/10">
                                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                                    </div>
                                </div>
                            </button>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 border border-amber-100">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em]">
                                        Expiring Soon
                                    </h2>
                                </div>

                                {urgentItems.length > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                        {urgentItems.length} item{urgentItems.length > 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                {urgentItems.length === 0 ? (
                                    <div className="rounded-[28px] border border-border/60 bg-white/50 px-6 py-10 text-center shadow-sm">
                                        <p className="text-sm text-muted-foreground">
                                            No items expiring soon. Nice work 🍏
                                        </p>
                                    </div>
                                ) : (
                                    urgentItems.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="animate-in fade-in slide-in-from-bottom-1 duration-500"
                                            style={{ animationDelay: `${index * 70}ms` }}
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
                    {/*
                    <VoiceInventoryButton products={products} />

                    <Button
                        onClick={() => setShowScanner(true)}
                        className="h-14 w-14 rounded-full shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200"
                    >
                        <Camera className="h-6 w-6" />
                    </Button>
                    {*/}
                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="h-14 w-14 rounded-full shadow-xl hover:scale-105 transition-all duration-200"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Index;