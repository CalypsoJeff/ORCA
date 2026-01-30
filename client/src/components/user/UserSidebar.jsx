/* eslint-disable react/prop-types */
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { MDBCard, MDBCardBody, MDBCardText, MDBBtn } from "mdb-react-ui-kit";

export default function UserSidebar({ collapsed = false, onToggle }) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const toggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    onToggle?.(next);
  };

  const Dot = ({ className = "" }) => (
    <span
      className={`me-2 d-inline-block rounded-circle ${className}`}
      style={{ width: 8, height: 8, background: "#6c757d" }}
    />
  );

  const linkBase =
    "d-flex align-items-center px-3 py-2 rounded text-decoration-none";
  const linkActive = "bg-primary text-white";
  const linkInactive = "text-dark hover-bg-light";

  const navItem = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? linkActive : linkInactive}`
      }
    >
      <Dot className="bg-secondary" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <MDBCard className="mb-4">
      <MDBCardBody className="p-0">
        {/* Header + Mobile Toggle */}
        <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
          <strong className="mb-0">My Account</strong>
          <MDBBtn
            size="sm"
            outline
            color="secondary"
            onClick={toggle}
            className="d-lg-none"
          >
            {isCollapsed ? "Open" : "Close"}
          </MDBBtn>
        </div>

        {/* Collapsible Body on small screens */}
        <div className={`px-2 py-2 ${isCollapsed ? "d-none d-lg-block" : ""}`}>
          <MDBCardText className="text-uppercase text-muted small px-2 mt-2 mb-1">
            Overview
          </MDBCardText>
          <div className="d-grid gap-1 mb-2">
            {navItem("/account/profile", "Profile")}
            {/* {navItem("/account/dashboard", "Dashboard")} */}
          </div>

          <MDBCardText className="text-uppercase text-muted small px-2 mt-3 mb-1">
            Shopping
          </MDBCardText>
          <div className="d-grid gap-1 mb-2">
            {navItem("/account/orders", "Orders")}
            {/* {navItem("/account/wishlist", "Wishlist")} */}
          </div>

          <MDBCardText className="text-uppercase text-muted small px-2 mt-3 mb-1">
            Bookings
          </MDBCardText>
          <div className="d-grid gap-1 mb-2">
            {navItem("/account/bookings", "My Bookings")}
          </div>

          <MDBCardText className="text-uppercase text-muted small px-2 mt-3 mb-1">
            Account
          </MDBCardText>
          <div className="d-grid gap-1 mb-2">
            {navItem("/account/addresses", "Addresses")}
            {navItem("/account/change-password", "Change Password")}
            {navItem("/account/forgot-password", "Forgot Password")}
          </div>

          {/* <MDBCardText className="text-uppercase text-muted small px-2 mt-3 mb-1">
            Support
          </MDBCardText>
          <div className="d-grid gap-1 mb-3">
            {navItem("/account/tickets", "Support Tickets")}
            {navItem("/help", "Help Center")}
          </div> */}

          <div className="border-top pt-2 pb-3 px-2">
            {navItem("/logout", "Logout")}
          </div>
        </div>
      </MDBCardBody>
    </MDBCard>
  );
}
