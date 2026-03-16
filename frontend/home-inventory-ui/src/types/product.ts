export interface Product {
    id: number;
    name: string;
    brand?: string | null;
    barcode?: string | null;

    createdAt: string;
    imageUrl?: string | null;

    genericProductId?: number | null;
    genericProductName?: string | null;
}

export interface GenericProduct {
    id: number;
    name: string;
    categoryCode: string;
    categoryDisplayName: string;
    imageUrl?: string | null;
}

export interface CreateProductRequest {
    name: string;
    barcode?: string | null;
    brand?: string | null;
    imageUrl?: string | null;

    genericProductId: number;
}