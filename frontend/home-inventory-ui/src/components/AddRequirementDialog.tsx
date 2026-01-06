import { useState, useEffect } from "react";
import { addInventoryRequirements } from "@/api/inventoryRequirementsApi";
import { fetchProducts } from "@/api/productApi";
import { Plus, Trash } from "lucide-react";

export function AddRequirementDialog({ onSave }: { onSave: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [availableProducts, setAvailableProducts] = useState<{ id: number, name: string }[]>([]);
    const [items, setItems] = useState([{ productId: 0, productName: "", minimumQuantity: 1 }]);

    useEffect(() => {
        if (isOpen) {
            fetchProducts()
                .then(setAvailableProducts)
                .catch(err => console.error("Error loading products", err));
        }
    }, [isOpen]);

    const addRow = () => setItems([...items, { productId: 0, productName: "", minimumQuantity: 1 }]);

    const removeRow = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems.length ? newItems : [{ productId: 0, productName: "", minimumQuantity: 1 }]);
    };

    const handleSave = async () => {
        const validItems = items.filter(item => item.productId !== 0);
        if (validItems.length === 0) return;

        await addInventoryRequirements(validItems);
        setIsOpen(false);
        setItems([{ productId: 0, productName: "", minimumQuantity: 1 }]);
        onSave();
    };

    if (!isOpen) return <button onClick={() => setIsOpen(true)} className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2"><Plus size={18} /> Add Items</button>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <h3 className="text-xl font-bold mb-4">Add Mandatory Items</h3>

                <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center border-b pb-3">
                            <div className="col-span-7">
                                <label className="text-xs text-gray-400">Select Product</label>
                                <select
                                    className="w-full border p-2 rounded bg-gray-50 text-sm"
                                    value={item.productId}
                                    onChange={e => {
                                        const selectedProd = availableProducts.find(p => p.id === Number(e.target.value));
                                        const newItems = [...items];
                                        newItems[index].productId = selectedProd?.id || 0;
                                        newItems[index].productName = selectedProd?.name || "";
                                        setItems(newItems);
                                    }}
                                >
                                    <option value="0">Choose a product...</option>
                                    {availableProducts.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-3">
                                <label className="text-xs text-gray-400">Min. Qty</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full border p-2 rounded text-sm"
                                    value={item.minimumQuantity}
                                    onChange={e => {
                                        const newItems = [...items];
                                        newItems[index].minimumQuantity = Number(e.target.value);
                                        setItems(newItems);
                                    }}
                                />
                            </div>

                            <div className="col-span-2 flex justify-end pt-5">
                                <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600">
                                    <Trash size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t">
                    <button onClick={addRow} className="text-blue-600 font-medium text-sm hover:underline">+ Add Another Product</button>
                    <div className="flex gap-2">
                        <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Save All</button>
                    </div>
                </div>
            </div>
        </div>
    );
}