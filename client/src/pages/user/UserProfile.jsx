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
  MDBCardImage,
  MDBBtn,
  MDBInput,
} from "mdb-react-ui-kit";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import { updateProfileAsync } from "../../features/auth/authSlice";

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
  const [profilePic, setProfilePic] = useState(
    user?.profilePic ||
      "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp"
  );

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

  const handleAddressChange = (e, index) => {
    const updatedAddresses = [...profileData.addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [e.target.name]: e.target.value,
    };

    setProfileData({
      ...profileData,
      addresses: updatedAddresses,
    });
  };

  const handleAddAddress = () => {
    // Validate new address
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
    if (profileData.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    if (editingAddressIndex >= 0) {
      // Update existing address
      const updatedAddresses = [...profileData.addresses];
      updatedAddresses[editingAddressIndex] = newAddress;

      setProfileData({
        ...profileData,
        addresses: updatedAddresses,
      });
      setEditingAddressIndex(-1);
    } else {
      // Add new address
      setProfileData({
        ...profileData,
        addresses: [...profileData.addresses, newAddress],
      });
    }

    // Reset the new address form
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

    // If we removed the default address and there are other addresses, make the first one default
    if (removedAddress.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    setProfileData({
      ...profileData,
      addresses: updatedAddresses,
    });
  };

  const handleSetDefaultAddress = (index) => {
    const updatedAddresses = [...profileData.addresses];

    // Remove default flag from all addresses
    updatedAddresses.forEach((addr) => (addr.isDefault = false));

    // Set the selected address as default
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

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
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
      {/* Navbar */}
      <NavBar />
      {/* Page Breadcrumbs */}
      <PageBreadcrumbs />

      <section style={{ backgroundColor: "#eee", marginTop: "100px" }}>
        <MDBContainer className="py-5">
          <MDBRow>
            <MDBCol lg="4">
              <MDBCard className="mb-4">
                <MDBCardBody className="text-center">
                  <MDBCardImage
                    src={profilePic}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: "150px" }}
                    fluid
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="mt-2"
                  />
                  <p className="text-muted mb-1">User Profile</p>
                  <p className="text-muted mb-4">
                    {profileData.addresses.find((addr) => addr.isDefault)
                      ?.city || "Location Not Set"}
                  </p>
                  <div className="d-flex justify-content-center mb-2">
                    <MDBBtn outline onClick={() => setEditing(!editing)}>
                      {editing ? "Cancel" : "Edit Profile"}
                    </MDBBtn>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            <MDBCol lg="8">
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

                  {/* Addresses Section */}
                  <MDBRow className="mb-3">
                    <MDBCol sm="3">
                      <MDBCardText>Addresses</MDBCardText>
                    </MDBCol>
                    <MDBCol sm="9">
                      {!editing ? (
                        profileData.addresses.length > 0 ? (
                          profileData.addresses.map((address, index) => (
                            <div
                              key={index}
                              className="mb-3 p-2 border rounded"
                            >
                              <MDBCardText className="text-muted">
                                {address.isDefault && (
                                  <span className="badge bg-primary me-2">
                                    Default
                                  </span>
                                )}
                                {address.street}, {address.city},{" "}
                                {address.state}, {address.country} -{" "}
                                {address.postalCode}
                              </MDBCardText>
                            </div>
                          ))
                        ) : (
                          <MDBCardText className="text-muted">
                            No addresses added
                          </MDBCardText>
                        )
                      ) : (
                        // Editing mode - Address list
                        <>
                          {profileData.addresses.map((address, index) => (
                            <div
                              key={index}
                              className="mb-3 p-2 border rounded"
                            >
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <strong>{address.street}</strong>
                                <div>
                                  <MDBBtn
                                    color="info"
                                    className="me-2 btn-sm"
                                    onClick={() => handleEditAddress(index)}
                                  >
                                    Edit
                                  </MDBBtn>
                                  <MDBBtn
                                    color="danger"
                                    className="me-2 btn-sm"
                                    onClick={() => handleRemoveAddress(index)}
                                  >
                                    Remove
                                  </MDBBtn>
                                  {!address.isDefault && (
                                    <MDBBtn
                                      color="success"
                                      className="btn-sm"
                                      onClick={() =>
                                        handleSetDefaultAddress(index)
                                      }
                                    >
                                      Set as Default
                                    </MDBBtn>
                                  )}
                                </div>
                              </div>
                              <MDBCardText className="text-muted">
                                {address.city}, {address.state},{" "}
                                {address.country} - {address.postalCode}
                                {address.isDefault && (
                                  <span className="badge bg-primary ms-2">
                                    Default
                                  </span>
                                )}
                              </MDBCardText>
                            </div>
                          ))}

                          {/* Add new address form */}
                          <div className="mt-3 p-3 border rounded">
                            <h6>
                              {editingAddressIndex >= 0
                                ? "Edit Address"
                                : "Add New Address"}
                            </h6>
                            <MDBInput
                              type="text"
                              name="street"
                              value={newAddress.street}
                              onChange={handleNewAddressChange}
                              placeholder="Street"
                              className="mt-2"
                            />
                            <MDBInput
                              type="text"
                              name="city"
                              value={newAddress.city}
                              onChange={handleNewAddressChange}
                              placeholder="City"
                              className="mt-2"
                            />
                            <MDBInput
                              type="text"
                              name="state"
                              value={newAddress.state}
                              onChange={handleNewAddressChange}
                              placeholder="State"
                              className="mt-2"
                            />
                            <MDBInput
                              type="text"
                              name="country"
                              value={newAddress.country}
                              onChange={handleNewAddressChange}
                              placeholder="Country"
                              className="mt-2"
                            />
                            <MDBInput
                              type="text"
                              name="postalCode"
                              value={newAddress.postalCode}
                              onChange={handleNewAddressChange}
                              placeholder="Postal Code"
                              className="mt-2"
                            />
                            <div className="mt-3">
                              <MDBBtn
                                color="primary"
                                onClick={handleAddAddress}
                              >
                                {editingAddressIndex >= 0
                                  ? "Update Address"
                                  : "Add Address"}
                              </MDBBtn>
                              {editingAddressIndex >= 0 && (
                                <MDBBtn
                                  color="secondary"
                                  className="ms-2"
                                  onClick={() => {
                                    setEditingAddressIndex(-1);
                                    setNewAddress({
                                      street: "",
                                      city: "",
                                      state: "",
                                      country: "",
                                      postalCode: "",
                                      isDefault: false,
                                    });
                                  }}
                                >
                                  Cancel
                                </MDBBtn>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </MDBCol>
                  </MDBRow>
                  <hr />

                  {/* Save Button */}
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
