/* ForgotPassword.jsx */
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
import authInstanceAxios from "../../api/middlewares/interceptor"; // uses your interceptor
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState(""); // phone or email
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!identifier || identifier.trim().length < 3) {
      toast.warn("Please enter your phone number or email.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      // call your backend forgot-password endpoint.
      await authInstanceAxios.post("/api/auth/forgot-password", {
        identifier: identifier.trim(),
      });
      setSubmitted(true); // generic message (do not reveal existence)
      toast.success(
        "If an account exists we have sent reset instructions. Check your email or contact support."
      );
      // optionally navigate to some page after a delay:
      // setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      // still show generic message to avoid disclosing user existence
      toast.error("Could not process request. Try again later.");
    } finally {
      setIsSubmitting(false);
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
        aria-label="Forgot password section"
      >
        <MDBContainer>
          <MDBRow className="justify-content-center">
            <MDBCol md="8" lg="6">
              <MDBCard className="shadow-sm">
                <MDBCardBody className="p-4">
                  <h3 className="mb-2">Forgot your password?</h3>
                  <p className="text-muted mb-4">
                    Enter your phone number or email tied to your account. We
                    will send instructions to reset your password.
                  </p>

                  {submitted ? (
                    <div className="bg-white p-4 rounded border">
                      <h6 className="mb-2">Check your inbox</h6>
                      <p className="text-muted mb-2">
                        If an account exists for <strong>{identifier}</strong>,
                        reset instructions have been sent (check email). If you
                        don't receive anything, contact support.
                      </p>
                      <div className="d-flex gap-2 mt-3">
                        <MDBBtn
                          color="primary"
                          onClick={() => navigate("/login")}
                          style={{ minWidth: 120 }}
                        >
                          Back to Login
                        </MDBBtn>
                        <MDBBtn
                          color="secondary"
                          outline
                          onClick={() => {
                            setSubmitted(false);
                            setIdentifier("");
                          }}
                          style={{ minWidth: 120 }}
                        >
                          Send Again
                        </MDBBtn>
                      </div>
                    </div>
                  ) : (
                    <>
                      <MDBInput
                        label="Phone or Email"
                        id="identifier"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="mb-3"
                        required
                      />

                      <div className="d-flex justify-content-end gap-2 mt-3">
                        <MDBBtn
                          color="secondary"
                          outline
                          onClick={() => navigate("/login")}
                          style={{ minWidth: 100 }}
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
                              <MDBSpinner size="sm" tag="span" /> Sending...
                            </span>
                          ) : (
                            "Send Reset Link"
                          )}
                        </MDBBtn>
                      </div>
                    </>
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
