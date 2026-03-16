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

export async function updateInventoryItem(
    id: number,
    updates: Partial<InventoryItem>
) {
    return apiFetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
            "X-Installation-Id": installationService.getId() || "",
        },
        body: JSON.stringify(updates),
    });
}

export async function deleteInventoryItem(id: number) {
    return apiFetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
            "X-Installation-Id": installationService.getId() || "",
        },
    });
}