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
    const [editData, setEditData] = useState({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        bestByDate: item.bestBefore,
    });

    const bestByDate = item.bestBefore ? parseISO(item.bestBefore) : null;
    const isValidBestByDate = bestByDate !== null && isValid(bestByDate);
    const daysUntilExpiry = isValidBestByDate ? differenceInDays(bestByDate, new Date()) : null;
    const isExpired = isValidBestByDate ? isPast(bestByDate) && !isToday(bestByDate) : false;
    const isExpiringSoon = isValidBestByDate && daysUntilExpiry !== null ? daysUntilExpiry <= 3 && daysUntilExpiry >= 0 : false;

    const getExpiryStatus = () => {
        if (!isValidBestByDate) return { label: "No expiry date", color: "text-muted-foreground", bg: "bg-muted/10" };
        if (isExpired) return { label: "Expired", color: "text-destructive", bg: "bg-destructive/10" };
        if (isToday(bestByDate!)) return { label: "Expires today", color: "text-orange-600", bg: "bg-orange-50" };
        if (isExpiringSoon) return { label: `${daysUntilExpiry} days left`, color: "text-orange-600", bg: "bg-orange-50" };
        return { label: `${daysUntilExpiry} days left`, color: "text-primary", bg: "bg-primary/10" };
    };

    const status = getExpiryStatus();

    const handleQuickUpdate = async (newQuantity: number) => {
        if (newQuantity < 0) return;

        // ניסיון הפעלת רטט משופר
        try {
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate([30]);
            }
        } catch (e) {
            console.log("Vibration blocked or not supported");
        }

        try {
            await updateInventoryItem(item.productId, {
                ...editData,
                quantity: newQuantity
            });
            onUpdate();
        } catch (e) {
            toast.error("Failed to update quantity");
        }
    };

    const handleSave = async () => {
        try {
            await updateInventoryItem(item.productId, editData);
            setIsEditing(false);
            onUpdate();
            toast.success("Updated successfully");
        } catch (e) {
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

    if (isEditing) {
        return (
            <Card className="animate-scale-in border-primary/20 shadow-md mx-auto w-full max-w-full">
                <CardContent className="p-4 space-y-4">
                    {/* בחירת מוצר */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Product
                        </label>
                        <ProductSelect
                            value={editData.productId}
                            onChange={(product) => setEditData({ ...editData, productId: product.id, productName: product.name })}
                        />
                    </div>

                    {/* סידור אנכי למניעת חריגה מהמסך */}
                    <div className="flex flex-col gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Quantity
                            </label>
                            <Input
                                type="number"
                                min="1"
                                className="h-11 border-2 rounded-xl w-full"
                                value={editData.quantity}
                                onChange={(e) => setEditData({ ...editData, quantity: parseInt(e.target.value, 10) || 1 })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Best By
                            </label>
                            <Input
                                type="date"
                                className="h-11 border-2 rounded-xl w-full bg-white"
                                value={editData.bestByDate ?? ""}
                                onChange={(e) => setEditData({ ...editData, bestByDate: e.target.value || null })}
                            />
                        </div>
                    </div>

                    {/* כפתורי פעולה */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={handleSave}
                            className="flex-1 h-11 rounded-xl font-semibold"
                        >
                            <Check className="h-4 w-4 mr-2" /> Save
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="flex-1 h-11 rounded-xl border-2 font-semibold"
                        >
                            <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "animate-slide-up transition-all duration-200 hover:shadow-soft",
            isExpired && "border-destructive/30 bg-destructive/5",
            isExpiringSoon && !isExpired && "border-warning/30 bg-warning/5"
        )}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="h-4 w-4 text-primary shrink-0" />
                            <h3 className="font-semibold text-foreground truncate">{item.productName}</h3>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground font-medium">Qty:</span>
                                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border shadow-sm">
                                    <button
                                        onClick={() => handleQuickUpdate(item.quantity - 1)}
                                        disabled={item.quantity <= 0}
                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:text-destructive disabled:opacity-50 transition-all active:scale-95"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                    <button
                                        onClick={() => handleQuickUpdate(item.quantity + 1)}
                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm hover:text-primary transition-all active:scale-95"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {safeFormatDate(item.bestBefore ?? undefined)}
                            </div>
                        </div>

                        <div className="mt-2">
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", status.bg, status.color)}>
                                {(isExpired || isExpiringSoon) && <AlertTriangle className="h-3 w-3" />}
                                {status.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-9 w-9 text-muted-foreground hover:text-foreground">
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}