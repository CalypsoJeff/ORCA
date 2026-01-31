/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { loginAsync } from "../../features/auth/authSlice";
import api from "../../api/middlewares/interceptor";
import { signInWithGoogle } from "../../firebase/firebase";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await dispatch(loginAsync(data));
      if (response.meta.requestStatus === "fulfilled") {
        toast.success("Login successful!");
        navigate("/home");
      } else {
        toast.error(response.payload || "Login failed");
      }
    } catch (err) {
      toast.error("An error occurred during login");
    }
  };

  async function handleGoogleAuth() {
    try {
      setGoogleLoading(true);
      const { idToken } = await signInWithGoogle();
      const { data } = await api.post("/api/user/google", { idToken });
      // { user, token, refreshToken } (or cookies if your API sets them)
      toast.success("Signed in with Google");
      navigate("/home");
    } catch (e) {
      toast.error(e?.response?.data?.error || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel - Login Form */}
      <div className="w-full md:w-1/2 p-4 sm:p-6 lg:p-8 flex justify-center items-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
            <p className="mt-2 text-sm text-gray-500">Please enter your details to sign in</p>
          </div>

          <div className="mt-8 space-y-6">
            <Button
              onClick={handleGoogleAuth}            
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-5 font-medium"
              disabled={googleLoading}
            >
              <FcGoogle size={20} />
              <span>{googleLoading ? "Connecting…" : "Continue with Google"}</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="Enter your phone number"
                  className={`w-full ${errors.phone ? "border-red-500" : ""}`}
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: { value: /^[0-9\b]+$/, message: "Invalid phone number format" },
                  })}
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium text-sky-600 hover:text-sky-500">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pr-10 ${errors.password ? "border-red-500" : ""}`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
              </div>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

              <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white py-5" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="mt-8 text-sm text-center text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-medium text-sky-600 hover:text-sky-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        <div className="h-full flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-6">Explore the World on Two Wheels</h2>
            <p className="text-lg mb-8">
              Join the ORCA community and be part of an exciting adventure with fellow riders.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-1 w-1 rounded-full bg-sky-400" />
                <p>Access exclusive events and competitions</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-1 w-1 rounded-full bg-sky-400" />
                <p>Connect with riders from around the world</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-1 w-1 rounded-full bg-sky-400" />
                <p>Discover new routes and challenges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
