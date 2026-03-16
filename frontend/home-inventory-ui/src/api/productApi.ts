import { Product, CreateProductRequest } from "@/types/product";
import { API_PATHS } from "@/lib/config";
import { apiFetch } from "@/api/apiClient";

const PRODUCT_API = API_PATHS.PRODUCT_API;

export async function fetchProducts(): Promise<Product[]> {
    return apiFetch(`${PRODUCT_API}/items`);
}

export async function createProduct(productData: CreateProductRequest): Promise<Product> {
    return apiFetch(`${PRODUCT_API}`, {
        method: "POST",
        body: JSON.stringify(productData),
    });
}