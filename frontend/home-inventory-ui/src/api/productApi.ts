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
