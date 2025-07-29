/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  approveAdmin,
  pendingAdminRequests,
  rejectAdmin,
} from "../../api/endpoints/auth/admin-auth";
import SideBar from "../../components/admin/SideBar";

function AdminRequests() {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingAdmins = async () => {
    setLoading(true);
    try {
      const response = await pendingAdminRequests();
      setPendingAdmins(response.data.pendingAdmins);
    } catch (error) {
      toast.error("Failed to fetch pending admins");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adminId) => {
    try {
      await approveAdmin(adminId);
      toast.success("Admin approved");
      setPendingAdmins((prev) => prev.filter((admin) => admin._id !== adminId));
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (adminId) => {
    try {
      await rejectAdmin(adminId);
      toast.success("Admin rejected");
      setPendingAdmins((prev) => prev.filter((admin) => admin._id !== adminId));
    } catch (error) {
      toast.error("Rejection failed");
    }
  };

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  return (
    <div className="flex">
      <SideBar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Pending Admin Requests</h2>
        {loading ? (
          <p>Loading...</p>
        ) : pendingAdmins.length === 0 ? (
          <p>No pending admin requests.</p>
        ) : (
          <table className="min-w-full border border-gray-200 rounded shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdmins.map((admin) => (
                <tr key={admin._id} className="border-t">
                  <td className="px-4 py-2">{admin.name}</td>
                  <td className="px-4 py-2">{admin.email}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleApprove(admin._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(admin._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminRequests;
