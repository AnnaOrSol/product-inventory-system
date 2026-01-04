import { Product } from "@/types/product";

const PRODUCT_API = "http://192.168.3.22:8084/product";

export async function fetchProducts(): Promise<Product[]> {
    const res = await fetch(`${PRODUCT_API}/items`);

    if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
    }

    return res.json();
}
