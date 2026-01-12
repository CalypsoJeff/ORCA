import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Trophy,
  ShoppingCart,
  LogOut,
  UserCircle,
} from "lucide-react";
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

  const isLandingPage = location.pathname === "/home";

  const navItems = [
    { name: "Home", url: "/home", icon: Home },
    { name: "Competitions", url: "/competitions", icon: Trophy },
    { name: "Shop", url: "/shop", icon: ShoppingCart },
  ];

  /* 🔹 Navbar shadow on scroll */
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

  /* 🔹 Lock body scroll */
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
      {/* ================= HEADER ================= */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 transition-all duration-300",
          scrolled
            ? "bg-black/80 backdrop-blur-md shadow-md"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <span
            className="text-2xl font-bold text-sky-600 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            ORCA
          </span>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ name, url, icon: Icon }) => (
              <Link
                key={name}
                to={url}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
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
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-full hover:bg-sky-100"
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

            {/* Desktop User */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-sky-600" />
                <span className="text-sm">{user.name}</span>
                <button onClick={handleLogout}>
                  <LogOut className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex h-10 px-6 items-center rounded-md bg-sky-600 text-white hover:bg-sky-700"
              >
                Login / Signup
              </Link>
            )}

            {/* Hamburger */}
            <button
              className="md:hidden relative w-8 h-8"
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <span
                className={cn(
                  "absolute left-1/2 top-2 h-0.5 w-6 bg-current transform -translate-x-1/2 transition-all",
                  isMenuOpen && "rotate-45 top-4"
                )}
              />
              <span
                className={cn(
                  "absolute left-1/2 top-4 h-0.5 w-6 bg-current transform -translate-x-1/2 transition-all",
                  isMenuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-1/2 top-6 h-0.5 w-6 bg-current transform -translate-x-1/2 transition-all",
                  isMenuOpen && "-rotate-45 top-4"
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity md:hidden",
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMenuOpen(false)}
      >
        <aside
          className={cn(
            "absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out",
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-sky-600">Menu</h2>
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
                className="flex items-center gap-3 px-6 py-4 hover:bg-gray-100"
              >
                <Icon className="h-5 w-5 text-sky-600" />
                {name}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/account/profile"
                  className="px-6 py-4 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-4 text-left text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-6 py-4 text-sky-600 hover:bg-sky-50"
              >
                Login / Signup
              </Link>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
};

export default NavBar;
