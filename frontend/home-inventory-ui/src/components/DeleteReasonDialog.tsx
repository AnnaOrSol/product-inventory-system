import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DeleteInventoryItemReason } from "@/api/inventoryApi";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

type DeleteReasonDialogProps = {
    open: boolean;
    itemCount: number;
    loading?: boolean;
    onClose: () => void;
    onConfirm: (payload: {
        reason: DeleteInventoryItemReason;
        details?: string;
    }) => Promise<void> | void;
};

const reasonOptions: {
    value: DeleteInventoryItemReason;
    label: string;
    description: string;
}[] = [
        {
            value: "CONSUMED",
            label: "Consumed",
            description: "The product was used or finished",
        },
        {
            value: "EXPIRED",
            label: "Expired",
            description: "The product expired",
        },
        {
            value: "USER_ERROR",
            label: "User error",
            description: "Added by mistake or wrong item",
        },
        {
            value: "DAMAGED",
            label: "Damaged",
            description: "The product was damaged or ruined",
        },
        {
            value: "OTHER",
            label: "Other",
            description: "Any other reason",
        },
    ];

export function DeleteReasonDialog({
    open,
    itemCount,
    loading = false,
    onClose,
    onConfirm,
}: DeleteReasonDialogProps) {
    const [reason, setReason] =
        useState<DeleteInventoryItemReason>("CONSUMED");
    const [details, setDetails] = useState("");

    useEffect(() => {
        if (!open) {
            setReason("CONSUMED");
            setDetails("");
        }
    }, [open]);

    if (!open) return null;

    const handleConfirm = async () => {
        await onConfirm({
            reason,
            details: details.trim() || undefined,
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/30 flex items-end justify-center sm:items-center sm:p-4">
            <div
                className="absolute inset-0"
                onClick={loading ? undefined : onClose}
            />

            <div
                className={cn(
                    "relative w-full max-w-lg overflow-hidden border border-black/10 bg-white",
                    "rounded-t-[28px] sm:rounded-[28px]",
                    "shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.16)]",
                    "animate-in slide-in-from-bottom duration-200"
                )}
            >
                <div className="flex justify-center pt-3 sm:hidden">
                    <div className="h-1.5 w-12 rounded-full bg-black/15" />
                </div>

                <div className="flex items-start justify-between px-5 pb-3 pt-3 sm:pt-5">
                    <div className="pr-4">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">
                            Delete {itemCount > 1 ? `${itemCount} items` : "item"}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Choose the reason for deletion
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl text-muted-foreground hover:bg-muted"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="max-h-[65vh] overflow-y-auto px-5 pb-4">
                    <div className="space-y-3">
                        {reasonOptions.map((option) => {
                            const isSelected = reason === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setReason(option.value)}
                                    className={cn(
                                        "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                                        isSelected
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-black/10 bg-background hover:bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-base font-medium text-foreground">
                                                {option.label}
                                            </div>
                                            <div className="mt-1 text-sm text-muted-foreground">
                                                {option.description}
                                            </div>
                                        </div>

                                        <div
                                            className={cn(
                                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                                                isSelected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-black/15 bg-background"
                                            )}
                                        >
                                            {isSelected && <Check className="h-3.5 w-3.5" />}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-foreground">
                            Details (optional)
                        </label>
                        <Input
                            placeholder="Add a short note..."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="h-12 rounded-2xl"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-black/5 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-2xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        className="rounded-2xl"
                    >
                        {loading ? "Deleting..." : "Confirm delete"}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
}