/* eslint-disable react/prop-types */
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingCart, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { useDispatch } from "react-redux";
import {
  removeCartItemAsync,
  updateQuantityAsync,
} from "../../features/ecommerce/cartSlice";
import { useNavigate } from "react-router";

function InteractiveCheckout({ products = [] }) {
  const [cart, setCart] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!Array.isArray(products)) return;
    const normalized = products.map((item) => ({
      cartId: item._id,
      productId: item.productId._id,
      name: item.productId.name,
      color: item.color,
      size: item.size,
      price: item.price,
      quantity: item.quantity,
      image: item.productId.images?.[0],
      category: item.productId.category,
    }));
    setCart(normalized);
  }, [products]);

  const removeFromCart = (productId) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;
    setCart((prev) => prev.filter((i) => i.productId !== productId));
    dispatch(removeCartItemAsync(item.cartId));
  };

  const updateQuantity = (productId, delta) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) return;
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: newQty } : i
      )
    );
    dispatch(updateQuantityAsync({ cartId: item.cartId, quantity: newQty }));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShoppingCart className="w-14 h-14 text-zinc-400" />
          <h2 className="text-2xl font-semibold text-zinc-600 mt-4">
            Your cart is empty
          </h2>
          <p className="text-sm text-zinc-500 mt-2 mb-4">
            Add some items to get started!
          </p>
          <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 🛍 Product Listing */}
          <div className="flex-1 space-y-4">
            {cart.map((product) => (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "group p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200"
                )}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>₹{product.price}</span>
                        <span>•</span>
                        <span>{product.color}</span>
                        {product.size && <span>• Size: {product.size}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(product.productId, -1)}
                      className="rounded-full h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-medium w-6 text-center">
                      {product.quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(product.productId, 1)}
                      className="rounded-full h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product.productId)}
                    className="p-2 rounded-md hover:bg-red-100 text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 💳 Cart Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[28rem] flex flex-col p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-semibold text-zinc-900">
                Cart Summary ({totalItems})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    className="flex justify-between items-center py-3 border-b border-zinc-100"
                  >
                    <span className="text-sm text-zinc-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-sm font-medium text-zinc-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-200">
              <div className="flex justify-between mb-3 text-base font-medium">
                <span>Total</span>
                <span>
                  <NumberFlow value={totalPrice} />
                </span>
              </div>
              <Button
                size="lg"
                className="w-full gap-2 text-base"
                onClick={() => navigate("/checkout")}
              >
                <CreditCard className="w-5 h-5" />
                Proceed to Checkout
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export { InteractiveCheckout };
