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

const statusBadgeColor = (s) => {
  switch (s) {
    case "PENDING":
      return "warning";
    case "PROCESSING":
      return "info";
    case "SHIPPED":
      return "primary";
    case "DELIVERED":
      return "success";
    case "CANCELLED":
      return "danger";
    default:
      return "secondary";
  }
};

// Simple mock: derive a fake order by id
const mockFetchOrderById = async (orderId) => {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  const base = 100000;
  const idx = Number(orderId) - base;

  const statusList = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  const status = statusList[Math.abs(idx) % statusList.length];

  const items = Array.from({ length: (Math.abs(idx) % 3) + 1 }).map((_, i) => ({
    sku: `SKU-${orderId}-${i + 1}`,
    name: [
      "Wireless Mouse",
      "Gaming Keyboard",
      "USB-C Cable",
      "Bluetooth Speaker",
    ][i % 4],
    qty: (i % 2) + 1,
    price: [799, 2499, 299, 1599][i % 4],
    image: "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(10).webp", // placeholder
  }));

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = subtotal > 999 ? 0 : 79;
  const tax = Math.round(subtotal * 0.12);
  const total = subtotal + shipping + tax;

  return {
    orderId,
    date: new Date(Date.now() - Math.abs(idx) * 86400000).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ),
    status,
    paymentMethod: ["COD", "Card", "UPI"][Math.abs(idx) % 3],
    items,
    totals: { subtotal, shipping, tax, total },
    shippingAddress: {
      name: "Gayathri PS",
      phone: "+91 98765 43210",
      street: "24, MG Road",
      city: "Kochi",
      state: "Kerala",
      postalCode: "682001",
      country: "India",
    },
    billingAddress: {
      name: "Gayathri PS",
      phone: "+91 98765 43210",
      street: "24, MG Road",
      city: "Kochi",
      state: "Kerala",
      postalCode: "682001",
      country: "India",
    },
    // crude timeline based on status
    timeline: [
      { label: "Placed", done: true },
      {
        label: "Processing",
        done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(status),
      },
      { label: "Shipped", done: ["SHIPPED", "DELIVERED"].includes(status) },
      { label: "Delivered", done: status === "DELIVERED" },
    ],
    trackingId:
      status === "SHIPPED" || status === "DELIVERED" ? `TRK-${orderId}` : null,
  };
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Replace with your real API:
        // const res = await api.get(`/orders/${orderId}`);
        // setOrder(res.data);
        const data = await mockFetchOrderById(orderId);
        if (mounted) setOrder(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [orderId]);

  const canCancel = useMemo(
    () =>
      order && (order.status === "PENDING" || order.status === "PROCESSING"),
    [order]
  );
  const canTrack = useMemo(
    () => order && (order.status === "SHIPPED" || order.status === "DELIVERED"),
    [order]
  );

  const handleCancel = async () => {
    // call your API to cancel
    // await api.patch(`/orders/${orderId}`, { status: 'CANCELLED' });
    alert("Order cancellation requested (mock).");
    navigate("/account/orders");
  };

  const handleDownloadInvoice = () => {
    // generate/download invoice (PDF) via your API
    alert("Invoice download (mock).");
  };

  if (loading) {
    return (
      <section style={{ backgroundColor: "#eee", marginTop: "100px" }}>
        <MDBContainer className="py-5 d-flex justify-content-center">
          <MDBSpinner role="status">
            <span className="visually-hidden">Loading...</span>
          </MDBSpinner>
        </MDBContainer>
      </section>
    );
  }

  if (!order) {
    return (
      <section style={{ backgroundColor: "#eee", marginTop: "100px" }}>
        <MDBContainer className="py-5">
          <MDBCard>
            <MDBCardBody className="text-center">
              <div className="fw-semibold mb-2">Order not found</div>
              <MDBCardText className="text-muted mb-3">
                The order you’re looking for doesn’t exist or was removed.
              </MDBCardText>
              <Link to="/account/orders">
                <MDBBtn>Back to Orders</MDBBtn>
              </Link>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </section>
    );
  }

  return (
    <section style={{ backgroundColor: "#eee", marginTop: "100px" }}>
      <MDBContainer className="py-4">
        {/* Header */}
        <MDBRow className="gy-3 align-items-center">
          <MDBCol xs="12" md="8">
            <h4 className="mb-1">
              Order <span className="fw-bold">#{order.orderId}</span>
            </h4>
            <div className="text-muted small">Placed on {order.date}</div>
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

        {/* Timeline */}
        <MDBRow className="mt-3">
          <MDBCol>
            <MDBCard>
              <MDBCardBody>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  {order.timeline.map((t, i) => (
                    <div key={t.label} className="d-flex align-items-center">
                      <div
                        className={`rounded-circle ${
                          t.done ? "bg-success" : "bg-secondary"
                        }`}
                        style={{ width: 10, height: 10 }}
                      />
                      <span className="ms-2 me-3 small">{t.label}</span>
                      {i < order.timeline.length - 1 && (
                        <div
                          className={`${
                            order.timeline[i + 1].done
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                          style={{ height: 2, width: 40 }}
                        />
                      )}
                    </div>
                  ))}
                  {canTrack && order.trackingId && (
                    <div className="ms-auto">
                      <MDBCardText className="mb-0 small">
                        Tracking ID: <strong>{order.trackingId}</strong>
                      </MDBCardText>
                      <Link to={`/account/orders/${order.orderId}/track`}>
                        <MDBBtn size="sm" className="mt-1">
                          Track Shipment
                        </MDBBtn>
                      </Link>
                    </div>
                  )}
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Two-column: Items + Summary/Addresses */}
        <MDBRow className="mt-3">
          {/* Items */}
          <MDBCol lg="8" className="mb-3">
            <MDBCard>
              <MDBCardBody>
                <h6 className="mb-3">Items</h6>

                {/* Desktop Table */}
                <div className="d-none d-md-block">
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
                        {order.items.map((it) => (
                          <tr key={it.sku}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={it.image}
                                  alt={it.name}
                                  width={44}
                                  height={44}
                                  className="rounded me-3"
                                />
                                <div>
                                  <div className="fw-semibold">{it.name}</div>
                                  <div className="text-muted small">
                                    SKU: {it.sku}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">{it.qty}</td>
                            <td className="text-end">₹{it.price.toFixed(2)}</td>
                            <td className="text-end">
                              ₹{(it.qty * it.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="d-md-none">
                  {order.items.map((it) => (
                    <MDBCard key={it.sku} className="mb-2">
                      <MDBCardBody className="p-2">
                        <div className="d-flex">
                          <img
                            src={it.image}
                            alt={it.name}
                            width={56}
                            height={56}
                            className="rounded me-3"
                          />
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{it.name}</div>
                            <div className="text-muted small mb-1">
                              SKU: {it.sku}
                            </div>
                            <div className="d-flex justify-content-between small">
                              <span>Qty: {it.qty}</span>
                              <span>Price: ₹{it.price.toFixed(2)}</span>
                              <span>
                                Total: ₹{(it.qty * it.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </MDBCardBody>
                    </MDBCard>
                  ))}
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          {/* Summary + Addresses */}
          <MDBCol lg="4" className="mb-3">
            <MDBCard className="mb-3">
              <MDBCardBody>
                <h6 className="mb-3">Order Summary</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{order.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Shipping</span>
                  <span>
                    {order.totals.shipping === 0
                      ? "Free"
                      : `₹${order.totals.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tax</span>
                  <span>₹{order.totals.tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <strong>Total</strong>
                  <strong>₹{order.totals.total.toFixed(2)}</strong>
                </div>
                <div className="text-muted small">
                  Payment: {order.paymentMethod}
                </div>
              </MDBCardBody>
            </MDBCard>

            <MDBCard className="mb-3">
              <MDBCardBody>
                <h6 className="mb-2">Shipping Address</h6>
                <MDBCardText className="mb-0">
                  {order.shippingAddress.name}
                  <br />
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.country}
                  <br />
                  <span className="text-muted">Phone:</span>{" "}
                  {order.shippingAddress.phone}
                </MDBCardText>
              </MDBCardBody>
            </MDBCard>

            <MDBCard>
              <MDBCardBody>
                <h6 className="mb-2">Billing Address</h6>
                <MDBCardText className="mb-0">
                  {order.billingAddress.name}
                  <br />
                  {order.billingAddress.street}
                  <br />
                  {order.billingAddress.city}, {order.billingAddress.state} -{" "}
                  {order.billingAddress.postalCode}
                  <br />
                  {order.billingAddress.country}
                  <br />
                  <span className="text-muted">Phone:</span>{" "}
                  {order.billingAddress.phone}
                </MDBCardText>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Back link */}
        <MDBRow className="mt-2">
          <MDBCol className="d-flex justify-content-between">
            <Link to="/account/orders">
              <MDBBtn color="light">Back to Orders</MDBBtn>
            </Link>
            <Link to="/help">
              <MDBBtn outline>Need help?</MDBBtn>
            </Link>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
}
