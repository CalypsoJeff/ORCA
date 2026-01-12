import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, User, ChevronDown, Eye } from "lucide-react";
import axios from "axios";
import SideBar from "../../components/admin/SideBar";

export default function OrdersList() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 6;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/orders/admin/all`
        );

        setOrders(response.data);
      } catch (err) {
        console.error("Error loading orders:", err);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ordersPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* === Sidebar === */}
      <SideBar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(false)}
      />

      {/* === Main Content Area === */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* === Header === */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 focus:outline-none lg:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 focus:outline-none">
              <Bell size={24} />
            </button>
            <div className="relative">
              <button className="flex items-center text-gray-700 focus:outline-none">
                <User size={24} className="mr-2" />
                <span className="text-sm font-medium">Admin</span>
                <ChevronDown size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </header>

        {/* === Orders Table Section === */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 pb-24">
          {/* Header row with search & filter */}
          <div className="flex flex-col sm:flex-row justify-between mb-6">
            <h2 className="text-2xl font-semibold mb-3 sm:mb-0 text-gray-800">
              Orders
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search by ID or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-60"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg shadow bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Total</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b last:border-none hover:bg-gray-50 transition-all"
                  >
                    <td className="px-6 py-4 text-gray-700 font-medium">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4">{order.user?.name}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹
                      {order.grandTotal.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="text-indigo-600 hover:underline inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
                {currentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-8 text-gray-500 text-sm"
                    >
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* === Sticky Pagination Bar === */}
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-sm py-3 flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm rounded border disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1.5 text-sm rounded border ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm rounded border disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
