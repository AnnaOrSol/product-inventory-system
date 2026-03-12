import type { InventoryRequirement } from "@/types/inventoryRequirement";
import { API_PATHS } from "@/lib/config";
import { apiFetch } from "@/api/apiClient";
import { installationService } from "@/services/installationService";

const API_BASE = API_PATHS.INVENTORY_API;

const getHeaders = () => ({
    "X-Installation-Id": installationService.getId() || "",
});

export async function fetchInventoryRequirements(): Promise<InventoryRequirement[]> {
    return apiFetch(`${API_BASE}/requirements/items`, {
        headers: getHeaders(),
    });
}

export async function fetchShoppingList(): Promise<any[]> {
    return apiFetch(`${API_BASE}/requirements/shopping-list`, {
        headers: getHeaders(),
    });
}

export async function addInventoryRequirements(items: Partial<InventoryRequirement>[]) {
    return apiFetch(`${API_BASE}/requirements/batch`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(items),
    });
}

export async function updateInventoryRequirement(productId: number, minimumQuantity: number) {
    return apiFetch(`${API_BASE}/requirements/${productId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ minimumQuantity }),
    });
}

export async function deleteInventoryRequirement(productId: number) {
    return apiFetch(`${API_BASE}/requirements/${productId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
}