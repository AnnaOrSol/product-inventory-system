/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL_PRODUCT: string;
    readonly VITE_API_URL_INVENTORY: string;
    readonly VITE_API_URL_INSTALLATIONS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}