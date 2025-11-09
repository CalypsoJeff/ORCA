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
import api from "../../api/middlewares/interceptor"; // <-- your central axios instance

const STATUS_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "Pending" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Out for Delivery", value: "Out for Delivery" },
  { label: "Shipped", value: "Shipped" },
  { label: "Delivered", value: "Delivered" },
  { label: "Cancelled", value: "Cancelled" },
];

const statusBadgeColor = (s) => {
  switch (s) {
    case "Pending":
      return "warning";
    case "Confirmed":
      return "info";
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
const formatINR = (n) => `₹${Number(n || 0).toFixed(2)}`;

// Mobile card for an order
function OrderCard({ order }) {
  return (
    <MDBCard className="mb-3 d-md-none">
      <MDBCardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fw-bold">#{order._id}</div>
            <div className="text-muted small">
              {new Date(order.createdAt || order.orderDate).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </div>
          </div>
          <MDBBadge color={statusBadgeColor(order.status)} className="ms-2">
            {order.status}
          </MDBBadge>
        </div>

        <div className="mt-2">
          <MDBCardText className="mb-1">
            <span className="text-muted">Items:</span>{" "}
            {(order.products || []).reduce((s, p) => s + (p.quantity || 0), 0)}
          </MDBCardText>
          <MDBCardText className="mb-1">
            <span className="text-muted">Total:</span>{" "}
            {formatINR(order.grandTotal)}
          </MDBCardText>
        </div>

        <div className="d-flex justify-content-end mt-2">
          <Link to={`/account/orders/${order._id}`}>
            <MDBBtn size="sm">View</MDBBtn>
          </Link>
        </div>
      </MDBCardBody>
    </MDBCard>
  );
}

export default function UserOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  // server-side pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // fetch from server whenever page/status changes
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
        // data: { items, page, limit, total, hasMore }
        if (!abort) {
          setOrders(data.items || []);
          setServerTotal(data.total || 0);
        }
      } catch (e) {
        if (!abort) {
          setOrders([]);
          setServerTotal(0);
          console.error(
            "Failed to load orders:",
            e?.response?.data || e.message
          );
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

  // client-side filter for quick search (by id/date)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return (orders || []).filter((o) => {
      const idMatch = String(o._id).toLowerCase().includes(q);
      const dateStr = new Date(o.createdAt || o.orderDate)
        .toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toLowerCase();
      const dateMatch = dateStr.includes(q);
      return idMatch || dateMatch;
    });
  }, [orders, query]);

  // when filters change that affect server fetch, reset page to 1
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

  // if user is searching, paginate the filtered current page (client-only)
  const pageSlice = useMemo(() => {
    if (query) {
      const start = (currentPage - 1) * pageSize;
      return filtered.slice(start, start + pageSize);
    }
    return filtered; // when not searching, filtered === current server page
  }, [filtered, currentPage]);

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

            {/* RIGHT: Orders */}
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
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
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
                  ) : pageSlice.length === 0 ? (
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
                                    <th style={{ width: 260 }}>Order ID</th>
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
                                    <tr key={o._id}>
                                      <td className="fw-semibold">#{o._id}</td>
                                      <td>
                                        {new Date(
                                          o.createdAt || o.orderDate
                                        ).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </td>
                                      <td>
                                        {(o.products || []).reduce(
                                          (s, p) => s + (p.quantity || 0),
                                          0
                                        )}
                                      </td>
                                      <td>{formatINR(o.grandTotal)}</td>
                                      <td>
                                        <MDBBadge
                                          color={statusBadgeColor(o.status)}
                                        >
                                          {o.status}
                                        </MDBBadge>
                                      </td>
                                      <td className="text-end">
                                        <Link to={`/account/orders/${o._id}`}>
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
                          <OrderCard key={o._id} order={o} />
                        ))}
                      </div>

                      {/* Pagination */}
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted small">
                          {query ? (
                            <>
                              Showing{" "}
                              <strong>
                                {(currentPage - 1) * pageSize + 1}
                              </strong>{" "}
                              -{" "}
                              <strong>
                                {Math.min(
                                  currentPage * pageSize,
                                  filtered.length
                                )}
                              </strong>{" "}
                              of <strong>{filtered.length}</strong>
                            </>
                          ) : (
                            <>
                              Page <strong>{currentPage}</strong> of{" "}
                              <strong>{totalPages}</strong> • Total orders:{" "}
                              <strong>{serverTotal}</strong>
                            </>
                          )}
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
