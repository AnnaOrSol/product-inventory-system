import { InventoryItem } from "@/types/inventory";
import { CONFIG } from "@/lib/config"
import { installationService } from "@/services/installationService"

const API_BASE = CONFIG.INVENTORY_API;
const INSTALLATION_ID = installationService.getId() || "";

// GET
export async function fetchInventory(): Promise<InventoryItem[]> {
    const res = await fetch(`${API_BASE}/inventory/items`, {
        headers: {
            "X-Installation-Id": INSTALLATION_ID,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch inventory: ${res.status}`);
    }

    return res.json();
}

// POST
export function addInventoryItem(data: {
    installationId: string;
    productId: number;
    productName: string;
    quantity: number;
    bestBefore?: string;
    location?: string;
    notes?: string;
}) {
    return fetch(`${API_BASE}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).then((res) => {
        if (!res.ok) {
            throw new Error("Failed to add inventory item");
        }
        return res.json();
    });
}



// PUT
export async function updateInventoryItem(
    productId: number,
    updates: Partial<InventoryItem>
) {
    const res = await fetch(`${API_BASE}/inventory/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Installation-Id": INSTALLATION_ID,
        },
        body: JSON.stringify(updates),
    });

    if (!res.ok) {
        throw new Error(`Failed to update item: ${res.status}`);
    }

    return res.json();
}

// DELETE
export async function deleteInventoryItem(productId: number) {
    const res = await fetch(`${API_BASE}/inventory/${productId}`, {
        method: "DELETE",
        headers: {
            "X-Installation-Id": INSTALLATION_ID,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to delete inventory item");
    }
}
