// src/pages/user/CheckoutPage.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/user/NavBar";
import { loadCart } from "../../api/endpoints/products/user-products";
import axios from "axios";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const api = axios.create({
    baseURL: "https://orca-1-nie0.onrender.com",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await loadCart();
        if (res.data?.items) setCartItems(res.data.items);
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

  // --- load Razorpay SDK on demand ---
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const payWithRazorpay = async (addressId) => {
    setPaying(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load Razorpay SDK");

      // 1) Create Razorpay order on your API
      const { data: payload } = await api.post(
        "/api/payments/razorpay/create-order",
        { addressId, userId: user?._id } // send userId if req.user isn't set by middleware
      );
      // payload: { key, amount, currency, razorpayOrderId, orderId }

      // 2) Open Razorpay checkout
      const options = {
        key: payload.key,
        amount: payload.amount, // paise
        currency: payload.currency,
        order_id: payload.razorpayOrderId,
        name: "ORCA E-Commerce",
        description: "Order payment",
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: { app: "ecommerce", orderId: String(payload.orderId) },
        theme: { color: "#0ea5e9" },
        handler: async (resp) => {
          try {
            const { data } = await api.post(
              "/api/payments/razorpay/verify",
              resp
            );
            if (data.status === "success") {
              navigate(`/order/success/${data.orderId}`);
            } else {
              alert(data.error || "Payment verification failed");
            }
          } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            // optional
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (err) => {
        console.error("Payment failed:", err?.error);
        alert(err?.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error || err.message || "Unable to start payment"
      );
    } finally {
      setPaying(false);
    }
  };

  // --- main handler ---
  const handleConfirmOrder = () => {
    const selectedAddress = user?.addresses?.[selectedAddressIndex];
    const addressId = selectedAddress?._id || selectedAddress?.id;

    if (!selectedAddress || !addressId) {
      alert("Please select a valid shipping address.");
      return;
    }

    if (paymentMethod === "cod") {
      // Optional: call a /orders/create-cod endpoint to place order without payment
      alert("Order placed with Cash on Delivery!");
      // navigate("/orders"); // or go to an order confirmation page
      return;
    }

    // Razorpay flow
    payWithRazorpay(addressId);
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
                        key={addr._id || index}
                        className={`border rounded-md p-4 cursor-pointer ${
                          selectedAddressIndex === index
                            ? "border-blue-600 bg-blue-200"
                            : "border-gray-300"
                        }`}
                        onClick={() => setSelectedAddressIndex(index)}
                      >
                        <p>
                          {addr.street}, {addr.city}, {addr.state},{" "}
                          {addr.country} - {addr.postalCode}
                        </p>
                        {addr.isDefault && (
                          <span className="text-sm text-green-600">
                            Default
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-right">
                    <Button
                      className="bg-sky-600"
                      size="sm"
                      onClick={() => navigate("/profile")}
                    >
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
                        />{" "}
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
              <label className="ml-6">
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
              <Button
                className="bg-sky-600"
                onClick={handleConfirmOrder}
                disabled={paying}
              >
                {paying ? "Processing…" : "Place Order"}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CheckoutPage;
