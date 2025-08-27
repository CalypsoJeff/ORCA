import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  fetchCompetitionDetails,
  registerCompetition,
} from "../../api/endpoints/competitions/user-competition";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";
import {
  MDBCard,
  MDBCardImage,
  MDBCardBody,
  MDBCardTitle,
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBBtn,
} from "mdb-react-ui-kit";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  User,
  DollarSign,
  Users,
  Info,
  X,
  Check,
  Mail,
  Phone,
} from "lucide-react";
import { selectUser } from "../../features/auth/authSlice";

const CompetitionDetail = () => {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const userId = useSelector(selectUser)?._id;
  //  Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    userId: userId || "",
    competitionId: id || "",
    agreeToTerms: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({});
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      userId: userId || "",
      competitionId: id || "",
    }));
  }, [id, userId]);

  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        userId: userId || "",
        competitionId: id || "",
        agreeToTerms: false,
      });
      setErrors({});
      setSuccess(false);
    }
  }, [isModalOpen, userId, id]);

  useEffect(() => {
    const getCompetitionDetails = async () => {
      try {
        const response = await fetchCompetitionDetails(id);
        setCompetition(response.data.competition);
      } catch (error) {
        console.error("Error fetching competition details:", error);
      } finally {
        setLoading(false);
      }
    };
    getCompetitionDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!competition) {
    return <div className="text-center mt-5">Competition not found.</div>;
  }

  // Convert time to 12-hour format
  const convertTo12Hour = (time) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const suffix = hours >= 12 ? "PM" : "AM";
    const formattedHours = (hours % 12 || 12).toString();
    return `${formattedHours}:${minutes} ${suffix}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    setSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        userId: userId,
        competitionId: id,
      };
      console.log("Submitting Registration:", submissionData);
      const response = await registerCompetition(submissionData);
      console.log("Server Response:", response.data);
      setSuccess(true);
      // Redirect to Payment Confirmation Page
      setTimeout(() => {
        navigate(`/competition/${id}/payment-confirmation`);
      }, 2000);
    } catch (error) {
      console.error("Error registering for competition:", error);
      setErrors({ submit: "Failed to register. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  // Close modal when clicking outside
  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting) {
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!competition) {
    return <div className="text-center mt-5">Competition not found.</div>;
  }

  // Format date properly
  const formattedDate = competition.date
    ? new Date(competition.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <>
      <NavBar />
      <MDBContainer className="py-5 mt-24">
        <PageBreadcrumbs />

        <MDBRow className="mt-4">
          {/* Competition Image */}
          <MDBCol lg="6">
            <MDBCard className="shadow-lg border-0 h-">
              <MDBCardImage
                src={competition.image[0]}
                alt={competition.name}
                position="top"
                className="w-100 rounded"
              />
            </MDBCard>
          </MDBCol>

          {/* Competition Details */}
          <MDBCol lg="6">
            <MDBCard className="shadow-lg p-4 border-0">
              <MDBCardBody>
                <MDBCardTitle className="text-primary text-center text-uppercase">
                  {competition.name}
                </MDBCardTitle>

                <div className="mt-3 space-y-3">
                  <p className="text-lg flex items-center">
                    <Tag className="mr-2 text-sky-500" />{" "}
                    <strong>Category:</strong>{" "}
                    <span className="ml-2">
                      {competition.category.join(", ") || "N/A"}
                    </span>
                  </p>
                  <p className="text-lg flex items-center">
                    <Calendar className="mr-2 text-green-500" />{" "}
                    <strong>Date:</strong>{" "}
                    <span className="ml-2">{formattedDate}</span>
                  </p>
                  <p className="text-lg flex items-center">
                    <Clock className="mr-2 text-orange-500" />{" "}
                    <strong>Time:</strong>{" "}
                    <span className="ml-2">
                      {convertTo12Hour(competition.time)}
                    </span>
                  </p>
                  <p className="text-lg flex items-center">
                    <MapPin className="mr-2 text-red-500" />{" "}
                    <strong>Location:</strong>{" "}
                    <span className="ml-2">
                      {competition.place}, {competition.state.join(", ")}
                    </span>
                  </p>
                  <p className="text-lg flex items-center">
                    <Info className="mr-2 text-gray-500" />{" "}
                    <strong>Type:</strong>{" "}
                    <span className="ml-2">
                      {competition.type.join(", ") || "N/A"}
                    </span>
                  </p>
                  <p className="text-lg flex items-center">
                    <DollarSign className="mr-2 text-yellow-500" />{" "}
                    <strong>Cost:</strong>{" "}
                    <span className="ml-2">₹{competition.cost || 0}</span>
                  </p>
                  <p className="text-lg flex items-center">
                    <Users className="mr-2 text-purple-500" />{" "}
                    <strong>Max Registrations:</strong>{" "}
                    <span className="ml-2">
                      {competition.maxRegistrations || "N/A"}
                    </span>
                  </p>
                  <p className="text-lg flex items-center">
                    <Info className="mr-2 text-blue-500" />{" "}
                    <strong>Status:</strong>{" "}
                    <span
                      className={`ml-2 ${
                        competition.status === "active"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {competition.status}
                    </span>
                  </p>
                  <p className="text-lg">
                    <strong>Description:</strong>{" "}
                    <span>
                      {competition.description || "No description available."}
                    </span>
                  </p>
                </div>

                <div className="d-flex justify-content-center mt-4 gap-3">
                  <Link to="/competitions">
                    <MDBBtn color="secondary">Back</MDBBtn>
                  </Link>
                  <MDBBtn color="primary" onClick={() => setIsModalOpen(true)}>
                    Register Now
                  </MDBBtn>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      {/* Registration Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Register for {competition.name}
              </h3>
              <button
                onClick={() => !submitting && setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={submitting}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <Check className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    Registration Successful!
                  </h3>
                  <p className="text-green-700 mb-4">
                    You have successfully registered for {competition.name}.
                  </p>
                  <p className="text-sm text-green-600">
                    This window will close automatically...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          errors.name ? "border-red-300" : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          errors.email ? "border-red-300" : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          errors.phone ? "border-red-300" : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Hidden Fields */}
                  <input type="hidden" name="userId" value={formData.userId} />
                  <input
                    type="hidden"
                    name="competitionId"
                    value={formData.competitionId}
                  />

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="agreeToTerms"
                        className="font-medium text-gray-700"
                      >
                        I agree to the terms and conditions
                      </label>
                      <p className="text-gray-500">
                        By registering, you agree to our{" "}
                        <a
                          href="/terms"
                          className="text-sky-600 hover:text-sky-800"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="/privacy"
                          className="text-sky-600 hover:text-sky-800"
                        >
                          Privacy Policy
                        </a>
                        .
                      </p>
                      {errors.agreeToTerms && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {errors.submit}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={submitting}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Register"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompetitionDetail;
