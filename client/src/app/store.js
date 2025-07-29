import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/ecommerce/cartSlice";
import adminAuthReducer from "../features/admin/adminAuthSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "cart", "adminAuth"],
};
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  adminAuth: adminAuthReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export { store, persistor };
