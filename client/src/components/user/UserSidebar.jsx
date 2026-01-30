/* ========================= UserSidebar.jsx ========================= */
/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MDBCard, MDBCardBody, MDBCardText } from "mdb-react-ui-kit";
import { cn } from "@/lib/utils";

export default function UserSidebar({ collapsed = true, onToggle }) {
  const location = useLocation();

  // Mobile drawer open/close
  const [isOpen, setIsOpen] = useState(!collapsed);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    onToggle?.(!next);
  };

  const Dot = ({ className = "" }) => (
    <span
      className={cn("me-2 d-inline-block rounded-circle", className)}
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

  const menu = useMemo(
    () => (
      <>
        <MDBCardText className="text-uppercase text-muted small px-2 mt-2 mb-1">
          Overview
        </MDBCardText>
        <div className="d-grid gap-1 mb-2">
          {navItem("/account/profile", "Profile")}
        </div>

        <MDBCardText className="text-uppercase text-muted small px-2 mt-3 mb-1">
          Shopping
        </MDBCardText>
        <div className="d-grid gap-1 mb-2">
          {navItem("/account/orders", "Orders")}
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

        <div className="border-top pt-2 pb-3 px-2">
          {navItem("/logout", "Logout")}
        </div>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname],
  );

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="d-none d-lg-block">
        <MDBCard className="mb-4">
          <MDBCardBody className="p-0">
            <div className="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
              <strong className="mb-0">My Account</strong>
            </div>
            <div className="px-2 py-2">{menu}</div>
          </MDBCardBody>
        </MDBCard>
      </div>

      {/* ================= MOBILE BOTTOM BAR (Fixed) ================= */}
      <div className="d-lg-none fixed bottom-0 left-0 right-0" style={{ zIndex: 60 }}>
        <div className="px-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-3 bg-transparent">
          <div className="bg-white border rounded-3 shadow-lg">
            <div className="d-flex align-items-center justify-content-between px-3 py-3">
              <strong className="mb-0">My Account</strong>

              {/* Hamburger button like your NavBar */}
              <button
                aria-label={isOpen ? "Close account menu" : "Open account menu"}
                aria-expanded={isOpen}
                onClick={toggle}
                className={cn(
                  "inline-flex flex-col items-center justify-center w-10 h-10 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 gap-1.5 text-sky-600",
                )}
                type="button"
              >
                <span
                  className={cn(
                    "block transition-all duration-300 w-6 h-0.5 bg-current rounded-full",
                    isOpen ? "rotate-45 translate-y-2" : "",
                  )}
                />
                <span
                  className={cn(
                    "block transition-all duration-300 w-6 h-0.5 bg-current rounded-full",
                    isOpen ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "block transition-all duration-300 w-6 h-0.5 bg-current rounded-full",
                    isOpen ? "-rotate-45 -translate-y-2" : "",
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm d-lg-none"
          style={{ zIndex: 9999 }}
          onClick={() => setIsOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-gradient-to-r from-sky-600 to-blue-600 text-white p-4 shadow-md z-10">
              <div className="flex items-center justify-content-between">
                <div>
                  <h2 className="text-lg font-bold">My Account</h2>
                  <p className="text-xs text-sky-100 mt-0.5">
                    Manage your profile & orders
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-content-center rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close menu"
                  type="button"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-2">{menu}</div>

            {/* ✅ sticky footer (doesn't overlap content while scrolling) */}
            <div className="sticky bottom-0 left-0 right-0 p-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-0">
                ORCA • Account Menu
              </p>
            </div>
          </aside>

          <style>{`
            @keyframes slide-in {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in { animation: slide-in 0.3s ease-out; }
          `}</style>
        </div>
      )}
    </>
  );
}
