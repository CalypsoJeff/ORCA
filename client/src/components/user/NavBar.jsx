import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Trophy, ShoppingCart, LogOut, UserCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import authInstanceAxios from "../../api/middlewares/interceptor";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const path = location.pathname.replace(/\/$/, "");
  const isLandingPage = path === "" || path === "/home";

  const navItems = [
    { name: "Home", url: "/home", icon: Home },
    { name: "Competitions", url: "/competitions", icon: Trophy },
    { name: "Shop", url: "/shop", icon: ShoppingCart },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* 🔹 Fetch cart count */
  useEffect(() => {
    if (!user?._id) return;
    authInstanceAxios
      .get("/api/user/cart")
      .then((res) => setCartCount(res.data?.items?.length || 0))
      .catch(() => {});
  }, [user]);

  /* 🔹 Close menu on route change */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  /* 🔹 Lock body scroll only when drawer open */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-4 md:px-10 py-3 transition-all duration-300",
          scrolled ? "bg-black/80 backdrop-blur-md shadow-md" : "bg-transparent"
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            aria-label="Go to home"
            onClick={() => navigate("/home")}
            className="text-2xl font-bold text-sky-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
          >
            ORCA
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ name, url, icon: Icon }) => (
              <Link
                key={name}
                to={url}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors no-underline",
                  isLandingPage
                    ? "text-white hover:text-sky-300"
                    : "text-black hover:text-sky-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className={cn(
                "relative p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500",
                isLandingPage ? "hover:bg-white/10" : "hover:bg-sky-50"
              )}
              aria-label="Go to cart"
            >
              <ShoppingCart
                className={cn(
                  "h-6 w-6",
                  isLandingPage ? "text-white" : "text-sky-600"
                )}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/account/profile"
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-sky-500 no-underline",
                    isLandingPage ? "text-white" : "text-black"
                  )}
                  aria-label="Go to profile"
                >
                  <UserCircle className="h-6 w-6 text-sky-600" />
                  <span className="text-sm">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex h-10 px-5 items-center rounded-md bg-sky-600 text-white hover:bg-sky-700 no-underline"
              >
                Login / Signup
              </Link>
            )}

            {/* Hamburger (mobile) */}
            <button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((v) => !v)}
              className={cn(
                "md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500",
                isLandingPage ? "text-white" : "text-sky-600"
              )}
            >
              {/* animated bars */}
              <span
                className={cn(
                  "block origin-center transition-transform duration-200 w-6 h-0.5 bg-current",
                  isMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-2"
                )}
              />
              <span
                className={cn(
                  "block transition-opacity duration-200 w-6 h-0.5 bg-current my-1",
                  isMenuOpen ? "opacity-0" : "opacity-100"
                )}
              />
              <span
                className={cn(
                  "block origin-center transition-transform duration-200 w-6 h-0.5 bg-current",
                  isMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-2"
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE DRAWER (render only when open) ================= */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-sky-600">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              {cartCount > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  🛒 Items in cart:{" "}
                  <span className="font-semibold">{cartCount}</span>
                </p>
              )}
            </div>

            <nav className="flex flex-col divide-y">
              {navItems.map(({ name, url, icon: Icon }) => (
                <Link
                  key={name}
                  to={url}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gray-100 text-base no-underline"
                >
                  <Icon className="h-5 w-5 text-sky-600" />
                  <span>{name}</span>
                </Link>
              ))}

              <div className="px-6 py-4">
                {user ? (
                  <>
                    <Link
                      to="/account/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-3 rounded hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-3 rounded text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-3 rounded text-sky-600 hover:bg-sky-50"
                  >
                    Login / Signup
                  </Link>
                )}
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default NavBar;
