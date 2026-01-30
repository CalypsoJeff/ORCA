import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
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
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await loadCart();
      if (res.data?.items) setCartItems(res.data.items);
      else setCartItems([]);
    } catch (err) {
      console.error("Error loading cart", err);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await authInstanceAxios.get("/api/user/addresses");
      const list = Array.isArray(res.data) ? res.data : [];
      setAddresses(list);
    } catch (error) {
      console.error("Error loading addresses", error);
      toast.error("Failed to load addresses");
    }
  };

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  const sortedAddresses = useMemo(() => {
    const list = Array.isArray(addresses) ? [...addresses] : [];
    list.sort((a, b) => (b?.isDefault ? 1 : 0) - (a?.isDefault ? 1 : 0));
    return list;
  }, [addresses]);

  const visibleAddresses = useMemo(() => {
    if (showAllAddresses) return sortedAddresses;
    if (!sortedAddresses.length) return [];
    return [sortedAddresses[selectedAddressIndex] || sortedAddresses[0]];
  }, [sortedAddresses, showAllAddresses, selectedAddressIndex]);

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
        handler: async function (response) {
          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const { data } = await authInstanceAxios.post(
              "/api/payments/razorpay/verify",
              verifyPayload
            );

            if (data?.status === "success") {
              navigate(`/order/success/${data.orderId}`);
            } else {
              toast.error("Payment verification failed. Please contact support.");
              navigate(`/payment-failed`);
            }
          } catch (err) {
            console.error("Payment verify error:", err);
            toast.error("Verification failed. Please contact support.");
            navigate(`/payment-failed`);
          }
        },
        modal: { ondismiss: () => toast.info("Payment cancelled.") },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: { orderId: String(payload.orderId) },
        theme: { color: "#0ea5e9" },
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
    const selectedAddress = sortedAddresses[selectedAddressIndex];
    const addressId = selectedAddress?._id;

    if (!selectedAddress || !addressId) {
      toast.warn("Please select a valid shipping address.");
      return;
    }

    payWithRazorpay(addressId);
  };

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />
      <ToastContainer position="top-right" autoClose={2000} />

      {/* ✅ IMPORTANT: push content below NavBar + PageBreadcrumbs */}
      <div className="container mx-auto px-4 pb-16 pt-36 sm:pt-40">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {loading ? (
          <p>Loading checkout details...</p>
        ) : (
          <>
            {/* Address Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-xl font-semibold">Shipping Address</h2>

                <Button
                  className="bg-sky-600"
                  size="sm"
                  onClick={() => navigate("/account/addresses")}
                >
                  + Add New Address
                </Button>
              </div>

              {sortedAddresses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    {visibleAddresses.map((addr) => {
                      const realIndex = sortedAddresses.findIndex(
                        (a) => a?._id === addr?._id
                      );
                      const isSelected = realIndex === selectedAddressIndex;

                      return (
                        <div
                          key={addr._id}
                          className={`border rounded-md p-4 cursor-pointer transition-all ${
                            isSelected
                              ? "border-sky-600 bg-sky-50"
                              : "border-gray-300 hover:border-sky-400"
                          }`}
                          onClick={() => {
                            if (showAllAddresses) {
                              setSelectedAddressIndex(
                                realIndex === -1 ? 0 : realIndex
                              );
                              setShowAllAddresses(false);
                            }
                          }}
                        >
                          <p className="font-medium text-gray-800 flex items-center gap-2">
                            {addr.name}
                            {addr.isDefault && (
                              <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {addr.addressLine1}, {addr.city}, {addr.state} -{" "}
                            {addr.pincode}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {addr.phone}
                          </p>

                          {showAllAddresses && (
                            <p className="text-xs text-sky-700 mt-2">
                              Tap to select this address
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {sortedAddresses.length > 1 && (
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowAllAddresses(true)}
                        className="text-sky-600 font-medium hover:underline"
                        disabled={showAllAddresses}
                      >
                        {showAllAddresses
                          ? "Select an address above"
                          : `Show ${sortedAddresses.length - 1} more address(es)`}
                      </button>

                      {!showAllAddresses && (
                        <button
                          type="button"
                          onClick={() => setShowAllAddresses(true)}
                          className="text-sm text-gray-500 hover:underline"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  )}
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

            {/* Order Summary */}
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

            {/* Confirm Button */}
            <div className="text-center">
              <Button
                className="bg-sky-600"
                onClick={handleConfirmOrder}
                disabled={paying}
              >
                {paying ? "Processing…" : "Pay with Razorpay"}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CheckoutPage;
