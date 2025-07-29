import { useEffect, useState } from "react";
import { InteractiveCheckout } from "../../components/ui/interactive-checkout";
import NavBar from "../../components/user/NavBar";
import { loadCart } from "../../api/endpoints/products/user-products";

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
        // ✅ Ensure loading ends regardless of success or error
        setLoading(false);
      }
    };

    fetchCart(); 
  }, []);

  return (
    <div className="min-h-screen">
      <NavBar />
      <h2 className="text-center text-3xl text-black font-bold mt-28 mb-6">
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
  );
};

export default InteractiveCheckoutPage;
