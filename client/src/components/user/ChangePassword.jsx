/* ChangePassword.jsx */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { toast, ToastContainer } from "react-toastify";
import authInstanceAxios from "../../api/middlewares/interceptor";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import "react-toastify/dist/ReactToastify.css";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!currentPassword) {
      toast.warn("Enter current password.");
      return false;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.warn("New password must be at least 6 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.warn("New password and confirmation do not match.");
      return false;
    }
    if (newPassword === currentPassword) {
      toast.warn("New password must be different from current password.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // Requires authenticated request (authInstanceAxios should include token)
      await authInstanceAxios.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully.");
      // optional: redirect to profile or logout user
      setTimeout(() => navigate("/account/profile"), 1000);
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        "Unable to change password. Please check your current password.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />
      <ToastContainer position="top-right" autoClose={2500} />

      <section
        style={{ marginTop: 100 }}
        className="min-h-[60vh] bg-gray-50 py-8"
      >
        <MDBContainer>
          <MDBRow className="justify-content-center">
            <MDBCol md="8" lg="6">
              <MDBCard className="shadow-sm">
                <MDBCardBody className="p-4">
                  <h4 className="mb-3">Change Password</h4>
                  <p className="text-muted mb-4">
                    For your security, choose a strong password. Your current
                    password is required.
                  </p>

                  <MDBInput
                    label="Current password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mb-3"
                    required
                  />

                  <MDBInput
                    label="New password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mb-3"
                    required
                  />

                  <MDBInput
                    label="Confirm new password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mb-3"
                    required
                  />

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <MDBBtn
                      color="secondary"
                      outline
                      onClick={() => navigate("/account/profile")}
                      style={{ minWidth: 110 }}
                    >
                      Cancel
                    </MDBBtn>

                    <MDBBtn
                      color="primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      style={{ minWidth: 140 }}
                    >
                      {isSubmitting ? (
                        <span className="d-flex align-items-center gap-2">
                          <MDBSpinner size="sm" tag="span" /> Updating...
                        </span>
                      ) : (
                        "Change Password"
                      )}
                    </MDBBtn>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>
    </>
  );
}
