import { Product } from "@/types/product";
import { CONFIG } from "@/lib/config"

const PRODUCT_API = CONFIG.PRODUCT_API;

export async function fetchProducts(): Promise<Product[]> {
    const res = await fetch(`${PRODUCT_API}/product/items`);

    if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
    }

    return res.json();
}

export async function createProduct(productData: {
    name: string;
    brand: string;
    barcode: string;
    category: string;
    createdAt: string;
    imageUrl: string;
}) {
    const response = await fetch(`${PRODUCT_API}/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error("Failed to create product");
    return response.json();
}
