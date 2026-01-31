// src/pages/admin/OrderDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  CalendarClock,
  RefreshCcw,
  BadgeCheck,
  XCircle,
} from "lucide-react";
import CONFIG_KEYS from "../../config";

const API_URL = CONFIG_KEYS.API_BASE_URL;

const STATUS_OPTIONS = [
  { value: "PendingPayment", label: "Pending Payment" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Shipped", label: "Shipped" },
  { value: "Out for Delivery", label: "Out for Delivery" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Return Requested", label: "Return Requested" },
  { value: "Return Accepted", label: "Return Accepted" },
  { value: "Return Rejected", label: "Return Rejected" },
];

const statusPillClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("delivered"))
    return "bg-green-50 text-green-700 border-green-200";
  if (s.includes("cancel"))
    return "bg-red-50 text-red-700 border-red-200";
  if (s.includes("return"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("confirm") || s.includes("shipped") || s.includes("out"))
    return "bg-sky-50 text-sky-700 border-sky-200";
  if (s.includes("pending"))
    return "bg-gray-50 text-gray-700 border-gray-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const paymentPillClass = (paymentStatus) => {
  const s = String(paymentStatus || "").toUpperCase();
  if (s === "PAID") return "bg-green-50 text-green-700 border-green-200";
  if (s === "REFUNDED") return "bg-sky-50 text-sky-700 border-sky-200";
  if (s === "FAILED") return "bg-red-50 text-red-700 border-red-200";
  if (s === "PENDING" || s === "CREATED")
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const shortId = useMemo(() => {
    if (!order?._id) return "";
    return String(order._id).slice(-6);
  }, [order?._id]);

  const orderDateText = useMemo(() => {
    const dt = order?.createdAt || order?.orderDate;
    if (!dt) return "—";
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN");
  }, [order?.createdAt, order?.orderDate]);

  const addressText = useMemo(() => {
    const a = order?.address;
    if (!a || typeof a !== "object") return "N/A";
    const parts = [
      a.name ? `${a.name}` : null,
      a.phone ? `+${a.phone}` : null,
      a.addressLine1 || null,
      a.addressLine2 || null,
      a.city || null,
      a.state || null,
      a.pincode ? `- ${a.pincode}` : null,
    ].filter(Boolean);
    if (!parts.length) return "N/A";
    // show name+phone in first line, address in second line
    const firstLine = [a.name, a.phone ? `+${a.phone}` : null]
      .filter(Boolean)
      .join(" • ");
    const secondLine = [a.addressLine1, a.addressLine2, a.city, a.state]
      .filter(Boolean)
      .join(", ");
    const thirdLine = a.pincode ? `PIN: ${a.pincode}` : null;
    return [firstLine || null, secondLine || null, thirdLine || null]
      .filter(Boolean)
      .join("\n");
  }, [order?.address]);

  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/api/orders/admin/${id}`);
      setOrder(res.data);
      setStatus(res.data?.status || "PendingPayment");
    } catch (err) {
      console.error("Error loading order:", err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to load order details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async () => {
    try {
      setUpdating(true);
      await axios.patch(`${API_URL}/api/orders/admin/${id}/status`, { status });
      await fetchOrder();
      // nicer than alert
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error updating status:", err);
      setError(
        err?.response?.data?.error || err?.message || "Failed to update status"
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-md text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-2 border-gray-200 border-t-gray-700 animate-spin" />
          <p className="mt-4 text-gray-600">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full max-w-md">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Couldn’t load order
            </h2>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            {error || "Order not found."}
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Go Back
            </button>
            <button
              onClick={fetchOrder}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition inline-flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.products) ? order.products : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
          </button>

          <div className="min-w-0 text-right">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Order #{shortId}
            </h2>
            <div className="mt-1 flex flex-wrap justify-end items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusPillClass(
                  order.status
                )}`}
              >
                {order.status}
              </span>
              <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                <CalendarClock className="w-4 h-4" />
                {orderDateText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Customer Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Name</div>
                  <div className="font-semibold text-gray-900">
                    {order.user?.name || "—"}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-1">Email</div>
                  <div className="font-semibold text-gray-900 break-all">
                    {order.user?.email || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Shipping Address
                </h3>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-line">
                {addressText}
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Items ({items.length})
                </h3>
              </div>

              {items.length === 0 ? (
                <div className="text-sm text-gray-600">No items found.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item, idx) => {
                    const p = item.product && typeof item.product === "object"
                      ? item.product
                      : null;

                    const img = p?.images?.[0] || "/placeholder.jpg";
                    const name = p?.name || (typeof item.product === "string" ? `Product: ${item.product}` : "Unknown Product");

                    return (
                      <div
                        key={item._id || idx}
                        className="py-4 flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                            <img
                              src={img}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.jpg";
                              }}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">
                              {name}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-2">
                              <span className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50">
                                Size: {item.size || "—"}
                              </span>
                              <span className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50">
                                Color: {item.color || "—"}
                              </span>
                              <span className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50">
                                Unit: {money(item.price)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-gray-500">Qty</div>
                          <div className="font-semibold text-gray-900">
                            {item.quantity}
                          </div>

                          <div className="mt-2 text-xs text-gray-500">
                            Line Total
                          </div>
                          <div className="font-bold text-gray-900">
                            {money(item.total)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{money(order.subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-semibold">{money(order.taxTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-semibold">
                    {money(order.discountTotal)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-semibold text-gray-900">
                  <span>Grand Total</span>
                  <span>{money(order.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Status update */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Status
              </h3>

              <div className="flex flex-col gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleStatusChange}
                  disabled={updating}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      Update Status
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Current status:{" "}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full border ${statusPillClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Information
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Gateway</span>
                  <span className="font-semibold text-gray-900">
                    {order.payment?.gateway || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${paymentPillClass(
                      order.payment?.status
                    )}`}
                  >
                    {order.payment?.status || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment ID</span>
                  <span className="font-semibold text-gray-900 break-all text-right ml-4">
                    {order.payment?.razorpayPaymentId || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Captured</span>
                  <span className="font-semibold text-gray-900">
                    {order.payment?.captured ? "Yes" : "No"}
                  </span>
                </div>

                {Array.isArray(order.payment?.refunds) &&
                  order.payment.refunds.length > 0 && (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">
                        Refunds
                      </div>
                      <div className="space-y-2">
                        {order.payment.refunds.map((r, i) => (
                          <div
                            key={r.razorpayRefundId || i}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Amount</span>
                              <span className="font-semibold text-gray-900">
                                {money(r.amount)}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-600 break-all">
                              Refund ID: {r.razorpayRefundId || "—"}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Reason: {r.reason || "—"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Safety note */}
            {String(order.status || "").toLowerCase().includes("cancel") && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 flex items-start gap-2">
                <XCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold">Order is cancelled</div>
                  <div className="text-xs mt-1 text-red-700/80">
                    Ensure stock is restored and refund is processed.
                  </div>
                </div>
              </div>
            )}

            {String(order.status || "").toLowerCase().includes("delivered") && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700 flex items-start gap-2">
                <BadgeCheck className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold">Delivered</div>
                  <div className="text-xs mt-1 text-green-700/80">
                    This order has been completed.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
