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
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6">
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
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* 🛍 Product Listing */}
          <div className="flex-1 space-y-3 sm:space-y-4">
            {cart.map((product) => (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "group rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200"
                )}
              >
                {/* ✅ Mobile-first layout:
                    - On mobile: stack content + actions
                    - On md+: row layout like before */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                    {/* Left: image + details */}
                    <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-zinc-900 break-words">
                          {product.name}
                        </h3>

                        {/* ✅ Wrap nicely on mobile */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-zinc-500">
                          <span className="font-medium text-zinc-700">
                            ₹{product.price}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="break-all">{product.color}</span>
                          {product.size && (
                            <>
                              <span className="text-zinc-300">•</span>
                              <span>Size: {product.size}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ✅ Actions:
                        - On mobile: full-width row, always visible
                        - On md+: right side */}
                    <div className="flex items-center justify-between md:justify-end gap-3">
                      {/* Quantity Control (bigger touch targets on mobile) */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(product.productId, -1)}
                          className="rounded-full h-10 w-10 md:h-8 md:w-8"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>

                        <span className="text-base sm:text-lg font-semibold w-10 text-center">
                          {product.quantity}
                        </span>

                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => updateQuantity(product.productId, 1)}
                          className="rounded-full h-10 w-10 md:h-8 md:w-8"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Remove Button (make it obvious on mobile) */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.productId)}
                        className="inline-flex items-center justify-center h-10 w-10 md:h-9 md:w-9 rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                        aria-label="Remove item"
                        title="Remove"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 💳 Cart Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[28rem] flex flex-col p-4 sm:p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm lg:sticky lg:top-28"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-sky-600" />
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
                Cart Summary ({totalItems})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 max-h-[40vh] lg:max-h-[55vh]">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    className="flex justify-between items-center py-3 border-b border-zinc-100"
                  >
                    <span className="text-xs sm:text-sm text-zinc-700 pr-3 break-words">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-zinc-900 whitespace-nowrap">
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
