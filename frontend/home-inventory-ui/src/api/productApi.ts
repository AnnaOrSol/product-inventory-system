import { Product } from "@/types/product";
import { API_PATHS } from "@/lib/config"

const PRODUCT_API = API_PATHS.PRODUCT_API;

export async function fetchProducts(): Promise<Product[]> {
    const res = await fetch(`${PRODUCT_API}/items`);

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
    const response = await fetch(`${PRODUCT_API}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error("Failed to create product");
    return response.json();
}
