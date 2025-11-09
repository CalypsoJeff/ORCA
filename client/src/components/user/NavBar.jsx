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
import authInstanceAxios from "../../api/middlewares/interceptor"; // ✅ use your axios with token

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0); // 🟢 store cart item count
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  // 🔹 Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Fetch cart count when user logged in
  useEffect(() => {
    if (!user?._id) return;
    const fetchCartCount = async () => {
      try {
        const res = await authInstanceAxios.get("/api/cart");
        if (res.data?.items) {
          setCartCount(res.data.items.length);
        }
      } catch (err) {
        console.error("Error fetching cart count:", err);
      }
    };
    fetchCartCount();
  }, [user]);

  const handleLogout = () => dispatch(logout());
  const isLandingPage = location.pathname === "/home";

  const navItems = [
    { name: "Home", url: "/home", icon: Home },
    { name: "Competitions", url: "/competitions", icon: Trophy },
    { name: "Shop", url: "/shop", icon: ShoppingCart },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-10 py-4",
        scrolled ? "bg-black/80 backdrop-blur-md shadow-md" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        {/* Brand */}
        <span
          className="text-2xl font-display font-bold tracking-tight text-sky-600 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          ORCA
        </span>

        {/* Nav links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map(({ name, url, icon: Icon }) => (
            <Link
              key={name}
              to={url}
              className={cn(
                "flex items-center text-sm font-medium transition-colors no-underline hover-link",
                isLandingPage
                  ? "text-white hover:text-sky-300"
                  : "text-black hover:text-sky-600"
              )}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {name}
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* 🛒 Cart Button */}
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-sky-100 transition-all duration-200"
            title="View Cart"
          >
            <ShoppingCart
              className={cn(
                "h-6 w-6 transition-colors",
                isLandingPage
                  ? "text-white hover:text-sky-200"
                  : "text-sky-600 hover:text-sky-700"
              )}
            />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
            )}
          </button>

          {/* 👤 User Section */}
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 hover:bg-sky-100 rounded-full px-3 py-1.5 transition-all duration-200 shadow-sm hover:shadow-md">
                <div
                  onClick={() => navigate("/account/profile")}
                  className="relative cursor-pointer"
                >
                  <UserCircle className="h-6 w-6 text-sky-600 hover:text-sky-700 transition-colors" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border border-white"></span>
                </div>
                {user.name && (
                  <span className="text-sm font-medium text-sky-700">
                    {user.name}
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-2 rounded-full bg-transparent hover:bg-red-100 text-red-500 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors no-underline bg-sky-600 text-white hover:bg-sky-700"
            >
              Login / Signup
            </Link>
          )}

          {/* ☰ Mobile Menu Button */}
          <button
            className="md:hidden rounded-md p-2"
            aria-label="Menu"
            style={{ color: isLandingPage ? "white" : "black" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
