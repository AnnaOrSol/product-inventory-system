import { useState } from "react";
import {
    differenceInDays,
    isPast,
    isToday,
    parseISO,
    isValid,
} from "date-fns";
import {
    Trash2,
    Edit2,
    Calendar,
    Package,
    AlertTriangle,
    Check,
    X,
    Plus,
    Minus,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductSelect } from "./ProductSelect";

import { updateInventoryItem, deleteInventoryItem } from "@/api/inventoryApi";
import { cn } from "@/lib/utils";
import { safeFormatDate } from "@/lib/date";
import type { InventoryItem } from "@/types/inventory";
import { toast } from "sonner";

interface InventoryCardProps {
    item: InventoryItem;
    onUpdate: () => void;
    onDeleted?: (productId: number) => void;
}

export function InventoryCard({ item, onUpdate, onDeleted }: InventoryCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tapKey, setTapKey] = useState<"plus" | "minus" | null>(null);

    const [editData, setEditData] = useState({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        bestByDate: item.bestBefore,
    });

    /* ---------- Expiry logic ---------- */

    const bestByDate = item.bestBefore ? parseISO(item.bestBefore) : null;
    const isValidBestByDate = bestByDate !== null && isValid(bestByDate);
    const daysUntilExpiry = isValidBestByDate
        ? differenceInDays(bestByDate, new Date())
        : null;

    const isExpired =
        isValidBestByDate && isPast(bestByDate) && !isToday(bestByDate);

    const isExpiringSoon =
        isValidBestByDate &&
        daysUntilExpiry !== null &&
        daysUntilExpiry <= 3 &&
        daysUntilExpiry >= 0;

    const getExpiryStatus = () => {
        if (!isValidBestByDate)
            return { label: "No expiry date", color: "text-muted-foreground", bg: "bg-muted/10" };
        if (isExpired)
            return { label: "Expired", color: "text-destructive", bg: "bg-destructive/10" };
        if (isToday(bestByDate!))
            return { label: "Expires today", color: "text-orange-600", bg: "bg-orange-50" };
        if (isExpiringSoon)
            return { label: `${daysUntilExpiry} days left`, color: "text-orange-600", bg: "bg-orange-50" };
        return { label: `${daysUntilExpiry} days left`, color: "text-primary", bg: "bg-primary/10" };
    };

    const status = getExpiryStatus();

    /* ---------- Actions ---------- */

    const handleQuickUpdate = async (
        newQuantity: number,
        key: "plus" | "minus"
    ) => {
        if (newQuantity < 0) return;

        // Micro-interaction trigger
        setTapKey(key);
        setTimeout(() => setTapKey(null), 200);

        try {
            await updateInventoryItem(item.productId, {
                ...editData,
                quantity: newQuantity,
            });
            onUpdate();
        } catch {
            toast.error("Failed to update quantity");
        }
    };

    const handleSave = async () => {
        try {
            await updateInventoryItem(item.productId, editData);
            setIsEditing(false);
            onUpdate();
            toast.success("Updated successfully");
        } catch {
            toast.error("Failed to save changes");
        }
    };

    const handleDelete = async () => {
        try {
            onDeleted?.(item.productId);
            await deleteInventoryItem(item.productId);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCancel = () => {
        setEditData({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            bestByDate: item.bestBefore,
        });
        setIsEditing(false);
    };

    /* ---------- Edit mode ---------- */

    if (isEditing) {
        return (
            <Card className="border-primary/20 shadow-md">
                <CardContent className="p-4 space-y-4">
                    <ProductSelect
                        value={editData.productId}
                        onChange={(product) =>
                            setEditData({
                                ...editData,
                                productId: product.id,
                                productName: product.name,
                            })
                        }
                    />

                    <Input
                        type="number"
                        min="1"
                        className="h-11 rounded-xl"
                        value={editData.quantity}
                        onChange={(e) =>
                            setEditData({
                                ...editData,
                                quantity: parseInt(e.target.value, 10) || 1,
                            })
                        }
                    />

                    <Input
                        type="date"
                        className="h-11 rounded-xl"
                        value={editData.bestByDate ?? ""}
                        onChange={(e) =>
                            setEditData({
                                ...editData,
                                bestByDate: e.target.value || null,
                            })
                        }
                    />

                    <div className="flex gap-2">
                        <Button onClick={handleSave} className="flex-1">
                            <Check className="h-4 w-4 mr-2" /> Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel} className="flex-1">
                            <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    /* ---------- View mode ---------- */

    return (
        <Card
            className={cn(
                "transition-all duration-200",
                isExpired && "border-destructive/30 bg-destructive/5",
                isExpiringSoon && !isExpired && "border-warning/30 bg-warning/5"
            )}
        >
            <CardContent className="p-4">
                <div className="flex justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold truncate">{item.productName}</h3>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Qty</span>

                            <div
                                className={cn(
                                    "flex items-center gap-1 rounded-lg p-1 border",
                                    tapKey && "bg-primary/10"
                                )}
                            >
                                <button
                                    onClick={() =>
                                        handleQuickUpdate(item.quantity - 1, "minus")
                                    }
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-md",
                                        tapKey === "minus" && "animate-tap text-destructive"
                                    )}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>

                                <span className="w-8 text-center font-bold">
                                    {item.quantity}
                                </span>

                                <button
                                    onClick={() =>
                                        handleQuickUpdate(item.quantity + 1, "plus")
                                    }
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-md",
                                        tapKey === "plus" && "animate-tap text-primary"
                                    )}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {safeFormatDate(item.bestBefore ?? undefined)}
                        </div>

                        <div className="mt-2">
                            <span
                                className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                    status.bg,
                                    status.color
                                )}
                            >
                                {(isExpired || isExpiringSoon) && (
                                    <AlertTriangle className="h-3 w-3" />
                                )}
                                {status.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            className="text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
