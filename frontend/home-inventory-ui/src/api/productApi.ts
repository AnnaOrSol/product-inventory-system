<<<<<<< HEAD
import { Product, CreateProductRequest } from "@/types/product";
=======
import { Product } from "@/types/product";
>>>>>>> main
import { API_PATHS } from "@/lib/config";
import { apiFetch } from "@/api/apiClient";

const PRODUCT_API = API_PATHS.PRODUCT_API;

export async function fetchProducts(): Promise<Product[]> {
    return apiFetch(`${PRODUCT_API}/items`);
}

<<<<<<< HEAD
export async function createProduct(productData: CreateProductRequest): Promise<Product> {
=======
export async function createProduct(productData: {
    name: string;
    brand: string;
    barcode: string;
    category: string;
    createdAt: string;
    imageUrl: string;
}) {
>>>>>>> main
    return apiFetch(`${PRODUCT_API}`, {
        method: "POST",
        body: JSON.stringify(productData),
    });
}