/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBSpinner,
} from "mdb-react-ui-kit";

import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import UserSidebar from "../../components/user/UserSidebar";
import api from "../../api/middlewares/interceptor";

const STATUS_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Out for Delivery", value: "Out for Delivery" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

const statusConfig = {
  Pending: { color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  Confirmed: { color: "bg-blue-100 text-blue-800", icon: "✓" },
  "Out for Delivery": { color: "bg-purple-100 text-purple-800", icon: "🚚" },
  Shipped: { color: "bg-indigo-100 text-indigo-800", icon: "📦" },
  Delivered: { color: "bg-green-100 text-green-800", icon: "✅" },
  Cancelled: { color: "bg-red-100 text-red-800", icon: "✕" },
};

const paymentStatusConfig = {
  PAID: { color: "bg-green-100 text-green-700", text: "Paid" },
  FAILED: { color: "bg-red-100 text-red-700", text: "Failed" },
  PENDING: { color: "bg-yellow-100 text-yellow-700", text: "Pending" },
};

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// Mobile Order Card
function OrderCard({ order }) {
  const statusInfo = statusConfig[order.status] || statusConfig.Pending;
  const paymentInfo =
    paymentStatusConfig[order.payment?.status] || paymentStatusConfig.PENDING;

  const totalItems = (order.products || []).reduce(
    (s, p) => s + (p.quantity || 0),
    0
  );

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-3 hover:border-blue-300 transition-all shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-500">ORDER ID</span>
          </div>
          <p className="font-mono text-sm font-semibold text-gray-900 truncate">
            #{order._id}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            📅 {formatDate(order.createdAt || order.orderDate)}
          </p>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusInfo.color}`}
          >
            {statusInfo.icon} {order.status}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${paymentInfo.color}`}
          >
            {paymentInfo.text}
          </span>
        </div>
      </div>

      {/* Product Preview */}
      {order.products && order.products.length > 0 && (
        <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg">
          <img
            src={order.products[0].product?.images?.[0] || "/placeholder.jpg"}
            alt={order.products[0].product?.name}
            className="w-16 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {order.products[0].product?.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
              <span>Qty: {order.products[0].quantity}</span>
              {order.products.length > 1 && (
                <>
                  <span>•</span>
                  <span>+{order.products.length - 1} more</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Items</p>
          <p className="font-semibold text-gray-900">{totalItems}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Payment Method</p>
          <p className="font-semibold text-gray-900 text-sm">
            {order.payment?.gateway === "razorpay" ? "Online" : "COD"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">Order Total</p>
          <p className="text-lg font-bold text-gray-900">
            {formatINR(order.grandTotal)}
          </p>
        </div>
        <Link
          to={`/account/orders/${order._id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors no-underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default function UserOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let abort = false;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: pageSize,
          ...(status !== "ALL" ? { status } : {}),
        };
        const { data } = await api.get("/api/orders", { params });

        if (!abort) {
          setOrders(data.items || []);
          setServerTotal(data.total || 0);
        }
      } catch (e) {
        if (!abort) {
          setOrders([]);
          setServerTotal(0);
          console.error("Failed to load orders:", e?.response?.data || e.message);
        }
      } finally {
        if (!abort) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      abort = true;
    };
  }, [page, status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;

    return (orders || []).filter((o) => {
      const idMatch = String(o._id).toLowerCase().includes(q);
      const dateStr = formatDate(o.createdAt || o.orderDate).toLowerCase();
      return idMatch || dateStr.includes(q);
    });
  }, [orders, query]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      status === "ALL" && !query
        ? serverTotal / pageSize
        : filtered.length / pageSize
    )
  );
  const currentPage = Math.min(page, totalPages);

  const pageSlice = useMemo(() => {
    if (query) {
      const start = (currentPage - 1) * pageSize;
      return filtered.slice(start, start + pageSize);
    }
    return filtered;
  }, [filtered, currentPage, query]);

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />

      {/* ✅ FIX: remove marginTop and use padding-top */}
      <section className="bg-gray-50 min-h-screen pt-28 md:pt-32 pb-10">
        <MDBContainer className="py-3 py-md-4">
          <MDBRow>
            {/* Sidebar */}
            <MDBCol lg="3" className="mb-4">
              <UserSidebar />
            </MDBCol>

            {/* Main Content */}
            <MDBCol lg="9">
              <MDBCard className="border-0 shadow-sm">
                <MDBCardBody className="p-4">
                  {/* Header */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h4 className="text-2xl font-bold text-blue-600 mb-2">
                      My Orders
                    </h4>
                    <p className="text-gray-600 text-sm mb-0">
                      Track, manage and view your purchases
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-1 block">
                        Search by Order ID or Date
                      </label>
                      <MDBInput
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setPage(1);
                        }}
                        className="bg-white"
                      />
                    </div>

                    <div className="w-full md:w-56">
                      <label className="text-xs text-gray-600 mb-1 block">
                        Order Status
                      </label>
                      <select
                        className="form-select w-full"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Content */}
                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <MDBSpinner role="status" color="primary">
                        <span className="visually-hidden">Loading...</span>
                      </MDBSpinner>
                    </div>
                  ) : pageSlice.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="mb-4">
                        <svg
                          className="w-20 h-20 mx-auto text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h5 className="text-gray-600 font-semibold mb-2">
                        No orders found
                      </h5>
                      <p className="text-gray-500 text-sm">
                        {query || status !== "ALL"
                          ? "Try adjusting your filters"
                          : "You haven't placed any orders yet"}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Order ID
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Items
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Total
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Payment
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                Status
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                                Action
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-200">
                            {pageSlice.map((o) => {
                              const statusInfo =
                                statusConfig[o.status] || statusConfig.Pending;
                              const paymentInfo =
                                paymentStatusConfig[o.payment?.status] ||
                                paymentStatusConfig.PENDING;

                              const totalItems = (o.products || []).reduce(
                                (s, p) => s + (p.quantity || 0),
                                0
                              );

                              return (
                                <tr
                                  key={o._id}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="px-4 py-3">
                                    <span className="font-mono text-sm font-semibold text-gray-900">
                                      #{o._id.slice(-8)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {formatDate(o.createdAt || o.orderDate)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      {o.products && o.products.length > 0 && (
                                        <img
                                          src={
                                            o.products[0].product?.images?.[0] ||
                                            "/placeholder.jpg"
                                          }
                                          alt=""
                                          className="w-10 h-10 object-cover rounded border border-gray-200"
                                        />
                                      )}
                                      <span className="text-sm font-medium text-gray-900">
                                        {totalItems}{" "}
                                        {totalItems === 1 ? "item" : "items"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-gray-900">
                                    {formatINR(o.grandTotal)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${paymentInfo.color}`}
                                    >
                                      {paymentInfo.text}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                                    >
                                      {statusInfo.icon} {o.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <Link
                                      to={`/account/orders/${o._id}`}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors no-underline inline-block"
                                    >
                                      View
                                    </Link>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden">
                        {pageSlice.map((o) => (
                          <OrderCard key={o._id} order={o} />
                        ))}
                      </div>

                      {/* Pagination */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          {query ? (
                            <span>
                              Showing{" "}
                              <strong>{(currentPage - 1) * pageSize + 1}</strong>{" "}
                              -{" "}
                              <strong>
                                {Math.min(currentPage * pageSize, filtered.length)}
                              </strong>{" "}
                              of <strong>{filtered.length}</strong>
                            </span>
                          ) : (
                            <span>
                              Page <strong>{currentPage}</strong> of{" "}
                              <strong>{totalPages}</strong> • Total:{" "}
                              <strong>{serverTotal}</strong>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>

                          <span className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold">
                            {currentPage} / {totalPages}
                          </span>

                          <button
                            onClick={() =>
                              setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={currentPage >= totalPages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </>
  );
}

export { OrderCard };
