export interface InventoryItem {
    id: number;

    // 🔑 logical reference
    productId: number;

    // 🖥️ display only (comes from DTO)
    productName: string;

    quantity: number;

    bestBefore?: string | null;

    createdAt: string;
    updatedAt: string;
}
