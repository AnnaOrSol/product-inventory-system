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
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductSelect } from "./ProductSelect";

import { updateInventoryItem, deleteInventoryItem } from "@/api/inventoryApi";
import { cn } from "@/lib/utils";
import { safeFormatDate } from "@/lib/date";
import type { InventoryItem } from "@/types/inventory";

interface InventoryCardProps {
    item: InventoryItem;
    onUpdate: () => void;
    onDeleted?: (productId: number) => void;
}

export function InventoryCard({ item, onUpdate, onDeleted }: InventoryCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        bestByDate: item.bestBefore,
    });


    /**
     * ===== Date handling (SAFE) =====
     */
    const bestByDate = item.bestBefore
        ? parseISO(item.bestBefore)
        : null;

    const isValidBestByDate = bestByDate !== null && isValid(bestByDate);

    const daysUntilExpiry = isValidBestByDate
        ? differenceInDays(bestByDate, new Date())
        : null;

    const isExpired = isValidBestByDate
        ? isPast(bestByDate) && !isToday(bestByDate)
        : false;

    const isExpiringSoon =
        isValidBestByDate && daysUntilExpiry !== null
            ? daysUntilExpiry <= 3 && daysUntilExpiry >= 0
            : false;

    const getExpiryStatus = () => {
        if (!isValidBestByDate) {
            return {
                label: "No expiry date",
                color: "text-muted-foreground",
                bg: "bg-muted/10",
            };
        }

        if (isExpired) {
            return {
                label: "Expired",
                color: "text-destructive",
                bg: "bg-destructive/10",
            };
        }

        if (isToday(bestByDate!)) {
            return {
                label: "Expires today",
                color: "text-warning",
                bg: "bg-warning/10",
            };
        }

        if (isExpiringSoon) {
            return {
                label: `${daysUntilExpiry} days left`,
                color: "text-warning",
                bg: "bg-warning/10",
            };
        }

        return {
            label: `${daysUntilExpiry} days left`,
            color: "text-primary",
            bg: "bg-primary/10",
        };
    };

    const status = getExpiryStatus();

    /**
     * ===== Actions =====
     */
    const handleSave = async () => {
        await updateInventoryItem(item.productId, editData);
        setIsEditing(false);
        onUpdate();
    };

    const handleDelete = async () => {
        try {
            onDeleted?.(item.productId); // remove from state (if provided)
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


    /**
     * ===== Edit mode =====
     */
    if (isEditing) {
        return (
            <Card className="animate-scale-in border-primary/20">
                <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">
                            Product
                        </label>
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

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80">
                                Quantity
                            </label>
                            <Input
                                type="number"
                                min="1"
                                value={editData.quantity}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        quantity: parseInt(e.target.value, 10) || 1,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground/80">
                                Best By
                            </label>
                            <Input
                                type="date"
                                value={editData.bestByDate ?? ""}
                                onChange={(e) =>
                                    setEditData({
                                        ...editData,
                                        bestByDate: e.target.value || null,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleSave} size="sm" className="flex-1">
                            <Check className="h-4 w-4 mr-1" />
                            Save
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    /**
     * ===== View mode =====
     */
    return (
        <Card
            className={cn(
                "animate-slide-up transition-all duration-200 hover:shadow-soft",
                isExpired && "border-destructive/30 bg-destructive/5",
                isExpiringSoon && !isExpired && "border-warning/30 bg-warning/5"
            )}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-primary shrink-0" />
                            <h3 className="font-semibold text-foreground truncate">
                                {item.productName}
                            </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="font-medium">Qty: {item.quantity}</span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {safeFormatDate(item.bestBefore ?? undefined)}

                            </span>
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

                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
