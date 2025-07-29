import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Trophy,
  Users,
  Mountain,
  ShoppingCart,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
  };

  const isLandingPage = location.pathname === "/landing";

  const navItems = [
    { name: "Home", url: "/landing", icon: Home },
    { name: "Competitions", url: "/competitions", icon: Trophy },
    { name: "Riders Group", url: "/rides", icon: Users },
    { name: "Trekking/Exploration", url: "/trekking", icon: Mountain },
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
        <span className="text-2xl font-display font-bold tracking-tight text-sky-600">
          ORCA
        </span>

        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map(({ name, url, icon: Icon }) => (
            <Link
              key={name}
              to={url}
              className={cn(
                "flex items-center text-sm font-medium transition-colors no-underline hover-link",
                isLandingPage
                  ? "text-white hover:text-orca-300"
                  : "text-black hover:text-orca-600"
              )}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-2">
              {/* Profile section with better styling */}
              <div className="flex items-center space-x-2 hover:bg-sky-100 rounded-full px-3 py-1.5 transition-all duration-200 shadow-sm hover:shadow-md">
                <div
                  onClick={() => (window.location.href = "/profile")}
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
