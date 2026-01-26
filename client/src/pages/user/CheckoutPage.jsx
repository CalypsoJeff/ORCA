import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "flowbite-react";
import { useNavigate, Link } from "react-router-dom";
import NavBar from "../../components/user/NavBar";
import { loadCart } from "../../api/endpoints/products/user-products";
import authInstanceAxios from "../../api/middlewares/interceptor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // 🔹 Fetch Cart
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await loadCart();
      if (res.data?.items) setCartItems(res.data.items);
    } catch (err) {
      console.error("Error loading cart", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch Addresses
  const fetchAddresses = async () => {
    try {
      const res = await authInstanceAxios.get("/api/user/addresses");
      setAddresses(res.data);
    } catch (error) {
      console.error("Error loading addresses", error);
      toast.error("Failed to load addresses");
    }
  };

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  // 🔹 Calculate Total
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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

      const { data: payload } = await authInstanceAxios.post(
        "/api/payments/razorpay/create-order",
        { addressId, userId: user?._id }
      );

      const options = {
        key: payload.key,
        amount: payload.amount,
        currency: payload.currency,
        order_id: payload.razorpayOrderId,

        name: "ORCA E-Commerce",
        description: "Order payment",

        // USE handler (SPA-friendly). Remove callback_url + redirect.
        handler: async function (response) {
          try {
            // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            // Call backend verify endpoint which uses HMAC to confirm payment
            const { data } = await authInstanceAxios.post(
              "/api/payments/razorpay/verify",
              verifyPayload
            );

            if (data?.status === "success") {
              // navigate to success page
              navigate(`/order/success/${data.orderId}`);
            } else {
              toast.error(
                "Payment verification failed. Please contact support."
              );
              navigate(`/payment-failed`);
            }
          } catch (err) {
            console.error("Payment verify error:", err);
            toast.error("Verification failed. Please contact support.");
            navigate(`/payment-failed`);
          }
        },

        // nice UX: if user closes modal
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            // Optional: call backend to mark order cancelled immediately if you have such endpoint:
            // authInstanceAxios.post("/api/payments/razorpay/cancel", { orderId: payload.orderId });
          },
        },

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },

        notes: {
          orderId: String(payload.orderId),
        },

        theme: {
          color: "#0ea5e9",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (err) => {
        console.error("Payment failed:", err?.error);
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.error || err.message || "Unable to start payment"
      );
    } finally {
      setPaying(false);
    }
  };

  const handleConfirmOrder = async () => {
    const selectedAddress = addresses[selectedAddressIndex];
    const addressId = selectedAddress?._id;

    if (!selectedAddress || !addressId) {
      toast.warn("Please select a valid shipping address.");
      return;
    }

    if (paymentMethod === "cod") {
      try {
        setPaying(true);
        const { data } = await authInstanceAxios.post(
          "/api/orders/create-cod",
          { addressId }
        );
        navigate(`/order/success/${data.orderId}`);
      } catch (err) {
        console.error(err);
        toast.error("Failed to place COD order");
      } finally {
        setPaying(false);
      }
      return;
    }

    payWithRazorpay(addressId);
  };

  return (
    <>
      <NavBar />
      <ToastContainer position="top-right" autoClose={2000} />

      {/* 🔹 Breadcrumbs */}
      <div className="max-w-6xl mx-auto mt-28 mb-4 px-4">
        <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="list-reset flex">
            <li>
              <Link
                to="/home"
                className="text-sky-600 hover:underline hover:text-sky-700"
              >
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link
                to="/cart"
                className="text-sky-600 hover:underline hover:text-sky-700"
              >
                Cart
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-700 font-medium">Checkout</li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto px-4 mb-16">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {loading ? (
          <p>Loading checkout details...</p>
        ) : (
          <>
            {/* 🔹 Address Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">
                Select Shipping Address
              </h2>
              {addresses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    {addresses.map((addr, index) => (
                      <div
                        key={addr._id}
                        className={`border rounded-md p-4 cursor-pointer transition-all ${
                          selectedAddressIndex === index
                            ? "border-sky-600 bg-sky-50"
                            : "border-gray-300 hover:border-sky-400"
                        }`}
                        onClick={() => setSelectedAddressIndex(index)}
                      >
                        <p className="font-medium text-gray-800">{addr.name}</p>
                        <p className="text-sm text-gray-600">
                          {addr.addressLine1}, {addr.city}, {addr.state} -{" "}
                          {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-500">{addr.phone}</p>
                        {addr.isDefault && (
                          <span className="text-xs text-green-600 font-medium">
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
                      onClick={() => navigate("/account/addresses")}
                    >
                      + Add New Address
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  No saved addresses.{" "}
                  <button
                    onClick={() => navigate("/account/profile")}
                    className="text-sky-600 underline"
                  >
                    Add one
                  </button>
                </div>
              )}
            </div>

            {/* 🔹 Order Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-4 items-center border rounded-lg p-4 shadow-sm mb-2"
                >
                  <img
                    src={item.productId?.images?.[0] || "/placeholder.jpg"}
                    alt={item.productId?.name}
                    className="w-24 h-24 object-cover rounded-md"
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
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Qty: {item.quantity}</span>
                      <span className="font-medium text-gray-800">
                        ₹{item.price} × {item.quantity} = ₹
                        {item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 font-bold text-lg">
                Total: ₹{totalPrice.toFixed(2)}
              </div>
            </div>

            {/* 🔹 Payment Method */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
              <label className="mr-4 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="ml-2">Cash on Delivery</span>
              </label>
              <label className="ml-6 cursor-pointer">
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

            {/* 🔹 Confirm Button */}
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
