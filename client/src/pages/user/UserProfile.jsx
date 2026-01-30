/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBBtn,
  MDBInput,
} from "mdb-react-ui-kit";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import { updateProfileAsync } from "../../features/auth/authSlice";
import UserSidebar from "../../components/user/UserSidebar";

const UserProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [profileData, setProfileData] = useState({
    userId: user?._id || "",
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    addresses: user?.addresses || [],
  });

  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    isDefault: false,
  });

  const [editing, setEditing] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleNewAddressChange = (e) => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditAddress = (index) => {
    setEditingAddressIndex(index);
    setNewAddress({ ...profileData.addresses[index] });
  };

  const handleAddAddress = () => {
    if (
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.country
    ) {
      alert("Please fill in all required address fields");
      return;
    }

    // If this is the first address, mark it as default
    const nextAddress = { ...newAddress };
    if (profileData.addresses.length === 0) {
      nextAddress.isDefault = true;
    }

    if (editingAddressIndex >= 0) {
      const updatedAddresses = [...profileData.addresses];
      updatedAddresses[editingAddressIndex] = nextAddress;

      setProfileData({
        ...profileData,
        addresses: updatedAddresses,
      });
      setEditingAddressIndex(-1);
    } else {
      setProfileData({
        ...profileData,
        addresses: [...profileData.addresses, nextAddress],
      });
    }

    setNewAddress({
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      isDefault: false,
    });
  };

  const handleRemoveAddress = (index) => {
    const updatedAddresses = [...profileData.addresses];
    const removedAddress = updatedAddresses.splice(index, 1)[0];

    if (removedAddress?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    setProfileData({
      ...profileData,
      addresses: updatedAddresses,
    });
  };

  const handleSetDefaultAddress = (index) => {
    const updatedAddresses = [...profileData.addresses];
    updatedAddresses.forEach((addr) => (addr.isDefault = false));
    updatedAddresses[index].isDefault = true;

    setProfileData({
      ...profileData,
      addresses: updatedAddresses,
    });
  };

  const handleSave = async () => {
    if (!profileData.userId) {
      console.error("User ID is missing.");
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateProfileAsync(profileData));
      setEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setProfileData({
      userId: user?._id || "",
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      addresses: user?.addresses || [],
    });
    setNewAddress({
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      isDefault: false,
    });
    setEditingAddressIndex(-1);
  };

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />

      <section style={{ backgroundColor: "#eee", marginTop: "100px" }}>
        <MDBContainer className="py-5">
          <MDBRow>
            {/* LEFT: Sidebar */}
            <MDBCol lg="3" className="mb-4">
              <UserSidebar />
            </MDBCol>

            {/* RIGHT: Profile content (ONLY details section) */}
            <MDBCol lg="9">
              {/* Header row with Edit button */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Profile Details</h5>
                <MDBBtn outline onClick={() => setEditing((v) => !v)}>
                  {editing ? "Cancel Edit" : "Edit Profile"}
                </MDBBtn>
              </div>

              <MDBCard className="mb-4">
                <MDBCardBody>
                  {/* Name */}
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Full Name</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      {editing ? (
                        <MDBInput
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleChange}
                        />
                      ) : (
                        <MDBCardText className="text-muted">
                          {profileData.name}
                        </MDBCardText>
                      )}
                    </MDBCol>
                  </MDBRow>
                  <hr />

                  {/* Email */}
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Email</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      {editing ? (
                        <MDBInput
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleChange}
                        />
                      ) : (
                        <MDBCardText className="text-muted">
                          {profileData.email}
                        </MDBCardText>
                      )}
                    </MDBCol>
                  </MDBRow>
                  <hr />

                  {/* Phone */}
                  <MDBRow>
                    <MDBCol sm="3">
                      <MDBCardText>Phone</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      {editing ? (
                        <MDBInput
                          type="text"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleChange}
                        />
                      ) : (
                        <MDBCardText className="text-muted">
                          {profileData.phone}
                        </MDBCardText>
                      )}
                    </MDBCol>
                  </MDBRow>
                  <hr />

                  {/* Save/Cancel */}
                  {editing && (
                    <div className="text-center mt-4">
                      <MDBBtn
                        color="danger"
                        className="me-2"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </MDBBtn>
                      <MDBBtn
                        color="success"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </MDBBtn>
                    </div>
                  )}
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </>
  );
};

export default UserProfile;
