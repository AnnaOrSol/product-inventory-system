import { useMemo, useState } from "react";
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
    Package2,
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
    onDeleted?: (inventoryItemId: number) => void;
}

export function InventoryCard({ item, onUpdate, onDeleted }: InventoryCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tapKey, setTapKey] = useState<"plus" | "minus" | null>(null);

    const [editData, setEditData] = useState({
        productId: item.genericProductId,
        productName: item.genericProductName,
        quantity: item.quantity,
        bestBefore: item.bestBefore,
    });

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

    const status = useMemo(() => {
        if (!isValidBestByDate) {
            return {
                label: "No expiry date",
                pillClass: "bg-muted text-muted-foreground border-border",
                rowClass: "text-muted-foreground",
                showAlert: false,
            };
        }

        if (isExpired) {
            return {
                label: "Expired",
                pillClass: "bg-destructive/10 text-destructive border-destructive/20",
                rowClass: "text-destructive",
                showAlert: true,
            };
        }

        if (isToday(bestByDate!)) {
            return {
                label: "Expires today",
                pillClass: "bg-orange-50 text-orange-700 border-orange-200",
                rowClass: "text-orange-700",
                showAlert: true,
            };
        }

        if (isExpiringSoon) {
            return {
                label: `${daysUntilExpiry} days left`,
                pillClass: "bg-orange-50 text-orange-700 border-orange-200",
                rowClass: "text-orange-700",
                showAlert: true,
            };
        }

        return {
            label: `${daysUntilExpiry} days left`,
            pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
            rowClass: "text-emerald-700",
            showAlert: false,
        };
    }, [isValidBestByDate, isExpired, isExpiringSoon, daysUntilExpiry, bestByDate]);

    const colorVariant = useMemo(() => {
        const name = (item.genericProductName ?? "").toLowerCase();

        if (name.includes("milk") || name.includes("yogurt") || name.includes("cheese")) {
            return "from-sky-100 to-blue-50 text-sky-700";
        }
        if (name.includes("apple") || name.includes("tomato") || name.includes("pepper")) {
            return "from-rose-100 to-orange-50 text-rose-700";
        }
        if (name.includes("banana") || name.includes("corn") || name.includes("pasta")) {
            return "from-amber-100 to-yellow-50 text-amber-700";
        }
        if (name.includes("cucumber") || name.includes("lettuce") || name.includes("broccoli")) {
            return "from-emerald-100 to-green-50 text-emerald-700";
        }

        return "from-violet-100 to-fuchsia-50 text-violet-700";
    }, [item.genericProductName]);

    const initials = useMemo(() => {
        const name = item.genericProductName?.trim() || "Item";
        return name.slice(0, 2).toUpperCase();
    }, [item.genericProductName]);

    const handleQuickUpdate = async (
        newQuantity: number,
        key: "plus" | "minus"
    ) => {
        if (newQuantity < 0) return;

        setTapKey(key);
        setTimeout(() => setTapKey(null), 180);

        try {
            await updateInventoryItem(item.id, {
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
            await updateInventoryItem(item.id, editData);
            setIsEditing(false);
            onUpdate();
            toast.success("Updated successfully");
        } catch {
            toast.error("Failed to save changes");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteInventoryItem(item.id);
            onDeleted?.(item.id);
            onUpdate();
            toast.success("Item deleted");
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete item");
        }
    };

    const handleCancel = () => {
        setEditData({
            productId: item.genericProductId,
            productName: item.genericProductName,
            quantity: item.quantity,
            bestBefore: item.bestBefore,
        });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <Card className="h-full rounded-3xl border-primary/20 shadow-md">
                <CardContent className="p-4 space-y-4">
                    <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Product
                        </p>
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
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Quantity
                        </p>
                        <Input
                            type="number"
                            min="1"
                            className="h-11 rounded-2xl"
                            value={editData.quantity}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    quantity: parseInt(e.target.value, 10) || 1,
                                })
                            }
                        />
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Best before
                        </p>
                        <Input
                            type="date"
                            className="h-11 rounded-2xl"
                            value={editData.bestBefore ?? ""}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    bestBefore: e.target.value || null,
                                })
                            }
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <Button onClick={handleSave} className="flex-1 rounded-2xl">
                            <Check className="mr-2 h-4 w-4" />
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1 rounded-2xl"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                "group h-full overflow-hidden rounded-3xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                isExpired && "border-destructive/25 bg-destructive/[0.03]",
                isExpiringSoon && !isExpired && "border-orange-200 bg-orange-50/20"
            )}
        >
            <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 min-w-0">
                            <div
                                className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold shadow-sm",
                                    colorVariant
                                )}
                            >
                                {initials}
                            </div>

                            <div className="min-w-0">
                                <h3 className="truncate text-sm sm:text-base font-semibold text-foreground">
                                    {item.genericProductName}
                                </h3>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-4 rounded-2xl border bg-muted/30 p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                                Qty
                            </p>
                            <p className="mt-0.5 text-lg font-semibold text-foreground">
                                {item.quantity}
                            </p>
                        </div>

                        <div
                            className={cn(
                                "flex shrink-0 items-center gap-1 rounded-2xl border bg-background p-1 shadow-sm transition-colors",
                                tapKey && "bg-primary/5"
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => handleQuickUpdate(item.quantity - 1, "minus")}
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-xl transition",
                                    tapKey === "minus"
                                        ? "scale-95 text-destructive"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Minus className="h-4 w-4" />
                            </button>

                            <span className="w-8 text-center text-sm font-bold">
                                {item.quantity}
                            </span>

                            <button
                                type="button"
                                onClick={() => handleQuickUpdate(item.quantity + 1, "plus")}
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-xl transition",
                                    tapKey === "plus"
                                        ? "scale-95 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-muted/20 px-3 py-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                        {safeFormatDate(item.bestBefore ?? undefined)}
                    </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                    <span
                        className={cn(
                            "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] sm:text-xs font-medium shadow-sm",
                            status.pillClass
                        )}
                    >
                        {status.showAlert && (
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">{status.label}</span>
                    </span>
                    <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}