export const CONFIG = {
    PRODUCT_API: import.meta.env.VITE_API_URL_PRODUCT || "http://localhost:8084",

    INVENTORY_API: import.meta.env.VITE_API_URL_INVENTORY || "http://localhost:8085",

    INSTALLATIONS_API: import.meta.env.VITE_API_URL_INSTALLATIONS || "http://localhost:8085/installations",

    IS_PRODUCTION: import.meta.env.PROD,
};