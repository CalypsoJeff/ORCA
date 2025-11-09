/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "../../api/endpoints/auth/user-auth";
import api from "../../api/middlewares/interceptor";
import { signInWithGoogle } from "../../firebase/firebase";
import { setAuthData } from "../../features/auth/authSlice";
import Cookies from "js-cookie";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await registerUser(data);
      toast.success("Registration successful! Please verify your OTP.");
      navigate("/otp", { state: { phone: data.phone } });
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
async function handleGoogleAuth() {
  try {
    const { idToken } = await signInWithGoogle();
    const { data } = await api.post("/api/user/google", { idToken });
    // { user, token, refreshToken }

    // Save to cookies
    Cookies.set("token", data.token);
    Cookies.set("refreshToken", data.refreshToken);

    // ✅ Dispatch to Redux
    dispatch(setAuthData(data));

    toast.success("Signed in with Google");
    navigate("/home");
  } catch (e) {
    toast.error(e?.response?.data?.error || "Google login failed");
  }
}

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel - Registration Form */}
      <div className="w-full md:w-1/2 p-4 sm:p-6 lg:p-8 flex justify-center items-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Join our fitness community today
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <Button
              onClick={handleGoogleAuth}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-5 font-medium"
            >
              <FcGoogle size={20} />
              <span>Sign up with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  or sign up with
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/,
                      message: "Invalid email format",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Must be 10 digits",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === getValues("password") ||
                      "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-5"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </div>

          <p className="mt-8 text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-sky-600 hover:text-sky-500"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Background Image */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        <div className="h-full flex flex-col justify-center items-center p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">
            Join the Fitness Revolution
          </h2>
          <p className="text-lg mb-8">
            Track workouts, connect with trainers, and achieve your goals.
          </p>
        </div>
      </div>
    </div>
  );
}
