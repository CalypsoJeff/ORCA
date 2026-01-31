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

  // Mobile sticky (already present)
  const actionsRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(true);

  // ✅ Desktop sticky (new)
  const desktopActionsRef = useRef(null);
  const [showDesktopSticky, setShowDesktopSticky] = useState(false);

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
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isModalOpen]);

  // Mobile sticky observer
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

  // ✅ Desktop sticky observer
  useEffect(() => {
    const el = desktopActionsRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => setShowDesktopSticky(!entry.isIntersecting),
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
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mb-4" />
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
              The competition you're looking for could not be loaded.
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

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Mobile Layout */}
            <div className="lg:hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
                {/* Image */}
                <div className="relative h-64 bg-gray-100 mt-10">
                  <img
                    src={competition?.image?.[0] || "/placeholder.jpg"}
                    alt={competition?.name || "Competition"}
                    className="w-full h-full object-cover"
                  />
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

                {/* Content */}
                <div className="p-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {competition.name}
                  </h1>
                  <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {categoryLabel}
                  </p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        Date
                      </div>
                      <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {formattedDate}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" />
                        Time
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {convertTo12Hour(competition.time)}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" />
                        Location
                      </div>
                      <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {locationLabel}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <DollarSign className="w-3 h-3" />
                        Cost
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{Number(competition.cost || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Info className="w-3 h-3" />
                        Type
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {typeLabel}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <Users className="w-3 h-3" />
                        Max Slots
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {competition.maxRegistrations || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h2 className="font-semibold text-base mb-2">Description</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {competition.description || "No description available."}
                    </p>
                  </div>

                  {/* Mobile Actions */}
                  <div
                    ref={actionsRef}
                    className="mt-4 pt-4 border-t border-gray-200 flex gap-3"
                  >
                    <Link
                      to="/competitions"
                      className="flex-1 text-center px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 no-underline transition-colors"
                    >
                      Back
                    </Link>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      disabled={!canRegister}
                      className="flex-1 px-4 py-3 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      type="button"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid grid-cols-5 gap-6">
              {/* Left Column - Image & Quick Info */}
              <div className="col-span-2">
                <div className="sticky top-28 space-y-4 pt-8">
                  {/* Image */}
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 h-80 shadow-sm border border-gray-200">
                    <img
                      src={competition?.image?.[0] || "/placeholder.jpg"}
                      alt={competition?.name || "Competition"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${
                          String(competition.status).toLowerCase() === "active"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {competition.status}
                      </span>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
                    <div className="pb-3 border-b border-gray-200">
                      <div className="text-xs text-gray-500 flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        Event Date
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formattedDate}
                      </div>
                    </div>

                    <div className="pb-3 border-b border-gray-200">
                      <div className="text-xs text-gray-500 flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4" />
                        Time
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {convertTo12Hour(competition.time)}
                      </div>
                    </div>

                    <div className="pb-3 border-b border-gray-200">
                      <div className="text-xs text-gray-500 flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4" />
                        Location
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {locationLabel}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4" />
                        Registration Fee
                      </div>
                      <div className="text-lg font-bold text-sky-600">
                        ₹{Number(competition.cost || 0).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Actions (this is the section we observe) */}
                  <div
                    ref={desktopActionsRef}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3"
                  >
                    <button
                      onClick={() => setIsModalOpen(true)}
                      disabled={!canRegister}
                      className="w-full px-4 py-3 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      type="button"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="col-span-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {competition.name}
                    </h1>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {categoryLabel}
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <div className="text-xs text-blue-600 flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4" />
                        Competition Type
                      </div>
                      <div className="font-semibold text-gray-900">
                        {typeLabel}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                      <div className="text-xs text-purple-600 flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        Max Registrations
                      </div>
                      <div className="font-semibold text-gray-900">
                        {competition.maxRegistrations || "Unlimited"}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h2 className="font-semibold text-xl mb-3 text-gray-900">
                      About This Competition
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {competition.description || "No description available."}
                    </p>
                  </div>

                  {/* Registration Details */}
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
                    <h2 className="font-semibold text-xl mb-4 text-gray-900">
                      Registration Details
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <div className="font-semibold text-gray-900">
                          {competition.status}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Entry Fee</div>
                        <div className="font-semibold text-sky-600">
                          ₹{Number(competition.cost || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* (Optional) extra spacing at bottom so sticky doesn't cover content if you add more sections */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bar */}
        {showStickyBar && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 truncate">
                    {competition.name}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{Number(competition.cost || 0).toLocaleString("en-IN")}
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={!canRegister}
                  className="px-6 py-2.5 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  type="button"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Desktop Sticky Register (appears when desktop actions scroll out of view) */}
        {showDesktopSticky && (
          <div className="hidden lg:block fixed right-6 bottom-6 z-50">
            <div className="w-[340px] bg-white border border-gray-200 shadow-lg rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 truncate">
                    {competition.name}
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    ₹{Number(competition.cost || 0).toLocaleString("en-IN")}
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={!canRegister}
                  className="px-5 py-2.5 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  type="button"
                >
                  Register
                </button>
              </div>

              {!canRegister && (
                <div className="mt-2 text-xs text-red-600">
                  Registration is currently closed.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
          onClick={handleModalBackdropClick}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Register for Competition
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {competition.name}
                </p>
              </div>
              <button
                onClick={() => !submitting && setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={submitting}
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Check className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Registration Successful!
                  </h3>
                  <p className="text-green-700 mb-1">
                    You have successfully registered for {competition.name}.
                  </p>
                  <p className="text-sm text-green-600">
                    Redirecting to payment confirmation...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
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
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.name
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-sky-500 focus:border-sky-500"
                        } rounded-lg shadow-sm`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
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
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.email
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-sky-500 focus:border-sky-500"
                        } rounded-lg shadow-sm`}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
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
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.phone
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-sky-500 focus:border-sky-500"
                        } rounded-lg shadow-sm`}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1.5 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start">
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="agreeToTerms"
                          name="agreeToTerms"
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={handleChange}
                          className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                        />
                      </div>
                      <div className="ml-3">
                        <label
                          htmlFor="agreeToTerms"
                          className="text-sm font-medium text-gray-700"
                        >
                          I agree to the terms and conditions{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          By registering, you agree to our{" "}
                          <a
                            href="/terms"
                            className="text-sky-600 hover:text-sky-800 underline"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy"
                            className="text-sky-600 hover:text-sky-800 underline"
                          >
                            Privacy Policy
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {errors.submit}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={submitting}
                      className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
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
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Complete Registration"
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
