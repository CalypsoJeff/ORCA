import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  fetchCompetitionDetails,
  registerCompetition,
} from "../../api/endpoints/competitions/user-competition";
import NavBar from "../../components/user/NavBar";
import PageBreadcrumbs from "../../components/user/PageBreadcrumbs";

import { selectUser } from "../../features/auth/authSlice";

import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  Users,
  Info,
  X,
  Check,
  Mail,
  Phone,
  User as UserIcon,
  DollarSign,
} from "lucide-react";

const CompetitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = useSelector(selectUser)?._id;

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Hide sticky action bar when in-page actions are visible
  const actionsRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    userId: userId || "",
    competitionId: id || "",
    agreeToTerms: false,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      userId: userId || "",
      competitionId: id || "",
    }));
  }, [id, userId]);

  useEffect(() => {
    const getCompetitionDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchCompetitionDetails(id);
        setCompetition(response?.data?.competition || null);
      } catch (error) {
        console.error("Error fetching competition details:", error);
        setCompetition(null);
      } finally {
        setLoading(false);
      }
    };
    getCompetitionDetails();
  }, [id]);

  // Reset modal form when opened
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

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isModalOpen]);

  // ✅ IntersectionObserver: hide sticky bar when in-page actions are visible
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, competition]);

  const convertTo12Hour = (time) => {
    if (!time) return "N/A";
    const [h, m] = String(time).split(":");
    const hours = Number(h);
    const suffix = hours >= 12 ? "PM" : "AM";
    const formatted = (hours % 12 || 12).toString();
    return `${formatted}:${m} ${suffix}`;
  };

  const formattedDate = useMemo(() => {
    if (!competition?.date) return "TBA";
    const dt = new Date(competition.date);
    if (isNaN(dt.getTime())) return "TBA";
    return dt.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [competition]);

  const categoryLabel = useMemo(() => {
    const c = competition?.category;
    if (!c) return "N/A";
    if (Array.isArray(c)) return c.join(", ");
    return String(c);
  }, [competition]);

  const typeLabel = useMemo(() => {
    const t = competition?.type;
    if (!t) return "N/A";
    if (Array.isArray(t)) return t.join(", ");
    return String(t);
  }, [competition]);

  const locationLabel = useMemo(() => {
    const place = competition?.place || "N/A";
    const st = competition?.state;
    const stLabel = Array.isArray(st) ? st.join(", ") : st ? String(st) : "";
    return stLabel ? `${place}, ${stLabel}` : place;
  }, [competition]);

  const canRegister = useMemo(() => {
    if (!competition) return false;
    return String(competition.status || "").toLowerCase() === "active";
  }, [competition]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    const onlyDigits = formData.phone.replace(/[^0-9]/g, "");
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(onlyDigits))
      newErrors.phone = "Phone number must be 10 digits";

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        userId: userId,
        competitionId: id,
      };

      await registerCompetition(submissionData);

      setSuccess(true);
      setTimeout(() => {
        navigate(`/competition/${id}/payment-confirmation`);
      }, 1200);
    } catch (error) {
      console.error("Error registering for competition:", error);
      setErrors({ submit: "Failed to register. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget && !submitting) setIsModalOpen(false);
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <PageBreadcrumbs />
        <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center px-4">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 border-4 border-t-sky-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg text-gray-600">Loading competition...</p>
          </div>
        </div>
      </>
    );
  }

  if (!competition) {
    return (
      <>
        <NavBar />
        <PageBreadcrumbs />
        <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center px-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Competition not found
            </h2>
            <p className="text-gray-600 mb-4">
              The competition you’re looking for could not be loaded.
            </p>
            <Link
              to="/competitions"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 no-underline"
            >
              Back to Competitions
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <PageBreadcrumbs />

      {/* ✅ similar to ProductDetails */}
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 pt-28 pb-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:h-[calc(100vh-160px)]">
              {/* LEFT: sticky image column */}
              <div className="md:border-r border-gray-200">
                <div className="md:sticky md:top-28 p-6 space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 h-[320px] sm:h-[420px]">
                    <img
                      src={competition?.image?.[0] || "/placeholder.jpg"}
                      alt={competition?.name || "Competition"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Status pill */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          String(competition.status).toLowerCase() === "active"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {competition.status}
                      </span>
                    </div>
                  </div>

                  {/* Quick chips */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">
                        {formattedDate}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        {convertTo12Hour(competition.time)}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">
                        {locationLabel}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Cost
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mt-1">
                        ₹{Number(competition.cost || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Desktop actions */}
                  <div className="hidden md:flex gap-3 pt-2">
                    <Link
                      to="/competitions"
                      className="flex-1 text-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 no-underline"
                    >
                      Back
                    </Link>

                    <button
                      onClick={() => setIsModalOpen(true)}
                      disabled={!canRegister}
                      className="flex-1 px-4 py-2 rounded-md bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT: scroll column (desktop) */}
              <div
                className="p-6 md:overflow-y-auto md:h-full
                           md:[scrollbar-width:none] md:[-ms-overflow-style:none]
                           md:[&::-webkit-scrollbar]:hidden"
              >
                {/* Title */}
                <div className="mb-5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {competition.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="inline-flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {categoryLabel}
                    </span>
                  </p>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Type
                    </div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {typeLabel}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-white">
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Max registrations
                    </div>
                    <div className="mt-1 font-semibold text-gray-900">
                      {competition.maxRegistrations || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
                  <h2 className="font-semibold text-lg mb-2">Description</h2>
                  <p className="text-gray-700 leading-relaxed mb-0">
                    {competition.description || "No description available."}
                  </p>
                </div>

                {/* Registration / payment info (optional UX section) */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white mb-6">
                  <h2 className="font-semibold text-lg mb-2">
                    Registration details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600">Status</span>
                      <span className="font-semibold text-gray-900">
                        {competition.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600">Cost</span>
                      <span className="font-semibold text-gray-900">
                        ₹{Number(competition.cost || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ✅ In-page actions (observer target) */}
                <div
                  ref={actionsRef}
                  className="mt-auto pt-4 border-t border-gray-200"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/competitions"
                      className="flex-1 text-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 no-underline"
                    >
                      Back to Competitions
                    </Link>

                    <button
                      onClick={() => setIsModalOpen(true)}
                      disabled={!canRegister}
                      className="flex-1 px-4 py-2 rounded-md bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                    >
                      Register Now
                    </button>
                  </div>
                </div>

                {/* spacing for mobile sticky bar */}
                <div className="h-20 md:hidden" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ STICKY ACTION BAR (mobile only) */}
        {showStickyBar && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
            <div className="container mx-auto px-4 sm:px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 truncate">
                    {competition.name}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{Number(competition.cost || 0).toLocaleString("en-IN")} •{" "}
                    {convertTo12Hour(competition.time)}
                  </div>
                </div>

                <Link
                  to="/competitions"
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 no-underline"
                >
                  Back
                </Link>

                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={!canRegister}
                  className="px-4 py-2 rounded-md bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Register for {competition.name}
              </h3>
              <button
                onClick={() => !submitting && setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={submitting}
                type="button"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <Check className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-green-800 mb-2">
                    Registration Successful!
                  </h3>
                  <p className="text-green-700 mb-1">
                    You have successfully registered for {competition.name}.
                  </p>
                  <p className="text-sm text-green-600">
                    Redirecting to payment...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
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

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
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
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
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
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <input type="hidden" name="userId" value={formData.userId} />
                  <input
                    type="hidden"
                    name="competitionId"
                    value={formData.competitionId}
                  />

                  {/* Terms */}
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
                      <p className="text-gray-500 mb-0">
                        By registering, you agree to our{" "}
                        <a href="/terms" className="text-sky-600 hover:text-sky-800">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-sky-600 hover:text-sky-800">
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

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {errors.submit}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={submitting}
                      className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="py-2 px-4 rounded-md text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
                    >
                      {submitting ? "Processing..." : "Register"}
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
