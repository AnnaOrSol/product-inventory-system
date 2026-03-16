export const CONFIG = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8087",
    IS_PRODUCTION: import.meta.env.PROD,
};

export const API_PATHS = {
    PRODUCT_API: `${CONFIG.API_BASE_URL}/product`,
    INVENTORY_API: `${CONFIG.API_BASE_URL}/inventory`,
    INSTALLATIONS_API: `${CONFIG.API_BASE_URL}/installations`,
    INSTALLATION_MEMBERS_API: `${CONFIG.API_BASE_URL}/installation-members`,
<<<<<<< HEAD
    NOTES_API: `${CONFIG.API_BASE_URL}/notes`,
=======
>>>>>>> main
};