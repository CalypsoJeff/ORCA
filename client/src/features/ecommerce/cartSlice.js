// src/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addToCart, removeCartItem, updateCartQuantity } from "../../api/endpoints/products/user-products";

// Backend sync: async thunk to add to backend cart model
export const addToCartAsync = createAsyncThunk(
  "cart/addToCartAsync",
  async ({ productId, size, color, quantity }) => {
    const response = await addToCart({ productId, size, color, quantity });
    return response.data;
  }
);
export const updateQuantityAsync = createAsyncThunk(
  "cart/updateQuantityAsync",
  async ({ cartId, quantity }) => {
    const response = await updateCartQuantity(cartId, quantity);
    return { cartId, quantity };
  }
);

export const removeCartItemAsync = createAsyncThunk(
  "cart/removeCartItemAsync",
  async (cartId) => {
    await removeCartItem(cartId);
    return cartId;
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    status: null,
  },
  reducers: {
    addToCartLocally: (state, action) => {
      const { product, size, color, quantity } = action.payload;
      const existing = state.items.find(
        (item) =>
          item.id === product._id && item.size === size && item.color === color
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          id: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount,
          image: product.images?.[0] || "/fallback-image.jpg",
          size,
          color,
          quantity,
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.status = "success";
        const newCart = action.payload;

        // Find the latest item added to the cart
        const newItem = newCart.items[newCart.items.length - 1];

        const existing = state.items.find(
          (item) =>
            item.productId === newItem.productId &&
            item.size === newItem.size &&
            item.color === newItem.color
        );

        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          state.items.push(newItem);
        }
      })

      .addCase(addToCartAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(updateQuantityAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        const { cartId, quantity } = action.payload;
        const existing = state.items.find((item) => item.cartId === cartId);
        if (existing) {
          existing.quantity = quantity;
        }
        state.status = "success";
      })
      .addCase(updateQuantityAsync.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(removeCartItemAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        const cartId = action.payload;
        state.items = state.items.filter((item) => item.cartId !== cartId);
        state.status = "success";
      })
      .addCase(removeCartItemAsync.rejected, (state) => {
        state.status = "failed";
      });

  },
});

export const { addToCartLocally } = cartSlice.actions;
export default cartSlice.reducer;
