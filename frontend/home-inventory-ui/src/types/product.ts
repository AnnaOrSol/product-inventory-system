export interface Product {
    id: number;
    name: string;
    brand: string;
    barcode: string;
    category: string;
    createdAt: string;
    imageUrl: string;
    isOfficial: boolean;
    aliases?: string[];
}
