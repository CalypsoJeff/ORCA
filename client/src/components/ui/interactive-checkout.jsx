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

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === product.productId
      );
      if (existingItem) {
        return currentCart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

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
    <div className="w-full max-w-4xl mx-auto">
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShoppingCart className="w-12 h-12 text-zinc-400" />
          <h2 className="text-xl font-semibold text-zinc-600 mt-4">
            Your cart is empty
          </h2>
          <p className="text-sm text-zinc-500 mt-2 mb-4">
            Add some items to get started!
          </p>
          <Button onClick={() => navigate("/shop")}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Product Listing */}
          <div className="flex-1 space-y-3">
            {cart.map((product) => (
              <motion.div
                key={product.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "group p-4 rounded-xl",
                  "bg-white dark:bg-zinc-900",
                  "border border-zinc-200 dark:border-zinc-800",
                  "hover:border-zinc-300 dark:hover:border-zinc-700",
                  "transition-all duration-200"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "relative w-12 h-12 rounded-lg overflow-hidden",
                        "bg-zinc-100 dark:bg-zinc-800",
                        "transition-colors duration-200",
                        "group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
                      )}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {product.name}
                        </h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <span>₹{product.price}</span>
                        <span>•</span>
                        <span>{product.color}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addToCart(product)}
                    className="gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cart Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "w-80 flex flex-col",
              "p-4 rounded-xl",
              "bg-white dark:bg-zinc-900",
              "border border-zinc-200 dark:border-zinc-800",
              "sticky top-4",
              "max-h-[32rem]"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Cart ({totalItems})
              </h2>
            </div>

            <motion.div className="flex-1 overflow-y-auto min-h-0 -mx-4 px-4 space-y-3">
              <AnimatePresence initial={false} mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      layout: { duration: 0.2 },
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 mb-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {item.name}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        >
                          <X className="w-3 h-3 text-zinc-400" />
                        </motion.button>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            <Minus className="w-3 h-3" />
                          </motion.button>
                          <motion.span
                            layout
                            className="text-xs text-zinc-600 dark:text-zinc-400 w-4 text-center"
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          >
                            <Plus className="w-3 h-3" />
                          </motion.button>
                        </div>
                        <motion.span
                          layout
                          className="text-xs text-zinc-500 dark:text-zinc-400"
                        >
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <motion.div
              layout
              className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Total
                </span>
                <motion.span
                  layout
                  className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  <NumberFlow value={totalPrice} />
                </motion.span>
              </div>
              <Button size="sm" className="w-full gap-2"onClick={()=> navigate("/checkout")}>
                <CreditCard className="w-4 h-4" />
                Checkout
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export { InteractiveCheckout };
