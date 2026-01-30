import { useState, useEffect } from "react";
import { loadCart } from "../../api/endpoints/products/user-products";
import NavBar from "../../components/user/NavBar";
import { InteractiveCheckout } from "../../components/ui/interactive-checkout";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";

const InteractiveCheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await loadCart();
        const cartData = response.data;
        if (cartData && Array.isArray(cartData.items)) {
          setCartItems(cartData.items);
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <PageBreadcrumbs />

      {/* ✅ Push content below fixed NavBar + PageBreadcrumbs */}
      <div className="pt-36 sm:pt-40 px-3 sm:px-6">
        <h2 className="text-center text-2xl sm:text-4xl text-black font-bold mb-6">
          Your Cart
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="text-gray-500">Loading cart...</div>
          </div>
        ) : (
          <InteractiveCheckout products={cartItems} />
        )}
      </div>
    </div>
  );
};

export default InteractiveCheckoutPage;
