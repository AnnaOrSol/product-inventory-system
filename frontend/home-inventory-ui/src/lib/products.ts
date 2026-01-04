export const PRODUCT_CATEGORIES = {
    dairy: ["Milk", "Cheese", "Yogurt", "Butter", "Eggs"],
    meat: ["Chicken", "Beef", "Fish"],
    produce: ["Apples", "Bananas", "Tomatoes", "Onions"],
    pantry: ["Rice", "Pasta", "Bread", "Flour", "Sugar", "Salt"],
    snacks: ["Chips", "Chocolate", "Cookies"],
    beverages: ["Water", "Juice", "Coffee", "Tea"],
};

export const ALL_PRODUCTS = Object.values(PRODUCT_CATEGORIES)
    .flat()
    .sort();
