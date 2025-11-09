/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
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
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // for per-button loading

  // ✅ consistent button style
  const buttonStyle = {
    width: "130px",
    height: "38px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  };

  // 🔹 Fetch addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await authInstanceAxios.get("/api/user/addresses");
      setAddresses(res.data);
    } catch (error) {
      toast.error("Failed to load addresses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 🔹 Input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Reset form
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

  // 🔹 Submit (Add / Update)
  const handleSubmit = async () => {
    const { name, phone, addressLine1, city, state, pincode } = formData;
    if (!name || !phone || !addressLine1 || !city || !state || !pincode) {
      toast.warn("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await authInstanceAxios.put(`/api/user/update-address/${editingId}`, formData);
        toast.success("Address updated successfully!");
      } else {
        await authInstanceAxios.post("/api/user/add-address", formData);
        toast.success("Address added successfully!");
      }
      fetchAddresses();
      resetForm();
    } catch (error) {
      toast.error("Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Edit
  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address._id);
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  // 🔹 Delete
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

    if (confirm.isConfirmed) {
      setActionLoading(id);
      try {
        await authInstanceAxios.delete(`/api/user/delete-address/${id}`);
        toast.success("Address deleted successfully");
        fetchAddresses();
      } catch (error) {
        toast.error("Error deleting address");
      } finally {
        setActionLoading(null);
      }
    }
  };

  // 🔹 Set Default
  const handleSetDefault = async (id) => {
    setActionLoading(id);
    try {
      await authInstanceAxios.patch(`/api/user/set-default/${id}`);
      toast.success("Default address updated");
      fetchAddresses();
    } catch (error) {
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
      <section style={{ backgroundColor: "#f7f8fa", marginTop: "100px" }}>
        <MDBContainer className="py-5">
          <MDBRow>
            {/* Sidebar */}
            <MDBCol lg="3" className="mb-4">
              <UserSidebar />
            </MDBCol>

            {/* Main Content */}
            <MDBCol lg="9">
              <MDBCard className="shadow-sm">
                <MDBCardBody>
                  <h4 className="mb-4 fw-bold text-primary">Manage Addresses</h4>

                  {/* FORM */}
                  <div className="p-4 border rounded bg-light mb-4">
                    <h6 className="fw-semibold text-secondary mb-3">
                      {editingId ? "Edit Address" : "Add New Address"}
                    </h6>
                    <MDBRow className="g-3">
                      <MDBCol md="6">
                        <MDBInput
                          label="Full Name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </MDBCol>
                      <MDBCol md="6">
                        <MDBInput
                          label="Phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </MDBCol>
                      <MDBCol md="12">
                        <MDBInput
                          label="Address Line 1"
                          name="addressLine1"
                          value={formData.addressLine1}
                          onChange={handleChange}
                        />
                      </MDBCol>
                      <MDBCol md="12">
                        <MDBInput
                          label="Address Line 2"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleChange}
                        />
                      </MDBCol>
                      <MDBCol md="4">
                        <MDBInput
                          label="City"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </MDBCol>
                      <MDBCol md="4">
                        <MDBInput
                          label="State"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                        />
                      </MDBCol>
                      <MDBCol md="4">
                        <MDBInput
                          label="Pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                        />
                      </MDBCol>
                    </MDBRow>
                    <div className="mt-4 d-flex justify-content-end gap-2">
                      <MDBBtn
                        color="secondary"
                        outline
                        style={buttonStyle}
                        onClick={resetForm}
                      >
                        Clear
                      </MDBBtn>
                      <MDBBtn
                        color="primary"
                        style={buttonStyle}
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                      >
                        <span className="d-flex align-items-center justify-content-center gap-2">
                          {isSubmitting && (
                            <MDBSpinner
                              size="sm"
                              role="status"
                              tag="span"
                              className="spinner-border-sm"
                            />
                          )}
                          <span>
                            {isSubmitting
                              ? editingId
                                ? "Updating..."
                                : "Adding..."
                              : editingId
                              ? "Update Address"
                              : "Add Address"}
                          </span>
                        </span>
                      </MDBBtn>
                    </div>
                  </div>

                  {/* ADDRESS LIST */}
                  {loading ? (
                    <div className="text-center py-5">
                      <MDBSpinner grow color="primary" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <p className="text-muted text-center py-4">
                      No addresses added yet.
                    </p>
                  ) : (
                    <MDBRow className="g-3">
                      {addresses.map((address) => (
                        <MDBCol md="6" key={address._id}>
                          <MDBCard className="h-100 shadow-sm border-0 hover-shadow">
                            <MDBCardBody>
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="fw-semibold mb-1">
                                    {address.name}{" "}
                                    {address.isDefault && (
                                      <span className="badge bg-primary ms-2">
                                        Default
                                      </span>
                                    )}
                                  </h6>
                                  <small className="text-muted d-block">
                                    {address.phone}
                                  </small>
                                </div>
                                <div className="d-flex">
                                  <MDBBtn
                                    size="sm"
                                    color="info"
                                    outline
                                    style={buttonStyle}
                                    className="me-1"
                                    onClick={() => handleEdit(address)}
                                  >
                                    Edit
                                  </MDBBtn>
                                  <MDBBtn
                                    size="sm"
                                    color="danger"
                                    outline
                                    style={buttonStyle}
                                    className="me-1"
                                    disabled={actionLoading === address._id}
                                    onClick={() => handleDelete(address._id)}
                                  >
                                    <span className="d-flex align-items-center justify-content-center gap-2">
                                      {actionLoading === address._id && (
                                        <MDBSpinner
                                          size="sm"
                                          role="status"
                                          tag="span"
                                          className="spinner-border-sm"
                                        />
                                      )}
                                      <span>
                                        {actionLoading === address._id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </span>
                                    </span>
                                  </MDBBtn>
                                </div>
                              </div>
                              <hr />
                              <p className="mb-1">
                                {address.addressLine1}
                                {address.addressLine2 &&
                                  `, ${address.addressLine2}`}
                              </p>
                              <p className="text-muted mb-0">
                                {address.city}, {address.state} -{" "}
                                {address.pincode}
                              </p>
                              {!address.isDefault && (
                                <div className="text-end mt-3">
                                  <MDBBtn
                                    size="sm"
                                    color="success"
                                    style={buttonStyle}
                                    disabled={actionLoading === address._id}
                                    onClick={() =>
                                      handleSetDefault(address._id)
                                    }
                                  >
                                    <span className="d-flex align-items-center justify-content-center gap-2">
                                      {actionLoading === address._id && (
                                        <MDBSpinner
                                          size="sm"
                                          tag="span"
                                          role="status"
                                          className="spinner-border-sm"
                                        />
                                      )}
                                      <span>
                                        {actionLoading === address._id
                                          ? "Setting..."
                                          : "Set Default"}
                                      </span>
                                    </span>
                                  </MDBBtn>
                                </div>
                              )}
                            </MDBCardBody>
                          </MDBCard>
                        </MDBCol>
                      ))}
                    </MDBRow>
                  )}
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </>
  );
}
