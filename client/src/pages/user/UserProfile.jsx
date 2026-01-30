/* ========================= UserProfile.jsx ========================= */
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

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
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
  };

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />

      {/* ✅ push content below fixed NavBar + PageBreadcrumbs
          ✅ extra bottom padding on mobile for fixed bottom account bar */}
      <section className="bg-[#eee] pt-36 sm:pt-40 pb-24 lg:pb-6">
        <MDBContainer>
          <MDBRow className="g-4">
            {/* ✅ Profile content first on mobile */}
            <MDBCol lg="9" className="order-1 order-lg-2">
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

            {/* ✅ Sidebar second on mobile (fixed bottom bar + drawer), first on desktop */}
            <MDBCol lg="3" className="order-2 order-lg-1">
              {/* ✅ collapsed by default => drawer closed on mobile */}
              <UserSidebar collapsed />
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </>
  );
};

export default UserProfile;
