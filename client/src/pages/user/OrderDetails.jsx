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
  MDBBreadcrumb,
  MDBBreadcrumbItem,
} from "mdb-react-ui-kit";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../../components/user/NavBar";
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

const inr = (n) => `₹${Number(n || 0).toFixed(2)}`;

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");

  // 🔹 Fetch order by ID
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get(`/api/orders/${orderId}`);
        if (!cancel) setOrder(data);
      } catch (e) {
        if (!cancel)
          setErr(e?.response?.data?.error || "Failed to load order.");
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

  // 🔹 Cancel order
  const handleCancel = async () => {
    try {
      await api.patch(`/api/orders/${orderId}/cancel`);
      toast.success("Order cancelled successfully!");
      navigate("/account/orders");
    } catch (err) {
      toast.error(err.response?.data?.error || "Cancellation failed");
    }
  };

  // 🔹 Download invoice
  const handleDownloadInvoice = () => {
    toast.info("Invoice download not yet implemented.");
  };

  // 🔹 Loader
  if (loading) {
    return (
      <>
        <NavBar />
        <section style={{ backgroundColor: "#f9fafb", marginTop: "100px" }}>
          <MDBContainer className="py-5 d-flex justify-content-center">
            <MDBSpinner role="status">
              <span className="visually-hidden">Loading...</span>
            </MDBSpinner>
          </MDBContainer>
        </section>
      </>
    );
  }

  // 🔹 Error state
  if (err || !order) {
    return (
      <>
        <NavBar />
        <section style={{ backgroundColor: "#f9fafb", marginTop: "100px" }}>
          <MDBContainer className="py-5">
            <MDBCard>
              <MDBCardBody className="text-center">
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

  const placedOn = new Date(
    order.createdAt || order.orderDate
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const canCancel = ["Pending", "Confirmed"].includes(order.status);
  const canTrack = ["Shipped", "Delivered", "Out for Delivery"].includes(
    order.status
  );

  return (
    <>
      <NavBar />
      <ToastContainer position="top-right" autoClose={2500} />

      <section style={{ backgroundColor: "#f9fafb", marginTop: "100px" }}>
        <MDBContainer className="py-4">
          {/* Breadcrumbs */}
          <MDBBreadcrumb>
            <MDBBreadcrumbItem>
              <Link to="/">Home</Link>
            </MDBBreadcrumbItem>
            <MDBBreadcrumbItem>
              <Link to="/account">Account</Link>
            </MDBBreadcrumbItem>
            <MDBBreadcrumbItem>
              <Link to="/account/orders">Orders</Link>
            </MDBBreadcrumbItem>
            <MDBBreadcrumbItem active>Order Details</MDBBreadcrumbItem>
          </MDBBreadcrumb>

          {/* Header */}
          <MDBRow className="gy-3 align-items-center mt-3">
            <MDBCol xs="12" md="8">
              <h4 className="mb-1">
                Order <span className="fw-bold">#{order._id}</span>
              </h4>
              <div className="text-muted small">Placed on {placedOn}</div>
            </MDBCol>
            <MDBCol xs="12" md="4" className="text-md-end">
              <MDBBadge color={statusBadgeColor(order.status)} className="me-2">
                {order.status}
              </MDBBadge>
              <MDBBtn
                color="light"
                className="me-2"
                onClick={handleDownloadInvoice}
              >
                Download Invoice
              </MDBBtn>
              {canCancel && (
                <MDBBtn color="danger" onClick={handleCancel}>
                  Cancel
                </MDBBtn>
              )}
            </MDBCol>
          </MDBRow>

          {/* Items + Summary/Address combined wider layout */}
          <MDBRow className="mt-4">
            {/* Items Section */}
            <MDBCol lg="12">
              <MDBCard className="mb-4">
                <MDBCardBody>
                  <h6 className="mb-3">Items ({itemsCount})</h6>

                  <div className="table-responsive">
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
                                  src={
                                    it.product?.images?.[0] ||
                                    "/placeholder-product.jpg"
                                  }
                                  alt={it.product?.name || "Product"}
                                  width={90}
                                  height={90}
                                  className="rounded me-3 border"
                                />
                                <div>
                                  <div className="fw-semibold fs-6">
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
                            <td className="text-center fs-6">{it.quantity}</td>
                            <td className="text-end fs-6">{inr(it.price)}</td>
                            <td className="text-end fs-6">
                              {inr(it.price * it.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            {/* Summary & Address below full width */}
            <MDBCol lg="12" className="d-flex flex-wrap gap-3">
              {/* Order Summary */}
              <MDBCard className="flex-fill" style={{ minWidth: "300px" }}>
                <MDBCardBody>
                  <h6 className="mb-3">Order Summary</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal</span>
                    <span>{inr(order.subTotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tax</span>
                    <span>{inr(order.taxTotal)}</span>
                  </div>
                  {Number(order.discountTotal) > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Discount</span>
                      <span>-{inr(order.discountTotal)}</span>
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <strong>Total</strong>
                    <strong>
                      {inr(order.grandTotal)} {order.currency || "INR"}
                    </strong>
                  </div>
                  <div className="text-muted small">
                    Payment:{" "}
                    {order.paymentMethod ||
                      order.payment?.method ||
                      order.payment?.gateway ||
                      "—"}
                  </div>
                </MDBCardBody>
              </MDBCard>

              {/* Address */}
              <MDBCard className="flex-fill" style={{ minWidth: "300px" }}>
                <MDBCardBody>
                  <h6 className="mb-2">Shipping Address</h6>
                  <MDBCardText className="mb-0 text-muted">
                    {order.address?.name && (
                      <>
                        <strong>{order.address.name}</strong>
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
                    {order.address?.city}, {order.address?.state} -{" "}
                    {order.address?.pincode}
                    <br />
                    {order.address?.phone && (
                      <>
                        <span className="text-muted">Phone:</span>{" "}
                        {order.address.phone}
                      </>
                    )}
                  </MDBCardText>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>

          {/* Footer actions */}
          <MDBRow className="mt-3">
            <MDBCol className="d-flex justify-content-between">
              <Link to="/account/orders">
                <MDBBtn color="light">Back to Orders</MDBBtn>
              </Link>
              {canTrack && (
                <Link to={`/account/orders/${order._id}/track`}>
                  <MDBBtn outline>Track Shipment</MDBBtn>
                </Link>
              )}
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </>
  );
}
