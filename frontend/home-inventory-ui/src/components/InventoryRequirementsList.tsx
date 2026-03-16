import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchInventoryRequirements,
    deleteInventoryRequirement,
    updateInventoryRequirement,
    deleteInventoryRequirementsBulk,
} from "@/api/inventoryRequirementsApi";
import { AddRequirementDialog } from "./AddRequirementDialog";
import type { InventoryRequirement } from "@/types/inventoryRequirement";
import {
    Trash2,
    Edit2,
    Check,
    X,
    ArrowLeft,
    CheckSquare,
    Square
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function InventoryRequirementsList() {
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState<InventoryRequirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<number>(0);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const loadData = () => {
        setLoading(true);
        fetchInventoryRequirements()
            .then(setRequirements)
            .finally(() => setLoading(false));
    };

    useEffect(loadData, []);

    const toggleSelectItem = (genericProductId: number) => {
        setSelectedIds((prev) =>
            prev.includes(genericProductId)
                ? prev.filter((id) => id !== genericProductId)
                : [...prev, genericProductId]
        );
    };

    const handleDelete = async (genericProductId: number) => {
        if (confirm("Are you sure?")) {
            await deleteInventoryRequirement(genericProductId);
            loadData();
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} requirement items?`)) return;

        await deleteInventoryRequirementsBulk(selectedIds);
        setSelectedIds([]);
        setIsSelectionMode(false);
        loadData();
    };

    const handleSaveUpdate = async (genericProductId: number) => {
        await updateInventoryRequirement(genericProductId, editValue);
        setEditingId(null);
        loadData();
    };

    if (loading) {
        return <div className="p-6 text-center text-sm text-gray-500">Loading requirements...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-3">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="flex items-center gap-2">
                    <Button
                        variant={isSelectionMode ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            setSelectedIds([]);
                        }}
                    >
                        {isSelectionMode ? "Cancel" : "Select"}
                    </Button>

                    <AddRequirementDialog onSave={loadData} />
                </div>
            </div>

            <div className="grid gap-3">
                {requirements.map((req) => (
                    <div
                        key={req.id}
                        className="flex justify-between items-center border rounded-lg p-4 bg-white shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            {isSelectionMode && (
                                <button onClick={() => toggleSelectItem(req.genericProductId)}>
                                    {selectedIds.includes(req.genericProductId) ? (
                                        <CheckSquare className="h-5 w-5 text-primary fill-primary/10" />
                                    ) : (
                                        <Square className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </button>
                            )}

                            <div className="flex flex-col">
                                <span className="font-medium">{req.genericProductName}</span>
                                <span className="text-xs text-gray-400">Generic product ID: {req.genericProductId}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {editingId === req.genericProductId ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(Number(e.target.value))}
                                        className="w-20 border rounded px-2 py-1"
                                        min={1}
                                    />
                                    <button
                                        onClick={() => handleSaveUpdate(req.genericProductId)}
                                        className="text-green-600"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="text-red-600"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-semibold">Min: {req.minimumQuantity}</span>
                                    {!isSelectionMode && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingId(req.genericProductId);
                                                    setEditValue(req.minimumQuantity);
                                                }}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Edit2 size={16} className="text-blue-600" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(req.genericProductId)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-foreground text-background rounded-full py-3 px-6 shadow-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {selectedIds.length}
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
                            onClick={() => setSelectedIds([])}
                            className="hover:bg-white/10"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}