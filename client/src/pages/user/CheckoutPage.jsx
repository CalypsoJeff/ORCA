// src/pages/user/CheckoutPage.jsx

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/user/NavBar";
import { loadCart } from "../../api/endpoints/products/user-products";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' or 'razorpay'

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await loadCart();
        if (res.data?.items) {
          setCartItems(res.data.items);
        }
      } catch (err) {
        console.error("Error loading cart", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleConfirmOrder = () => {
    const selectedAddress = user?.addresses?.[selectedAddressIndex];

    if (!selectedAddress) {
      alert("Please select a shipping address.");
      return;
    }

    if (paymentMethod === "cod") {
      alert("Order placed with Cash on Delivery!");
    } else {
      alert("Proceeding to Razorpay...");
    }

    // You can now POST order to backend here...
  };

  return (
    <>
      <NavBar />
      <div className="container mx-auto mt-28 px-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {loading ? (
          <p>Loading cart...</p>
        ) : (
          <>
            {/* Address Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                Select Shipping Address
              </h2>
              {user?.addresses?.length ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
  {user.addresses.map((addr, index) => (
    <div
      key={index}
      className={`border rounded-md p-4 cursor-pointer ${
        selectedAddressIndex === index
          ? "border-blue-600 bg-blue-200"
          : "border-gray-300"
      }`}
      onClick={() => setSelectedAddressIndex(index)}
    >
      <p>
        {addr.street}, {addr.city}, {addr.state}, {addr.country} -{" "}
        {addr.postalCode}
      </p>
      {addr.isDefault && (
        <span className="text-sm text-green-600">Default</span>
      )}
    </div>
  ))}
</div>

                  <div className="text-right">
                    <Button className="bg-sky-600" size="sm" onClick={() => navigate("/profile")}>
                      + Add New Address
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  No saved addresses.{" "}
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-blue-600 underline"
                  >
                    Add one
                  </button>
                </div>
              )}
            </div>

            {/* Product Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 items-center border rounded-lg p-4 shadow-sm"
                  >
                    <img
                      src={item.productId?.images?.[0] || "/placeholder.jpg"}
                      alt={item.productId?.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {item.productId?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} | Color:{" "}
                        <span
                          className="inline-block w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.color }}
                        ></span>{" "}
                        {item.color}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Quantity: {item.quantity}</span>
                        <span className="font-medium text-gray-800">
                          ₹{item.price} × {item.quantity} = ₹
                          {item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 font-bold text-lg">
                Total: ₹{totalPrice.toFixed(2)}
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
              <label className="mr-4">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="ml-2">Cash on Delivery</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                <span className="ml-2">Pay with Razorpay</span>
              </label>
            </div>

            {/* Confirm Button */}
            <div className="text-center">
              <Button className="bg-sky-600" onClick={handleConfirmOrder}>Place Order</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CheckoutPage;
