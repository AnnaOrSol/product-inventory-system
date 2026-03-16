// types/inventory.ts
export interface InventoryItem {
    id: number;
    installationId: string;
    genericProductId: number;
    genericProductName: string;
    quantity: number;
    location?: string | null;
    notes?: string | null;
    bestBefore?: string | null;
    createdAt: string;
    updatedAt?: string | null;
}