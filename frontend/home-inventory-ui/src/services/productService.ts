import { GenericProduct } from "@/types/product";
import { API_PATHS } from "@/lib/config";
import { apiFetch } from "@/api/apiClient";

const PRODUCT_API = API_PATHS.PRODUCT_API;

export async function getGenericProducts(): Promise<GenericProduct[]> {
    return apiFetch(`${PRODUCT_API}/generic-products`);
}