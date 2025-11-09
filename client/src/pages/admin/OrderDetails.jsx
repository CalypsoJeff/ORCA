import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Package } from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:3030/api/orders/admin/${id}`)
      .then((res) => {
        setOrder(res.data);
        setStatus(res.data.status || "Pending");
      })
      .catch((err) => console.error("Error loading order:", err));
  }, [id]);

  const handleStatusChange = async () => {
    try {
      await axios.put(`http://localhost:3030/api/orders/admin/${id}`, {
        status,
      });
      alert("Order status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (!order)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading order details...</p>
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">
          Order #{order._id.slice(-6)}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Customer Information
            </h3>
            <div className="text-gray-700 text-sm space-y-2">
              <p>
                <strong className="w-24 inline-block">Name:</strong>{" "}
                {order.user?.name}
              </p>
              <p>
                <strong className="w-24 inline-block">Email:</strong>{" "}
                {order.user?.email}
              </p>
              <p>
                <strong className="w-24 inline-block">Address ID:</strong>{" "}
                {order.address}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Order Items
              </h3>
            </div>
            <div className="divide-y text-gray-700 text-sm">
              {order.products?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-3 hover:bg-gray-50 transition rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      Product ID: {item.product}
                    </p>
                    <p className="text-xs text-gray-500">
                      Size: {item.size} | Color: {item.color}
                    </p>
                  </div>
                  <div className="flex gap-6">
                    <span>Qty: {item.quantity}</span>
                    <span className="font-semibold text-gray-900">
                      ₹{item.total?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Order Summary
            </h3>
            <div className="space-y-2 text-gray-700 text-sm">
              <p className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.subTotal.toLocaleString("en-IN")}</span>
              </p>
              <p className="flex justify-between">
                <span>Tax:</span>
                <span>₹{order.taxTotal.toLocaleString("en-IN")}</span>
              </p>
              <p className="flex justify-between">
                <span>Discount:</span>
                <span>₹{order.discountTotal.toLocaleString("en-IN")}</span>
              </p>
              <div className="border-t mt-3 pt-3 font-semibold text-gray-900 flex justify-between">
                <span>Grand Total:</span>
                <span>₹{order.grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Order Status
            </h3>
            <div className="flex flex-col space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusChange}
                className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Update Status
              </button>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Information
            </h3>
            <p className="text-sm text-gray-700">
              <strong>Gateway:</strong> {order.payment?.gateway}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Payment ID:</strong>{" "}
              {order.payment?.razorpayPaymentId || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Status:</strong>{" "}
              <span
                className={`font-semibold ${
                  order.payment?.status === "PAID"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {order.payment?.status}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
