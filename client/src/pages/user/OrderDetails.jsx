/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardText,
  MDBBtn,
  MDBBadge,
  MDBSpinner,
} from "mdb-react-ui-kit";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NavBar from "../../components/user/NavBar";
import PageNavBar from "../../components/user/PageBreadcrumbs";
import api from "../../api/middlewares/interceptor";

const statusBadgeColor = (s) => {
  switch (s) {
    case "Pending":
      return "warning";
    case "Confirmed":
    case "Out for Delivery":
      return "info";
    case "Shipped":
      return "primary";
    case "Delivered":
      return "success";
    case "Cancelled":
      return "danger";
    default:
      return "secondary";
  }
};

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get(`/api/orders/${orderId}`);
        if (!cancel) setOrder(data);
      } catch (e) {
        if (!cancel) setErr(e?.response?.data?.error || "Failed to load order.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [orderId]);

  const items = useMemo(() => order?.products || [], [order]);
  const itemsCount = useMemo(
    () => items.reduce((s, p) => s + (p.quantity || 0), 0),
    [items]
  );

  const placedOn = useMemo(() => {
    if (!order) return "";
    return formatDate(order.createdAt || order.orderDate);
  }, [order]);

  const canCancel = useMemo(
    () => (order ? ["Pending", "Confirmed"].includes(order.status) : false),
    [order]
  );

  const canTrack = useMemo(
    () =>
      order
        ? ["Shipped", "Delivered", "Out for Delivery"].includes(order.status)
        : false,
    [order]
  );

  const handleCancel = async () => {
    try {
      await api.patch(`/api/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully!");
      navigate("/account/orders");
    } catch (err) {
      toast.error(err.response?.data?.error || "Cancellation failed");
    }
  };

  const handleDownloadInvoice = () => {
    toast.info("Invoice download not yet implemented.");
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <PageNavBar />
        <section className="bg-gray-50 min-h-screen pt-36 sm:pt-40">
          <MDBContainer className="py-5 d-flex justify-content-center">
            <MDBSpinner role="status">
              <span className="visually-hidden">Loading...</span>
            </MDBSpinner>
          </MDBContainer>
        </section>
      </>
    );
  }

  if (err || !order) {
    return (
      <>
        <NavBar />
        <PageNavBar />
        <section className="bg-gray-50 min-h-screen pt-36 sm:pt-40">
          <MDBContainer className="py-4">
            <MDBCard className="border-0 shadow-sm">
              <MDBCardBody className="text-center p-4">
                <div className="fw-semibold mb-2">Order not found</div>
                <MDBCardText className="text-muted mb-3">
                  {err || "The order could not be loaded."}
                </MDBCardText>
                <Link to="/account/orders">
                  <MDBBtn>Back to Orders</MDBBtn>
                </Link>
              </MDBCardBody>
            </MDBCard>
          </MDBContainer>
        </section>
      </>
    );
  }

  const paymentLabel =
    order.paymentMethod || order.payment?.method || order.payment?.gateway || "—";
  const paymentStatus = order.payment?.status || "PENDING";

  const paymentPill =
    paymentStatus === "PAID"
      ? "bg-green-100 text-green-700"
      : paymentStatus === "FAILED"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-800";

  return (
    <>
      <NavBar />
      <PageNavBar />
      <ToastContainer position="top-right" autoClose={2500} />

      <section className="bg-gray-50 min-h-screen pt-36 sm:pt-40 pb-10">
        <MDBContainer>
          {/* ================= TOP SUMMARY STRIP ================= */}
          <MDBCard className="border-0 shadow-sm">
            <MDBCardBody className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-gray-500 text-sm">Order</div>
                  <h4 className="mb-1 text-xl sm:text-2xl font-bold text-gray-900 break-all">
                    #{order._id}
                  </h4>
                  <div className="text-gray-500 text-sm">
                    Placed on <span className="font-medium">{placedOn}</span> •{" "}
                    <span className="font-medium">{itemsCount}</span>{" "}
                    {itemsCount === 1 ? "item" : "items"}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <MDBBadge color={statusBadgeColor(order.status)} className="me-0">
                      {order.status}
                    </MDBBadge>

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentPill}`}
                    >
                      {paymentStatus}
                    </span>

                    <span className="text-xs text-gray-600">
                      Payment:{" "}
                      <span className="font-semibold text-gray-800">{paymentLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Desktop quick actions */}
                
              </div>
            </MDBCardBody>
          </MDBCard>

          <MDBRow className="g-4">
            {/* LEFT: ITEMS */}
            <MDBCol lg="8">
              <MDBCard className="border-0 shadow-sm">
                <MDBCardBody className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="mb-0 font-semibold">
                      Items <span className="text-gray-500">({itemsCount})</span>
                    </h6>
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th style={{ width: 100 }} className="text-center">
                            Qty
                          </th>
                          <th style={{ width: 140 }} className="text-end">
                            Price
                          </th>
                          <th style={{ width: 140 }} className="text-end">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, i) => (
                          <tr key={i}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={it.product?.images?.[0] || "/placeholder-product.jpg"}
                                  alt={it.product?.name || "Product"}
                                  width={72}
                                  height={72}
                                  className="rounded me-3 border"
                                  style={{ objectFit: "cover" }}
                                />
                                <div className="min-w-0">
                                  <div className="fw-semibold">
                                    {it.product?.name || "Product"}
                                  </div>
                                  <div className="text-muted small">
                                    {it.size ? `Size: ${it.size}` : ""}
                                    {it.size && it.color ? " • " : ""}
                                    {it.color ? `Color: ${it.color}` : ""}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">{it.quantity}</td>
                            <td className="text-end">{inr(it.price)}</td>
                            <td className="text-end">{inr(it.price * it.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3">
                    {items.map((it, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-xl p-3 bg-white"
                      >
                        <div className="flex gap-3">
                          <img
                            src={it.product?.images?.[0] || "/placeholder-product.jpg"}
                            alt={it.product?.name || "Product"}
                            className="w-20 h-20 rounded-lg border object-cover flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 truncate">
                              {it.product?.name || "Product"}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {it.size ? `Size: ${it.size}` : ""}
                              {it.size && it.color ? " • " : ""}
                              {it.color ? `Color: ${it.color}` : ""}
                            </div>

                            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="text-gray-500">Qty</div>
                                <div className="font-semibold text-gray-900">
                                  {it.quantity}
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="text-gray-500">Price</div>
                                <div className="font-semibold text-gray-900">
                                  {inr(it.price)}
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="text-gray-500">Total</div>
                                <div className="font-semibold text-gray-900">
                                  {inr(it.price * it.quantity)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            {/* RIGHT: ONE STACKED CARD (Summary + Address + Actions) */}
            <MDBCol lg="4">
              <div className="lg:sticky lg:top-40">
                <MDBCard className="border-0 shadow-sm">
                  <MDBCardBody className="p-4">
                    {/* Summary */}
                    <div className="mb-4">
                      <h6 className="mb-3 font-semibold">Order Summary</h6>

                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">
                          {inr(order.subTotal)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium text-gray-900">
                          {inr(order.taxTotal)}
                        </span>
                      </div>

                      {Number(order.discountTotal) > 0 && (
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-medium text-gray-900">
                            -{inr(order.discountTotal)}
                          </span>
                        </div>
                      )}

                      <hr className="my-3" />

                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-sm text-gray-600">Total</div>
                          <div className="text-xs text-gray-500">
                            {order.currency || "INR"}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {inr(order.grandTotal)}
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-600">
                        Payment method:{" "}
                        <span className="font-semibold text-gray-900">
                          {paymentLabel}
                        </span>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="pt-4 border-t border-gray-200">
                      <h6 className="mb-2 font-semibold">Shipping Address</h6>
                      <MDBCardText className="mb-0 text-muted">
                        {order.address?.name && (
                          <>
                            <strong className="text-gray-900">
                              {order.address.name}
                            </strong>
                            <br />
                          </>
                        )}
                        {order.address?.addressLine1 && (
                          <>
                            {order.address.addressLine1}
                            <br />
                          </>
                        )}
                        {order.address?.addressLine2 && (
                          <>
                            {order.address.addressLine2}
                            <br />
                          </>
                        )}
                        <span className="text-gray-700">
                          {order.address?.city}, {order.address?.state} -{" "}
                          {order.address?.pincode}
                        </span>
                        <br />
                        {order.address?.phone && (
                          <>
                            <span className="text-muted">Phone:</span>{" "}
                            <span className="text-gray-700">
                              {order.address.phone}
                            </span>
                          </>
                        )}
                      </MDBCardText>
                    </div>

                    {/* Actions (always here so address never feels alone) */}
                    <div className="pt-4 border-t border-gray-200 mt-4 flex flex-col gap-2">
                      <MDBBtn color="light" onClick={handleDownloadInvoice}>
                        Download Invoice
                      </MDBBtn>

                      {canTrack && (
                        <Link to={`/account/orders/${order._id}/track`}>
                          <MDBBtn outline className="w-100">
                            Track Shipment
                          </MDBBtn>
                        </Link>
                      )}

                      {canCancel && (
                        <MDBBtn color="danger" onClick={handleCancel}>
                          Cancel Order
                        </MDBBtn>
                      )}

                      <Link to="/account/orders">
                        <MDBBtn color="light" className="w-100">
                          Back to Orders
                        </MDBBtn>
                      </Link>
                    </div>
                  </MDBCardBody>
                </MDBCard>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </>
  );
}
