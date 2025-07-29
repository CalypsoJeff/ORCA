/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ActivityIcon,
  Briefcase,
  LayoutList,
  Calendar,
  ShoppingCartIcon,
  FileText,
  X,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectAdmin, logoutAdmin } from "../../features/admin/adminAuthSlice";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "User List", path: "/admin/userlist" },
  { icon: Briefcase, label: "Competitions", path: "/admin/competitions" },
  { icon: FileText, label: "Trekking", path: "/admin/trekking" },
  { icon: Calendar, label: "Category", path: "/admin/category" },
  { icon: ShoppingCartIcon, label: "Products", path: "/admin/products" },
  { icon: ActivityIcon, label: "Fitness", path: "/admin/fitness" },
  { icon: LayoutList, label: "Riders", path: "/admin/riders" },
  { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
];

export default function SideBar({ isOpen, toggleSidebar }) {
  const admin = useSelector(selectAdmin);
  console.log(admin, "Admin Data in Sidebar");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate("/admin/login");
  };

  return (
    <aside
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col justify-between`}
    >
      {/* Top: Sidebar Header & Menu */}
      <div>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-indigo-600 text-white">
          <span className="text-2xl font-semibold">ORCA</span>
          <button onClick={toggleSidebar} className="lg:hidden">
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="mt-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}

          {/* Super Admin Only */}
          {admin?.isMainAdmin && (
            <Link
              to="/admin/requests"
              className="flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <ShieldCheck className="w-5 h-5 mr-3" />
              Admin Requests
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom: Logout */}
      <div className="mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
}
