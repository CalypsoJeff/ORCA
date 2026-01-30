/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBSpinner,
} from "mdb-react-ui-kit";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import authInstanceAxios from "../../api/middlewares/interceptor";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import UserSidebar from "../../components/user/UserSidebar";
import "react-toastify/dist/ReactToastify.css";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await authInstanceAxios.get("/api/user/addresses");
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setEditingId(null);
    setFormOpen(true);
    setTimeout(() => {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }, 100);
  };

  const openEdit = (address) => {
    setFormData({
      name: address?.name || "",
      phone: address?.phone || "",
      addressLine1: address?.addressLine1 || "",
      addressLine2: address?.addressLine2 || "",
      city: address?.city || "",
      state: address?.state || "",
      pincode: address?.pincode || "",
    });
    setEditingId(address?._id || null);
    setFormOpen(true);
    setTimeout(() => {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }, 100);
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const { name, phone, addressLine1, city, state, pincode } = formData;
    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.warn("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await authInstanceAxios.put(
          `/api/user/update-address/${editingId}`,
          formData
        );
        toast.success("Address updated!");
      } else {
        await authInstanceAxios.post("/api/user/add-address", formData);
        toast.success("Address added!");
      }

      await fetchAddresses();
      resetForm();
      setFormOpen(false);
    } catch (e) {
      toast.error("Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Address?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    setActionLoading(id);
    try {
      await authInstanceAxios.delete(`/api/user/delete-address/${id}`);
      toast.success("Address deleted");
      await fetchAddresses();
    } catch (e) {
      toast.error("Error deleting address");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (id) => {
    setActionLoading(id);
    try {
      await authInstanceAxios.patch(`/api/user/set-default/${id}`);
      toast.success("Default address updated");
      await fetchAddresses();
    } catch (e) {
      toast.error("Failed to set default address");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />
      <ToastContainer position="top-right" autoClose={2000} />

      <section className="bg-gray-50 min-h-screen" style={{ marginTop: "100px" }}>
        <MDBContainer className="py-4 py-md-5">
          <MDBRow>
            <MDBCol lg="3" className="mb-4">
              <UserSidebar />
            </MDBCol>

            <MDBCol lg="9">
              <MDBCard className="shadow-sm border-0 rounded-lg">
                <MDBCardBody className="p-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <h4 className="text-2xl font-bold text-blue-600 mb-2">
                        My Addresses
                      </h4>
                      <p className="text-gray-600 text-sm mb-0">
                        Manage your delivery addresses for faster checkout
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={openCreate}
                        className="btn-stable px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2 shadow-sm"
                        style={{ minWidth: "140px", height: "42px" }}
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Address
                      </button>

                      {formOpen && (
                        <button
                          onClick={() => {
                            resetForm();
                            setFormOpen(false);
                          }}
                          className="btn-stable px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                          style={{ minWidth: "100px", height: "42px" }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* FORM */}
                  {formOpen && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 md:p-6 mb-6 shadow-sm animate-fadeIn">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-blue-600 rounded"></div>
                        <h5 className="text-lg font-semibold text-gray-800 mb-0">
                          {editingId ? "Edit Address" : "Add New Address"}
                        </h5>
                      </div>

                      <MDBRow className="g-3">
                        <MDBCol md="6">
                          <MDBInput
                            label="Full Name *"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-white"
                          />
                        </MDBCol>
                        <MDBCol md="6">
                          <MDBInput
                            label="Phone Number *"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="bg-white"
                          />
                        </MDBCol>

                        <MDBCol md="12">
                          <MDBInput
                            label="Address Line 1 *"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleChange}
                            className="bg-white"
                          />
                        </MDBCol>
                        <MDBCol md="12">
                          <MDBInput
                            label="Address Line 2"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleChange}
                            className="bg-white"
                          />
                        </MDBCol>

                        <MDBCol md="4">
                          <MDBInput
                            label="City *"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="bg-white"
                          />
                        </MDBCol>
                        <MDBCol md="4">
                          <MDBInput
                            label="State *"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="bg-white"
                          />
                        </MDBCol>
                        <MDBCol md="4">
                          <MDBInput
                            label="Pincode *"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            className="bg-white"
                          />
                        </MDBCol>
                      </MDBRow>

                      <div className="mt-5 flex justify-end gap-3 flex-wrap">
                        <button
                          onClick={resetForm}
                          disabled={isSubmitting}
                          className="btn-stable px-5 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ minWidth: "100px", height: "42px" }}
                        >
                          Clear
                        </button>

                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="btn-stable px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                          style={{ minWidth: "140px", height: "42px" }}
                        >
                          {isSubmitting && (
                            <MDBSpinner size="sm" role="status" tag="span" />
                          )}
                          {editingId ? "Update Address" : "Save Address"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ADDRESS LIST */}
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <MDBSpinner grow color="primary" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <h5 className="text-gray-600 font-medium mb-2">
                        No addresses yet
                      </h5>
                      <p className="text-gray-500 text-sm">
                        Add your first delivery address to get started
                      </p>
                    </div>
                  ) : (
                    <MDBRow className="g-4">
                      {addresses.map((a) => {
                        const busy = actionLoading === a._id;

                        return (
                          <MDBCol xs="12" md="6" key={a._id}>
                            {/* ✅ Make the CARD a flex column + full height */}
                            <div className="address-card bg-white border-2 border-gray-200 rounded-xl p-4 h-full hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col">
                              {/* Header */}
                              <div className="flex justify-between items-start gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h6 className="font-semibold text-gray-800 mb-0 truncate">
                                      {a.name}
                                    </h6>
                                    {a.isDefault && (
                                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-sm">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-gray-600 text-sm flex items-center gap-1">
                                    {a.phone}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => openEdit(a)}
                                    disabled={busy}
                                    className="btn-stable p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ minWidth: "36px", height: "36px" }}
                                    title="Edit"
                                  >
                                    ✎
                                  </button>

                                  <button
                                    onClick={() => handleDelete(a._id)}
                                    disabled={busy}
                                    className="btn-stable p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    style={{ minWidth: "36px", height: "36px" }}
                                    title="Delete"
                                  >
                                    {busy ? (
                                      <MDBSpinner size="sm" role="status" tag="span" />
                                    ) : (
                                      "🗑"
                                    )}
                                  </button>
                                </div>
                              </div>

                              <hr className="my-3 border-gray-200" />

                              {/* ✅ Content grows, footer stays bottom */}
                              <div className="flex-1">
                                <div className="text-gray-700 text-sm">
                                  <div>{a.addressLine1}</div>
                                  {a.addressLine2 && <div>{a.addressLine2}</div>}
                                  <div className="text-gray-600 mt-1">
                                    {a.city}, {a.state} - {a.pincode}
                                  </div>
                                </div>
                              </div>

                              {/* ✅ Footer pinned at bottom for ALL cards */}
                              <div className="mt-auto pt-3 border-t border-gray-200">
                                {a.isDefault ? (
                                  <div className="w-full h-[40px] flex items-center justify-center bg-blue-50 text-blue-700 rounded-lg font-medium">
                                    Default Address
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleSetDefault(a._id)}
                                    disabled={busy}
                                    className="btn-stable w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                                    style={{ height: "40px" }}
                                  >
                                    {busy ? (
                                      <MDBSpinner size="sm" role="status" tag="span" />
                                    ) : (
                                      "Set as Default"
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </MDBCol>
                        );
                      })}
                    </MDBRow>
                  )}
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>

      <style>{`
        .btn-stable {
          user-select: none;
        }
        .btn-stable:active {
          transform: none !important;
          box-shadow: none !important;
        }
        .address-card {
          transition: all 0.2s ease;
        }
        .address-card:hover {
          transform: translateY(-2px);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
