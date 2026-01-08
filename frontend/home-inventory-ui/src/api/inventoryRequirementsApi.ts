import type { InventoryRequirement } from "@/types/inventoryRequirement";
import { CONFIG } from "@/lib/config"
import { installationService } from "@/services/installationService"

const API_BASE = CONFIG.INVENTORY_API;
const getHeaders = () => ({
    "Content-Type": "application/json",
    "X-Installation-Id": installationService.getId() || "",
});

export async function fetchInventoryRequirements(): Promise<InventoryRequirement[]> {
    const res = await fetch(`${API_BASE}/inventory/requirements/items`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
}

export async function fetchShoppingList(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/inventory/requirements/shopping-list`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch shopping list");
    return res.json();
}

export async function addInventoryRequirements(items: Partial<InventoryRequirement>[]) {
    const res = await fetch(`${API_BASE}/inventory/requirements/batch`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(items),
    });
    if (!res.ok) throw new Error("Failed to save items");
    return res.json();
}

export async function updateInventoryRequirement(productId: number, minimumQuantity: number) {
    const res = await fetch(`${API_BASE}/inventory/requirements/${productId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ minimumQuantity }),
    });
    if (!res.ok) throw new Error("Failed to update item");
    return res.json();
}

export async function deleteInventoryRequirement(productId: number) {
    const res = await fetch(`${API_BASE}/inventory/requirements/${productId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete item");
}