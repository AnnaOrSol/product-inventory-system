import { useState, useEffect, useRef } from "react";
import { fetchProducts } from "@/api/productApi";
import { RequirementSelectionGrid, type GridRef } from "./RequirementSelectionGrid";
import { Plus, X, Loader2, Save } from "lucide-react";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

export function AddRequirementDialog({ onSave }: { onSave: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const gridRef = useRef<GridRef>(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchProducts()
                .then(setAvailableProducts)
                .catch(err => console.error("Error loading products", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleItemsAdded = () => {
        onSave();
    };

    const handleFinalize = async () => {
        if (gridRef.current?.hasPendingItems) {
            await gridRef.current.triggerSave();
        }
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black shadow-lg shadow-orange-200 active:scale-95 transition-all uppercase tracking-tight"
            >
                <Plus size={22} strokeWidth={3} /> Add products
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white p-6 rounded-t-[2.5rem] sm:rounded-[2rem] w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">

                <div className="flex justify-between items-center mb-6 px-1">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Catalog</h3>
                        <p className="text-xs text-slate-400 font-medium">Tap items to add them to your list</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 min-h-[350px] pr-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-orange-500 h-10 w-10" />
                            <span className="text-sm font-bold text-slate-400">Loading catalog...</span>
                        </div>
                    ) : (
                        <RequirementSelectionGrid
                            ref={gridRef}
                            availableProducts={availableProducts}
                            onItemsAdded={handleItemsAdded}
                            onSelectionChange={setPendingCount}
                        />
                    )}
                </div>

                <div className="mt-6 pt-2 border-t border-slate-50">
                    <button
                        onClick={handleFinalize}
                        className={cn(
                            "w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm",
                            pendingCount > 0
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 animate-pulse-subtle"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                    >
                        {pendingCount > 0 ? (
                            <>
                                <Save size={18} />
                                Sync & Exit ({pendingCount})
                            </>
                        ) : (
                            "Close catalog"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}