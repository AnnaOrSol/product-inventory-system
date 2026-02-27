export const CONFIG = {
    PRODUCT_API: "http://192.168.3.22:8084",// "http://localhost:8084",// || import.meta.env.VITE_API_URL_PRODUCT , //

    INVENTORY_API: "http://192.168.3.22:8085",//"http://localhost:8085",// import.meta.env.VITE_API_URL_INVENTORY || , //

    INSTALLATIONS_API: "http://192.168.3.22:8085/installations",//"http://localhost:8085/installations",//import.meta.env.VITE_API_URL_INSTALLATIONS ||  //

    IS_PRODUCTION: import.meta.env.PROD,
};