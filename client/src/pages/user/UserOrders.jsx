/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardText,
  MDBInput,
  MDBBtn,
  MDBBadge,
  MDBSpinner,
} from "mdb-react-ui-kit";

import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import UserSidebar from "../../components/user/UserSidebar";
// import { api } from "../../api"; // <-- use your real API client

const STATUS_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

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

const formatINR = (n) => `₹${Number(n || 0).toFixed(2)}`;

// Mobile card for an order
function OrderCard({ order }) {
  return (
    <MDBCard className="mb-3 d-md-none">
      <MDBCardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fw-bold">#{order.orderId}</div>
            <div className="text-muted small">{order.date}</div>
          </div>
          <MDBBadge color={statusBadgeColor(order.status)} className="ms-2">
            {order.status}
          </MDBBadge>
        </div>

        <div className="mt-2">
          <MDBCardText className="mb-1">
            <span className="text-muted">Items:</span> {order.itemsCount}
          </MDBCardText>
          <MDBCardText className="mb-1">
            <span className="text-muted">Total:</span> {formatINR(order.total)}
          </MDBCardText>
        </div>

        <div className="d-flex justify-content-end mt-2">
          <Link to={`/account/orders/${order.orderId}`}>
            <MDBBtn size="sm">View</MDBBtn>
          </Link>
        </div>
      </MDBCardBody>
    </MDBCard>
  );
}

export default function UserOrders() {
  // UI state
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // TODO: swap mock with your API call
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(async () => {
      // Example real call:
      // const { data } = await api.get("/orders/me");
      // setOrders(data);

      // Mock data for now:
      const fake = Array.from({ length: 27 }).map((_, i) => ({
        orderId: 100000 + i,
        date: new Date(Date.now() - i * 86400000).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        itemsCount: Math.floor(Math.random() * 4) + 1,
        total: Math.floor(500 + Math.random() * 5000),
        status: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"][
          i % 5
        ],
      }));
      setOrders(fake);
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  // filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = status === "ALL" ? true : o.status === status;
      const matchesQuery =
        !q ||
        String(o.orderId).toLowerCase().includes(q) ||
        o.date.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, status]);

  // pagination calc
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />

      <section style={{ backgroundColor: "#eee", marginTop: "100px" }}>
        <MDBContainer className="py-10">
          <MDBRow>
            {/* LEFT: Sidebar */}
            <MDBCol lg="3" className="mb-4">
              <UserSidebar />
            </MDBCol>

            {/* RIGHT: Orders Content */}
            <MDBCol lg="9">
              {/* Header + Filters */}
              <MDBRow className="gy-3 align-items-end">
                <MDBCol xs="12" md="6">
                  <h4 className="mb-0">My Orders</h4>
                  <div className="text-muted small">
                    Track, manage and view your purchases
                  </div>
                </MDBCol>

                <MDBCol xs="12" md="3">
                  <MDBInput
                    label="Search by Order ID / Date"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </MDBCol>

                <MDBCol xs="12" md="3">
                  <div className="form-group">
                    <label className="form-label small text-muted mb-1">
                      Status
                    </label>
                    <select
                      className="form-select"
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
                </MDBCol>
              </MDBRow>

              {/* Content */}
              <MDBRow className="mt-3">
                <MDBCol xs="12">
                  {loading ? (
                    <div className="d-flex justify-content-center py-5">
                      <MDBSpinner role="status">
                        <span className="visually-hidden">Loading...</span>
                      </MDBSpinner>
                    </div>
                  ) : filtered.length === 0 ? (
                    <MDBCard className="mt-3">
                      <MDBCardBody className="text-center">
                        <div className="fw-semibold mb-1">No orders found</div>
                        <MDBCardText className="text-muted">
                          Try clearing filters or search with a different term.
                        </MDBCardText>
                      </MDBCardBody>
                    </MDBCard>
                  ) : (
                    <>
                      {/* Desktop/Tablet TABLE */}
                      <div className="d-none d-md-block">
                        <MDBCard className="mt-2">
                          <MDBCardBody className="p-0">
                            <div className="table-responsive">
                              <table className="table mb-0 align-middle">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: 160 }}>Order ID</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th
                                      className="text-end"
                                      style={{ width: 140 }}
                                    >
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pageSlice.map((o) => (
                                    <tr key={o.orderId}>
                                      <td className="fw-semibold">
                                        #{o.orderId}
                                      </td>
                                      <td>{o.date}</td>
                                      <td>{o.itemsCount}</td>
                                      <td>{formatINR(o.total)}</td>
                                      <td>
                                        <MDBBadge
                                          color={statusBadgeColor(o.status)}
                                        >
                                          {o.status}
                                        </MDBBadge>
                                      </td>
                                      <td className="text-end">
                                        <Link
                                          to={`/account/orders/${o.orderId}`}
                                        >
                                          <MDBBtn size="sm">View</MDBBtn>
                                        </Link>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </MDBCardBody>
                        </MDBCard>
                      </div>

                      {/* Mobile CARDS */}
                      <div className="d-md-none">
                        {pageSlice.map((o) => (
                          <OrderCard key={o.orderId} order={o} />
                        ))}
                      </div>

                      {/* Pagination */}
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted small">
                          Showing{" "}
                          <strong>{(currentPage - 1) * pageSize + 1}</strong> -{" "}
                          <strong>
                            {Math.min(currentPage * pageSize, filtered.length)}
                          </strong>{" "}
                          of <strong>{filtered.length}</strong>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <MDBBtn
                            size="sm"
                            color="light"
                            disabled={currentPage <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                          >
                            Prev
                          </MDBBtn>
                          <span className="small">
                            Page <strong>{currentPage}</strong> / {totalPages}
                          </span>
                          <MDBBtn
                            size="sm"
                            color="light"
                            disabled={currentPage >= totalPages}
                            onClick={() =>
                              setPage((p) => Math.min(totalPages, p + 1))
                            }
                          >
                            Next
                          </MDBBtn>
                        </div>
                      </div>
                    </>
                  )}
                </MDBCol>
              </MDBRow>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </>
  );
}

export { OrderCard };
