/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import SideBar from "../../components/admin/SideBar";
import { selectAdmin } from "../../features/admin/adminAuthSlice";

const API_URL = import.meta.env.VITE_API_URL;

function GymRequests() {
  const admin = useSelector(selectAdmin);

  const [gymRequests, setGymRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // 🔐 axios instance with admin token
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${admin?.token}`,
    },
  });

  // 🔽 Fetch pending gym requests
  const fetchGymRequests = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/gym-owners/pending");
      setGymRequests(res.data);
    } catch (error) {
      toast.error("Failed to load gym requests");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Approve gym
  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`/admin/gym-owners/${id}/approve`);

      toast.success("Gym approved successfully");
      setGymRequests((prev) => prev.filter((g) => g._id !== id));
    } catch (error) {
      toast.error("Approval failed");
    }
  };

  // ❌ Reject gym
  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      return toast.warning("Please provide rejection reason");
    }

    try {
      await axiosInstance.patch(`/admin/gym-owners/${id}/reject`, {
        reason: rejectReason,
      });

      toast.success("Gym rejected");
      setGymRequests((prev) => prev.filter((g) => g._id !== id));
      setRejectReason("");
    } catch (error) {
      toast.error("Rejection failed");
    }
  };

  useEffect(() => {
    // extra safety (UI side)
    if (!admin?.isMainAdmin) {
      toast.error("Access denied");
      return;
    }
    fetchGymRequests();
  }, []);

  return (
    <div className="flex">
      <SideBar />

      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Pending Gym Owner Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : gymRequests.length === 0 ? (
          <p>No pending gym requests</p>
        ) : (
          <table className="min-w-full border border-gray-200 rounded shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Owner Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Gym Name</th>
                <th className="px-4 py-2 text-left">Address</th>
                <th className="px-4 py-2 text-left">License ID</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {gymRequests.map((gym) => (
                <tr key={gym._id} className="border-t">
                  <td className="px-4 py-2">{gym.userId?.name}</td>
                  <td className="px-4 py-2">{gym.userId?.email}</td>
                  <td className="px-4 py-2">{gym.gymName}</td>
                  <td className="px-4 py-2">{gym.gymAddress}</td>
                  <td className="px-4 py-2">{gym.licenseId}</td>

                  <td className="px-4 py-2 space-x-2 text-center">
                    <button
                      onClick={() => handleApprove(gym._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(gym._id)}
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

        {/* Reject reason */}
        <div className="mt-4 max-w-md">
          <input
            type="text"
            placeholder="Rejection reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default GymRequests;
