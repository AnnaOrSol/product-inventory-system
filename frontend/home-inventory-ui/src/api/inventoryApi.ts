import { InventoryItem } from "@/types/inventory";
import { API_PATHS } from "@/lib/config";
import { apiFetch } from "@/api/apiClient";
import { installationService } from "@/services/installationService";

const API_BASE = API_PATHS.INVENTORY_API;

export async function fetchInventory(): Promise<InventoryItem[]> {
    return apiFetch(`${API_BASE}/items`, {
        headers: {
            "X-Installation-Id": installationService.getId() || "",
        },
    });
}

export async function addInventoryItem(data: {
    installationId: string;
    genericProductId: number;
    specificProductId?: number;
    quantity: number;
    bestBefore?: string;
    location?: string;
}) {
    return apiFetch(`${API_BASE}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

<<<<<<< HEAD

=======
>>>>>>> main
export async function updateInventoryItem(
    id: number,
    updates: Partial<InventoryItem>
) {
<<<<<<< HEAD
    return apiFetch(`${API_BASE}/${id}`, {
=======
    return apiFetch(`${API_BASE}/${productId}`, {
>>>>>>> main
        method: "PUT",
        headers: {
            "X-Installation-Id": installationService.getId() || "",
        },
        body: JSON.stringify(updates),
    });
}

<<<<<<< HEAD
export async function deleteInventoryItem(id: number) {
    return apiFetch(`${API_BASE}/${id}`, {
=======
export async function deleteInventoryItem(productId: number) {
    return apiFetch(`${API_BASE}/${productId}`, {
>>>>>>> main
        method: "DELETE",
        headers: {
            "X-Installation-Id": installationService.getId() || "",
        },
    });
}