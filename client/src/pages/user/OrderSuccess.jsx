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
        // Optional: if you haven't created this API yet, comment this out
        const { data } = await api.get(`/api/orders/${orderId}`);
        setOrder(data);
      } catch (e) {
        // Fallback: show minimal info even if API isn't ready
        setError(e?.response?.data?.error || "Could not load order.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const goHome = () => navigate("/");
  const goOrders = () => navigate("/orders");

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
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Payment Status</span>
                  <span className="font-medium">
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
                    <span className="font-mono">
                      {order.payment.razorpayPaymentId}
                    </span>
                  </div>
                )}
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Items</h3>
                  <ul className="space-y-2">
                    {(order.products || []).map((it, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {it.product?.name || it.product} × {it.quantity}
                          {it.size ? ` • ${it.size}` : ""}
                          {it.color ? ` • ${it.color}` : ""}
                        </span>
                        <span>₹{(it.price * it.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {order.address && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-1">Ship To</h3>
                    <p className="text-sm text-gray-700">
                      {order.address.street}, {order.address.city},{" "}
                      {order.address.state}, {order.address.country} -{" "}
                      {order.address.postalCode}
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>

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
