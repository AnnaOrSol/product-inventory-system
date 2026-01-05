import type { InventoryRequirement } from "@/types/inventoryRequirement";
import { installationService } from "@/services/installationService"

const INSTALLATION_ID = installationService.getId() || "";

export async function fetchInventoryRequirements(): Promise<InventoryRequirement[]> {
    const res = await fetch("/inventory/requirements/items", {
        headers: {
            "X-Installation-Id": INSTALLATION_ID,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch inventory requirements");
    }

    return res.json();
}

export async function upsertInventoryRequirement(
    productId: number,
    minimumQuantity: number
) {
    const res = await fetch("/inventory/requirements", {
        method: "POST", // or PUT, depending on your backend
        headers: {
            "Content-Type": "application/json",
            "X-Installation-Id": INSTALLATION_ID,
        },
        body: JSON.stringify({ productId, minimumQuantity }),
    });

    if (!res.ok) {
        throw new Error("Failed to save inventory requirement");
    }

    return res.json();
}
