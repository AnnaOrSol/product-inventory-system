import { useEffect, useState } from "react";
import { fetchInventoryRequirements } from "@/api/inventoryRequirementsApi";
import type { InventoryRequirement } from "@/types/inventoryRequirement";

export function InventoryRequirementsList() {
    const [requirements, setRequirements] = useState<InventoryRequirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchInventoryRequirements()
            .then(setRequirements)
            .catch(() => setError("Failed to load inventory requirements"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p>Loading inventory requirements...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="space-y-3">
            {requirements.length === 0 ? (
                <p className="text-muted-foreground">
                    No inventory requirements defined yet
                </p>
            ) : (
                requirements.map(req => (
                    <div
                        key={req.id}
                        className="flex justify-between items-center border rounded p-3"
                    >
                        <span>Product Name: {req.productName}</span>
                        <span>Minimum: {req.minimumQuantity}</span>
                    </div>
                ))
            )}
        </div>
    );
};
