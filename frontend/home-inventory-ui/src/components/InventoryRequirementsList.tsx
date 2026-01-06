import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchInventoryRequirements, deleteInventoryRequirement, updateInventoryRequirement } from "@/api/inventoryRequirementsApi";
import { AddRequirementDialog } from "./AddRequirementDialog";
import type { InventoryRequirement } from "@/types/inventoryRequirement";
import { Trash2, Edit2, Check, X, ArrowLeft } from "lucide-react";

export function InventoryRequirementsList() {
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState<InventoryRequirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<number>(0);

    const loadData = () => {
        setLoading(true);
        fetchInventoryRequirements()
            .then(setRequirements)
            .finally(() => setLoading(false));
    };

    useEffect(loadData, []);

    const handleDelete = async (productId: number) => {
        if (confirm("Are you sure?")) {
            await deleteInventoryRequirement(productId);
            loadData();
        }
    };

    const handleSaveUpdate = async (productId: number) => {
        await updateInventoryRequirement(productId, editValue);
        setEditingId(null);
        loadData();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <AddRequirementDialog onSave={loadData} />
            </div>

            <div className="grid gap-3">
                {requirements.map(req => (
                    <div key={req.id} className="flex justify-between items-center border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex flex-col">
                            <span className="font-medium">{req.productName}</span>
                            <span className="text-xs text-gray-400">ID: {req.productId}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {editingId === req.productId ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(Number(e.target.value))}
                                        className="w-20 border rounded px-2 py-1"
                                    />
                                    <button onClick={() => handleSaveUpdate(req.productId)} className="text-green-600"><Check size={18} /></button>
                                    <button onClick={() => setEditingId(null)} className="text-red-600"><X size={18} /></button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-semibold">Min: {req.minimumQuantity}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingId(req.productId); setEditValue(req.minimumQuantity); }} className="p-1 hover:bg-gray-100 rounded">
                                            <Edit2 size={16} className="text-blue-600" />
                                        </button>
                                        <button onClick={() => handleDelete(req.productId)} className="p-1 hover:bg-gray-100 rounded">
                                            <Trash2 size={16} className="text-red-600" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}