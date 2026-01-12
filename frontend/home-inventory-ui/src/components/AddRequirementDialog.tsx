import { useState, useEffect } from "react";
import { addInventoryRequirements } from "@/api/inventoryRequirementsApi";
import { fetchProducts } from "@/api/productApi";
import { RequirementSelectionGrid } from "./RequirementSelectionGrid";
import { Plus, X, Loader2 } from "lucide-react";
import type { Product } from "@/types/product";

export function AddRequirementDialog({ onSave }: { onSave: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

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
        // setIsOpen(false); 
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-primary text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold shadow-sm active:scale-95 transition-all"
            >
                <Plus size={20} /> Add products
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white p-6 rounded-t-[2.5rem] sm:rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">quick select</h3>
                        <p className="text-xs text-slate-400">Tap a product to add</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 min-h-[300px] pr-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-primary h-8 w-8" />
                            <span className="text-sm text-slate-400">Loading product catalog...</span>
                        </div>
                    ) : (
                        <RequirementSelectionGrid
                            availableProducts={availableProducts}
                            onItemsAdded={handleItemsAdded}
                        />
                    )}
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                    >
                        end
                    </button>
                </div>
            </div>
        </div>
    );
}