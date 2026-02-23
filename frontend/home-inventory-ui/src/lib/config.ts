export const CONFIG = {
    PRODUCT_API: "http://localhost:8084",// || import.meta.env.VITE_API_URL_PRODUCT , //"http://192.168.3.22:8084",

    INVENTORY_API: "http://localhost:8085",// import.meta.env.VITE_API_URL_INVENTORY || , //"http://192.168.3.22:8085",

    INSTALLATIONS_API: "http://localhost:8085/installations",//import.meta.env.VITE_API_URL_INSTALLATIONS ||  //"http://192.168.3.22:8085/installations",

    IS_PRODUCTION: import.meta.env.PROD,
};