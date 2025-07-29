import END_POINTS from "../../../constants/endpoints";
import { add_To_Cart, load_Cart, load_Product_Details, load_Products, load_Shop_Products, update_Cart } from "../../services/products/user-products-service";

export const loadProducts = () => {
    return load_Products(END_POINTS.LOAD_USER_PRODUCTS);
}
export const loadShopProducts = () => {
    return load_Shop_Products(END_POINTS.LOAD_SHOP_PRODUCTS);
}
export const loadProductDetails = (id) => {
    return load_Product_Details(END_POINTS.LOAD_PRODUCT_DETAILS, id);
};
export const addToCart = (data)=>{
    return add_To_Cart(END_POINTS.ADD_TO_CART,data)
}
export const loadCart = () => { 
    return load_Cart(END_POINTS.LOAD_CART);
}
export const updateCartQuantity = (cartId, quantity) => {
    return update_Cart(END_POINTS.UPDATE_CART_QUANTITY, { cartId, quantity });
}
export const removeCartItem = (cartId) => {
    return update_Cart(END_POINTS.UPDATE_CART_QUANTITY, { cartId, quantity: 0 });
}
