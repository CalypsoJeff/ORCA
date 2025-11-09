import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "flowbite-react";
import NavBar from "../../components/user/NavBar";
import api from "../../api/middlewares/interceptor";

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${orderId}`);
        setOrder(data);
      } catch (e) {
        setError(e?.response?.data?.error || "Could not load order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const goHome = () => navigate("/home");
  const goOrders = () => navigate("/account/orders");

  return (
    <>
      <NavBar />
      <div className="container mx-auto mt-28 px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-green-600">
              <path
                fill="currentColor"
                d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
          <p className="text-gray-600 mb-6">
            Thank you! Your order has been placed successfully.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono">{orderId}</span>
            </div>

            {loading ? (
              <div className="mt-2 text-gray-500">Loading order details…</div>
            ) : error ? (
              <div className="mt-2 text-red-600">{error}</div>
            ) : order ? (
              <>
                {/* ✅ Payment details */}
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Payment Status</span>
                  <span className="font-medium text-green-700">
                    {order.payment?.status || "PAID"}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">
                    ₹{Number(order.grandTotal || 0).toFixed(2)}{" "}
                    {order.currency || "INR"}
                  </span>
                </div>
                {order.payment?.razorpayPaymentId && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="font-mono text-xs">
                      {order.payment.razorpayPaymentId}
                    </span>
                  </div>
                )}

                {/* ✅ Purchased items */}
                <div className="mt-5">
                  <h3 className="font-semibold mb-3">Purchased Items</h3>
                  <ul className="divide-y divide-gray-200">
                    {(order.products || []).map((it, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-3 text-sm">
                          <img
                            src={
                              it.product?.images?.[0] ||
                              "/placeholder-product.jpg"
                            }
                            alt={it.product?.name}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                          <div>
                            <p className="font-medium text-gray-800">
                              {it.product?.name || "Product"}
                            </p>
                            <p className="text-gray-600 text-xs">
                              Qty: {it.quantity}
                              {it.size && ` • ${it.size}`}
                              {it.color && (
                                <>
                                  {" "}
                                  •{" "}
                                  <span
                                    className="inline-block w-3 h-3 rounded-full border"
                                    style={{ backgroundColor: it.color }}
                                  ></span>{" "}
                                  {it.color}
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          ₹{(it.price * it.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ✅ Shipping Address */}
                {order.address && (
                  <div className="mt-5">
                    <h3 className="font-semibold mb-1">Shipping Address</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {order.address.name}
                      <br />
                      {order.address.addressLine1}
                      {order.address.addressLine2 && (
                        <>
                          , <br />
                          {order.address.addressLine2}
                        </>
                      )}
                      <br />
                      {order.address.city}, {order.address.state} -{" "}
                      {order.address.pincode}
                      <br />
                      <span className="text-gray-600">
                        Phone: {order.address.phone}
                      </span>
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* ✅ Navigation buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={goHome} className="bg-sky-600">
              Go to Home
            </Button>
            <Button onClick={goOrders} color="light">
              View My Orders
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
