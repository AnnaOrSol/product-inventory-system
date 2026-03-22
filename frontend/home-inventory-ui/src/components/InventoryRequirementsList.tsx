import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchInventoryRequirements,
    deleteInventoryRequirement,
    updateInventoryRequirement,
    deleteInventoryRequirementsBulk,
    addDefaultInventoryRequirements,
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
    Square,
    Sparkles,
    PackagePlus,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function InventoryRequirementsList() {
    const navigate = useNavigate();

    const [requirements, setRequirements] = useState<InventoryRequirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<number>(0);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [addingDefaults, setAddingDefaults] = useState(false);

    const loadData = () => {
        setLoading(true);
        fetchInventoryRequirements()
            .then(setRequirements)
            .catch(() => {
                toast.error("Failed to load inventory requirements");
            })
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
        if (!window.confirm("Are you sure you want to delete this requirement?")) return;

        try {
            await deleteInventoryRequirement(genericProductId);
            toast.success("Requirement deleted");
            loadData();
        } catch {
            toast.error("Failed to delete requirement");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} requirement items?`)) return;

        try {
            await deleteInventoryRequirementsBulk(selectedIds);
            setSelectedIds([]);
            setIsSelectionMode(false);
            toast.success("Selected requirements deleted");
            loadData();
        } catch {
            toast.error("Failed to delete selected requirements");
        }
    };

    const handleSaveUpdate = async (genericProductId: number) => {
        if (editValue < 1) {
            toast.error("Minimum quantity must be at least 1");
            return;
        }

        try {
            await updateInventoryRequirement(genericProductId, editValue);
            setEditingId(null);
            toast.success("Requirement updated");
            loadData();
        } catch {
            toast.error("Failed to update requirement");
        }
    };

    const handleAddDefaults = async () => {
        try {
            setAddingDefaults(true);
            const response = await addDefaultInventoryRequirements();

            if (response.addedCount > 0 && response.skippedCount > 0) {
                toast.success(
                    `Added ${response.addedCount} default items. ${response.skippedCount} already existed.`
                );
            } else if (response.addedCount > 0) {
                toast.success(`Added ${response.addedCount} default items`);
            } else {
                toast.info("All default items are already in your list");
            }

            loadData();
        } catch {
            toast.error("Failed to add default requirements");
        } finally {
            setAddingDefaults(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground">
                Loading requirements...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleAddDefaults}
                        disabled={addingDefaults}
                        className="gap-2"
                    >
                        {addingDefaults ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adding defaults...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Add defaults
                            </>
                        )}
                    </Button>

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

            {requirements.length === 0 ? (
                <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm">
                        <PackagePlus className="h-7 w-7 text-muted-foreground" />
                    </div>

                    <h3 className="text-lg font-semibold">Your requirements list is empty</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        Start by adding your own required items, or add a default household essentials list in one click.
                    </p>

                    <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
                        <Button
                            onClick={handleAddDefaults}
                            disabled={addingDefaults}
                            className="gap-2"
                        >
                            {addingDefaults ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Adding defaults...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Add default essentials
                                </>
                            )}
                        </Button>

                        <AddRequirementDialog onSave={loadData} />
                    </div>
                </div>
            ) : (
                <div className="grid gap-3">
                    {requirements.map((req) => (
                        <div
                            key={req.id}
                            className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md md:flex-row md:items-center md:justify-between"
                        >
                            <div className="flex items-start gap-3">
                                {isSelectionMode && (
                                    <button
                                        onClick={() => toggleSelectItem(req.genericProductId)}
                                        className="mt-1"
                                    >
                                        {selectedIds.includes(req.genericProductId) ? (
                                            <CheckSquare className="h-5 w-5 text-primary fill-primary/10" />
                                        ) : (
                                            <Square className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </button>
                                )}

                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">
                                        {req.genericProductName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Generic product ID: {req.genericProductId}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 md:justify-end">
                                {editingId === req.genericProductId ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(Number(e.target.value))}
                                            className="w-24 rounded-md border px-2 py-1 text-sm"
                                            min={1}
                                        />
                                        <button
                                            onClick={() => handleSaveUpdate(req.genericProductId)}
                                            className="rounded-md p-1 text-green-600 transition hover:bg-green-50"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="rounded-md p-1 text-red-600 transition hover:bg-red-50"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                                            Min: {req.minimumQuantity}
                                        </div>

                                        {!isSelectionMode && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(req.genericProductId);
                                                        setEditValue(req.minimumQuantity);
                                                    }}
                                                    className="rounded-md p-2 transition hover:bg-muted"
                                                    aria-label={`Edit ${req.genericProductName}`}
                                                >
                                                    <Edit2 size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(req.genericProductId)}
                                                    className="rounded-md p-2 transition hover:bg-muted"
                                                    aria-label={`Delete ${req.genericProductName}`}
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
            )}

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 z-50 flex w-[90%] max-w-md -translate-x-1/2 items-center justify-between rounded-full bg-foreground px-6 py-3 text-background shadow-2xl">
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {selectedIds.length}
                        </span>
                        <span className="text-sm font-medium">Selected</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-white/10 hover:text-red-300"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
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